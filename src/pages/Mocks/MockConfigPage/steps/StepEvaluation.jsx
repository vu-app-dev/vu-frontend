import { Trash2, Plus } from 'lucide-react';
import { SectionTitle } from '../../../../components/ui/SectionTitle';
import { TextInput } from '../../../../components/ui/Input';
import { Button } from '../../../../components/ui/Button';
import { QuestionCard } from '../../../../components/ui/Cards';

export function StepEvaluation({
  form,
  isActive,
  addTopic,
  removeTopic,
  updateTopic,
  addQuestion,
  removeQuestion,
  updateQuestion,
  updateQuestionWeight,
  totalWeight,
  validationErrors,
  markTouched,
  touched = {},
  attemptedErrors = {},
}) {
  const weightClass =
    totalWeight === 100
      ? 'create-mock__weight-value--exact'
      : totalWeight > 100
        ? 'create-mock__weight-value--over'
        : '';

  const totalItems = form.topics.length + form.questions.length;

  return (
    <>
      <section className="create-mock__section">
        <SectionTitle
          variant="inline"
          description="All topics and questions share a single 100% weight pool. Weights auto-redistribute when items are added."
        >
          Evaluation Structure
        </SectionTitle>

        {totalItems > 0 && (
          <div className="create-mock__weight-bar">
            <span className="create-mock__weight-label">Total Weight (Topics + Questions)</span>
            <span className={`create-mock__weight-value ${weightClass}`}>{totalWeight}%</span>
          </div>
        )}
        {validationErrors?.totalWeight && (
          <p className="create-mock__hint">{validationErrors.totalWeight}</p>
        )}
        {validationErrors?.items && <p className="create-mock__hint">{validationErrors.items}</p>}
      </section>

      {/* Topics section */}
      <section className="create-mock__section">
        <SectionTitle variant="inline" description="Define scoring topics with weights">
          Scoring Topics
        </SectionTitle>

            {form.topics.length > 0 && (
          <div className="create-mock__criteria-list">
            {form.topics.map((topic) => (
              <div key={topic.id} className="create-mock__criteria-item">
                <div className="create-mock__criteria-name">
                  <TextInput
                    showLabel={false}
                    placeholder="e.g. Problem Solving"
                    value={topic.name}
                    onChange={(e) => updateTopic(topic.id, 'name', e.target.value)}
                    onBlur={() => markTouched?.(`topic:${topic.id}`)}
                    error={
                      Boolean(validationErrors?.topics?.[topic.id]) &&
                      (Boolean(touched[`topic:${topic.id}`]) || Boolean(attemptedErrors[1]))
                    }
                    hint={
                      Boolean(validationErrors?.topics?.[topic.id]) &&
                      (Boolean(touched[`topic:${topic.id}`]) || Boolean(attemptedErrors[1]))
                        ? validationErrors?.topics?.[topic.id]
                        : ''
                    }
                    disabled={isActive}
                  />
                </div>
                <div className="create-mock__criteria-weight">
                  <TextInput
                    showLabel={false}
                    showHint={false}
                    value={String(topic.weight)}
                    onChange={(e) => updateTopic(topic.id, 'weight', e.target.value)}
                    placeholder="%"
                    disabled={isActive}
                  />
                </div>
                <button
                  type="button"
                  className="create-mock__criteria-remove"
                  onClick={() => removeTopic(topic.id)}
                  disabled={isActive}
                  title={isActive ? 'Cannot remove topics from an active mock' : `Remove topic`}
                  aria-label={`Remove ${topic.name}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <Button variant="dashed" iconLeft={<Plus size={16} />} onClick={addTopic} disabled={isActive}>
          Add Topic
        </Button>
      </section>

      {/* Questions section */}
      <section className="create-mock__section">
        <SectionTitle variant="inline" description="Add individual questions with score weights">
          Custom Questions
        </SectionTitle>

        {form.questions.length > 0 && (
          <div className="create-mock__questions-list">
                {form.questions.map((question, idx) => (
              <div key={question.id} className="create-mock__question-wrapper">
                <QuestionCard
                  questionNumber={idx + 1}
                  variant="edit"
                  defaultTitle={question.title}
                  defaultDescription={question.description}
                  defaultDifficulty={question.difficulty}
                  defaultEstimatedTime={question.estimatedTime}
                  defaultExpanded={!question.title}
                  onChange={(data) => updateQuestion(question.id, data)}
                  onRemove={isActive ? undefined : () => removeQuestion(question.id)}
                      questionId={question.id}
                      errors={(() => {
                        const qErr = validationErrors?.questions?.[question.id];
                        if (!qErr) return null;
                        const visible = {};
                        if (attemptedErrors[1] || touched[`question:${question.id}:title`]) visible.title = qErr.title;
                        if (attemptedErrors[1] || touched[`question:${question.id}:description`]) visible.description = qErr.description;
                        if (attemptedErrors[1] || touched[`question:${question.id}:difficulty`]) visible.difficulty = qErr.difficulty;
                        if (attemptedErrors[1] || touched[`question:${question.id}:estimatedTime`]) visible.estimatedTime = qErr.estimatedTime;
                        return Object.keys(visible).length ? visible : null;
                      })()}
                      markTouched={markTouched}
                />
                <div className="create-mock__question-weight">
                  <span className="create-mock__question-weight-label">Weight</span>
                  <div className="create-mock__question-weight-input">
                    <TextInput
                      showLabel={false}
                      showHint={false}
                      value={String(question.weight)}
                      onChange={(e) => updateQuestionWeight(question.id, e.target.value)}
                      placeholder="%"
                      disabled={isActive}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Button
          variant="dashed"
          iconLeft={<Plus size={16} />}
          onClick={addQuestion}
          disabled={isActive}
        >
          Add Question
        </Button>
      </section>
    </>
  );
}
