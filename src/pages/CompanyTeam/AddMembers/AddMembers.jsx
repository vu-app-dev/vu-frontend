import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, XCircle, Link2, Copy, Check } from 'lucide-react';
import { EntityCard } from '../../../components/ui/Cards';
import { Button } from '../../../components/ui/Button';
import { RoleBadge } from '../../../components/ui/Badge';
import { SectionTitle } from '../../../components/ui/SectionTitle';
import {
  JOIN_REQUESTS,
  acceptJoinRequest,
  declineJoinRequest,
  generateInviteLink,
  refreshJoinRequests,
  useBackendData,
} from '../../../api';
import './AddMembers.css';

const ICON_SM = 14;

export const AddMembers = memo(function AddMembers({ onViewMember, onViewRequest }) {
  const { dataVersion } = useBackendData();
  const [refreshKey, setRefreshKey] = useState(0);
  const [assignRoles, setAssignRoles] = useState({});
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef(null);

  useEffect(() => {
    const refreshRequests = () => {
      void refreshJoinRequests().catch(() => {
        // Keep the current list if a background refresh fails.
      });
    };

    refreshRequests();
    const refreshTimer = window.setInterval(refreshRequests, 15000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshRequests();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearInterval(refreshTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const { pendingRequests, processedRequests } = useMemo(() => {
    void dataVersion;
    void refreshKey;
    const pending = [];
    const processed = [];
    JOIN_REQUESTS.forEach((request) => {
      if (request.status === 'pending') pending.push(request);
      else processed.push(request);
    });
    return { pendingRequests: pending, processedRequests: processed };
  }, [dataVersion, refreshKey]);

  const handleAccept = useCallback(
    async (id) => {
      const role = assignRoles[id] || 'viewer';
      const newMember = await acceptJoinRequest(id, role);
      setRefreshKey((k) => k + 1);
      if (newMember && onViewMember) {
        onViewMember(newMember.id);
      }
    },
    [assignRoles, onViewMember]
  );

  const handleDecline = useCallback(async (id) => {
    await declineJoinRequest(id);
    setRefreshKey((k) => k + 1);
  }, []);

  const handleGenerateLink = useCallback(() => {
    setInviteLink(generateInviteLink());
    setCopied(false);
  }, []);

  const handleCopyLink = useCallback(() => {
    if (inviteLink) {
      navigator.clipboard?.writeText(inviteLink);
      setCopied(true);
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copiedTimerRef.current = null;
      }, 2000);
    }
  }, [inviteLink]);

  return (
    <div className="join-requests">
      <div className="join-requests__scroll">
        {/* ── Invite Section ── */}
        <section className="join-requests__invite-section">
          <SectionTitle variant="inline">Invite Members</SectionTitle>
          <div className="join-requests__invite-row">
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Link2 size={14} />}
              onClick={handleGenerateLink}
            >
              Generate Invitation Link
            </Button>
            {inviteLink && (
              <div className="join-requests__invite-link">
                <span className="join-requests__invite-url">{inviteLink}</span>
                <button
                  className="join-requests__copy-btn"
                  onClick={handleCopyLink}
                  aria-label="Copy link"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Pending Requests ── */}
        <section className="join-requests__section">
          <SectionTitle variant="inline">Pending Requests ({pendingRequests.length})</SectionTitle>

          {pendingRequests.length === 0 && (
            <p className="join-requests__empty">No pending join requests.</p>
          )}

          <div className="join-requests__list">
            {pendingRequests.map((request) => (
              <div key={request.id} className="join-requests__card-wrapper">
                <div className="join-requests__assign-role-inline">
                  <RoleBadge
                    value={assignRoles[request.id] || 'viewer'}
                    onChange={(role) => setAssignRoles((prev) => ({ ...prev, [request.id]: role }))}
                  />
                </div>
                <EntityCard
                  showAvatar={true}
                  userName={request.name}
                  userEmail={request.email}
                  animated={false}
                  onClick={() => onViewRequest?.(request.id)}
                />
                <div className="join-requests__card-actions">
                  <div className="join-requests__assign-role">
                    <span className="join-requests__assign-label">Assign role:</span>
                    <RoleBadge
                      value={assignRoles[request.id] || 'viewer'}
                      onChange={(role) =>
                        setAssignRoles((prev) => ({ ...prev, [request.id]: role }))
                      }
                    />
                  </div>
                  <div className="join-requests__card-buttons">
                    <Button
                      variant="danger"
                      size="sm"
                      iconLeft={<XCircle size={ICON_SM} />}
                      onClick={() => handleDecline(request.id)}
                    >
                      Decline
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      iconLeft={<CheckCircle2 size={ICON_SM} />}
                      onClick={() => handleAccept(request.id)}
                    >
                      Accept
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Processed Requests ── */}
        {processedRequests.length > 0 && (
          <section className="join-requests__section">
            <SectionTitle variant="inline">Processed ({processedRequests.length})</SectionTitle>

            <div className="join-requests__list">
              {processedRequests.map((request) => (
                <EntityCard
                  key={request.id}
                  showAvatar={true}
                  userName={request.name}
                  userEmail={request.email}
                  showBadge
                  badgeType="candidateState"
                  badgeVariant={request.status === 'accepted' ? 'accepted' : 'rejected'}
                  className="join-requests__card--processed"
                  animated={false}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
});

AddMembers.propTypes = {
  onViewMember: PropTypes.func,
  onViewRequest: PropTypes.func,
};
