import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Check, CheckCircle2, Copy, Link2, RefreshCw, XCircle } from 'lucide-react';
import { Badge, RoleBadge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
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

export const AddMembers = memo(function AddMembers({ onViewMember, onViewRequest }) {
  const { dataVersion } = useBackendData();
  const [refreshKey, setRefreshKey] = useState(0);
  const [assignRoles, setAssignRoles] = useState({});
  const [inviteLink, setInviteLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [requestAction, setRequestAction] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notice, setNotice] = useState('');
  const copiedTimerRef = useRef(null);

  const refreshRequests = useCallback(async ({ silent = false } = {}) => {
    setIsRefreshing(true);
    if (!silent) setNotice('');
    try {
      await refreshJoinRequests();
      setRefreshKey((current) => current + 1);
    } catch (error) {
      if (!silent) setNotice(error.message || 'Join requests could not be refreshed.');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void refreshRequests({ silent: true });
    const refreshTimer = window.setInterval(() => {
      void refreshRequests({ silent: true });
    }, 15000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') void refreshRequests({ silent: true });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.clearInterval(refreshTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
    };
  }, [refreshRequests]);

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
      setRequestAction(`accept:${id}`);
      setNotice('');
      try {
        const newMember = await acceptJoinRequest(id, role);
        setRefreshKey((current) => current + 1);
        if (newMember && onViewMember) onViewMember(newMember.id);
      } catch (error) {
        setNotice(error.message || 'Request could not be accepted.');
      } finally {
        setRequestAction(null);
      }
    },
    [assignRoles, onViewMember]
  );

  const handleDecline = useCallback(async (id) => {
    setRequestAction(`decline:${id}`);
    setNotice('');
    try {
      await declineJoinRequest(id);
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setNotice(error.message || 'Request could not be declined.');
    } finally {
      setRequestAction(null);
    }
  }, []);

  const handleGenerateLink = useCallback(() => {
    setInviteLink(generateInviteLink());
    setCopied(false);
    setNotice('');
  }, []);

  const handleCopyLink = useCallback(async () => {
    if (!inviteLink) return;

    try {
      await navigator.clipboard?.writeText(inviteLink);
      setCopied(true);
      setNotice('');
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copiedTimerRef.current = null;
      }, 2000);
    } catch {
      setNotice('Copy is unavailable in this browser. Select the link and copy it manually.');
    }
  }, [inviteLink]);

  return (
    <div className="join-requests">
      <div className="join-requests__scroll">
        <section className="join-requests__header">
          <div>
            <span className="join-requests__eyebrow">Company access</span>
            <h1>Invite members</h1>
            <p>Share a workspace link, review access requests, and assign the right role.</p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<RefreshCw size={ICON_SM} />}
            onClick={() => refreshRequests()}
            loading={isRefreshing}
          >
            Refresh
          </Button>
        </section>

        <section className="join-requests__invite-section">
          <div className="join-requests__section-head">
            <SectionTitle variant="inline">Invite link</SectionTitle>
            <Button
              variant="secondary"
              size="sm"
              iconLeft={<Link2 size={ICON_SM} />}
              onClick={handleGenerateLink}
            >
              Generate link
            </Button>
          </div>

          <div className="join-requests__invite-row">
            <div className="join-requests__invite-link" aria-live="polite">
              {inviteLink ? (
                <span className="join-requests__invite-url">{inviteLink}</span>
              ) : (
                <span className="join-requests__invite-placeholder">
                  Generate an invitation link before sending it to a teammate.
                </span>
              )}
            </div>
            <Button
              variant={copied ? 'success' : 'ghost'}
              size="sm"
              iconLeft={copied ? <Check size={ICON_SM} /> : <Copy size={ICON_SM} />}
              onClick={handleCopyLink}
              disabled={!inviteLink}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </section>

        {notice && <p className="join-requests__notice">{notice}</p>}

        <section className="join-requests__section">
          <div className="join-requests__section-head">
            <SectionTitle variant="inline">Pending requests</SectionTitle>
            <span className="join-requests__count">{pendingRequests.length}</span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="join-requests__empty">
              No pending requests. New requests appear here when someone opens your invite link.
            </div>
          ) : (
            <div className="join-requests__list">
              {pendingRequests.map((request) => {
                const role = assignRoles[request.id] || 'viewer';
                return (
                  <article key={request.id} className="join-requests__request">
                    <button
                      type="button"
                      className="join-requests__person"
                      onClick={() => onViewRequest?.(request.id)}
                    >
                      <span className="join-requests__avatar">{getInitials(request.name)}</span>
                      <span className="join-requests__person-copy">
                        <strong>{request.name}</strong>
                        <span>{request.email}</span>
                      </span>
                    </button>

                    <div className="join-requests__submitted">
                      <span>Submitted</span>
                      <strong>{request.submittedDate || 'Recently'}</strong>
                    </div>

                    <div className="join-requests__role">
                      <span>Role</span>
                      <RoleBadge
                        value={role}
                        onChange={(nextRole) =>
                          setAssignRoles((current) => ({
                            ...current,
                            [request.id]: nextRole,
                          }))
                        }
                      />
                    </div>

                    <div className="join-requests__actions">
                      <Button
                        variant="ghost"
                        size="sm"
                        iconLeft={<XCircle size={ICON_SM} />}
                        onClick={() => handleDecline(request.id)}
                        loading={requestAction === `decline:${request.id}`}
                      >
                        Decline
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        iconLeft={<CheckCircle2 size={ICON_SM} />}
                        onClick={() => handleAccept(request.id)}
                        loading={requestAction === `accept:${request.id}`}
                      >
                        Accept
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {processedRequests.length > 0 && (
          <section className="join-requests__section">
            <div className="join-requests__section-head">
              <SectionTitle variant="inline">Processed requests</SectionTitle>
              <span className="join-requests__count">{processedRequests.length}</span>
            </div>

            <div className="join-requests__processed-list">
              {processedRequests.map((request) => (
                <button
                  key={request.id}
                  type="button"
                  className="join-requests__processed"
                  onClick={() => onViewRequest?.(request.id)}
                >
                  <span className="join-requests__avatar">{getInitials(request.name)}</span>
                  <span className="join-requests__person-copy">
                    <strong>{request.name}</strong>
                    <span>{request.email}</span>
                  </span>
                  <Badge
                    type="candidateState"
                    variant={request.status === 'accepted' ? 'accepted' : 'rejected'}
                  />
                </button>
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
