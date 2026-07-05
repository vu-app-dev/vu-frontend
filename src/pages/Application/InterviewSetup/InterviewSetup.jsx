import { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Video,
  Mic,
  Monitor,
  CheckCircle2,
  XCircle,
  Loader,
  ArrowRight,
  ArrowLeft,
  Circle,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import './InterviewSetup.css';

const CHECK = { idle: 'idle', checking: 'checking', granted: 'granted', denied: 'denied' };

// Module-level store for the screen share stream so it persists across navigation
let _screenShareStream = null;
export function getScreenShareStream() { return _screenShareStream; }
export function clearScreenShareStream() {
  _screenShareStream?.getTracks().forEach((t) => t.stop());
  _screenShareStream = null;
}

const DEVICES = [
  {
    key: 'camera',
    label: 'Camera',
    description: 'Used for video during the interview',
    Icon: Video,
    request: () => navigator.mediaDevices.getUserMedia({ video: true }),
  },
  {
    key: 'mic',
    label: 'Microphone',
    description: 'Used for audio during the interview',
    Icon: Mic,
    request: () => navigator.mediaDevices.getUserMedia({ audio: true }),
  },
  {
    key: 'screen',
    label: 'Screen Share',
    description: 'Active throughout the interview for integrity monitoring',
    Icon: Monitor,
    request: async () => {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      _screenShareStream = stream;
      return stream;
    },
  },
];

const GUIDELINES = [
  'Find a quiet, well-lit environment before starting',
  'Close unnecessary browser tabs and applications',
  'Make sure your internet connection is stable',
  'The interview is timed and cannot be paused or restarted',
  'Your camera and screen activity may be monitored for integrity',
];

export const InterviewSetup = memo(function InterviewSetup({ onNext, onBack }) {
  const [deviceState, setDeviceState] = useState({
    camera: CHECK.idle,
    mic: CHECK.idle,
    screen: CHECK.idle,
  });

  const checkDevice = useCallback(async (device) => {
    setDeviceState((prev) => ({ ...prev, [device.key]: CHECK.checking }));
    try {
      const stream = await device.request();
      // Keep screen share stream alive — stop all others after testing
      if (device.key !== 'screen') {
        stream.getTracks().forEach((t) => t.stop());
      }
      setDeviceState((prev) => ({ ...prev, [device.key]: CHECK.granted }));
    } catch {
      setDeviceState((prev) => ({ ...prev, [device.key]: CHECK.denied }));
    }
  }, []);

  const allGranted =
    deviceState.camera === CHECK.granted &&
    deviceState.mic === CHECK.granted &&
    deviceState.screen === CHECK.granted;

  const checkedCount = Object.values(deviceState).filter((s) => s === CHECK.granted).length;

  return (
    <div className="interview-setup">
      {/* ── Body ── */}
      <div className="interview-setup__body">
        {/* Device checks */}
        <section>
          <h2 className="interview-setup__section-label">Device Check</h2>
          <div className="interview-setup__checks">
            {DEVICES.map((device) => {
              const state = deviceState[device.key];
              const DeviceIcon = device.Icon;
              return (
                <div key={device.key} className="interview-setup__check-row">
                  <div className="interview-setup__check-left">
                    <div
                      className={`interview-setup__check-icon-wrap ${state === CHECK.granted ? 'interview-setup__check-icon-wrap--granted' : ''} ${state === CHECK.denied ? 'interview-setup__check-icon-wrap--denied' : ''}`}
                    >
                      <DeviceIcon size={16} />
                    </div>
                    <div className="interview-setup__check-info">
                      <span className="interview-setup__check-name">{device.label}</span>
                      <span className="interview-setup__check-desc">{device.description}</span>
                    </div>
                  </div>
                  <div className="interview-setup__check-right">
                    {state === CHECK.checking && (
                      <span className="interview-setup__check-spinner">
                        <Loader size={14} />
                      </span>
                    )}
                    {state === CHECK.granted && (
                      <span className="interview-setup__check-status interview-setup__check-status--granted">
                        <CheckCircle2 size={14} /> Ready
                      </span>
                    )}
                    {state === CHECK.denied && (
                      <span className="interview-setup__check-status interview-setup__check-status--denied">
                        <XCircle size={14} /> Denied
                      </span>
                    )}
                    {(state === CHECK.idle || state === CHECK.denied) && (
                      <Button variant="ghost" size="sm" onClick={() => checkDevice(device)}>
                        {state === CHECK.denied ? 'Retry' : 'Test'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Guidelines */}
        <section>
          <h2 className="interview-setup__section-label">Before You Start</h2>
          <div className="interview-setup__guidelines">
            {GUIDELINES.map((text) => (
              <div key={text} className="interview-setup__guideline">
                <Circle size={5} />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── Sticky bar ── */}
      <div className="interview-setup__sticky-bar">
        <span
          className={`interview-setup__bar-status ${allGranted ? 'interview-setup__bar-status--ready' : ''}`}
        >
          {allGranted ? 'All devices ready' : `${checkedCount}/3 devices checked`}
        </span>
        <div className="interview-setup__bar-actions">
          <Button
            variant="ghost"
            size="sm"
            iconLeft={<ArrowLeft size={16} />}
            onClick={onBack}
          >
            Back
          </Button>
          <Button
            variant="primary"
            size="sm"
            iconRight={<ArrowRight size={16} />}
            onClick={onNext}
            disabled={!allGranted}
          >
            {allGranted ? 'Start Interview' : 'Complete Setup'}
          </Button>
        </div>
      </div>
    </div>
  );
});

InterviewSetup.propTypes = {
  onNext: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};
