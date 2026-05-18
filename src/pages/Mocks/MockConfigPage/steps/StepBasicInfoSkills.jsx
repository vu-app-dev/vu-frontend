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
        <SectionTitle
          variant="inline"
          description="Define the core details for this evaluation module"
        >
          Basic Information
        </SectionTitle>
        <TextInput
          label="Mock Name"
          placeholder="e.g. System Design Interview"
          required
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          disabled={isActive}
          onBlur={() => markTouched?.('title')}
          error={Boolean(showFieldError?.('title'))}
          hint={showFieldError?.('title') ? validationErrors.title : 'Minimum 3 characters'}
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
            hint={showFieldError?.('type') ? validationErrors.type : 'Required'}
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
            hint={showFieldError?.('difficulty') ? validationErrors.difficulty : 'Required'}
          />
          <DropdownInput
            label="Estimated Duration"
            placeholder="Select duration"
            required
            options={DURATION_OPTIONS}
            value={form.durationMin}
            onChange={(v) => updateField('durationMin', v)}
            disabled={isActive}
            onBlur={() => markTouched?.('durationMin')}
            error={Boolean(showFieldError?.('durationMin'))}
            hint={showFieldError?.('durationMin') ? validationErrors.durationMin : 'Required'}
          />
        </div>
        <Textarea
          label="Short Description"
          placeholder="Briefly describe what this mock evaluates..."
          rows={3}
          maxLength={500}
          showCounter
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          onBlur={() => markTouched?.('description')}
          error={Boolean(showFieldError?.('description'))}
          hint={showFieldError?.('description') ? validationErrors.description : 'Minimum 10 characters'}
          disabled={isActive}
        />
      </section>

      <section className="create-mock__section">
        <SectionTitle
          variant="inline"
          description="Add technologies this mock evaluates. Used for CV analysis, alignment scoring, and search/filter."
        >
          Technologies Covered
        </SectionTitle>
        <Tags
          tags={form.technologies}
          variant={isActive ? 'readonly' : 'editable'}
          showTitle={false}
          onAdd={isActive ? undefined : addTechnology}
          onRemove={isActive ? undefined : removeTechnology}
        />
        {(showFieldError?.('technologies') || form.technologies.length === 0) && (
          <p className="create-mock__hint">
            {showFieldError?.('technologies')
              ? validationErrors.technologies
              : 'Add at least one technology to continue. Type and press Enter.'}
          </p>
        )}
      </section>

      <section className="create-mock__section">
        <SectionTitle
          variant="inline"
          description="Configure additional features for this mock session"
        >
          Session Features
        </SectionTitle>
        <div className="create-mock__toggles">
          <div className="create-mock__toggle-group">
            <div className="create-mock__toggle-info">
              <span className="create-mock__toggle-label">Enable Follow-up Questions</span>
              <span className="create-mock__toggle-desc">
                Allow the AI to ask dynamically generated follow-up questions based on the
                candidate's answers.
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
              <span className="create-mock__toggle-label">Enable Record Replay</span>
              <span className="create-mock__toggle-desc">
                Automatically record the candidate's session for playback and detailed review.
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
