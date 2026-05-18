import { SectionTitle } from '../../../../components/ui/SectionTitle';
import { TextInput, DropdownInput, Textarea } from '../../../../components/ui/Input';
import { Tags } from '../../../../components/ui/Tags';
import { JOB_TYPE_OPTIONS, SENIORITY_OPTIONS, LOCATION_TYPE_OPTIONS } from '../../../../api';

export function StepJobInfo({
  form,
  updateField,
  departmentOptions,
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
        <SectionTitle variant="inline" description="Enter the core details for this job posting">
          Basic Information
        </SectionTitle>
        <TextInput
          label="Job Title"
          placeholder="e.g. Senior Software Engineer"
          required
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          onBlur={() => markTouched?.('title')}
          error={Boolean(showFieldError?.('title'))}
          hint={showFieldError?.('title') ? validationErrors.title : ''}
          disabled={disabled}
        />
        <div className="create-job__row create-job__row--3">
          <DropdownInput
            label="Department"
            placeholder="Select department"
            required
            options={departmentOptions}
            value={form.department}
            onChange={(v) => updateField('department', v)}
            onBlur={() => markTouched?.('department')}
            error={Boolean(showFieldError?.('department'))}
            disabled={disabled}
          />
          <DropdownInput
            label="Job Type"
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
            label="Seniority Level"
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
      </section>

      <section className="create-job__section">
        <SectionTitle variant="inline" description="Add technologies candidates should have">
          Technologies
        </SectionTitle>
        <Tags
          tags={form.technologies}
          variant={disabled ? 'readonly' : 'editable'}
          showTitle={false}
          onAdd={addTechnology}
          onRemove={removeTechnology}
        />
        {(showFieldError?.('technologies') || form.technologies.length === 0) && (
          <p className="create-job__hint">
            {showFieldError?.('technologies') ? validationErrors.technologies : ''}
          </p>
        )}
      </section>

      <section className="create-job__section">
        <SectionTitle
          variant="inline"
          description="Describe the role, responsibilities, and expectations"
        >
          Job Description
        </SectionTitle>
        <Textarea
          label="Description"
          showLabel={false}
          placeholder="Describe the role, responsibilities, and what a typical day looks like..."
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
        <SectionTitle variant="inline" description="Where will this role be based?">
          Location
        </SectionTitle>
        <div className="create-job__row create-job__row--2">
          <DropdownInput
            label="Work Arrangement"
            placeholder="Select arrangement"
            options={LOCATION_TYPE_OPTIONS}
            value={form.locationType}
            onChange={(v) => updateField('locationType', v)}
            disabled={disabled}
          />
          <TextInput
            label="City / Country"
            placeholder="e.g. San Francisco, CA"
            value={form.location}
            onChange={(e) => updateField('location', e.target.value)}
            disabled={disabled}
          />
        </div>
      </section>
    </>
  );
}
