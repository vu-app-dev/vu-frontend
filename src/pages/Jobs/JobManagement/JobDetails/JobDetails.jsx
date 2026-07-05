import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Copy, ExternalLink, Pencil, Users } from 'lucide-react';
import PropTypes from 'prop-types';
import { QuickInfoCard } from '../../../../components/ui/Cards';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { SectionTitle } from '../../../../components/ui/SectionTitle';
import { Tabs } from '../../../../components/ui/Tabs';
import { TableHeader, TableRow, TableCell } from '../../../../components/ui/Tables';
import { AreaChart } from '../../../../components/ui/Charts';
import { CHART_BRAND } from '../../../../components/ui/Charts/chartTokens';
import {
  getApplicationSharePath,
  getCandidatesByJobId,
  getJobById,
  toSlug,
  useBackendData,
} from '../../../../api';
import { getDisplayJobStatus } from '../../../../utils';
import './JobDetails.css';

const TABLE_COLUMNS = [
  { key: 'name', label: 'Name', sortable: true, fr: 1.2 },
  { key: 'score', label: 'Score', sortable: true, fr: 1.5 },
  { key: 'date', label: 'Date', sortable: true, fr: 1 },
  { key: 'integrity', label: 'Integrity', sortable: false, fr: 1 },
  { key: 'status', label: 'Status', sortable: false, fr: 1 },
];
const GRID_TEMPLATE = TABLE_COLUMNS.map((column) => `${column.fr}fr`).join(' ');
function getScoreTone(score) {
  if (score >= 80) return 'strong';
  if (score >= 60) return 'steady';
  return 'low';
}

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const JobDetails = memo(function JobDetails({
  jobId,
  onEdit,
  onTest,
  onShowCandidates,
  onViewCandidate,
  canEditJob = true,
}) {
  const { dataVersion } = useBackendData();
  const [copied, setCopied] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('analysis');
  const mobileScrollRef = useRef(null);
  const shareTimerRef = useRef(null);
  const job = getJobById(jobId);
  const applyPath = getApplicationSharePath(job);
  const displayStatus = getDisplayJobStatus(job);

  useEffect(
    () => () => {
      if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current);
    },
    []
  );

  const jobCandidates = useMemo(() => {
    void dataVersion;
    return job ? getCandidatesByJobId(job.id) : [];
  }, [job, dataVersion]);

  const totalDuration = useMemo(
    () => (job ? job.mocks.reduce((sum, mock) => sum + Number(mock.durationMin || 0), 0) : 0),
    [job]
  );

  const needsReview = useMemo(
    () => jobCandidates.filter((candidate) => candidate.status === 'pending').length,
    [jobCandidates]
  );

  const candidateBreakdown = useMemo(
    () =>
      job
        ? [
            { label: 'Shortlisted', value: job.shortlisted },
            { label: 'Accepted', value: job.accepted },
            { label: 'Pending', value: job.pending },
            { label: 'Rejected', value: job.rejected },
          ]
        : [],
    [job]
  );

  const handleEdit = useCallback(() => onEdit?.(jobId), [onEdit, jobId]);

  const handleShare = useCallback(() => {
    if (!applyPath) return;
    navigator.clipboard?.writeText(`${window.location.origin}${applyPath}`);
    setCopied(true);
    if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current);
    shareTimerRef.current = window.setTimeout(() => {
      setCopied(false);
      shareTimerRef.current = null;
    }, 2000);
  }, [applyPath]);

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

  if (!job) {
    return (
      <div className="job-details job-details--empty">
        <span>Job not found.</span>
      </div>
    );
  }

  const summaryContext = [job.seniority || 'Seniority not set', job.location || 'Location not set']
    .filter(Boolean)
    .join(' · ');

  const analysisPanel = (
    <div className="job-details__panel job-details__panel--analysis">
      <section className="job-details__summary-band">
        <div className="job-details__summary-heading">
          <div>
            <h1>{job.title}</h1>
            <p>{summaryContext}</p>
          </div>
          <div className="job-details__summary-actions">
            <Badge type="jobStatus" variant={displayStatus} />
          </div>
        </div>
        <div className="job-details__summary-meta">
          <div>
            <span>Job type</span>
            <strong>{job.jobType}</strong>
          </div>
          <div>
            <span>Work arrangement</span>
            <strong>{job.locationType || 'Not set'}</strong>
          </div>
          <div>
            <span>Assessment time</span>
            <strong>{totalDuration} min</strong>
          </div>
          <div>
            <span>Assessments</span>
            <strong>{job.mocks.length}</strong>
          </div>
        </div>
      </section>

      <div className="job-details__stats">
        <QuickInfoCard
          number={job.totalApplied}
          title="Applications"
          density="compact"
          animated={false}
        />
        <QuickInfoCard
          number={needsReview}
          title="Needs review"
          density="compact"
          animated={false}
        />
        <QuickInfoCard
          number={`${job.avgScore}%`}
          title="Avg. score"
          density="compact"
          animated={false}
        />
        <QuickInfoCard
          number={job.endDate || 'No close date'}
          title="Close date"
          density="compact"
          animated={false}
        />
      </div>

      <section className="job-details__section">
        <SectionTitle variant="inline">Candidate pipeline</SectionTitle>
        <div className="job-details__cand-table">
          <TableHeader columns={TABLE_COLUMNS} gridTemplateColumns={GRID_TEMPLATE} />
          {jobCandidates.length > 0 ? (
            jobCandidates.map((candidate) => (
              <TableRow
                key={candidate.id}
                gridTemplateColumns={GRID_TEMPLATE}
                onClick={() =>
                  onViewCandidate?.(toSlug(candidate.name, candidate.id), candidate.id)
                }
              >
                <TableCell
                  color="tertiary"
                  icon={<span className="job-details__avatar">{getInitials(candidate.name)}</span>}
                >
                  {candidate.name}
                </TableCell>
                <TableCell className="job-details__score-cell">
                  <span className="job-details__score">
                    <span className="job-details__score-bar">
                      <span
                        className={[
                          'job-details__score-fill',
                          `job-details__score-fill--${getScoreTone(candidate.score)}`,
                        ].join(' ')}
                        style={{ width: `${candidate.score}%` }}
                      />
                    </span>
                    <span className="job-details__score-value">{candidate.score}%</span>
                  </span>
                </TableCell>
                <TableCell color="tertiary">{candidate.date}</TableCell>
                <TableCell>
                  <Badge type="cheatingFlag" variant={candidate.antiCheat} iconLeft outline />
                </TableCell>
                <TableCell>
                  <Badge type="candidateState" variant={candidate.status} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <EmptyState
              icon={<Users size={24} />}
              title="No candidates yet"
              description="Applications for this job will appear here as candidates apply."
            />
          )}
        </div>
      </section>

      {job.applicationTrend?.length > 0 && (
        <section className="job-details__section">
          <SectionTitle variant="inline">Performance trend</SectionTitle>
          <AreaChart
            title="Application trend"
            data={job.applicationTrend}
            dataKeys={[{ key: 'value', label: 'Applications', color: CHART_BRAND }]}
            xKey="label"
            className="job-details__chart"
          />
        </section>
      )}

      <section className="job-details__section">
        <SectionTitle variant="inline">Role and assessment setup</SectionTitle>
        <div className="job-details__setup-grid">
          <div className="job-details__setup-column">
            <span className="job-details__info-label">Description</span>
            <p className="job-details__description">{job.description}</p>
            {job.skills?.length > 0 && (
              <div className="job-details__tags">
                {job.skills.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            )}
          </div>
          <div className="job-details__setup-column">
            <span className="job-details__info-label">Assessments</span>
            <div className="job-details__mock-list">
              {job.mocks.map((mock) => (
                <div key={mock.id} className="job-details__mock-row">
                  <span className="job-details__mock-name">{mock.name}</span>
                  <span>{mock.weight}%</span>
                  <span>{Number(mock.durationMin || 0)} min</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );

  const actionsPanel = (
    <div className="job-details__panel job-details__panel--actions">
      <div className="job-details__card">
        <SectionTitle variant="inline">Actions</SectionTitle>
        <div className="job-details__action-list">
          <Button
            variant="primary"
            size="sm"
            iconLeft={<ExternalLink size={16} />}
            className="job-details__action-primary"
            onClick={() => applyPath && onTest?.(applyPath)}
            disabled={!applyPath}
          >
            Test application
          </Button>
          <p className="job-details__action-note">
            Open the candidate flow exactly as applicants will see it.
          </p>
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<Copy size={16} />}
            onClick={handleShare}
            disabled={!applyPath}
          >
            {copied ? 'Job link copied' : 'Share job link'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<Users size={16} />}
            onClick={() => onShowCandidates?.(jobId)}
          >
            View candidates
          </Button>
          <div className="job-details__action-divider" />
          {canEditJob ? (
            <Button variant="ghost" size="sm" iconLeft={<Pencil size={16} />} onClick={handleEdit}>
              Edit job
            </Button>
          ) : (
            <p className="job-details__read-only">Viewer access is read-only for editing.</p>
          )}
        </div>
      </div>

      <div className="job-details__card">
        <SectionTitle variant="inline">Candidate breakdown</SectionTitle>
        <div className="job-details__breakdown-list">
          {candidateBreakdown.map((item) => (
            <div key={item.label} className="job-details__breakdown-row">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="job-details__card">
        <SectionTitle variant="inline">Publishing rules</SectionTitle>
        <div className="job-details__formula">
          <div className="job-details__formula-row">
            <span className="job-details__formula-name">Published</span>
            <span className="job-details__formula-pct">{job.publishDate}</span>
          </div>
          <div className="job-details__formula-row">
            <span className="job-details__formula-name">Deadline</span>
            <span className="job-details__formula-pct">{job.endDate || 'No end date'}</span>
          </div>
          <div className="job-details__formula-row">
            <span className="job-details__formula-name">Max candidates</span>
            <span className="job-details__formula-pct">
              {job.maxCandidates ? `${job.maxCandidates} applications` : 'Unlimited'}
            </span>
          </div>
          <div className="job-details__formula-row">
            <span className="job-details__formula-name">Total duration</span>
            <span className="job-details__formula-pct">{totalDuration} min</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="job-details">
      <div className="job-details__desktop-layout">
        <div className="job-details__main">
          <div className="job-details__scroll">{analysisPanel}</div>
        </div>

        <aside className="job-details__sidebar">{actionsPanel}</aside>
      </div>

      <div className="job-details__mobile-shell">
        <Tabs items={mobileTabs} scrollRef={mobileScrollRef} />
        <div ref={mobileScrollRef} className="job-details__mobile-content">
          {activeMobileTab === 'analysis' ? analysisPanel : actionsPanel}
        </div>
      </div>
    </div>
  );
});

JobDetails.propTypes = {
  jobId: PropTypes.string,
  onEdit: PropTypes.func,
  onTest: PropTypes.func,
  onShowCandidates: PropTypes.func,
  onViewCandidate: PropTypes.func,
  canEditJob: PropTypes.bool,
};
