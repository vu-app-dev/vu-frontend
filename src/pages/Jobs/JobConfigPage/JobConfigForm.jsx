import { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react';
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react';
import { Stepper } from '../../../components/ui/Stepper';
import { Button } from '../../../components/ui/Button';
import { EditBanner } from './edit/EditBanner';
import { StepJobInfo, StepMocks, StepScheduling, StepReview, EditFooterActions } from './steps';
import {
  JOB_STEPS_CREATE as STEPS_CREATE,
  JOB_STEPS_EDIT as STEPS_EDIT,
  DEPARTMENT_OPTIONS,
  EMAIL_TRIGGERS,
  INITIAL_JOB_FORM as INITIAL_FORM,
  parseDurationMin,
} from '../../../api';
import { redistributeWeights } from '../../../utils';
import './JobConfigForm.css';

const MIN_TITLE_LENGTH = 3;
const MIN_DESCRIPTION_LENGTH = 10;

function dateInputToTimestamp(dateValue) {
  if (!dateValue) return null;
  const date = new Date(`${dateValue}T09:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function dateInputToEndTimestamp(dateValue) {
  if (!dateValue) return null;
  const date = new Date(`${dateValue}T23:59:59`);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function startOfTodayTimestamp() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

function normalizeJobForm(source = INITIAL_FORM) {
  const technologies = Array.isArray(source.technologies)
    ? source.technologies
    : Array.isArray(source.skills)
      ? source.skills
      : [];

  return {
    ...INITIAL_FORM,
    ...source,
    technologies,
    emails: { ...INITIAL_FORM.emails, ...(source.emails || {}) },
    mocks: Array.isArray(source.mocks) ? source.mocks : [],
    scheduleMode: source.scheduleMode === 'scheduled' ? 'scheduled' : 'active',
  };
}

/* -------------------------------------------------
   JobConfigForm
   Props:
     mode          â€“ 'create' | 'edit'
     initialData   â€“ pre-filled form values (edit mode)
     status        â€“ 'scheduled' | 'active' | 'closed' (edit)
     onPublish     â€“ (form) => void
     onSaveChanges â€“ (form) => void
   ------------------------------------------------- */

export const JobConfigForm = memo(function JobConfigForm({
  mode = 'create',
  initialData,
  status,
  onPublish,
  onSaveChanges,
}) {
  const isEdit = mode === 'edit';
  const isActiveEdit = isEdit && status === 'active';

  const STEPS = isEdit ? STEPS_EDIT : STEPS_CREATE;
  const initialForm = useMemo(() => {
    const normalized = normalizeJobForm(initialData ?? INITIAL_FORM);
    return isActiveEdit ? { ...normalized, scheduleMode: 'active', startDate: '' } : normalized;
  }, [initialData, isActiveEdit]);
  const [initialEndDateInput] = useState(initialForm.endDate || '');

  const [activeStep, setActiveStep] = useState(() => (isActiveEdit ? 2 : 0));
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [attemptedErrors, setAttemptedErrors] = useState({});

  const markTouched = useCallback((field) => {
    setTouched((p) => ({ ...p, [field]: true }));
  }, []);
  const [showMockLibrary, setShowMockLibrary] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const dragIndexRef = useRef(null);
  const manualWeightIds = useRef(new Set());
  const [dragIndex, setDragIndex] = useState(null);
  const pageScrollRef = useRef(null);

  /* -- Field updaters -- */
  const updateField = useCallback((field, value) => setForm((p) => ({ ...p, [field]: value })), []);

  const updateEmail = useCallback(
    (id, checked) => setForm((p) => ({ ...p, emails: { ...p.emails, [id]: checked } })),
    []
  );

  /* -- Technologies -- */
  const addTechnology = useCallback((tag) => {
    const n = tag.trim().charAt(0).toUpperCase() + tag.trim().slice(1);
    if (!n) return;
    setForm((p) =>
      p.technologies.some((s) => s.toLowerCase() === n.toLowerCase())
        ? p
        : { ...p, technologies: [...p.technologies, n] }
    );
  }, []);

  const removeTechnology = useCallback(
    (tag) => setForm((p) => ({ ...p, technologies: p.technologies.filter((s) => s !== tag) })),
    []
  );

  /* -- Mock management -- */
  const addMock = useCallback((mock) => {
    if (isActiveEdit) return;
    manualWeightIds.current.clear();
    setForm((p) => {
      if (p.mocks.some((m) => m.id === mock.id)) return p;
      const count = p.mocks.length + 1;
      const base = Math.floor(100 / count);
      const rem = 100 - base * count;
      return {
        ...p,
        mocks: [
          ...p.mocks.map((m, i) => ({ ...m, weight: base + (i < rem ? 1 : 0) })),
          { ...mock, weight: base },
        ],
      };
    });
    setShowMockLibrary(false);
  }, [isActiveEdit]);

  const removeMock = useCallback(
    (id) => {
      if (isActiveEdit) return;
      manualWeightIds.current.delete(id);
      setForm((p) => {
        const filtered = p.mocks.filter((m) => m.id !== id);
        if (!filtered.length) return { ...p, mocks: [] };
        return { ...p, mocks: redistributeWeights(filtered, manualWeightIds.current) };
      });
    },
    [isActiveEdit]
  );

  const updateWeight = useCallback(
    (id, weight) => {
      if (isActiveEdit) return;
      const num = Math.max(0, Math.min(100, parseInt(weight, 10) || 0));
      manualWeightIds.current.add(id);
      setForm((p) => ({
        ...p,
        mocks: redistributeWeights(p.mocks, manualWeightIds.current, id, num),
      }));
    },
    [isActiveEdit]
  );

  /* -- Drag & drop -- */
  const handleDragStart = useCallback((i) => {
    if (isActiveEdit) return;
    dragIndexRef.current = i;
    setDragIndex(i);
  }, [isActiveEdit]);
  const handleDragEnd = useCallback(() => {
    dragIndexRef.current = null;
    setDragIndex(null);
  }, []);
  const handleDragOver = useCallback((e, i) => {
    if (isActiveEdit) return;
    e.preventDefault();
    const prev = dragIndexRef.current;
    if (prev === null || prev === i) return;
    setForm((f) => {
      const mocks = [...f.mocks];
      const [moved] = mocks.splice(prev, 1);
      mocks.splice(i, 0, moved);
      return { ...f, mocks };
    });
    dragIndexRef.current = i;
    setDragIndex(i);
  }, [isActiveEdit]);

  /* -- Derived values -- */
  const totalWeight = useMemo(() => form.mocks.reduce((s, m) => s + m.weight, 0), [form.mocks]);
  const totalDuration = useMemo(
    () => form.mocks.reduce((s, m) => s + (m.durationMin || parseDurationMin(m.duration)), 0),
    [form.mocks]
  );

  const fieldErrors = useMemo(() => {
    const errors = {};
    const scheduleMode = isActiveEdit ? 'active' : form.scheduleMode || 'active';
    const today = startOfTodayTimestamp();
    const startDate = dateInputToTimestamp(form.startDate);
    const endDate = dateInputToEndTimestamp(form.endDate);
    const initialEndDate = dateInputToEndTimestamp(initialEndDateInput);
    if (form.title.trim().length < MIN_TITLE_LENGTH)
      errors.title = `Job title must be at least ${MIN_TITLE_LENGTH} characters.`;
    if (!form.department) errors.department = 'Department is required.';
    if (!form.jobType) errors.jobType = 'Job type is required.';
    if (!form.seniority) errors.seniority = 'Seniority level is required.';
    if (form.description.trim().length < MIN_DESCRIPTION_LENGTH)
      errors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters.`;
    if (!form.technologies.length) errors.technologies = 'Add at least one technology.';
    if (!form.mocks.length) errors.mocks = 'Add at least one mock interview.';
    if (form.mocks.length && totalWeight !== 100) errors.mockWeights = 'Mock weights must total 100%.';

    if (scheduleMode === 'scheduled') {
      if (!form.startDate) {
        errors.startDate = 'Start date is required.';
      } else if (!startDate) {
        errors.startDate = 'Enter a valid start date.';
      } else if (startDate < today) {
        errors.startDate = 'Start date cannot be in the past.';
      }
    }

    if (!form.endDate) {
      errors.endDate = 'End date is required.';
    } else if (!endDate) {
      errors.endDate = 'Enter a valid end date.';
    } else if (scheduleMode === 'scheduled' && startDate && endDate <= startDate) {
      errors.endDate = 'End date must be after the start date.';
    } else if (scheduleMode !== 'scheduled' && endDate < today) {
      errors.endDate = 'End date must be after today.';
    } else if (isActiveEdit && initialEndDate && endDate < initialEndDate) {
      errors.endDate = 'Active jobs can only have their end date extended.';
    }

    return errors;
  }, [
    form.department,
    form.description,
    form.endDate,
    form.jobType,
    form.mocks.length,
    form.seniority,
    form.scheduleMode,
    form.startDate,
    form.technologies,
    form.title,
    initialEndDateInput,
    isActiveEdit,
    totalWeight,
  ]);

  const showFieldError = useCallback(
    (field) =>
      Boolean(fieldErrors[field]) &&
      (Boolean(touched[field]) || Boolean(attemptedErrors[activeStep])),
    [fieldErrors, touched, attemptedErrors, activeStep]
  );

  const stepValidity = useMemo(
    () => {
      const jobInfoValid =
        !fieldErrors.title &&
        !fieldErrors.description &&
        !fieldErrors.department &&
        !fieldErrors.jobType &&
        !fieldErrors.seniority &&
        !fieldErrors.technologies;
      const mocksValid = !fieldErrors.mocks && !fieldErrors.mockWeights;
      const schedulingValid = !fieldErrors.startDate && !fieldErrors.endDate;

      return {
        0: jobInfoValid,
        1: mocksValid,
        2: schedulingValid,
        3: isActiveEdit ? schedulingValid : jobInfoValid && mocksValid && schedulingValid,
      };
    },
    [
      fieldErrors.department,
      fieldErrors.description,
      fieldErrors.endDate,
      fieldErrors.jobType,
      fieldErrors.mockWeights,
      fieldErrors.mocks,
      fieldErrors.seniority,
      fieldErrors.startDate,
      fieldErrors.technologies,
      fieldErrors.title,
      isActiveEdit,
    ]
  );

  const goNext = useCallback(
    () => setActiveStep((s) => Math.min(s + 1, STEPS.length - 1)),
    [STEPS.length]
  );
  const handleNext = useCallback(() => {
    if (stepValidity[activeStep]) {
      setAttemptedErrors((p) => ({ ...p, [activeStep]: false }));
      goNext();
    } else {
      setAttemptedErrors((p) => ({ ...p, [activeStep]: true }));
    }
  }, [activeStep, goNext, stepValidity]);
  const goBack = useCallback(() => setActiveStep((s) => Math.max(s - 1, 0)), []);

  useEffect(() => {
    pageScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep]);

  const statusPreview = useMemo(() => {
    const lines = [];
    const scheduleMode = isActiveEdit ? 'active' : form.scheduleMode || 'active';
    const now = new Date();
    const start = scheduleMode === 'scheduled' && form.startDate ? new Date(form.startDate) : null;
    const end = form.endDate ? new Date(form.endDate) : null;
    if (!start || start <= now) lines.push({ color: 'green', text: 'Will be Active immediately' });
    else
      lines.push({
        color: 'yellow',
        text: `Will be Scheduled until ${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      });
    if (end)
      lines.push({
        color: 'red',
        text: `Will Auto-close on ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      });
    if (form.maxCandidates)
      lines.push({
        color: 'red',
        text: `Will Auto-close after ${form.maxCandidates} applications`,
      });
    return lines;
  }, [form.scheduleMode, form.startDate, form.endDate, form.maxCandidates, isActiveEdit]);

  const departmentOptions = useMemo(() => {
    if (!form.department) return DEPARTMENT_OPTIONS;
    return DEPARTMENT_OPTIONS.some((o) => o.value === form.department)
      ? DEPARTMENT_OPTIONS
      : [
          ...DEPARTMENT_OPTIONS,
          {
            value: form.department,
            label: form.department.charAt(0).toUpperCase() + form.department.slice(1),
          },
        ];
  }, [form.department]);

  const enabledEmailCount = useMemo(
    () => EMAIL_TRIGGERS.filter((t) => form.emails[t.id]).length,
    [form.emails]
  );

  /* -- Render steps -- */
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <StepJobInfo
            form={form}
            updateField={updateField}
            departmentOptions={departmentOptions}
            addTechnology={addTechnology}
            removeTechnology={removeTechnology}
            validationErrors={fieldErrors}
            markTouched={markTouched}
            showFieldError={showFieldError}
            disabled={isActiveEdit}
          />
        );
      case 1:
        return (
          <StepMocks
            mocks={form.mocks}
            addMock={addMock}
            removeMock={removeMock}
            updateWeight={updateWeight}
            totalWeight={totalWeight}
            totalDuration={totalDuration}
            showLibrary={showMockLibrary}
            setShowLibrary={setShowMockLibrary}
            librarySearch={librarySearch}
            setLibrarySearch={setLibrarySearch}
            dragIndex={dragIndex}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            isLocked={isActiveEdit}
            validationErrors={fieldErrors}
            showError={Boolean(attemptedErrors[activeStep])}
          />
        );
      case 2:
        return (
          <StepScheduling
            form={form}
            updateField={updateField}
            updateEmail={updateEmail}
            statusPreview={statusPreview}
            validationErrors={fieldErrors}
            markTouched={markTouched}
            showFieldError={showFieldError}
            isActiveEdit={isActiveEdit}
          />
        );
      case 3:
        return (
          <StepReview
            form={form}
            totalWeight={totalWeight}
            totalDuration={totalDuration}
            statusPreview={statusPreview}
            enabledEmailCount={enabledEmailCount}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="create-job-page" ref={pageScrollRef}>
      <div className="create-job">
        {/* Stepper */}
        <div className="create-job__stepper">
          <Stepper
            steps={STEPS}
            activeStep={activeStep}
            onStepClick={setActiveStep}
            stepValidity={stepValidity}
          />
        </div>

        {/* Edit context banner */}
        {isEdit && status && <EditBanner status={status} />}

        {activeStep > 0 && (
          <div className="create-job__mobile-back">
            <Button variant="ghost" iconLeft={<ArrowLeft size={16} />} onClick={goBack}>
              Back
            </Button>
          </div>
        )}

        {/* Step body */}
        <div className="create-job__body" key={activeStep}>
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="create-job__footer">
          <div className="create-job__footer-left">
            {activeStep > 0 && (
              <Button variant="ghost" iconLeft={<ArrowLeft size={16} />} onClick={goBack}>
                Back
              </Button>
            )}
          </div>

          <div className="create-job__footer-right">
            {activeStep < STEPS.length - 1 ? (
              <Button variant="primary" iconRight={<ArrowRight size={16} />} onClick={handleNext}>
                Continue
              </Button>
            ) : isEdit ? (
              <EditFooterActions
                onSaveChanges={() => onSaveChanges?.(form)}
                disabled={!stepValidity[3]}
              />
            ) : (
              <Button
                variant="primary"
                iconLeft={<Rocket size={16} />}
                onClick={() => onPublish?.(form)}
                disabled={!stepValidity[3]}
              >
                Publish Job
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
