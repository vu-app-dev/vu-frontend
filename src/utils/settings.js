const SETTINGS_KEY = 'vu-settings';

const DEFAULTS = {
  theme: 'system',
  notifications: { email: true, push: false, slack: false },
  localization: { language: 'en', timezone: 'utc' },
  privacy: { shareData: false, publicProfile: true },
  defaultJobStatus: 'All',
};

let listeners = [];

export function loadSettings() {
  if (typeof window === 'undefined') return { ...DEFAULTS };

  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    const rest = Object.fromEntries(
      Object.entries(parsed || {}).filter(([key]) => key !== 'itemsPerPage')
    );
    return { ...DEFAULTS, ...rest };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(next) {
  if (typeof window === 'undefined') {
    listeners.forEach((l) => l(next));
    return;
  }

  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // Storage can be blocked in private browsing; keep the live UI in sync.
  }
  listeners.forEach((l) => l(next));
}

export function subscribeSettings(cb) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function getDefaults() {
  return { ...DEFAULTS };
}
