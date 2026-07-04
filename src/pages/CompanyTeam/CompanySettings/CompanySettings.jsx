import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Building2, Globe, Phone, RotateCcw, Save } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { SectionTitle } from '../../../components/ui/SectionTitle';
import { Textarea, TextInput } from '../../../components/ui/Input';
import { COMPANY, updateCompany, useBackendData } from '../../../api';
import './CompanySettings.css';

const ICON_SM = 14;

function getInitials(name = '') {
  return (
    String(name)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'VU'
  );
}

function getInitialForm() {
  return {
    name: COMPANY.name || '',
    website: COMPANY.website || '',
    phone: COMPANY.phone || '',
    description: COMPANY.description || '',
  };
}

export const CompanySettings = memo(function CompanySettings() {
  const savedTimerRef = useRef(null);
  const { dataVersion } = useBackendData();
  const [form, setForm] = useState(() => getInitialForm());
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(
    () => () => {
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
    },
    []
  );

  const currentForm = useMemo(() => {
    void dataVersion;
    return getInitialForm();
  }, [dataVersion]);

  useEffect(() => {
    setForm(currentForm);
    setSaved(false);
    setSaveError('');
  }, [currentForm]);

  const hasChanges = useMemo(() => {
    return Object.keys(currentForm).some((key) => form[key] !== currentForm[key]);
  }, [form, currentForm]);

  const handleChange = useCallback((field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
    setSaveError('');
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setSaveError('');
    try {
      await updateCompany(form);
      setSaved(true);
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      savedTimerRef.current = window.setTimeout(() => {
        setSaved(false);
        savedTimerRef.current = null;
      }, 2000);
    } catch (error) {
      setSaveError(error.message || 'Company settings could not be saved.');
    } finally {
      setIsSaving(false);
    }
  }, [form]);

  const handleReset = useCallback(() => {
    setForm(currentForm);
    setSaved(false);
    setSaveError('');
  }, [currentForm]);

  return (
    <div className="company-settings">
      <div className="company-settings__layout">
        <main className="company-settings__main">
          <section className="company-settings__header">
            <div className="company-settings__identity">
              <div className="company-settings__avatar" aria-hidden="true">
                {getInitials(COMPANY.name)}
              </div>
              <div className="company-settings__identity-copy">
                <span className="company-settings__eyebrow">Workspace settings</span>
                <h1>{COMPANY.name || 'Company workspace'}</h1>
                <p>Update the company profile used across jobs and public application pages.</p>
              </div>
            </div>
            <div className="company-settings__status" aria-live="polite">
              {saved ? 'Saved' : hasChanges ? 'Unsaved changes' : 'Up to date'}
            </div>

            <div className="company-settings__meta-strip">
              <div>
                <Globe size={ICON_SM} aria-hidden="true" />
                <span>Website</span>
                <strong>{COMPANY.website || 'Not set'}</strong>
              </div>
              <div>
                <Phone size={ICON_SM} aria-hidden="true" />
                <span>Phone</span>
                <strong>{COMPANY.phone || 'Not set'}</strong>
              </div>
              <div>
                <Building2 size={ICON_SM} aria-hidden="true" />
                <span>Profile</span>
                <strong>{hasChanges ? 'Needs save' : 'Current'}</strong>
              </div>
            </div>
          </section>

          <section className="company-settings__section">
            <SectionTitle variant="inline">Company profile</SectionTitle>
            <div className="company-settings__row company-settings__row--2">
              <TextInput
                label="Company name"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
                iconLeft={<Building2 size={ICON_SM} />}
                required
                error={Boolean(saveError && !form.name.trim())}
                hint={saveError && !form.name.trim() ? 'Company name is required.' : ''}
              />
              <TextInput
                label="Website"
                value={form.website}
                onChange={(event) => handleChange('website', event.target.value)}
                iconLeft={<Globe size={ICON_SM} />}
                inputMode="url"
              />
            </div>

            <div className="company-settings__row company-settings__row--2">
              <TextInput
                label="Phone"
                value={form.phone}
                onChange={(event) => handleChange('phone', event.target.value)}
                iconLeft={<Phone size={ICON_SM} />}
                inputMode="tel"
              />
            </div>

            <Textarea
              label="Company description"
              value={form.description}
              onChange={(event) => handleChange('description', event.target.value)}
              rows={4}
              maxLength={255}
              showCounter
              placeholder="Briefly describe what the company does."
            />

            {saveError && <p className="company-settings__error">{saveError}</p>}
          </section>
        </main>

        <aside className="company-settings__sidebar">
          <div className="company-settings__card">
            <SectionTitle variant="inline">Actions</SectionTitle>
            <div className="company-settings__action-list">
              <Button
                variant="primary"
                size="sm"
                iconLeft={<Save size={ICON_SM} />}
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                loading={isSaving}
              >
                {saved ? 'Saved' : 'Save changes'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconLeft={<RotateCcw size={ICON_SM} />}
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
              >
                Reset changes
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
});
