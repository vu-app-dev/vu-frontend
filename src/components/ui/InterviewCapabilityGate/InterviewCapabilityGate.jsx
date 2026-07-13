import { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MonitorUp, ShieldCheck } from 'lucide-react';
import { AppLogo } from '../AppLogo';
import { supportsInterviewEnvironment } from './supportsInterviewEnvironment';
import './InterviewCapabilityGate.css';

export const InterviewCapabilityGate = memo(function InterviewCapabilityGate({ children }) {
  const [isSupported, setIsSupported] = useState(supportsInterviewEnvironment);

  useEffect(() => {
    const updateSupport = () => setIsSupported(supportsInterviewEnvironment());
    window.addEventListener('pageshow', updateSupport);
    updateSupport();
    return () => window.removeEventListener('pageshow', updateSupport);
  }, []);

  if (isSupported) return children;

  return (
    <main className="interview-capability-gate">
      <header className="interview-capability-gate__header">
        <AppLogo size="md" />
        <span>
          <ShieldCheck size={14} aria-hidden="true" />
          Secure interview
        </span>
      </header>
      <section className="interview-capability-gate__content" aria-labelledby="device-required-title">
        <div className="interview-capability-gate__icon" aria-hidden="true">
          <MonitorUp size={30} />
        </div>
        <p className="interview-capability-gate__eyebrow">Device requirement</p>
        <h1 id="device-required-title">Continue on a laptop or desktop</h1>
        <p>
          This interview requires camera, microphone, and full-screen sharing. Open this link in a
          supported desktop browser to continue.
        </p>
        <span className="interview-capability-gate__note">
          Your application details are already saved.
        </span>
      </section>
    </main>
  );
});

InterviewCapabilityGate.propTypes = {
  children: PropTypes.node.isRequired,
};
