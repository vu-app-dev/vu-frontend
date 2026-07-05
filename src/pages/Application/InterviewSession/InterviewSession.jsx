import { memo, useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Clock, Check, AlertTriangle, Loader, ArrowRight, Monitor, CheckCircle2, ChevronRight } from 'lucide-react';
import { AppLogo } from '../../../components/ui/AppLogo';
import { Button } from '../../../components/ui/Button';
import {
  startInterview,
  createInterviewWS,
  sendAnswer,
  sendVideoFrame,
  sendTabSwitch,
  closeInterviewWS,
  createSTTConnection,
  sendAudioToSTT,
  closeSTTConnection,
  startMicCapture,
} from '../../../api/ai/client';
import { APPLICATION, startMock, completeMock } from '../../../api';
import { getScreenShareStream, clearScreenShareStream } from '../InterviewSetup';
import { unlockAudio, stopTTS, speak, onSpeakingChange } from '../../../utils/tts';
import './InterviewSession.css';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function buildMockData(mock) {
  if (!mock) return undefined;
  return {
    type: mock.type || 'TECHNICAL',
    difficulty: mock.difficulty || 'MEDIUM',
    technologies: mock.technologies || [],
    topics: mock.topics || [],
    estimatedTimeInMinutes: mock.durationMin || 30,
    questions: (mock.questions || []).map((q) => (typeof q === 'string' ? { title: q } : q)),
    title: mock.name || mock.title || '',
    description: mock.description || '',
  };
}

const SILENCE_TIMEOUT_MS = 3000;
const TRANSITION_DELAY_MS = 10000;
const TAB_WARNING_VISIBLE_MS = 8000;
const VIDEO_FRAME_INTERVAL_MS = 5000;

export const InterviewSession = memo(function InterviewSession({ onComplete }) {
  const mocks = APPLICATION?.mocks || [];
  const totalSeconds = (APPLICATION?.job?.totalDuration || 30) * 60;

  /* ── Phase state machine ── */
  const [phase, setPhase] = useState('idle');
  const [activeMockIndex, setActiveMockIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  /* ── Interview session state ── */
  const [latestAiMessage, setLatestAiMessage] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [silenceCountdown, setSilenceCountdown] = useState(null);

  /* ── Tab switch ── */
  const [showTabWarning, setShowTabWarning] = useState(false);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const tabWarningTimerRef = useRef(null);

  /* ── Transition overlay ── */
  const [transitionCountdown, setTransitionCountdown] = useState(null);

  /* ── Refs ── */
  const interviewWsRef = useRef(null);
  const sttWsRef = useRef(null);
  const micCaptureRef = useRef(null);
  const camStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const camVideoRef = useRef(null);
  const sessionIdRef = useRef(null);
  const sessionTokenRef = useRef(null);
  const currentQuestionIdRef = useRef(null);
  const answerStartedAtRef = useRef(null);
  const transcriptRef = useRef('');
  const silenceTimerRef = useRef(null);
  const silenceStartRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const videoFrameIntervalRef = useRef(null);
  const frameCounterRef = useRef(0);
  const transitionTimerRef = useRef(null);
  const phaseRef = useRef(phase);
  const isAiThinkingRef = useRef(false);
  const timerIntervalRef = useRef(null);
  const fullscreenExitTimerRef = useRef(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { isAiThinkingRef.current = isAiThinking; }, [isAiThinking]);

  /* ══════════════════════════════════════════
     Silence countdown helpers
     ══════════════════════════════════════════ */
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

  /* ── TTS speaking state callback — pause mic while AI talks ── */
  useEffect(() => {
    onSpeakingChange((speaking) => {
      setIsSpeaking(speaking);
      if (speaking) {
        micCaptureRef.current?.pause();
        cancelSilenceCountdown();
      } else {
        micCaptureRef.current?.resume();
      }
    });
    return () => onSpeakingChange(null);
  }, [cancelSilenceCountdown]);

  /* ── Camera ref callback ── */
  const setCamVideoRef = useCallback((el) => {
    camVideoRef.current = el;
    if (el && camStreamRef.current) el.srcObject = camStreamRef.current;
  }, []);

  const sendAnswerToInterview = useCallback((transcript) => {
    if (!interviewWsRef.current || interviewWsRef.current.readyState !== WebSocket.OPEN) return;
    const startedAt = answerStartedAtRef.current || new Date().toISOString();
    const endedAt = new Date().toISOString();
    const durationSeconds = Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);

    sendAnswer(interviewWsRef.current, {
      sessionId: sessionIdRef.current,
      questionId: currentQuestionIdRef.current || 'q1',
      transcript,
      durationSeconds: durationSeconds || 30,
      startedAt,
      endedAt,
    });
    answerStartedAtRef.current = new Date().toISOString();
    setIsAiThinking(true);
  }, []);

  const submitAccumulatedTranscript = useCallback(() => {
    cancelSilenceCountdown();
    const transcript = transcriptRef.current.trim();
    if (!transcript || isAiThinkingRef.current) {
      transcriptRef.current = '';
      return;
    }
    transcriptRef.current = '';
    sendAnswerToInterview(transcript);
  }, [cancelSilenceCountdown, sendAnswerToInterview]);

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

  /* ══════════════════════════════════════════
     Start a mock interview (called per mock)
     ══════════════════════════════════════════ */
  const startCurrentMock = useCallback(async () => {
    const mock = mocks[activeMockIndex];
    if (!mock) {
      onComplete?.();
      return;
    }

    setPhase('preparing');
    setErrorMsg(null);
    setLatestAiMessage('');
    setIsAiThinking(false);
    cancelSilenceCountdown();
    transcriptRef.current = '';

    try {
      startMock(mock.id);
      const data = await startInterview({
        mockId: mock.id,
        candidateId: 'candidate-1',
        mockData: buildMockData(mock),
      });

      sessionIdRef.current = data.sessionId;
      sessionTokenRef.current = data.sessionToken;
      currentQuestionIdRef.current = data.firstQuestion?.id || null;
      answerStartedAtRef.current = new Date().toISOString();

      /* Open interview WS */
      const initialQuestionId = data.firstQuestion?.id || null;
      const interviewWs = createInterviewWS({
        sessionId: data.sessionId,
        sessionToken: data.sessionToken,
        onIntro: () => {
          /* intro already played from HTTP response — skip WS duplicate */
        },
        onQuestion: (msg) => {
          if (msg.id === initialQuestionId) return;
          cancelSilenceCountdown();
          transcriptRef.current = '';
          currentQuestionIdRef.current = msg.id;
          answerStartedAtRef.current = new Date().toISOString();
          speak(msg.text, msg.audioBase64, (t) => setLatestAiMessage(t));
          setIsAiThinking(false);
        },
        onAcknowledgement: (msg) => {
          if (!msg.text) return;
          speak(msg.text, msg.audioBase64, (t) => setLatestAiMessage(t));
          setIsAiThinking(false);
        },
        onSessionEnd: () => {
          stopTTS();
          cancelSilenceCountdown();
          transcriptRef.current = '';
          completeMock(mock.id);

          closeInterviewWS(interviewWsRef.current);
          closeSTTConnection(sttWsRef.current);
          interviewWsRef.current = null;
          sttWsRef.current = null;
          micCaptureRef.current?.pause();

          stopVideoFrameCapture();

          if (activeMockIndex + 1 < mocks.length) {
            startTransition();
          } else {
            setPhase('complete');
          }
        },
        onError: (err) => console.error('[Interview]', err.message),
        onClose: () => {},
      });
      interviewWsRef.current = interviewWs;

      /* Open STT WS */
      const sttWs = createSTTConnection({
        onSessionBegins: () => {},
        onPartial: (text) => {
          if (text.trim()) {
            stopTTS();
            cancelSilenceCountdown();
          }
        },
        onFinal: (text) => {
          if (!text.trim()) return;
          if (isAiThinkingRef.current) return;
          const next = `${transcriptRef.current ? `${transcriptRef.current} ` : ''}${text.trim()}`;
          transcriptRef.current = next;
          restartSilenceCountdown();
        },
        onError: (msg) => console.error('[STT]', msg),
        onClose: () => {},
      });
      sttWsRef.current = sttWs;

      /* Resume mic */
      if (micCaptureRef.current) {
        micCaptureRef.current.resume();
      }

      /* Play intro + first question */
      unlockAudio();
      const showText = (text) => setLatestAiMessage(text);
      if (data.intro) {
        speak(data.intro, data.introAudio, showText);
      }
      if (data.firstQuestion) {
        speak(data.firstQuestion.text, data.firstQuestionAudio, showText);
      }

      startVideoFrameCapture();
      setPhase('interviewing');
      setRetryCount(0);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to start interview');
      setPhase('error');
    }
  }, [activeMockIndex, cancelSilenceCountdown, mocks, onComplete, restartSilenceCountdown]);

  /* ══════════════════════════════════════════
     Transition between mocks
     ══════════════════════════════════════════ */
  const startTransition = useCallback(() => {
    setPhase('transitioning');
    setTransitionCountdown(Math.ceil(TRANSITION_DELAY_MS / 1000));

    let count = Math.ceil(TRANSITION_DELAY_MS / 1000);
    const countdownInterval = setInterval(() => {
      count -= 1;
      if (count <= 0) {
        clearInterval(countdownInterval);
        setTransitionCountdown(null);
        return;
      }
      setTransitionCountdown(count);
    }, 1000);

    transitionTimerRef.current = setTimeout(() => {
      clearInterval(countdownInterval);
      setTransitionCountdown(null);
      advanceToNextMock();
    }, TRANSITION_DELAY_MS);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const advanceToNextMock = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
    setTransitionCountdown(null);
    setActiveMockIndex((prev) => prev + 1);
  }, []);

  // When activeMockIndex changes, start that mock
  useEffect(() => {
    if (phase === 'idle') return;
    if (activeMockIndex >= mocks.length) {
      setPhase('complete');
      return;
    }
    if (phase === 'transitioning' || phase === 'preparing' || phase === 'interviewing') {
      // Only auto-start if we just advanced (phase should be transitioning -> preparing)
    }
  }, [activeMockIndex, mocks.length, phase]);

  // Separate effect: when activeMockIndex changes and phase is not idle, start the mock
  const prevMockIndexRef = useRef(activeMockIndex);
  useEffect(() => {
    if (prevMockIndexRef.current !== activeMockIndex && activeMockIndex < mocks.length) {
      prevMockIndexRef.current = activeMockIndex;
      startCurrentMock();
    }
  }, [activeMockIndex, mocks.length, startCurrentMock]);

  /* ══════════════════════════════════════════
     Video frame capture
     ══════════════════════════════════════════ */
  const startVideoFrameCapture = useCallback(() => {
    stopVideoFrameCapture();
    videoFrameIntervalRef.current = setInterval(() => {
      if (!camVideoRef.current || !interviewWsRef.current) return;
      if (interviewWsRef.current.readyState !== WebSocket.OPEN) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(camVideoRef.current, 0, 0, 320, 240);
        const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        frameCounterRef.current += 1;
        sendVideoFrame(interviewWsRef.current, {
          sessionId: sessionIdRef.current,
          image: base64,
          frameNumber: frameCounterRef.current,
          timestamp: new Date().toISOString(),
        });
      } catch {
        /* canvas capture failed */
      }
    }, VIDEO_FRAME_INTERVAL_MS);
  }, []);

  const stopVideoFrameCapture = useCallback(() => {
    if (videoFrameIntervalRef.current) {
      clearInterval(videoFrameIntervalRef.current);
      videoFrameIntervalRef.current = null;
    }
  }, []);

  /* ══════════════════════════════════���═══════
     Media initialization (runs once on mount)
     ═══════���══════════════════════════════════ */
  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Pick up screen share stream from setup page (already granted)
      const existingScreen = getScreenShareStream();
      if (existingScreen) {
        screenStreamRef.current = existingScreen;
        const [screenTrack] = existingScreen.getVideoTracks();
        if (screenTrack) {
          screenTrack.onended = () => { screenStreamRef.current = null; };
        }
      }

      // Camera + Mic first (these don't exit fullscreen)
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (cancelled) { camStream.getTracks().forEach((t) => t.stop()); return; }
        camStreamRef.current = camStream;
        if (camVideoRef.current) camVideoRef.current.srcObject = camStream;
      } catch {
        /* camera/mic denied — continue */
      }

      // Mic capture (uses its own getUserMedia for audio processing)
      try {
        const capture = startMicCapture((base64) => {
          sendAudioToSTT(sttWsRef.current, base64);
        });
        micCaptureRef.current = capture;
        await capture.start();
      } catch {
        /* mic denied — continue */
      }

      if (!cancelled) {
        startCurrentMock();
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ══════════════════════════════════════════
     Timer (runs across all mocks)
     ══════════════════════════════════════════ */
  useEffect(() => {
    if (phase !== 'interviewing' && phase !== 'transitioning') return;
    if (timerIntervalRef.current) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
          setPhase('complete');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [phase]);

  /* ══════════════════════════════════════════
     Tab switch detection
     ══════════════════════════════════════════ */
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount((c) => {
          const next = c + 1;
          if (interviewWsRef.current?.readyState === WebSocket.OPEN) {
            sendTabSwitch(interviewWsRef.current, {
              sessionId: sessionIdRef.current,
              totalCount: next,
            });
          }
          return next;
        });
        setShowTabWarning(true);
        if (tabWarningTimerRef.current) clearTimeout(tabWarningTimerRef.current);
        tabWarningTimerRef.current = setTimeout(() => {
          setShowTabWarning(false);
          tabWarningTimerRef.current = null;
        }, TAB_WARNING_VISIBLE_MS);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      if (tabWarningTimerRef.current) clearTimeout(tabWarningTimerRef.current);
    };
  }, []);

  /* ══════════════════════════════════════════
     beforeunload warning
     ══════════════════════════════════════════ */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (phaseRef.current === 'interviewing' || phaseRef.current === 'transitioning') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  /* ══════════════════════════════════════════
     Complete phase → navigate away
     ══════════════════════════════════════════ */
  useEffect(() => {
    if (phase !== 'complete') return;
    stopTTS();
    closeInterviewWS(interviewWsRef.current);
    closeSTTConnection(sttWsRef.current);
    micCaptureRef.current?.stop();
    stopVideoFrameCapture();
    camStreamRef.current?.getTracks().forEach((t) => t.stop());
    clearScreenShareStream();
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [phase, stopVideoFrameCapture]);

  /* ══════════════════════════════════════════
     Cleanup on unmount
     ══════════════════════════════════════════ */
  useEffect(() => {
    return () => {
      stopTTS();
      closeInterviewWS(interviewWsRef.current);
      closeSTTConnection(sttWsRef.current);
      micCaptureRef.current?.stop();
      camStreamRef.current?.getTracks().forEach((t) => t.stop());
      clearScreenShareStream();
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (videoFrameIntervalRef.current) clearInterval(videoFrameIntervalRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (tabWarningTimerRef.current) clearTimeout(tabWarningTimerRef.current);
    };
  }, []);

  /* Fullscreen — deferred exit so StrictMode remount can cancel it */
  useEffect(() => {
    if (fullscreenExitTimerRef.current) {
      clearTimeout(fullscreenExitTimerRef.current);
      fullscreenExitTimerRef.current = null;
    }
    return () => {
      fullscreenExitTimerRef.current = setTimeout(() => {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }, 100);
    };
  }, []);

  /* ── Retry handler ── */
  const handleRetry = useCallback(() => {
    setRetryCount((c) => c + 1);
    startCurrentMock();
  }, [startCurrentMock]);

  const handleFinish = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  /* ══════════════════════════════════════════
     Derived values
     ══════════════════════════════════════════ */
  const timerWarning = timeLeft < 300;
  const timerCritical = timeLeft < 60;
  const currentMock = mocks[activeMockIndex];
  const nextMock = mocks[activeMockIndex + 1];

  /* ══════════════════════════════════════════
     Render
     ══════════════════════════════════════════ */
  return (
    <div className="interview-session">
      {/* ── Top bar ── */}
      <div className="interview-session__top-bar">
        <div className="interview-session__logo">
          <AppLogo size="sm" />
        </div>

        <div className="interview-session__mock-tabs">
          {mocks.map((mock, i) => (
            <div
              key={mock.id}
              className={`interview-session__mock-tab interview-session__mock-tab--${
                i < activeMockIndex
                  ? 'completed'
                  : i === activeMockIndex
                    ? 'active'
                    : 'upcoming'
              }`}
            >
              {i < activeMockIndex && <Check size={12} />}
              <span>{mock.name || `Interview ${i + 1}`}</span>
            </div>
          ))}
        </div>

        <div
          className={`interview-session__timer ${timerWarning ? 'interview-session__timer--warning' : ''} ${timerCritical ? 'interview-session__timer--critical' : ''}`}
        >
          <Clock size={14} />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* ── Stage ── */}
      <div className="interview-session__stage">
        {phase === 'preparing' && (
          <div className="interview-session__status">
            <span className="interview-session__status-spinner">
              <Loader size={24} />
            </span>
            <p className="interview-session__status-text">
              Starting {currentMock?.name || 'interview'}...
            </p>
          </div>
        )}

        {phase === 'error' && (
          <div className="interview-session__status">
            <p className="interview-session__status-error">{errorMsg}</p>
            {retryCount < 3 ? (
              <Button variant="primary" size="sm" onClick={handleRetry}>
                Retry
              </Button>
            ) : (
              <p className="interview-session__status-text">
                Unable to start interview. Please go back and try again.
              </p>
            )}
          </div>
        )}

        {phase === 'interviewing' && (
          <div className="interview-session__conversation">
            <div className={`interview-session__voice-panel ${isSpeaking ? 'interview-session__voice-panel--speaking' : ''}`}>
              <div
                className={`interview-session__voice-circle ${isSpeaking ? 'interview-session__voice-circle--speaking' : ''}`}
              >
                <AppLogo size="md" />
              </div>
              <div className="interview-session__voice-state">
                <span className="interview-session__voice-label">
                  {isSpeaking ? 'AI speaking' : isAiThinking ? 'Processing answer' : 'Listening'}
                </span>
                <span className="interview-session__voice-subtext">
                  {isSpeaking
                    ? 'Wait for the question to finish.'
                    : isAiThinking
                      ? 'Preparing the next response.'
                      : 'Speak naturally when you are ready.'}
                </span>
              </div>
            </div>

            <div className="interview-session__ai-text">
              {latestAiMessage && (
                <p className="interview-session__ai-text-content">{latestAiMessage}</p>
              )}

              {isAiThinking && (
                <div className="interview-session__thinking">
                  <span className="interview-session__thinking-dot" />
                  <span className="interview-session__thinking-dot" />
                  <span className="interview-session__thinking-dot" />
                </div>
              )}

              <div className={`interview-session__recording ${silenceCountdown != null ? 'interview-session__recording--pending' : ''}`}>
                <span className="interview-session__recording-dot" />
                <div className="interview-session__recording-copy">
                  <span className="interview-session__recording-title">
                    {silenceCountdown != null ? 'Answer captured' : 'Listening'}
                  </span>
                  <span className="interview-session__recording-detail">
                    {silenceCountdown != null
                      ? `Sending in ${silenceCountdown}s`
                      : 'Your answer sends after a short pause.'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {phase === 'complete' && (
          <div className="interview-session__complete">
            <div className="interview-session__complete-mark">
              <CheckCircle2 size={42} />
            </div>
            <p className="interview-session__complete-kicker">Interview complete</p>
            <h1 className="interview-session__complete-title">Thank you for your time.</h1>
            <p className="interview-session__complete-copy">
              Your interview responses have been recorded successfully. You can now continue to the
              application summary.
            </p>
            <div className="interview-session__complete-summary">
              <span>{mocks.length} interviews completed</span>
              <span>{formatTime(totalSeconds - timeLeft)} recorded time</span>
            </div>
            <Button
              variant="primary"
              size="lg"
              iconRight={<ArrowRight size={16} />}
              onClick={handleFinish}
            >
              View summary
            </Button>
          </div>
        )}

        {/* Camera and screen share status */}
        {(phase === 'interviewing' || phase === 'transitioning') && (
          <div className="interview-session__monitor-card">
            <div className="interview-session__camera-pip">
              <video
                ref={setCamVideoRef}
                className="interview-session__camera-video"
                autoPlay
                muted
                playsInline
              />
            </div>
            <div className="interview-session__screen-share-badge">
              <Monitor size={13} />
              <span>Full screen shared</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Tab switch toast ── */}
      {showTabWarning && (
        <div className="interview-session__toast">
          <span className="interview-session__toast-icon">
            <AlertTriangle size={16} />
          </span>
          <span className="interview-session__toast-copy">
            <strong>Stay on this tab</strong>
            <span>Tab switches are recorded during the interview ({tabSwitchCount}).</span>
          </span>
        </div>
      )}

      {/* ── Transition overlay ── */}
      {phase === 'transitioning' && nextMock && (
        <div className="interview-session__overlay">
          <div className="interview-session__overlay-card">
            <div className="interview-session__overlay-done">
              <CheckCircle2 size={32} />
            </div>
            <div className="interview-session__overlay-header">
              <p className="interview-session__overlay-label">Completed</p>
              <h2 className="interview-session__overlay-title">
                {currentMock?.name || `Interview ${activeMockIndex + 1}`}
              </h2>
            </div>

            <div className="interview-session__overlay-divider" />

            <div className="interview-session__overlay-next">
              <p className="interview-session__overlay-label">Up next</p>
              <h3 className="interview-session__overlay-next-name">
                {nextMock.name || `Interview ${activeMockIndex + 2}`}
              </h3>
              {(nextMock.type || nextMock.durationMin) && (
                <p className="interview-session__overlay-meta">
                  {[
                    nextMock.type,
                    nextMock.difficulty,
                    nextMock.durationMin ? `${nextMock.durationMin} min` : nextMock.duration,
                  ].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>

            <div className="interview-session__overlay-progress">
              {mocks.map((m, i) => (
                <div
                  key={m.id}
                  className={`interview-session__overlay-step ${
                    i <= activeMockIndex ? 'interview-session__overlay-step--done' : ''
                  } ${i === activeMockIndex + 1 ? 'interview-session__overlay-step--next' : ''}`}
                />
              ))}
            </div>

            <div className="interview-session__overlay-count-ring" aria-hidden="true">
              <span>{transitionCountdown ?? Math.ceil(TRANSITION_DELAY_MS / 1000)}</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              iconRight={<ChevronRight size={18} />}
              onClick={advanceToNextMock}
            >
              Continue
            </Button>
            {transitionCountdown != null && (
              <p className="interview-session__overlay-countdown">
                Auto-continuing in {transitionCountdown}s
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

InterviewSession.propTypes = {
  onComplete: PropTypes.func.isRequired,
};
