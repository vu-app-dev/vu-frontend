import { useState, useMemo, useCallback, memo } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Users, Pencil, Eye, Plus, FileText, Clock, Share2, Briefcase } from 'lucide-react';
import { Shortcuts } from '../../../../components/layout/Shortcuts';
import { EntityCard } from '../../../../components/ui/Cards';
import { Pagination } from '../../../../components/ui/Pagination';
import { FilterOverlay } from '../../../../components/ui/FilterOverlay';
import { Button } from '../../../../components/ui/Button';
import { EmptyState } from '../../../../components/ui/EmptyState';
import { JOBS, JOB_TYPE_OPTIONS, useBackendData } from '../../../../api';
import './JobList.css';

/* ── Menu options ── */

function getCardMenuOptions(canEditJob) {
  const options = [
    { id: 'view', label: 'View Details', icon: Eye, variant: 'default' },
    { id: 'candidates', label: 'Show Candidates', icon: Users, variant: 'default' },
  ];
  if (canEditJob) {
    options.push({ id: 'share', label: 'Share Job', icon: Share2, variant: 'default' });
    options.push({ id: 'edit', label: 'Edit Job', icon: Pencil, variant: 'default' });
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
  const [overlayFilters, setOverlayFilters] = useState(() => ({
    ...INITIAL_OVERLAY,
    statusQuick: initialStatus,
  }));

  const jobsForCards = useMemo(() => {
    void dataVersion;
    return JOBS.map((j) => ({
      ...j,
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

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
    setCurrentPage(1);
  }, []);

  const filteredJobs = useMemo(() => {
    const statusLower = statusFilter || null;
    const typeValue = typeFilter || null;
    const q = searchValue.trim() ? searchValue.toLowerCase() : null;

    let jobs = jobsForCards.filter((j) => {
      if (statusLower && j.status !== statusLower) return false;
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
      else if (action === 'share') onShareJob?.(job);
    },
    [onViewJob, onEditJob, onShowCandidates, onShareJob]
  );
  const isInitialLoading = isLoading && dataVersion === 0;

  return (
    <div className="job-list">
      <Shortcuts
        filterLabel={SHORTCUTS_CONFIG.filterLabel}
        filterCount={activeFilterCount ? `${activeFilterCount} active` : undefined}
        onFilterClick={() => setIsFilterOpen(true)}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search jobs..."
        primaryAction={
          canCreateJob
            ? {
                label: 'Create Job',
                icon: Plus,
                onClick: () => onCreateJob?.(),
              }
            : undefined
        }
      />

      <div className="job-list__content">
        {/* Job cards */}
        <div className="job-list__cards">
          {paginatedJobs.length > 0 ? (
            paginatedJobs.map((job) => {
              const smartDate = formatSmartDate(job.status, job.duration);
              return (
                <EntityCard
                  key={job.id}
                  className="job-list__card"
                  userName={job.title}
                  userEmail={job.department}
                  showAvatar={false}
                  showBadge
                  badgeType="jobStatus"
                  badgeVariant={job.status}
                  showMenu
                  menuOptions={cardMenuOptions}
                  onMenuSelect={(action) => handleMenuSelect(job, action)}
                  onClick={() => onViewJob?.(job.id)}
                  score={job.avgScore}
                  scoreLabel="Avg Score"
                  colLeft={{
                    icon: Users,
                    title: String(job.totalCandidates),
                    subtitle: 'Total Candidates',
                  }}
                  colMid={{
                    icon: FileText,
                    title: String(job.mocks.length),
                    subtitle: 'Linked Mocks',
                  }}
                  colRight={{
                    icon: Clock,
                    title: smartDate.title,
                    subtitle: smartDate.subtitle,
                  }}
                  tags={job.skills}
                  tagsLimit={3}
                  animated
                />
              );
            })
          ) : !isInitialLoading ? (
            <EmptyState
              icon={<Briefcase size={24} />}
              title={jobsForCards.length ? 'No matching jobs' : 'No jobs yet'}
              description={
                jobsForCards.length
                  ? 'Adjust the search or supported backend filters to see more jobs.'
                  : 'Create your first job after adding at least one mock interview.'
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
