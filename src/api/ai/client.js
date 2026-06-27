const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000';

function getWsBaseUrl() {
  const url = new URL(AI_SERVICE_URL);
  return url.protocol === 'https:' ? `wss://${url.host}` : `ws://${url.host}`;
}

export const AI_BASE_URL = AI_SERVICE_URL;
export const AI_WS_URL = getWsBaseUrl();

export async function startInterview({ mockId, candidateId, cvUrl, mockData }) {
  const res = await fetch(`${AI_BASE_URL}/api/interview/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mockId, candidateId, cvUrl: cvUrl || '', mockData }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Start interview failed: ${res.status}`);
  }
  return res.json();
}

export async function endInterview(sessionId) {
  const res = await fetch(`${AI_BASE_URL}/api/interview/end/${sessionId}`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `End interview failed: ${res.status}`);
  }
  return res.json();
}

export function createInterviewWS({ sessionId, sessionToken, onIntro, onQuestion, onAcknowledgement, onCheatWarning, onAnalysisUpdate, onSessionEnd, onError, onClose }) {
  const wsUrl = `${AI_WS_URL}/api/interview/session/${sessionId}?token=${sessionToken}`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('[Interview WS] Connected');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case 'intro':
        onIntro?.(data);
        break;
      case 'question':
        onQuestion?.(data);
        break;
      case 'acknowledgement':
        onAcknowledgement?.(data);
        break;
      case 'cheat_warning':
        onCheatWarning?.(data);
        break;
      case 'analysis_update':
        onAnalysisUpdate?.(data);
        break;
      case 'session_end':
        onSessionEnd?.(data);
        break;
      case 'error':
        console.error('[Interview WS] Error:', data.code, data.message);
        onError?.(data);
        break;
      default:
        console.warn('[Interview WS] Unknown message type:', data.type);
    }
  };

  ws.onclose = () => {
    console.log('[Interview WS] Closed');
    onClose?.();
  };

  ws.onerror = (err) => {
    console.error('[Interview WS] Error:', err);
    onError?.({ code: 'WS_ERROR', message: 'WebSocket connection error' });
  };

  return ws;
}

export function sendAnswer(ws, { sessionId, questionId, transcript, durationSeconds, startedAt, endedAt }) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'answer',
      sessionId,
      questionId,
      transcript,
      durationSeconds,
      startedAt,
      endedAt,
    }));
  }
}

export function sendVideoFrame(ws, { sessionId, image, frameNumber, timestamp }) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'video_frame',
      sessionId,
      image: image || '',
      frameNumber: frameNumber || 0,
      timestamp: timestamp || Math.floor(Date.now() / 1000),
    }));
  }
}

export function sendTabSwitch(ws, { sessionId, totalCount }) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'tab_switch', sessionId, totalCount }));
  }
}

export function sendEndSession(ws, { sessionId }) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'end_session', sessionId }));
  }
}

export function closeInterviewWS(ws) {
  if (ws) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  }
}

export function createSTTConnection({ onPartial, onFinal, onSessionBegins, onError, onClose }) {
  const wsUrl = `${AI_WS_URL}/api/stt/realtime`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('[STT] WebSocket connected');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case 'session_begins':
        console.log('[STT] Session began:', data.session_id);
        onSessionBegins?.(data.session_id);
        break;
      case 'partial':
        onPartial?.(data.text);
        break;
      case 'final':
        onFinal?.(data.text);
        break;
      case 'error':
        console.error('[STT] Error:', data.message);
        onError?.(data.message);
        break;
    }
  };

  ws.onclose = () => {
    console.log('[STT] WebSocket closed');
    onClose?.();
  };

  ws.onerror = (err) => {
    console.error('[STT] WebSocket error:', err);
    onError?.('WebSocket connection error');
  };

  return ws;
}

export function sendAudioToSTT(ws, audioBase64) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ audio: audioBase64 }));
  }
}

export function closeSTTConnection(ws) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'end_stream' }));
    setTimeout(() => ws.close(), 500);
  } else if (ws) {
    ws.close();
  }
}

export function startMicCapture(onAudioChunk, sampleRate = 16000) {
  let audioContext = null;
  let mediaStream = null;
  let scriptProcessor = null;
  let isRecording = false;

  async function start() {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate });
    const source = audioContext.createMediaStreamSource(mediaStream);
    scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

    scriptProcessor.onaudioprocess = (e) => {
      if (!isRecording) return;
      const float32 = e.inputBuffer.getChannelData(0);
      const int16 = new Int16Array(float32.length);
      for (let i = 0; i < float32.length; i++) {
        const s = Math.max(-1, Math.min(1, float32[i]));
        int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
      }
      const bytes = new Uint8Array(int16.buffer);
      let binary = '';
      for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      onAudioChunk(btoa(binary));
    };

    source.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);
    isRecording = true;

    return { mediaStream, audioContext, scriptProcessor };
  }

  function stop() {
    isRecording = false;
    scriptProcessor?.disconnect();
    audioContext?.close();
    mediaStream?.getTracks().forEach((t) => t.stop());
    audioContext = null;
    mediaStream = null;
    scriptProcessor = null;
  }

  function pause() {
    isRecording = false;
  }

  function resume() {
    isRecording = true;
  }

  return { start, stop, pause, resume, get isRecording() { return isRecording; } };
}