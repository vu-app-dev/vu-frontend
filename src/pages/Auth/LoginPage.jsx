import { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, CheckCircle2, Clock3, Loader2, UserX } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  COMPANY_ACCESS_UNAVAILABLE_CODE,
  COMPANY_APPROVAL_PENDING_CODE,
  INDUSTRY_OPTIONS,
  useBackendData,
} from '../../api';
import './LoginPage.css';

const EMPTY_LOGIN = { email: '', password: '' };
const EMPTY_REGISTER = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phone: '',
  companyName: '',
  industry: 'Tech',
  website: '',
  companyPhone: '',
  description: '',
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || location.state?.from || '/candidates';
  const { authNotice, clearAuthNotice, isAuthenticated, login, registerManager, verifyEmail } =
    useBackendData();
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN);
  const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER);
  const [verifyForm, setVerifyForm] = useState({ email: '', code: '1234' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loginNotice, setLoginNotice] = useState(null);

  const title = useMemo(() => {
    if (mode === 'register') return 'Create Workspace';
    if (mode === 'verify') return 'Verify Email';
    return 'Sign In';
  }, [mode]);

  const updateLogin = useCallback(
    (field, value) => {
      setLoginForm((form) => ({ ...form, [field]: value }));
      setError('');
      setLoginNotice(null);
      clearAuthNotice?.();
    },
    [clearAuthNotice]
  );

  const updateRegister = useCallback((field, value) => {
    setRegisterForm((form) => ({ ...form, [field]: value }));
    setError('');
  }, []);

  const handleLogin = useCallback(
    async (event) => {
      event.preventDefault();
      setBusy(true);
      setError('');
      try {
        await login(loginForm);
        navigate(returnTo, { replace: true });
      } catch (err) {
        if (err.code === COMPANY_APPROVAL_PENDING_CODE) {
          setLoginNotice({
            type: 'pending',
            title: 'Waiting for owner approval',
            message:
              'Your company request is created, but an owner must accept it before you can sign in to this workspace.',
          });
        } else if (err.code === COMPANY_ACCESS_UNAVAILABLE_CODE) {
          setLoginNotice({
            type: 'unavailable',
            title: 'Company access unavailable',
            message:
              'Your company access was removed or your join request was declined. Contact the company owner if this is a mistake.',
          });
        } else {
          setError(err.message || 'Unable to sign in.');
        }
      } finally {
        setBusy(false);
      }
    },
    [login, loginForm, navigate, returnTo]
  );

  const handleRegister = useCallback(
    async (event) => {
      event.preventDefault();
      setBusy(true);
      setError('');
      try {
        await registerManager({
          userInput: {
            email: registerForm.email,
            password: registerForm.password,
            confirmPassword: registerForm.confirmPassword,
            firstName: registerForm.firstName,
            lastName: registerForm.lastName,
            phone: registerForm.phone,
          },
          companyInput: {
            name: registerForm.companyName,
            industry: registerForm.industry,
            website: registerForm.website || undefined,
            phone: registerForm.companyPhone || undefined,
            description: registerForm.description || undefined,
          },
        });
        setVerifyForm({ email: registerForm.email, code: '1234' });
        setMode('verify');
      } catch (err) {
        setError(err.message || 'Unable to create workspace.');
      } finally {
        setBusy(false);
      }
    },
    [registerForm, registerManager]
  );

  const handleVerify = useCallback(
    async (event) => {
      event.preventDefault();
      setBusy(true);
      setError('');
      try {
        await verifyEmail(verifyForm);
        navigate(returnTo, { replace: true });
      } catch (err) {
        setError(err.message || 'Unable to verify email.');
      } finally {
        setBusy(false);
      }
    },
    [navigate, verifyEmail, verifyForm, returnTo]
  );

  const authDialog = loginNotice || authNotice;
  const handleAuthDialogClose = () => {
    setLoginNotice(null);
    clearAuthNotice?.();
  };

  if (isAuthenticated) {
    return <Navigate to="/candidates" replace />;
  }

  return (
    <main className="auth-page">
      <section className="auth-page__panel">
        <div className="auth-page__brand">
          <div className="auth-page__mark">
            <Briefcase size={22} />
          </div>
          <div>
            <h1 className="auth-page__title">{title}</h1>
            <p className="auth-page__subtitle">VU hiring workspace</p>
          </div>
        </div>

        {mode === 'login' && (
          <form className="auth-page__form" onSubmit={handleLogin}>
            <label className="auth-page__field">
              <span>Email</span>
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) => updateLogin('email', event.target.value)}
                required
              />
            </label>
            <label className="auth-page__field">
              <span>Password</span>
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) => updateLogin('password', event.target.value)}
                required
              />
            </label>
            {error && <p className="auth-page__error">{error}</p>}
            <Button
              type="submit"
              variant="primary"
              disabled={busy}
              iconLeft={busy ? <Loader2 size={14} /> : null}
            >
              Sign In
            </Button>
            <button type="button" className="auth-page__link" onClick={() => setMode('register')}>
              Create a company account
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form className="auth-page__form" onSubmit={handleRegister}>
            <div className="auth-page__grid">
              <label className="auth-page__field">
                <span>First name</span>
                <input
                  value={registerForm.firstName}
                  onChange={(event) => updateRegister('firstName', event.target.value)}
                  required
                />
              </label>
              <label className="auth-page__field">
                <span>Last name</span>
                <input
                  value={registerForm.lastName}
                  onChange={(event) => updateRegister('lastName', event.target.value)}
                  required
                />
              </label>
            </div>
            <label className="auth-page__field">
              <span>Email</span>
              <input
                type="email"
                value={registerForm.email}
                onChange={(event) => updateRegister('email', event.target.value)}
                required
              />
            </label>
            <label className="auth-page__field">
              <span>Phone</span>
              <input
                value={registerForm.phone}
                onChange={(event) => updateRegister('phone', event.target.value)}
                placeholder="+201001234567"
                required
              />
            </label>
            <div className="auth-page__grid">
              <label className="auth-page__field">
                <span>Password</span>
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => updateRegister('password', event.target.value)}
                  required
                />
              </label>
              <label className="auth-page__field">
                <span>Confirm</span>
                <input
                  type="password"
                  value={registerForm.confirmPassword}
                  onChange={(event) => updateRegister('confirmPassword', event.target.value)}
                  required
                />
              </label>
            </div>
            <label className="auth-page__field">
              <span>Company</span>
              <input
                value={registerForm.companyName}
                onChange={(event) => updateRegister('companyName', event.target.value)}
                required
              />
            </label>
            <div className="auth-page__grid">
              <label className="auth-page__field">
                <span>Industry</span>
                <select
                  value={registerForm.industry}
                  onChange={(event) => updateRegister('industry', event.target.value)}
                >
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <option key={industry.value} value={industry.value}>
                      {industry.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="auth-page__field">
                <span>Website</span>
                <input
                  value={registerForm.website}
                  onChange={(event) => updateRegister('website', event.target.value)}
                />
              </label>
            </div>
            <label className="auth-page__field">
              <span>Description</span>
              <textarea
                rows={3}
                value={registerForm.description}
                onChange={(event) => updateRegister('description', event.target.value)}
              />
            </label>
            {error && <p className="auth-page__error">{error}</p>}
            <Button
              type="submit"
              variant="primary"
              disabled={busy}
              iconLeft={busy ? <Loader2 size={14} /> : null}
            >
              Create Workspace
            </Button>
            <button type="button" className="auth-page__link" onClick={() => setMode('login')}>
              Back to sign in
            </button>
          </form>
        )}

        {mode === 'verify' && (
          <form className="auth-page__form" onSubmit={handleVerify}>
            <div className="auth-page__verify-icon">
              <CheckCircle2 size={24} />
            </div>
            <label className="auth-page__field">
              <span>Email</span>
              <input
                type="email"
                value={verifyForm.email}
                onChange={(event) =>
                  setVerifyForm((form) => ({ ...form, email: event.target.value }))
                }
                required
              />
            </label>
            <label className="auth-page__field">
              <span>Code</span>
              <input
                value={verifyForm.code}
                onChange={(event) =>
                  setVerifyForm((form) => ({ ...form, code: event.target.value }))
                }
                required
              />
            </label>
            {error && <p className="auth-page__error">{error}</p>}
            <Button
              type="submit"
              variant="primary"
              disabled={busy}
              iconLeft={busy ? <Loader2 size={14} /> : null}
            >
              Verify
            </Button>
            <button type="button" className="auth-page__link" onClick={() => setMode('login')}>
              Back to sign in
            </button>
          </form>
        )}
      </section>
      {authDialog && (
        <div className="auth-page__dialog-backdrop" role="presentation">
          <div
            className="auth-page__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-notice-title"
          >
            <div className="auth-page__dialog-icon">
              {authDialog.type === 'unavailable' ? <UserX size={22} /> : <Clock3 size={22} />}
            </div>
            <h2 id="auth-notice-title">{authDialog.title}</h2>
            <p>{authDialog.message}</p>
            <Button variant="primary" onClick={handleAuthDialogClose}>
              Got it
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
