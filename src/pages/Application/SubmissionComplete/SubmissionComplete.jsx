import { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, Clock, FileText, ArrowLeft, Sparkles, Users, Mail } from 'lucide-react';
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
        <section className="submission-complete__hero" aria-labelledby="submission-complete-title">
          <p className="submission-complete__kicker">Application submitted</p>
          <h1 id="submission-complete-title" className="submission-complete__title">
            Thank you, {candidateName}.
          </h1>
          <p className="submission-complete__subtitle">
            Your application for <strong>{jobTitle}</strong> at <strong>{companyName}</strong> is
            now with the hiring workflow.
          </p>

          <div className="submission-complete__hero-note">
            <Sparkles size={16} />
            <span>We received your profile, setup checks, and interview responses.</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            iconLeft={<ArrowLeft size={16} />}
            className="submission-complete__back-btn"
            onClick={onBackToJobs}
          >
            Back to Home
          </Button>
        </section>

        <aside className="submission-complete__panel" aria-label="Submission details">
          <div className="submission-complete__summary">
            <div className="submission-complete__section-header">
              <p className="submission-complete__section-label">Summary</p>
              <h2 className="submission-complete__section-title">What was submitted</h2>
            </div>

            <div className="submission-complete__summary-list">
              <div className="submission-complete__summary-item">
                <span className="submission-complete__summary-icon">
                  <FileText size={16} />
                </span>
                <span className="submission-complete__summary-label">Assessments completed</span>
                <span className="submission-complete__summary-value">
                  {completedCount} / {totalCount}
                </span>
              </div>
              <div className="submission-complete__summary-item">
                <span className="submission-complete__summary-icon">
                  <Clock size={16} />
                </span>
                <span className="submission-complete__summary-label">Submitted at</span>
                <span className="submission-complete__summary-value">{submittedAt}</span>
              </div>
            </div>
          </div>

          <div className="submission-complete__next">
            <div className="submission-complete__section-header">
              <p className="submission-complete__section-label">Next steps</p>
              <h2 className="submission-complete__section-title">What happens next</h2>
            </div>

            <div className="submission-complete__timeline">
              <div className="submission-complete__timeline-step">
                <div className="submission-complete__timeline-dot submission-complete__timeline-dot--done">
                  <CheckCircle2 size={12} />
                </div>
                <div className="submission-complete__timeline-content">
                  <span className="submission-complete__timeline-label">Application received</span>
                  <span className="submission-complete__timeline-desc">
                    Your responses have been recorded.
                  </span>
                </div>
              </div>
              <div className="submission-complete__timeline-step">
                <div className="submission-complete__timeline-dot submission-complete__timeline-dot--active">
                  <Sparkles size={12} />
                </div>
                <div className="submission-complete__timeline-content">
                  <span className="submission-complete__timeline-label">AI evaluation</span>
                  <span className="submission-complete__timeline-desc">
                    Your answers are being analyzed for the role requirements.
                  </span>
                </div>
              </div>
              <div className="submission-complete__timeline-step">
                <div className="submission-complete__timeline-dot">
                  <Users size={12} />
                </div>
                <div className="submission-complete__timeline-content">
                  <span className="submission-complete__timeline-label">Team review</span>
                  <span className="submission-complete__timeline-desc">
                    The hiring team will review the evaluation.
                  </span>
                </div>
              </div>
              <div className="submission-complete__timeline-step">
                <div className="submission-complete__timeline-dot">
                  <Mail size={12} />
                </div>
                <div className="submission-complete__timeline-content">
                  <span className="submission-complete__timeline-label">Decision</span>
                  <span className="submission-complete__timeline-desc">
                    You&apos;ll be notified by email when there is an update.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
});

SubmissionComplete.propTypes = {
  onBackToJobs: PropTypes.func.isRequired,
};
