import { memo, useState, useCallback } from 'react';
import {
  Phone,
  Clock,
  CalendarDays,
  Building2,
  Activity,
  Pencil,
  Save,
  X,
  Lock,
} from 'lucide-react';
import { EntityCard } from '../../components/ui/Cards';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SectionTitle } from '../../components/ui/SectionTitle';
import {
  changePassword,
  editCurrentUser,
  getMemberActivities,
  TEAM_MEMBERS,
  CURRENT_USER_ID,
  ROLES,
} from '../../api';
import './ProfilePage.css';

const ICON_SM = 14;

/* ── Static profile data (personal info layer on top of team member data) ── */
/* ── Component ── */
export const ProfilePage = memo(function ProfilePage() {
  const member = TEAM_MEMBERS.find((m) => m.id === CURRENT_USER_ID);
  const activities = getMemberActivities(CURRENT_USER_ID);
  const roleConfig = ROLES[member?.role];
  const initialProfile = {
    phone: member?.phone || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Not provided',
  };

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [pwForm, setPwForm] = useState({ oldPw: '', newPw: '', confirmPw: '' });
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleEdit = useCallback(() => {
    setDraft(profile);
    setIsEditing(true);
  }, [profile]);

  const handleSave = useCallback(async () => {
    try {
      await editCurrentUser({ phone: draft.phone });
      setProfile(draft);
      setIsEditing(false);
    } catch (error) {
      window.alert(error.message || 'Unable to update profile.');
    }
  }, [draft]);

  const handleCancel = useCallback(() => {
    setDraft(profile);
    setIsEditing(false);
  }, [profile]);

  const handleDraftChange = useCallback((field, value) => {
    setDraft((d) => ({ ...d, [field]: value }));
  }, []);

  const handlePwChange = useCallback((field, value) => {
    setPwForm((f) => ({ ...f, [field]: value }));
    setPwError('');
    setPwSaved(false);
  }, []);

  const handlePasswordSave = useCallback(async () => {
    if (!pwForm.oldPw) {
      setPwError('Enter your current password.');
      return;
    }
    if (pwForm.newPw.length < 8) {
      setPwError('New password must be at least 8 characters.');
      return;
    }
    if (pwForm.newPw !== pwForm.confirmPw) {
      setPwError('Passwords do not match.');
      return;
    }
    try {
      await changePassword({
        oldPassword: pwForm.oldPw,
        password: pwForm.newPw,
        confirmPassword: pwForm.confirmPw,
      });
      setPwSaved(true);
      setPwForm({ oldPw: '', newPw: '', confirmPw: '' });
      setTimeout(() => setPwSaved(false), 2500);
    } catch (error) {
      setPwError(error.message || 'Unable to update password.');
    }
  }, [pwForm]);

  if (!member) {
    return (
      <div className="profile-page profile-page--empty">
        <span>Profile not found.</span>
      </div>
    );
  }

  const entityCard = (
    <EntityCard
      showAvatar
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
  );

  const activitySection = (
    <section className="profile-page__section">
      <SectionTitle variant="inline">Recent Activity</SectionTitle>
      <div className="profile-page__timeline">
        {activities.length === 0 && (
          <p className="profile-page__empty-text">No activity recorded yet.</p>
        )}
        {activities.map((act) => (
          <div key={act.id} className="profile-page__activity-item">
            <div className="profile-page__activity-icon">
              <Activity size={14} />
            </div>
            <div className="profile-page__activity-content">
              <span className="profile-page__activity-action">{act.action}</span>
              <span className="profile-page__activity-target">{act.target}</span>
            </div>
            <div className="profile-page__activity-time">
              <span className="profile-page__activity-date">{act.date}</span>
              <span className="profile-page__activity-hour">{act.time}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const profileCard = (
    <div className="profile-page__card">
      <SectionTitle variant="inline">Profile</SectionTitle>
      <div className="profile-page__action-list">
        {isEditing ? (
          <>
            <Button
              variant="primary"
              size="sm"
              iconLeft={<Save size={ICON_SM} />}
              onClick={handleSave}
            >
              Save Changes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconLeft={<X size={ICON_SM} />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            iconLeft={<Pencil size={ICON_SM} />}
            onClick={handleEdit}
          >
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );

  const personalInfoCard = (
    <div className="profile-page__card">
      <SectionTitle variant="inline">Personal Info</SectionTitle>

      <div className="profile-page__info-row">
        <Phone size={14} className="profile-page__info-icon" />
        {isEditing ? (
          <input
            className="profile-page__info-input"
            value={draft.phone}
            onChange={(e) => handleDraftChange('phone', e.target.value)}
            placeholder="Phone number"
          />
        ) : (
          <div className="profile-page__info-group">
            <span className="profile-page__info-label">Phone</span>
            <span className="profile-page__info-value">{profile.phone}</span>
          </div>
        )}
      </div>

      <div className="profile-page__divider" />

      <div className="profile-page__info-row">
        <Clock size={14} className="profile-page__info-icon" />
        {isEditing ? (
          <input
            className="profile-page__info-input"
            value={draft.timezone}
            onChange={(e) => handleDraftChange('timezone', e.target.value)}
            placeholder="Timezone"
          />
        ) : (
          <div className="profile-page__info-group">
            <span className="profile-page__info-label">Timezone</span>
            <span className="profile-page__info-value">{profile.timezone}</span>
          </div>
        )}
      </div>
    </div>
  );

  const securityCard = (
    <div className="profile-page__card">
      <SectionTitle variant="inline">Security</SectionTitle>

      <div className="profile-page__pw-field">
        <label className="profile-page__pw-label">Current Password</label>
        <div className="profile-page__pw-input-wrapper">
          <Lock size={13} className="profile-page__pw-icon" />
          <input
            type="password"
            className="profile-page__pw-input"
            value={pwForm.oldPw}
            onChange={(e) => handlePwChange('oldPw', e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="profile-page__pw-field">
        <label className="profile-page__pw-label">New Password</label>
        <div className="profile-page__pw-input-wrapper">
          <Lock size={13} className="profile-page__pw-icon" />
          <input
            type="password"
            className="profile-page__pw-input"
            value={pwForm.newPw}
            onChange={(e) => handlePwChange('newPw', e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      <div className="profile-page__pw-field">
        <label className="profile-page__pw-label">Confirm New Password</label>
        <div className="profile-page__pw-input-wrapper">
          <Lock size={13} className="profile-page__pw-icon" />
          <input
            type="password"
            className="profile-page__pw-input"
            value={pwForm.confirmPw}
            onChange={(e) => handlePwChange('confirmPw', e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      {pwError && <p className="profile-page__pw-error">{pwError}</p>}

      <Button
        variant={pwSaved ? 'ghost' : 'secondary'}
        size="sm"
        iconLeft={<Lock size={ICON_SM} />}
        onClick={handlePasswordSave}
      >
        {pwSaved ? 'Password Updated!' : 'Update Password'}
      </Button>
    </div>
  );

  const accountCard = (
    <div className="profile-page__card">
      <SectionTitle variant="inline">Account</SectionTitle>

      <div className="profile-page__info-group">
        <span className="profile-page__info-label">Email</span>
        <span className="profile-page__info-value">{member.email}</span>
      </div>

      <div className="profile-page__divider" />

      <div className="profile-page__info-group">
        <span className="profile-page__info-label">Role</span>
        <Badge type="role" variant={member.role} />
      </div>

      <div className="profile-page__divider" />

      <div className="profile-page__info-group">
        <span className="profile-page__info-label">Department</span>
        <span className="profile-page__info-value">{member.department}</span>
      </div>

      <div className="profile-page__divider" />

      <div className="profile-page__info-group">
        <span className="profile-page__info-label">Member Since</span>
        <span className="profile-page__info-value">{member.joinedDate}</span>
      </div>

      <div className="profile-page__divider" />

      <div className="profile-page__info-group">
        <span className="profile-page__info-label">Permissions</span>
        <div className="profile-page__permissions">
          {roleConfig?.permissions.map((perm) => (
            <span key={perm} className="profile-page__perm-tag">
              {perm.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="profile-page">
      <div className="profile-page__desktop-layout">
        <div className="profile-page__main">
          <div className="profile-page__scroll">
            {entityCard}
            {activitySection}
          </div>
        </div>

        <aside className="profile-page__sidebar">
          {profileCard}
          {personalInfoCard}
          {securityCard}
          {accountCard}
        </aside>
      </div>

      <div className="profile-page__mobile-shell">
        <div className="profile-page__mobile-content">
          {entityCard}
          {profileCard}
          {personalInfoCard}
          {securityCard}
          {accountCard}
          {activitySection}
        </div>
      </div>
    </div>
  );
});
