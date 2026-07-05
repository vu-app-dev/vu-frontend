import { useState, useMemo, useCallback, useRef, memo } from 'react';
import PropTypes from 'prop-types';
import { Check, List, X } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { BarChart } from '../../../components/ui/Charts';
import { ConfirmDialog } from '../../../components/ui/Dialog';
import { Tabs } from '../../../components/ui/Tabs';
import { SectionTitle } from '../../../components/ui/SectionTitle';
import { MockReplay } from './MockReplay';
import { CVAnalysis } from './CVAnalysis';
import {
  JOBS,
  canCurrentUser,
  getJobById,
  updateCandidateStatus,
  useBackendData,
} from '../../../api';
import './CandidateDetails.css';

const DECISION_ACTIONS = [
  {
    id: 'accept',
    label: 'Accept',
    icon: Check,
    className: 'candidate-details__decision--accept',
  },
  {
    id: 'shortlist',
    label: 'Shortlist',
    icon: List,
    className: 'candidate-details__decision--shortlist',
  },
  {
    id: 'reject',
    label: 'Reject',
    icon: X,
    className: 'candidate-details__decision--reject',
  },
];

const STATUS_LABELS = {
  accepted: 'Accepted',
  rejected: 'Rejected',
  shortlist: 'Shortlisted',
  shortlisted: 'Shortlisted',
  pending: 'Pending',
};

const INTEGRITY_LABELS = {
  clean: 'Clean',
  flagged: 'Flagged',
  critical: 'Critical',
};

const PERFORMANCE_FIELDS = [
  ['communication', 'Communication'],
  ['problemSolving', 'Problem solving'],
  ['technical', 'Technical'],
  ['confidence', 'Confidence'],
  ['clarityOfExplanation', 'Clarity'],
  ['structuredThinking', 'Structured thinking'],
  ['askingClarifications', 'Clarifications'],
];

function clampScore(score) {
  const value = Number(score || 0);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getCandidateStatusLabel(status) {
  return STATUS_LABELS[status] || STATUS_LABELS[String(status || '').toLowerCase()] || 'Pending';
}

function getCandidateStatusVariant(status) {
  const key = String(status || '').toLowerCase();
  return STATUS_LABELS[key] ? key : 'pending';
}

function getIntegrityLabel(integrity) {
  return (
    INTEGRITY_LABELS[integrity] ||
    INTEGRITY_LABELS[String(integrity || '').toLowerCase()] ||
    'Clean'
  );
}

function getIntegrityVariant(integrity) {
  const key = String(integrity || '').toLowerCase();
  return INTEGRITY_LABELS[key] ? key : 'clean';
}

function getLatestEvidence(candidate) {
  const questionEvidence = (candidate.questions || [])
    .filter((question) => question.aiFeedback || question.answer)
    .slice(0, 3)
    .map((question, index) => ({
      id: question.id || index,
      title: question.question || `Interview response ${index + 1}`,
      description: question.aiFeedback || question.answer,
    }));

  if (questionEvidence.length) return questionEvidence;
  return [
    {
      id: 'pending-evidence',
      title: 'Evidence pending',
      description: 'Interview and resume evidence will appear here when available.',
    },
  ];
}

function getPerformanceBreakdown(candidate, assessments) {
  const performance = candidate.performance || {};
  const performanceMetrics = PERFORMANCE_FIELDS.map(([key, label]) => ({
    label,
    value: Number(performance[key] || 0),
  })).filter((item) => item.value > 0);
  if (performanceMetrics.length) return performanceMetrics.slice(0, 6);

  const questionScores = (candidate.questions || [])
    .map((question, index) => ({
      label: `Q${index + 1}`,
      value: Number(question.score),
    }))
    .filter((item) => Number.isFinite(item.value) && item.value > 0)
    .slice(0, 6);
  if (questionScores.length) return questionScores;

  const assessmentScores = (assessments || [])
    .filter((assessment) => assessment.score != null)
    .slice(0, 6)
    .map((assessment, index) => ({
      label: assessment.title || `Assessment ${index + 1}`,
      value: assessment.score,
    }));
  if (assessmentScores.length) return assessmentScores;

  const score = clampScore(candidate.score);
  return score > 0 ? [{ label: 'Overall', value: score }] : [];
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function averageScore(values) {
  const valid = values.map(Number).filter(Number.isFinite);
  if (!valid.length) return null;
  return clampScore(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function getCandidateJob(candidate) {
  if (candidate.jobId) {
    const byId = getJobById(candidate.jobId);
    if (byId) return byId;
  }

  const candidateJobTitle = normalizeText(candidate.job);
  return JOBS.find((job) => normalizeText(job.title) === candidateJobTitle) || null;
}

function getAssessmentScore(candidate, mock, isSingleMock) {
  const responses = candidate.questions || [];
  const mockQuestionTitles = new Set(
    (mock.questions || [])
      .map((question) => normalizeText(question.title || question.question))
      .filter(Boolean)
  );

  const matchingResponses = mockQuestionTitles.size
    ? responses.filter((response) => mockQuestionTitles.has(normalizeText(response.question)))
    : [];
  const matchedScore = averageScore(matchingResponses.map((response) => response.score));
  if (matchedScore != null) return matchedScore;

  if (isSingleMock && responses.length) return clampScore(candidate.score);
  return null;
}

function getCandidateJobAssessments(candidate) {
  const job = getCandidateJob(candidate);
  const mocks = job?.mocks || [];

  return mocks.map((mock, index) => {
    const score = getAssessmentScore(candidate, mock, mocks.length === 1);
    const duration = Number(mock.durationMin || 0);
    const questionCount = Number(mock.questionsCount || mock.questions?.length || 0);
    const meta = [
      duration ? `${duration} min` : '',
      questionCount ? `${questionCount} questions` : '',
    ].filter(Boolean);

    return {
      id: mock.id || `${job.id}-assessment-${index + 1}`,
      title: mock.name || mock.title || `Assessment ${index + 1}`,
      subtitle: meta.length ? meta.join(' / ') : 'Assessment setup',
      score,
      status: score == null ? 'Assigned' : 'Completed',
    };
  });
}

export const CandidateDetails = memo(function CandidateDetails({ candidate }) {
  const { dataVersion } = useBackendData();
  void dataVersion;
  const [activeTab, setActiveTab] = useState('summary');
  const [pendingDecision, setPendingDecision] = useState(null);
  const [decisionMessage, setDecisionMessage] = useState('');
  const tabContentRef = useRef(null);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const jobAssessments = useMemo(() => {
    void dataVersion;
    return getCandidateJobAssessments(candidate);
  }, [candidate, dataVersion]);

  const summaryEvidence = useMemo(() => getLatestEvidence(candidate), [candidate]);
  const performanceBreakdown = useMemo(
    () => getPerformanceBreakdown(candidate, jobAssessments),
    [candidate, jobAssessments]
  );

  const tabs = useMemo(
    () => [
      {
        label: 'Summary',
        isActive: activeTab === 'summary',
        onClick: () => handleTabChange('summary'),
      },
      {
        label: 'CV Analysis',
        isActive: activeTab === 'analysis',
        onClick: () => handleTabChange('analysis'),
      },
      {
        label: 'Replay',
        isActive: activeTab === 'replay',
        onClick: () => handleTabChange('replay'),
      },
    ],
    [activeTab, handleTabChange]
  );

  const handleDecision = useCallback(
    async (action) => {
      if (['accepted', 'rejected'].includes(candidate.status)) {
        setDecisionMessage('This candidate already has a final decision.');
        return;
      }

      try {
        await updateCandidateStatus(candidate.id, action);
        const actionLabel = DECISION_ACTIONS.find((item) => item.id === action)?.label || 'Updated';
        setDecisionMessage(`${actionLabel} decision saved.`);
      } catch (error) {
        setDecisionMessage(error.message || 'Unable to update candidate.');
      }
    },
    [candidate.id, candidate.status]
  );

  const requestDecision = useCallback(
    (action) => {
      if (action === 'accept' || action === 'reject') {
        setPendingDecision(action);
        return;
      }

      void handleDecision(action);
    },
    [handleDecision]
  );

  const confirmDecision = useCallback(async () => {
    if (!pendingDecision) return;
    const action = pendingDecision;
    setPendingDecision(null);
    await handleDecision(action);
  }, [handleDecision, pendingDecision]);

  const canChangeCandidateStatus = useMemo(() => {
    void dataVersion;
    return canCurrentUser('change_candidate_status');
  }, [dataVersion]);

  const visibleDecisionActions = useMemo(() => {
    if (!canChangeCandidateStatus) return [];
    if (['accepted', 'rejected'].includes(candidate.status)) return [];
    if (candidate.status === 'shortlist' || candidate.status === 'shortlisted') {
      return DECISION_ACTIONS.filter((action) => action.id !== 'shortlist');
    }
    return DECISION_ACTIONS;
  }, [canChangeCandidateStatus, candidate.status]);

  const pendingDecisionAction = useMemo(
    () => DECISION_ACTIONS.find((action) => action.id === pendingDecision),
    [pendingDecision]
  );
  const statusVariant = getCandidateStatusVariant(candidate.status);
  const integrityVariant = getIntegrityVariant(candidate.antiCheat);
  const candidateScore = clampScore(candidate.score);
  const completedAssessmentsCount = jobAssessments.filter(
    (assessment) => assessment.score != null
  ).length;
  const showDecisionSection = visibleDecisionActions.length > 0;

  const decisionSection = (
    <div
      className={[
        'candidate-details__sidebar-section',
        'candidate-details__sidebar-section--decision',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <SectionTitle>Decision actions</SectionTitle>
      <p className="candidate-details__decision-help">
        Choose the next hiring outcome. Shortlist keeps the candidate in review.
      </p>
      <div className="candidate-details__decisions">
        {visibleDecisionActions.map((action) => {
          const ActionIcon = action.icon;
          return (
            <button
              key={action.id}
              className={['candidate-details__decision-btn', action.className]
                .filter(Boolean)
                .join(' ')}
              onClick={() => requestDecision(action.id)}
            >
              <ActionIcon size={18} className="candidate-details__decision-icon" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
      {decisionMessage && (
        <p className="candidate-details__decision-message" role="status">
          {decisionMessage}
        </p>
      )}
    </div>
  );

  const applicationInfoSection = (
    <div
      className={['candidate-details__sidebar-section', 'candidate-details__sidebar-section--info']
        .filter(Boolean)
        .join(' ')}
    >
      <SectionTitle>Application Info</SectionTitle>
      <div className="candidate-details__resume-block">
        <span>Resume</span>
        {candidate.cvUrl ? (
          <a
            className="candidate-details__resume-link"
            href={candidate.cvUrl}
            target="_blank"
            rel="noreferrer"
          >
            {candidate.resumeName || 'Open resume'}
          </a>
        ) : (
          <span className="candidate-details__resume-link candidate-details__resume-link--disabled">
            {candidate.resumeName || 'No resume uploaded'}
          </span>
        )}
      </div>
      <div className="candidate-details__info-list">
        <div className="candidate-details__info-row">
          <span>Location</span>
          <strong>{candidate.location || 'Not provided'}</strong>
        </div>
        <div className="candidate-details__info-row">
          <span>Phone</span>
          <strong>{candidate.phone || 'Not provided'}</strong>
        </div>
        <div className="candidate-details__info-row">
          <span>LinkedIn</span>
          {candidate.linkedin ? (
            <a href={candidate.linkedin} target="_blank" rel="noreferrer">
              Open profile
            </a>
          ) : (
            <strong>Not provided</strong>
          )}
        </div>
      </div>
    </div>
  );

  const jobAssessmentsSection = (
    <div
      className={['candidate-details__sidebar-section', 'candidate-details__sidebar-section--mocks']
        .filter(Boolean)
        .join(' ')}
    >
      <SectionTitle>Job assessments</SectionTitle>
      <div className="candidate-details__assessment-list">
        {jobAssessments.length === 0 && (
          <p className="candidate-details__empty-text">
            No assessments are attached to this candidate's job.
          </p>
        )}
        {jobAssessments.map((assessment) => (
          <div key={assessment.id} className="candidate-details__assessment-row">
            <div>
              <strong>{assessment.title}</strong>
              <span>{assessment.subtitle}</span>
            </div>
            <span
              className={[
                'candidate-details__assessment-result',
                assessment.score == null && 'candidate-details__assessment-result--muted',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {assessment.score == null ? assessment.status : `${assessment.score}%`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const summaryTab = (
    <div className="candidate-summary">
      <section className="candidate-summary__ai-review">
        <span>Future AI review</span>
        <h2>Candidate review summary</h2>
        <p>Once connected, this area will summarize fit, evidence, and review risks.</p>
      </section>

      <div className="candidate-summary__analysis-grid">
        <section className="candidate-summary__chart-panel">
          {performanceBreakdown.length > 0 ? (
            <BarChart
              title="Performance breakdown"
              data={performanceBreakdown}
              dataKeys={[{ key: 'value', label: 'Score' }]}
              density="compact"
              animated={false}
            />
          ) : (
            <div className="candidate-summary__empty-graph">
              <span>No score breakdown yet</span>
              <p>Performance metrics will appear after interview scoring is available.</p>
            </div>
          )}
        </section>

        <section className="candidate-summary__panel candidate-summary__panel--metrics">
          <h3>Review metrics</h3>
          <div className="candidate-summary__score">
            <strong>{candidateScore}%</strong>
            <span className="candidate-summary__score-track">
              <span
                className="candidate-summary__score-fill"
                style={{ width: `${candidateScore}%` }}
              />
            </span>
          </div>
          <div className="candidate-summary__metric-rows">
            <div>
              <span>Integrity</span>
              <strong>{getIntegrityLabel(candidate.antiCheat)}</strong>
            </div>
            <div>
              <span>Assessments</span>
              <strong>
                {jobAssessments.length
                  ? `${completedAssessmentsCount}/${jobAssessments.length}`
                  : 'Not assigned'}
              </strong>
            </div>
            <div>
              <span>Evidence notes</span>
              <strong>{summaryEvidence.length}</strong>
            </div>
          </div>
        </section>
      </div>

      <section className="candidate-summary__panel candidate-summary__panel--evidence">
        <div className="candidate-summary__panel-heading">
          <h3>Evidence notes</h3>
          <p>Interview notes and responses used for the review.</p>
        </div>
        <div className="candidate-summary__evidence-list">
          {summaryEvidence.map((evidence) => (
            <article key={evidence.id} className="candidate-summary__evidence">
              <h4>{evidence.title}</h4>
              <p>{evidence.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <div className="candidate-details">
      <div className="candidate-details__main">
        <section className="candidate-details__header" aria-label="Candidate summary">
          <div className="candidate-details__identity">
            <h1>{candidate.name}</h1>
            <p>{candidate.email || 'Email not provided'}</p>
          </div>
          <div className="candidate-details__header-status">
            <Badge type="candidateState" variant={statusVariant}>
              {getCandidateStatusLabel(candidate.status)}
            </Badge>
            <Badge type="cheatingFlag" variant={integrityVariant} iconLeft outline>
              {getIntegrityLabel(candidate.antiCheat)}
            </Badge>
          </div>
          <div className="candidate-details__header-meta">
            <div>
              <span>Role</span>
              <strong>{candidate.job}</strong>
            </div>
            <div>
              <span>Applied</span>
              <strong>{candidate.date}</strong>
            </div>
            <div className="candidate-details__header-score">
              <span>Score</span>
              <strong>{candidateScore}%</strong>
              <i>
                <b style={{ width: `${candidateScore}%` }} />
              </i>
            </div>
          </div>
        </section>

        <div className="candidate-details__tabs-container">
          <Tabs items={tabs} scrollRef={tabContentRef} />

          <div ref={tabContentRef} className="candidate-details__tab-content">
            {activeTab === 'summary' && summaryTab}
            {activeTab === 'analysis' && <CVAnalysis candidate={candidate} />}
            {activeTab === 'replay' && <MockReplay candidate={candidate} />}
          </div>
        </div>
      </div>

      <aside className="candidate-details__sidebar">
        {showDecisionSection && decisionSection}
        {applicationInfoSection}
        {jobAssessmentsSection}
      </aside>

      <ConfirmDialog
        isOpen={Boolean(pendingDecisionAction)}
        title={`Confirm ${pendingDecisionAction?.label || 'decision'}`}
        description={
          pendingDecisionAction
            ? `This decision is permanent. Continue with ${candidate.name}?`
            : ''
        }
        confirmLabel={pendingDecisionAction?.label || 'Confirm'}
        confirmVariant={pendingDecision === 'reject' ? 'danger' : 'primary'}
        onConfirm={confirmDecision}
        onClose={() => setPendingDecision(null)}
      />
    </div>
  );
});

CandidateDetails.propTypes = {
  candidate: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    phone: PropTypes.string,
    location: PropTypes.string,
    linkedin: PropTypes.string,
    resumeName: PropTypes.string,
    cvUrl: PropTypes.string,
    jobId: PropTypes.string,
    job: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    antiCheat: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    questions: PropTypes.array,
  }).isRequired,
};
