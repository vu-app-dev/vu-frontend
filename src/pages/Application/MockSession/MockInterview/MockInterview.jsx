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
import { getApplicationMock, SAMPLE_CONVERSATION } from '../../../../api';
import './MockInterview.css';

/* â”€â”€ Timer helper â”€â”€ */
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* â”€â”€ AI follow-up questions (simulated) â”€â”€ */
const AI_FOLLOW_UPS = [
  "That's a great point. Can you elaborate on how you would handle scalability in this scenario?",
  'Interesting approach. What trade-offs did you consider when making that decision?',
  'How would you test this solution to ensure reliability?',
  "Let's move on. Can you walk me through a challenging project you've worked on recently?",
  'Good answer. Now, how would you approach debugging a performance issue in a distributed system?',
  "Thank you for your thorough responses. That concludes our assessment. I'll compile your results now.",
];
const TOTAL_QUESTIONS = AI_FOLLOW_UPS.length;

/* â”€â”€ Panel keys â”€â”€ */
const PANEL = { camera: 'camera', code: 'code', screen: 'screen' };

/* â”€â”€ Required panels per mock type â”€â”€ */
const MOCK_REQUIREMENTS = {
  Technical: { camera: true, mic: true, code: true, screen: true },
  Behavioral: { camera: true, mic: true, code: false, screen: false },
  Coding: { camera: true, mic: true, code: true, screen: true },
  Design: { camera: true, mic: true, code: false, screen: true },
  Analytical: { camera: true, mic: true, code: true, screen: false },
};

/* â”€â”€ Component â”€â”€ */
export const MockInterview = memo(function MockInterview({ mockId, onComplete }) {
  const mock = getApplicationMock(mockId);
  const totalSeconds = (mock?.durationMin || 30) * 60;
  const required = MOCK_REQUIREMENTS[mock?.type] || { camera: true, mic: true };

  /* Chat state */
  const [messages, setMessages] = useState(SAMPLE_CONVERSATION.filter((m) => m.role === 'ai'));
  const [inputValue, setInputValue] = useState('');
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [isTyping, setIsTyping] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* Panel visibility â€” required panels start ON */
  const [showCamera, setShowCamera] = useState(true);
  const [showMic, setShowMic] = useState(true);
  const [showCode, setShowCode] = useState(required.code !== false);
  const [showScreen, setShowScreen] = useState(false); // screen share always starts off (requires user gesture)

  /* Which panel fills the big main area */
  const [pinnedPanel, setPinnedPanel] = useState(
    required.code !== false ? PANEL.code : PANEL.camera
  );

  /* Code editor */
  const [codeValue, setCodeValue] = useState(
    '// Write your solution here\n\nfunction solve(input) {\n  \n}\n'
  );

  /* Real media streams */
  const camStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  /* Callback refs â€” re-attach srcObject when video element mounts/remounts */
  const camVideoRef = useRef(null);
  const screenVideoRef = useRef(null);

  const setCamVideoRef = useCallback((el) => {
    camVideoRef.current = el;
    if (el && camStreamRef.current) {
      el.srcObject = camStreamRef.current;
    }
  }, []);

  const setScreenVideoRef = useCallback((el) => {
    screenVideoRef.current = el;
    if (el && screenStreamRef.current) {
      el.srcObject = screenStreamRef.current;
    }
  }, []);

  /* Tab-switch detection */
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [tabWarning, setTabWarning] = useState(false);

  /* 5-minute warning banner */
  const timeWarningShownRef = useRef(false);
  const [showTimeBanner, setShowTimeBanner] = useState(false);
  const timeBannerTimerRef = useRef(null);
  const tabWarningTimerRef = useRef(null);
  const aiResponseTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      [timeBannerTimerRef, tabWarningTimerRef, aiResponseTimerRef].forEach((timerRef) => {
        if (timerRef.current) window.clearTimeout(timerRef.current);
      });
    };
  }, []);

  /* â”€â”€ Timer countdown â”€â”€ */
  useEffect(() => {
    if (isFinished) return;
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
  }, [isFinished]);

  /* â”€â”€ 5-minute warning â”€â”€ */
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

  /* â”€â”€ Tab switch detector â”€â”€ */
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

  /* â”€â”€ Camera stream â”€â”€ */
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
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        camStreamRef.current = stream;
        if (camVideoRef.current) camVideoRef.current.srcObject = stream;
      } catch {
        /* permission denied */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showCamera]);

  /* â”€â”€ Screen share stream â”€â”€ */
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
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        screenStreamRef.current = stream;
        if (screenVideoRef.current) screenVideoRef.current.srcObject = stream;
        const [screenTrack] = stream.getVideoTracks();
        if (screenTrack) screenTrack.onended = () => setShowScreen(false);
      } catch {
        setShowScreen(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showScreen]);

  /* â”€â”€ Cleanup all streams on unmount â”€â”€ */
  useEffect(() => {
    const camRef = camStreamRef;
    const screenRef = screenStreamRef;
    return () => {
      camRef.current?.getTracks().forEach((t) => t.stop());
      screenRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /* â”€â”€ Auto-scroll to bottom â”€â”€ */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /* â”€â”€ Auto-focus input after AI finishes typing â”€â”€ */
  useEffect(() => {
    if (!isTyping && !isFinished) {
      inputRef.current?.focus();
    }
  }, [isTyping, isFinished]);

  /* â”€â”€ Send message â”€â”€ */
  const handleSend = useCallback(() => {
    if (!inputValue.trim() || isFinished) return;

    const candidateMsg = {
      id: Date.now(),
      role: 'candidate',
      message: inputValue.trim(),
      timestamp: formatTime(totalSeconds - timeLeft),
    };

    setMessages((prev) => [...prev, candidateMsg]);
    setInputValue('');
    setIsTyping(true);

    const followUpIdx = Math.min(questionIndex - 1, TOTAL_QUESTIONS - 1);
    const isLast = followUpIdx === TOTAL_QUESTIONS - 1;

    if (aiResponseTimerRef.current) window.clearTimeout(aiResponseTimerRef.current);
    aiResponseTimerRef.current = window.setTimeout(() => {
      aiResponseTimerRef.current = null;
      const aiMsg = {
        id: Date.now() + 1,
        role: 'ai',
        message: AI_FOLLOW_UPS[followUpIdx],
        timestamp: formatTime(totalSeconds - timeLeft + 2),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
      setQuestionIndex((prev) => prev + 1);
      if (isLast) setIsFinished(true);
    }, 1500);
  }, [inputValue, isFinished, totalSeconds, timeLeft, questionIndex]);

  /* â”€â”€ Key handler â”€â”€ */
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  /* â”€â”€ Derived panel state â”€â”€ */
  const timerWarning = timeLeft < 300;
  const timerCritical = timeLeft < 60;

  const visiblePanels = [];
  if (showCamera) visiblePanels.push(PANEL.camera);
  if (showCode) visiblePanels.push(PANEL.code);
  if (showScreen) visiblePanels.push(PANEL.screen);

  /* Effective pinned: prefer user choice, fallback to first visible */
  const effectivePinned = visiblePanels.includes(pinnedPanel)
    ? pinnedPanel
    : (visiblePanels[0] ?? null);
  const stripPanels = visiblePanels.filter((p) => p !== effectivePinned);

  if (!mock) return null;

  /* â”€â”€ Thumbnail (strip) renderer â”€â”€ */
  const renderThumb = (key) => (
    <button
      key={key}
      type="button"
      className="mock-interview__thumb"
      onClick={() => setPinnedPanel(key)}
      title={`Expand ${key}`}
    >
      <span className="mock-interview__thumb-label">
        {key === PANEL.camera && (
          <>
            <Video size={9} /> Cam
          </>
        )}
        {key === PANEL.code && (
          <>
            <Code2 size={9} /> Code
          </>
        )}
        {key === PANEL.screen && (
          <>
            <Monitor size={9} /> Screen
          </>
        )}
      </span>
      <div className="mock-interview__thumb-inner">
        {key === PANEL.camera && (
          <video
            ref={setCamVideoRef}
            className="mock-interview__thumb-video"
            autoPlay
            muted
            playsInline
          />
        )}
        {key === PANEL.code && (
          <pre className="mock-interview__thumb-code">{codeValue.slice(0, 120)}</pre>
        )}
        {key === PANEL.screen && (
          <video
            ref={setScreenVideoRef}
            className="mock-interview__thumb-video"
            autoPlay
            playsInline
          />
        )}
      </div>
      <Pin size={9} className="mock-interview__thumb-pin-icon" />
    </button>
  );

  /* â”€â”€ Main view renderer â”€â”€ */
  const renderMainView = () => {
    if (!effectivePinned) return null;
    return (
      <div className="mock-interview__main-content">
        {/* Camera main */}
        {effectivePinned === PANEL.camera && (
          <div className="mock-interview__video-wrapper">
            <video
              ref={setCamVideoRef}
              className="mock-interview__video-fill"
              autoPlay
              muted
              playsInline
            />
            {showMic && (
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

        {/* Screen share main */}
        {effectivePinned === PANEL.screen && (
          <div className="mock-interview__video-wrapper">
            <video
              ref={setScreenVideoRef}
              className="mock-interview__video-fill"
              autoPlay
              playsInline
            />
          </div>
        )}

        {/* Code editor main */}
        {effectivePinned === PANEL.code && (
          <>
            <div className="mock-interview__code-bar">
              <Code2 size={12} />
              <span>Code Editor</span>
              <span className="mock-interview__code-lang">JavaScript</span>
            </div>
            <div className="mock-interview__code-body">
              <div className="mock-interview__line-nums" aria-hidden="true">
                {codeValue.split('\n').map((_, i) => (
                  <span key={i}>{i + 1}</span>
                ))}
              </div>
              <textarea
                className="mock-interview__code-input"
                value={codeValue}
                onChange={(e) => setCodeValue(e.target.value)}
                spellCheck={false}
                disabled={isFinished}
              />
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="mock-interview">
      {/* â”€â”€ Tab switch warning â”€â”€ */}
      {tabWarning && (
        <div className="mock-interview__tab-warning">
          <Eye size={14} />
          <span>
            Tab switch detected ({tabSwitchCount}). Leaving during an assessment is flagged.
          </span>
        </div>
      )}

      {/* â”€â”€ 5-minute warning â”€â”€ */}
      {showTimeBanner && (
        <div className="mock-interview__time-banner">
          <AlertTriangle size={14} />
          <span>5 minutes remaining â€” please wrap up your responses.</span>
        </div>
      )}

      {/* â”€â”€ Header â”€â”€ */}
      <div className="mock-interview__header">
        <div className="mock-interview__header-left">
          <span className="mock-interview__rec-dot" />
          <h3 className="mock-interview__header-title">{mock.name}</h3>
          <span className="mock-interview__header-sep" />
          <span className="mock-interview__header-subtitle">
            Question {Math.min(questionIndex, TOTAL_QUESTIONS)} of {TOTAL_QUESTIONS}
          </span>
        </div>
        <div className="mock-interview__header-right">
          {/* Panel toggles */}
          <div className="mock-interview__toggles">
            {/* Camera */}
            <label className="mock-interview__toggle-item" title="Toggle camera">
              <span className="mock-interview__toggle-icon">
                <Video size={12} />
              </span>
              <span className="mock-interview__toggle-label">Cam</span>
              <Toggle checked={showCamera} onChange={() => setShowCamera((v) => !v)} />
            </label>
            {/* Microphone */}
            <label className="mock-interview__toggle-item" title="Toggle microphone">
              <span className="mock-interview__toggle-icon">
                <Mic size={12} />
              </span>
              <span className="mock-interview__toggle-label">Mic</span>
              <Toggle checked={showMic} onChange={() => setShowMic((v) => !v)} />
            </label>
            {/* Code editor */}
            <label className="mock-interview__toggle-item" title="Toggle code editor">
              <span className="mock-interview__toggle-icon">
                <Code2 size={12} />
              </span>
              <span className="mock-interview__toggle-label">Code</span>
              <Toggle checked={showCode} onChange={() => setShowCode((v) => !v)} />
            </label>
            {/* Screen share */}
            <label className="mock-interview__toggle-item" title="Toggle screen share">
              <span className="mock-interview__toggle-icon">
                <Monitor size={12} />
              </span>
              <span className="mock-interview__toggle-label">Screen</span>
              <Toggle checked={showScreen} onChange={() => setShowScreen((v) => !v)} />
            </label>
          </div>

          <div className="mock-interview__header-divider" />

          {/* Timer */}
          <div
            className={`mock-interview__timer${timerWarning ? ' mock-interview__timer--warning' : ''}${timerCritical ? ' mock-interview__timer--critical' : ''}`}
          >
            <Clock size={14} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* â”€â”€ Body â”€â”€ */}
      <div
        className={`mock-interview__body${visiblePanels.length === 0 ? ' mock-interview__body--chat-only' : ''}`}
      >
        {/* Left â€” panel area */}
        {visiblePanels.length > 0 && (
          <div className="mock-interview__left">
            {/* Thumbnail strip â€” panels not currently in main view */}
            {stripPanels.length > 0 && (
              <div className="mock-interview__strip">
                {stripPanels.map((key) => renderThumb(key))}
              </div>
            )}
            {/* Main pinned view */}
            <div className="mock-interview__main-view">{renderMainView()}</div>
          </div>
        )}

        {/* Right â€” Chat */}
        <div className="mock-interview__right">
          <div className="mock-interview__chat-header">
            <Bot size={14} />
            <span>AI Interviewer</span>
          </div>

          {/* Messages */}
          <div className="mock-interview__messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mock-interview__message mock-interview__message--${msg.role}`}
              >
                <div className="mock-interview__message-avatar">
                  {msg.role === 'ai' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className="mock-interview__message-bubble">
                  <p className="mock-interview__message-text">{msg.message}</p>
                  {msg.timestamp && (
                    <span className="mock-interview__message-time">{msg.timestamp}</span>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="mock-interview__message mock-interview__message--ai">
                <div className="mock-interview__message-avatar">
                  <Bot size={14} />
                </div>
                <div className="mock-interview__message-bubble mock-interview__typing">
                  <span className="mock-interview__typing-dot" />
                  <span className="mock-interview__typing-dot" />
                  <span className="mock-interview__typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input or Complete */}
          {isFinished ? (
            <div className="mock-interview__complete-bar">
              <div className="mock-interview__complete-info">
                <CheckCircle2 size={16} />
                <span>Assessment completed</span>
              </div>
              <Button variant="primary" size="sm" onClick={onComplete}>
                View Results
              </Button>
            </div>
          ) : (
            <div className="mock-interview__input-bar">
              <textarea
                ref={inputRef}
                className="mock-interview__input"
                placeholder="Type your response..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isTyping}
              />
              <button
                className="mock-interview__send-btn"
                onClick={handleSend}
                disabled={!inputValue.trim() || isTyping}
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
