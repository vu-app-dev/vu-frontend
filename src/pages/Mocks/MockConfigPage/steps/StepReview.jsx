import { Clock } from 'lucide-react';
import { SectionTitle } from '../../../../components/ui/SectionTitle';
import { DIFFICULTY_OPTIONS, MOCK_TYPE_OPTIONS } from '../../../../api';

export function StepReview({ form, totalWeight }) {
  const typeLabel = MOCK_TYPE_OPTIONS.find((option) => option.value === form.type)?.label || form.type || '-';
  const diffLabel =
    DIFFICULTY_OPTIONS.find((option) => option.value === form.difficulty)?.label ||
    form.difficulty ||
    '-';
  const durLabel = form.durationMin ? `${form.durationMin} min` : '-';

  const weightClass =
    totalWeight === 100
      ? 'create-mock__weight-value--exact'
      : totalWeight > 100
        ? 'create-mock__weight-value--over'
        : '';

  return (
    <>
      <section className="create-mock__section">
        <SectionTitle variant="inline">Assessment basics</SectionTitle>
        <div className="create-mock__review-row">
          <div className="create-mock__review-group">
            <span className="create-mock__review-label">Assessment name</span>
            <span className="create-mock__review-value">{form.title || '-'}</span>
          </div>
          <div className="create-mock__review-group">
            <span className="create-mock__review-label">Type</span>
            <span className="create-mock__review-value">{typeLabel}</span>
          </div>
        </div>
        <div className="create-mock__review-row">
          <div className="create-mock__review-group">
            <span className="create-mock__review-label">Difficulty</span>
            <span className="create-mock__review-value">{diffLabel}</span>
          </div>
          <div className="create-mock__review-group">
            <span className="create-mock__review-label">Duration</span>
            <span className="create-mock__review-value">{durLabel}</span>
          </div>
        </div>
        {form.description && (
          <div className="create-mock__review-group">
            <span className="create-mock__review-label">Candidate-facing summary</span>
            <span className="create-mock__review-value">{form.description}</span>
          </div>
        )}
      </section>

      {form.technologies.length > 0 && (
        <section className="create-mock__section">
          <SectionTitle variant="inline">Skills covered</SectionTitle>
          <div className="create-mock__review-tags">
            {form.technologies.map((skill) => (
              <span key={skill} className="create-mock__review-tag">
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="create-mock__section">
        <SectionTitle variant="inline">Scoring structure</SectionTitle>

        {form.topics.length > 0 && (
          <>
            <span className="create-mock__review-sublabel">Score categories</span>
            <div className="create-mock__scoring">
              {form.topics.map((topic) => (
                <div key={topic.id} className="create-mock__scoring-row">
                  <span className="create-mock__scoring-name">{topic.name || '(unnamed)'}</span>
                  <span className="create-mock__scoring-weight">{topic.weight}%</span>
                </div>
              ))}
            </div>
          </>
        )}

        {form.questions.length > 0 && (
          <>
            <span className="create-mock__review-sublabel">Interview questions</span>
            <div className="create-mock__scoring">
              {form.questions.map((question, index) => (
                <div key={question.id} className="create-mock__scoring-row">
                  <span className="create-mock__scoring-name">
                    Q{index + 1}: {question.title || '(untitled)'}
                  </span>
                  <span className="create-mock__scoring-weight">{question.weight}%</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="create-mock__weight-bar">
          <span className="create-mock__weight-label">Total weight</span>
          <span className={`create-mock__weight-value ${weightClass}`}>{totalWeight}%</span>
        </div>
      </section>

      <section className="create-mock__section">
        <SectionTitle variant="inline">Session summary</SectionTitle>
        <div className="create-mock__pipeline">
          <div className="create-mock__pipeline-item">
            <span className="create-mock__pipeline-number">{form.technologies.length}</span>
            <span className="create-mock__pipeline-label">Skills</span>
          </div>
          <div className="create-mock__pipeline-item">
            <span className="create-mock__pipeline-number">{form.topics.length}</span>
            <span className="create-mock__pipeline-label">Categories</span>
          </div>
          <div className="create-mock__pipeline-item">
            <span className="create-mock__pipeline-number">{form.questions.length}</span>
            <span className="create-mock__pipeline-label">Questions</span>
          </div>
          <div className="create-mock__pipeline-item">
            <span className="create-mock__pipeline-number">
              <Clock size={16} /> {form.durationMin || 0}
            </span>
            <span className="create-mock__pipeline-label">Minutes</span>
          </div>
        </div>
      </section>
    </>
  );
}
