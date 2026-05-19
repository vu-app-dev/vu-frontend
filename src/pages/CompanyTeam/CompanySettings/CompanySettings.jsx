import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Save, Upload, Building2, Globe, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { SectionTitle } from '../../../components/ui/SectionTitle';
import { Tags } from '../../../components/ui/Tags';
import { COMPANY, INDUSTRY_OPTIONS, updateCompany } from '../../../api';
import './CompanySettings.css';

const ICON_SM = 14;

const SIZE_OPTIONS = [
  '1-10 employees',
  '11-50 employees',
  '50-200 employees',
  '200-500 employees',
  '500-1000 employees',
  '1000+ employees',
];

export const CompanySettings = memo(function CompanySettings() {
  const savedTimerRef = useRef(null);
  const [form, setForm] = useState({
    name: COMPANY.name,
    industry: COMPANY.industry,
    website: COMPANY.website,
    phone: COMPANY.phone || '',
    description: COMPANY.description || '',
    size: COMPANY.size,
    defaultCandidateStatuses: [...COMPANY.defaultCandidateStatuses],
    departments: [...COMPANY.departments],
  });
  const [saved, setSaved] = useState(false);

  useEffect(
    () => () => {
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
    },
    []
  );

  const handleChange = useCallback((field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await updateCompany(form);
      setSaved(true);
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      savedTimerRef.current = window.setTimeout(() => {
        setSaved(false);
        savedTimerRef.current = null;
      }, 2000);
    } catch (error) {
      window.alert(error.message || 'Unable to update company.');
    }
  }, [form]);

  const handleReset = useCallback(() => {
    setForm({
      name: COMPANY.name,
      industry: COMPANY.industry,
      website: COMPANY.website,
      phone: COMPANY.phone || '',
      description: COMPANY.description || '',
      size: COMPANY.size,
      defaultCandidateStatuses: [...COMPANY.defaultCandidateStatuses],
      departments: [...COMPANY.departments],
    });
    setSaved(false);
  }, []);

  const handleAddStatus = useCallback(
    (status) => {
      if (!form.defaultCandidateStatuses.includes(status)) {
        handleChange('defaultCandidateStatuses', [...form.defaultCandidateStatuses, status]);
      }
    },
    [form.defaultCandidateStatuses, handleChange]
  );

  const handleRemoveStatus = useCallback(
    (index) => {
      handleChange(
        'defaultCandidateStatuses',
        form.defaultCandidateStatuses.filter((_, i) => i !== index)
      );
    },
    [form.defaultCandidateStatuses, handleChange]
  );

  const handleAddDepartment = useCallback(
    (dept) => {
      if (!form.departments.includes(dept)) {
        handleChange('departments', [...form.departments, dept]);
      }
    },
    [form.departments, handleChange]
  );

  const handleRemoveDepartment = useCallback(
    (index) => {
      handleChange(
        'departments',
        form.departments.filter((_, i) => i !== index)
      );
    },
    [form.departments, handleChange]
  );

  return (
    <div className="company-settings">
      <div className="company-settings__scroll">
        {/* ── Organization Identity ── */}
        <section className="company-settings__section">
          <SectionTitle variant="inline">Organization Identity</SectionTitle>

          <div className="company-settings__row company-settings__row--2">
            <div className="company-settings__field">
              <label className="company-settings__label">Company Name</label>
              <div className="company-settings__input-wrapper">
                <Building2 size={14} className="company-settings__input-icon" />
                <input
                  type="text"
                  className="company-settings__input"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                />
              </div>
            </div>

            <div className="company-settings__field">
              <label className="company-settings__label">Website</label>
              <div className="company-settings__input-wrapper">
                <Globe size={14} className="company-settings__input-icon" />
                <input
                  type="text"
                  className="company-settings__input"
                  value={form.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="company-settings__row company-settings__row--2">
            <div className="company-settings__field">
              <label className="company-settings__label">Industry</label>
              <select
                className="company-settings__select"
                value={form.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
              >
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="company-settings__field">
              <label className="company-settings__label">Company Size</label>
              <select
                className="company-settings__select"
                value={form.size}
                onChange={(e) => handleChange('size', e.target.value)}
              >
                {SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="company-settings__field">
            <label className="company-settings__label">Company Logo</label>
            <div className="company-settings__logo-upload">
              <div className="company-settings__logo-placeholder">
                <Upload size={20} />
                <span>Upload logo</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Separator ── */}
        <div className="company-settings__separator" />

        {/* ── Default Candidate Statuses ── */}
        <section className="company-settings__section">
          <SectionTitle variant="inline">Default Candidate Statuses</SectionTitle>

          <div className="company-settings__field">
            <label className="company-settings__label">Status Labels</label>
            <Tags
              tags={form.defaultCandidateStatuses}
              onAdd={handleAddStatus}
              onRemove={(_, index) => handleRemoveStatus(index)}
              placeholder="Add status..."
            />
          </div>
        </section>

        {/* ── Separator ── */}
        <div className="company-settings__separator" />

        {/* ── Departments ── */}
        <section className="company-settings__section">
          <SectionTitle variant="inline">Departments</SectionTitle>

          <div className="company-settings__field">
            <label className="company-settings__label">Department Labels</label>
            <Tags
              tags={form.departments}
              onAdd={handleAddDepartment}
              onRemove={(_, index) => handleRemoveDepartment(index)}
              placeholder="Add department..."
            />
          </div>
        </section>

        {/* ── Separator ── */}
        <div className="company-settings__separator" />

        {/* ── Actions — like create/edit pages ── */}
        <div className="company-settings__footer">
          <Button
            variant="ghost"
            size="sm"
            iconLeft={<RotateCcw size={ICON_SM} />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            iconLeft={<Save size={ICON_SM} />}
            onClick={handleSave}
          >
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
});
