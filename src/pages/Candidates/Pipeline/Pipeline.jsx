import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shortcuts } from '../../../components/layout/Shortcuts';
import { Tabs } from '../../../components/ui/Tabs';
import { TableHeader, TableRow, TableCell } from '../../../components/ui/Tables';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/ui/Dialog';
import { Pagination } from '../../../components/ui/Pagination';
import { FilterOverlay } from '../../../components/ui/FilterOverlay';
import { SidePanel } from '../../../components/ui/SidePanel';
import { AppliedFilterChips } from '../../../components/ui/AppliedFilterChips';
import { QuickInfoCard, InfoCard } from '../../../components/ui/Cards';
import { EmptyState } from '../../../components/ui/EmptyState';
import { AreaChart, BarChart } from '../../../components/ui/Charts';
import { CHART_BRAND, CHART_SUCCESS } from '../../../components/ui/Charts/chartTokens';
import { SectionTitle } from '../../../components/ui/SectionTitle';
import {
  CANDIDATES,
  JOBS,
  canCurrentUser,
  toSlug,
  updateCandidateStatus,
  useBackendData,
} from '../../../api';
import {
  ArrowRight,
  Users,
  Award,
  Clock,
  Check,
  ListFilter,
  X,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { useResponsiveItemsPerPage } from '../../../hooks';
import './Pipeline.css';

const TABLE_COLUMNS = [
  { key: 'name', label: 'Name', sortable: true, fr: 1.2 },
  { key: 'job', label: 'Job', sortable: true, fr: 1.2 },
  { key: 'score', label: 'Score', sortable: true, fr: 1.5 },
  { key: 'date', label: 'Date', sortable: true, fr: 1 },
  { key: 'antiCheat', label: 'Integrity', sortable: false, fr: 1 },
  { key: 'status', label: 'Status', sortable: false, fr: 1 },
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

const ACTION_LABELS = {
  accept: 'Accept',
  reject: 'Reject',
  shortlist: 'Shortlist',
};

function clampScore(score) {
  const value = Number(score || 0);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

const getScoreTone = (score) => {
  const value = clampScore(score);
  if (value >= 85) return 'strong';
  if (value >= 70) return 'good';
  if (value >= 50) return 'watch';
  return 'risk';
};

// Layout constants
const ROW_HEIGHT = 57;
const HEADER_HEIGHT = 45;
const PAGINATION_HEIGHT = 56;

// Shortcuts configuration
const SHORTCUTS_CONFIG = {
  filterLabel: 'Filters',
};

// Overlay filter definitions
const STATUS_OPTIONS = ['Shortlisted', 'Pending', 'Accepted', 'Rejected'];
const BASE_OVERLAY_FILTERS = [
  { key: 'status', label: 'Status', type: 'multiselect', options: STATUS_OPTIONS },
  { key: 'score', label: 'Score', type: 'range', minLabel: 'Min', maxLabel: 'Max' },
  { key: 'flaggedOnly', label: 'Integrity', type: 'toggle', toggleLabel: 'Show flagged only' },
];
const INITIAL_OVERLAY = { status: [], job: '', score: { min: '', max: '' }, flaggedOnly: false };
const JOB_PERF_PER_PAGE = 5;

function average(values) {
  const numbers = values.map(Number).filter((value) => Number.isFinite(value));
  if (!numbers.length) return 0;
  return Math.round(numbers.reduce((sum, value) => sum + value, 0) / numbers.length);
}

function buildApplicationTrendData(candidates) {
  const buckets = new Map();

  candidates.forEach((candidate) => {
    const date = new Date(candidate.createdAt || candidate.raw?.createdAt || candidate.date);
    const key = Number.isNaN(date.getTime())
      ? candidate.date || 'Unknown'
      : date.toISOString().slice(0, 10);
    const label = Number.isNaN(date.getTime())
      ? key
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const bucket = buckets.get(key) || { key, week: label, applications: 0, accepted: 0 };

    bucket.applications += 1;
    bucket.accepted += candidate.status === 'accepted' ? 1 : 0;
    buckets.set(key, bucket);
  });

  return [...buckets.values()].sort((a, b) => String(a.key).localeCompare(String(b.key))).slice(-8);
}

function buildScoreByRoleData(candidates) {
  const groups = new Map();

  candidates.forEach((candidate) => {
    const role = candidate.job || 'Unassigned job';
    const scores = groups.get(role) || [];
    scores.push(candidate.score || 0);
    groups.set(role, scores);
  });

  return [...groups.entries()]
    .map(([label, scores]) => ({ label, value: average(scores) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
}

function buildInsights(candidates, jobs) {
  const flaggedCount = candidates.filter((candidate) => candidate.antiCheat !== 'clean').length;
  const pendingCount = candidates.filter((candidate) => candidate.status === 'pending').length;
  const applicationsByJob = new Map();
  candidates.forEach((candidate) => {
    const key = candidate.jobId || candidate.job;
    applicationsByJob.set(key, (applicationsByJob.get(key) || 0) + 1);
  });
  let topJob = null;
  jobs.forEach((job) => {
    const filteredTotal = applicationsByJob.get(job.id) || applicationsByJob.get(job.title) || 0;
    if (!topJob || filteredTotal > topJob.filteredTotal) topJob = { ...job, filteredTotal };
  });
  const averageScore = average(candidates.map((candidate) => candidate.score));

  return [
    {
      title: 'Role demand',
      description: topJob
        ? `${topJob.title} has ${topJob.filteredTotal || 0} application(s) in the current view.`
        : 'Applications will appear here when candidates enter the pipeline.',
    },
    {
      title: 'Score health',
      description: `${averageScore}% is the current average candidate score across loaded applications.`,
    },
    {
      title: 'Integrity review',
      description: flaggedCount
        ? `${flaggedCount} candidate(s) need integrity review before a final decision.`
        : 'No integrity flags are visible in the current candidate set.',
    },
    {
      title: 'Review workload',
      description: pendingCount
        ? `${pendingCount} candidate(s) are still waiting for a first review.`
        : 'There are no pending candidates in the current view.',
    },
  ];
}

function buildJobPerformanceData(jobs, candidates, useJobTotalsFallback = false) {
  const jobKeyByLookup = new Map();
  jobs.forEach((job) => {
    jobKeyByLookup.set(job.id, job.id);
    jobKeyByLookup.set(job.title, job.id);
  });
  const candidatesByJob = new Map();
  candidates.forEach((candidate) => {
    const key =
      jobKeyByLookup.get(candidate.jobId) ||
      jobKeyByLookup.get(candidate.job) ||
      candidate.jobId ||
      candidate.job;
    if (!key) return;
    const list = candidatesByJob.get(key) || [];
    list.push(candidate);
    candidatesByJob.set(key, list);
  });

  return jobs.map((job) => {
    const jobCandidates = candidatesByJob.get(job.id) || [];
    let accepted = 0;
    let rejected = 0;
    let shortlisted = 0;
    jobCandidates.forEach((candidate) => {
      if (candidate.status === 'accepted') accepted += 1;
      else if (candidate.status === 'rejected') rejected += 1;
      else if (candidate.status === 'shortlist' || candidate.status === 'shortlisted') {
        shortlisted += 1;
      }
    });

    if (!jobCandidates.length && useJobTotalsFallback) {
      return {
        job: job.title,
        avgScore: job.avgScore || 0,
        accepted: job.accepted || 0,
        rejected: job.rejected || 0,
        shortlisted: job.shortlisted || 0,
        total: job.totalApplied || 0,
      };
    }

    return {
      job: job.title,
      avgScore: average(jobCandidates.map((candidate) => candidate.score)),
      accepted,
      rejected,
      shortlisted,
      total: jobCandidates.length,
    };
  });
}

const JOB_PERFORMANCE_COLUMNS = [
  { key: 'job', label: 'Job', sortable: true },
  { key: 'avgScore', label: 'Avg Score', sortable: true },
  { key: 'accepted', label: 'Accepted', sortable: true },
  { key: 'rejected', label: 'Rejected', sortable: true },
  { key: 'shortlisted', label: 'Shortlisted', sortable: true },
  { key: 'total', label: 'Total', sortable: true },
];

const GRID_TEMPLATE = `${TABLE_COLUMNS.map((col) => `minmax(0, ${col.fr || 1}fr)`).join(' ')} 2rem`;
const JOB_PERF_GRID = JOB_PERFORMANCE_COLUMNS.map((col) =>
  col.key === 'job' ? '2fr' : '1fr'
).join(' ');

const SELECTED_CANDIDATE_STORAGE_KEY = 'pipeline:lastSelectedCandidateId';

const VIEW_OPTION = { id: 'view', label: 'View details', icon: Eye, variant: 'default' };

function getCandidateStatusLabel(status) {
  return STATUS_LABELS[status] || STATUS_LABELS[String(status || '').toLowerCase()] || 'Pending';
}

function getIntegrityLabel(integrity) {
  return (
    INTEGRITY_LABELS[integrity] ||
    INTEGRITY_LABELS[String(integrity || '').toLowerCase()] ||
    'Clean'
  );
}

function getCandidateInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getTopEvidence(candidate) {
  const questionEvidence = (candidate.questions || [])
    .filter((question) => question.aiFeedback || question.answer)
    .slice(0, 2)
    .map((question, index) => ({
      id: question.id || index,
      title: question.question || `Interview response ${index + 1}`,
      description: question.aiFeedback || question.answer,
    }));

  if (questionEvidence.length) return questionEvidence;
  if (candidate.analysis?.summary) {
    return [
      { id: 'resume-summary', title: 'Resume summary', description: candidate.analysis.summary },
    ];
  }
  if (candidate.analysis?.skills?.length) {
    return [
      {
        id: 'resume-skills',
        title: 'Resume skills',
        description: candidate.analysis.skills.slice(0, 6).join(', '),
      },
    ];
  }
  return [
    {
      id: 'no-evidence',
      title: 'Evidence pending',
      description: 'Interview and resume evidence will appear here when available.',
    },
  ];
}

function getCandidateMenuOptions(candidate, canChangeCandidateStatus = true) {
  if (!canChangeCandidateStatus) return [VIEW_OPTION];
  if (['accepted', 'rejected'].includes(candidate.status)) return [VIEW_OPTION];
  const options =
    candidate.status === 'shortlist' || candidate.status === 'shortlisted'
      ? [
          VIEW_OPTION,
          { id: 'accept', label: 'Accept', icon: Check, variant: 'success' },
          { id: 'reject', label: 'Reject', icon: X, variant: 'danger' },
        ]
      : [
          VIEW_OPTION,
          {
            id: 'shortlist',
            label: 'Shortlist',
            icon: ListFilter,
            variant: 'info',
            separator: true,
          },
          { id: 'accept', label: 'Accept', icon: Check, variant: 'success' },
          { id: 'reject', label: 'Reject', icon: X, variant: 'danger' },
        ];
  return options;
}

function getStoredSelectedCandidateId() {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(SELECTED_CANDIDATE_STORAGE_KEY);
  return raw || null;
}

function overlayFromSearch(search) {
  const params = new URLSearchParams(search);
  const jobId = params.get('jobId');
  return jobId ? { ...INITIAL_OVERLAY, job: jobId } : INITIAL_OVERLAY;
}

export const Pipeline = memo(function Pipeline() {
  const { dataVersion, isLoading } = useBackendData();
  const navigate = useNavigate();
  const location = useLocation();
  const initialSelectedId = useMemo(() => {
    const selectedFromState = location.state?.selectedCandidateId;
    if (selectedFromState) {
      return selectedFromState;
    }
    return getStoredSelectedCandidateId();
  }, [location.state]);
  const [activeTab, setActiveTab] = useState('pipeline');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [overviewKey, setOverviewKey] = useState(0); // Force animation reset on tab change
  const [overviewSortColumn, setOverviewSortColumn] = useState(null);
  const [overviewSortDirection, setOverviewSortDirection] = useState(null);
  const [overviewPage, setOverviewPage] = useState(1);
  const [lastSelectedId, setLastSelectedId] = useState(() => initialSelectedId);
  const [searchValue, setSearchValue] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pendingCandidateAction, setPendingCandidateAction] = useState(null);
  const [actionError, setActionError] = useState('');
  const initialOverlayFilters = useMemo(
    () => overlayFromSearch(location.search),
    [location.search]
  );
  const [overlayFilters, setOverlayFilters] = useState(initialOverlayFilters);

  const overlayFilterDefs = useMemo(() => {
    void dataVersion;
    const uniqueJobs = JOBS.map((job) => ({ value: job.id, label: job.title })).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
    return [
      BASE_OVERLAY_FILTERS[0],
      { key: 'job', label: 'Job', type: 'select', options: uniqueJobs },
      ...BASE_OVERLAY_FILTERS.slice(1),
    ];
  }, [dataVersion]);
  const canChangeCandidateStatus = useMemo(() => {
    void dataVersion;
    return canCurrentUser('change_candidate_status');
  }, [dataVersion]);

  const selectedCandidate = useMemo(() => {
    void dataVersion;
    if (!lastSelectedId) return null;
    return CANDIDATES.find((candidate) => candidate.id === lastSelectedId) || null;
  }, [lastSelectedId, dataVersion]);

  const filteredCandidates = useMemo(() => {
    void dataVersion;
    const q = searchValue.trim() ? searchValue.toLowerCase() : null;
    const { status, job, score, flaggedOnly } = overlayFilters;
    const normalizedStatuses = status.length
      ? new Set(
          status.flatMap((candidateStatus) => {
            const normalized = candidateStatus.toLowerCase();
            return normalized === 'shortlisted' ? ['shortlisted', 'shortlist'] : [normalized];
          })
        )
      : null;
    const scoreMin = score.min !== '' ? Number(score.min) : null;
    const scoreMax = score.max !== '' ? Number(score.max) : null;

    return CANDIDATES.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.job.toLowerCase().includes(q)) return false;
      if (normalizedStatuses && !normalizedStatuses.has(c.status)) return false;
      if (job && c.jobId !== job) return false;
      if (scoreMin !== null && c.score < scoreMin) return false;
      if (scoreMax !== null && c.score > scoreMax) return false;
      if (flaggedOnly && c.antiCheat !== 'flagged') return false;
      return true;
    });
  }, [searchValue, overlayFilters, dataVersion]);

  const overviewData = useMemo(() => {
    void dataVersion;
    const candidates = filteredCandidates;
    const jobs = [...JOBS];
    const filtersApplied = Boolean(
      searchValue.trim() ||
      overlayFilters.status.length ||
      overlayFilters.job ||
      overlayFilters.score.min ||
      overlayFilters.score.max ||
      overlayFilters.flaggedOnly
    );
    const filteredJobIds = new Set(candidates.map((candidate) => candidate.jobId).filter(Boolean));
    const visibleJobs = overlayFilters.job
      ? jobs.filter((job) => job.id === overlayFilters.job)
      : filtersApplied
        ? jobs.filter((job) => filteredJobIds.has(job.id))
        : jobs;

    return {
      activeJobsCount: visibleJobs.filter((job) => job.status === 'active').length,
      stats: {
        totalCandidates: candidates.length,
        needsReview: candidates.filter((candidate) => candidate.status === 'pending').length,
        averageScore: average(candidates.map((candidate) => candidate.score)),
        shortlisted: candidates.filter((candidate) =>
          ['shortlist', 'shortlisted'].includes(candidate.status)
        ).length,
        flagged: candidates.filter((candidate) => candidate.antiCheat !== 'clean').length,
      },
      applicationTrend: buildApplicationTrendData(candidates),
      scoreByRole: buildScoreByRoleData(candidates),
      insights: buildInsights(candidates, visibleJobs),
      jobPerformance: buildJobPerformanceData(visibleJobs, candidates, !filtersApplied),
    };
  }, [filteredCandidates, overlayFilters, searchValue, dataVersion]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (overlayFilters.status.length) count++;
    if (overlayFilters.job) count++;
    if (overlayFilters.score.min || overlayFilters.score.max) count++;
    if (overlayFilters.flaggedOnly) count++;
    return count;
  }, [overlayFilters]);

  const clearAllOverlayFilters = useCallback(() => {
    setOverlayFilters(INITIAL_OVERLAY);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
    setCurrentPage(1);
  }, []);

  // Clear row selection when clicking anywhere outside a table row.
  const handleDocumentClick = useCallback(
    (e) => {
      if (openMenuId !== null) return;
      if (
        e.target.closest('.side-panel') ||
        e.target.closest('.confirm-dialog') ||
        e.target.closest('.filter-overlay')
      ) {
        return;
      }
      if (!e.target.closest('.table-row') && !e.target.closest('.row-menu')) {
        setLastSelectedId(null);
        setIsPreviewOpen(false);
      }
    },
    [openMenuId]
  );

  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [handleDocumentClick]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (lastSelectedId === null) {
      window.sessionStorage.removeItem(SELECTED_CANDIDATE_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(SELECTED_CANDIDATE_STORAGE_KEY, String(lastSelectedId));
  }, [lastSelectedId]);

  const openCandidateDetails = useCallback(
    (candidate) => {
      setLastSelectedId(candidate.id);
      navigate(`/candidates/${toSlug(candidate.name, candidate.id)}`, {
        state: { selectedCandidateId: candidate.id },
      });
    },
    [navigate]
  );

  const handleCandidateSelect = useCallback((candidate) => {
    setLastSelectedId(candidate.id);
    setIsPreviewOpen(true);
  }, []);

  const executeCandidateStatusAction = useCallback(async (candidate, action) => {
    try {
      await updateCandidateStatus(candidate.id, action);
      setOpenMenuId(null);
    } catch (error) {
      setActionError(error.message || 'Unable to update candidate.');
    }
  }, []);

  const handleCandidateAction = useCallback(
    async (candidate, action) => {
      if (action === 'view') {
        openCandidateDetails(candidate);
        return;
      }
      if (['accept', 'reject'].includes(action)) {
        setPendingCandidateAction({ candidate, action });
        return;
      }
      await executeCandidateStatusAction(candidate, action);
    },
    [executeCandidateStatusAction, openCandidateDetails]
  );

  const confirmCandidateAction = useCallback(async () => {
    if (!pendingCandidateAction) return;
    const { candidate, action } = pendingCandidateAction;
    setPendingCandidateAction(null);
    await executeCandidateStatusAction(candidate, action);
  }, [executeCandidateStatusAction, pendingCandidateAction]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    if (tab === 'overview') setOverviewKey((k) => k + 1);
  }, []);

  const sortedCandidates = useMemo(() => {
    const list = [...filteredCandidates];

    return list.sort((a, b) => {
      if (!sortColumn || !sortDirection) return 0;
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      if (typeof aVal === 'number') return (aVal - bVal) * modifier;
      return String(aVal).localeCompare(String(bVal)) * modifier;
    });
  }, [sortColumn, sortDirection, filteredCandidates]);

  // Responsive items per page calculation
  const { tableRef, itemsPerPage } = useResponsiveItemsPerPage(
    { rowHeight: ROW_HEIGHT, headerHeight: HEADER_HEIGHT, paginationHeight: PAGINATION_HEIGHT },
    { paginationSelector: '.pipeline-page__pagination' }
  );

  const totalPages = Math.max(1, Math.ceil(sortedCandidates.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedCandidates = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;
    return sortedCandidates.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCandidates, safePage, itemsPerPage]);

  const handleSort = useCallback((columnKey, direction) => {
    setSortColumn(direction ? columnKey : null);
    setSortDirection(direction);
  }, []);

  const handleOverviewSort = useCallback((columnKey, direction) => {
    setOverviewSortColumn(direction ? columnKey : null);
    setOverviewSortDirection(direction);
    setOverviewPage(1);
  }, []);

  const sortedJobPerformance = useMemo(() => {
    if (!overviewSortColumn || !overviewSortDirection) return overviewData.jobPerformance;

    return [...overviewData.jobPerformance].sort((a, b) => {
      const aVal = a[overviewSortColumn];
      const bVal = b[overviewSortColumn];
      const modifier = overviewSortDirection === 'asc' ? 1 : -1;
      if (typeof aVal === 'number') return (aVal - bVal) * modifier;
      return String(aVal).localeCompare(String(bVal)) * modifier;
    });
  }, [overviewSortColumn, overviewSortDirection, overviewData.jobPerformance]);

  const jobPerfTotalPages = Math.max(1, Math.ceil(sortedJobPerformance.length / JOB_PERF_PER_PAGE));
  const safeOverviewPage = Math.min(overviewPage, jobPerfTotalPages);
  const paginatedJobPerformance = useMemo(() => {
    const start = (safeOverviewPage - 1) * JOB_PERF_PER_PAGE;
    return sortedJobPerformance.slice(start, start + JOB_PERF_PER_PAGE);
  }, [sortedJobPerformance, safeOverviewPage]);

  const columnsWithSortState = useMemo(
    () =>
      TABLE_COLUMNS.map((col) => ({
        ...col,
        sortState: sortColumn === col.key ? sortDirection : null,
      })),
    [sortColumn, sortDirection]
  );

  const overviewColumnsWithSortState = useMemo(
    () =>
      JOB_PERFORMANCE_COLUMNS.map((col) => ({
        ...col,
        sortState: overviewSortColumn === col.key ? overviewSortDirection : null,
      })),
    [overviewSortColumn, overviewSortDirection]
  );

  const tabs = useMemo(
    () => [
      {
        label: 'Pipeline',
        isActive: activeTab === 'pipeline',
        onClick: () => handleTabChange('pipeline'),
      },
      {
        label: 'Overview',
        isActive: activeTab === 'overview',
        onClick: () => handleTabChange('overview'),
      },
    ],
    [activeTab, handleTabChange]
  );

  const selectedCandidateEvidence = useMemo(
    () => (selectedCandidate ? getTopEvidence(selectedCandidate) : []),
    [selectedCandidate]
  );

  const selectedCandidateActions = useMemo(
    () =>
      selectedCandidate
        ? getCandidateMenuOptions(selectedCandidate, canChangeCandidateStatus).filter(
            (option) => option.id !== 'view'
          )
        : [],
    [selectedCandidate, canChangeCandidateStatus]
  );

  const isInitialLoading = isLoading && dataVersion === 0;

  return (
    <div className={`pipeline-page${activeTab === 'overview' ? ' pipeline-page--overview' : ''}`}>
      <Shortcuts
        filterLabel={SHORTCUTS_CONFIG.filterLabel}
        onFilterClick={() => setIsFilterOpen(true)}
        filterSlot={
          activeFilterCount ? (
            <AppliedFilterChips
              count={activeFilterCount}
              onClearAll={clearAllOverlayFilters}
            />
          ) : null
        }
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search candidates..."
        secondaryAction={{
          label: `${overviewData.activeJobsCount} Active jobs`,
          icon: ArrowRight,
          onClick: () => navigate('/jobs?status=Active'),
        }}
      />

      <div className="pipeline-page__dashboard">
        <div className="pipeline-page__content">
          <Tabs items={tabs} />

          {activeTab === 'pipeline' && (
            <>
              <div className="pipeline-page__summary-strip" aria-label="Pipeline summary">
                <div className="pipeline-page__summary-item">
                  <span>Total</span>
                  <strong>{overviewData.stats.totalCandidates}</strong>
                </div>
                <div className="pipeline-page__summary-item">
                  <span>Needs review</span>
                  <strong>{overviewData.stats.needsReview}</strong>
                </div>
                <div className="pipeline-page__summary-item">
                  <span>Shortlisted</span>
                  <strong>{overviewData.stats.shortlisted}</strong>
                </div>
                <div className="pipeline-page__summary-item" data-summary="flagged">
                  <span>Flagged</span>
                  <strong>{overviewData.stats.flagged}</strong>
                </div>
                <div className="pipeline-page__summary-item">
                  <span>Avg. score</span>
                  <strong>{overviewData.stats.averageScore}%</strong>
                </div>
              </div>

              <div className="pipeline-page__table" ref={tableRef}>
                <TableHeader
                  className="pipeline-page__header"
                  columns={columnsWithSortState}
                  onSort={handleSort}
                  gridTemplateColumns={GRID_TEMPLATE}
                  showMenu
                />

                <div className="pipeline-page__rows">
                  {paginatedCandidates.length > 0 ? (
                    paginatedCandidates.map((candidate) => {
                      const score = clampScore(candidate.score);
                      return (
                        <TableRow
                          className="pipeline-page__row"
                          key={candidate.id}
                          showMenu
                          selected={candidate.id === lastSelectedId}
                          onMouseDown={() => setLastSelectedId(candidate.id)}
                          onMenuClick={() => {
                            setLastSelectedId(candidate.id);
                            setOpenMenuId(openMenuId === candidate.id ? null : candidate.id);
                          }}
                          onMenuSelect={(action) => {
                            handleCandidateAction(candidate, action);
                            setOpenMenuId(null);
                          }}
                          menuOptions={getCandidateMenuOptions(candidate, canChangeCandidateStatus)}
                          menuOpen={openMenuId === candidate.id}
                          onMenuClose={() => setOpenMenuId(null)}
                          onClick={() => handleCandidateSelect(candidate)}
                          gridTemplateColumns={GRID_TEMPLATE}
                        >
                          <TableCell
                            color="tertiary"
                            icon={
                              <span className="pipeline-page__avatar">
                                {getCandidateInitials(candidate.name)}
                              </span>
                            }
                          >
                            {candidate.name}
                          </TableCell>
                          <TableCell color="secondary">{candidate.job}</TableCell>
                          <TableCell className="pipeline-page__score-cell">
                            <span className="pipeline-page__score">
                              <span className="pipeline-page__score-bar">
                                <span
                                  className={[
                                    'pipeline-page__score-fill',
                                    `pipeline-page__score-fill--${getScoreTone(score)}`,
                                  ].join(' ')}
                                  style={{ width: `${score}%` }}
                                />
                              </span>
                              <span className="pipeline-page__score-value">{score}%</span>
                            </span>
                          </TableCell>
                          <TableCell color="tertiary">{candidate.date}</TableCell>
                          <TableCell>
                            <Badge
                              type="cheatingFlag"
                              variant={candidate.antiCheat}
                              iconLeft
                              outline
                            />
                          </TableCell>
                          <TableCell>
                            <Badge type="candidateState" variant={candidate.status} />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : !isInitialLoading ? (
                    <div className="pipeline-page__empty">
                      <EmptyState
                        icon={<Users size={24} />}
                        title={CANDIDATES.length ? 'No matching candidates' : 'No candidates yet'}
                        description={
                          CANDIDATES.length
                            ? 'Adjust the search or filters to show more candidates.'
                            : 'Candidate applications will appear here once people apply to active jobs.'
                        }
                      />
                    </div>
                  ) : null}
                </div>

                {sortedCandidates.length > 0 && (
                  <div className="pipeline-page__pagination">
                    <Pagination
                      currentPage={safePage}
                      totalPages={totalPages}
                      totalItems={sortedCandidates.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'overview' && (
            <div key={overviewKey} className="pipeline-page__overview">
              <div className="overview__quick-stats">
                <QuickInfoCard
                  icon={<Users />}
                  number={overviewData.stats.totalCandidates}
                  title="Total candidates"
                  density="compact"
                  animated={false}
                />
                <QuickInfoCard
                  icon={<Clock />}
                  number={overviewData.stats.needsReview}
                  title="Needs review"
                  density="compact"
                  animated={false}
                />
                <QuickInfoCard
                  icon={<Award />}
                  number={`${overviewData.stats.averageScore}%`}
                  title="Average score"
                  density="compact"
                  animated={false}
                />
                <QuickInfoCard
                  icon={<AlertTriangle />}
                  number={overviewData.stats.flagged}
                  title="Integrity flags"
                  density="compact"
                  animated={false}
                />
              </div>

              <div className="overview__table-section overview__table-section--anchor">
                <SectionTitle>Job Performance</SectionTitle>
                <div className="overview__table-container">
                  <TableHeader
                    className="overview__table-header"
                    columns={overviewColumnsWithSortState}
                    onSort={handleOverviewSort}
                    gridTemplateColumns={JOB_PERF_GRID}
                  />
                  <div className="overview__table-rows">
                    {paginatedJobPerformance.map((job, index) => (
                      <TableRow
                        key={index}
                        className="overview__table-row"
                        gridTemplateColumns={JOB_PERF_GRID}
                        style={{ '--row-index': index }}
                      >
                        <TableCell color="tertiary" className="overview__table-cell--job">
                          {job.job}
                        </TableCell>
                        <TableCell color="tertiary" className="overview__table-cell--value">
                          {job.avgScore}%
                        </TableCell>
                        <TableCell color="tertiary" className="overview__table-cell--value">
                          {job.accepted}
                        </TableCell>
                        <TableCell color="tertiary" className="overview__table-cell--value">
                          {job.rejected}
                        </TableCell>
                        <TableCell color="tertiary" className="overview__table-cell--value">
                          {job.shortlisted}
                        </TableCell>
                        <TableCell color="tertiary" className="overview__table-cell--value">
                          {job.total}
                        </TableCell>
                      </TableRow>
                    ))}
                  </div>
                </div>
                {sortedJobPerformance.length > JOB_PERF_PER_PAGE && (
                  <Pagination
                    currentPage={safeOverviewPage}
                    totalPages={jobPerfTotalPages}
                    totalItems={sortedJobPerformance.length}
                    itemsPerPage={JOB_PERF_PER_PAGE}
                    onPageChange={setOverviewPage}
                  />
                )}
              </div>

              <div className="overview__charts-section">
                <SectionTitle>Pipeline Health</SectionTitle>
                <div className="overview__charts">
                  <AreaChart
                    title="Candidate volume trend"
                    data={overviewData.applicationTrend}
                    xKey="week"
                    dataKeys={[
                      { key: 'applications', label: 'Applications', color: CHART_BRAND },
                      { key: 'accepted', label: 'Accepted', color: CHART_SUCCESS },
                    ]}
                    density="compact"
                    animated={false}
                  />
                  <BarChart
                    title="Average score by role"
                    data={overviewData.scoreByRole}
                    dataKeys={[{ key: 'value', label: 'Average score' }]}
                    density="compact"
                    animated={false}
                  />
                </div>
              </div>

              <div className="overview__insights">
                <SectionTitle>Hiring Signals</SectionTitle>
                <div className="overview__insights-grid">
                  {overviewData.insights.map((insight) => (
                    <InfoCard
                      key={insight.title}
                      title={insight.title}
                      description={insight.description}
                      density="compact"
                      animated={false}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedCandidate && (
        <SidePanel
          isOpen={isPreviewOpen}
          title={selectedCandidate.name}
          subtitle={selectedCandidate.job}
          size="md"
          onClose={() => setIsPreviewOpen(false)}
          footer={
            <>
              <Button variant="ghost" size="sm" onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                iconRight={<ArrowRight size={14} />}
                onClick={() => openCandidateDetails(selectedCandidate)}
              >
                Open full details
              </Button>
            </>
          }
        >
          <div className="pipeline-preview">
            <section className="pipeline-preview__score-card" aria-label="Candidate score">
              <div className="pipeline-preview__score-header">
                <span>Overall score</span>
                <strong>{clampScore(selectedCandidate.score)}%</strong>
              </div>
              <span className="pipeline-preview__score-bar">
                <span
                  className={[
                    'pipeline-preview__score-fill',
                    `pipeline-page__score-fill--${getScoreTone(selectedCandidate.score)}`,
                  ].join(' ')}
                  style={{ width: `${clampScore(selectedCandidate.score)}%` }}
                />
              </span>
            </section>

            <section className="pipeline-preview__section">
              <h3 className="pipeline-preview__section-title">Decision state</h3>
              <div className="pipeline-preview__badges">
                <Badge type="candidateState" variant={selectedCandidate.status}>
                  {getCandidateStatusLabel(selectedCandidate.status)}
                </Badge>
                <Badge type="cheatingFlag" variant={selectedCandidate.antiCheat} iconLeft outline>
                  {getIntegrityLabel(selectedCandidate.antiCheat)}
                </Badge>
              </div>
              <div className="pipeline-preview__meta-grid">
                <div>
                  <span>Applied</span>
                  <strong>{selectedCandidate.date}</strong>
                </div>
                <div>
                  <span>Integrity</span>
                  <strong>{getIntegrityLabel(selectedCandidate.antiCheat)}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{selectedCandidate.email || 'Not provided'}</strong>
                </div>
                <div>
                  <span>Resume</span>
                  {selectedCandidate.cvUrl ? (
                    <a href={selectedCandidate.cvUrl} target="_blank" rel="noreferrer">
                      Open resume
                    </a>
                  ) : (
                    <strong>{selectedCandidate.resumeName || 'Not provided'}</strong>
                  )}
                </div>
              </div>
            </section>

            <section className="pipeline-preview__section">
              <h3 className="pipeline-preview__section-title">Top evidence</h3>
              <div className="pipeline-preview__evidence-list">
                {selectedCandidateEvidence.map((evidence) => (
                  <article key={evidence.id} className="pipeline-preview__evidence">
                    <h4>{evidence.title}</h4>
                    <p>{evidence.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="pipeline-preview__section">
              <h3 className="pipeline-preview__section-title">Actions</h3>
              {selectedCandidateActions.length > 0 ? (
                <div className="pipeline-preview__actions">
                  {selectedCandidateActions.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <Button
                        key={action.id}
                        variant={
                          action.id === 'accept'
                            ? 'success'
                            : action.id === 'reject'
                              ? 'danger'
                              : 'secondary'
                        }
                        size="sm"
                        iconLeft={<ActionIcon size={14} />}
                        onClick={() => handleCandidateAction(selectedCandidate, action.id)}
                      >
                        {ACTION_LABELS[action.id] || action.label}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <p className="pipeline-preview__read-only">
                  {canChangeCandidateStatus
                    ? 'This candidate already has a final decision.'
                    : 'Decision actions are read-only for your role.'}
                </p>
              )}
            </section>
          </div>
        </SidePanel>
      )}

      <FilterOverlay
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={overlayFilterDefs}
        values={overlayFilters}
        onApply={(v) => {
          setOverlayFilters(v);
          setCurrentPage(1);
        }}
      />

      <ConfirmDialog
        isOpen={Boolean(pendingCandidateAction)}
        title={`Confirm ${ACTION_LABELS[pendingCandidateAction?.action] || 'decision'}`}
        description={
          pendingCandidateAction
            ? `This decision is permanent. Continue with ${pendingCandidateAction.candidate.name}?`
            : ''
        }
        confirmLabel={ACTION_LABELS[pendingCandidateAction?.action] || 'Confirm'}
        confirmVariant={pendingCandidateAction?.action === 'reject' ? 'danger' : 'primary'}
        onConfirm={confirmCandidateAction}
        onClose={() => setPendingCandidateAction(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(actionError)}
        title="Unable to update candidate"
        description={actionError}
        confirmLabel="Close"
        showCancel={false}
        onConfirm={() => setActionError('')}
        onClose={() => setActionError('')}
      />
    </div>
  );
});
