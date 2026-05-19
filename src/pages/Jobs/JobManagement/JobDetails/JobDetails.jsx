import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pencil,
  Users,
  Clock,
  Briefcase,
  MapPin,
  Target,
  TrendingUp,
  CalendarDays,
  Eye,
  Share2,
  Check,
  UserSearch,
} from 'lucide-react';
import { EntityCard, QuickInfoCard } from '../../../../components/ui/Cards';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { SectionTitle } from '../../../../components/ui/SectionTitle';
import { Tabs } from '../../../../components/ui/Tabs';
import { TableHeader, TableRow, TableCell } from '../../../../components/ui/Tables';
import { RadarChart, AreaChart, RadialBarChart } from '../../../../components/ui/Charts';
import {
  getJobById,
  getCandidatesByJobId,
  getApplicationSharePath,
  useBackendData,
} from '../../../../api';
import './JobDetails.css';

/* -------------------------------------------------
   Table config — mirrors Pipeline table structure
   ------------------------------------------------- */
const TABLE_COLUMNS = [
  { key: 'name', label: 'Name', sortable: true, fr: 1.2 },
  { key: 'score', label: 'Score', sortable: true, fr: 1.5 },
  { key: 'date', label: 'Date', sortable: true, fr: 1 },
  { key: 'antiCheat', label: 'Anti-cheat', sortable: false, fr: 1 },
  { key: 'status', label: 'Status', sortable: false, fr: 1 },
];
const GRID_TEMPLATE = TABLE_COLUMNS.map((c) => `${c.fr}fr`).join(' ');

const getScoreColor = (score) => {
  const t = Math.max(0, Math.min(1, (score - 40) / 60));
  const h = Math.round(14 * t);
  const s = Math.round(100 * t);
  const l = Math.round(30 + 30 * t);
  return `hsl(${h}, ${s}%, ${l}%)`;
};

const ICON_SM = 14;

/* -------------------------------------------------
   JobDetails
   ------------------------------------------------- */
export const JobDetails = memo(function JobDetails({
  jobId,
  onEdit,
  onTest,
  onShowCandidates,
  canEditJob = true,
}) {
  const { dataVersion } = useBackendData();
  void dataVersion;
  const [copied, setCopied] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('analysis');
  const mobileScrollRef = useRef(null);
  const shareTimerRef = useRef(null);
  const job = getJobById(jobId);
  const applyPath = getApplicationSharePath(job);

  useEffect(
    () => () => {
      if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current);
    },
    []
  );

  const totalDuration = useMemo(
    () => (job ? job.mocks.reduce((s, m) => s + m.durationMin, 0) : 0),
    [job]
  );

  const mockRadarData = useMemo(
    () => (job ? job.mocks.map((m) => ({ label: m.name, value: m.avgScore })) : []),
    [job]
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
  const jobCandidates = useMemo(() => {
    void dataVersion;
    return job ? getCandidatesByJobId(job.id) : [];
  }, [job, dataVersion]);

  const handleEdit = useCallback(() => onEdit?.(jobId), [onEdit, jobId]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(`${window.location.origin}${applyPath}`);
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

  const analysisPanel = (
    <div className="job-details__panel job-details__panel--analysis">
      <EntityCard
        showAvatar={false}
        userName={job.title}
        userEmail={`${job.department} · ${job.seniority}`}
        showBadge
        badgeType="jobStatus"
        badgeVariant={job.status}
        colLeft={{ icon: Briefcase, title: job.jobType, subtitle: 'Job Type' }}
        colMid={{ icon: MapPin, title: job.location, subtitle: job.locationType }}
        colRight={{
          icon: Clock,
          title: `${totalDuration} min`,
          subtitle: `${job.mocks.length} Interviews`,
        }}
        tags={job.skills}
        tagsLimit={5}
        showDescription
        descriptionTitle="Description"
        descriptionContent={job.description}
        animated={false}
      />

      <div className="job-details__stats">
        <QuickInfoCard
          icon={<Users />}
          number={job.totalApplied}
          title="Total Applied"
          animated={false}
        />
        <QuickInfoCard
          icon={<Target />}
          number={`${job.avgScore}%`}
          title="Avg Score"
          animated={false}
        />
        <QuickInfoCard
          icon={<TrendingUp />}
          number={`${job.passRate}%`}
          title="Pass Rate"
          animated={false}
        />
        <QuickInfoCard
          icon={<CalendarDays />}
          number={job.activeDays}
          title="Active Days"
          animated={false}
        />
      </div>

      <section className="job-details__section">
        <SectionTitle variant="inline">Performance Overview</SectionTitle>
        <div className="job-details__charts-row">
          <AreaChart
            title="Application Trend"
            data={job.applicationTrend}
            dataKeys={[{ key: 'value', label: 'Applications', color: '#ff5d31' }]}
            xKey="label"
            className="job-details__chart"
          />
          {mockRadarData.length >= 3 ? (
            <RadarChart
              title="Avg Score per Mock"
              stats={mockRadarData}
              className="job-details__chart"
            />
          ) : (
            <div className="job-details__chart job-details__single-mock">
              <h3 className="job-details__single-mock-title">Avg Score per Mock</h3>
              {mockRadarData.map((m) => (
                <div key={m.label} className="job-details__single-mock-item">
                  <span className="job-details__single-mock-label">{m.label}</span>
                  <span className="job-details__single-mock-value">{m.value}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="job-details__section">
        <SectionTitle variant="inline">Top Candidates</SectionTitle>
        <div className="job-details__cand-table">
          <TableHeader columns={TABLE_COLUMNS} gridTemplateColumns={GRID_TEMPLATE} />
          {jobCandidates.length > 0 ? (
            jobCandidates.map((c) => (
              <TableRow key={c.id} gridTemplateColumns={GRID_TEMPLATE}>
                <TableCell
                  color="tertiary"
                  icon={
                    <span className="job-details__avatar">
                      {c.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  }
                >
                  {c.name}
                </TableCell>
                <TableCell className="job-details__score-cell">
                  <span className="job-details__score">
                    <span className="job-details__score-bar">
                      <span
                        className="job-details__score-fill"
                        style={{
                          width: `${c.score}%`,
                          backgroundColor: getScoreColor(c.score),
                        }}
                      />
                    </span>
                    <span className="job-details__score-value">{c.score}</span>
                  </span>
                </TableCell>
                <TableCell color="tertiary">{c.date}</TableCell>
                <TableCell>
                  <Badge type="cheatingFlag" variant={c.antiCheat} iconLeft outline />
                </TableCell>
                <TableCell>
                  <Badge type="candidateState" variant={c.status} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <EmptyState
              icon={<Users size={24} />}
              title="No candidates yet"
              description="Applications for this job will appear here as candidates apply."
              action={
                <Button
                  variant="secondary"
                  size="sm"
                  iconLeft={<UserSearch size={ICON_SM} />}
                  onClick={() => onShowCandidates?.(jobId)}
                >
                  Open Pipeline
                </Button>
              }
            />
          )}
        </div>
      </section>
    </div>
  );

  const actionsPanel = (
    <div className="job-details__panel job-details__panel--actions">
      <div className="job-details__card">
        <div className="job-details__action-list">
          {canEditJob && (
            <>
              <Button
                variant="primary"
                size="sm"
                iconLeft={copied ? <Check size={ICON_SM} /> : <Share2 size={ICON_SM} />}
                onClick={handleShare}
              >
                {copied ? 'Copied!' : 'Share Job'}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                iconLeft={<Eye size={ICON_SM} />}
                onClick={() => onTest?.(applyPath)}
              >
                Test Application
              </Button>
            </>
          )}
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<UserSearch size={ICON_SM} />}
            onClick={() => onShowCandidates?.(jobId)}
          >
            Show Candidates
          </Button>
          {canEditJob && (
            <Button
              variant="ghost"
              size="sm"
              iconLeft={<Pencil size={ICON_SM} />}
              onClick={handleEdit}
            >
              Edit Job
            </Button>
          )}
        </div>
      </div>

      <RadialBarChart title="Candidate Breakdown" data={candidateBreakdown} />

      <div className="job-details__card">
        <SectionTitle variant="inline">Job Info</SectionTitle>

        <div className="job-details__info-group">
          <span className="job-details__info-label">Evaluation Structure</span>
          <div className="job-details__formula">
            {job.mocks.map((m) => (
              <div key={m.id} className="job-details__formula-row">
                <span className="job-details__formula-name">{m.name}</span>
                <span className="job-details__formula-pct">{m.weight}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="job-details__divider" />

        <div className="job-details__info-group">
          <span className="job-details__info-label">Application Window</span>
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
              <span className="job-details__formula-name">Max Candidates</span>
              <span className="job-details__formula-pct">
                {job.maxCandidates ? `${job.maxCandidates} applications` : 'Unlimited'}
              </span>
            </div>
            <div className="job-details__formula-row">
              <span className="job-details__formula-name">Total Duration</span>
              <span className="job-details__formula-pct">{`${totalDuration} min`}</span>
            </div>
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
