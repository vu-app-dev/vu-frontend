import { SectionTitle } from '../../../../components/ui/SectionTitle';
import { TextInput } from '../../../../components/ui/Input';
import { Toggle } from '../../../../components/ui/Toggle';
import { EMAIL_TRIGGERS } from '../../../../api';

const SCHEDULE_OPTIONS = [
  { value: 'active', label: 'Active', description: 'Open now and close on an end date.' },
  { value: 'scheduled', label: 'Scheduled', description: 'Open later between two dates.' },
];

export function StepScheduling({
  form,
  updateField,
  updateEmail,
  statusPreview,
  validationErrors = {},
  markTouched,
  showFieldError,
  isActiveEdit = false,
}) {
  const today = new Date().toISOString().split('T')[0];
  const scheduleMode = isActiveEdit ? 'active' : form.scheduleMode || 'active';
  const scheduleOptions = isActiveEdit ? SCHEDULE_OPTIONS.slice(0, 1) : SCHEDULE_OPTIONS;

  const handleScheduleMode = (mode) => {
    if (isActiveEdit) return;
    updateField('scheduleMode', mode);
    if (mode === 'active') updateField('startDate', '');
  };

  const handleStartDate = (v) => {
    updateField('startDate', v);
    if (form.endDate && v > form.endDate) updateField('endDate', '');
  };

  return (
    <>
      <section className="create-job__section">
        <SectionTitle
          variant="inline"
          description="Choose which automated emails to send to candidates"
        >
          Email Notifications
        </SectionTitle>
        <div className="create-job__mock-list">
          {EMAIL_TRIGGERS.map((t) => (
            <div key={t.id} className="create-job__trigger">
              <div className="create-job__trigger-info">
                <span className="create-job__trigger-title">{t.title}</span>
                <span className="create-job__trigger-desc">{t.desc}</span>
              </div>
              <Toggle
                checked={form.emails[t.id]}
                onChange={(checked) => updateEmail(t.id, checked)}
                disabled={isActiveEdit}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="create-job__section">
        <SectionTitle
          variant="inline"
          description={
            isActiveEdit
              ? 'Active jobs stay active. You can only extend the end date.'
              : 'Choose whether this job opens now or later'
          }
        >
          Scheduling
        </SectionTitle>
        <div className="create-job__schedule-options" role="radiogroup" aria-label="Job schedule">
          {scheduleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={[
                'create-job__schedule-option',
                `create-job__schedule-option--${option.value}`,
                scheduleMode === option.value && 'create-job__schedule-option--selected',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleScheduleMode(option.value)}
              disabled={isActiveEdit}
              role="radio"
              aria-checked={scheduleMode === option.value}
            >
              <span className="create-job__schedule-option-title">{option.label}</span>
              <span className="create-job__schedule-option-desc">{option.description}</span>
            </button>
          ))}
        </div>

        <div className="create-job__row create-job__row--2">
          {scheduleMode === 'scheduled' && (
            <TextInput
              label="Open Date"
              type="date"
              min={today}
              value={form.startDate}
              onChange={(e) => handleStartDate(e.target.value)}
              onBlur={() => markTouched?.('startDate')}
              hint={showFieldError?.('startDate') ? validationErrors.startDate : 'Required'}
              error={Boolean(showFieldError?.('startDate'))}
            />
          )}
          <TextInput
            label="End Date"
            type="date"
            min={
              isActiveEdit
                ? form.endDate || today
                : scheduleMode === 'scheduled'
                  ? form.startDate || today
                  : today
            }
            value={form.endDate}
            onChange={(e) => updateField('endDate', e.target.value)}
            onBlur={() => markTouched?.('endDate')}
            hint={showFieldError?.('endDate') ? validationErrors.endDate : 'Required'}
            error={Boolean(showFieldError?.('endDate'))}
          />
        </div>

        <div className="create-job__row create-job__row--2">
          <TextInput
            label="Max Candidates"
            type="number"
            min="1"
            placeholder="e.g. 200"
            value={form.maxCandidates}
            onChange={(e) => updateField('maxCandidates', e.target.value)}
            hint="Limit applications accepted"
            disabled={isActiveEdit}
          />
        </div>
        <div className="create-job__status-preview">
          <span className="create-job__status-preview-title">Status Preview</span>
          {statusPreview.map((line, i) => (
            <div key={i} className="create-job__status-row">
              <span className={`create-job__status-dot create-job__status-dot--${line.color}`} />
              <span>{line.text}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
