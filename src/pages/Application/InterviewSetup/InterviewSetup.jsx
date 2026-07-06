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
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { setScreenShareStream } from './screenShareStream';
import './InterviewSetup.css';

const CHECK = { idle: 'idle', checking: 'checking', granted: 'granted', denied: 'denied' };

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
    description: 'Share your full screen for integrity monitoring',
    Icon: Monitor,
    request: async () => {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
        },
        audio: false,
        monitorTypeSurfaces: 'include',
        selfBrowserSurface: 'exclude',
        surfaceSwitching: 'exclude',
      });
      const displaySurface = stream.getVideoTracks()[0]?.getSettings?.().displaySurface;
      if (displaySurface && displaySurface !== 'monitor') {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error('Please share your full screen, not a window or browser tab.');
      }
      setScreenShareStream(stream);
      return stream;
    },
  },
];

const GUIDELINES = ['Quiet space', 'Stable internet', 'Full-screen share only'];

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
  const progressPercent = Math.round((checkedCount / DEVICES.length) * 100);

  return (
    <div className="interview-setup">
      <div className="interview-setup__body">
        <section className="interview-setup__panel">
          <div className="interview-setup__intro">
            <span className="interview-setup__eyebrow">Interview setup</span>
            <h2>Prepare your device before the interview starts</h2>
            <p>
              Complete each permission check now so the live session can begin without interruption.
            </p>
          </div>

          <div className="interview-setup__progress" aria-label="Device check progress">
            <div className="interview-setup__progress-header">
              <span>
                {checkedCount} of {DEVICES.length} checks ready
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="interview-setup__progress-track">
              <div
                className="interview-setup__progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="interview-setup__checks">
            {DEVICES.map((device) => {
              const state = deviceState[device.key];
              const DeviceIcon = device.Icon;
              return (
                <div
                  key={device.key}
                  className={`interview-setup__check-row interview-setup__check-row--${state}`}
                >
                  <div className="interview-setup__check-left">
                    <div className="interview-setup__check-icon-wrap">
                      <DeviceIcon size={17} />
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
                      <Button variant="secondary" size="sm" onClick={() => checkDevice(device)}>
                        {state === CHECK.denied ? 'Retry' : 'Test'}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="interview-setup__guidelines-panel">
          <h2 className="interview-setup__section-label">Before you start</h2>
          <div className="interview-setup__guidelines">
            {GUIDELINES.map((text) => (
              <div key={text} className="interview-setup__guideline">
                <span className="interview-setup__guideline-icon">
                  <ShieldCheck size={14} />
                </span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="interview-setup__sticky-bar">
        <span
          className={`interview-setup__bar-status ${allGranted ? 'interview-setup__bar-status--ready' : ''}`}
        >
          {allGranted ? 'All devices ready' : `${checkedCount}/3 devices checked`}
        </span>
        <div className="interview-setup__bar-actions">
          <Button variant="ghost" size="sm" iconLeft={<ArrowLeft size={16} />} onClick={onBack}>
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
