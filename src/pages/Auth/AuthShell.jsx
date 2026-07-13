import PropTypes from 'prop-types';
import { Check, ShieldCheck } from 'lucide-react';
import { AppLogo } from '../../components/ui/AppLogo';
import './AuthShell.css';

const DEFAULT_POINTS = [
  'Structured interviews tied to the role',
  'Candidate evidence kept in one workspace',
  'Clear review states for the hiring team',
];

export function AuthShell({ children, wide = false, points = DEFAULT_POINTS }) {
  return (
    <main className="auth-shell">
      <header className="auth-shell__header">
        <a href="/" className="auth-shell__home" aria-label="VU home">
          <AppLogo size="md" />
        </a>
        <span>Interview intelligence</span>
      </header>

      <div className={`auth-shell__stage${wide ? ' auth-shell__stage--wide' : ''}`}>
        <aside className="auth-shell__context" aria-label="About VU">
          <span className="auth-shell__eyebrow">
            <ShieldCheck size={14} aria-hidden="true" />
            VU workspace
          </span>
          <h2>Hiring evidence, kept in context.</h2>
          <p>Move from application to interview review without losing the signals behind a decision.</p>
          <ul>
            {points.map((point) => (
              <li key={point}>
                <Check size={15} aria-hidden="true" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </aside>

        <section className="auth-shell__panel">{children}</section>
      </div>

      <footer className="auth-shell__footer">
        <span>VU</span>
        <span>Secure hiring workspace</span>
      </footer>
    </main>
  );
}

AuthShell.propTypes = {
  children: PropTypes.node.isRequired,
  wide: PropTypes.bool,
  points: PropTypes.arrayOf(PropTypes.string),
};
