// save data in localStorage or sessionStorage, depending on the type of data

const TOKEN_KEY = 'vu:backend:token';
const AUTH_TOKEN_KEYS = [
  TOKEN_KEY,
  'token',
  'accessToken',
  'access_token',
  'authToken',
  'jwt',
  'vu:token',
  'vu:auth:token',
];
const CANDIDATE_INFO_KEY = 'vu:application:candidate';
const LOCAL_JOIN_REQUESTS_KEY = 'vu:backend-missing:join-requests';
const LOCAL_ENTITY_METADATA_KEY = 'vu:backend-missing:entity-metadata';

const EMPTY_ENTITY_METADATA = {
  jobs: {},
  mocks: {},
  candidates: {},
};

function getBrowserStorage(type = 'local') {
  if (typeof window === 'undefined') return null;
  try {
    return type === 'session' ? window.sessionStorage : window.localStorage;
  } catch {
    return null;
  }
}

function readStorage(key, fallback = null, storage) {
  const targetStorage = storage || getBrowserStorage('local');
  if (!targetStorage) return fallback;

  try {
    const raw = targetStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeStorage(key, value, storage) {
  const targetStorage = storage || getBrowserStorage('local');
  if (!targetStorage) return;

  if (value == null) {
    targetStorage.removeItem(key);
    return;
  }

  targetStorage.setItem(key, JSON.stringify(value));
}

// get the current stored token of the logged-in user
export function getStoredToken() {
  const storage = getBrowserStorage('local');
  if (!storage) return '';
  try {
    return storage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredToken(token) {
  const storage = getBrowserStorage('local');
  if (!storage) return;
  try {
    if (token) storage.setItem(TOKEN_KEY, token);
    else clearStoredToken();
  } catch {
    // Ignore storage write failures; callers can continue unauthenticated.
  }
}

export function clearStoredToken() {
  const storages = [getBrowserStorage('local'), getBrowserStorage('session')].filter(Boolean);
  storages.forEach((storage) => {
    AUTH_TOKEN_KEYS.forEach((key) => {
      try {
        storage.removeItem(key);
      } catch {
        // Ignore storage restrictions.
      }
    });
  });
}

export function getStoredCandidateInfo() {
  return readStorage(CANDIDATE_INFO_KEY, {}, getBrowserStorage('session'));
}

export function setStoredCandidateInfo(candidateInfo) {
  writeStorage(CANDIDATE_INFO_KEY, candidateInfo, getBrowserStorage('session'));
}

export function getLocalJoinRequests() {
  return readStorage(LOCAL_JOIN_REQUESTS_KEY, []);
}

export function setLocalJoinRequests(requests) {
  writeStorage(LOCAL_JOIN_REQUESTS_KEY, requests);
}

function normalizeStorageId(id) {
  return id == null ? '' : String(id);
}

function normalizeEntityMetadata(metadata = EMPTY_ENTITY_METADATA) {
  return {
    jobs: { ...(metadata.jobs || {}) },
    mocks: { ...(metadata.mocks || {}) },
    candidates: { ...(metadata.candidates || {}) },
  };
}

export function candidateMetadataKey(jobId, email) {
  const normalizedJobId = normalizeStorageId(jobId);
  const normalizedEmail = String(email || '').trim().toLowerCase();
  return normalizedJobId && normalizedEmail ? `${normalizedJobId}:${normalizedEmail}` : '';
}

export function getLocalEntityMetadata() {
  return normalizeEntityMetadata(readStorage(LOCAL_ENTITY_METADATA_KEY, EMPTY_ENTITY_METADATA));
}

export function setLocalEntityMetadata(metadata) {
  writeStorage(LOCAL_ENTITY_METADATA_KEY, normalizeEntityMetadata(metadata));
}

export function patchLocalJobMetadata(jobId, patch) {
  const id = normalizeStorageId(jobId);
  if (!id || !patch) return null;

  const metadata = getLocalEntityMetadata();
  metadata.jobs[id] = {
    ...(metadata.jobs[id] || {}),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  setLocalEntityMetadata(metadata);
  return metadata.jobs[id];
}

export function patchLocalMockMetadata(mockId, patch) {
  const id = normalizeStorageId(mockId);
  if (!id || !patch) return null;

  const metadata = getLocalEntityMetadata();
  metadata.mocks[id] = {
    ...(metadata.mocks[id] || {}),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  setLocalEntityMetadata(metadata);
  return metadata.mocks[id];
}

export function patchLocalCandidateMetadata(candidateId, patch) {
  const id = normalizeStorageId(candidateId);
  if (!id || !patch) return null;

  const metadata = getLocalEntityMetadata();
  metadata.candidates[id] = {
    ...(metadata.candidates[id] || {}),
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  setLocalEntityMetadata(metadata);
  return metadata.candidates[id];
}

export function patchLocalCandidateApplicationMetadata(jobId, email, patch) {
  const id = candidateMetadataKey(jobId, email);
  return patchLocalCandidateMetadata(id, patch);
}

export function removeLocalJobMetadata(jobId) {
  const id = normalizeStorageId(jobId);
  if (!id) return;

  const metadata = getLocalEntityMetadata();
  delete metadata.jobs[id];
  setLocalEntityMetadata(metadata);
}

export function removeLocalMockMetadata(mockId) {
  const id = normalizeStorageId(mockId);
  if (!id) return;

  const metadata = getLocalEntityMetadata();
  delete metadata.mocks[id];
  setLocalEntityMetadata(metadata);
}

export function removeLocalCandidateMetadata(candidateId) {
  const id = normalizeStorageId(candidateId);
  if (!id) return;

  const metadata = getLocalEntityMetadata();
  delete metadata.candidates[id];
  setLocalEntityMetadata(metadata);
}

export const storageKeys = {
  token: TOKEN_KEY,
  candidateInfo: CANDIDATE_INFO_KEY,
  localJoinRequests: LOCAL_JOIN_REQUESTS_KEY,
  localEntityMetadata: LOCAL_ENTITY_METADATA_KEY,
};
