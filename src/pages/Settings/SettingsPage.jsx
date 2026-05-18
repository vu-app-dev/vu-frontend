import { useState } from 'react';
import { Toggle } from '../../components/ui/Toggle';
import { DropdownInput } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SectionTitle } from '../../components/ui/SectionTitle';
import { THEMES, applyTheme, persistTheme } from '../../utils/theme';
import { loadSettings, saveSettings, getDefaults } from '../../utils/settings';
import './SettingsPage.css';

const JOB_STATUS_OPTIONS = [
  { value: 'All', label: 'All' },
  { value: 'Active', label: 'Active' },
  { value: 'Scheduled', label: 'Scheduled' },
  { value: 'Closed', label: 'Closed' },
];

export default function SettingsPage() {
  // Load persisted settings
  const persisted = typeof window !== 'undefined' ? loadSettings() : getDefaults();

  // Theme state (stored as 'system' | 'light' | 'dark')
  const [currentTheme, setCurrentTheme] = useState(() => persisted.theme || 'system');

  const handleThemeChange = (newTheme) => {
    let themeToSet = newTheme;
    if (newTheme === 'system') {
      const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      themeToSet = prefersLight ? THEMES.light : THEMES.dark;
    }
    applyTheme(themeToSet);
    persistTheme(themeToSet);
    setCurrentTheme(newTheme);
  };

  // Other persisted settings
  const [notifications, setNotifications] = useState(
    () => persisted.notifications || getDefaults().notifications
  );

  const [localization, setLocalization] = useState(
    () => persisted.localization || getDefaults().localization
  );

  const [privacy, setPrivacy] = useState(() => persisted.privacy || getDefaults().privacy);
  const [defaultJobStatus, setDefaultJobStatus] = useState(
    () =>
      JOB_STATUS_OPTIONS.some((option) => option.value === persisted.defaultJobStatus)
        ? persisted.defaultJobStatus
        : getDefaults().defaultJobStatus
  );
  const [showSaved, setShowSaved] = useState(false);

  const handleNotificationToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrivacyToggle = (key) => {
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    const next = {
      theme: currentTheme,
      notifications,
      localization,
      privacy,
      defaultJobStatus,
    };
    saveSettings(next);
    // apply theme now
    let themeToSet =
      currentTheme === 'system'
        ? window.matchMedia('(prefers-color-scheme: light)').matches
          ? THEMES.light
          : THEMES.dark
        : currentTheme;
    applyTheme(themeToSet);
    persistTheme(themeToSet);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 3000);
  };

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <h1 className="settings-page__title">Application Settings</h1>
        <p className="settings-page__subtitle">
          Manage your personal preferences and application behavior.
        </p>
      </div>

      <div className="settings-page__content">
        <section className="settings-page__section">
          <SectionTitle>Appearance</SectionTitle>
          <div className="settings-page__card">
            <div className="settings-page__row">
              <div className="settings-page__row-info">
                <h3>Application Theme</h3>
                <p>Choose between light and dark mode, or sync with your system.</p>
              </div>
              <div className="settings-page__row-action">
                <DropdownInput
                  value={currentTheme}
                  options={[
                    { value: 'system', label: 'System Default' },
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                  ]}
                  onChange={handleThemeChange}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="settings-page__section">
          <SectionTitle>General</SectionTitle>
          <div className="settings-page__card">
            <div className="settings-page__row">
              <div className="settings-page__row-info">
                <h3>Default Job Status</h3>
                <p>Which status to select by default when opening the Jobs list.</p>
              </div>
              <div className="settings-page__row-action">
                <DropdownInput
                  value={defaultJobStatus}
                  options={JOB_STATUS_OPTIONS}
                  onChange={(val) => setDefaultJobStatus(val)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="settings-page__section">
          <SectionTitle>Notifications</SectionTitle>
          <div className="settings-page__card">
            <div className="settings-page__row">
              <div className="settings-page__row-info">
                <h3>Email Notifications</h3>
                <p>Receive daily summaries and important alerts via email.</p>
              </div>
              <div className="settings-page__row-action">
                <Toggle
                  checked={notifications.email}
                  onChange={() => handleNotificationToggle('email')}
                />
              </div>
            </div>
            <div className="settings-page__divider" />
            <div className="settings-page__row">
              <div className="settings-page__row-info">
                <h3>Push Notifications</h3>
                <p>Get real-time updates pushed directly to your device.</p>
              </div>
              <div className="settings-page__row-action">
                <Toggle
                  checked={notifications.push}
                  onChange={() => handleNotificationToggle('push')}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="settings-page__section">
          <SectionTitle>Localization</SectionTitle>
          <div className="settings-page__card">
            <div className="settings-page__row">
              <div className="settings-page__row-info">
                <h3>Language</h3>
                <p>Select your preferred language for the application.</p>
              </div>
              <div className="settings-page__row-action">
                <DropdownInput
                  value={localization.language}
                  options={[
                    { value: 'en', label: 'English (US)' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' },
                    { value: 'de', label: 'German' },
                  ]}
                  onChange={(val) => setLocalization((prev) => ({ ...prev, language: val }))}
                />
              </div>
            </div>
            <div className="settings-page__divider" />
            <div className="settings-page__row">
              <div className="settings-page__row-info">
                <h3>Timezone</h3>
                <p>Set your local timezone for dates and times.</p>
              </div>
              <div className="settings-page__row-action">
                <DropdownInput
                  value={localization.timezone}
                  options={[
                    { value: 'utc', label: 'UTC (Coordinated Universal Time)' },
                    { value: 'est', label: 'EST (Eastern Standard Time)' },
                    { value: 'pst', label: 'PST (Pacific Standard Time)' },
                    { value: 'cet', label: 'CET (Central European Time)' },
                  ]}
                  onChange={(val) => setLocalization((prev) => ({ ...prev, timezone: val }))}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="settings-page__section">
          <SectionTitle>Privacy & Security</SectionTitle>
          <div className="settings-page__card">
            <div className="settings-page__row">
              <div className="settings-page__row-info">
                <h3>Public Profile</h3>
                <p>Allow other users in your organization to see your profile.</p>
              </div>
              <div className="settings-page__row-action">
                <Toggle
                  checked={privacy.publicProfile}
                  onChange={() => handlePrivacyToggle('publicProfile')}
                />
              </div>
            </div>
            <div className="settings-page__divider" />
            <div className="settings-page__row">
              <div className="settings-page__row-info">
                <h3>Data Sharing</h3>
                <p>Share anonymous usage data to help us improve the platform.</p>
              </div>
              <div className="settings-page__row-action">
                <Toggle
                  checked={privacy.shareData}
                  onChange={() => handlePrivacyToggle('shareData')}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="settings-page__footer">
          <Button variant="primary" onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
      {showSaved && (
        <div className="settings-toast" role="status" aria-live="polite">
          Settings saved
        </div>
      )}
    </div>
  );
}
