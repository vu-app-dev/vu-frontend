import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { Briefcase, Lock, Pencil } from 'lucide-react';
import PropTypes from 'prop-types';
import { QuickInfoCard } from '../../../../components/ui/Cards';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { BarChart } from '../../../../components/ui/Charts';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { SectionTitle } from '../../../../components/ui/SectionTitle';
import { Tabs } from '../../../../components/ui/Tabs';
import {
  getCandidatesPerJob,
  getJobsUsingMock,
  getMockById,
  getMockStatus,
  useBackendData,
} from '../../../../api';
import './MockDetails.css';

const JOB_STATUS_LABELS = {
  active: 'Active',
  scheduled: 'Scheduled',
  closed: 'Closed',
};

export const MockDetails = memo(function MockDetails({
  mockId,
  onEdit,
  canEditMock = true,
}) {
  const { dataVersion } = useBackendData();
  const [activeMobileTab, setActiveMobileTab] = useState('analysis');
  const mobileScrollRef = useRef(null);
  const mock = getMockById(mockId);

  const status = useMemo(() => {
    void dataVersion;
    return getMockStatus(mockId);
  }, [mockId, dataVersion]);
  const isActive = status === 'active';

  const jobsUsing = useMemo(() => {
    void dataVersion;
    return mock ? getJobsUsingMock(mock.title) : [];
  }, [mock, dataVersion]);

  const chartData = useMemo(() => {
    void dataVersion;
    return mock ? getCandidatesPerJob(mock.title) : [];
  }, [mock, dataVersion]);

  const handleEdit = useCallback(() => onEdit?.(mockId), [onEdit, mockId]);

  const mobileTabs = useMemo(
    () => [
      {
        label: 'Analysis',
        isActive: activeMobileTab === 'analysis',
        onClick: () => setActiveMobileTab('analysis'),
      },
      {
        label: 'Actions',
        isActive: activeMobileTab === 'actions',
        onClick: () => setActiveMobileTab('actions'),
      },
    ],
    [activeMobileTab]
  );

  if (!mock) {
    return (
      <div className="mock-details mock-details--empty">
        <span>Mock not found.</span>
      </div>
    );
  }

  const technologies = Array.isArray(mock.technologies) ? mock.technologies : [];
  const topics = Array.isArray(mock.topics) ? mock.topics : [];
  const questions = Array.isArray(mock.questions) ? mock.questions : [];
  const totalWeight =
    topics.reduce((sum, topic) => sum + Number(topic.weight || 0), 0) +
    questions.reduce((sum, question) => sum + Number(question.weight || 0), 0);
  const mockStatusVariant = isActive ? 'inUse' : 'available';

  const analysisPanel = (
    <div className="mock-details__panel mock-details__panel--analysis">
      <section className="mock-details__summary-band">
        <div className="mock-details__summary-heading">
          <div>
            <h1>{mock.title}</h1>
            <p>Assessment configuration and usage</p>
          </div>
          <div className="mock-details__summary-actions">
            <Badge type="mockStatus" variant={mockStatusVariant} />
          </div>
        </div>
        <div className="mock-details__summary-meta">
          <div>
            <span>Type</span>
            <strong>{mock.type}</strong>
          </div>
          <div>
            <span>Difficulty</span>
            <strong>{mock.difficulty}</strong>
          </div>
          <div>
            <span>Duration</span>
            <strong>{mock.duration}</strong>
          </div>
          <div>
            <span>Skills</span>
            <strong>{technologies.length ? technologies.slice(0, 3).join(', ') : 'Not set'}</strong>
          </div>
        </div>
      </section>

      <div className="mock-details__stats">
        <QuickInfoCard
          number={mock.totalSessions}
          title="Sessions"
          density="compact"
          animated={false}
        />
        <QuickInfoCard
          number={`${mock.avgScore}%`}
          title="Avg. score"
          density="compact"
          animated={false}
        />
        <QuickInfoCard
          number={`${mock.passRate}%`}
          title="Pass rate"
          density="compact"
          animated={false}
        />
        <QuickInfoCard
          number={jobsUsing.length}
          title="Used in jobs"
          density="compact"
          animated={false}
        />
      </div>

      <section className="mock-details__section">
        <SectionTitle variant="inline">Used in jobs</SectionTitle>
        {jobsUsing.length > 0 ? (
          <div className="mock-details__jobs-list">
            {jobsUsing.map((job) => (
              <div key={job.id} className="mock-details__job-row">
                <span className="mock-details__job-title">{job.title}</span>
                <span className="mock-details__job-meta">
                  {JOB_STATUS_LABELS[job.status] || 'Status not set'}
                </span>
                <span className="mock-details__job-candidates">
                  {job.totalApplied} applications
                </span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Briefcase size={24} />}
            title="No jobs use this mock yet"
            description="Attach this mock to a job before candidates can complete it."
          />
        )}
      </section>

      <section className="mock-details__section">
        <SectionTitle variant="inline">Scoring structure</SectionTitle>
        <div className="mock-details__formula">
          {topics.map((topic) => (
            <div key={topic.id} className="mock-details__formula-row">
              <span className="mock-details__formula-name">{topic.name}</span>
              <span className="mock-details__formula-pct">{topic.weight}%</span>
            </div>
          ))}
          {questions.map((question, index) => (
            <div key={question.id} className="mock-details__formula-row">
              <span className="mock-details__formula-name">
                Q{index + 1}: {question.title}
              </span>
              <span className="mock-details__formula-pct">{question.weight}%</span>
            </div>
          ))}
          <div className="mock-details__formula-row mock-details__formula-row--total">
            <span className="mock-details__formula-name">Total</span>
            <span className="mock-details__formula-pct">{totalWeight}%</span>
          </div>
        </div>
      </section>

      {chartData.length > 0 && (
        <section className="mock-details__section">
          <SectionTitle variant="inline">Performance</SectionTitle>
          <BarChart
            title={`Candidates per job (${jobsUsing.length})`}
            data={chartData}
            dataKeys={[{ key: 'candidates', label: 'Candidates' }]}
            xKey="label"
          />
        </section>
      )}
    </div>
  );

  const actionsPanel = (
    <div className="mock-details__panel mock-details__panel--actions">
      <div className="mock-details__card">
        <SectionTitle variant="inline">Actions</SectionTitle>
        <div className="mock-details__action-list">
          {isActive && (
            <div className="mock-details__active-notice">
              <Lock size={12} />
              <span>
                In use by {jobsUsing.filter((job) => job.status === 'active').length} active job(s)
                and locked for editing.
              </span>
            </div>
          )}
          {canEditMock && (
            <Button
              variant="primary"
              size="sm"
              iconLeft={<Pencil size={16} />}
              className="mock-details__action-primary"
              onClick={handleEdit}
              disabled={isActive}
              title={isActive ? 'Mocks in use cannot be edited' : 'Edit mock'}
            >
              Edit mock
            </Button>
          )}
        </div>
      </div>

      <div className="mock-details__card">
        <SectionTitle variant="inline">Assessment setup</SectionTitle>
        <div className="mock-details__formula">
          <div className="mock-details__formula-row">
            <span className="mock-details__formula-name">Type</span>
            <span className="mock-details__formula-pct">{mock.type}</span>
          </div>
          <div className="mock-details__formula-row">
            <span className="mock-details__formula-name">Difficulty</span>
            <span className="mock-details__formula-pct">{mock.difficulty}</span>
          </div>
          <div className="mock-details__formula-row">
            <span className="mock-details__formula-name">Duration</span>
            <span className="mock-details__formula-pct">{mock.duration}</span>
          </div>
          <div className="mock-details__formula-row">
            <span className="mock-details__formula-name">Skills covered</span>
            <span className="mock-details__formula-pct">{technologies.length}</span>
          </div>
        </div>
      </div>

      <div className="mock-details__card">
        <SectionTitle variant="inline">Session options</SectionTitle>
        <div className="mock-details__formula">
          <div className="mock-details__formula-row">
            <span className="mock-details__formula-name">Follow-up questions</span>
            <span className="mock-details__formula-pct">
              {mock.enableFollowUpQuestions ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <div className="mock-details__formula-row">
            <span className="mock-details__formula-name">Replay recording</span>
            <span className="mock-details__formula-pct">
              {mock.enableRecordReplay ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mock-details">
      <div className="mock-details__desktop-layout">
        <div className="mock-details__main">
          <div className="mock-details__scroll">{analysisPanel}</div>
        </div>

        <aside className="mock-details__sidebar">{actionsPanel}</aside>
      </div>

      <div className="mock-details__mobile-shell">
        <Tabs items={mobileTabs} scrollRef={mobileScrollRef} />
        <div ref={mobileScrollRef} className="mock-details__mobile-content">
          {activeMobileTab === 'analysis' ? analysisPanel : actionsPanel}
        </div>
      </div>
    </div>
  );
});

MockDetails.propTypes = {
  mockId: PropTypes.string,
  onEdit: PropTypes.func,
  canEditMock: PropTypes.bool,
};
