import { useState, useMemo, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import {
  Pencil,
  Eye,
  Plus,
  Clock,
  Trash2,
  Briefcase,
  Zap,
  PlayCircle,
  FileText,
} from 'lucide-react';
import { Shortcuts } from '../../../../components/layout/Shortcuts';
import { EntityCard } from '../../../../components/ui/Cards';
import { Pagination } from '../../../../components/ui/Pagination';
import { FilterOverlay } from '../../../../components/ui/FilterOverlay';
import { Button } from '../../../../components/ui/Button';
import { EmptyState } from '../../../../components/ui/EmptyState';
import {
  DIFFICULTY_OPTIONS,
  MOCKS,
  MOCK_TYPE_OPTIONS,
  getJobsUsingMock,
  getUsedInJobsCount,
  getMockStatus,
  useBackendData,
} from '../../../../api';
import './MockList.css';

/* Menu options */

function getMockMenuOptions(mock, canEditMock) {
  const options = [{ id: 'view', label: 'View Details', icon: Eye, variant: 'default' }];

  if (canEditMock && mock.firstJobId) {
    options.push({ id: 'test', label: 'Test Mock', icon: PlayCircle, variant: 'default' });
  }

  if (canEditMock && mock.computedStatus !== 'active') {
    options.push({ id: 'edit', label: 'Edit Mock', icon: Pencil, variant: 'default' });
    options.push({
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'danger',
      separator: true,
    });
  }

  return options;
}

/* Difficulty badge display */

const DIFFICULTY_META = { Easy: 'Easy', Medium: 'Medium', Hard: 'Hard' };

/* Filter configs */

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest first' },
  { value: 'createdAt-asc', label: 'Oldest first' },
  { value: 'title-asc', label: 'Title A-Z' },
  { value: 'title-desc', label: 'Title Z-A' },
];
const DEFAULT_SORT = 'createdAt-desc';

const ITEMS_PER_PAGE = 6;

/* Shortcuts config */

const SHORTCUTS_CONFIG = {
  filterLabel: 'Filters',
};

function createdAtTime(item) {
  const date = new Date(item.raw?.createdAt || item.createdAt || 0);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

/* Overlay filter definitions */

const OVERLAY_FILTERS = [
  {
    key: 'typeQuick',
    label: 'Type',
    type: 'select',
    options: MOCK_TYPE_OPTIONS,
  },
  {
    key: 'difficultyQuick',
    label: 'Difficulty',
    type: 'select',
    options: DIFFICULTY_OPTIONS,
  },
  {
    key: 'sortQuick',
    label: 'Sort by',
    type: 'select',
    options: SORT_OPTIONS,
  },
  {
    key: 'enableFollowUpQuestions',
    label: 'Follow-up Questions',
    type: 'toggle',
    toggleLabel: 'Enabled only',
  },
  {
    key: 'enableRecordReplay',
    label: 'Record Replay',
    type: 'toggle',
    toggleLabel: 'Enabled only',
  },
];
const INITIAL_OVERLAY = {
  typeQuick: '',
  difficultyQuick: '',
  sortQuick: DEFAULT_SORT,
  enableFollowUpQuestions: false,
  enableRecordReplay: false,
};

/* Component */

export const MockList = memo(function MockList({
  onViewMock,
  onEditMock,
  onCreateMock,
  onTestMock,
  onDeleteMock,
  canCreateMock = true,
  canEditMock = true,
}) {
  const { dataVersion, isLoading } = useBackendData();
  const [typeFilter, setTypeFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [overlayFilters, setOverlayFilters] = useState(INITIAL_OVERLAY);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (overlayFilters.typeQuick) count++;
    if (overlayFilters.difficultyQuick) count++;
    if (overlayFilters.sortQuick && overlayFilters.sortQuick !== DEFAULT_SORT) count++;
    if (overlayFilters.enableFollowUpQuestions) count++;
    if (overlayFilters.enableRecordReplay) count++;
    return count;
  }, [overlayFilters]);

  const handleSearchChange = useCallback((e) => {
    setSearchValue(e.target.value);
    setCurrentPage(1);
  }, []);

  /* Enrich mocks with computed status and usedInJobs */
  const enrichedMocks = useMemo(() => {
    void dataVersion;
    return MOCKS.map((m) => {
      const jobsUsing = getJobsUsingMock(m.title);
      return {
        ...m,
        computedStatus: getMockStatus(m.id),
        usedInJobs: getUsedInJobsCount(m.title),
        firstJobId: jobsUsing[0]?.id || '',
        technologies: Array.isArray(m.technologies) ? m.technologies : [],
      };
    });
  }, [dataVersion]);

  const filteredMocks = useMemo(() => {
    const typeValue = typeFilter || null;
    const difficultyValue = difficultyFilter || null;
    const q = searchValue.trim() ? searchValue.toLowerCase() : null;

    let mocks = enrichedMocks.filter((m) => {
      if (typeValue && m.typeValue !== typeValue) return false;
      if (difficultyValue && m.difficultyValue !== difficultyValue) return false;
      if (
        q &&
        !m.title.toLowerCase().includes(q) &&
        !m.description.toLowerCase().includes(q) &&
        !m.technologies.some((s) => s.toLowerCase().includes(q))
      )
        return false;
      if (overlayFilters.enableFollowUpQuestions && !m.enableFollowUpQuestions) return false;
      if (overlayFilters.enableRecordReplay && !m.enableRecordReplay) return false;
      return true;
    });

    switch (sortBy) {
      case 'createdAt-asc':
        mocks.sort((a, b) => createdAtTime(a) - createdAtTime(b));
        break;
      case 'title-asc':
        mocks.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        mocks.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        mocks.sort((a, b) => createdAtTime(b) - createdAtTime(a));
        break;
    }

    return mocks;
  }, [typeFilter, difficultyFilter, sortBy, searchValue, enrichedMocks, overlayFilters]);

  const totalPages = Math.max(1, Math.ceil(filteredMocks.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedMocks = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredMocks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMocks, safePage]);

  const handleMenuSelect = useCallback(
    (mock, action) => {
      if (action === 'view') onViewMock?.(mock.id);
      else if (action === 'edit') onEditMock?.(mock.id);
      else if (action === 'test') onTestMock?.(mock);
      else if (action === 'delete') onDeleteMock?.(mock);
    },
    [onViewMock, onEditMock, onTestMock, onDeleteMock]
  );
  const isInitialLoading = isLoading && dataVersion === 0;

  const shortcutsConfig = useMemo(
    () => ({
      ...SHORTCUTS_CONFIG,
      primaryAction: canCreateMock
        ? {
            label: 'Create mock',
            icon: Plus,
            onClick: () => onCreateMock?.(),
          }
        : undefined,
    }),
    [canCreateMock, onCreateMock]
  );

  return (
    <div className="mock-list">
      <Shortcuts
        filterLabel={shortcutsConfig.filterLabel}
        filterCount={activeFilterCount ? `${activeFilterCount} active` : undefined}
        onFilterClick={() => setIsFilterOpen(true)}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search mocks..."
        primaryAction={shortcutsConfig.primaryAction}
      />

      <div className="mock-list__content">
        <div className="mock-list__cards">
          {paginatedMocks.length > 0 ? (
            paginatedMocks.map((mock) => (
              <EntityCard
                key={mock.id}
                className="mock-list__card"
                userName={mock.title}
                userEmail={`${mock.type} \u00B7 ${DIFFICULTY_META[mock.difficulty] || mock.difficulty}`}
                showAvatar={false}
                showBadge
                badgeType="jobStatus"
                badgeVariant={mock.computedStatus}
                showMenu
                menuOptions={getMockMenuOptions(mock, canEditMock)}
                onMenuSelect={(action) => handleMenuSelect(mock, action)}
                onClick={() => onViewMock?.(mock.id)}
                score={mock.avgScore}
                scoreLabel="Avg Score"
                colLeft={{
                  icon: Zap,
                  title: String(mock.technologies.length),
                  subtitle: 'Technologies',
                }}
                colMid={{
                  icon: Briefcase,
                  title: String(mock.usedInJobs),
                  subtitle: 'Used in Jobs',
                }}
                colRight={{
                  icon: Clock,
                  title: mock.duration,
                  subtitle: 'Duration',
                }}
                tags={mock.technologies}
                tagsLimit={3}
                animated
              />
            ))
          ) : !isInitialLoading ? (
            <EmptyState
              icon={<FileText size={24} />}
              title={enrichedMocks.length ? 'No matching mocks' : 'No mocks yet'}
              description={
                enrichedMocks.length
                  ? 'Adjust the search or supported backend filters to see more mocks.'
                  : 'Create a mock interview before publishing your first job.'
              }
              action={
                canCreateMock ? (
                  <Button variant="primary" iconRight={<Plus size={16} />} onClick={onCreateMock}>
                    Create Mock
                  </Button>
                ) : undefined
              }
            />
          ) : null}
        </div>

        {filteredMocks.length > 0 && (
          <div className="mock-list__pagination">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={filteredMocks.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <FilterOverlay
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={OVERLAY_FILTERS}
        values={overlayFilters}
        onApply={(v) => {
          setOverlayFilters(v);
          setTypeFilter(v.typeQuick || '');
          setDifficultyFilter(v.difficultyQuick || '');
          setSortBy(v.sortQuick || DEFAULT_SORT);
          setCurrentPage(1);
        }}
      />
    </div>
  );
});

MockList.propTypes = {
  onViewMock: PropTypes.func,
  onEditMock: PropTypes.func,
  onCreateMock: PropTypes.func,
  onTestMock: PropTypes.func,
  onDeleteMock: PropTypes.func,
  canCreateMock: PropTypes.bool,
  canEditMock: PropTypes.bool,
};
