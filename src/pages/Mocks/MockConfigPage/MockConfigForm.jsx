import { useState, useCallback, useMemo, useRef, useEffect, memo } from 'react';
import { ArrowLeft, ArrowRight, Rocket, CheckCircle, Info } from 'lucide-react';
import { Stepper } from '../../../components/ui/Stepper';
import { Button } from '../../../components/ui/Button';
import { StepBasicInfoSkills, StepEvaluation, StepReview } from './steps';
import {
  MOCK_STEPS_CREATE as STEPS_CREATE,
  MOCK_STEPS_EDIT as STEPS_EDIT,
  INITIAL_MOCK_FORM,
} from '../../../api';
import { redistributeWeightsPair } from '../../../utils';
import './MockConfigForm.css';

const MIN_TITLE_LENGTH = 3;
const MIN_DESCRIPTION_LENGTH = 10;

function validateMockBasics(form) {
  const errors = {};
  if (form.title.trim().length < MIN_TITLE_LENGTH)
    errors.title = `Mock name must be at least ${MIN_TITLE_LENGTH} characters.`;
  if (!form.type) errors.type = 'Type is required.';
  if (!form.difficulty) errors.difficulty = 'Difficulty is required.';
  if (!form.durationMin) errors.durationMin = 'Estimated duration is required.';
  if (form.description.trim().length < MIN_DESCRIPTION_LENGTH)
    errors.description = `Description must be at least ${MIN_DESCRIPTION_LENGTH} characters.`;
  if (!form.technologies.length) errors.technologies = 'Add at least one technology.';
  return errors;
}

export const MockConfigForm = memo(function MockConfigForm({
  mode = 'create',
  initialData,
  isActive = false,
  onPublish,
  onSaveChanges,
}) {
  const isEdit = mode === 'edit';
  const STEPS = isEdit ? STEPS_EDIT : STEPS_CREATE;

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(initialData ?? INITIAL_MOCK_FORM);
  const [touched, setTouched] = useState({});
  const [attemptedErrors, setAttemptedErrors] = useState({});
  const markTouched = useCallback((field) => setTouched((p) => ({ ...p, [field]: true })), []);
  const pageScrollRef = useRef(null);

  /** Track manually-edited weight ids (topics + questions share one set) */
  const manualWeightIds = useRef(new Set());

  /* -- Field helpers -- */
  const updateField = useCallback((field, value) => setForm((p) => ({ ...p, [field]: value })), []);

  /* -- Technologies -- */
  const addTechnology = useCallback((tag) => {
    if (isActive) return;
    const n = tag.trim().charAt(0).toUpperCase() + tag.trim().slice(1);
    if (!n) return;
    setForm((p) =>
      p.technologies.some((s) => s.toLowerCase() === n.toLowerCase())
        ? p
        : { ...p, technologies: [...p.technologies, n] }
    );
  }, [isActive]);

  const removeTechnology = useCallback(
    (tag) => {
      if (isActive) return;
      setForm((p) => ({ ...p, technologies: p.technologies.filter((s) => s !== tag) }));
    },
    [isActive]
  );

  /* -- Shared weight redistribution -- */
  const redistribute = useCallback((topics, questions, targetId, targetWeight) => {
    const { listA, listB } = redistributeWeightsPair(
      topics,
      questions,
      manualWeightIds.current,
      targetId,
      targetWeight
    );
    return { topics: listA, questions: listB };
  }, []);

  /* -- Topics -- */
  const addTopic = useCallback(() => {
    if (isActive) return;
    manualWeightIds.current.clear();
    setForm((p) => {
      const newTopics = [...p.topics, { id: `t${Date.now()}`, name: '', weight: 0 }];
      const { topics, questions } = redistribute(newTopics, p.questions, null, 0);
      return { ...p, topics, questions };
    });
  }, [isActive, redistribute]);

  const removeTopic = useCallback(
    (id) => {
      if (isActive) return;
      manualWeightIds.current.delete(id);
      setForm((p) => {
        const newTopics = p.topics.filter((c) => c.id !== id);
        if (!newTopics.length && !p.questions.length) return { ...p, topics: [], questions: [] };

        const { topics, questions } = redistribute(newTopics, p.questions, null, 0);
        return { ...p, topics, questions };
      });
    },
    [isActive, redistribute]
  );

  const updateTopic = useCallback(
    (id, field, value) => {
      if (isActive) return;
      if (field === 'weight') {
        const num = Math.max(0, Math.min(100, parseInt(value, 10) || 0));
        manualWeightIds.current.add(id);
        setForm((p) => {
          const updated = p.topics.map((c) => (c.id === id ? { ...c, weight: num } : c));
          const { topics, questions } = redistribute(updated, p.questions, id, num);
          return { ...p, topics, questions };
        });
      } else {
        setForm((p) => ({
          ...p,
          topics: p.topics.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
        }));
      }
    },
    [isActive, redistribute]
  );

  /* -- Questions -- */
  const addQuestion = useCallback(() => {
    if (isActive) return;
    manualWeightIds.current.clear();
    setForm((p) => {
      const newQuestions = [
        ...p.questions,
        {
          id: `q${Date.now()}`,
          title: '',
          description: '',
          difficulty: '',
          estimatedTime: '',
          weight: 0,
        },
      ];
      const { topics, questions } = redistribute(p.topics, newQuestions, null, 0);
      return { ...p, topics, questions };
    });
  }, [isActive, redistribute]);

  const removeQuestion = useCallback(
    (id) => {
      if (isActive) return;
      manualWeightIds.current.delete(id);
      setForm((p) => {
        const newQuestions = p.questions.filter((q) => q.id !== id);
        if (!newQuestions.length && !p.topics.length) return { ...p, topics: [], questions: [] };

        const { topics, questions } = redistribute(p.topics, newQuestions, null, 0);
        return { ...p, topics, questions };
      });
    },
    [isActive, redistribute]
  );

  const updateQuestion = useCallback(
    (id, data) => {
      if (isActive) return;
      setForm((p) => ({
        ...p,
        questions: p.questions.map((q) => (q.id === id ? { ...q, ...data } : q)),
      }));
    },
    [isActive]
  );

  const updateQuestionWeight = useCallback(
    (id, weight) => {
      if (isActive) return;
      const num = Math.max(0, Math.min(100, parseInt(weight, 10) || 0));
      manualWeightIds.current.add(id);
      setForm((p) => {
        const updated = p.questions.map((q) => (q.id === id ? { ...q, weight: num } : q));
        const { topics, questions } = redistribute(p.topics, updated, id, num);
        return { ...p, topics, questions };
      });
    },
    [isActive, redistribute]
  );

  /* -- Derived values -- */
  const totalWeight = useMemo(
    () =>
      form.topics.reduce((s, c) => s + (parseInt(c.weight, 10) || 0), 0) +
      form.questions.reduce((s, q) => s + (parseInt(q.weight, 10) || 0), 0),
    [form.topics, form.questions]
  );

  const totalItems = form.topics.length + form.questions.length;

  const basicErrors = useMemo(() => validateMockBasics(form), [form]);

  const evaluationErrors = useMemo(() => {
    const topicErrors = {};
    for (const topic of form.topics) {
      const name = String(topic.name || '').trim();
      if (!name) topicErrors[topic.id] = 'Topic name is required.';
      else if (name.length < 3) topicErrors[topic.id] = 'Topic name must be at least 3 characters.';
    }

    const questionErrors = {};
    for (const question of form.questions) {
      const next = {};
      if (String(question.title || '').trim().length < 3)
        next.title = 'Question title must be at least 3 characters.';
      if (String(question.description || '').trim().length < 10)
        next.description = 'Question description must be at least 10 characters.';
      if (!question.difficulty) next.difficulty = 'Question difficulty is required.';
      if (!question.estimatedTime) next.estimatedTime = 'Estimated time is required.';
      if (Object.keys(next).length) questionErrors[question.id] = next;
    }

    return {
      items: totalItems > 0 ? '' : 'Add at least one topic or question.',
      totalWeight: totalWeight === 100 ? '' : 'Total weight must equal 100%.',
      topics: topicErrors,
      questions: questionErrors,
    };
  }, [form.questions, form.topics, totalItems, totalWeight]);

  const hasEvaluationFieldErrors =
    Object.keys(evaluationErrors.topics).length > 0 ||
    Object.keys(evaluationErrors.questions).length > 0;

  const stepValidity = useMemo(
    () => ({
      0: Object.keys(basicErrors).length === 0,
      1: totalItems > 0 && totalWeight === 100 && !hasEvaluationFieldErrors,
      2:
        Object.keys(basicErrors).length === 0 &&
        totalItems > 0 &&
        totalWeight === 100 &&
        !hasEvaluationFieldErrors,
    }),
    [basicErrors, hasEvaluationFieldErrors, totalItems, totalWeight]
  );

  // const canNext = stepValidity[activeStep];
  const goNext = useCallback(
    () => setActiveStep((s) => Math.min(s + 1, STEPS.length - 1)),
    [STEPS.length]
  );
  const handleNext = useCallback(() => {
    if (stepValidity[activeStep]) goNext();
    else setAttemptedErrors((p) => ({ ...p, [activeStep]: true }));
  }, [activeStep, goNext, stepValidity]);
  const goBack = useCallback(() => setActiveStep((s) => Math.max(s - 1, 0)), []);
  const showFieldError = useCallback(
    (field) => {
      // basic top-level fields
      if (basicErrors && basicErrors[field])
        return Boolean(touched[field]) || Boolean(attemptedErrors[activeStep]);
      return false;
    },
    [basicErrors, touched, attemptedErrors, activeStep]
  );

  useEffect(() => {
    pageScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeStep]);

  /* -- Render steps -- */
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <StepBasicInfoSkills
            form={form}
            updateField={updateField}
            addTechnology={addTechnology}
            removeTechnology={removeTechnology}
            isActive={isActive}
            validationErrors={basicErrors}
            markTouched={markTouched}
            showFieldError={showFieldError}
          />
        );
      case 1:
        return (
          <StepEvaluation
            form={form}
            isActive={isActive}
            addTopic={addTopic}
            removeTopic={removeTopic}
            updateTopic={updateTopic}
            addQuestion={addQuestion}
            removeQuestion={removeQuestion}
            updateQuestion={updateQuestion}
            updateQuestionWeight={updateQuestionWeight}
            totalWeight={totalWeight}
            validationErrors={evaluationErrors}
            markTouched={markTouched}
            touched={touched}
            attemptedErrors={attemptedErrors}
          />
        );
      case 2:
        return <StepReview form={form} totalWeight={totalWeight} />;
      default:
        return null;
    }
  };

  return (
    <div className="create-mock-page" ref={pageScrollRef}>
      <div className="create-mock">
        {/* Stepper */}
        <div className="create-mock__stepper">
          <Stepper
            steps={STEPS}
            activeStep={activeStep}
            onStepClick={setActiveStep}
            stepValidity={stepValidity}
          />
        </div>

        {/* Active banner */}
        {isActive && isEdit && (
          <div className="create-mock__active-banner">
            <Info size={16} />
            <span>
              This mock is used in active jobs. Some fields are locked to protect ongoing
              evaluations.
            </span>
          </div>
        )}

        {activeStep > 0 && (
          <div className="create-mock__mobile-back">
            <Button variant="ghost" iconLeft={<ArrowLeft size={16} />} onClick={goBack}>
              Back
            </Button>
          </div>
        )}
        {/* Step body */}
        <div className="create-mock__body" key={activeStep}>
          {renderStep()}
        </div>

        {/* Footer */}
        <div className="create-mock__footer">
          <div className="create-mock__footer-left">
            {activeStep > 0 && (
              <Button variant="ghost" iconLeft={<ArrowLeft size={16} />} onClick={goBack}>
                Back
              </Button>
            )}
          </div>
          <div className="create-mock__footer-right">
            {activeStep < STEPS.length - 1 ? (
              <Button variant="primary" iconRight={<ArrowRight size={16} />} onClick={handleNext}>
                Continue
              </Button>
            ) : isEdit ? (
              <Button
                variant="primary"
                iconLeft={<CheckCircle size={16} />}
                onClick={() => onSaveChanges?.(form)}
                disabled={!stepValidity[2]}
              >
                Save Changes
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  iconLeft={<Rocket size={16} />}
                  onClick={() => onPublish?.(form)}
                  disabled={!stepValidity[2]}
                >
                  Create Mock
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
