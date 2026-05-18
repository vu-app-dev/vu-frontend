import { memo, useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Building2,
  CalendarDays,
  UserX,
  Activity,
  CheckCircle2,
  XCircle,
  Phone,
  MapPin,
  Mail,
} from 'lucide-react';
import { EntityCard } from '../../../components/ui/Cards';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { RoleBadge } from '../../../components/ui/Badge';
import { SectionTitle } from '../../../components/ui/SectionTitle';
import {
  getMemberById,
  getMemberActivities,
  removeMember,
  acceptJoinRequest,
  declineJoinRequest,
  CURRENT_USER_ID,
  ROLES,
} from '../../../api';
import './MemberDetails.css';

/* ── Consistent activity icon for every action ── */
const ACTIVITY_ICON = Activity;

const ICON_SM = 14;

/* ── Component ── */
export const MemberDetails = memo(function MemberDetails({
  memberId,
  request,
  onRemoved,
  onAccepted,
  onDeclined,
}) {
  const [assignRole, setAssignRole] = useState('viewer');

  const member = memberId ? getMemberById(memberId) : null;
  const isCurrentUser = memberId === CURRENT_USER_ID;
  const isOwner = getMemberById(CURRENT_USER_ID)?.role === 'owner';

  const activities = useMemo(
    () => (member ? getMemberActivities(memberId) : []),
    [member, memberId]
  );

  const handleRemove = useCallback(async () => {
    if (isCurrentUser) return;
    const removed = await removeMember(memberId);
    if (removed) onRemoved?.();
  }, [memberId, isCurrentUser, onRemoved]);

  const handleAcceptRequest = useCallback(async () => {
    if (!request) return;
    const newMember = await acceptJoinRequest(request.id, assignRole);
    if (newMember) onAccepted?.(newMember.id);
  }, [request, assignRole, onAccepted]);

  const handleDeclineRequest = useCallback(async () => {
    if (!request) return;
    await declineJoinRequest(request.id);
    onDeclined?.();
  }, [request, onDeclined]);

  /* ── Request Mode ── */
  if (request) {
    const requestDesktop = (
      <div className="member-details__desktop-layout">
        <div className="member-details__main">
          <div className="member-details__scroll">
            <EntityCard
              showAvatar
              userName={request.name}
              userEmail={request.email}
              showBadge
              badgeType="candidateState"
              badgeVariant="pending"
              colLeft={{ icon: Building2, title: request.department, subtitle: 'Department' }}
              colMid={{ icon: CalendarDays, title: request.submittedDate, subtitle: 'Submitted' }}
              animated={false}
            />

            {request.message && (
              <section className="member-details__section">
                <SectionTitle variant="inline">Message</SectionTitle>
                <p className="member-details__request-message">{request.message}</p>
              </section>
            )}
          </div>
        </div>

        <aside className="member-details__sidebar">
          <div className="member-details__card">
            <SectionTitle variant="inline">Actions</SectionTitle>
            <div className="member-details__action-list">
              <div className="member-details__role-section">
                <span className="member-details__label">Assign Role</span>
                <RoleBadge value={assignRole} onChange={setAssignRole} />
              </div>
              <Button
                variant="primary"
                size="sm"
                iconLeft={<CheckCircle2 size={ICON_SM} />}
                onClick={handleAcceptRequest}
              >
                Accept
              </Button>
              <Button
                variant="danger"
                size="sm"
                iconLeft={<XCircle size={ICON_SM} />}
                onClick={handleDeclineRequest}
              >
                Decline
              </Button>
            </div>
          </div>

          <div className="member-details__card">
            <SectionTitle variant="inline">Request Info</SectionTitle>

            <div className="member-details__info-row">
              <Mail size={14} className="member-details__info-icon" />
              <div className="member-details__info-group">
                <span className="member-details__info-label">Email</span>
                <span className="member-details__info-value">{request.email}</span>
              </div>
            </div>

            <div className="member-details__divider" />

            <div className="member-details__info-row">
              <Building2 size={14} className="member-details__info-icon" />
              <div className="member-details__info-group">
                <span className="member-details__info-label">Department</span>
                <span className="member-details__info-value">{request.department}</span>
              </div>
            </div>

            <div className="member-details__divider" />

            <div className="member-details__info-row">
              <CalendarDays size={14} className="member-details__info-icon" />
              <div className="member-details__info-group">
                <span className="member-details__info-label">Submitted</span>
                <span className="member-details__info-value">{request.submittedDate}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    );

    const requestMobile = (
      <div className="member-details__mobile-shell">
        <div className="member-details__mobile-content">
          <EntityCard
            showAvatar
            userName={request.name}
            userEmail={request.email}
            showBadge
            badgeType="candidateState"
            badgeVariant="pending"
            colLeft={{ icon: Building2, title: request.department, subtitle: 'Department' }}
            colMid={{ icon: CalendarDays, title: request.submittedDate, subtitle: 'Submitted' }}
            animated={false}
          />

          <div className="member-details__card">
            <SectionTitle variant="inline">Actions</SectionTitle>
            <div className="member-details__action-list">
              <div className="member-details__role-section">
                <RoleBadge value={assignRole} onChange={setAssignRole} />
              </div>
              <Button
                variant="primary"
                size="sm"
                iconLeft={<CheckCircle2 size={ICON_SM} />}
                onClick={handleAcceptRequest}
              >
                Accept
              </Button>
              <Button
                variant="danger"
                size="sm"
                iconLeft={<XCircle size={ICON_SM} />}
                onClick={handleDeclineRequest}
              >
                Decline
              </Button>
            </div>
          </div>

          <div className="member-details__card">
            <SectionTitle variant="inline">Request Info</SectionTitle>

            <div className="member-details__info-row">
              <Mail size={14} className="member-details__info-icon" />
              <div className="member-details__info-group">
                <span className="member-details__info-label">Email</span>
                <span className="member-details__info-value">{request.email}</span>
              </div>
            </div>

            <div className="member-details__divider" />

            <div className="member-details__info-row">
              <Building2 size={14} className="member-details__info-icon" />
              <div className="member-details__info-group">
                <span className="member-details__info-label">Department</span>
                <span className="member-details__info-value">{request.department}</span>
              </div>
            </div>

            <div className="member-details__divider" />

            <div className="member-details__info-row">
              <CalendarDays size={14} className="member-details__info-icon" />
              <div className="member-details__info-group">
                <span className="member-details__info-label">Submitted</span>
                <span className="member-details__info-value">{request.submittedDate}</span>
              </div>
            </div>
          </div>

          {request.message && (
            <section className="member-details__section">
              <SectionTitle variant="inline">Message</SectionTitle>
              <p className="member-details__request-message">{request.message}</p>
            </section>
          )}
        </div>
      </div>
    );

    return (
      <div className="member-details">
        <div className="member-details__desktop-layout">{requestDesktop}</div>
        {requestMobile}
      </div>
    );
  }

  /* ── Member Mode ── */
  if (!member) {
    return (
      <div className="member-details member-details--empty">
        <span>Member not found.</span>
      </div>
    );
  }

  const roleConfig = ROLES[member.role];

  const memberDesktop = (
    <div className="member-details__desktop-layout">
      {/* ── MAIN ── */}
      <div className="member-details__main">
        <div className="member-details__scroll">
          {/* Entity Card — editable badge if owner */}
          <EntityCard
            showAvatar={true}
            userName={member.name}
            userEmail={member.email}
            showBadge
            badgeType="role"
            badgeVariant={member.role}
            colLeft={{ icon: Building2, title: member.department, subtitle: 'Department' }}
            colMid={{ icon: CalendarDays, title: member.joinedDate, subtitle: 'Joined' }}
            colRight={{ icon: Activity, title: member.lastActivity, subtitle: 'Last Active' }}
            animated={false}
          />

          {/* Activity Timeline */}
          <section className="member-details__section">
            <SectionTitle variant="inline">Activity</SectionTitle>
            <div className="member-details__timeline">
              {activities.length === 0 && (
                <p className="member-details__empty-text">No activity recorded yet.</p>
              )}
              {activities.map((act) => (
                <div key={act.id} className="member-details__activity-item">
                  <div className="member-details__activity-icon">
                    <ACTIVITY_ICON size={14} />
                  </div>
                  <div className="member-details__activity-content">
                    <span className="member-details__activity-action">{act.action}</span>
                    <span className="member-details__activity-target">{act.target}</span>
                  </div>
                  <div className="member-details__activity-time">
                    <span className="member-details__activity-date">{act.date}</span>
                    <span className="member-details__activity-hour">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* ── SIDEBAR ── */}
      <aside className="member-details__sidebar">
        {/* Actions — visible to owner */}
        {isOwner && (
          <div className="member-details__card">
            <SectionTitle variant="inline">Actions</SectionTitle>
            <div className="member-details__action-list">
              {/* Remove member */}
              {!isCurrentUser && (
                <Button
                  variant="danger"
                  size="sm"
                  iconLeft={<UserX size={ICON_SM} />}
                  onClick={handleRemove}
                >
                  Remove Member
                </Button>
              )}

              {isCurrentUser && (
                <p className="member-details__self-note">
                  This is your account. You cannot remove yourself.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Member Info */}
        <div className="member-details__card">
          <SectionTitle variant="inline">Member Info</SectionTitle>

          <div className="member-details__info-row">
            <Mail size={14} className="member-details__info-icon" />
            <div className="member-details__info-group">
              <span className="member-details__info-label">Email</span>
              <span className="member-details__info-value">{member.email}</span>
            </div>
          </div>

          {member.phone && (
            <>
              <div className="member-details__divider" />
              <div className="member-details__info-row">
                <Phone size={14} className="member-details__info-icon" />
                <div className="member-details__info-group">
                  <span className="member-details__info-label">Phone</span>
                  <span className="member-details__info-value">{member.phone}</span>
                </div>
              </div>
            </>
          )}

          {member.location && (
            <>
              <div className="member-details__divider" />
              <div className="member-details__info-row">
                <MapPin size={14} className="member-details__info-icon" />
                <div className="member-details__info-group">
                  <span className="member-details__info-label">Location</span>
                  <span className="member-details__info-value">{member.location}</span>
                </div>
              </div>
            </>
          )}

          <div className="member-details__divider" />

          <div className="member-details__info-row">
            <Building2 size={14} className="member-details__info-icon" />
            <div className="member-details__info-group">
              <span className="member-details__info-label">Department</span>
              <span className="member-details__info-value">{member.department}</span>
            </div>
          </div>

          <div className="member-details__divider" />

          <div className="member-details__info-row">
            <CalendarDays size={14} className="member-details__info-icon" />
            <div className="member-details__info-group">
              <span className="member-details__info-label">Joined</span>
              <span className="member-details__info-value">{member.joinedDate}</span>
            </div>
          </div>

          <div className="member-details__divider" />

          <div className="member-details__info-group">
            <span className="member-details__info-label">Permissions</span>
            <div className="member-details__permissions">
              {roleConfig?.permissions.map((perm) => (
                <span key={perm} className="member-details__perm-tag">
                  {perm.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );

  const memberMobile = (
    <div className="member-details__mobile-shell">
      <div className="member-details__mobile-content">
        <EntityCard
          showAvatar={true}
          userName={member.name}
          userEmail={member.email}
          showBadge
          badgeType="role"
          badgeVariant={member.role}
          colLeft={{ icon: Building2, title: member.department, subtitle: 'Department' }}
          colMid={{ icon: CalendarDays, title: member.joinedDate, subtitle: 'Joined' }}
          colRight={{ icon: Activity, title: member.lastActivity, subtitle: 'Last Active' }}
          animated={false}
        />

        {isOwner && (
          <div className="member-details__card">
            <SectionTitle variant="inline">Actions</SectionTitle>
            <div className="member-details__action-list">
              {!isCurrentUser && (
                <Button
                  variant="danger"
                  size="sm"
                  iconLeft={<UserX size={ICON_SM} />}
                  onClick={handleRemove}
                >
                  Remove Member
                </Button>
              )}

              {isCurrentUser && (
                <p className="member-details__self-note">
                  This is your account. You cannot remove yourself.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="member-details__card">
          <SectionTitle variant="inline">Member Info</SectionTitle>

          <div className="member-details__info-row">
            <Mail size={14} className="member-details__info-icon" />
            <div className="member-details__info-group">
              <span className="member-details__info-label">Email</span>
              <span className="member-details__info-value">{member.email}</span>
            </div>
          </div>

          {member.phone && (
            <>
              <div className="member-details__divider" />
              <div className="member-details__info-row">
                <Phone size={14} className="member-details__info-icon" />
                <div className="member-details__info-group">
                  <span className="member-details__info-label">Phone</span>
                  <span className="member-details__info-value">{member.phone}</span>
                </div>
              </div>
            </>
          )}

          {member.location && (
            <>
              <div className="member-details__divider" />
              <div className="member-details__info-row">
                <MapPin size={14} className="member-details__info-icon" />
                <div className="member-details__info-group">
                  <span className="member-details__info-label">Location</span>
                  <span className="member-details__info-value">{member.location}</span>
                </div>
              </div>
            </>
          )}

          <div className="member-details__divider" />

          <div className="member-details__info-row">
            <Building2 size={14} className="member-details__info-icon" />
            <div className="member-details__info-group">
              <span className="member-details__info-label">Department</span>
              <span className="member-details__info-value">{member.department}</span>
            </div>
          </div>

          <div className="member-details__divider" />

          <div className="member-details__info-row">
            <CalendarDays size={14} className="member-details__info-icon" />
            <div className="member-details__info-group">
              <span className="member-details__info-label">Joined</span>
              <span className="member-details__info-value">{member.joinedDate}</span>
            </div>
          </div>

          <div className="member-details__divider" />

          <div className="member-details__info-group">
            <span className="member-details__info-label">Permissions</span>
            <div className="member-details__permissions">
              {roleConfig?.permissions.map((perm) => (
                <span key={perm} className="member-details__perm-tag">
                  {perm.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        <section className="member-details__section">
          <SectionTitle variant="inline">Activity</SectionTitle>
          <div className="member-details__timeline">
            {activities.length === 0 && (
              <p className="member-details__empty-text">No activity recorded yet.</p>
            )}
            {activities.map((act) => (
              <div key={act.id} className="member-details__activity-item">
                <div className="member-details__activity-icon">
                  <ACTIVITY_ICON size={14} />
                </div>
                <div className="member-details__activity-content">
                  <span className="member-details__activity-action">{act.action}</span>
                  <span className="member-details__activity-target">{act.target}</span>
                </div>
                <div className="member-details__activity-time">
                  <span className="member-details__activity-date">{act.date}</span>
                  <span className="member-details__activity-hour">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <div className="member-details">
      <div className="member-details__desktop-layout">{memberDesktop}</div>
      {memberMobile}
    </div>
  );
});

MemberDetails.propTypes = {
  memberId: PropTypes.string,
  request: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    department: PropTypes.string,
    message: PropTypes.string,
    submittedDate: PropTypes.string,
  }),
  onRemoved: PropTypes.func,
  onAccepted: PropTypes.func,
  onDeclined: PropTypes.func,
};
