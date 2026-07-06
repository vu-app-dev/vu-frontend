import { memo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { TextInput, EmailInput, FileInput, DropdownInput } from '../../../components/ui/Input';
import { saveCandidateInfo, APPLICATION, CANDIDATE_INFO } from '../../../api';
import './CandidateForm.css';

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  resumeFile: null,
  resumeName: '',
  cvUrl: '',
};

export const CandidateForm = memo(function CandidateForm({ onSubmit, onBack }) {
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM, ...CANDIDATE_INFO, resumeFile: null }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, resumeFile: file, resumeName: file.name, cvUrl: '' }));
      setErrors((prev) => {
        if (!prev.resume) return prev;
        const next = { ...prev };
        delete next.resume;
        return next;
      });
    }
  }, []);

  const validate = useCallback(() => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.location) errs.location = 'Location is required';
    if (!form.resumeFile && !form.cvUrl) errs.resume = 'Resume is required';
    return errs;
  }, [form]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const errs = validate();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
      }
      setSubmitting(true);
      try {
        await saveCandidateInfo(form);
        onSubmit();
      } catch (error) {
        if (!form.cvUrl && form.resumeFile) {
          setForm((prev) => ({ ...prev, resumeFile: null, resumeName: '' }));
        }
        setErrors({ submit: error.message || 'Unable to submit application.' });
      } finally {
        setSubmitting(false);
      }
    },
    [form, validate, onSubmit]
  );

  return (
    <div className="candidate-form">
      <form className="candidate-form__body" onSubmit={handleSubmit} noValidate>
        <div className="candidate-form__panel">
          <div className="candidate-form__intro">
            <span className="candidate-form__eyebrow">Your profile</span>
            <h2>Tell the hiring team who you are</h2>
            <p>
              This information connects your application, resume, and interview results in one
              candidate profile.
            </p>
          </div>

          <div className="candidate-form__fields">
            <div className="candidate-form__row">
              <TextInput
                label="First Name"
                required
                placeholder="John"
                value={form.firstName}
                error={!!errors.firstName}
                hint={errors.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
              <TextInput
                label="Last Name"
                required
                placeholder="Doe"
                value={form.lastName}
                error={!!errors.lastName}
                hint={errors.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
              />
            </div>

            <EmailInput
              label="Email Address"
              required
              placeholder="john.doe@email.com"
              value={form.email}
              error={!!errors.email}
              hint={errors.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />

            <div className="candidate-form__row">
              <TextInput
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
              <DropdownInput
                label="Location"
                required
                placeholder="Select your location"
                value={form.location}
                error={!!errors.location}
                hint={errors.location}
                onChange={(val) => handleChange('location', val)}
                options={[
                  { label: 'United States', value: 'US' },
                  { label: 'United Kingdom', value: 'UK' },
                  { label: 'Canada', value: 'CA' },
                  { label: 'Germany', value: 'DE' },
                  { label: 'France', value: 'FR' },
                  { label: 'Remote', value: 'Remote' },
                ]}
              />
            </div>

            <TextInput
              label="LinkedIn Profile"
              placeholder="https://linkedin.com/in/your-profile"
              value={form.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
            />

            <FileInput
              label="Resume / CV"
              required={!form.cvUrl}
              accept=".pdf,application/pdf"
              error={!!errors.resume}
              hint={
                errors.resume ||
                (form.resumeFile
                  ? `${form.resumeName} ready to upload.`
                  : form.cvUrl && form.resumeName
                    ? `${form.resumeName} previously uploaded.`
                    : 'Upload your CV as a PDF file only.')
              }
              onChange={handleFileChange}
            />

            {errors.submit && <p className="candidate-form__error">{errors.submit}</p>}
          </div>

          <p className="candidate-form__disclaimer">
            Your information is securely stored and will only be shared with the hiring team at{' '}
            {APPLICATION?.company?.name || 'the company'}.
          </p>
        </div>
      </form>

      <div className="candidate-form__sticky-bar">
        <span className="candidate-form__sticky-bar-hint">All fields marked * are required</span>
        <div className="candidate-form__sticky-bar-actions">
          <Button
            variant="ghost"
            size="sm"
            iconLeft={<ArrowLeft size={16} />}
            onClick={onBack}
            type="button"
          >
            Back
          </Button>
          <Button
            variant="primary"
            size="sm"
            iconRight={<ArrowRight size={16} />}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
});

CandidateForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
};
