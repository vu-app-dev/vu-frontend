import { memo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  Phone,
  UserX,
  XCircle,
} from 'lucide-react';
import { Badge, RoleBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { ConfirmDialog } from '../../../components/ui/Dialog';
import { SectionTitle } from '../../../components/ui/SectionTitle';
import {
  CURRENT_USER_ID,
  ROLES,
  acceptJoinRequest,
  declineJoinRequest,
  getMemberById,
  removeMember,
} from '../../../api';
import './MemberDetails.css';

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

function statusVariant(status) {
  if (status === 'accepted') return 'accepted';
  if (status === 'declined' || status === 'rejected') return 'rejected';
  return 'pending';
}

function permissionLabel(permission) {
  return String(permission || '').replace(/_/g, ' ');
}

export const MemberDetails = memo(function MemberDetails({
  memberId,
  request,
  onRemoved,
  onAccepted,
  onDeclined,
}) {
  const [assignRole, setAssignRole] = useState('viewer');
  const [actionError, setActionError] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);

  const member = memberId ? getMemberById(memberId) : null;
  const currentUser = getMemberById(CURRENT_USER_ID);
  const isCurrentUser = String(memberId) === String(CURRENT_USER_ID);
  const isOwner = currentUser?.role === 'owner';
  const roleConfig = member ? ROLES[member.role] : ROLES[assignRole];

  const handleRemove = useCallback(async () => {
    if (isCurrentUser || !memberId) return;
    setBusyAction('remove');
    setActionError('');
    try {
      const removed = await removeMember(memberId);
      if (removed) onRemoved?.();
    } catch (error) {
      setActionError(error.message || 'Member could not be removed.');
    } finally {
      setBusyAction('');
      setRemoveDialogOpen(false);
    }
  }, [memberId, isCurrentUser, onRemoved]);

  const handleAcceptRequest = useCallback(async () => {
    if (!request) return;
    setBusyAction('accept');
    setActionError('');
    try {
      const newMember = await acceptJoinRequest(request.id, assignRole);
      if (newMember) onAccepted?.(newMember.id);
    } catch (error) {
      setActionError(error.message || 'Request could not be accepted.');
    } finally {
      setBusyAction('');
    }
  }, [request, assignRole, onAccepted]);

  const handleDeclineRequest = useCallback(async () => {
    if (!request) return;
    setBusyAction('decline');
    setActionError('');
    try {
      await declineJoinRequest(request.id);
      onDeclined?.();
    } catch (error) {
      setActionError(error.message || 'Request could not be declined.');
    } finally {
      setBusyAction('');
    }
  }, [request, onDeclined]);

  if (request) {
    const isPending = request.status === 'pending';

    return (
      <div className="member-details">
        <div className="member-details__layout">
          <main className="member-details__main">
            <section className="member-details__header">
              <div className="member-details__identity">
                <div className="member-details__avatar" aria-hidden="true">
                  {getInitials(request.name)}
                </div>
                <div className="member-details__identity-copy">
                  <span className="member-details__eyebrow">Access request</span>
                  <h1>{request.name}</h1>
                  <p>{request.email}</p>
                </div>
                <Badge type="candidateState" variant={statusVariant(request.status)} />
              </div>

              <div className="member-details__meta-strip">
                <div>
                  <Mail size={ICON_SM} aria-hidden="true" />
                  <span>Email</span>
                  <strong>{request.email}</strong>
                </div>
                <div>
                  <CalendarDays size={ICON_SM} aria-hidden="true" />
                  <span>Submitted</span>
                  <strong>{request.submittedDate || 'Recently'}</strong>
                </div>
              </div>
            </section>

            <section className="member-details__section">
              <SectionTitle variant="inline">Request context</SectionTitle>
              {request.message ? (
                <p className="member-details__request-message">{request.message}</p>
              ) : (
                <p className="member-details__empty-text">
                  The request does not include a note from the applicant.
                </p>
              )}
            </section>
          </main>

          <aside className="member-details__sidebar">
            <div className="member-details__card">
              <SectionTitle variant="inline">Actions</SectionTitle>
              {isPending ? (
                <div className="member-details__action-list">
                  <div className="member-details__role-section">
                    <span className="member-details__label">Assigned role</span>
                    <RoleBadge value={assignRole} onChange={setAssignRole} />
                  </div>
                  <Button
                    variant="success"
                    size="sm"
                    iconLeft={<CheckCircle2 size={ICON_SM} />}
                    onClick={handleAcceptRequest}
                    loading={busyAction === 'accept'}
                  >
                    Accept request
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    iconLeft={<XCircle size={ICON_SM} />}
                    onClick={handleDeclineRequest}
                    loading={busyAction === 'decline'}
                  >
                    Decline request
                  </Button>
                </div>
              ) : (
                <p className="member-details__self-note">
                  This request has already been processed.
                </p>
              )}
              {actionError && <p className="member-details__error">{actionError}</p>}
            </div>

            <div className="member-details__card">
              <SectionTitle variant="inline">Role preview</SectionTitle>
              <div className="member-details__permissions">
                {(ROLES[assignRole]?.permissions || []).map((permission) => (
                  <span key={permission} className="member-details__perm-tag">
                    {permissionLabel(permission)}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="member-details member-details--empty">
        <span>Member not found.</span>
      </div>
    );
  }

  return (
    <div className="member-details">
      <div className="member-details__layout">
        <main className="member-details__main">
          <section className="member-details__header">
            <div className="member-details__identity">
              <div className="member-details__avatar" aria-hidden="true">
                {getInitials(member.name)}
              </div>
              <div className="member-details__identity-copy">
                <span className="member-details__eyebrow">Team member</span>
                <h1>{member.name}</h1>
                <p>{member.email}</p>
              </div>
              <Badge type="role" variant={member.role} />
            </div>

            <div className="member-details__meta-strip">
              <div>
                <Mail size={ICON_SM} aria-hidden="true" />
                <span>Email</span>
                <strong>{member.email}</strong>
              </div>
              <div>
                <Phone size={ICON_SM} aria-hidden="true" />
                <span>Phone</span>
                <strong>{member.phone || 'Not provided'}</strong>
              </div>
              <div>
                <CalendarDays size={ICON_SM} aria-hidden="true" />
                <span>Joined</span>
                <strong>{member.joinedDate || 'Not provided'}</strong>
              </div>
              <div>
                <Clock size={ICON_SM} aria-hidden="true" />
                <span>Last active</span>
                <strong>{member.lastActivity || 'Not recorded'}</strong>
              </div>
            </div>
          </section>

          <section className="member-details__section">
            <SectionTitle variant="inline">Permissions</SectionTitle>
            <div className="member-details__permissions">
              {(roleConfig?.permissions || []).map((permission) => (
                <span key={permission} className="member-details__perm-tag">
                  {permissionLabel(permission)}
                </span>
              ))}
            </div>
          </section>
        </main>

        <aside className="member-details__sidebar">
          {isOwner && (
            <div className="member-details__card">
              <SectionTitle variant="inline">Actions</SectionTitle>
              <div className="member-details__action-list">
                {!isCurrentUser ? (
                  <Button
                    variant="danger"
                    size="sm"
                    iconLeft={<UserX size={ICON_SM} />}
                    onClick={() => setRemoveDialogOpen(true)}
                  >
                    Remove member
                  </Button>
                ) : (
                  <p className="member-details__self-note">
                    This is your account. You cannot remove yourself from the workspace.
                  </p>
                )}
              </div>
              {actionError && <p className="member-details__error">{actionError}</p>}
            </div>
          )}

          <div className="member-details__card">
            <SectionTitle variant="inline">Contact</SectionTitle>
            <div className="member-details__info-row">
              <Mail size={ICON_SM} className="member-details__info-icon" />
              <div className="member-details__info-group">
                <span className="member-details__info-label">Email</span>
                <span className="member-details__info-value">{member.email}</span>
              </div>
            </div>
            <div className="member-details__divider" />
            <div className="member-details__info-row">
              <Phone size={ICON_SM} className="member-details__info-icon" />
              <div className="member-details__info-group">
                <span className="member-details__info-label">Phone</span>
                <span className="member-details__info-value">{member.phone || 'Not provided'}</span>
              </div>
            </div>
            {member.location && (
              <>
                <div className="member-details__divider" />
                <div className="member-details__info-row">
                  <MapPin size={ICON_SM} className="member-details__info-icon" />
                  <div className="member-details__info-group">
                    <span className="member-details__info-label">Location</span>
                    <span className="member-details__info-value">{member.location}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </aside>
      </div>

      <ConfirmDialog
        isOpen={removeDialogOpen}
        title="Remove team member?"
        description={`${member.name} will lose access to this workspace. Their historical activity will remain visible.`}
        confirmLabel="Remove member"
        confirmVariant="danger"
        isBusy={busyAction === 'remove'}
        onConfirm={handleRemove}
        onClose={() => setRemoveDialogOpen(false)}
      />
    </div>
  );
});

MemberDetails.propTypes = {
  memberId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  request: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    status: PropTypes.string,
    message: PropTypes.string,
    submittedDate: PropTypes.string,
  }),
  onRemoved: PropTypes.func,
  onAccepted: PropTypes.func,
  onDeclined: PropTypes.func,
};
