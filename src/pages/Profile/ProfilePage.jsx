import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  Lock,
  LogOut,
  Pencil,
  Phone,
  Save,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PasswordInput, TextInput } from '../../components/ui/Input';
import { SectionTitle } from '../../components/ui/SectionTitle';
import {
  changePassword,
  editCurrentUser,
  CURRENT_USER_ID,
  ROLES,
  TEAM_MEMBERS,
  useBackendData,
} from '../../api';
import './ProfilePage.css';

const ICON_SM = 14;

function getInitials(name = '') {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase() || 'VU'
  );
}

function splitMemberName(member) {
  const rawUser = member?.raw?.user || {};
  const nameParts = String(member?.name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: rawUser.firstName || nameParts[0] || '',
    lastName: rawUser.lastName || nameParts.slice(1).join(' ') || '',
  };
}

function getProfileForm(member) {
  const rawUser = member?.raw?.user || {};
  const name = splitMemberName(member);

  return {
    firstName: name.firstName,
    lastName: name.lastName,
    phone: member?.phone || rawUser.phone || '',
    profilePictureUrl: rawUser.profilePictureUrl || '',
  };
}

function normalizeProfilePayload(draft) {
  return {
    firstName: draft.firstName.trim(),
    lastName: draft.lastName.trim(),
    phone: draft.phone.trim() || undefined,
    profilePictureUrl: draft.profilePictureUrl.trim() || undefined,
  };
}

export const ProfilePage = memo(function ProfilePage() {
  const { dataVersion, logout, logoutAllDevices } = useBackendData();
  const savedTimerRef = useRef(null);
  const pwSavedTimerRef = useRef(null);

  const member = useMemo(() => {
    void dataVersion;
    return TEAM_MEMBERS.find((item) => String(item.id) === String(CURRENT_USER_ID));
  }, [dataVersion]);

  const currentForm = useMemo(() => getProfileForm(member), [member]);
  const roleConfig = ROLES[member?.role];
  const timezone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Not provided',
    []
  );

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(currentForm);
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [pwForm, setPwForm] = useState({ oldPw: '', newPw: '', confirmPw: '' });
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [accountAction, setAccountAction] = useState('');
  const [accountError, setAccountError] = useState('');

  useEffect(() => {
    setDraft(currentForm);
    setErrors({});
    setSaveError('');
    setSaved(false);
  }, [currentForm]);

  useEffect(
    () => () => {
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      if (pwSavedTimerRef.current) window.clearTimeout(pwSavedTimerRef.current);
    },
    []
  );

  const hasChanges = useMemo(() => {
    return Object.keys(currentForm).some((key) => draft[key] !== currentForm[key]);
  }, [currentForm, draft]);

  const handleDraftChange = useCallback((field, value) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setSaveError('');
    setSaved(false);
  }, []);

  const handleEdit = useCallback(() => {
    setDraft(currentForm);
    setErrors({});
    setSaveError('');
    setIsEditing(true);
  }, [currentForm]);

  const handleCancel = useCallback(() => {
    setDraft(currentForm);
    setErrors({});
    setSaveError('');
    setIsEditing(false);
  }, [currentForm]);

  const handleSave = useCallback(async () => {
    const nextErrors = {};
    if (!draft.firstName.trim()) nextErrors.firstName = 'First name is required.';
    if (!draft.lastName.trim()) nextErrors.lastName = 'Last name is required.';

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setIsSaving(true);
    setSaveError('');
    try {
      await editCurrentUser(normalizeProfilePayload(draft));
      setSaved(true);
      setIsEditing(false);
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current);
      savedTimerRef.current = window.setTimeout(() => {
        setSaved(false);
        savedTimerRef.current = null;
      }, 2200);
    } catch (error) {
      setSaveError(error.message || 'Profile changes could not be saved.');
    } finally {
      setIsSaving(false);
    }
  }, [draft]);

  const handlePwChange = useCallback((field, value) => {
    setPwForm((current) => ({ ...current, [field]: value }));
    setPwError('');
    setPwSaved(false);
  }, []);

  const handlePasswordEdit = useCallback(() => {
    setPwForm({ oldPw: '', newPw: '', confirmPw: '' });
    setPwError('');
    setPwSaved(false);
    setIsEditingPassword(true);
  }, []);

  const handlePasswordCancel = useCallback(() => {
    setPwForm({ oldPw: '', newPw: '', confirmPw: '' });
    setPwError('');
    setPwSaved(false);
    setIsEditingPassword(false);
  }, []);

  const handlePasswordSave = useCallback(async () => {
    if (!pwForm.oldPw) {
      setPwError('Enter your current password.');
      return;
    }
    if (pwForm.newPw.length < 8) {
      setPwError('Use at least 8 characters for the new password.');
      return;
    }
    if (pwForm.newPw !== pwForm.confirmPw) {
      setPwError('New password and confirmation do not match.');
      return;
    }

    setIsSavingPassword(true);
    setPwError('');
    try {
      await changePassword({
        oldPassword: pwForm.oldPw,
        password: pwForm.newPw,
        confirmPassword: pwForm.confirmPw,
      });
      setPwSaved(true);
      setIsEditingPassword(false);
      setPwForm({ oldPw: '', newPw: '', confirmPw: '' });
      if (pwSavedTimerRef.current) window.clearTimeout(pwSavedTimerRef.current);
      pwSavedTimerRef.current = window.setTimeout(() => {
        setPwSaved(false);
        pwSavedTimerRef.current = null;
      }, 2500);
    } catch (error) {
      setPwError(error.message || 'Password could not be updated.');
    } finally {
      setIsSavingPassword(false);
    }
  }, [pwForm]);

  const handleSignOut = useCallback(async () => {
    setAccountAction('sign-out');
    setAccountError('');
    try {
      await logout();
    } catch (error) {
      setAccountAction('');
      setAccountError(error.message || 'Unable to sign out.');
    }
  }, [logout]);

  const handleSignOutAll = useCallback(async () => {
    setAccountAction('all-devices');
    setAccountError('');
    try {
      await logoutAllDevices();
    } catch (error) {
      setAccountAction('');
      setAccountError(error.message || 'Unable to sign out all devices.');
    }
  }, [logoutAllDevices]);

  if (!member) {
    return (
      <div className="profile-page profile-page--empty">
        <span>Profile not found.</span>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-page__layout">
        <main className="profile-page__main">
          <section className="profile-page__header">
            <div className="profile-page__identity">
              <div className="profile-page__avatar" aria-hidden="true">
                {currentForm.profilePictureUrl ? (
                  <img src={currentForm.profilePictureUrl} alt="" />
                ) : (
                  getInitials(member.name)
                )}
              </div>
              <div className="profile-page__identity-copy">
                <span className="profile-page__eyebrow">Profile</span>
                <h1>{member.name}</h1>
                <p>{member.email}</p>
              </div>
              <Badge type="role" variant={member.role} />
            </div>

            <div className="profile-page__meta-strip">
              <div>
                <span>Joined</span>
                <strong>{member.joinedDate || 'Not provided'}</strong>
              </div>
              <div>
                <span>Last active</span>
                <strong>{member.lastActivity || 'Recently'}</strong>
              </div>
              <div>
                <span>Timezone</span>
                <strong>{timezone}</strong>
              </div>
            </div>
          </section>

          <section className="profile-page__panel">
            <div className="profile-page__section-head">
              <SectionTitle variant="inline">Profile details</SectionTitle>
              <div className="profile-page__details-actions">
                {isEditing ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      iconLeft={<Save size={ICON_SM} />}
                      onClick={handleSave}
                      disabled={!hasChanges || isSaving}
                      loading={isSaving}
                    >
                      {saved ? 'Saved' : 'Save changes'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconLeft={<X size={ICON_SM} />}
                      onClick={handleCancel}
                      disabled={isSaving}
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
                    Edit profile
                  </Button>
                )}
              </div>
            </div>

            <div className="profile-page__form-grid">
              <TextInput
                label="First name"
                value={draft.firstName}
                onChange={(event) => handleDraftChange('firstName', event.target.value)}
                iconLeft={<UserRound size={ICON_SM} />}
                disabled={!isEditing || isSaving}
                error={Boolean(errors.firstName)}
                hint={errors.firstName}
                required
              />
              <TextInput
                label="Last name"
                value={draft.lastName}
                onChange={(event) => handleDraftChange('lastName', event.target.value)}
                iconLeft={<UserRound size={ICON_SM} />}
                disabled={!isEditing || isSaving}
                error={Boolean(errors.lastName)}
                hint={errors.lastName}
                required
              />
              <TextInput
                label="Phone"
                value={draft.phone}
                onChange={(event) => handleDraftChange('phone', event.target.value)}
                iconLeft={<Phone size={ICON_SM} />}
                inputMode="tel"
                disabled={!isEditing || isSaving}
              />
              <TextInput
                label="Profile image URL"
                value={draft.profilePictureUrl}
                onChange={(event) => handleDraftChange('profilePictureUrl', event.target.value)}
                iconLeft={<Image size={ICON_SM} />}
                inputMode="url"
                disabled={!isEditing || isSaving}
              />
            </div>
          </section>

          {saveError && <p className="profile-page__error">{saveError}</p>}
          <section className="profile-page__panel">
            <div className="profile-page__section-head">
              <div className="profile-page__section-copy">
                <SectionTitle variant="inline">Security</SectionTitle>
                <p>Password changes require your current password.</p>
              </div>
              <div className="profile-page__details-actions">
                {isEditingPassword ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      iconLeft={<ShieldCheck size={ICON_SM} />}
                      onClick={handlePasswordSave}
                      loading={isSavingPassword}
                    >
                      Save password
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconLeft={<X size={ICON_SM} />}
                      onClick={handlePasswordCancel}
                      disabled={isSavingPassword}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    iconLeft={<Pencil size={ICON_SM} />}
                    onClick={handlePasswordEdit}
                  >
                    Edit password
                  </Button>
                )}
              </div>
            </div>

            {isEditingPassword ? (
              <>
                <div className="profile-page__security-grid">
                  <PasswordInput
                    label="Current password"
                    value={pwForm.oldPw}
                    onChange={(event) => handlePwChange('oldPw', event.target.value)}
                    iconLeft={<Lock size={ICON_SM} />}
                    autoComplete="current-password"
                    disabled={isSavingPassword}
                  />
                  <PasswordInput
                    label="New password"
                    value={pwForm.newPw}
                    onChange={(event) => handlePwChange('newPw', event.target.value)}
                    iconLeft={<Lock size={ICON_SM} />}
                    autoComplete="new-password"
                    disabled={isSavingPassword}
                  />
                  <PasswordInput
                    label="Confirm new password"
                    value={pwForm.confirmPw}
                    onChange={(event) => handlePwChange('confirmPw', event.target.value)}
                    iconLeft={<Lock size={ICON_SM} />}
                    autoComplete="new-password"
                    disabled={isSavingPassword}
                  />
                </div>
                {pwError && <p className="profile-page__error">{pwError}</p>}
              </>
            ) : (
              <div className="profile-page__security-summary">
                <div className="profile-page__security-icon">
                  <Lock size={ICON_SM} aria-hidden="true" />
                </div>
                <div>
                  <strong>Password protected</strong>
                  <p>Your password is hidden. Use edit password to update it securely.</p>
                </div>
              </div>
            )}

            {pwSaved && <p className="profile-page__success">Password updated.</p>}
          </section>
        </main>

        <aside className="profile-page__sidebar">
          <div className="profile-page__card">
            <SectionTitle variant="inline">Permissions</SectionTitle>
            <p className="profile-page__role-copy">
              {roleConfig?.label || 'Viewer'} access controls what you can create, edit, and review.
            </p>
            <div className="profile-page__permissions">
              {roleConfig?.permissions.map((permission) => (
                <span key={permission} className="profile-page__perm-tag">
                  {permission.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          <div className="profile-page__card">
            <SectionTitle variant="inline">Sessions</SectionTitle>
            <p className="profile-page__session-copy">
              End your current session or sign out everywhere if this account was used on another
              device.
            </p>
            <div className="profile-page__action-list">
              <Button
                variant="secondary"
                size="sm"
                iconLeft={<LogOut size={ICON_SM} />}
                onClick={handleSignOut}
                loading={accountAction === 'sign-out'}
              >
                Sign out
              </Button>
              <Button
                variant="danger"
                size="sm"
                iconLeft={<ShieldAlert size={ICON_SM} />}
                onClick={handleSignOutAll}
                loading={accountAction === 'all-devices'}
              >
                Sign out all devices
              </Button>
            </div>
            {accountError && <p className="profile-page__error">{accountError}</p>}
          </div>
        </aside>
      </div>
    </div>
  );
});
