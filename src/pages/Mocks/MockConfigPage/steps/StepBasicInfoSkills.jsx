import { SectionTitle } from '../../../../components/ui/SectionTitle';
import { TextInput, DropdownInput, Textarea } from '../../../../components/ui/Input';
import { Tags } from '../../../../components/ui/Tags';
import { Toggle } from '../../../../components/ui/Toggle';
import { MOCK_TYPE_OPTIONS, DIFFICULTY_OPTIONS, DURATION_OPTIONS } from '../../../../api';

export function StepBasicInfoSkills({
  form,
  updateField,
  addTechnology,
  removeTechnology,
  isActive,
  validationErrors = {},
  markTouched,
  showFieldError,
}) {
  return (
    <>
      <section className="create-mock__section">
        <SectionTitle variant="inline">Basic information</SectionTitle>
        <TextInput
          label="Assessment name"
          placeholder="e.g. System Design Interview"
          required
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          disabled={isActive}
          onBlur={() => markTouched?.('title')}
          error={Boolean(showFieldError?.('title'))}
          hint={showFieldError?.('title') ? validationErrors.title : ''}
        />
        <div className="create-mock__row create-mock__row--3">
          <DropdownInput
            label="Type"
            placeholder="Select type"
            required
            options={MOCK_TYPE_OPTIONS}
            value={form.type}
            onChange={(v) => updateField('type', v)}
            disabled={isActive}
            onBlur={() => markTouched?.('type')}
            error={Boolean(showFieldError?.('type'))}
            hint={showFieldError?.('type') ? validationErrors.type : ''}
          />
          <DropdownInput
            label="Difficulty"
            placeholder="Select difficulty"
            required
            options={DIFFICULTY_OPTIONS}
            value={form.difficulty}
            onChange={(v) => updateField('difficulty', v)}
            disabled={isActive}
            onBlur={() => markTouched?.('difficulty')}
            error={Boolean(showFieldError?.('difficulty'))}
            hint={showFieldError?.('difficulty') ? validationErrors.difficulty : ''}
          />
          <DropdownInput
            label="Estimated duration"
            placeholder="Select duration"
            required
            options={DURATION_OPTIONS}
            value={form.durationMin}
            onChange={(v) => updateField('durationMin', v)}
            disabled={isActive}
            onBlur={() => markTouched?.('durationMin')}
            error={Boolean(showFieldError?.('durationMin'))}
            hint={showFieldError?.('durationMin') ? validationErrors.durationMin : ''}
          />
        </div>
        <Textarea
          label="Candidate-facing summary"
          placeholder="Briefly describe what this assessment evaluates..."
          rows={3}
          maxLength={500}
          showCounter
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          onBlur={() => markTouched?.('description')}
          error={Boolean(showFieldError?.('description'))}
          hint={showFieldError?.('description') ? validationErrors.description : ''}
          disabled={isActive}
        />

        <div className="create-mock__field-group">
          <span className="create-mock__field-label">Skills covered</span>
          <Tags
            tags={form.technologies}
            variant={isActive ? 'readonly' : 'editable'}
            showTitle={false}
            onAdd={isActive ? undefined : addTechnology}
            onRemove={isActive ? undefined : removeTechnology}
          />
          {showFieldError?.('technologies') && (
            <p className="create-mock__hint">{validationErrors.technologies}</p>
          )}
        </div>
      </section>

      <section className="create-mock__section">
        <SectionTitle variant="inline">Session options</SectionTitle>
        <div className="create-mock__toggles">
          <div className="create-mock__toggle-group">
            <div className="create-mock__toggle-info">
              <span className="create-mock__toggle-label">Follow-up questions</span>
              <span className="create-mock__toggle-desc">
                Allow the interview to ask relevant follow-up questions based on candidate answers.
              </span>
            </div>
            <Toggle
              checked={form.enableFollowUpQuestions || false}
              onChange={(v) => updateField('enableFollowUpQuestions', v)}
              disabled={isActive}
            />
          </div>
          <div className="create-mock__toggle-group">
            <div className="create-mock__toggle-info">
              <span className="create-mock__toggle-label">Replay recording</span>
              <span className="create-mock__toggle-desc">
                Record the candidate session so reviewers can inspect the evidence later.
              </span>
            </div>
            <Toggle
              checked={form.enableRecordReplay || false}
              onChange={(v) => updateField('enableRecordReplay', v)}
              disabled={isActive}
            />
          </div>
        </div>
      </section>
    </>
  );
}
