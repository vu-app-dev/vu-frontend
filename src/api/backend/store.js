// This file manages the in-memory data store for the application, including jobs, mocks, candidates, company info, and user data.
// It provides functions to update the store and notifies subscribers of changes.
// It also handles join requests using localStorage.

import {
  candidateMetadataKey,
  getLocalEntityMetadata,
  getLocalJoinRequests,
  getStoredCandidateInfo,
  setLocalJoinRequests,
  setStoredCandidateInfo,
} from './storage';
import {
  CompanyIndustryEnum,
  CompanyUserTypeEnum,
  DifficultyEnum,
  JobTypeEnum,
  MockTypeEnum,
  enrichJobWithCandidates,
  fileEntityToUi,
  jobToForm,
  mapBackendCandidate,
  mapBackendCompany,
  mapBackendCompanyUsers,
  mapBackendJoinRequest,
  mapBackendJob,
  mapBackendMock,
  // mapBackendUserToMember,
  mockToForm,
  normalizeId,
} from './mappers';

const DEFAULT_CANDIDATE_INFO = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  resumeFile: null,
  resumeName: '',
  cvUrl: '',
  submittedAt: null,
  candidateId: '',
};

const listeners = new Set();
let version = 0;

function notify() {
  version += 1;
  listeners.forEach((listener) => listener(version));
}

function replaceArray(target, nextItems) {
  target.splice(0, target.length, ...nextItems);
}

function replaceObject(target, nextValue) {
  Object.keys(target).forEach((key) => delete target[key]);
  Object.assign(target, nextValue);
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function numberOr(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function topicName(topic) {
  if (typeof topic === 'string') return topic.trim();
  if (!topic || typeof topic !== 'object') return '';
  return String(topic.name || topic.title || topic.label || '').trim();
}

function normalizeStoredTopics(topics, mockId) {
  return safeArray(topics)
    .map((topic, index) => ({
      id: normalizeId(topic?.id || `${mockId}-t-${index + 1}`),
      name: topicName(topic),
      weight: numberOr(topic?.weight, 0),
      raw: topic?.raw || topic,
    }))
    .filter((topic) => topic.name);
}

function normalizeStoredQuestions(questions, mock) {
  const existingById = new Map(
    safeArray(mock.questions).map((question) => [normalizeId(question.id), question])
  );
  const existingByTitle = new Map(
    safeArray(mock.questions).map((question) => [
      String(question.title || '')
        .trim()
        .toLowerCase(),
      question,
    ])
  );

  return safeArray(questions).map((question, index) => {
    const title = String(question?.title || '').trim();
    const existing =
      existingById.get(normalizeId(question?.id)) ||
      existingByTitle.get(title.toLowerCase()) ||
      safeArray(mock.questions)[index] ||
      {};

    return {
      ...existing,
      id: normalizeId(existing.id || question?.id || `${mock.id}-q-${index + 1}`),
      title: title || existing.title || `Question ${index + 1}`,
      description: question?.description ?? existing.description ?? '',
      difficulty: String(question?.difficulty || existing.difficulty || 'medium').toLowerCase(),
      difficultyValue:
        question?.difficultyValue ||
        existing.difficultyValue ||
        String(question?.difficulty || existing.difficulty || 'MEDIUM').toUpperCase(),
      estimatedTime: question?.estimatedTime || existing.estimatedTime || '5 minutes',
      estimatedTimeMin: numberOr(
        question?.estimatedTimeMin,
        numberOr(existing.estimatedTimeMin, 5)
      ),
      estimatedTimeInMinutes: numberOr(
        question?.estimatedTimeInMinutes,
        numberOr(existing.estimatedTimeInMinutes, numberOr(question?.estimatedTimeMin, 5))
      ),
      answerType: question?.answerType || existing.answerType,
      correctAnswer: question?.correctAnswer || existing.correctAnswer || '',
      weight: numberOr(question?.weight, numberOr(existing.weight, 0)),
      order: question?.order || existing.order || index + 1,
      raw: existing.raw || question?.raw || question,
    };
  });
}

function applyMockMetadata(mock, metadata = {}) {
  if (!mock) return mock;
  const storedTopics = normalizeStoredTopics(metadata.topics, mock.id);
  const storedQuestions = normalizeStoredQuestions(metadata.questions, mock);

  return {
    ...mock,
    topics: storedTopics.length ? storedTopics : safeArray(mock.topics),
    questions: storedQuestions.length ? storedQuestions : safeArray(mock.questions),
  };
}

function applyJobMetadata(job, metadata = {}) {
  if (!job) return job;
  const mockWeights = metadata.mockWeights || {};
  const mocks = safeArray(job.mocks).map((mock) => {
    const storedWeight =
      mockWeights[normalizeId(mock.id)] ?? mockWeights[normalizeId(mock.jobMockId)];
    return storedWeight == null ? mock : { ...mock, weight: numberOr(storedWeight, mock.weight) };
  });
  const skills = safeArray(job.skills).length
    ? safeArray(job.skills)
    : safeArray(job.technologiesTags);

  return {
    ...job,
    seniority: metadata.seniority ?? job.seniority ?? '',
    locationType: metadata.locationType ?? job.locationType ?? '',
    location: metadata.location ?? job.location ?? '',
    maxCandidates: metadata.maxCandidates ?? job.maxCandidates ?? '',
    skills,
    mocks,
  };
}

function applyCandidateMetadata(candidate, metadataMap = {}) {
  if (!candidate) return candidate;
  const metadata =
    metadataMap[normalizeId(candidate.id)] ||
    metadataMap[candidateMetadataKey(candidate.jobId, candidate.email)] ||
    {};

  return {
    ...candidate,
    status: metadata.status || candidate.status,
    statusValue: metadata.statusValue || candidate.statusValue,
  };
}

function option(value, label = value) {
  return { value, label };
}

export function subscribeStore(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getStoreVersion() {
  return version;
}

export const ROLES = {
  owner: {
    label: 'Owner',
    permissions: [
      'view_jobs',
      'view_mocks',
      'view_candidates',
      'create_jobs',
      'edit_jobs',
      'create_mocks',
      'edit_mocks',
      'review_candidates',
      'change_candidate_status',
      'accept_members',
      'edit_company',
      'remove_members',
    ],
  },
  editor: {
    label: 'Editor',
    permissions: [
      'view_jobs',
      'view_mocks',
      'view_candidates',
      'create_jobs',
      'edit_jobs',
      'create_mocks',
      'edit_mocks',
      'review_candidates',
      'change_candidate_status',
    ],
  },
  viewer: {
    label: 'Viewer',
    permissions: ['view_jobs', 'view_mocks', 'view_candidates'],
  },
};

export const JOBS = [];
export const MOCKS = [];
export const CANDIDATES = [];
export const COMPANY = {};
export const TEAM_MEMBERS = [];
export const ACTIVITY_LOG = [];
export const JOIN_REQUESTS = getLocalJoinRequests();
export let CURRENT_USER_ID = null;
export let CURRENT_USER = null;
export let APPLICATION = null;
export let CANDIDATE_INFO = {
  ...DEFAULT_CANDIDATE_INFO,
  ...getStoredCandidateInfo(),
  resumeFile: null,
};

export const JOB_STEPS_CREATE = [
  { label: 'Job Info' },
  { label: 'Add Mocks' },
  { label: 'Scheduling' },
  { label: 'Review & Publish' },
];

export const JOB_STEPS_EDIT = [
  { label: 'Job Info' },
  { label: 'Add Mocks' },
  { label: 'Scheduling' },
  { label: 'Review & Save' },
];

export const JOB_TYPE_OPTIONS = [
  option(JobTypeEnum.FULL_TIME, 'Full-time'),
  option(JobTypeEnum.PART_TIME, 'Part-time'),
  option(JobTypeEnum.CONTRACT, 'Contract'),
  option(JobTypeEnum.INTERNSHIP, 'Internship'),
  option(JobTypeEnum.FREELANCING, 'Freelancing'),
];

export const SENIORITY_OPTIONS = [
  option('junior', 'Junior'),
  option('mid', 'Mid'),
  option('senior', 'Senior'),
  option('lead', 'Lead'),
  option('manager', 'Manager'),
];

export const LOCATION_TYPE_OPTIONS = [
  option('on-site', 'On-site'),
  option('remote', 'Remote'),
  option('hybrid', 'Hybrid'),
];

export const DEPARTMENT_OPTIONS = [
  option('Engineering'),
  option('Design'),
  option('Product'),
  option('Data'),
  option('Human Resources'),
  option('Operations'),
];

export const MOCK_LIBRARY = [];

export const EMAIL_TRIGGERS = [
  {
    id: 'on-apply',
    title: 'On Application',
    desc: 'Send a confirmation email when a candidate applies',
  },
  {
    id: 'on-shortlist',
    title: 'On Shortlist',
    desc: 'Notify the candidate when moved to shortlist',
  },
  { id: 'on-reject', title: 'On Rejection', desc: 'Send a rejection email to declined candidates' },
];

export const INITIAL_JOB_FORM = {
  title: '',
  department: '',
  jobType: '',
  seniority: '',
  description: '',
  technologies: [],
  locationType: '',
  location: '',
  mocks: [],
  emails: { 'on-apply': false, 'on-shortlist': false, 'on-reject': false },
  scheduleMode: 'active',
  startDate: '',
  endDate: '',
  maxCandidates: '',
};

export const MOCK_STEPS_CREATE = [
  { label: 'Mock Info' },
  { label: 'Evaluation' },
  { label: 'Review & Publish' },
];

export const MOCK_STEPS_EDIT = [
  { label: 'Mock Info' },
  { label: 'Evaluation' },
  { label: 'Review & Save' },
];

export const MOCK_TYPE_OPTIONS = [
  option(MockTypeEnum.TECHNICAL, 'Technical'),
  option(MockTypeEnum.BEHAVIORAL, 'Behavioral'),
  option(MockTypeEnum.CODING, 'Coding'),
];

export const DIFFICULTY_OPTIONS = [
  option(DifficultyEnum.EASY, 'Easy'),
  option(DifficultyEnum.MEDIUM, 'Medium'),
  option(DifficultyEnum.HARD, 'Hard'),
];

export const DURATION_OPTIONS = [
  option('15', '15 min'),
  option('20', '20 min'),
  option('25', '25 min'),
  option('30', '30 min'),
  option('35', '35 min'),
  option('40', '40 min'),
  option('45', '45 min'),
  option('50', '50 min'),
  option('60', '60 min'),
  option('90', '90 min'),
];

export const INDUSTRY_OPTIONS = Object.values(CompanyIndustryEnum).map((industry) =>
  option(industry)
);

export const INITIAL_MOCK_FORM = {
  title: '',
  type: '',
  difficulty: '',
  durationMin: '',
  description: '',
  technologies: [],
  topics: [],
  questions: [],
  enableFollowUpQuestions: true,
  enableRecordReplay: true,
};

export const ASSESSMENT_RULES = [
  'Once you start an assessment, the timer will begin immediately',
  'You cannot pause or restart an assessment once started',
  'Do not close or refresh the browser tab during an assessment',
  'Ensure your camera and microphone are enabled if required',
  'Your screen activity may be monitored for integrity purposes',
  'Complete all assessments to submit your application',
];

export const SAMPLE_CONVERSATION = [
  {
    id: 1,
    role: 'ai',
    message:
      "Welcome to the assessment. I'm your AI interviewer. Please introduce yourself and tell me about your relevant experience.",
    timestamp: '0:00',
  },
  {
    id: 2,
    role: 'candidate',
    message: '',
    timestamp: null,
    placeholder: 'Type your response here...',
  },
];

export function parseDurationMin(str) {
  const match = String(str).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function hasPermission(role, permission) {
  return ROLES[role]?.permissions.includes(permission) ?? false;
}

function syncMockLibrary() {
  replaceArray(
    MOCK_LIBRARY,
    MOCKS.map((mock) => ({
      id: mock.id,
      name: mock.title,
      type: mock.type,
      difficulty: mock.difficulty,
      duration: mock.duration,
      durationMin: mock.durationMin,
      technologies: Array.isArray(mock.technologies) ? mock.technologies.slice(0, 3) : [],
    }))
  );
}

function syncDepartmentOptions() {
  const departments = [
    ...new Set(
      JOBS.flatMap((job) => job.departments || [])
        .concat(COMPANY.departments || [])
        .filter(Boolean)
    ),
  ].sort();

  if (!departments.length) return;
  replaceArray(
    DEPARTMENT_OPTIONS,
    departments.map((department) => option(department))
  );
}

export function setBackendData({
  user,
  company,
  companyUser,
  companyUsers = [],
  joinRequests = [],
  jobs = [],
  mocks = [],
  candidates = [],
}) {
  const localMetadata = getLocalEntityMetadata();
  const companyId = normalizeId(company?.id || companyUser?.companyId || companyUser?.company?.id);
  const mappedMocks = mocks
    .map(mapBackendMock)
    .map((mock) => applyMockMetadata(mock, localMetadata.mocks[normalizeId(mock.id)]));
  const mockLookup = new Map(mappedMocks.map((mock) => [normalizeId(mock.id), mock]));
  const mappedJobsBase = jobs
    .map((job) =>
      mapBackendJob(
        {
          ...job,
          companyId: job?.companyId || job?.company?.id || companyId,
        },
        mockLookup
      )
    )
    .map((job) => applyJobMetadata(job, localMetadata.jobs[normalizeId(job.id)]));
  const jobLookup = new Map(mappedJobsBase.map((job) => [normalizeId(job.id), job]));
  const mappedCandidates = candidates
    .map((candidate) => mapBackendCandidate(candidate, jobLookup))
    .map((candidate) => applyCandidateMetadata(candidate, localMetadata.candidates));
  const mappedJobs = mappedJobsBase.map((job) => enrichJobWithCandidates(job, mappedCandidates));

  replaceArray(MOCKS, mappedMocks);
  replaceArray(CANDIDATES, mappedCandidates);
  replaceArray(JOBS, mappedJobs);
  replaceObject(COMPANY, mapBackendCompany(company || companyUser?.company || companyUser, JOBS));
  replaceArray(
    TEAM_MEMBERS,
    mapBackendCompanyUsers(
      safeArray(companyUsers).length ? companyUsers : companyUser?.companyUsers || [],
      user
    )
  );
  replaceArray(JOIN_REQUESTS, safeArray(joinRequests).map(mapBackendJoinRequest));
  setLocalJoinRequests(JOIN_REQUESTS);

  CURRENT_USER = user || null;
  CURRENT_USER_ID = normalizeId(user?.id || user?.userId || user?._id) || null;

  syncMockLibrary();
  syncDepartmentOptions();
  notify();
}

export function clearCurrentUserStore() {
  CURRENT_USER = null;
  CURRENT_USER_ID = null;
  notify();
}

export function upsertJob(job) {
  const localMetadata = getLocalEntityMetadata();
  const nextJob = applyJobMetadata(job, localMetadata.jobs[normalizeId(job.id)]);
  const idx = JOBS.findIndex((item) => normalizeId(item.id) === normalizeId(nextJob.id));
  if (idx >= 0) JOBS[idx] = nextJob;
  else JOBS.unshift(nextJob);
  syncDepartmentOptions();
  notify();
  return nextJob;
}

export function upsertMock(mock) {
  const localMetadata = getLocalEntityMetadata();
  const nextMock = applyMockMetadata(mock, localMetadata.mocks[normalizeId(mock.id)]);
  const idx = MOCKS.findIndex((item) => normalizeId(item.id) === normalizeId(nextMock.id));
  if (idx >= 0) MOCKS[idx] = nextMock;
  else MOCKS.unshift(nextMock);
  syncMockLibrary();
  notify();
  return nextMock;
}

export function upsertCandidate(candidate) {
  const localMetadata = getLocalEntityMetadata();
  const nextCandidate = applyCandidateMetadata(candidate, localMetadata.candidates);
  const idx = CANDIDATES.findIndex(
    (item) => normalizeId(item.id) === normalizeId(nextCandidate.id)
  );
  if (idx >= 0) CANDIDATES[idx] = nextCandidate;
  else CANDIDATES.unshift(nextCandidate);
  notify();
  return nextCandidate;
}

export function removeJobFromStore(id) {
  const idx = JOBS.findIndex((job) => normalizeId(job.id) === normalizeId(id));
  if (idx >= 0) JOBS.splice(idx, 1);
  notify();
}

export function removeMockFromStore(id) {
  const idx = MOCKS.findIndex((mock) => normalizeId(mock.id) === normalizeId(id));
  if (idx >= 0) MOCKS.splice(idx, 1);
  syncMockLibrary();
  notify();
}

export function updateCompanyStore(patch) {
  Object.assign(COMPANY, patch);
  notify();
  return COMPANY;
}

export function updateMemberStore(memberId, patch) {
  const idx = TEAM_MEMBERS.findIndex((member) => normalizeId(member.id) === normalizeId(memberId));
  if (idx === -1) return null;
  TEAM_MEMBERS[idx] = { ...TEAM_MEMBERS[idx], ...patch };
  notify();
  return TEAM_MEMBERS[idx];
}

export function upsertMemberStore(member) {
  const idx = TEAM_MEMBERS.findIndex((item) => normalizeId(item.id) === normalizeId(member.id));
  if (idx >= 0) {
    TEAM_MEMBERS[idx] = { ...TEAM_MEMBERS[idx], ...member };
  } else {
    TEAM_MEMBERS.unshift(member);
  }
  notify();
  return TEAM_MEMBERS[idx >= 0 ? idx : 0];
}

export function removeMemberStore(memberId) {
  const idx = TEAM_MEMBERS.findIndex((member) => normalizeId(member.id) === normalizeId(memberId));
  if (idx === -1) return false;
  TEAM_MEMBERS.splice(idx, 1);
  notify();
  return true;
}

export function setCandidateInfo(data) {
  CANDIDATE_INFO = {
    ...CANDIDATE_INFO,
    ...data,
    resumeFile: data.resumeFile || null,
    submittedAt: data.submittedAt || CANDIDATE_INFO.submittedAt || new Date().toISOString(),
  };

  const { resumeFile: _resumeFile, ...persisted } = CANDIDATE_INFO;
  setStoredCandidateInfo(persisted);
  notify();
  return CANDIDATE_INFO;
}

export function resetCandidateInfo() {
  CANDIDATE_INFO = { ...DEFAULT_CANDIDATE_INFO };
  setStoredCandidateInfo(CANDIDATE_INFO);
  notify();
}

export function setApplication(application) {
  APPLICATION = application;
  notify();
  return APPLICATION;
}

export function getJobForm(job) {
  return jobToForm(job);
}

export function getMockForm(mock) {
  return mockToForm(mock);
}

export function persistJoinRequests() {
  setLocalJoinRequests(JOIN_REQUESTS);
}

export function updateJoinRequestStore(requestId, patch) {
  const idx = JOIN_REQUESTS.findIndex(
    (request) => normalizeId(request.id) === normalizeId(requestId)
  );
  if (idx === -1) return null;
  JOIN_REQUESTS[idx] = { ...JOIN_REQUESTS[idx], ...patch };
  setLocalJoinRequests(JOIN_REQUESTS);
  notify();
  return JOIN_REQUESTS[idx];
}

export function getFileUi(file) {
  return fileEntityToUi(file);
}

export function getDatastoreSnapshot() {
  return {
    jobs: JOBS,
    mocks: MOCKS,
    candidates: CANDIDATES,
    roles: ROLES,
    company: COMPANY,
    currentUser: CURRENT_USER,
    currentUserId: CURRENT_USER_ID,
    teamMembers: TEAM_MEMBERS,
    activityLog: ACTIVITY_LOG,
    joinRequests: JOIN_REQUESTS,
    application: APPLICATION,
    candidateInfo: CANDIDATE_INFO,
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
      mockStepsCreate: MOCK_STEPS_CREATE,
      mockStepsEdit: MOCK_STEPS_EDIT,
      mockTypeOptions: MOCK_TYPE_OPTIONS,
      difficultyOptions: DIFFICULTY_OPTIONS,
      durationOptions: DURATION_OPTIONS,
      industryOptions: INDUSTRY_OPTIONS,
      initialMockForm: INITIAL_MOCK_FORM,
    },
  };
}
