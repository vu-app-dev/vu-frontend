import { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Clock,
  FileText,
  BarChart3,
  AlertTriangle,
  Play,
  Layers,
  Video,
  Mic,
  Monitor,
  CheckCircle2,
  XCircle,
  Loader,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { getApplicationMock } from '../../../../api';
import './MockIntro.css';

/* ── Device-check states ── */
const CHECK = { idle: 'idle', checking: 'checking', granted: 'granted', denied: 'denied' };

const MOCK_REQUIREMENTS = {
  Technical: { camera: true, mic: true, screen: true },
  Behavioral: { camera: true, mic: true, screen: false },
  Coding: { camera: true, mic: true, screen: true },
  Design: { camera: true, mic: true, screen: true },
  Analytical: { camera: true, mic: true, screen: false },
};

const STATUS_META = {
  [CHECK.idle]: { label: 'Not checked', Icon: null, cls: '' },
  [CHECK.checking]: { label: 'Checking…', Icon: Loader, cls: 'mock-intro__check-icon--checking' },
  [CHECK.granted]: { label: 'Ready', Icon: CheckCircle2, cls: 'mock-intro__check-icon--granted' },
  [CHECK.denied]: { label: 'Denied', Icon: XCircle, cls: 'mock-intro__check-icon--denied' },
};

/* ── Component ── */
export const MockIntro = memo(function MockIntro({ mockId, onStart }) {
  const mock = getApplicationMock(mockId);
  const required = MOCK_REQUIREMENTS[mock?.type] || { camera: true, mic: true, screen: false };

  /* Device-check state */
  const [camera, setCamera] = useState(CHECK.idle);
  const [mic, setMic] = useState(CHECK.idle);
  const [screen, setScreen] = useState(CHECK.idle);
  const canSkipDeviceCheck = import.meta.env.DEV;

  /* ─ Camera ─ */
  const checkCamera = useCallback(async () => {
    setCamera(CHECK.checking);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop()); // stop immediately — just checking permission
      setCamera(CHECK.granted);
    } catch {
      setCamera(CHECK.denied);
    }
  }, []);

  /* ─ Microphone ─ */
  const checkMic = useCallback(async () => {
    setMic(CHECK.checking);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setMic(CHECK.granted);
    } catch {
      setMic(CHECK.denied);
    }
  }, []);

  /* ─ Screen share ─ */
  const checkScreen = useCallback(async () => {
    setScreen(CHECK.checking);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      setScreen(CHECK.granted);
    } catch {
      setScreen(CHECK.denied);
    }
  }, []);

  const allGranted =
    canSkipDeviceCheck ||
    ((!required.camera || camera === CHECK.granted) &&
      (!required.mic || mic === CHECK.granted) &&
      (!required.screen || screen === CHECK.granted));

  if (!mock) return null;

  /* ─ Helper: render one device-check row ─ */
  const renderCheck = (icon, label, status, onCheck) => {
    const meta = STATUS_META[status];
    return (
      <div className="mock-intro__check-row">
        <div className="mock-intro__check-left">
          {icon}
          <span>{label}</span>
        </div>
        <div className="mock-intro__check-right">
          {meta.Icon && (
            <span className={`mock-intro__check-icon ${meta.cls}`}>
              <meta.Icon size={14} />
            </span>
          )}
          <span className={`mock-intro__check-label ${meta.cls}`}>{meta.label}</span>
          {(status === CHECK.idle || status === CHECK.denied) && (
            <Button variant="ghost" size="xs" onClick={onCheck}>
              {status === CHECK.denied ? 'Retry' : 'Test'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mock-intro">
      <div className="mock-intro__container">
        {/* Icon */}
        <div className="mock-intro__icon-wrapper">
          <Layers size={32} />
        </div>

        {/* Title */}
        <h1 className="mock-intro__title">{mock.name}</h1>
        <p className="mock-intro__subtitle">
          {mock.type} · {mock.difficulty}
        </p>

        {/* Stats row */}
        <div className="mock-intro__stats">
          <div className="mock-intro__stat">
            <Clock size={16} />
            <div>
              <span className="mock-intro__stat-label">Duration</span>
              <span className="mock-intro__stat-value">{mock.duration}</span>
            </div>
          </div>
          <div className="mock-intro__stat-divider" />
          <div className="mock-intro__stat">
            <FileText size={16} />
            <div>
              <span className="mock-intro__stat-label">Type</span>
              <span className="mock-intro__stat-value">{mock.type}</span>
            </div>
          </div>
          <div className="mock-intro__stat-divider" />
          <div className="mock-intro__stat">
            <BarChart3 size={16} />
            <div>
              <span className="mock-intro__stat-label">Difficulty</span>
              <span className="mock-intro__stat-value">{mock.difficulty}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {mock.description && (
          <div className="mock-intro__description-card">
            <p className="mock-intro__description">{mock.description}</p>
          </div>
        )}

        {/* Device Checks */}
        <div className="mock-intro__checks">
          <span className="mock-intro__checks-title">Device Check</span>
          {required.camera && renderCheck(<Video size={14} />, 'Camera', camera, checkCamera)}
          {required.mic && renderCheck(<Mic size={14} />, 'Microphone', mic, checkMic)}
          {required.screen &&
            renderCheck(<Monitor size={14} />, 'Screen Share', screen, checkScreen)}
        </div>

        {/* Rules */}
        <div className="mock-intro__rules">
          <div className="mock-intro__rules-header">
            <AlertTriangle size={16} />
            <span>Important Guidelines</span>
          </div>
          <ul className="mock-intro__rules-list">
            <li>
              This assessment is timed — the countdown starts when you click &quot;Begin&quot;
            </li>
            <li>You will interact with an AI interviewer in a conversational format</li>
            <li>Answer each question thoughtfully and completely before moving on</li>
            <li>Your camera and screen activity may be monitored for integrity</li>
            <li>You cannot pause, restart, or go back once the assessment begins</li>
          </ul>
        </div>

        {/* Start button */}
        <Button
          variant="primary"
          size="lg"
          className="mock-intro__cta"
          iconRight={<Play size={16} />}
          onClick={onStart}
          disabled={!allGranted}
        >
          {allGranted ? 'Begin Assessment' : 'Complete Device Check to Begin'}
        </Button>
      </div>
    </div>
  );
});

MockIntro.propTypes = {
  mockId: PropTypes.string.isRequired,
  onStart: PropTypes.func.isRequired,
};
