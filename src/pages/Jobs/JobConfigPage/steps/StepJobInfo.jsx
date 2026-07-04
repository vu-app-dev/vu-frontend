import { SectionTitle } from '../../../../components/ui/SectionTitle';
import { TextInput, DropdownInput, Textarea } from '../../../../components/ui/Input';
import { Tags } from '../../../../components/ui/Tags';
import { JOB_TYPE_OPTIONS, SENIORITY_OPTIONS, LOCATION_TYPE_OPTIONS } from '../../../../api';

export function StepJobInfo({
  form,
  updateField,
  addTechnology,
  removeTechnology,
  validationErrors = {},
  markTouched,
  showFieldError,
  disabled = false,
}) {
  return (
    <>
      <section className="create-job__section">
        <SectionTitle
          variant="inline"
          description="Set the role fields candidates and reviewers will see."
        >
          Role setup
        </SectionTitle>
        <TextInput
          label="Job title"
          placeholder="e.g. Senior Software Engineer"
          required
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          onBlur={() => markTouched?.('title')}
          error={Boolean(showFieldError?.('title'))}
          hint={showFieldError?.('title') ? validationErrors.title : ''}
          disabled={disabled}
        />
        <div className="create-job__row create-job__row--2">
          <DropdownInput
            label="Job type"
            placeholder="Select type"
            required
            options={JOB_TYPE_OPTIONS}
            value={form.jobType}
            onChange={(v) => updateField('jobType', v)}
            onBlur={() => markTouched?.('jobType')}
            error={Boolean(showFieldError?.('jobType'))}
            disabled={disabled}
          />
          <DropdownInput
            label="Seniority level"
            placeholder="Select level"
            required
            options={SENIORITY_OPTIONS}
            value={form.seniority}
            onChange={(v) => updateField('seniority', v)}
            onBlur={() => markTouched?.('seniority')}
            error={Boolean(showFieldError?.('seniority'))}
            disabled={disabled}
          />
        </div>

        <div className="create-job__row create-job__row--2">
          <DropdownInput
            label="Work arrangement"
            placeholder="Select arrangement"
            options={LOCATION_TYPE_OPTIONS}
            value={form.locationType}
            onChange={(v) => updateField('locationType', v)}
            disabled={disabled}
          />
          <TextInput
            label="City / country"
            placeholder="e.g. San Francisco, CA"
            value={form.location}
            onChange={(e) => updateField('location', e.target.value)}
            disabled={disabled}
          />
        </div>
      </section>

      <section className="create-job__section">
        <SectionTitle
          variant="inline"
          description="Describe responsibilities, expectations, and what the role actually does."
        >
          Job description
        </SectionTitle>
        <Textarea
          label="Description"
          showLabel={false}
          placeholder="Describe the role, responsibilities, and what strong candidates should understand..."
          rows={5}
          maxLength={2000}
          showCounter
          value={form.description}
          onChange={(e) => updateField('description', e.target.value)}
          onBlur={() => markTouched?.('description')}
          error={Boolean(showFieldError?.('description'))}
          hint={showFieldError?.('description') ? validationErrors.description : ''}
          disabled={disabled}
        />
      </section>

      <section className="create-job__section">
        <SectionTitle
          variant="inline"
          description="Add skills used for matching, filtering, and reviewer context."
        >
          Skills
        </SectionTitle>
        <Tags
          tags={form.technologies}
          variant={disabled ? 'readonly' : 'editable'}
          showTitle={false}
          onAdd={addTechnology}
          onRemove={removeTechnology}
        />
        {showFieldError?.('technologies') && (
          <p className="create-job__hint">{validationErrors.technologies}</p>
        )}
      </section>
    </>
  );
}
