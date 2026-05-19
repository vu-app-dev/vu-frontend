import { useCallback, useMemo, useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  Globe2,
  Phone,
  UserRound,
  UserX,
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

function isEmailVerificationError(error) {
  const message = String(error?.message || error?.payload?.message || '').toLowerCase();
  return message.includes('verif');
}

function getErrorMessages(error) {
  const raw = error?.payload?.message ?? error?.message ?? '';
  const messages = Array.isArray(raw) ? raw : String(raw).split(',');
  return messages.map((message) => String(message).trim()).filter(Boolean);
}

function isLoginPasswordError(error) {
  return getErrorMessages(error).some((message) => {
    const lower = message.toLowerCase();
    return (
      lower.includes('password') &&
      (lower.includes('uppercase') ||
        lower.includes('lowercase') ||
        lower.includes('between') ||
        lower.includes('must contain') ||
        lower.includes('wrong'))
    );
  });
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function isValidUrl(value) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return Boolean(url.protocol.match(/^https?:$/) && url.hostname);
  } catch {
    return false;
  }
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
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function mapBackendFieldErrors(error) {
  const fieldErrors = {};
  getErrorMessages(error).forEach((message) => {
    const lower = message.toLowerCase();
    if (lower.includes('userinput.phone')) fieldErrors.phone = 'Enter a valid phone number.';
    else if (lower.includes('companyinput.website')) fieldErrors.website = 'Enter a valid URL.';
    else if (lower.includes('userinput.email')) fieldErrors.email = 'Enter a valid email.';
    else if (lower.includes('userinput.password')) fieldErrors.password = 'Check the password.';
    else if (lower.includes('userinput.confirmpassword'))
      fieldErrors.confirmPassword = 'Passwords must match.';
    else if (lower.includes('userinput.firstname')) fieldErrors.firstName = 'First name is required.';
    else if (lower.includes('userinput.lastname')) fieldErrors.lastName = 'Last name is required.';
    else if (lower.includes('companyinput.name')) fieldErrors.companyName = 'Company name is required.';
  });
  return fieldErrors;
}

function validateLoginForm(form) {
  const errors = {};
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!isValidEmail(form.email)) errors.email = 'Enter a valid email.';
  if (!form.password) errors.password = 'Password is required.';
  return errors;
}

function validateRegisterForm(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = 'First name is required.';
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!isValidEmail(form.email)) errors.email = 'Enter a valid email.';
  if (!form.phone.trim()) errors.phone = 'Phone is required.';
  else if (!PHONE_PATTERN.test(form.phone)) errors.phone = 'Enter a valid phone number.';
  if (form.website && !isValidUrl(form.website)) errors.website = 'Enter a valid URL.';
  if (form.password.length < 8 || form.password.length > 20) {
    errors.password = 'Password must be 8-20 characters.';
  } else if (!/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password)) {
    errors.password = 'Use uppercase and lowercase letters.';
  }
  if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords must match.';
  if (!form.companyName.trim()) errors.companyName = 'Company name is required.';
  return errors;
}

function validateVerifyForm(form) {
  const errors = {};
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!isValidEmail(form.email)) errors.email = 'Enter a valid email.';
  if (!form.code.trim()) errors.code = 'Verification code is required.';
  return errors;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || location.state?.from || '/candidates';
  const {
    authNotice,
    clearAuthNotice,
    isAuthenticated,
    login,
    registerManager,
    requestVerificationCode,
    verifyEmail,
  } = useBackendData();
  const [mode, setMode] = useState('login');
  const [loginForm, setLoginForm] = useState(EMPTY_LOGIN);
  const [registerForm, setRegisterForm] = useState(EMPTY_REGISTER);
  const [verifyForm, setVerifyForm] = useState({ email: '', code: '1234' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loginNotice, setLoginNotice] = useState(null);
  const [verifyHint, setVerifyHint] = useState('');

  const title = useMemo(() => {
    if (mode === 'register') return 'Create Workspace';
    if (mode === 'verify') return 'Verify Email';
    return 'Sign In';
  }, [mode]);

  const clearFieldError = useCallback((field) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const updateLogin = useCallback(
    (field, value) => {
      setLoginForm((form) => ({ ...form, [field]: value }));
      clearFieldError(field);
      setError('');
      setLoginNotice(null);
      clearAuthNotice?.();
    },
    [clearAuthNotice, clearFieldError]
  );

  const updateRegister = useCallback(
    (field, value) => {
      setRegisterForm((form) => ({ ...form, [field]: value }));
      clearFieldError(field);
      setError('');
    },
    [clearFieldError]
  );

  const updateRegisterPhone = useCallback(
    (value) => {
      updateRegister('phone', sanitizePhoneDraft(value));
    },
    [updateRegister]
  );

  const formatRegisterPhone = useCallback(() => {
    setRegisterForm((form) => {
      const phone = normalizePhoneInput(form.phone);
      return phone === form.phone ? form : { ...form, phone };
    });
  }, []);

  const formatRegisterWebsite = useCallback(() => {
    setRegisterForm((form) => {
      const website = normalizeWebsiteInput(form.website);
      return website === form.website ? form : { ...form, website };
    });
  }, []);

  const handleLogin = useCallback(
    async (event) => {
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
        } else if (isEmailVerificationError(err)) {
          const email = loginForm.email.trim();
          setVerifyForm({ email, code: '1234' });
          setVerifyHint('');
          try {
            await requestVerificationCode({
              email,
              useCase: 'EMAIL_VERIFICATION',
            });
          } catch {
            setVerifyHint('Development code: 1234.');
          }
          setMode('verify');
          setFieldErrors({});
        } else if (isLoginPasswordError(err)) {
          setFieldErrors({ password: 'Wrong password.' });
          setError('');
        } else {
          setError(err.message || 'Unable to sign in.');
        }
      } finally {
        setBusy(false);
      }
    },
    [login, loginForm, navigate, requestVerificationCode, returnTo]
  );

  const handleRegister = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');
      const normalizedForm = {
        ...registerForm,
        phone: normalizePhoneInput(registerForm.phone),
        website: normalizeWebsiteInput(registerForm.website),
      };
      const nextErrors = validateRegisterForm(normalizedForm);
      setFieldErrors(nextErrors);
      if (Object.keys(nextErrors).length) return;

      setRegisterForm(normalizedForm);
      setBusy(true);
      try {
        await registerManager({
          userInput: {
            email: normalizedForm.email,
            password: normalizedForm.password,
            confirmPassword: normalizedForm.confirmPassword,
            firstName: normalizedForm.firstName,
            lastName: normalizedForm.lastName,
            phone: normalizedForm.phone,
          },
          companyInput: {
            name: normalizedForm.companyName,
            industry: normalizedForm.industry,
            website: normalizedForm.website || undefined,
            phone: normalizedForm.companyPhone || undefined,
            description: normalizedForm.description || undefined,
          },
        });
        setVerifyForm({ email: normalizedForm.email, code: '1234' });
        setVerifyHint('Development code: 1234.');
        setMode('verify');
        setFieldErrors({});
      } catch (err) {
        const backendFieldErrors = mapBackendFieldErrors(err);
        if (Object.keys(backendFieldErrors).length) {
          setFieldErrors(backendFieldErrors);
          setError('');
        } else {
          setError(err.message || 'Unable to create workspace.');
        }
      } finally {
        setBusy(false);
      }
    },
    [registerForm, registerManager]
  );

  const handleVerify = useCallback(
    async (event) => {
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

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
    setFieldErrors({});
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
          <form className="auth-page__form" onSubmit={handleLogin} noValidate>
            <EmailInput
              label="Email"
              value={loginForm.email}
              onChange={(event) => updateLogin('email', event.target.value)}
              error={Boolean(fieldErrors.email)}
              hint={fieldErrors.email}
              required
            />
            <PasswordInput
              label="Password"
              value={loginForm.password}
              onChange={(event) => updateLogin('password', event.target.value)}
              error={Boolean(fieldErrors.password)}
              hint={fieldErrors.password}
              required
            />
            {error && <p className="auth-page__error">{error}</p>}
            <Button
              type="submit"
              variant="primary"
              loading={busy}
            >
              Sign In
            </Button>
            <button type="button" className="auth-page__link" onClick={() => switchMode('register')}>
              Create a company account
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form className="auth-page__form" onSubmit={handleRegister} noValidate>
            <div className="auth-page__grid">
              <TextInput
                label="First name"
                value={registerForm.firstName}
                onChange={(event) => updateRegister('firstName', event.target.value)}
                iconLeft={<UserRound size={16} />}
                error={Boolean(fieldErrors.firstName)}
                hint={fieldErrors.firstName}
                required
              />
              <TextInput
                label="Last name"
                value={registerForm.lastName}
                onChange={(event) => updateRegister('lastName', event.target.value)}
                iconLeft={<UserRound size={16} />}
                error={Boolean(fieldErrors.lastName)}
                hint={fieldErrors.lastName}
                required
              />
            </div>
            <EmailInput
              label="Email"
              value={registerForm.email}
              onChange={(event) => updateRegister('email', event.target.value)}
              error={Boolean(fieldErrors.email)}
              hint={fieldErrors.email}
              required
            />
            <TextInput
              label="Phone"
              value={registerForm.phone}
              onChange={(event) => updateRegisterPhone(event.target.value)}
              onBlur={formatRegisterPhone}
              placeholder="+201001234567"
              iconLeft={<Phone size={16} />}
              inputMode="tel"
              autoComplete="tel"
              error={Boolean(fieldErrors.phone)}
              hint={fieldErrors.phone}
              required
            />
            <div className="auth-page__grid">
              <PasswordInput
                label="Password"
                value={registerForm.password}
                onChange={(event) => updateRegister('password', event.target.value)}
                error={Boolean(fieldErrors.password)}
                hint={fieldErrors.password}
                required
              />
              <PasswordInput
                label="Confirm"
                value={registerForm.confirmPassword}
                onChange={(event) => updateRegister('confirmPassword', event.target.value)}
                error={Boolean(fieldErrors.confirmPassword)}
                hint={fieldErrors.confirmPassword}
                required
              />
            </div>
            <TextInput
              label="Company"
              value={registerForm.companyName}
              onChange={(event) => updateRegister('companyName', event.target.value)}
              iconLeft={<Building2 size={16} />}
              error={Boolean(fieldErrors.companyName)}
              hint={fieldErrors.companyName}
              required
            />
            <div className="auth-page__grid">
              <DropdownInput
                label="Industry"
                value={registerForm.industry}
                onChange={(value) => updateRegister('industry', value)}
                options={INDUSTRY_OPTIONS}
              />
              <TextInput
                label="Website"
                value={registerForm.website}
                onChange={(event) => updateRegister('website', event.target.value)}
                onBlur={formatRegisterWebsite}
                iconLeft={<Globe2 size={16} />}
                inputMode="url"
                autoComplete="url"
                error={Boolean(fieldErrors.website)}
                hint={fieldErrors.website}
              />
            </div>
            <Textarea
              label="Description"
              rows={3}
              value={registerForm.description}
              onChange={(event) => updateRegister('description', event.target.value)}
            />
            {error && <p className="auth-page__error">{error}</p>}
            <Button
              type="submit"
              variant="primary"
              loading={busy}
            >
              Create Workspace
            </Button>
            <button type="button" className="auth-page__link" onClick={() => switchMode('login')}>
              Back to sign in
            </button>
          </form>
        )}

        {mode === 'verify' && (
          <form className="auth-page__form" onSubmit={handleVerify} noValidate>
            <div className="auth-page__verify-icon">
              <CheckCircle2 size={24} />
            </div>
            <EmailInput
              label="Email"
              value={verifyForm.email}
              onChange={(event) => {
                setVerifyForm((form) => ({ ...form, email: event.target.value }));
                clearFieldError('email');
                setError('');
              }}
              error={Boolean(fieldErrors.email)}
              hint={fieldErrors.email}
              required
            />
            <TextInput
              label="Code"
              value={verifyForm.code}
              onChange={(event) => {
                setVerifyForm((form) => ({ ...form, code: event.target.value }));
                clearFieldError('code');
                setError('');
              }}
              error={Boolean(fieldErrors.code)}
              hint={fieldErrors.code || verifyHint}
              required
            />
            {error && <p className="auth-page__error">{error}</p>}
            <Button
              type="submit"
              variant="primary"
              loading={busy}
            >
              Verify
            </Button>
            <button type="button" className="auth-page__link" onClick={() => switchMode('login')}>
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
