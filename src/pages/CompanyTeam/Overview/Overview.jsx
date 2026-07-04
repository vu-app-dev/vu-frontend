import { memo, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { CalendarDays, Globe, Mail, Pencil, Phone, Search, Users } from 'lucide-react';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { SectionTitle } from '../../../components/ui/SectionTitle';
import { TableHeader, TableRow, TableCell } from '../../../components/ui/Tables';
import { Pagination } from '../../../components/ui/Pagination';
import {
  COMPANY,
  CURRENT_USER_ID,
  JOIN_REQUESTS,
  ROLES,
  TEAM_MEMBERS,
  useBackendData,
} from '../../../api';
import { useResponsiveItemsPerPage } from '../../../hooks';
import './Overview.css';

const TABLE_COLUMNS = [
  { key: 'name', label: 'Name', sortable: true, fr: 1.45 },
  { key: 'email', label: 'Email', sortable: true, fr: 1.45 },
  { key: 'role', label: 'Role', sortable: true, fr: 0.8 },
  { key: 'joinedDate', label: 'Joined', sortable: true, fr: 0.9 },
  { key: 'lastActivity', label: 'Last active', sortable: true, fr: 0.9 },
];

const GRID_TEMPLATE = TABLE_COLUMNS.map((column) => `${column.fr}fr`).join(' ');
const ROW_HEIGHT = 53;
const HEADER_HEIGHT = 45;
const PAGINATION_HEIGHT = 85;
const ICON_SM = 14;

function getInitials(name = '') {
  return (
    String(name)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'VU'
  );
}

function safeText(value, fallback = 'Not set') {
  return value == null || value === '' ? fallback : value;
}

export const Overview = memo(function Overview({
  onEditCompany,
  onViewMember,
  canEditCompany = true,
  canViewTeamMembers = true,
}) {
  const { dataVersion } = useBackendData();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState('');
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);
  const { tableRef, itemsPerPage } = useResponsiveItemsPerPage({
    rowHeight: ROW_HEIGHT,
    headerHeight: HEADER_HEIGHT,
    paginationHeight: PAGINATION_HEIGHT,
  });

  const summary = useMemo(() => {
    void dataVersion;
    const pending = JOIN_REQUESTS.filter((request) => request.status === 'pending').length;
    const owners = TEAM_MEMBERS.filter((member) => member.role === 'owner').length;
    const reviewers = TEAM_MEMBERS.filter((member) => member.role !== 'viewer').length;

    return [
      { label: 'Team members', value: TEAM_MEMBERS.length },
      { label: 'Pending requests', value: pending },
      { label: 'Owners', value: owners },
      { label: 'Can review', value: reviewers },
    ];
  }, [dataVersion]);

  const handleSearch = useCallback((event) => {
    setSearchValue(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((key, dir) => {
    setSortKey(dir ? key : null);
    setSortDir(dir);
  }, []);

  const filteredMembers = useMemo(() => {
    void dataVersion;
    const query = searchValue.trim().toLowerCase();
    const members = query
      ? TEAM_MEMBERS.filter((member) =>
          [member.name, member.email, ROLES[member.role]?.label, member.role]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(query))
        )
      : [...TEAM_MEMBERS];

    if (sortKey && sortDir) {
      members.sort((a, b) => {
        const aVal = String(a[sortKey] || '').toLowerCase();
        const bVal = String(b[sortKey] || '').toLowerCase();
        const comparison = aVal.localeCompare(bVal);
        return sortDir === 'asc' ? comparison : -comparison;
      });
    }

    return members;
  }, [searchValue, sortKey, sortDir, dataVersion]);

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedMembers = useMemo(() => {
    const start = (safePage - 1) * itemsPerPage;
    return filteredMembers.slice(start, start + itemsPerPage);
  }, [filteredMembers, safePage, itemsPerPage]);

  const columnsWithSort = useMemo(
    () =>
      TABLE_COLUMNS.map((column) => ({
        ...column,
        sortState: sortKey === column.key ? sortDir : null,
      })),
    [sortKey, sortDir]
  );

  const website = COMPANY.website || '';

  return (
    <div className="company-overview">
      <div className="company-overview__content">
        <section className="company-overview__header">
          <div className="company-overview__identity">
            <div className="company-overview__org-avatar" aria-hidden="true">
              {getInitials(COMPANY.name)}
            </div>
            <div className="company-overview__identity-copy">
              <span className="company-overview__eyebrow">Workspace</span>
              <h1>{safeText(COMPANY.name, 'Company workspace')}</h1>
              <p>
                {safeText(COMPANY.description || COMPANY.industry, 'Team and workspace access.')}
              </p>
            </div>
          </div>

          {canEditCompany && (
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Pencil size={ICON_SM} />}
              onClick={onEditCompany}
            >
              Edit company
            </Button>
          )}

          <div className="company-overview__meta-strip">
            <div>
              <Globe size={ICON_SM} aria-hidden="true" />
              <span>Website</span>
              {website ? (
                <a href={website} target="_blank" rel="noreferrer">
                  {website.replace(/^https?:\/\//, '')}
                </a>
              ) : (
                <strong>Not set</strong>
              )}
            </div>
            <div>
              <Phone size={ICON_SM} aria-hidden="true" />
              <span>Phone</span>
              <strong>{safeText(COMPANY.phone)}</strong>
            </div>
            <div>
              <CalendarDays size={ICON_SM} aria-hidden="true" />
              <span>Created</span>
              <strong>{safeText(COMPANY.createdDate)}</strong>
            </div>
          </div>
        </section>

        <section className="company-overview__summary" aria-label="Company summary">
          {summary.map((item) => (
            <div key={item.label} className="company-overview__metric">
              <span>{item.label}</span>
              <strong>{canViewTeamMembers ? item.value : 'Restricted'}</strong>
            </div>
          ))}
        </section>

        {canViewTeamMembers ? (
          <section className="company-overview__section">
            <div className="company-overview__section-header">
              <SectionTitle variant="inline">Team members</SectionTitle>
              <label className="company-overview__search">
                <Search size={ICON_SM} className="company-overview__search-icon" />
                <span className="sr-only">Search team members</span>
                <input
                  type="search"
                  className="company-overview__search-input"
                  placeholder="Search members"
                  value={searchValue}
                  onChange={handleSearch}
                />
              </label>
            </div>

            <div className="company-overview__table" ref={tableRef}>
              <TableHeader
                columns={columnsWithSort}
                gridTemplateColumns={GRID_TEMPLATE}
                onSort={handleSort}
              />

              <div className="company-overview__rows">
                {paginatedMembers.length === 0 ? (
                  <div className="company-overview__empty">
                    Adjust search to show more team members.
                  </div>
                ) : (
                  paginatedMembers.map((member) => {
                    const isSelf = String(member.id) === String(CURRENT_USER_ID);
                    return (
                      <TableRow
                        key={member.id}
                        gridTemplateColumns={GRID_TEMPLATE}
                        onClick={() => onViewMember?.(member.id)}
                      >
                        <TableCell
                          color="accent"
                          icon={
                            <span className="company-overview__avatar">
                              {getInitials(member.name)}
                            </span>
                          }
                        >
                          {member.name}
                          {isSelf && <span className="company-overview__you-tag">You</span>}
                        </TableCell>
                        <TableCell color="tertiary">{member.email}</TableCell>
                        <TableCell>
                          <Badge type="role" variant={member.role} />
                        </TableCell>
                        <TableCell color="secondary">{member.joinedDate}</TableCell>
                        <TableCell color="tertiary">{member.lastActivity}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </div>

              <div className="company-overview__pagination">
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  totalItems={filteredMembers.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
          </section>
        ) : (
          <section className="company-overview__restricted">
            <Mail size={ICON_SM} aria-hidden="true" />
            <div>
              <strong>Team access is restricted.</strong>
              <p>Your role can view workspace context, but not member records.</p>
            </div>
          </section>
        )}
      </div>
    </div>
  );
});

Overview.propTypes = {
  onEditCompany: PropTypes.func,
  onViewMember: PropTypes.func,
  canEditCompany: PropTypes.bool,
  canViewTeamMembers: PropTypes.bool,
};
