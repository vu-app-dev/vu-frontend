import { memo, useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Send,
  Clock,
  Bot,
  User,
  CheckCircle2,
  Video,
  Mic,
  Monitor,
  Code2,
  Pin,
  AlertTriangle,
  Eye,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Toggle } from '../../../../components/ui/Toggle';
import {
  startInterview,
  endInterview,
  createInterviewWS,
  sendAnswer,
  sendEndSession,
  closeInterviewWS,
  createSTTConnection,
  sendAudioToSTT,
  closeSTTConnection,
  startMicCapture,
} from '../../../../api/ai/client';
import { getApplicationMock } from '../../../../api';
import './MockInterview.css';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ── TTS queue (simple, reliable) ── */
let _ttsQueue = [];
let _ttsBusy = false;

function stopTTS() {
  _ttsQueue = [];
  _ttsBusy = false;
  if (window.speechSynthesis) window.speechSynthesis.cancel();
  document.querySelectorAll('audio[data-tts]').forEach((a) => { a.pause(); a.src = ''; a.remove(); });
}

function speak(text, audioBase64) {
  if (!text) return;
  _ttsQueue.push({ text, audioBase64 });
  console.log('[TTS] Queued:', text.slice(0, 40), '| queue:', _ttsQueue.length, '| busy:', _ttsBusy);
  if (!_ttsBusy) _playNextTTS();
}

function _playNextTTS() {
  if (_ttsQueue.length === 0) {
    _ttsBusy = false;
    console.log('[TTS] Queue empty, idle');
    return;
  }
  _ttsBusy = true;
  const { text, audioBase64 } = _ttsQueue.shift();
  console.log('[TTS] Playing:', text.slice(0, 40), '| hasAudio:', !!audioBase64);

  if (audioBase64) {
    const audio = new Audio(`data:audio/mp3;base64,${audioBase64}`);
    audio.setAttribute('data-tts', '1');
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      console.log('[TTS] Finished:', text.slice(0, 40));
      audio.remove();
      _playNextTTS();
    };
    audio.onended = finish;
    audio.onerror = () => {
      console.warn('[TTS] Audio error, falling back:', text.slice(0, 40));
      if (done) return;
      done = true;
      audio.remove();
      _speakBrowser(text);
    };
    audio.play().catch(() => {
      console.warn('[TTS] Play blocked, falling back:', text.slice(0, 40));
      if (done) return;
      done = true;
      audio.remove();
      _speakBrowser(text);
    });
  } else {
    _speakBrowser(text);
  }
}

function _speakBrowser(text) {
  if (!window.speechSynthesis) {
    console.warn('[TTS] No speechSynthesis, skipping');
    _playNextTTS();
    return;
  }
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.0;
  u.lang = 'en-US';
  let done = false;
  u.onend = () => {
    if (done) return;
    done = true;
    console.log('[TTS] Browser TTS finished:', text.slice(0, 40));
    _playNextTTS();
  };
  u.onerror = () => {
    if (done) return;
    done = true;
    console.warn('[TTS] Browser TTS error:', text.slice(0, 40));
    _playNextTTS();
  };
  window.speechSynthesis.speak(u);
}

const PANEL = { camera: 'camera', code: 'code', screen: 'screen' };

const MOCK_REQUIREMENTS = {
  Technical: { camera: true, mic: true, code: true, screen: true },
  Behavioral: { camera: true, mic: true, code: false, screen: false },
  Coding: { camera: true, mic: true, code: true, screen: true },
  Design: { camera: true, mic: true, code: false, screen: true },
  Analytical: { camera: true, mic: true, code: true, screen: false },
};

export const MockInterview = memo(function MockInterview({ mockId, onComplete }) {
  const mock = getApplicationMock(mockId);
  const totalSeconds = (mock?.durationMin || 30) * 60;
  const required = MOCK_REQUIREMENTS['Technical'];

  /* Session state */
  const [sessionId, setSessionId] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState(null);
  const [readyToInterview, setReadyToInterview] = useState(false);
  const introDataRef = useRef(null);

  /* Chat state */
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [isTyping, setIsTyping] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* WS refs */
  const interviewWsRef = useRef(null);
  const sttWsRef = useRef(null);
  const micCaptureRef = useRef(null);
  const answerStartedAtRef = useRef(null);

  /* STT state */
  const [sttConnected, setSttConnected] = useState(false);
  const [sttRecording, setSttRecording] = useState(false);
  const [sttPartial, setSttPartial] = useState('');

  /* Silence countdown state */
  const SILENCE_TIMEOUT_MS = 5000;
  const transcriptRef = useRef('');
  const silenceTimerRef = useRef(null);
  const [silenceCountdown, setSilenceCountdown] = useState(null);
  const silenceStartRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  /* Panel state */
  const [showCamera, setShowCamera] = useState(true);
  const [showCode, setShowCode] = useState(required.code !== false);
  const [showScreen, setShowScreen] = useState(false);
  const [pinnedPanel, setPinnedPanel] = useState(
    required.code !== false ? PANEL.code : PANEL.camera
  );

  const [codeValue, setCodeValue] = useState(
    '// Write your solution here\n\nfunction solve(input) {\n  \n}\n'
  );

  /* Tab-switch detection */
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [tabWarning, setTabWarning] = useState(false);

  /* Stream refs */
  const camStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const camVideoRef = useRef(null);
  const screenVideoRef = useRef(null);

  const timeBannerTimerRef = useRef(null);
  const tabWarningTimerRef = useRef(null);
  const timeWarningShownRef = useRef(false);
  const [showTimeBanner, setShowTimeBanner] = useState(false);

  /* ── Start interview session ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await startInterview({
          mockId,
          candidateId: 'candidate-1',
          mockData: mock ? {
            type: mock.type || 'TECHNICAL',
            difficulty: mock.difficulty || 'MEDIUM',
            technologies: mock.technologies || [],
            topics: mock.topics || [],
            estimatedTimeInMinutes: mock.durationMin || 30,
            questions: (mock.questions || []).map(q => typeof q === 'string' ? { title: q } : q),
            title: mock.name || mock.title || '',
            description: mock.description || '',
          } : undefined,
        });
        if (cancelled) return;
        setSessionId(data.sessionId);
        setSessionToken(data.sessionToken);

        const initialMessages = [];
        if (data.intro) {
          initialMessages.push({ id: Date.now(), role: 'ai', message: data.intro, timestamp: formatTime(0) });
        }
        if (data.firstQuestion) {
          setCurrentQuestionId(data.firstQuestion.id);
          setQuestionIndex(1);
          initialMessages.push({
            id: Date.now() + 1,
            role: 'ai',
            message: data.firstQuestion.text,
            timestamp: formatTime(0),
          });
        }
        setMessages(initialMessages);
        answerStartedAtRef.current = new Date().toISOString();
        setSessionLoading(false);

        // Store intro/question data for playback after user clicks "Start"
        introDataRef.current = { intro: data.intro, introAudio: data.introAudio, firstQuestion: data.firstQuestion, firstQuestionAudio: data.firstQuestionAudio };
      } catch (err) {
        if (!cancelled) {
          setSessionError(err.message);
          setSessionLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [mockId]);

  /* ── Start interview (user click unlocks audio) ── */
  const handleStartInterview = useCallback(() => {
    const d = introDataRef.current;
    if (d) {
      if (d.intro) speak(d.intro, d.introAudio);
      if (d.firstQuestion) speak(d.firstQuestion.text, d.firstQuestionAudio);
    }
    setReadyToInterview(true);
  }, []);

  /* ── Connect interview WS + STT WS when session is ready ── */
  useEffect(() => {
    if (!sessionId || !sessionToken || !readyToInterview || isFinished) return;

    const interviewWs = createInterviewWS({
      sessionId,
      sessionToken,
      onIntro: (data) => {
        addMessage('ai', data.text);
        speak(data.text, data.audioBase64);
      },
      onQuestion: (data) => {
        cancelSilenceCountdown();
        transcriptRef.current = '';
        setCurrentQuestionId(data.id);
        setQuestionIndex((prev) => prev + 1);
        answerStartedAtRef.current = new Date().toISOString();
        addMessage('ai', data.text);
        speak(data.text, data.audioBase64);
        setIsTyping(false);
      },
      onAcknowledgement: (data) => {
        addMessage('ai', data.text);
        speak(data.text, data.audioBase64);
        setIsTyping(false);
      },
      onSessionEnd: (data) => {
        stopTTS();
        cancelSilenceCountdown();
        transcriptRef.current = '';
        setIsFinished(true);
        if (data?.performance?.score != null) {
          addMessage('ai', `Assessment complete. Overall score: ${data.performance.score}/100. Cheat status: ${data.cheat}.`);
        } else {
          addMessage('ai', 'Assessment complete. Thank you for your time.');
        }
      },
      onError: (data) => {
        console.error('[Interview]', data.message);
      },
      onClose: () => {},
    });
    interviewWsRef.current = interviewWs;

    const sttWs = createSTTConnection({
      onSessionBegins: () => setSttConnected(true),
      onPartial: (text) => {
        setSttPartial(text);
        if (text.trim()) {
          stopTTS();
          cancelSilenceCountdown();
        }
      },
      onFinal: (text) => {
        setSttPartial('');
        if (!text.trim()) return;
        if (isTypingRef.current) return;
        transcriptRef.current += (transcriptRef.current ? ' ' : '') + text.trim();
        restartSilenceCountdown();
      },
      onError: (msg) => console.error('[STT]', msg),
      onClose: () => {
        setSttConnected(false);
        setSttRecording(false);
      },
    });
    sttWsRef.current = sttWs;

    return () => {
      closeInterviewWS(interviewWs);
      closeSTTConnection(sttWs);
      interviewWsRef.current = null;
      sttWsRef.current = null;
    };
  }, [sessionId, sessionToken, isFinished]);

  /* ── addMessage helper ── */
  const addMessage = useCallback((role, text) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role, message: text, timestamp: formatTime(totalSeconds - timeLeftRef.current) }]);
  }, []);

  const timeLeftRef = useRef(timeLeft);
  useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);
  const isTypingRef = useRef(isTyping);
  useEffect(() => { isTypingRef.current = isTyping; }, [isTyping]);

  /* ── Send answer to interview WS ── */
  const sessionIdRef = useRef(sessionId);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  const currentQuestionIdRef = useRef(currentQuestionId);
  useEffect(() => { currentQuestionIdRef.current = currentQuestionId; }, [currentQuestionId]);

  const sendAnswerToInterview = useCallback((transcript) => {
    if (!interviewWsRef.current || interviewWsRef.current.readyState !== WebSocket.OPEN) return;
    const sid = sessionIdRef.current;
    const qid = currentQuestionIdRef.current;
    const startedAt = answerStartedAtRef.current || new Date().toISOString();
    const endedAt = new Date().toISOString();
    const durationSeconds = Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);

    sendAnswer(interviewWsRef.current, {
      sessionId: sid,
      questionId: qid || 'q1',
      transcript,
      durationSeconds: durationSeconds || 30,
      startedAt,
      endedAt,
    });
    answerStartedAtRef.current = new Date().toISOString();
    setIsTyping(true);
  }, []);

  /* ── Silence countdown helpers ── */
  const cancelSilenceCountdown = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setSilenceCountdown(null);
    silenceStartRef.current = null;
  }, []);

  const submitAccumulatedTranscript = useCallback(() => {
    cancelSilenceCountdown();
    const transcript = transcriptRef.current.trim();
    if (!transcript || isTypingRef.current) {
      transcriptRef.current = '';
      return;
    }
    transcriptRef.current = '';
    addMessage('candidate', transcript);
    sendAnswerToInterview(transcript);
  }, [addMessage, sendAnswerToInterview]);

  const restartSilenceCountdown = useCallback(() => {
    cancelSilenceCountdown();
    silenceStartRef.current = Date.now();
    setSilenceCountdown(Math.ceil(SILENCE_TIMEOUT_MS / 1000));
    countdownIntervalRef.current = setInterval(() => {
      if (!silenceStartRef.current) return;
      const elapsed = Date.now() - silenceStartRef.current;
      const remaining = Math.ceil((SILENCE_TIMEOUT_MS - elapsed) / 1000);
      if (remaining <= 0) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        setSilenceCountdown(null);
        return;
      }
      setSilenceCountdown(remaining);
    }, 500);
    silenceTimerRef.current = setTimeout(() => {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
      silenceStartRef.current = null;
      setSilenceCountdown(null);
      submitAccumulatedTranscript();
    }, SILENCE_TIMEOUT_MS);
  }, [cancelSilenceCountdown, submitAccumulatedTranscript]);

  /* ── Mic toggle ── */
  const handleMicToggle = useCallback(() => {
    if (sttRecording) {
      micCaptureRef.current?.pause();
      setSttRecording(false);
    } else {
      if (!micCaptureRef.current) {
        stopTTS();
        micCaptureRef.current = startMicCapture((base64) => {
          sendAudioToSTT(sttWsRef.current, base64);
        });
        micCaptureRef.current.start().then(() => setSttRecording(true));
      } else {
        micCaptureRef.current.resume();
        setSttRecording(true);
      }
    }
  }, [sttRecording]);

  /* ── Timer countdown ── */
  useEffect(() => {
    if (isFinished || sessionLoading) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished, sessionLoading]);

  /* ── 5-minute warning ── */
  useEffect(() => {
    if (timeLeft <= 300 && timeLeft > 0 && !timeWarningShownRef.current && !isFinished) {
      timeWarningShownRef.current = true;
      if (timeBannerTimerRef.current) window.clearTimeout(timeBannerTimerRef.current);
      timeBannerTimerRef.current = window.setTimeout(() => {
        setShowTimeBanner(true);
        timeBannerTimerRef.current = window.setTimeout(() => {
          setShowTimeBanner(false);
          timeBannerTimerRef.current = null;
        }, 6000);
      }, 0);
    }
  }, [timeLeft, isFinished]);

  /* ── Tab switch detector ── */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount((c) => c + 1);
        setTabWarning(true);
        if (tabWarningTimerRef.current) window.clearTimeout(tabWarningTimerRef.current);
        tabWarningTimerRef.current = window.setTimeout(() => {
          setTabWarning(false);
          tabWarningTimerRef.current = null;
        }, 5000);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (tabWarningTimerRef.current) window.clearTimeout(tabWarningTimerRef.current);
    };
  }, []);

  /* ── Camera stream ── */
  const setCamVideoRef = useCallback((el) => {
    camVideoRef.current = el;
    if (el && camStreamRef.current) el.srcObject = camStreamRef.current;
  }, []);

  useEffect(() => {
    if (!showCamera) {
      camStreamRef.current?.getTracks().forEach((t) => t.stop());
      camStreamRef.current = null;
      if (camVideoRef.current) camVideoRef.current.srcObject = null;
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        camStreamRef.current = stream;
        if (camVideoRef.current) camVideoRef.current.srcObject = stream;
      } catch { /* permission denied */ }
    })();
    return () => { cancelled = true; };
  }, [showCamera]);

  /* ── Screen share ── */
  const setScreenVideoRef = useCallback((el) => {
    screenVideoRef.current = el;
    if (el && screenStreamRef.current) el.srcObject = screenStreamRef.current;
  }, []);

  useEffect(() => {
    if (!showScreen) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      if (screenVideoRef.current) screenVideoRef.current.srcObject = null;
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        screenStreamRef.current = stream;
        if (screenVideoRef.current) screenVideoRef.current.srcObject = stream;
        const [screenTrack] = stream.getVideoTracks();
        if (screenTrack) screenTrack.onended = () => setShowScreen(false);
      } catch { setShowScreen(false); }
    })();
    return () => { cancelled = true; };
  }, [showScreen]);

  /* ── Cleanup all on unmount ── */
  useEffect(() => {
    const camRef = camStreamRef;
    const screenRef = screenStreamRef;
    return () => {
      stopTTS();
      camRef.current?.getTracks().forEach((t) => t.stop());
      screenRef.current?.getTracks().forEach((t) => t.stop());
      micCaptureRef.current?.stop();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  /* ── Auto-scroll ── */
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  /* ── Auto-focus ── */
  useEffect(() => { if (!isTyping && !isFinished) inputRef.current?.focus(); }, [isTyping, isFinished]);

  /* ── Manual send (text input or submit accumulated voice) ── */
  const handleSend = useCallback(() => {
    stopTTS();
    cancelSilenceCountdown();
    const voiceTranscript = transcriptRef.current.trim();
    transcriptRef.current = '';
    const text = (inputValue.trim() || voiceTranscript);
    if (!text || isFinished) return;
    addMessage('candidate', text);
    setInputValue('');
    setSttPartial('');
    sendAnswerToInterview(text);
  }, [inputValue, isFinished, sendAnswerToInterview, addMessage, cancelSilenceCountdown]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }, [handleSend]);

  /* ── End session ── */
  const handleEndSession = useCallback(() => {
    if (interviewWsRef.current && sessionId) {
      sendEndSession(interviewWsRef.current, { sessionId });
    }
  }, [sessionId]);

  /* ── Derived ── */
  const timerWarning = timeLeft < 300;
  const timerCritical = timeLeft < 60;

  const visiblePanels = [];
  if (showCamera) visiblePanels.push(PANEL.camera);
  if (showCode) visiblePanels.push(PANEL.code);
  if (showScreen) visiblePanels.push(PANEL.screen);

  const effectivePinned = visiblePanels.includes(pinnedPanel) ? pinnedPanel : (visiblePanels[0] ?? null);
  const stripPanels = visiblePanels.filter((p) => p !== effectivePinned);

  if (sessionLoading) {
    return (
      <div className="mock-interview">
        <div className="mock-interview__header"><h3>Loading interview...</h3></div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="mock-interview">
        <div className="mock-interview__header"><h3>Error: {sessionError}</h3></div>
      </div>
    );
  }

  if (!readyToInterview) {
    return (
      <div className="mock-interview">
        <div className="mock-interview__ready-overlay">
          <div className="mock-interview__ready-card">
            <Bot size={32} />
            <h3>Ready to Begin?</h3>
            <p>Your AI interviewer is prepared. Click below to start the session.</p>
            <p className="mock-interview__ready-note">Enable your camera and microphone when prompted.</p>
            <Button variant="primary" onClick={handleStartInterview}>Start Interview</Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Thumbnail ── */
  const renderThumb = (key) => (
    <button key={key} type="button" className="mock-interview__thumb" onClick={() => setPinnedPanel(key)} title={`Expand ${key}`}>
      <span className="mock-interview__thumb-label">
        {key === PANEL.camera && <><Video size={9} /> Cam</>}
        {key === PANEL.code && <><Code2 size={9} /> Code</>}
        {key === PANEL.screen && <><Monitor size={9} /> Screen</>}
      </span>
      <div className="mock-interview__thumb-inner">
        {key === PANEL.camera && <video ref={setCamVideoRef} className="mock-interview__thumb-video" autoPlay muted playsInline />}
        {key === PANEL.code && <pre className="mock-interview__thumb-code">{codeValue.slice(0, 120)}</pre>}
        {key === PANEL.screen && <video ref={setScreenVideoRef} className="mock-interview__thumb-video" autoPlay playsInline />}
      </div>
      <Pin size={9} className="mock-interview__thumb-pin-icon" />
    </button>
  );

  /* ── Main view ── */
  const renderMainView = () => {
    if (!effectivePinned) return null;
    return (
      <div className="mock-interview__main-content">
        {effectivePinned === PANEL.camera && (
          <div className="mock-interview__video-wrapper">
            <video ref={setCamVideoRef} className="mock-interview__video-fill" autoPlay muted playsInline />
            {sttRecording && (
              <div className="mock-interview__audio-indicator">
                <span className="mock-interview__audio-bar" />
                <span className="mock-interview__audio-bar" />
                <span className="mock-interview__audio-bar" />
                <span className="mock-interview__audio-bar" />
                <span className="mock-interview__audio-bar" />
              </div>
            )}
          </div>
        )}
        {effectivePinned === PANEL.screen && (
          <div className="mock-interview__video-wrapper">
            <video ref={setScreenVideoRef} className="mock-interview__video-fill" autoPlay playsInline />
          </div>
        )}
        {effectivePinned === PANEL.code && (
          <>
            <div className="mock-interview__code-bar"><Code2 size={12} /><span>Code Editor</span><span className="mock-interview__code-lang">JavaScript</span></div>
            <div className="mock-interview__code-body">
              <div className="mock-interview__line-nums" aria-hidden="true">{codeValue.split('\n').map((_, i) => <span key={i}>{i + 1}</span>)}</div>
              <textarea className="mock-interview__code-input" value={codeValue} onChange={(e) => setCodeValue(e.target.value)} spellCheck={false} disabled={isFinished} />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="mock-interview">
      {tabWarning && (
        <div className="mock-interview__tab-warning">
          <Eye size={14} />
          <span>Tab switch detected ({tabSwitchCount}). Leaving during an assessment is flagged.</span>
        </div>
      )}
      {showTimeBanner && (
        <div className="mock-interview__time-banner">
          <AlertTriangle size={14} />
          <span>5 minutes remaining — please wrap up your responses.</span>
        </div>
      )}

      {/* Header */}
      <div className="mock-interview__header">
        <div className="mock-interview__header-left">
          <span className="mock-interview__rec-dot" />
          <h3 className="mock-interview__header-title">AI Interview</h3>
          <span className="mock-interview__header-sep" />
          <span className="mock-interview__header-subtitle">Question {questionIndex}</span>
        </div>
        <div className="mock-interview__header-right">
          <div className="mock-interview__toggles">
            <label className="mock-interview__toggle-item" title="Toggle camera">
              <span className="mock-interview__toggle-icon"><Video size={12} /></span>
              <span className="mock-interview__toggle-label">Cam</span>
              <Toggle checked={showCamera} onChange={() => setShowCamera((v) => !v)} />
            </label>
            <label className="mock-interview__toggle-item" title={sttRecording ? 'Pause mic' : sttConnected ? 'Start talking' : 'Connecting...'}>
              <span className="mock-interview__toggle-icon"><Mic size={12} /></span>
              <span className="mock-interview__toggle-label">{sttRecording ? 'Stop' : 'Mic'}</span>
              <Toggle checked={sttRecording} onChange={handleMicToggle} disabled={!sttConnected || isFinished} />
            </label>
            <label className="mock-interview__toggle-item" title="Toggle code editor">
              <span className="mock-interview__toggle-icon"><Code2 size={12} /></span>
              <span className="mock-interview__toggle-label">Code</span>
              <Toggle checked={showCode} onChange={() => setShowCode((v) => !v)} />
            </label>
            <label className="mock-interview__toggle-item" title="Toggle screen share">
              <span className="mock-interview__toggle-icon"><Monitor size={12} /></span>
              <span className="mock-interview__toggle-label">Screen</span>
              <Toggle checked={showScreen} onChange={() => setShowScreen((v) => !v)} />
            </label>
          </div>
          <div className="mock-interview__header-divider" />
          <div className={`mock-interview__timer${timerWarning ? ' mock-interview__timer--warning' : ''}${timerCritical ? ' mock-interview__timer--critical' : ''}`}>
            <Clock size={14} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className={`mock-interview__body${visiblePanels.length === 0 ? ' mock-interview__body--chat-only' : ''}`}>
        {visiblePanels.length > 0 && (
          <div className="mock-interview__left">
            {stripPanels.length > 0 && <div className="mock-interview__strip">{stripPanels.map((key) => renderThumb(key))}</div>}
            <div className="mock-interview__main-view">{renderMainView()}</div>
          </div>
        )}
        <div className="mock-interview__right">
          <div className="mock-interview__chat-header">
            <Bot size={14} />
            <span>AI Interviewer</span>
          </div>
          <div className="mock-interview__messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`mock-interview__message mock-interview__message--${msg.role}`}>
                <div className="mock-interview__message-avatar">{msg.role === 'ai' ? <Bot size={14} /> : <User size={14} />}</div>
                <div className="mock-interview__message-bubble">
                  <p className="mock-interview__message-text">{msg.message}</p>
                  {msg.timestamp && <span className="mock-interview__message-time">{msg.timestamp}</span>}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="mock-interview__message mock-interview__message--ai">
                <div className="mock-interview__message-avatar"><Bot size={14} /></div>
                <div className="mock-interview__message-bubble mock-interview__typing">
                  <span className="mock-interview__typing-dot" />
                  <span className="mock-interview__typing-dot" />
                  <span className="mock-interview__typing-dot" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {isFinished ? (
            <div className="mock-interview__complete-bar">
              <div className="mock-interview__complete-info"><CheckCircle2 size={16} /><span>Assessment completed</span></div>
              <Button variant="primary" size="sm" onClick={onComplete}>View Results</Button>
            </div>
          ) : (
            <div className="mock-interview__input-bar">
              <div className="mock-interview__input-wrapper">
                <textarea
                  ref={inputRef}
                  className="mock-interview__input"
                  placeholder={sttRecording ? 'Listening...' : 'Type your response...'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  disabled={isTyping}
                />
                {sttPartial && <div className="mock-interview__stt-partial">{sttPartial}</div>}
                {!sttPartial && transcriptRef.current && !silenceCountdown && sttRecording && (
                  <div className="mock-interview__stt-partial">{transcriptRef.current}</div>
                )}
                {silenceCountdown !== null && (
                  <div className="mock-interview__silence-countdown">
                    Submitting in {silenceCountdown}s...
                  </div>
                )}
                {sttRecording && <div className="mock-interview__stt-indicator">● REC</div>}
              </div>
              <button
                className="mock-interview__send-btn"
                onClick={handleSend}
                disabled={(!inputValue.trim() && !transcriptRef.current.trim()) || isTyping}
                type="button"
                title="Send"
              >
                <Send size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MockInterview.propTypes = {
  mockId: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired,
};