import { memo, useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Users, Globe, Building2, Search } from 'lucide-react';
import { EntityCard } from '../../../components/ui/Cards';
import { Badge } from '../../../components/ui/Badge';
import { SectionTitle } from '../../../components/ui/SectionTitle';
import { TableHeader, TableRow, TableCell } from '../../../components/ui/Tables';
import { Pagination } from '../../../components/ui/Pagination';
import { COMPANY, TEAM_MEMBERS, CURRENT_USER_ID, useBackendData } from '../../../api';
import { useResponsiveItemsPerPage } from '../../../hooks';
import './Overview.css';

/* ── Table config — all columns sortable ── */
const TABLE_COLUMNS = [
  { key: 'name', label: 'Name', sortable: true, fr: 1.5 },
  { key: 'email', label: 'Email', sortable: true, fr: 1.5 },
  { key: 'department', label: 'Department', sortable: true, fr: 1 },
  { key: 'role', label: 'Role', sortable: true, fr: 0.8 },
  { key: 'lastActivity', label: 'Last Activity', sortable: true, fr: 1 },
];
const GRID_TEMPLATE = TABLE_COLUMNS.map((c) => `${c.fr}fr`).join(' ');

/* ── Dynamic row-count constants (matches Pipeline) ── */
const ROW_HEIGHT = 53;
const HEADER_HEIGHT = 45;
const PAGINATION_HEIGHT = 85;

/* ── Component ── */
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

  const handleSearch = useCallback((e) => {
    setSearchValue(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleSort = useCallback((key, dir) => {
    setSortKey(dir ? key : null);
    setSortDir(dir);
  }, []);

  const filteredMembers = useMemo(() => {
    void dataVersion;
    const q = searchValue.trim().toLowerCase();
    let members = q
      ? TEAM_MEMBERS.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.email.toLowerCase().includes(q) ||
            m.department.toLowerCase().includes(q)
        )
      : [...TEAM_MEMBERS];

    if (sortKey && sortDir) {
      members.sort((a, b) => {
        const aVal = (a[sortKey] || '').toLowerCase();
        const bVal = (b[sortKey] || '').toLowerCase();
        const cmp = aVal.localeCompare(bVal);
        return sortDir === 'asc' ? cmp : -cmp;
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
      TABLE_COLUMNS.map((col) => ({
        ...col,
        sortState: sortKey === col.key ? sortDir : null,
      })),
    [sortKey, sortDir]
  );

  const joinedCount = TEAM_MEMBERS.length;
  const teamCountTitle = canViewTeamMembers ? String(joinedCount) : 'Restricted';

  return (
    <div className="company-overview">
      {/* ── Top Section: Organization Card + Chart ── */}
      <div className="company-overview__header">
        <EntityCard
          showAvatar={true}
          userName={COMPANY.name}
          userEmail={COMPANY.industry}
          className="company-overview__org-card"
          showButton={canEditCompany}
          buttonText="Edit Company"
          onButtonClick={onEditCompany}
          colLeft={{ icon: Globe, title: COMPANY.website, subtitle: 'Website' }}
          colMid={{ icon: Building2, title: COMPANY.size, subtitle: 'Company Size' }}
          colRight={{ icon: Users, title: teamCountTitle, subtitle: 'Team Members' }}
          tags={[`Created ${COMPANY.createdDate}`]}
          tagsLimit={3}
          animated={false}
        />
      </div>

      {/* ── Team Members Table — pipeline-style ── */}
      {canViewTeamMembers && (
        <section className="company-overview__section">
          <div className="company-overview__section-header">
            <SectionTitle variant="inline">Team Members</SectionTitle>
            <div className="company-overview__search">
              <Search size={14} className="company-overview__search-icon" />
              <input
                type="text"
                className="company-overview__search-input"
                placeholder="Search members..."
                value={searchValue}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* Table container — flex col, grows to fill card */}
          <div className="company-overview__table" ref={tableRef}>
            <TableHeader
              columns={columnsWithSort}
              gridTemplateColumns={GRID_TEMPLATE}
              onSort={handleSort}
            />

            <div className="company-overview__rows">
              {paginatedMembers.map((member) => {
                const isSelf = member.id === CURRENT_USER_ID;
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
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </span>
                      }
                    >
                      {member.name}
                      {isSelf && <span className="company-overview__you-tag">You</span>}
                    </TableCell>
                    <TableCell color="tertiary">{member.email}</TableCell>
                    <TableCell color="secondary">{member.department}</TableCell>
                    <TableCell>
                      <Badge type="role" variant={member.role} />
                    </TableCell>
                    <TableCell color="tertiary">{member.lastActivity}</TableCell>
                  </TableRow>
                );
              })}
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
      )}
    </div>
  );
});

Overview.propTypes = {
  onEditCompany: PropTypes.func,
  onViewMember: PropTypes.func,
  canEditCompany: PropTypes.bool,
  canViewTeamMembers: PropTypes.bool,
};
