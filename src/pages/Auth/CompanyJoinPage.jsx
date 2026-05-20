import { useCallback, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Building2, CheckCircle2, Mail, Phone, UserRound } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { EmailInput, PasswordInput, TextInput } from '../../components/ui/Input';
import {
  joinCompany as requestCompanyJoin,
  requestVerificationCode,
  verifyEmail as verifyJoinEmail,
} from '../../api';
import { useVerificationResendCooldown } from './useVerificationResendCooldown';
import './LoginPage.css';
import './CompanyJoinPage.css';

const JOIN_FORM_INITIAL = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phone: '',
};

const PHONE_EXAMPLE = '+201055667788';
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizePhoneInput(value) {
  const compact = value.replace(/[\s().-]/g, '').replace(/[^\d+]/g, '');
  if (!compact) return '';
  if (compact.startsWith('00')) return `+${compact.slice(2)}`;
  if (compact.startsWith('+')) return `+${compact.slice(1).replace(/\+/g, '')}`;
  return `+${compact.replace(/\+/g, '')}`;
}

function validateJoinForm(form) {
  const errors = {};
  if (!form.firstName.trim()) errors.firstName = 'First name is required.';
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.';
  if (!form.email.trim()) errors.email = 'Email is required.';
  else if (!EMAIL_PATTERN.test(form.email.trim())) errors.email = 'Enter a valid email.';
  if (!form.phone.trim()) errors.phone = 'Phone is required.';
  else if (!PHONE_PATTERN.test(form.phone.trim())) {
    errors.phone = `Use international format like ${PHONE_EXAMPLE}.`;
  }
  if (form.password.length < 8 || form.password.length > 20) {
    errors.password = 'Password must be 8-20 characters.';
  } else if (!/[a-z]/.test(form.password) || !/[A-Z]/.test(form.password)) {
    errors.password = 'Password needs uppercase and lowercase letters.';
  }
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords must match.';
  }
  return errors;
}

function toJoinInput(form) {
  const input = {
    email: form.email.trim(),
    password: form.password,
    confirmPassword: form.confirmPassword,
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    phone: form.phone.trim(),
  };

  return input;
}

export function CompanyJoinPage() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState('join');
  const [form, setForm] = useState(JOIN_FORM_INITIAL);
  const [verifyCode, setVerifyCode] = useState('');
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { resendSeconds, canResendCode, startResendCooldown } = useVerificationResendCooldown();

  const updateField = useCallback((field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setError('');
  }, []);

  const updatePhone = useCallback(
    (value) => {
      updateField('phone', normalizePhoneInput(value));
    },
    [updateField]
  );

  const sendJoinVerificationCode = useCallback(
    async (email, successMessage = 'We sent a verification code to your email.') => {
      const normalizedEmail = String(email || '').trim();
      await requestVerificationCode({
        email: normalizedEmail,
        useCase: 'EMAIL_VERIFICATION',
      });
      startResendCooldown();
      setNotice(successMessage);
    },
    [startResendCooldown]
  );

  const handleJoinSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      const nextErrors = validateJoinForm(form);
      setErrors(nextErrors);
      setError('');
      setNotice('');
      if (Object.keys(nextErrors).length) return;

      setIsSubmitting(true);
      try {
        const input = toJoinInput(form);
        await requestCompanyJoin(companyId, input);
        try {
          await sendJoinVerificationCode(input.email);
        } catch (err) {
          setNotice('The join request was created, but we could not send the code. Try Resend code.');
          setError(err.message || 'Unable to send a verification code.');
        }
        setVerifyCode('');
        setStep('verify');
      } catch (err) {
        setError(err.message || 'Unable to send the company join request.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [companyId, form, sendJoinVerificationCode]
  );

  const handleResendVerificationCode = useCallback(async () => {
    setError('');
    setIsResending(true);
    try {
      await sendJoinVerificationCode(form.email, 'We sent a new verification code.');
    } catch (err) {
      setError(err.message || 'Unable to resend the verification code.');
    } finally {
      setIsResending(false);
    }
  }, [form.email, sendJoinVerificationCode]);

  const handleVerifySubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError('');
      if (!verifyCode.trim()) {
        setErrors((current) => ({ ...current, code: 'Verification code is required.' }));
        return;
      }
      setIsSubmitting(true);
      try {
        await verifyJoinEmail(
          {
            email: form.email.trim(),
            code: verifyCode.trim(),
          },
          { requireToken: false, storeToken: false }
        );
        setStep('done');
      } catch (err) {
        setError(err.message || 'Unable to verify this email.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [form.email, verifyCode]
  );

  return (
    <main className="auth-page company-join">
      <section className="auth-page__panel company-join__panel">
        <div className="auth-page__brand">
          <div className="auth-page__mark">
            {step === 'done' ? <CheckCircle2 size={22} /> : <Building2 size={22} />}
          </div>
          <div>
            <h1 className="auth-page__title">
              {step === 'done' ? 'Request submitted' : 'Request company access'}
            </h1>
            <p className="auth-page__subtitle">
              {step === 'verify'
                ? 'Verify your email to finish sending the access request.'
                : step === 'done'
                  ? 'The company team can now review your request.'
                  : 'Create your account and ask to join this workspace.'}
            </p>
          </div>
        </div>

        {step === 'join' && (
          <form className="auth-page__form" onSubmit={handleJoinSubmit}>
            <div className="auth-page__grid">
              <TextInput
                label="First name"
                value={form.firstName}
                onChange={(event) => updateField('firstName', event.target.value)}
                iconLeft={<UserRound size={16} />}
                hint={errors.firstName}
                error={Boolean(errors.firstName)}
                required
              />
              <TextInput
                label="Last name"
                value={form.lastName}
                onChange={(event) => updateField('lastName', event.target.value)}
                iconLeft={<UserRound size={16} />}
                hint={errors.lastName}
                error={Boolean(errors.lastName)}
                required
              />
              <EmailInput
                label="Email"
                value={form.email}
                onChange={(event) => updateField('email', event.target.value)}
                hint={errors.email}
                error={Boolean(errors.email)}
                required
              />
              <TextInput
                label="Phone"
                className="company-join__phone-input"
                value={form.phone}
                onChange={(event) => updatePhone(event.target.value)}
                iconLeft={<Phone size={16} />}
                inputMode="tel"
                autoComplete="tel"
                placeholder={PHONE_EXAMPLE}
                hint={errors.phone}
                error={Boolean(errors.phone)}
                required
              />
              <PasswordInput
                label="Password"
                value={form.password}
                onChange={(event) => updateField('password', event.target.value)}
                hint={errors.password}
                error={Boolean(errors.password)}
                required
              />
              <PasswordInput
                label="Confirm password"
                value={form.confirmPassword}
                onChange={(event) => updateField('confirmPassword', event.target.value)}
                hint={errors.confirmPassword}
                error={Boolean(errors.confirmPassword)}
                required
              />
            </div>

            {error && <p className="auth-page__error">{error}</p>}
            <div className="company-join__actions">
              <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
                I already have access
              </Button>
              <Button type="submit" size="lg" loading={isSubmitting}>
                Request to join
              </Button>
            </div>
          </form>
        )}

        {step === 'verify' && (
          <form className="auth-page__form" onSubmit={handleVerifySubmit}>
            <TextInput
              label="Verification code"
              value={verifyCode}
              onChange={(event) => {
                setVerifyCode(event.target.value);
                setErrors((current) => ({ ...current, code: '' }));
                setError('');
              }}
              iconLeft={<Mail size={16} />}
              hint={errors.code || notice}
              error={Boolean(errors.code)}
              required
            />
            {error && <p className="auth-page__error">{error}</p>}
            <div className="company-join__actions">
              <Button type="submit" loading={isSubmitting} size="lg">
                Verify email
              </Button>
              <Button
                variant="secondary"
                size="lg"
                loading={isResending}
                disabled={!canResendCode || isSubmitting}
                onClick={handleResendVerificationCode}
              >
                {canResendCode ? 'Resend code' : `Resend in ${resendSeconds}s`}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => setStep('join')}>
                Edit details
              </Button>
            </div>
          </form>
        )}

        {step === 'done' && (
          <div className="auth-page__form company-join__done">
            <div className="auth-page__verify-icon">
              <CheckCircle2 size={26} />
            </div>
            <p className="auth-page__subtitle">
              Your request is waiting for approval. After it is accepted, sign in with this account.
            </p>
            <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
              Go to login
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
