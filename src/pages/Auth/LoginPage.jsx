import { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock3,
  Globe2,
  Phone,
  UserRound,
  UserX,
  Users,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import {
  DropdownInput,
  EmailInput,
  PasswordInput,
  Textarea,
  TextInput,
} from '../../components/ui/Input';
import {
  COMPANY_ACCESS_UNAVAILABLE_CODE,
  COMPANY_APPROVAL_PENDING_CODE,
  INDUSTRY_OPTIONS,
  useBackendData,
} from '../../api';
import { useVerificationResendCooldown } from './useVerificationResendCooldown';
import { AppLogo } from '../../components/ui/AppLogo';
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
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
const PHONE_EXAMPLE = '+201055667788';

function isEmailVerificationError(error) {
  const message = String(error?.message || error?.payload?.message || '').toLowerCase();
  return message.includes('verif');
}

function getErrorMessages(error) {
  const raw = error?.payload?.message ?? error?.message ?? '';
  const messages = Array.isArray(raw) ? raw : String(raw).split(',');
  return messages.map((m) => String(m).trim()).filter(Boolean);
}

function isLoginPasswordError(error) {
  return getErrorMessages(error).some((m) => {
    const l = m.toLowerCase();
    return l.includes('password') && (l.includes('uppercase') || l.includes('lowercase') || l.includes('between') || l.includes('must contain') || l.includes('wrong'));
  });
}

function isCredentialError(error) {
  return getErrorMessages(error).some((m) => {
    const l = m.toLowerCase();
    return l.includes('bad credentials') || l.includes('invalid credentials') || l.includes('invalid email') || l.includes('invalid password') || l.includes('email or password') || l.includes('unauthorized');
  });
}

function getFriendlyAuthError(error, fallback) {
  if (isCredentialError(error)) return 'Check your email and password, then try again.';
  const message = error?.message || fallback;
  if (String(message).toLowerCase().includes('bad credentials')) return 'Check your email and password, then try again.';
  return message;
}

function getFriendlyVerificationError(error, fallback = 'Unable to verify email.') {
  const message = error?.message || fallback;
  const lower = String(message).toLowerCase();
  if (lower.includes('bad credentials') || lower.includes('invalid') || lower.includes('wrong')) return 'That code is not valid. Check the latest email and try again.';
  if (lower.includes('expired')) return 'That code expired. Please resend a new one.';
  return message;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function isValidUrl(value) {
  if (!value) return true;
  try { const u = new URL(value); return Boolean(u.protocol.match(/^https?:$/) && u.hostname); } catch { return false; }
}

function sanitizePhoneDraft(value) {
  return String(value || '').replace(/[^\d+\s().-]/g, '');
}

function normalizePhoneInput(value) {
  const compact = sanitizePhoneDraft(value).replace(/[\s().-]/g, '');
  if (!compact) return '';
  if (compact.startsWith('00')) return `+${compact.slice(2)}`;
  if (compact.startsWith('+')) return `+${compact.slice(1).replace(/\+/g, '')}`;
  if (/^01\d{9}$/.test(compact)) return `+2${compact}`;
  return `+${compact.replace(/\+/g, '')}`;
}

function normalizeWebsiteInput(value) {
  const t = String(value || '').trim();
  if (!t) return '';
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

function mapBackendFieldErrors(error) {
  const fe = {};
  getErrorMessages(error).forEach((m) => {
    const l = m.toLowerCase();
    if (l.includes('userinput.phone')) fe.phone = 'Enter a valid phone number.';
    else if (l.includes('companyinput.website')) fe.website = 'Enter a valid URL.';
    else if (l.includes('userinput.email')) fe.email = 'Enter a valid email.';
    else if (l.includes('userinput.password')) fe.password = 'Check the password.';
    else if (l.includes('userinput.confirmpassword')) fe.confirmPassword = 'Passwords must match.';
    else if (l.includes('userinput.firstname')) fe.firstName = 'First name is required.';
    else if (l.includes('userinput.lastname')) fe.lastName = 'Last name is required.';
    else if (l.includes('companyinput.name')) fe.companyName = 'Company name is required.';
  });
  return fe;
}

function validateLoginForm(form) {
  const e = {};
  if (!form.email.trim()) e.email = 'Email is required.';
  else if (!isValidEmail(form.email)) e.email = 'Enter a valid email.';
  if (!form.password) e.password = 'Password is required.';
  return e;
}

function validateRegisterForm(form) {
  const e = {};
  if (!form.firstName.trim()) e.firstName = 'First name is required.';
  if (!form.lastName.trim()) e.lastName = 'Last name is required.';
  if (!form.email.trim()) e.email = 'Email is required.';
  else if (!isValidEmail(form.email)) e.email = 'Enter a valid email.';
  if (!form.phone.trim()) e.phone = 'Phone is required.';
  else if (!PHONE_PATTERN.test(form.phone)) e.phone = 'Enter a valid phone number.';
  if (form.website && !isValidUrl(form.website)) e.website = 'Enter a valid URL.';
  if (form.password.length < 8 || form.password.length > 20) e.password = 'Password must be 8–20 characters.';
  else if (!/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password)) e.password = 'Use uppercase and lowercase letters.';
  if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords must match.';
  if (!form.companyName.trim()) e.companyName = 'Company name is required.';
  return e;
}

function validateVerifyForm(form) {
  const e = {};
  if (!form.email.trim()) e.email = 'Email is required.';
  else if (!isValidEmail(form.email)) e.email = 'Enter a valid email.';
  if (!form.code.trim()) e.code = 'Verification code is required.';
  return e;
}

const BRAND_FEATURES = [
  { icon: Users, text: 'Manage your entire hiring pipeline in one place' },
  { icon: ClipboardCheck, text: 'AI-powered mock interviews and candidate scoring' },
  { icon: Building2, text: 'Publish jobs and track applicants automatically' },
];

function BrandPanel() {
  return (
    <aside className="auth-root__brand">
      <div className="auth-root__blob auth-root__blob--1" />
      <div className="auth-root__blob auth-root__blob--2" />
      <div className="auth-root__brand-top">
        <AppLogo size="sm" />
      </div>
      <div className="auth-root__brand-body">
        <h2 className="auth-root__brand-heading">Hire smarter,<br />move faster.</h2>
        <p className="auth-root__brand-sub">The all-in-one hiring workspace built for modern teams.</p>
        <div className="auth-root__feature-list">
          {BRAND_FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="auth-root__feature">
              <div className="auth-root__feature-icon"><Icon size={14} /></div>
              {text}
            </div>
          ))}
        </div>
      </div>
      <div className="auth-root__brand-bottom">© {new Date().getFullYear()} VU · All rights reserved</div>
    </aside>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || location.state?.from || '/candidates';
  const { authNotice, clearAuthNotice, isAuthenticated, login, registerManager, requestVerificationCode, verifyEmail } = useBackendData();

  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN);
  const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER);
  const [verifyForm, setVerifyForm] = useState({ email: '', code: '' });
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loginNotice, setLoginNotice] = useState(null);
  const [verifyHint, setVerifyHint] = useState('');
  const [showVerifyRecovery, setShowVerifyRecovery] = useState(false);
  const { resendSeconds, canResendCode, startResendCooldown, resetResendCooldown } = useVerificationResendCooldown();

  const eyebrow = useMemo(() => {
    if (mode === 'register') return 'New workspace';
    if (mode === 'verify') return 'Email verification';
    return 'Welcome back';
  }, [mode]);

  const title = useMemo(() => {
    if (mode === 'register') return 'Create your workspace';
    if (mode === 'verify') return 'Verify your email';
    return 'Sign in to VU';
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === 'register') return 'Set up your company account and start hiring.';
    if (mode === 'verify') return 'Enter the code we sent to your inbox.';
    return 'Enter your credentials to access your workspace.';
  }, [mode]);

  const clearFieldError = useCallback((field) => {
    setFieldErrors((c) => { if (!c[field]) return c; const n = { ...c }; delete n[field]; return n; });
  }, []);

  const updateLogin = useCallback((field, value) => {
    setLoginForm((f) => ({ ...f, [field]: value }));
    clearFieldError(field);
    setError('');
    setLoginNotice(null);
    setShowVerifyRecovery(false);
    clearAuthNotice?.();
  }, [clearAuthNotice, clearFieldError]);

  const updateRegister = useCallback((field, value) => {
    setRegisterForm((f) => ({ ...f, [field]: value }));
    clearFieldError(field);
    setError('');
  }, [clearFieldError]);

  const sendVerificationCode = useCallback(async (email, successMessage = 'We sent a verification code. Check your inbox.') => {
    const normalized = String(email || '').trim();
    if (!normalized || !isValidEmail(normalized)) {
      setFieldErrors((c) => ({ ...c, email: !normalized ? 'Email is required.' : 'Enter a valid email.' }));
      return false;
    }
    await requestVerificationCode({ email: normalized, useCase: 'EMAIL_VERIFICATION' });
    startResendCooldown();
    setVerifyHint(successMessage);
    return true;
  }, [requestVerificationCode, startResendCooldown]);

  const openVerificationForEmail = useCallback(async (email) => {
    const normalized = String(email || '').trim();
    setVerifyForm({ email: normalized, code: '' });
    setMode('verify');
    setFieldErrors({});
    setError('');
    setVerifyHint('');
    resetResendCooldown();
    try {
      await sendVerificationCode(normalized);
    } catch (err) {
      setVerifyHint('Could not send a code automatically. Try Resend.');
      setError(err.message || 'Unable to send a verification code.');
    }
  }, [resetResendCooldown, sendVerificationCode]);

  const handleLogin = useCallback(async (event) => {
    event.preventDefault();
    setError('');
    const nextErrors = validateLoginForm(loginForm);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setBusy(true);
    try {
      await login(loginForm);
      navigate(returnTo, { replace: true });
    } catch (err) {
      if (err.code === COMPANY_APPROVAL_PENDING_CODE) {
        setLoginNotice({ type: 'pending', title: 'Waiting for approval', message: 'Your request is created, but an owner must accept it before you can sign in.' });
      } else if (err.code === COMPANY_ACCESS_UNAVAILABLE_CODE) {
        setLoginNotice({ type: 'unavailable', title: 'Access unavailable', message: 'Your company access was removed. Contact the owner if this is a mistake.' });
      } else if (isEmailVerificationError(err)) {
        await openVerificationForEmail(loginForm.email.trim());
      } else if (isLoginPasswordError(err)) {
        setFieldErrors({ password: 'Wrong password.' });
      } else {
        setShowVerifyRecovery(isCredentialError(err) && isValidEmail(loginForm.email));
        setError(getFriendlyAuthError(err, 'Unable to sign in.'));
      }
    } finally {
      setBusy(false);
    }
  }, [login, loginForm, navigate, openVerificationForEmail, returnTo]);

  const handleRegister = useCallback(async (event) => {
    event.preventDefault();
    setError('');
    const normalized = { ...registerForm, phone: normalizePhoneInput(registerForm.phone), website: normalizeWebsiteInput(registerForm.website) };
    const nextErrors = validateRegisterForm(normalized);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setRegisterForm(normalized);
    setBusy(true);
    try {
      await registerManager({
        userInput: { email: normalized.email, password: normalized.password, confirmPassword: normalized.confirmPassword, firstName: normalized.firstName, lastName: normalized.lastName, phone: normalized.phone },
        companyInput: { name: normalized.companyName, industry: normalized.industry, website: normalized.website || undefined, phone: normalized.companyPhone || undefined, description: normalized.description || undefined },
      });
      setVerifyForm({ email: normalized.email, code: '' });
      setVerifyHint('');
      setMode('verify');
      setFieldErrors({});
      try {
        await sendVerificationCode(normalized.email, 'Workspace created. Check your email for the verification code.');
      } catch (err) {
        setVerifyHint('Workspace created, but we could not send the code. Try Resend.');
        setError(err.message || 'Unable to send a verification code.');
      }
    } catch (err) {
      const be = mapBackendFieldErrors(err);
      if (Object.keys(be).length) { setFieldErrors(be); setError(''); }
      else setError(err.message || 'Unable to create workspace.');
    } finally {
      setBusy(false);
    }
  }, [registerForm, registerManager, sendVerificationCode]);

  const handleResend = useCallback(async () => {
    setError('');
    setResending(true);
    try { await sendVerificationCode(verifyForm.email, 'New code sent.'); }
    catch (err) { setError(err.message || 'Unable to resend the code.'); }
    finally { setResending(false); }
  }, [sendVerificationCode, verifyForm.email]);

  const handleVerify = useCallback(async (event) => {
    event.preventDefault();
    setError('');
    const nextErrors = validateVerifyForm(verifyForm);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setBusy(true);
    try {
      await verifyEmail(verifyForm);
      navigate(returnTo, { replace: true });
    } catch (err) {
      setError(getFriendlyVerificationError(err));
    } finally {
      setBusy(false);
    }
  }, [navigate, verifyEmail, verifyForm, returnTo]);

  const switchMode = useCallback((next) => {
    setMode(next);
    setError('');
    setFieldErrors({});
    setLoginNotice(null);
    setShowVerifyRecovery(false);
    if (next !== 'verify') { setVerifyHint(''); resetResendCooldown(); }
    clearAuthNotice?.();
  }, [clearAuthNotice, resetResendCooldown]);

  const authDialog = loginNotice || authNotice;

  if (isAuthenticated) return <Navigate to="/candidates" replace />;

  return (
    <div className="auth-root">
      <BrandPanel />

      <div className="auth-root__form-panel">
        <div className={`auth-card${mode === 'register' ? ' auth-card--wide' : ''}`}>
          <div className="auth-card__header">
            <span className="auth-card__eyebrow">{eyebrow}</span>
            <h1 className="auth-card__title">{title}</h1>
            <p className="auth-card__subtitle">{subtitle}</p>
          </div>

          {mode === 'login' && (
            <form className="auth-card__form" onSubmit={handleLogin} noValidate>
              <EmailInput label="Email" value={loginForm.email} onChange={(e) => updateLogin('email', e.target.value)} error={Boolean(fieldErrors.email)} hint={fieldErrors.email} required />
              <PasswordInput label="Password" value={loginForm.password} onChange={(e) => updateLogin('password', e.target.value)} error={Boolean(fieldErrors.password)} hint={fieldErrors.password} required />
              {error && (
                <div className="auth-card__error">
                  <AlertCircle size={15} className="auth-card__error-icon" />
                  {error}
                </div>
              )}
              {showVerifyRecovery && (
                <Button type="button" variant="secondary" size="lg" onClick={() => openVerificationForEmail(loginForm.email)} disabled={busy}>
                  Verify this email instead
                </Button>
              )}
              <Button type="submit" variant="primary" size="lg" loading={busy}>Sign in</Button>
              <div className="auth-card__footer">
                <span>Don&apos;t have a workspace?</span>
                <button type="button" className="auth-card__link" onClick={() => switchMode('register')}>Create one</button>
              </div>
            </form>
          )}

          {mode === 'register' && (
            <form className="auth-card__form" onSubmit={handleRegister} noValidate>
              <span className="auth-card__section-label">Personal info</span>
              <div className="auth-card__row">
                <TextInput label="First name" value={registerForm.firstName} onChange={(e) => updateRegister('firstName', e.target.value)} iconLeft={<UserRound size={15} />} error={Boolean(fieldErrors.firstName)} hint={fieldErrors.firstName} required />
                <TextInput label="Last name" value={registerForm.lastName} onChange={(e) => updateRegister('lastName', e.target.value)} iconLeft={<UserRound size={15} />} error={Boolean(fieldErrors.lastName)} hint={fieldErrors.lastName} required />
              </div>
              <EmailInput label="Email" value={registerForm.email} onChange={(e) => updateRegister('email', e.target.value)} error={Boolean(fieldErrors.email)} hint={fieldErrors.email} required />
              <TextInput label="Phone" value={registerForm.phone} onChange={(e) => updateRegister('phone', sanitizePhoneDraft(e.target.value))} onBlur={() => setRegisterForm((f) => ({ ...f, phone: normalizePhoneInput(f.phone) }))} placeholder={PHONE_EXAMPLE} iconLeft={<Phone size={15} />} inputMode="tel" autoComplete="tel" error={Boolean(fieldErrors.phone)} hint={fieldErrors.phone} required />
              <div className="auth-card__row">
                <PasswordInput label="Password" value={registerForm.password} onChange={(e) => updateRegister('password', e.target.value)} error={Boolean(fieldErrors.password)} hint={fieldErrors.password} required />
                <PasswordInput label="Confirm password" value={registerForm.confirmPassword} onChange={(e) => updateRegister('confirmPassword', e.target.value)} error={Boolean(fieldErrors.confirmPassword)} hint={fieldErrors.confirmPassword} required />
              </div>
              <span className="auth-card__section-label">Company info</span>
              <TextInput label="Company name" value={registerForm.companyName} onChange={(e) => updateRegister('companyName', e.target.value)} iconLeft={<Building2 size={15} />} error={Boolean(fieldErrors.companyName)} hint={fieldErrors.companyName} required />
              <div className="auth-card__row">
                <DropdownInput label="Industry" value={registerForm.industry} onChange={(v) => updateRegister('industry', v)} options={INDUSTRY_OPTIONS} />
                <TextInput label="Website" value={registerForm.website} onChange={(e) => updateRegister('website', e.target.value)} onBlur={() => setRegisterForm((f) => ({ ...f, website: normalizeWebsiteInput(f.website) }))} iconLeft={<Globe2 size={15} />} inputMode="url" autoComplete="url" error={Boolean(fieldErrors.website)} hint={fieldErrors.website} />
              </div>
              <Textarea label="Company description" rows={3} value={registerForm.description} onChange={(e) => updateRegister('description', e.target.value)} />
              {error && (
                <div className="auth-card__error">
                  <AlertCircle size={15} className="auth-card__error-icon" />
                  {error}
                </div>
              )}
              <Button type="submit" variant="primary" size="lg" loading={busy}>Create workspace</Button>
              <div className="auth-card__footer">
                <span>Already have access?</span>
                <button type="button" className="auth-card__link" onClick={() => switchMode('login')}>Sign in</button>
              </div>
            </form>
          )}

          {mode === 'verify' && (
            <form className="auth-card__form" onSubmit={handleVerify} noValidate>
              <div className="auth-card__verify-icon">
                <CheckCircle2 size={26} />
              </div>
              <EmailInput label="Email" value={verifyForm.email} onChange={(e) => { setVerifyForm((f) => ({ ...f, email: e.target.value })); clearFieldError('email'); setError(''); }} error={Boolean(fieldErrors.email)} hint={fieldErrors.email} required />
              <TextInput label="Verification code" value={verifyForm.code} onChange={(e) => { setVerifyForm((f) => ({ ...f, code: e.target.value })); clearFieldError('code'); setError(''); }} hint={fieldErrors.code || verifyHint} error={Boolean(fieldErrors.code)} required />
              {error && (
                <div className="auth-card__error">
                  <AlertCircle size={15} className="auth-card__error-icon" />
                  {error}
                </div>
              )}
              <div className="auth-card__verify-actions">
                <Button type="submit" variant="primary" size="lg" loading={busy}>Verify email</Button>
                <Button type="button" variant="secondary" size="lg" loading={resending} disabled={!canResendCode || busy} onClick={handleResend}>
                  {canResendCode ? 'Resend code' : `Resend in ${resendSeconds}s`}
                </Button>
              </div>
              <div className="auth-card__footer">
                <button type="button" className="auth-card__link" onClick={() => switchMode('login')}>Back to sign in</button>
              </div>
            </form>
          )}
        </div>
      </div>

      {authDialog && (
        <div className="auth-dialog-backdrop" role="presentation">
          <div className="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="auth-notice-title">
            <div className="auth-dialog__icon">
              {authDialog.type === 'unavailable' ? <UserX size={22} /> : <Clock3 size={22} />}
            </div>
            <h2 id="auth-notice-title" className="auth-dialog__title">{authDialog.title}</h2>
            <p className="auth-dialog__message">{authDialog.message}</p>
            <Button variant="primary" size="lg" onClick={() => { setLoginNotice(null); clearAuthNotice?.(); }}>Got it</Button>
          </div>
        </div>
      )}
    </div>
  );
}
