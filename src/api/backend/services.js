import { apiFetch, buildQueryString } from './client';
import { endpoints } from './endpoints';
import {
  getStoredToken,
  setStoredToken,
  clearStoredToken,
  patchLocalJobMetadata,
  patchLocalMockMetadata,
  patchLocalCandidateMetadata,
  removeLocalJobMetadata,
  removeLocalMockMetadata,
} from './storage';
import {
  CandidateStatusEnum,
  CANDIDATE_STATUS_TO_UI,
  CompanyUserTypeEnum,
  ROLE_TO_UI,
  UI_ROLE_TO_BACKEND,
  UI_STATUS_TO_BACKEND,
  formToBackendCompanyInput,
  formToBackendJobInput,
  formToBackendMockInput,
  jobToForm,
  mapBackendCandidate,
  mapBackendJob,
  mapBackendMock,
  normalizeId,
} from './mappers';
import {
  ACTIVITY_LOG,
  APPLICATION,
  ASSESSMENT_RULES,
  CANDIDATE_INFO,
  CANDIDATES,
  COMPANY,
  CURRENT_USER,
  CURRENT_USER_ID,
  EMAIL_TRIGGERS,
  INITIAL_JOB_FORM,
  INITIAL_MOCK_FORM,
  JOBS,
  JOB_STEPS_CREATE,
  JOB_STEPS_EDIT,
  JOB_TYPE_OPTIONS,
  JOIN_REQUESTS,
  LOCATION_TYPE_OPTIONS,
  MOCKS,
  MOCK_LIBRARY,
  MOCK_STEPS_CREATE,
  MOCK_STEPS_EDIT,
  MOCK_TYPE_OPTIONS,
  ROLES,
  SAMPLE_CONVERSATION,
  SENIORITY_OPTIONS,
  TEAM_MEMBERS,
  clearCurrentUserStore,
  getDatastoreSnapshot,
  getFileUi,
  getJobForm,
  getMockForm,
  hasPermission,
  parseDurationMin,
  removeJobFromStore,
  removeMemberStore,
  removeMockFromStore,
  resetCandidateInfo,
  setApplication,
  setBackendData,
  setCandidateInfo,
  updateCompanyStore,
  updateJoinRequestStore,
  updateMemberStore,
  upsertCandidate,
  upsertJob,
  upsertMemberStore,
  upsertMock,
  DEPARTMENT_OPTIONS,
  DIFFICULTY_OPTIONS,
  DURATION_OPTIONS,
  INDUSTRY_OPTIONS,
} from './store';

async function fetchPaginated(path, query = {}) {
  const items = [];
  let page = query.paginate?.page || 1;
  const limit = query.paginate?.limit || 100;
  let hasNext = true;

  while (hasNext) {
    const response = await apiFetch(
      `${path}${buildQueryString({ ...query, paginate: { page, limit } })}`
    );
    items.push(...extractPaginatedItems(response));
    hasNext = extractHasNext(response);
    page += 1;
    if (page > 20) break;
  }

  return items;
}

function unwrapEntity(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  if (payload.data && typeof payload.data === 'object') return unwrapEntity(payload.data);
  if (payload.user && typeof payload.user === 'object') return unwrapEntity(payload.user);
  if (payload.candidate && typeof payload.candidate === 'object')
    return unwrapEntity(payload.candidate);
  if (payload.item && typeof payload.item === 'object') return unwrapEntity(payload.item);
  return payload;
}

function extractAuthToken(payload) {
  if (!payload || typeof payload !== 'object') return '';

  const direct =
    payload.token ||
    payload.accessToken ||
    payload.access_token ||
    payload.jwt ||
    payload.idToken ||
    '';
  if (direct) return String(direct);

  const nested =
    payload.data && typeof payload.data === 'object' ? extractAuthToken(payload.data) : '';
  return nested || '';
}

function extractPaginatedItems(response) {
  if (!response || typeof response !== 'object') return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.users)) return response.users;
  if (Array.isArray(response.companyUsers)) return response.companyUsers;
  if (Array.isArray(response.members)) return response.members;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.items)) return response.data.items;
  if (Array.isArray(response.data?.users)) return response.data.users;
  if (Array.isArray(response.data?.companyUsers)) return response.data.companyUsers;
  if (Array.isArray(response.data?.members)) return response.data.members;
  if (Array.isArray(response.data?.data?.items)) return response.data.data.items;
  if (Array.isArray(response.data?.data?.users)) return response.data.data.users;
  if (Array.isArray(response.data?.data?.companyUsers)) return response.data.data.companyUsers;
  if (Array.isArray(response.data?.data?.members)) return response.data.data.members;
  if (Array.isArray(response.results)) return response.results;
  if (Array.isArray(response.data?.results)) return response.data.results;
  return [];
}

function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data?.items)) return response.data.items;
  if (Array.isArray(response?.users)) return response.users;
  if (Array.isArray(response?.companyUsers)) return response.companyUsers;
  if (Array.isArray(response?.members)) return response.members;
  if (Array.isArray(response?.data?.users)) return response.data.users;
  if (Array.isArray(response?.data?.companyUsers)) return response.data.companyUsers;
  if (Array.isArray(response?.data?.members)) return response.data.members;
  return [];
}

function extractCompanyUsersFallback(company, companyUser) {
  const sources = [
    company?.companyUsers,
    company?.users,
    company?.members,
    companyUser?.company?.companyUsers,
    companyUser?.company?.users,
    companyUser?.company?.members,
  ];

  for (const source of sources) {
    const users = extractList(source);
    if (users.length) return users;
  }

  return companyUser ? [companyUser] : [];
}

async function optionalApi(fallback, request) {
  try {
    return await request();
  } catch (error) {
    console.warn('Optional backend request failed.', error);
    return fallback;
  }
}

export const COMPANY_APPROVAL_PENDING_CODE = 'COMPANY_APPROVAL_PENDING';
export const COMPANY_ACCESS_UNAVAILABLE_CODE = 'COMPANY_ACCESS_UNAVAILABLE';

export class CompanyApprovalPendingError extends Error {
  constructor() {
    super('Your company access request is still pending owner approval.');
    this.name = 'CompanyApprovalPendingError';
    this.code = COMPANY_APPROVAL_PENDING_CODE;
    this.status = 'pending_approval';
  }
}

export class CompanyAccessUnavailableError extends Error {
  constructor() {
    super('Your company access is no longer available.');
    this.name = 'CompanyAccessUnavailableError';
    this.code = COMPANY_ACCESS_UNAVAILABLE_CODE;
    this.status = 'company_access_unavailable';
  }
}

function getCompanyUserApprovalState(companyUser) {
  if (!companyUser) return 'missing';
  const status = String(
    companyUser.status ||
      companyUser.requestStatus ||
      companyUser.joinRequestStatus ||
      companyUser.approvalStatus ||
      ''
  ).toLowerCase();

  if (
    companyUser.deletedAt ||
    ['declined', 'rejected', 'cancelled', 'canceled', 'removed'].includes(status)
  ) {
    return 'unavailable';
  }

  if (companyUser.approved === false) return 'pending';
  return 'approved';
}

export function getCurrentUserRole() {
  const member = TEAM_MEMBERS.find((item) => normalizeId(item.id) === normalizeId(CURRENT_USER_ID));
  if (member?.role) return member.role;
  return ROLE_TO_UI[CURRENT_USER?.companyUser?.type] || 'viewer';
}

export function canCurrentUser(permission) {
  return hasPermission(getCurrentUserRole(), permission);
}

function requireCurrentPermission(permission, action = 'perform this action') {
  if (!canCurrentUser(permission)) {
    throw new Error(`You do not have permission to ${action}.`);
  }
}

function extractHasNext(response) {
  if (!response || typeof response !== 'object') return false;
  if (typeof response.hasNext === 'boolean') return response.hasNext;
  if (typeof response.data?.hasNext === 'boolean') return response.data.hasNext;
  if (typeof response.data?.data?.hasNext === 'boolean') return response.data.data.hasNext;

  const page = response.page || response.data?.page || response.data?.data?.page;
  const totalPages =
    response.totalPages || response.data?.totalPages || response.data?.data?.totalPages;
  if (Number.isFinite(page) && Number.isFinite(totalPages)) {
    return Number(page) < Number(totalPages);
  }

  return false;
}

// optimization to avoid creating new mock/job lookup maps on every call to fetchMockById or fetchJobById
function makeMockLookup() {
  return new Map(MOCKS.map((mock) => [normalizeId(mock.id), mock]));
}

function makeJobLookup() {
  return new Map(JOBS.map((job) => [normalizeId(job.id), job]));
}

function isFormJobPayload(value) {
  return (
    value &&
    typeof value === 'object' &&
    ('jobType' in value || 'mocks' in value || 'emails' in value)
  );
}

function isFormMockPayload(value) {
  return (
    value &&
    typeof value === 'object' &&
    ('durationMin' in value ||
      'technologies' in value ||
      'topics' in value ||
      'skills' in value ||
      'criteria' in value ||
      'questions' in value)
  );
}

function isStatusOnlyPatch(value) {
  const keys = Object.keys(value || {});
  return keys.length === 1 && keys[0] === 'status';
}

function cleanWeight(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function minutesLabel(value, fallback = 5) {
  const minutes = parseDurationMin(value || fallback) || fallback;
  return `${minutes} minutes`;
}

function questionDifficultyValue(value) {
  return String(value || '').toUpperCase() || 'MEDIUM';
}

function extractJobLocalMetadata(form) {
  if (!isFormJobPayload(form)) return null;

  return {
    seniority: form.seniority || '',
    locationType: form.locationType || '',
    location: form.location || '',
    maxCandidates: form.maxCandidates || '',
    mockWeights: Object.fromEntries(
      (form.mocks || [])
        .map((mock) => [normalizeId(mock?.id || mock), cleanWeight(mock?.weight)])
        .filter(([id]) => id)
    ),
  };
}

function extractMockLocalMetadata(form) {
  if (!isFormMockPayload(form)) return null;

  return {
    topics: (form.topics || form.criteria || [])
      .map((topic, index) => ({
        id: normalizeId(topic?.id || `topic-${index + 1}`),
        name: String(topic?.name || topic?.title || topic || '').trim(),
        weight: cleanWeight(topic?.weight),
      }))
      .filter((topic) => topic.name),
    questions: (form.questions || []).map((question, index) => ({
      id: normalizeId(question?.id || `question-${index + 1}`),
      title: question?.title || `Question ${index + 1}`,
      description: question?.description || '',
      difficulty: String(
        question?.difficulty || question?.difficultyValue || 'medium'
      ).toLowerCase(),
      difficultyValue: questionDifficultyValue(question?.difficultyValue || question?.difficulty),
      estimatedTime: minutesLabel(question?.estimatedTime || question?.estimatedTimeInMinutes || 5),
      estimatedTimeMin: parseDurationMin(
        question?.estimatedTime || question?.estimatedTimeInMinutes || 5
      ),
      estimatedTimeInMinutes: parseDurationMin(
        question?.estimatedTime || question?.estimatedTimeInMinutes || 5
      ),
      answerType: question?.answerType || '',
      correctAnswer: question?.correctAnswer || question?.answer || '',
      weight: cleanWeight(question?.weight),
      order: index + 1,
    })),
  };
}

export async function loadBackendData() {
  const token = getStoredToken();
  if (!token) {
    throw new Error('No backend token found.');
  }

  const userResponse = await apiFetch(endpoints.users.me);
  const user = unwrapEntity(userResponse);
  const companyUser = user?.companyUser;
  const approvalState = getCompanyUserApprovalState(companyUser);

  if (approvalState === 'pending' || approvalState === 'unavailable') {
    setBackendData({
      user,
      company: companyUser.company || null,
      companyUser: null,
      companyUsers: [],
      joinRequests: [],
      jobs: [],
      mocks: [],
      candidates: [],
    });
    if (approvalState === 'unavailable') throw new CompanyAccessUnavailableError();
    throw new CompanyApprovalPendingError();
  }

  const companyResponse = await optionalApi(null, () => apiFetch(endpoints.companies.info));
  const company = companyResponse ? unwrapEntity(companyResponse) : companyUser?.company;
  const userId = normalizeId(user?.id || user?.userId || user?._id);
  const hasApprovedCompanyUser = Boolean(
    companyUser && companyUser.approved !== false && companyUser.companyId
  );
  const isCompanyManager = Boolean(
    userId && normalizeId(company?.managerId || company?.ownerId || company?.createdById) === userId
  );
  const hasCompanyAccess = Boolean(hasApprovedCompanyUser || isCompanyManager);

  if (!hasCompanyAccess) {
    setBackendData({
      user,
      company: null,
      companyUser: null,
      companyUsers: [],
      joinRequests: [],
      jobs: [],
      mocks: [],
      candidates: [],
    });
    throw new CompanyAccessUnavailableError();
  }

  const [companyUsers, joinRequestsResponse, mocks, jobs, candidates] = await Promise.all([
    optionalApi([], () =>
      fetchPaginated(endpoints.companies.users, {
        paginate: { page: 1, limit: 100 },
      })
    ),
    optionalApi([], () => apiFetch(endpoints.companies.joinRequests)),
    fetchPaginated(endpoints.mocks.paginated, {
      sort: { field: 'createdAt', dir: 'DESC' },
    }),
    fetchPaginated(endpoints.jobs.paginated, {
      sort: { field: 'createdAt', dir: 'DESC' },
    }),
    fetchPaginated(endpoints.candidates.paginated, {
      sort: { field: 'createdAt', dir: 'DESC' },
    }),
  ]);

  const visibleCompanyUsers = companyUsers.length
    ? companyUsers
    : extractCompanyUsersFallback(company, companyUser);

  setBackendData({
    user,
    company,
    companyUser,
    companyUsers: visibleCompanyUsers,
    joinRequests: extractList(joinRequestsResponse),
    jobs,
    mocks,
    candidates,
  });
  return getDatastoreSnapshot();
}

export async function login(credentials) {
  const response = await apiFetch(
    endpoints.auth.login,
    {
      method: 'POST',
      body: { input: credentials },
    },
    ''
  );
  const token = extractAuthToken(response);
  if (!token) {
    throw new Error('Login succeeded but no auth token was returned by the backend.');
  }
  setStoredToken(token);
  return response;
}

export async function registerManager(input) {
  return apiFetch(
    endpoints.auth.registerManager,
    {
      method: 'POST',
      body: { input },
    },
    ''
  );
}

export async function requestVerificationCode(input) {
  return apiFetch(
    endpoints.auth.requestCode,
    {
      method: 'POST',
      body: { input },
    },
    ''
  );
}

export async function verifyEmail(input, options = {}) {
  const response = await apiFetch(
    endpoints.auth.verifyEmail,
    {
      method: 'POST',
      body: { input },
    },
    ''
  );
  const token = extractAuthToken(response);
  if (!token && options.requireToken !== false) {
    throw new Error('Email verified but no auth token was returned by the backend.');
  }
  if (token && options.storeToken !== false) {
    setStoredToken(token);
  }
  return response;
}

export async function resetPassword(input) {
  return apiFetch(
    endpoints.auth.resetPassword,
    {
      method: 'POST',
      body: { input },
    },
    ''
  );
}

export async function logout() {
  try {
    if (getStoredToken()) {
      await apiFetch(endpoints.auth.logout, { method: 'POST' });
    }
  } finally {
    clearStoredToken();
    clearCurrentUserStore();
  }
}

export async function logoutAllDevices() {
  try {
    if (getStoredToken()) {
      await apiFetch(endpoints.auth.logoutAllDevices, { method: 'POST' });
    }
  } finally {
    clearStoredToken();
    clearCurrentUserStore();
  }
}

export function getJobById(id) {
  return JOBS.find((job) => normalizeId(job.id) === normalizeId(id)) || null;
}

export async function fetchJobById(id) {
  const response = await apiFetch(endpoints.jobs.byId(id));
  const mapped = mapBackendJob(unwrapJobEntity(response), makeMockLookup());
  return upsertJob(mapped);
}

export async function addJob(form) {
  requireCurrentPermission('create_jobs', 'create jobs');
  const input = formToBackendJobInput(form);
  const response = await apiFetch(endpoints.jobs.create, {
    method: 'POST',
    body: { input },
  });
  const mapped = mapBackendJob(unwrapJobEntity(response), makeMockLookup());
  patchLocalJobMetadata(mapped.id, extractJobLocalMetadata(form));
  upsertJob(mapped);
  await loadBackendData();
  return getJobById(mapped.id) || mapped;
}

export async function updateJob(id, patch) {
  requireCurrentPermission('edit_jobs', 'edit jobs');
  const job = getJobById(id);
  if (!job) throw new Error('Job not found');

  if (isStatusOnlyPatch(patch)) {
    const next = { ...job, ...patch };
    upsertJob(next);
    return next;
  }

  const input = isFormJobPayload(patch) ? formToBackendJobInput(patch) : patch;
  const response = await apiFetch(endpoints.jobs.update(id), {
    method: 'PATCH',
    body: { input },
  });
  const mapped = mapBackendJob(unwrapJobEntity(response), makeMockLookup());
  patchLocalJobMetadata(mapped.id || id, extractJobLocalMetadata(patch));
  upsertJob(mapped);
  await loadBackendData();
  return getJobById(mapped.id) || mapped;
}

export async function removeJob(id) {
  requireCurrentPermission('edit_jobs', 'delete jobs');
  await apiFetch(endpoints.jobs.delete(id), { method: 'DELETE' });
  removeLocalJobMetadata(id);
  removeJobFromStore(id);
  return true;
}

export async function duplicateJob(id) {
  requireCurrentPermission('create_jobs', 'duplicate jobs');
  const job = getJobById(id);
  if (!job) return null;
  const form = jobToForm(job);
  form.title = `${form.title} Copy`.slice(0, 30);
  return addJob(form);
}

export function getMockById(id) {
  return MOCKS.find((mock) => normalizeId(mock.id) === normalizeId(id)) || null;
}

export async function fetchMockById(id) {
  const response = await apiFetch(endpoints.mocks.byId(id));
  return upsertMock(mapBackendMock(response));
}

export function getMockStatus(mockId) {
  return JOBS.some(
    (job) =>
      job.status === 'active' &&
      (job.mocks || []).some((mock) => normalizeId(mock.id) === normalizeId(mockId))
  )
    ? 'active'
    : 'inactive';
}

export function getMockStatusByTitle(mockTitle) {
  const mock = MOCKS.find((item) => item.title === mockTitle);
  return mock ? getMockStatus(mock.id) : 'inactive';
}

export function getUsedInJobsCount(mockTitle) {
  return getJobsUsingMock(mockTitle).length;
}

export function getJobsUsingMock(mockTitle) {
  const mock = MOCKS.find((item) => item.title === mockTitle);
  if (!mock) return [];

  return JOBS.filter((job) =>
    (job.mocks || []).some((jobMock) => normalizeId(jobMock.id) === normalizeId(mock.id))
  ).map((job) => ({
    id: job.id,
    title: job.title,
    status: job.status,
    totalApplied: job.totalApplied,
    department: job.department,
  }));
}

export function getCandidatesPerJob(mockTitle) {
  return getJobsUsingMock(mockTitle).map((job) => ({
    label: job.title,
    candidates: job.totalApplied,
  }));
}

export async function addMock(form) {
  requireCurrentPermission('create_mocks', 'create mocks');
  const input = formToBackendMockInput(form);
  const response = await apiFetch(endpoints.mocks.create, {
    method: 'POST',
    body: { input },
  });
  const mapped = mapBackendMock(response);
  patchLocalMockMetadata(mapped.id, extractMockLocalMetadata(form));
  upsertMock(mapped);
  await loadBackendData();
  return getMockById(mapped.id) || mapped;
}

export async function updateMock(id, patch) {
  requireCurrentPermission('edit_mocks', 'edit mocks');
  const input = isFormMockPayload(patch) ? formToBackendMockInput(patch) : patch;
  const response = await apiFetch(endpoints.mocks.update(id), {
    method: 'PATCH',
    body: { input },
  });
  const mapped = mapBackendMock(response);
  patchLocalMockMetadata(mapped.id || id, extractMockLocalMetadata(patch));
  upsertMock(mapped);
  await loadBackendData();
  return getMockById(mapped.id) || mapped;
}

export async function removeMock(id) {
  requireCurrentPermission('edit_mocks', 'delete mocks');
  await apiFetch(endpoints.mocks.delete(id), { method: 'DELETE' });
  removeLocalMockMetadata(id);
  removeMockFromStore(id);
  return true;
}

export async function duplicateMock(id) {
  requireCurrentPermission('create_mocks', 'duplicate mocks');
  const mock = getMockById(id);
  if (!mock) return null;
  const form = getMockForm(mock);
  form.title = `${form.title} Copy`.slice(0, 30);
  return addMock(form);
}

export function getCandidateById(id) {
  return CANDIDATES.find((candidate) => normalizeId(candidate.id) === normalizeId(id)) || null;
}

export function toSlug(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export function getCandidateBySlug(slug) {
  return CANDIDATES.find((candidate) => toSlug(candidate.name) === slug) || null;
}

export function getCandidatesByJob(jobTitle) {
  return CANDIDATES.filter((candidate) => candidate.job === jobTitle);
}

export function getCandidatesByJobId(jobId) {
  return CANDIDATES.filter((candidate) => normalizeId(candidate.jobId) === normalizeId(jobId));
}

export async function fetchCandidateById(id) {
  const response = await apiFetch(endpoints.candidates.byId(id));
  const mapped = mapBackendCandidate(response, makeJobLookup());
  return upsertCandidate(mapped);
}

export async function updateCandidateStatus(candidateId, status) {
  requireCurrentPermission('change_candidate_status', 'change candidate status');
  const candidate = getCandidateById(candidateId);
  if (['accepted', 'rejected'].includes(candidate?.status)) {
    throw new Error('Accepted or rejected candidates cannot be changed.');
  }

  if (status === 'shortlist' || status === 'shortlisted') {
    if (!candidate) return true;
    patchLocalCandidateMetadata(candidate.id, {
      status: 'shortlist',
      statusValue: CandidateStatusEnum.SHORTLISTED,
    });
    candidate.status = 'shortlist';
    candidate.statusValue = CandidateStatusEnum.SHORTLISTED;
    upsertCandidate(candidate);
    return true;
  }

  const backendStatus = UI_STATUS_TO_BACKEND[status] || status;
  if (![CandidateStatusEnum.ACCEPTED, CandidateStatusEnum.REJECTED].includes(backendStatus)) {
    throw new Error('Unsupported candidate decision.');
  }

  await apiFetch(endpoints.candidates.updateStatus(candidateId), {
    method: 'PATCH',
    body: { input: { status: backendStatus } },
  });

  if (candidate) {
    candidate.status = CANDIDATE_STATUS_TO_UI[backendStatus] || 'pending';
    candidate.statusValue = backendStatus;
    patchLocalCandidateMetadata(candidate.id, {
      status: candidate.status,
      statusValue: backendStatus,
    });
    upsertCandidate(candidate);
  }

  if (getStoredToken()) {
    try {
      await loadBackendData();
    } catch (error) {
      console.warn('Candidate data saved, but refresh failed.', error);
    }
  }

  return true;
}

export async function uploadFile(modelName, file) {
  const formData = new FormData();
  formData.append('modelName', modelName);
  formData.append('file', file);
  const response = await apiFetch(endpoints.files.upload, {
    method: 'POST',
    body: formData,
  });
  return getFileUi(response);
}

function buildPublicApplicationFallback(jobId, companyId) {
  return setApplication({
    isPublicFallback: true,
    job: {
      id: normalizeId(jobId),
      companyId: normalizeId(companyId),
      title: 'Job Application',
      status: 'active',
      startDate: 'Not provided',
      startDateInput: '',
      endDate: 'Not provided',
      endDateInput: '',
      department: 'Not provided',
      seniority: 'Not provided',
      jobType: 'Not provided',
      location: 'Not provided',
      locationType: 'Not provided',
      description:
        'Complete your application details below. The hiring team will receive your submission.',
      skills: [],
      totalDuration: 0,
      mocksCount: 0,
      deadline: 'Not provided',
    },
    company: {
      id: normalizeId(companyId),
      name: 'the company',
      industry: 'Not provided',
      website: '',
      size: 'Not provided',
    },
    mocks: [],
  });
}

function encodeShareSnapshot(snapshot) {
  try {
    const json = JSON.stringify(snapshot);
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  } catch {
    return '';
  }
}

function decodeShareSnapshot(token) {
  try {
    if (!token) return null;
    const base64 = String(token).replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

function compactApplicationMock(jobMock) {
  const fullMock = getMockById(jobMock?.id);
  const durationMin = jobMock?.durationMin ?? fullMock?.durationMin ?? 10;
  const questions = fullMock?.questions || jobMock?.questions || [];

  return {
    id: normalizeId(jobMock?.id || fullMock?.id),
    name: jobMock?.name || fullMock?.title || 'Assessment',
    weight: jobMock?.weight ?? fullMock?.weight ?? 0,
    duration: jobMock?.duration || fullMock?.duration || `${durationMin} min`,
    durationMin,
    type: jobMock?.type || fullMock?.type || 'Technical',
    difficulty: jobMock?.difficulty || fullMock?.difficulty || 'Medium',
    description: fullMock?.description || jobMock?.description || '',
    questionsCount: questions.length || jobMock?.questionsCount || 0,
  };
}

function normalizeSnapshotStatus(status) {
  const value = String(status || '').toLowerCase();
  return ['active', 'scheduled', 'closed'].includes(value) ? value : 'active';
}

function jobFromShareSnapshot(snapshot, jobId, companyId) {
  if (!snapshot?.job || normalizeId(snapshot.job.id) !== normalizeId(jobId)) return null;

  const snapshotCompanyId = normalizeId(
    snapshot.job.companyId || snapshot.company?.id || companyId
  );
  const mocks = Array.isArray(snapshot.mocks) ? snapshot.mocks.map(compactApplicationMock) : [];

  return {
    id: normalizeId(snapshot.job.id),
    companyId: snapshotCompanyId,
    title: snapshot.job.title || 'Job Application',
    department: snapshot.job.department || 'Not provided',
    departments: snapshot.job.department ? [snapshot.job.department] : [],
    jobType: snapshot.job.jobType || 'Not provided',
    status: normalizeSnapshotStatus(snapshot.job.status),
    seniority: snapshot.job.seniority || 'Not provided',
    locationType: snapshot.job.locationType || 'Not provided',
    location: snapshot.job.location || 'Not provided',
    description:
      snapshot.job.description ||
      'Complete your application details below. The hiring team will receive your submission.',
    skills: Array.isArray(snapshot.job.skills) ? snapshot.job.skills : [],
    technologiesTags: Array.isArray(snapshot.job.skills) ? snapshot.job.skills : [],
    startDate: snapshot.job.startDate || 'Not provided',
    startDateInput: snapshot.job.startDateInput || '',
    endDate: snapshot.job.endDate || 'Not provided',
    endDateInput: snapshot.job.endDateInput || '',
    deadline: snapshot.job.deadline || snapshot.job.endDate || 'Not provided',
    mocks,
    raw: {
      company: snapshot.company || {},
    },
  };
}

export function getApplicationShareSearch(job) {
  if (!job?.id) return '';
  const companyId = normalizeId(job.companyId || COMPANY.id);
  const company = {
    id: companyId,
    name: COMPANY.name || job.raw?.company?.name || 'the company',
    industry: COMPANY.industry || job.raw?.company?.industry || 'Not provided',
    website: COMPANY.website || job.raw?.company?.website || '',
    size: COMPANY.size || job.raw?.company?.size || 'Not provided',
  };
  const snapshot = {
    v: 1,
    job: {
      id: normalizeId(job.id),
      companyId,
      title: job.title,
      status: job.status,
      startDate: job.startDate,
      startDateInput: job.startDateInput,
      endDate: job.endDate,
      endDateInput: job.endDateInput,
      deadline: job.endDate || job.deadline,
      department: job.department,
      seniority: job.seniority,
      jobType: job.jobType,
      location: job.location,
      locationType: job.locationType,
      description: job.description,
      skills: job.skills || job.technologiesTags || [],
    },
    company,
    mocks: (job.mocks || []).map(compactApplicationMock),
  };
  const token = encodeShareSnapshot(snapshot);
  return token ? `?j=${token}` : '';
}

export function getApplicationSharePath(job, suffix = '') {
  if (!job?.id) return '/jobs';
  const companyId = normalizeId(job.companyId || COMPANY.id);
  const base = companyId ? `/apply/${companyId}/${job.id}` : `/apply/${job.id}`;
  const path = suffix ? `${base}/${suffix.replace(/^\//, '')}` : base;
  return `${path}${getApplicationShareSearch(job)}`;
}

function unwrapJobEntity(payload) {
  const entity = unwrapEntity(payload);
  if (!entity || typeof entity !== 'object') return entity;

  if (entity.job && typeof entity.job === 'object') {
    const jobMocks =
      [
        entity.job.jobMocks,
        entity.job.mockJobs,
        entity.job.mocks,
        entity.jobMocks,
        entity.mockJobs,
        entity.mocks,
      ].find((items) => Array.isArray(items) && items.length) || [];

    return {
      ...entity.job,
      company: entity.job.company || entity.company,
      companyId: entity.job.companyId || entity.companyId || entity.company?.id,
      jobMocks,
    };
  }

  return entity;
}

async function fetchApplicationJob(jobId, token, companyId = '') {
  const response = await apiFetch(endpoints.jobs.byId(jobId), {}, token);
  const jobEntity = unwrapJobEntity(response);
  if (!jobEntity || typeof jobEntity !== 'object') return null;
  return mapBackendJob(
    {
      ...jobEntity,
      companyId: jobEntity.companyId || jobEntity.company?.id || companyId,
    },
    makeMockLookup()
  );
}

function getApplicationCompany(job, publicCompanyId) {
  const rawCompany = job?.raw?.company || job?.company || {};
  const id = normalizeId(job?.companyId || rawCompany?.id || publicCompanyId || COMPANY.id);
  const canUseWorkspaceCompany = Boolean(COMPANY.name) && (!id || normalizeId(COMPANY.id) === id);

  return {
    id,
    name:
      rawCompany.name ||
      job?.raw?.companyName ||
      (canUseWorkspaceCompany ? COMPANY.name : '') ||
      'the company',
    industry:
      rawCompany.industry || (canUseWorkspaceCompany ? COMPANY.industry : '') || 'Not provided',
    website: rawCompany.website || (canUseWorkspaceCompany ? COMPANY.website : '') || '',
    size:
      rawCompany.size ||
      rawCompany.companySize ||
      (canUseWorkspaceCompany ? COMPANY.size : '') ||
      'Not provided',
  };
}

export async function buildApplicationContext(jobId = JOBS[0]?.id, options = {}) {
  try {
    const publicCompanyId = normalizeId(options?.companyId);
    let job = getJobById(jobId);
    if (!job && jobId && options?.shareToken) {
      const snapshotJob = jobFromShareSnapshot(
        decodeShareSnapshot(options.shareToken),
        jobId,
        publicCompanyId
      );
      if (snapshotJob?.id) job = upsertJob(snapshotJob);
    }

    if (!job && jobId && getStoredToken()) {
      try {
        const privateJob = await fetchApplicationJob(jobId, undefined, publicCompanyId);
        if (privateJob?.id) job = upsertJob(privateJob);
      } catch (e) {
        console.error('Failed to fetch job for application', e);
      }
    }

    if (!job) {
      return publicCompanyId
        ? buildPublicApplicationFallback(jobId, publicCompanyId)
        : setApplication(null);
    }

    const mocks = (job.mocks || []).map((mock, index) => {
      const fullMock = getMockById(mock.id);
      const durationMin = mock.durationMin ?? fullMock?.durationMin ?? 10;
      return {
        id: normalizeId(mock.id),
        index,
        name: mock.name || fullMock?.title || '',
        weight: mock.weight ?? fullMock?.weight ?? 1,
        durationMin,
        duration: mock.duration || fullMock?.duration || `${durationMin} min`,
        type: fullMock?.type || mock.type || 'Technical',
        difficulty: fullMock?.difficulty || mock.difficulty || 'Medium',
        description: fullMock?.description || mock.description || '',
        topics: fullMock?.topics || mock.topics || [],
        questions: fullMock?.questions || mock.questions || [],
        questionsCount:
          fullMock?.questions?.length || mock.questionsCount || mock.questions?.length || 0,
        status: 'locked',
      };
    });

    if (mocks.length > 0) mocks[0].status = 'available';
    const applicationCompany = getApplicationCompany(job, publicCompanyId);

    return setApplication({
      job: {
        id: normalizeId(job.id),
        companyId: applicationCompany.id,
        title: job.title,
        status: job.status,
        startDate: job.startDate || 'Not provided',
        startDateInput: job.startDateInput || '',
        endDate: job.endDate || 'Not provided',
        endDateInput: job.endDateInput || '',
        department: job.department,
        seniority: job.seniority,
        jobType: job.jobType,
        location: job.location,
        locationType: job.locationType,
        description: job.description,
        skills: job.skills || job.technologiesTags || [],
        totalDuration: mocks.reduce((sum, mock) => sum + (mock.durationMin || 0), 0),
        mocksCount: mocks.length,
        deadline: job.endDate || 'Not provided',
      },
      company: applicationCompany,
      mocks,
    });
  } catch (e) {
    console.error('buildApplicationContext error', e);
    return setApplication(null);
  }
}

export function resetApplication(jobId) {
  resetCandidateInfo();
  return buildApplicationContext(jobId);
}

export async function saveCandidateInfo(data) {
  const next = setCandidateInfo(data);
  const companyId = APPLICATION?.company?.id || APPLICATION?.job?.companyId;
  const jobId = APPLICATION?.job?.id;

  if (!companyId || !jobId || !next.email) {
    return next;
  }

  let cvUrl = next.cvUrl;
  let backendCvUrl = next.cvUrl;
  if (next.resumeFile) {
    const file = await uploadFile('candidate', next.resumeFile);
    backendCvUrl = file.url || file.publicUrl;
    cvUrl = file.publicUrl || file.url;
  }

  const name =
    `${String(next.firstName || '').trim()} ${String(next.lastName || '').trim()}`.trim();
  const email = String(next.email || '').trim();

  const response = await apiFetch(
    endpoints.candidates.apply(companyId, jobId),
    {
      method: 'POST',
      body: {
        input: {
          name,
          email,
          cvUrl: backendCvUrl,
        },
      },
    },
    ''
  );

  const candidateEntity = unwrapEntity(response);
  if (candidateEntity && typeof candidateEntity === 'object') {
    const mapped = mapBackendCandidate(
      {
        ...candidateEntity,
        jobId: candidateEntity.jobId || jobId,
        companyId: candidateEntity.companyId || companyId,
        cvUrl: candidateEntity.cvUrl || backendCvUrl,
      },
      makeJobLookup()
    );

    if (mapped.id) {
      upsertCandidate(mapped);
      setCandidateInfo({ cvUrl, candidateId: mapped.id });
    }
  }

  if (getStoredToken()) {
    try {
      await loadBackendData();
    } catch (error) {
      console.warn('Candidate application saved, but workspace refresh failed.', error);
    }
  }

  setCandidateInfo({ cvUrl });
  return CANDIDATE_INFO;
}

export function completeMock(mockId) {
  if (!APPLICATION) return [];
  const idx = APPLICATION.mocks.findIndex((mock) => normalizeId(mock.id) === normalizeId(mockId));
  if (idx === -1) return APPLICATION.mocks;
  APPLICATION.mocks[idx].status = 'completed';
  if (idx + 1 < APPLICATION.mocks.length && APPLICATION.mocks[idx + 1].status === 'locked') {
    APPLICATION.mocks[idx + 1].status = 'available';
  }
  setApplication({ ...APPLICATION, mocks: [...APPLICATION.mocks] });
  return APPLICATION.mocks;
}

export function startMock(mockId) {
  if (!APPLICATION) return;
  const mock = APPLICATION.mocks.find((item) => normalizeId(item.id) === normalizeId(mockId));
  if (mock) {
    mock.status = 'in-progress';
    setApplication({ ...APPLICATION, mocks: [...APPLICATION.mocks] });
  }
}

export function allMocksCompleted() {
  return (
    Boolean(APPLICATION) && (APPLICATION.mocks || []).every((mock) => mock.status === 'completed')
  );
}

export function getApplicationMock(mockId) {
  return APPLICATION?.mocks?.find((mock) => normalizeId(mock.id) === normalizeId(mockId)) || null;
}

export function getCompletedCount() {
  return APPLICATION?.mocks?.filter((mock) => mock.status === 'completed').length || 0;
}

export function getMemberById(id) {
  return TEAM_MEMBERS.find((member) => normalizeId(member.id) === normalizeId(id)) || null;
}

export function getJoinRequestById(id) {
  return JOIN_REQUESTS.find((request) => normalizeId(request.id) === normalizeId(id)) || null;
}

export function getMemberActivities(memberId) {
  return ACTIVITY_LOG.filter(
    (activity) => normalizeId(activity.memberId) === normalizeId(memberId)
  ).sort((a, b) => b.id - a.id);
}

export async function removeMember(id) {
  requireCurrentPermission('remove_members', 'remove company members');
  const member = getMemberById(id);
  const removed = removeMemberStore(id);
  void apiFetch(endpoints.companies.removeFromCompany, {
    method: 'POST',
    body: { userId: id },
  })
    .then(() => optionalApi(null, () => loadBackendData()))
    .catch(() => {
      if (member) upsertMemberStore(member);
    });
  return removed;
}

export async function acceptJoinRequest(requestId, role = 'viewer') {
  requireCurrentPermission('accept_members', 'accept company members');
  const request = getJoinRequestById(requestId);
  if (!request) return null;

  const previousStatus = request.status;
  updateJoinRequestStore(requestId, { status: 'accepted' });
  const previousMember = request.userId ? getMemberById(request.userId) : null;
  const newMember = {
    id: request.userId || `local-member-${Date.now()}`,
    name: request.name,
    email: request.email,
    department: request.department || 'General',
    role,
    joinedDate: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    lastActivity: 'Just now',
    avatar: null,
  };
  const savedMember = upsertMemberStore(newMember);

  if (request.userId) {
    void apiFetch(endpoints.companies.replyJoinRequest, {
      method: 'POST',
      body: {
        input: {
          userId: request.userId,
          approved: true,
          type: UI_ROLE_TO_BACKEND[role] || CompanyUserTypeEnum.VIEWER,
        },
      },
    })
      .then(() => optionalApi(null, () => loadBackendData()))
      .catch(() => {
        updateJoinRequestStore(requestId, { status: previousStatus });
        if (previousMember) updateMemberStore(previousMember.id, previousMember);
        else removeMemberStore(newMember.id);
      });
  } else {
    void optionalApi(null, () => loadBackendData());
  }

  return savedMember;
}

export async function declineJoinRequest(requestId) {
  requireCurrentPermission('accept_members', 'decline company members');
  const request = getJoinRequestById(requestId);
  if (!request) return false;

  const previousStatus = request.status;
  updateJoinRequestStore(requestId, { status: 'declined' });

  if (request.userId) {
    void apiFetch(endpoints.companies.replyJoinRequest, {
      method: 'POST',
      body: { input: { userId: request.userId, approved: false } },
    })
      .then(() => optionalApi(null, () => loadBackendData()))
      .catch(() => {
        updateJoinRequestStore(requestId, { status: previousStatus });
      });
  } else {
    void optionalApi(null, () => loadBackendData());
  }

  return true;
}

export function updateJoinRequest(requestId, patch) {
  requireCurrentPermission('accept_members', 'update company requests');
  return updateJoinRequestStore(requestId, patch);
}

export async function updateCompany(form) {
  requireCurrentPermission('edit_company', 'edit company information');
  const input = formToBackendCompanyInput(form);
  const response = await apiFetch(endpoints.companies.update, {
    method: 'PATCH',
    body: input,
  });
  const saved = unwrapEntity(response);
  return updateCompanyStore({
    ...COMPANY,
    ...form,
    ...input,
    ...(saved && typeof saved === 'object' ? saved : {}),
  });
}

export function getPendingRequestsCount() {
  return JOIN_REQUESTS.filter((request) => request.status === 'pending').length;
}

export function generateInviteLink() {
  const companyId = COMPANY.id || ':companyId';
  return `${window.location.origin}/join/${companyId}`;
}

export async function changePassword(input) {
  return apiFetch(endpoints.users.changePassword, {
    method: 'PATCH',
    body: input,
  });
}

export async function editCurrentUser(input) {
  return apiFetch(endpoints.users.edit, {
    method: 'PATCH',
    body: input,
  });
}

export async function joinCompany(companyId, input = {}) {
  return apiFetch(endpoints.auth.joinRequest(companyId), {
    method: 'POST',
    body: { input },
  });
}

export const datastore = {
  get jobs() {
    return JOBS;
  },
  get mocks() {
    return MOCKS;
  },
  get candidates() {
    return CANDIDATES;
  },
  get roles() {
    return ROLES;
  },
  get company() {
    return COMPANY;
  },
  get currentUserId() {
    return CURRENT_USER_ID;
  },
  get teamMembers() {
    return TEAM_MEMBERS;
  },
  get activityLog() {
    return ACTIVITY_LOG;
  },
  get joinRequests() {
    return JOIN_REQUESTS;
  },
  get application() {
    return APPLICATION;
  },
  get candidateInfo() {
    return CANDIDATE_INFO;
  },
};

export const backendApi = Object.freeze({
  auth: {
    login,
    registerManager,
    requestVerificationCode,
    verifyEmail,
    resetPassword,
    logout,
    logoutAllDevices,
  },
  jobs: {
    list: () => JOBS,
    getById: getJobById,
    update: updateJob,
    create: addJob,
    remove: removeJob,
    duplicate: duplicateJob,
  },
  mocks: {
    list: () => MOCKS,
    getById: getMockById,
    getStatus: getMockStatus,
    getStatusByTitle: getMockStatusByTitle,
    getUsedInJobsCount,
    getJobsUsing: getJobsUsingMock,
    getCandidatesPerJob,
    update: updateMock,
    create: addMock,
    remove: removeMock,
    duplicate: duplicateMock,
  },
  candidates: {
    list: () => CANDIDATES,
    getById: getCandidateById,
    getBySlug: getCandidateBySlug,
    slugify: toSlug,
    getByJob: getCandidatesByJob,
    getByJobId: getCandidatesByJobId,
    updateStatus: updateCandidateStatus,
  },
  company: {
    get: () => COMPANY,
    roles: ROLES,
    hasPermission,
    currentRole: getCurrentUserRole,
    canCurrentUser,
    currentUserId: CURRENT_USER_ID,
    teamMembers: () => TEAM_MEMBERS,
    activityLog: () => ACTIVITY_LOG,
    joinRequests: () => JOIN_REQUESTS,
    getMemberById,
    getJoinRequestById,
    removeMember,
    getMemberActivities,
    acceptJoinRequest,
    declineJoinRequest,
    updateJoinRequest,
    updateCompany,
    getPendingRequestsCount,
    generateInviteLink,
  },
  application: {
    get: () => APPLICATION,
    buildContext: buildApplicationContext,
    reset: resetApplication,
    candidateInfo: () => CANDIDATE_INFO,
    saveCandidateInfo,
    completeMock,
    startMock,
    allMocksCompleted,
    getApplicationMock,
    getCompletedCount,
    assessmentRules: ASSESSMENT_RULES,
    sampleConversation: SAMPLE_CONVERSATION,
  },
  config: {
    jobStepsCreate: JOB_STEPS_CREATE,
    jobStepsEdit: JOB_STEPS_EDIT,
    jobTypeOptions: JOB_TYPE_OPTIONS,
    seniorityOptions: SENIORITY_OPTIONS,
    locationTypeOptions: LOCATION_TYPE_OPTIONS,
    departmentOptions: DEPARTMENT_OPTIONS,
    mockLibrary: MOCK_LIBRARY,
    emailTriggers: EMAIL_TRIGGERS,
    initialJobForm: INITIAL_JOB_FORM,
    parseDurationMin,
    mockStepsCreate: MOCK_STEPS_CREATE,
    mockStepsEdit: MOCK_STEPS_EDIT,
    mockTypeOptions: MOCK_TYPE_OPTIONS,
    difficultyOptions: DIFFICULTY_OPTIONS,
    durationOptions: DURATION_OPTIONS,
    initialMockForm: INITIAL_MOCK_FORM,
  },
  datastore,
});

export const localApi = backendApi;
export const fakeApi = backendApi;
export const fakeApiMeta = Object.freeze({
  mode: 'backend',
  baseUrl: 'configured by VITE_API_BASE_URL or the Vite /api proxy',
});

export {
  ACTIVITY_LOG,
  APPLICATION,
  ASSESSMENT_RULES,
  CANDIDATE_INFO,
  CANDIDATES,
  COMPANY,
  CURRENT_USER_ID,
  DEPARTMENT_OPTIONS,
  DIFFICULTY_OPTIONS,
  DURATION_OPTIONS,
  EMAIL_TRIGGERS,
  INDUSTRY_OPTIONS,
  INITIAL_JOB_FORM,
  INITIAL_MOCK_FORM,
  JOBS,
  JOB_STEPS_CREATE,
  JOB_STEPS_EDIT,
  JOB_TYPE_OPTIONS,
  JOIN_REQUESTS,
  LOCATION_TYPE_OPTIONS,
  MOCKS,
  MOCK_LIBRARY,
  MOCK_STEPS_CREATE,
  MOCK_STEPS_EDIT,
  MOCK_TYPE_OPTIONS,
  ROLES,
  SAMPLE_CONVERSATION,
  SENIORITY_OPTIONS,
  TEAM_MEMBERS,
  getDatastoreSnapshot,
  getJobForm,
  getMockForm,
  hasPermission,
  parseDurationMin,
};
