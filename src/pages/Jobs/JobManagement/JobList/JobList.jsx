import { useState, useMemo, useCallback, memo } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Users, Pencil, Plus, Share2, Briefcase } from 'lucide-react';
import { Shortcuts } from '../../../../components/layout/Shortcuts';
import { EntityCard } from '../../../../components/ui/Cards';
import { AppliedFilterChips } from '../../../../components/ui/AppliedFilterChips';
import { Pagination } from '../../../../components/ui/Pagination';
import { FilterOverlay } from '../../../../components/ui/FilterOverlay';
import { Button } from '../../../../components/ui/Button';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { JOBS, JOB_TYPE_OPTIONS, useBackendData } from '../../../../api';
import { getDisplayJobStatus } from '../../../../utils';
import './JobList.css';

/* ── Menu options ── */

function getCardMenuOptions(canEditJob) {
  const options = [{ id: 'candidates', label: 'Show candidates', icon: Users, variant: 'default' }];
  if (canEditJob) {
    options.push({ id: 'share', label: 'Copy application link', icon: Share2, variant: 'default' });
    options.push({ id: 'edit', label: 'Edit job', icon: Pencil, variant: 'default' });
  }
  return options;
}

/* ── Smart date helpers ── */

const STATUS_DATE_CONFIG = {
  active: { suffix: '', subtitle: 'Until closing' },
  scheduled: { suffix: '', subtitle: 'Until opening' },
  closed: { suffix: ' ago', subtitle: 'Since closed' },
};

function formatSmartDate(status, duration) {
  const cfg = STATUS_DATE_CONFIG[status] || { suffix: '', subtitle: 'Duration' };
  return {
    title: `${duration}${cfg.suffix}`,
    subtitle: cfg.subtitle,
  };
}

/* ── Derived list data — enriched from shared JOBS ── */

/* ── Filter configs ── */

const STATUS_FILTERS = [
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'closed', label: 'Closed' },
];
const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest first' },
  { value: 'createdAt-asc', label: 'Oldest first' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'title-desc', label: 'Title Z-A' },
];
const DEFAULT_SORT = 'createdAt-desc';

const ITEMS_PER_PAGE = 6;

/* ── Shortcuts config ── */

const SHORTCUTS_CONFIG = {
  filterLabel: 'Filters',
};

function normalizeStatusParam(value) {
  const status = String(value || '')
    .trim()
    .toLowerCase();
  return STATUS_FILTERS.some((option) => option.value === status) ? status : '';
}

function createdAtTime(item) {
  const date = new Date(item.raw?.createdAt || item.createdAt || 0);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

/* ── Overlay filter definitions ── */

const INITIAL_OVERLAY = {
  statusQuick: '',
  typeQuick: '',
  sortQuick: DEFAULT_SORT,
};

/* ── Component ── */

export const JobList = memo(function JobList({
  onViewJob,
  onEditJob,
  onCreateJob,
  onShowCandidates,
  onShareJob,
  canCreateJob = true,
  canEditJob = true,
}) {
  const location = useLocation();
  const { dataVersion, isLoading } = useBackendData();

  const initialStatus = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return normalizeStatusParam(params.get('status'));
  }, [location.search]);

  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [copiedJobId, setCopiedJobId] = useState('');
  const [overlayFilters, setOverlayFilters] = useState(() => ({
    ...INITIAL_OVERLAY,
    statusQuick: initialStatus,
  }));

  const jobsForCards = useMemo(() => {
    void dataVersion;
    return JOBS.map((j) => ({
      ...j,
      displayStatus: getDisplayJobStatus(j),
      totalCandidates: j.totalApplied || 0,
      mocks: (j.mocks || []).map((m) => m.name),
    }));
  }, [dataVersion]);

  const overlayFilterDefs = useMemo(
    () => [
      {
        key: 'statusQuick',
        label: 'Status',
        type: 'select',
        options: STATUS_FILTERS,
      },
      {
        key: 'typeQuick',
        label: 'Job Type',
        type: 'select',
        options: JOB_TYPE_OPTIONS,
      },
      {
        key: 'sortQuick',
        label: 'Sort by',
        type: 'select',
        options: SORT_OPTIONS,
      },
    ],
    []
  );
  const cardMenuOptions = useMemo(() => getCardMenuOptions(canEditJob), [canEditJob]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (overlayFilters.statusQuick) count++;
    if (overlayFilters.typeQuick) count++;
    if (overlayFilters.sortQuick && overlayFilters.sortQuick !== DEFAULT_SORT) count++;
    return count;
  }, [overlayFilters]);

  const summary = useMemo(() => {
    const active = jobsForCards.filter((job) => job.displayStatus === 'active').length;
    const scheduled = jobsForCards.filter((job) => job.displayStatus === 'scheduled').length;
    const closed = jobsForCards.filter((job) => job.displayStatus === 'closed').length;
    return {
      total: jobsForCards.length,
      active,
      scheduled,
      closed,
    };
  }, [jobsForCards]);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    const status = STATUS_FILTERS.find((option) => option.value === overlayFilters.statusQuick);
    const type = JOB_TYPE_OPTIONS.find((option) => option.value === overlayFilters.typeQuick);
    const sort = SORT_OPTIONS.find((option) => option.value === overlayFilters.sortQuick);
    if (status) chips.push({ key: 'statusQuick', label: `Status: ${status.label}` });
    if (type) chips.push({ key: 'typeQuick', label: `Type: ${type.label}` });
    if (sort && sort.value !== DEFAULT_SORT)
      chips.push({ key: 'sortQuick', label: `Sort: ${sort.label}` });
    return chips;
  }, [overlayFilters]);

  const clearAllOverlayFilters = useCallback(() => {
    const next = { ...INITIAL_OVERLAY };
    setOverlayFilters(next);
    setStatusFilter('');
    setTypeFilter('');
    setSortBy(DEFAULT_SORT);
    setCurrentPage(1);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
    setCurrentPage(1);
  }, []);

  const filteredJobs = useMemo(() => {
    const statusLower = statusFilter || null;
    const typeValue = typeFilter || null;
    const q = searchValue.trim() ? searchValue.toLowerCase() : null;

    let jobs = jobsForCards.filter((j) => {
      if (statusLower && j.displayStatus !== statusLower) return false;
      if (typeValue && j.jobTypeValue !== typeValue) return false;
      if (q && !j.title.toLowerCase().includes(q) && !j.description.toLowerCase().includes(q))
        return false;
      return true;
    });

    switch (sortBy) {
      case 'createdAt-asc':
        jobs.sort((a, b) => createdAtTime(a) - createdAtTime(b));
        break;
      case 'title-asc':
        jobs.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        jobs.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        jobs.sort((a, b) => createdAtTime(b) - createdAtTime(a));
        break;
    }

    return jobs;
  }, [statusFilter, typeFilter, sortBy, searchValue, jobsForCards]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedJobs = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredJobs.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredJobs, safePage]);

  const handleMenuSelect = useCallback(
    (job, action) => {
      if (action === 'view') onViewJob?.(job.id);
      else if (action === 'edit') onEditJob?.(job.id);
      else if (action === 'candidates') onShowCandidates?.(job);
      else if (action === 'share') {
        onShareJob?.(job);
        setCopiedJobId(job.id);
        window.setTimeout(() => setCopiedJobId(''), 1800);
      }
    },
    [onViewJob, onEditJob, onShowCandidates, onShareJob]
  );
  const isInitialLoading = isLoading && dataVersion === 0;

  return (
    <div className="job-list">
      <Shortcuts
        filterLabel={SHORTCUTS_CONFIG.filterLabel}
        onFilterClick={() => setIsFilterOpen(true)}
        filterSlot={
          activeFilterCount ? (
            <AppliedFilterChips chips={activeFilterChips} onClearAll={clearAllOverlayFilters} />
          ) : null
        }
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search jobs..."
        primaryAction={
          canCreateJob
            ? {
                label: 'Create job',
                icon: Plus,
                iconPosition: 'left',
                onClick: () => onCreateJob?.(),
              }
            : undefined
        }
      />

      <div className="job-list__content">
        <div className="job-list__summary-strip" aria-label="Jobs summary">
          <div className="job-list__summary-item">
            <span>Total jobs</span>
            <strong>{summary.total}</strong>
          </div>
          <div className="job-list__summary-item">
            <span>Active</span>
            <strong>{summary.active}</strong>
          </div>
          <div className="job-list__summary-item">
            <span>Scheduled</span>
            <strong>{summary.scheduled}</strong>
          </div>
          <div className="job-list__summary-item">
            <span>Closed</span>
            <strong>{summary.closed}</strong>
          </div>
        </div>

        {/* Job cards */}
        <div className="job-list__cards">
          {paginatedJobs.length > 0 ? (
            paginatedJobs.map((job) => {
              const displayStatus = job.displayStatus;
              const smartDate = formatSmartDate(displayStatus, job.duration);
              const roleContext = [job.jobType, job.seniority, job.location || job.locationType]
                .filter(Boolean)
                .join(' · ');
              return (
                <EntityCard
                  key={job.id}
                  className="job-list__card"
                  userName={job.title}
                  userEmail={roleContext}
                  showAvatar={false}
                  showBadge
                  badgeType="jobStatus"
                  badgeVariant={displayStatus}
                  showMenu
                  menuOptions={cardMenuOptions}
                  onMenuSelect={(action) => handleMenuSelect(job, action)}
                  onClick={() => onViewJob?.(job.id)}
                  score={job.avgScore}
                  scoreLabel="Avg. score"
                  scoreDisplay="bar"
                  density="compact"
                  menuAlwaysVisible
                  colLeft={{
                    title: String(job.totalCandidates),
                    subtitle: 'Applications',
                  }}
                  colMid={{
                    title: String(job.mocks.length),
                    subtitle: 'Assessments',
                  }}
                  colRight={{
                    title: smartDate.title,
                    subtitle: smartDate.subtitle,
                  }}
                  tags={job.skills}
                  tagsLimit={3}
                  caption={copiedJobId === job.id ? 'Link copied' : undefined}
                  animated={false}
                />
              );
            })
          ) : !isInitialLoading ? (
            <EmptyState
              icon={<Briefcase size={24} />}
              title={jobsForCards.length ? 'No matching jobs' : 'No jobs yet'}
              description={
                jobsForCards.length
                  ? 'Adjust search or filters to show more jobs.'
                  : 'Create a mock first, then publish your first job.'
              }
              action={
                canCreateJob ? (
                  <Button variant="primary" iconRight={<Plus size={16} />} onClick={onCreateJob}>
                    Create Job
                  </Button>
                ) : undefined
              }
            />
          ) : null}
        </div>

        {/* Pagination */}
        {filteredJobs.length > 0 && (
          <div className="job-list__pagination">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filteredJobs.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <FilterOverlay
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={overlayFilterDefs}
        values={overlayFilters}
        onApply={(v) => {
          setOverlayFilters(v);
          setStatusFilter(v.statusQuick || '');
          setTypeFilter(v.typeQuick || '');
          setSortBy(v.sortQuick || DEFAULT_SORT);
          setCurrentPage(1);
        }}
      />
    </div>
  );
});

JobList.propTypes = {
  onViewJob: PropTypes.func,
  onEditJob: PropTypes.func,
  onCreateJob: PropTypes.func,
  onShowCandidates: PropTypes.func,
  onShareJob: PropTypes.func,
  canCreateJob: PropTypes.bool,
  canEditJob: PropTypes.bool,
};
