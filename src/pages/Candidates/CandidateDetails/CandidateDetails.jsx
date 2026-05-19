import { useState, useMemo, useCallback, useRef, useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { Briefcase, MapPin, Calendar, Check, List, X } from 'lucide-react';
import { EntityCard, ActionCard } from '../../../components/ui/Cards';
import { Button } from '../../../components/ui/Button';
import { Tabs } from '../../../components/ui/Tabs';
import { SectionTitle } from '../../../components/ui/SectionTitle';
import { FullFeedback } from './FullFeedback';
import { MockReplay } from './MockReplay';
import { CVAnalysis } from './CVAnalysis';
import { canCurrentUser, updateCandidateStatus, useBackendData } from '../../../api';
import './CandidateDetails.css';

const DECISION_ACTIONS = [
  {
    id: 'accept',
    label: 'Accepted',
    icon: Check,
    className: 'candidate-details__decision--accept',
  },
  {
    id: 'shortlist',
    label: 'Shortlist',
    icon: List,
    className: 'candidate-details__decision--shortlist',
  },
  { id: 'reject', label: 'Rejected', icon: X, className: 'candidate-details__decision--reject' },
];

function getIsCompactLayout() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(max-width: 1023px)').matches)
  );
}

export const CandidateDetails = memo(function CandidateDetails({ candidate }) {
  const { dataVersion } = useBackendData();
  void dataVersion;
  const [activeTab, setActiveTab] = useState('feedback');
  const [pendingDecision, setPendingDecision] = useState(null);
  const [isCompactLayout, setIsCompactLayout] = useState(getIsCompactLayout);
  const tabContentRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(max-width: 1023px)');
    const updateLayoutMode = (event) => setIsCompactLayout(event.matches);

    if (media.addEventListener) {
      media.addEventListener('change', updateLayoutMode);
      return () => media.removeEventListener('change', updateLayoutMode);
    }

    media.addListener(updateLayoutMode);
    return () => media.removeListener(updateLayoutMode);
  }, []);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const completedMocks = useMemo(
    () =>
      (candidate.questions || []).map((question, index) => ({
        id: question.id || index + 1,
        title: question.question || question.title || `Question ${index + 1}`,
        subtitle: `${question.durationInMinutes || question.estimatedTimeInMinutes || 0} min`,
        score: question.score || 0,
      })),
    [candidate]
  );

  const tabs = useMemo(() => {
    const baseTabs = [
      {
        label: 'Full Feedback',
        isActive: activeTab === 'feedback',
        onClick: () => handleTabChange('feedback'),
      },
      {
        label: 'Mock Replay',
        isActive: activeTab === 'replay',
        onClick: () => handleTabChange('replay'),
      },
      {
        label: 'CV Analysis',
        isActive: activeTab === 'analysis',
        onClick: () => handleTabChange('analysis'),
      },
    ];

    if (!isCompactLayout) return baseTabs;

    return [
      {
        label: 'Actions',
        isActive: activeTab === 'actions',
        onClick: () => handleTabChange('actions'),
      },
      ...baseTabs,
    ];
  }, [activeTab, handleTabChange, isCompactLayout]);

  const handleDecision = useCallback(
    async (action) => {
      if (['accepted', 'rejected'].includes(candidate.status)) {
        window.alert('This candidate already has a final decision.');
        return;
      }

      try {
        await updateCandidateStatus(candidate.id, action);
      } catch (error) {
        window.alert(error.message || 'Unable to update candidate.');
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

  const decisionSection = (
    <div
      className={[
        'candidate-details__sidebar-section',
        'candidate-details__sidebar-section--decision',
        isCompactLayout && 'candidate-details__sidebar-section--compact',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <SectionTitle>Select Decision</SectionTitle>
      <div className="candidate-details__decisions">
        {visibleDecisionActions.length === 0 && (
          <p className="candidate-details__empty-text">
            {canChangeCandidateStatus
              ? 'Final decision selected.'
              : 'Decision actions are read-only for your role.'}
          </p>
        )}
        {visibleDecisionActions.map((action) => (
          <button
            key={action.id}
            className={['candidate-details__decision-btn', action.className]
              .filter(Boolean)
              .join(' ')}
            onClick={() => requestDecision(action.id)}
          >
            <action.icon size={18} className="candidate-details__decision-icon" />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const applicationInfoSection = (
    <div
      className={[
        'candidate-details__sidebar-section',
        'candidate-details__sidebar-section--info',
        isCompactLayout && 'candidate-details__sidebar-section--compact',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <SectionTitle>Application Info</SectionTitle>
      <div className="candidate-details__info-list">
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
        <div className="candidate-details__info-row">
          <span>Resume</span>
          {candidate.cvUrl ? (
            <a href={candidate.cvUrl} target="_blank" rel="noreferrer">
              {candidate.resumeName || 'Open resume'}
            </a>
          ) : (
            <strong>{candidate.resumeName || 'Not provided'}</strong>
          )}
        </div>
      </div>
    </div>
  );

  const completedMocksSection = (
    <div
      className={[
        'candidate-details__sidebar-section',
        'candidate-details__sidebar-section--mocks',
        isCompactLayout && 'candidate-details__sidebar-section--compact',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <SectionTitle>Completed Mocks</SectionTitle>
      <div className="candidate-details__mocks">
        {completedMocks.length === 0 && (
          <p className="candidate-details__empty-text">No completed mock data returned.</p>
        )}
        {completedMocks.map((mock) => (
          <ActionCard
            key={mock.id}
            title={mock.title}
            subtitle={mock.subtitle}
            descriptionTitle="Score"
            showDescriptionIcon
            descriptionNumber={mock.score}
            animated
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="candidate-details">
      <div className="candidate-details__main">
        <EntityCard
          userName={candidate.name}
          userEmail={candidate.email}
          showBadge
          badgeType="candidateState"
          badgeVariant={candidate.status}
          score={candidate.score}
          colLeft={{ icon: Briefcase, title: candidate.job, subtitle: 'Applied Job' }}
          colMid={{
            icon: MapPin,
            title: candidate.location || 'Not provided',
            subtitle: 'Location',
          }}
          colRight={{ icon: Calendar, title: candidate.date, subtitle: 'Applied Date' }}
          animated={false}
        />

        <div className="candidate-details__tabs-container">
          <Tabs items={tabs} scrollRef={tabContentRef} />

          <div ref={tabContentRef} className="candidate-details__tab-content">
            {activeTab === 'actions' && isCompactLayout && (
              <div className="candidate-details__actions-tab-content">
                {decisionSection}
                {applicationInfoSection}
                {completedMocksSection}
              </div>
            )}
            {activeTab === 'feedback' && <FullFeedback candidate={candidate} />}
            {activeTab === 'replay' && <MockReplay candidate={candidate} />}
            {activeTab === 'analysis' && <CVAnalysis candidate={candidate} />}
          </div>
        </div>
      </div>

      <aside className="candidate-details__sidebar">
        {decisionSection}
        {applicationInfoSection}
        {completedMocksSection}
      </aside>

      {pendingDecisionAction && (
        <div className="candidate-details__modal-backdrop" role="presentation">
          <div
            className="candidate-details__modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="candidate-decision-title"
          >
            <h3 id="candidate-decision-title" className="candidate-details__modal-title">
              Confirm {pendingDecisionAction.label}
            </h3>
            <p className="candidate-details__modal-copy">
              This decision is permanent. Once you mark this candidate as{' '}
              {pendingDecisionAction.label.toLowerCase()}, it cannot be changed back.
            </p>
            <div className="candidate-details__modal-actions">
              <Button variant="ghost" size="sm" onClick={() => setPendingDecision(null)}>
                Cancel
              </Button>
              <Button
                variant={pendingDecision === 'reject' ? 'danger' : 'primary'}
                size="sm"
                onClick={confirmDecision}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
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
    job: PropTypes.string.isRequired,
    score: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    antiCheat: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    questions: PropTypes.array,
  }).isRequired,
};
