import { Clock } from 'lucide-react';
import { SectionTitle } from '../../../../components/ui/SectionTitle';
import { MOCK_TYPE_OPTIONS, DIFFICULTY_OPTIONS } from '../../../../api';

export function StepReview({ form, totalWeight }) {
  const typeLabel = MOCK_TYPE_OPTIONS.find((o) => o.value === form.type)?.label || form.type || '—';
  const diffLabel =
    DIFFICULTY_OPTIONS.find((o) => o.value === form.difficulty)?.label || form.difficulty || '—';
  const durLabel = form.durationMin ? `${form.durationMin} min` : '—';

  const weightClass =
    totalWeight === 100
      ? 'create-mock__weight-value--exact'
      : totalWeight > 100
        ? 'create-mock__weight-value--over'
        : '';

  return (
    <>
      {/* Mock Info */}
      <section className="create-mock__section">
        <SectionTitle variant="inline">Mock Information</SectionTitle>
        <div className="create-mock__review-row">
          <div className="create-mock__review-group">
            <span className="create-mock__review-label">Mock Name</span>
            <span className="create-mock__review-value">{form.title || '—'}</span>
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
            <span className="create-mock__review-label">Description</span>
            <span className="create-mock__review-value">{form.description}</span>
          </div>
        )}
      </section>

      {/* Technologies */}
      {form.technologies.length > 0 && (
        <section className="create-mock__section">
          <SectionTitle variant="inline">Technologies Covered</SectionTitle>
          <div className="create-mock__review-tags">
            {form.technologies.map((s) => (
              <span key={s} className="create-mock__review-tag">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Evaluation */}
      <section className="create-mock__section">
        <SectionTitle variant="inline">Evaluation Structure</SectionTitle>

        {form.topics.length > 0 && (
          <>
            <span className="create-mock__review-sublabel">Topics</span>
            <div className="create-mock__scoring">
              {form.topics.map((c) => (
                <div key={c.id} className="create-mock__scoring-row">
                  <span className="create-mock__scoring-name">{c.name || '(unnamed)'}</span>
                  <span className="create-mock__scoring-weight">{c.weight}%</span>
                </div>
              ))}
            </div>
          </>
        )}

        {form.questions.length > 0 && (
          <>
            <span className="create-mock__review-sublabel">Questions</span>
            <div className="create-mock__scoring">
              {form.questions.map((q, idx) => (
                <div key={q.id} className="create-mock__scoring-row">
                  <span className="create-mock__scoring-name">
                    Q{idx + 1}: {q.title || '(untitled)'}
                  </span>
                  <span className="create-mock__scoring-weight">{q.weight}%</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="create-mock__weight-bar">
          <span className="create-mock__weight-label">Total Weight</span>
          <span className={`create-mock__weight-value ${weightClass}`}>{totalWeight}%</span>
        </div>
      </section>

      {/* Summary */}
      <section className="create-mock__section">
        <SectionTitle variant="inline">Summary</SectionTitle>
        <div className="create-mock__pipeline">
          <div className="create-mock__pipeline-item">
            <span className="create-mock__pipeline-number">{form.technologies.length}</span>
            <span className="create-mock__pipeline-label">Technologies</span>
          </div>
          <div className="create-mock__pipeline-item">
            <span className="create-mock__pipeline-number">{form.topics.length}</span>
            <span className="create-mock__pipeline-label">Topics</span>
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
