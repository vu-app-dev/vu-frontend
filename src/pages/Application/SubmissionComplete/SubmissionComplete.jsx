import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, Clock, FileText, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { APPLICATION, CANDIDATE_INFO, getCompletedCount } from '../../../api';
import './SubmissionComplete.css';

/* ── Component ── */
export const SubmissionComplete = memo(function SubmissionComplete({ onBackToJobs }) {
  const completedCount = getCompletedCount();
  const totalCount = APPLICATION?.mocks?.length ?? 0;
  const jobTitle = APPLICATION?.job?.title ?? 'the position';
  const companyName = APPLICATION?.company?.name ?? 'the company';
  const candidateName = CANDIDATE_INFO.firstName || 'Candidate';
  const submittedAt = useMemo(
    () =>
      new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    []
  );

  return (
    <div className="submission-complete">
      <div className="submission-complete__container">
        {/* Success icon */}
        <div className="submission-complete__icon-wrapper">
          <CheckCircle2 size={48} />
        </div>

        {/* Title */}
        <h1 className="submission-complete__title">Application Submitted!</h1>
        <p className="submission-complete__subtitle">
          Thank you, {candidateName}. Your application for <strong>{jobTitle}</strong> at{' '}
          <strong>{companyName}</strong> has been successfully submitted.
        </p>

        {/* Summary card */}
        <div className="submission-complete__summary">
          <h3 className="submission-complete__summary-title">Application Summary</h3>
          <div className="submission-complete__summary-divider" />
          <div className="submission-complete__summary-list">
            <div className="submission-complete__summary-item">
              <FileText size={14} />
              <span className="submission-complete__summary-label">Assessments Completed</span>
              <span className="submission-complete__summary-value">
                {completedCount} / {totalCount}
              </span>
            </div>
            <div className="submission-complete__summary-item">
              <Clock size={14} />
              <span className="submission-complete__summary-label">Submitted At</span>
              <span className="submission-complete__summary-value">{submittedAt}</span>
            </div>
          </div>
        </div>

        {/* What's next */}
        <div className="submission-complete__next">
          <h3 className="submission-complete__next-title">What Happens Next?</h3>
          <div className="submission-complete__timeline">
            <div className="submission-complete__timeline-step">
              <div className="submission-complete__timeline-dot submission-complete__timeline-dot--done" />
              <div className="submission-complete__timeline-content">
                <span className="submission-complete__timeline-label">Application Received</span>
                <span className="submission-complete__timeline-desc">
                  Your responses have been recorded
                </span>
              </div>
            </div>
            <div className="submission-complete__timeline-step">
              <div className="submission-complete__timeline-dot submission-complete__timeline-dot--active" />
              <div className="submission-complete__timeline-content">
                <span className="submission-complete__timeline-label">AI Evaluation</span>
                <span className="submission-complete__timeline-desc">
                  Your answers are being analyzed by our AI system
                </span>
              </div>
            </div>
            <div className="submission-complete__timeline-step">
              <div className="submission-complete__timeline-dot" />
              <div className="submission-complete__timeline-content">
                <span className="submission-complete__timeline-label">Team Review</span>
                <span className="submission-complete__timeline-desc">
                  The hiring team will review your results
                </span>
              </div>
            </div>
            <div className="submission-complete__timeline-step">
              <div className="submission-complete__timeline-dot" />
              <div className="submission-complete__timeline-content">
                <span className="submission-complete__timeline-label">Decision</span>
                <span className="submission-complete__timeline-desc">
                  You&apos;ll be notified via email about the outcome
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action */}
        <Button
          variant="ghost"
          size="sm"
          iconLeft={<ArrowLeft size={16} />}
          className="submission-complete__back-btn"
          onClick={onBackToJobs}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
});

SubmissionComplete.propTypes = {
  onBackToJobs: PropTypes.func.isRequired,
};
