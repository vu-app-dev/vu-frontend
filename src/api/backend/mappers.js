// This module provides functions to map backend data structures to frontend-friendly formats and vice versa.
// from backend to ui, and from ui to backend

import { publicFileUrl } from './client';

const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});
const SHORT_DATE_FORMAT = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
const DAY_MS = 24 * 60 * 60 * 1000;

export const UserTypeEnum = Object.freeze({
  COMPANY_USER: 'COMPANY_USER',
  ADMIN: 'ADMIN',
  USER: 'USER',
});
export const CompanyUserTypeEnum = Object.freeze({
  OWNER: 'OWNER',
  VIEWER: 'VIEWER',
  EDITOR: 'EDITOR',
});
export const CompanyIndustryEnum = Object.freeze({
  TECH: 'Tech',
  FINANCE: 'Finance',
  EDUCATION: 'Education',
  HEALTHCARE: 'Healthcare',
  MARKETING: 'Marketing',
  RETAIL: 'Retail',
  MANUFACTURING: 'Manufacturing',
  ENTERTAINMENT: 'Entertainment',
  OTHER: 'Other',
});
export const JobTypeEnum = Object.freeze({
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  INTERNSHIP: 'INTERNSHIP',
  FREELANCING: 'FREELANCING',
  CONTRACT: 'CONTRACT',
});
export const JobStatusEnum = Object.freeze({
  ACTIVE: 'ACTIVE',
  SCHEDULED: 'SCHEDULED',
  CLOSED: 'CLOSED',
});
export const DifficultyEnum = Object.freeze({ EASY: 'EASY', MEDIUM: 'MEDIUM', HARD: 'HARD' });
export const MockTypeEnum = Object.freeze({
  BEHAVIORAL: 'BEHAVIORAL',
  TECHNICAL: 'TECHNICAL',
  CODING: 'CODING',
});
export const AnswerTypeEnum = Object.freeze({
  CHOICE: 'CHOICE',
  FREE_TEXT: 'FREE_TEXT',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
});
export const CandidateStatusEnum = Object.freeze({
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  SHORTLISTED: 'Shortlisted',
  PENDING: 'Pending',
});
export const CandidateCheatEnum = Object.freeze({
  CLEAN: 'Clean',
  FLAGGED: 'Flagged',
  CRITICAL: 'Critical',
});
export const SortDirectionEnum = Object.freeze({ ASC: 'ASC', DESC: 'DESC' });
export const FileModelNameEnum = Object.freeze({
  USER: 'user',
  COMPANY: 'company',
  CANDIDATE: 'candidate',
});

export const JOB_TYPE_LABELS = Object.freeze({
  [JobTypeEnum.FULL_TIME]: 'Full-time',
  [JobTypeEnum.PART_TIME]: 'Part-time',
  [JobTypeEnum.INTERNSHIP]: 'Internship',
  [JobTypeEnum.FREELANCING]: 'Freelancing',
  [JobTypeEnum.CONTRACT]: 'Contract',
});

export const JOB_STATUS_TO_UI = Object.freeze({
  [JobStatusEnum.ACTIVE]: 'active',
  [JobStatusEnum.SCHEDULED]: 'scheduled',
  [JobStatusEnum.CLOSED]: 'closed',
});

export const UI_JOB_STATUS_TO_BACKEND = Object.freeze({
  active: JobStatusEnum.ACTIVE,
  scheduled: JobStatusEnum.SCHEDULED,
});

export const DIFFICULTY_LABELS = Object.freeze({
  [DifficultyEnum.EASY]: 'Easy',
  [DifficultyEnum.MEDIUM]: 'Medium',
  [DifficultyEnum.HARD]: 'Hard',
});

export const MOCK_TYPE_LABELS = Object.freeze({
  [MockTypeEnum.BEHAVIORAL]: 'Behavioral',
  [MockTypeEnum.TECHNICAL]: 'Technical',
  [MockTypeEnum.CODING]: 'Coding',
});

export const CANDIDATE_STATUS_TO_UI = Object.freeze({
  [CandidateStatusEnum.ACCEPTED]: 'accepted',
  [CandidateStatusEnum.REJECTED]: 'rejected',
  [CandidateStatusEnum.SHORTLISTED]: 'shortlist',
  [CandidateStatusEnum.PENDING]: 'pending',
});

export const UI_STATUS_TO_BACKEND = Object.freeze({
  accept: CandidateStatusEnum.ACCEPTED,
  accepted: CandidateStatusEnum.ACCEPTED,
  reject: CandidateStatusEnum.REJECTED,
  rejected: CandidateStatusEnum.REJECTED,
  shortlisted: CandidateStatusEnum.SHORTLISTED,
  shortlist: CandidateStatusEnum.SHORTLISTED,
  pending: CandidateStatusEnum.PENDING,
});

export const FINAL_CANDIDATE_STATUS_TO_BACKEND = Object.freeze({
  accepted: CandidateStatusEnum.ACCEPTED,
  reject: CandidateStatusEnum.REJECTED,
  rejected: CandidateStatusEnum.REJECTED,
});

export const CANDIDATE_CHEAT_TO_UI = Object.freeze({
  [CandidateCheatEnum.CLEAN]: 'clean',
  [CandidateCheatEnum.FLAGGED]: 'flagged',
  [CandidateCheatEnum.CRITICAL]: 'critical',
});

export const ROLE_TO_UI = Object.freeze({
  [CompanyUserTypeEnum.OWNER]: 'owner',
  [CompanyUserTypeEnum.EDITOR]: 'editor',
  [CompanyUserTypeEnum.VIEWER]: 'viewer',
});

export const UI_ROLE_TO_BACKEND = Object.freeze({
  owner: CompanyUserTypeEnum.OWNER,
  editor: CompanyUserTypeEnum.EDITOR,
  viewer: CompanyUserTypeEnum.VIEWER,
});

//Backend IDs may arrive as: numbers, strings, UUIDs
export function normalizeId(id) {
  return id == null ? '' : String(id);
}

// handle dates
export function formatDate(dateValue, fallback = 'Not available') {
  if (!dateValue) return fallback;
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? fallback : DATE_FORMAT.format(date);
}

function formatShortDate(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? '' : SHORT_DATE_FORMAT.format(date);
}

function dateInputToTimestamp(dateValue) {
  if (!dateValue) return null;
  const date = new Date(`${dateValue}T09:00:00`);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function dateInputToEndTimestamp(dateValue) {
  if (!dateValue) return null;
  const date = new Date(`${dateValue}T23:59:59`);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function toTimestamp(dateValue) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function startOfTodayTimestamp() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

function toDateInput(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

// handle text transformations from "FULL_TIME" to "Full Time"
function titleCase(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// [' React ', '', 'React'] => ['React']
function uniqueCompact(values) {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}

// React, JS; CSS -> ['React', 'JS', 'CSS']
function splitRequirementTags(requirements) {
  return uniqueCompact(String(requirements || '').split(/[,;\n]/)).slice(0, 10);
}

function clampText(value, maxLength = 255) {
  const text = String(value || '').trim();
  return text.length > maxLength ? text.slice(0, maxLength) : text;
}

function requireText(value, label, min = 1, max = 255) {
  const text = clampText(value, max);
  if (text.length < min) throw new Error(`${label} must be at least ${min} characters.`);
  return text;
}

function parseMinutes(value, fallback = 5) {
  const parsed = Number(String(value || '').match(/\d+/)?.[0] ?? value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : fallback;
}

function average(values) {
  const nums = values.map(Number).filter(Number.isFinite);
  return nums.length ? Math.round(nums.reduce((sum, value) => sum + value, 0) / nums.length) : 0;
}

function daysSince(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return 0;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / DAY_MS));
}

function formatRemainingDuration(status, startDate, endDate) {
  if (status === JobStatusEnum.CLOSED) return 'Closed';
  const target = status === JobStatusEnum.SCHEDULED ? new Date(startDate) : new Date(endDate);
  if (Number.isNaN(target.getTime())) return '0d 0h';
  const diffMs = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diffMs / DAY_MS);
  const hours = Math.floor((diffMs / (60 * 60 * 1000)) % 24);
  return `${days}d ${hours}h`;
}

function buildTrend(candidates) {
  const buckets = new Map();
  candidates.forEach((candidate) => {
    const label = formatShortDate(candidate.createdAt || candidate.raw?.createdAt);
    if (label) buckets.set(label, (buckets.get(label) || 0) + 1);
  });
  return [...buckets.entries()].map(([label, value]) => ({ label, value })).slice(-14);
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null || value === '') return [];
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeTopicName(topic) {
  if (typeof topic === 'string') return topic.trim();
  if (!topic || typeof topic !== 'object') return '';
  return String(topic.name || topic.title || topic.label || '').trim();
}

function numericWeight(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// Transforms raw backend mock into UI-ready object. Handles missing fields, renames properties, formats dates, and computes derived values for easier consumption in the frontend.
export function mapBackendMock(mock) {
  const id = normalizeId(mock?.id);
  const questions = [...(mock?.questions || [])]
    .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
    .map((question, index, source) => ({
      id: normalizeId(question.id || `${id}-q-${index + 1}`),
      title: question.title || `Question ${index + 1}`,
      description: question.description || '',
      difficulty: String(question.difficulty || DifficultyEnum.MEDIUM).toLowerCase(),
      difficultyValue: question.difficulty || DifficultyEnum.MEDIUM,
      estimatedTime: `${question.estimatedTimeInMinutes || 5} minutes`,
      estimatedTimeMin: question.estimatedTimeInMinutes || 5,
      order: question.order || index + 1,
      // Waiting Eyad to add weight
      weight: source.length ? Math.round(100 / source.length) : 0,
      answerType: question.answerType || AnswerTypeEnum.FREE_TEXT,
      correctAnswer: question.correctAnswer || '',
      raw: question,
    }));

  const technologies = normalizeArray(mock?.technologies).map(normalizeTopicName).filter(Boolean);
  const topicNames = normalizeArray(mock?.topics).map(normalizeTopicName).filter(Boolean);
  // Waiting Eyad to add weight (backend)
  const topics = topicNames.map((topic, index) => ({
    id: `${id}-t-${index + 1}`,
    name: topic,
    weight: 0,
    raw: topic,
  }));
  const durationMin = Number(mock?.estimatedTimeInMinutes || 0);

  return {
    id,
    companyId: normalizeId(mock?.companyId),
    title: mock?.title || 'Untitled mock',
    type: MOCK_TYPE_LABELS[mock?.type] || titleCase(mock?.type || MockTypeEnum.TECHNICAL),
    typeValue: mock?.type || MockTypeEnum.TECHNICAL,
    difficulty:
      DIFFICULTY_LABELS[mock?.difficulty] || titleCase(mock?.difficulty || DifficultyEnum.MEDIUM),
    difficultyValue: mock?.difficulty || DifficultyEnum.MEDIUM,
    duration: `${durationMin} min`,
    durationMin,
    description: mock?.description || '',
    technologies,
    topics,
    questions,
    avgScore: Math.round(Number(mock?.avgScore || 0)), // unimplemented in backend
    totalSessions: Math.round(Number(mock?.totalSessions || 0)), // unimplemented in backend
    passRate: Math.round(Number(mock?.passRate || 0)), // unimplemented in backend
    enableFollowUpQuestions: mock?.enableFollowUpQuestions !== false,
    enableRecordReplay: Boolean(mock?.enableRecordReplay),
    createdDate: formatDate(mock?.createdAt), // unimplemented in backend
    updatedDate: formatDate(mock?.updatedAt), // unimplemented in backend
    jobIds: (mock?.mockJobs || [])
      .map((jobMock) => normalizeId(jobMock.jobId || jobMock.job?.id))
      .filter(Boolean),
    raw: mock, // raw backend
  };
}

function mapJobMock(jobMock, index, sourceLength, mockLookup = new Map()) {
  const directMock =
    jobMock?.mock ||
    (jobMock?.title || jobMock?.questions || jobMock?.topics || jobMock?.technologies
      ? jobMock
      : null);
  const mapped = directMock
    ? mapBackendMock(directMock)
    : mockLookup.get(normalizeId(jobMock?.mockId));
  const weight = numericWeight(jobMock?.weight ?? jobMock?.mockWeight, null);
  return {
    id: normalizeId(jobMock?.mockId || directMock?.id || mapped?.id || `mock-${index + 1}`),
    jobMockId: normalizeId(jobMock?.mockId ? jobMock?.id : ''),
    name: mapped?.title || `Mock ${index + 1}`,
    type: mapped?.type || 'Technical',
    typeValue: mapped?.typeValue || MockTypeEnum.TECHNICAL,
    difficulty: mapped?.difficulty || 'Medium',
    difficultyValue: mapped?.difficultyValue || DifficultyEnum.MEDIUM,
    duration: mapped?.duration || '0 min',
    durationMin: mapped?.durationMin || 0,
    technologies: mapped?.technologies || [],
    weight: weight ?? (sourceLength ? Math.round(100 / sourceLength) : 0),
    isActive: jobMock?.isActive !== false,
    raw: jobMock,
  };
}

export function mapBackendJob(job, mockLookup = new Map()) {
  const id = normalizeId(job?.id);
  const jobMocks =
    [job?.jobMocks, job?.mockJobs, job?.mocks].find(
      (items) => Array.isArray(items) && items.length
    ) || [];
  const departments = normalizeArray(job?.departments);
  const backendStatus = job?.status || JobStatusEnum.ACTIVE;
  const candidates = Array.isArray(job?.candidates)
    ? job.candidates.map((candidate, index) => mapBackendCandidate(candidate, new Map(), index))
    : [];
  const mapped = {
    id,
    companyId: normalizeId(job?.companyId || job?.company?.id),
    title: job?.title || 'Untitled job',
    department: departments[0] || 'General', // no departments concept yet
    departments,
    jobType: JOB_TYPE_LABELS[job?.type] || titleCase(job?.type || JobTypeEnum.FULL_TIME),
    jobTypeValue: job?.type || JobTypeEnum.FULL_TIME,
    status: JOB_STATUS_TO_UI[backendStatus] || 'active',
    statusValue: backendStatus,
    seniority: '',
    locationType: '',
    location: '',
    maxCandidates: job?.maxCandidates || '',
    description: job?.description || '',
    technologies: job?.requirements || '',
    technologiesTags: splitRequirementTags(job?.requirements),
    skills: splitRequirementTags(job?.requirements),
    duration: formatRemainingDuration(backendStatus, job?.startDate, job?.endDate),
    publishDate: formatDate(job?.createdAt),
    startDate: formatDate(job?.startDate),
    startDateInput: toDateInput(job?.startDate),
    endDate: formatDate(job?.endDate),
    endDateInput: toDateInput(job?.endDate),
    activeDays: daysSince(job?.createdAt),
    mocks: jobMocks.map((jobMock, index) =>
      mapJobMock(jobMock, index, jobMocks.length, mockLookup)
    ),
    sendEmailToCandidates: job?.sendEmailToCandidates !== false,
    shareFeedback: job?.shareFeedback !== false,
    raw: job,
  };
  return candidates.length
    ? enrichJobWithCandidates(mapped, candidates)
    : {
        ...mapped,
        // no backend logic fo this yet
        totalApplied: 0,
        shortlisted: 0,
        accepted: 0,
        rejected: 0,
        pending: 0,
        avgScore: 0,
        passRate: 0,
        applicationTrend: [],
      };
}

export function enrichJobWithCandidates(job, candidates) {
  const linked = candidates.filter(
    (candidate) => normalizeId(candidate.jobId) === normalizeId(job.id)
  );
  const accepted = linked.filter((candidate) => candidate.status === 'accepted').length;
  const rejected = linked.filter((candidate) => candidate.status === 'rejected').length;
  const shortlisted = linked.filter((candidate) =>
    ['shortlist', 'shortlisted'].includes(candidate.status)
  ).length;
  const pending = linked.filter((candidate) => candidate.status === 'pending').length;
  return {
    ...job,
    totalApplied: linked.length,
    accepted,
    rejected,
    shortlisted,
    pending: pending || Math.max(0, linked.length - accepted - rejected - shortlisted),
    avgScore: average(linked.map((candidate) => candidate.score)),
    passRate: linked.length
      ? Math.round(
          (linked.filter((candidate) => candidate.score >= 70 || candidate.status === 'accepted')
            .length /
            linked.length) *
            100
        )
      : 0,
    applicationTrend: buildTrend(linked),
  };
}

export function mapBackendCandidateQuestion(question) {
  return {
    id: normalizeId(question?.id),
    candidateId: normalizeId(question?.candidateId),
    question: question?.question || '',
    durationInMinutes: Number(question?.durationInMinutes || 0),
    answer: question?.answer || '',
    aiFeedback: question?.aiFeedback || '',
    strength: normalizeArray(question?.strength),
    areasToImprove: normalizeArray(question?.areasToImprove),
    score: Math.round(Number(question?.score || 0)),
    raw: question,
  };
}

export function mapBackendCandidate(candidate, jobLookup = new Map(), rowIndex = 0) {
  const backendId = normalizeId(candidate?.id || candidate?._id || candidate?.candidateId);
  const applicationId = normalizeId(
    candidate?.applicationId ||
      candidate?.jobApplicationId ||
      candidate?.candidateApplicationId ||
      candidate?.application?.id ||
      candidate?.jobCandidate?.id ||
      candidate?.candidateJob?.id
  );
  const jobId = normalizeId(candidate?.jobId || candidate?.job?.id);
  const job = candidate?.job || jobLookup.get(jobId);
  const score = Number(candidate?.performance?.score ?? candidate?.analysis?.score ?? 0); // no backend yet
  const [firstName = '', ...lastNameParts] = String(candidate?.name || '')
    .trim()
    .split(/\s+/);
  const createdKey = normalizeId(candidate?.createdAt || candidate?.submittedAt || '');
  const id =
    applicationId ||
    [backendId, jobId, candidate?.email, createdKey || rowIndex]
      .map((part) => normalizeId(part).trim())
      .filter(Boolean)
      .join(':');
  return {
    id,
    backendId,
    applicationId,
    name: candidate?.name || 'Unnamed candidate',
    firstName,
    lastName: lastNameParts.join(' '),
    email: candidate?.email || '',
    phone: candidate?.phone || '',
    location: candidate?.location || '',
    linkedin: candidate?.linkedin || '',
    resumeName: candidate?.resumeName || '',
    jobId,
    companyId: normalizeId(candidate?.companyId),
    job: job?.title || 'Unassigned job',
    score: Number.isFinite(score) ? Math.round(score) : 0, // no backend yet
    date: formatDate(candidate?.createdAt),
    antiCheat: CANDIDATE_CHEAT_TO_UI[candidate?.performance?.cheat] || 'clean', // no backend yet
    cheatValue: candidate?.performance?.cheat || CandidateCheatEnum.CLEAN, // no backend yet
    status: CANDIDATE_STATUS_TO_UI[candidate?.status] || 'pending',
    statusValue: candidate?.status || CandidateStatusEnum.PENDING,
    cvUrl: publicFileUrl(candidate?.cvUrl),
    videoUrl: publicFileUrl(candidate?.performance?.videoUrl),
    questions: (candidate?.questions || []).map(mapBackendCandidateQuestion),
    analysis: candidate?.analysis || null,
    performance: candidate?.performance || null,
    createdAt: candidate?.createdAt,
    updatedAt: candidate?.updatedAt,
    raw: candidate,
  };
}

export function mapBackendCompany(company, jobs = []) {
  const departments = uniqueCompact(jobs.flatMap((job) => job.departments || []));
  return {
    id: normalizeId(company?.id),
    managerId: normalizeId(company?.managerId) || '050b0046-c822-4fb4-8d57-ddeefd89bd80',
    name: company?.name || 'Company',
    industry: company?.industry || CompanyIndustryEnum.OTHER,
    website: company?.website || 'https://acme.com',
    logo: publicFileUrl(company?.logoUrl),
    logoUrl: company?.logoUrl || 'https://cdn.example.com/logos/acme.png',
    phone: company?.phone || '+201009876543',
    description: company?.description || 'We build AI-based hiring products.',
    size: company?.size || 'Not provided',
    defaultCandidateStatuses: ['Pending', 'Shortlist', 'Accepted', 'Rejected'],
    isActive: company?.isActive !== false,
    createdDate: formatDate(company?.createdAt),
    departments: departments.length ? departments : ['General'],
    raw: company,
  };
}

export function mapBackendUserToMember(user, companyUser = user?.companyUser) {
  return {
    id: normalizeId(user?.id || companyUser?.userId),
    companyUserId: normalizeId(companyUser?.id),
    companyId: normalizeId(companyUser?.companyId),
    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Team member',
    email: user?.email || '',
    department: user?.jobTitle || 'General',
    role: ROLE_TO_UI[companyUser?.type] || 'viewer',
    roleValue: companyUser?.type || CompanyUserTypeEnum.VIEWER,
    approved: companyUser?.approved !== false,
    joinedDate: formatDate(companyUser?.createdAt || user?.createdAt),
    lastActivity: formatDate(companyUser?.updatedAt || user?.updatedAt, 'Recently'),
    avatar: publicFileUrl(user?.profilePictureUrl),
    phone: user?.phone || '',
    verified: Boolean(user?.verified),
    userType: user?.userType || UserTypeEnum.USER,
    raw: { user, companyUser },
  };
}

export function mapBackendCompanyUsers(companyUsers = [], currentUser) {
  const members = companyUsers
    .filter((companyUser) => {
      const membership = companyUser?.user
        ? companyUser
        : companyUser?.companyUser ||
          companyUser?.company_user ||
          companyUser?.membership ||
          companyUser;
      return companyUser && membership?.approved !== false;
    })
    .map((companyUser) => {
      const user = companyUser?.user || companyUser;
      const membership = companyUser?.user
        ? companyUser
        : companyUser?.companyUser ||
          companyUser?.company_user ||
          companyUser?.membership ||
          companyUser;
      return mapBackendUserToMember(user, membership);
    })
    .filter((member) => member.id || member.email);

  if (currentUser?.companyUser && currentUser.companyUser.approved !== false) {
    const currentMember = mapBackendUserToMember(currentUser, currentUser.companyUser);
    const hasCurrentMember = members.some(
      (member) => normalizeId(member.id) === normalizeId(currentMember.id)
    );
    if (!hasCurrentMember) members.unshift(currentMember);
  }

  if (!members.length && currentUser?.companyUser)
    members.push(mapBackendUserToMember(currentUser, currentUser.companyUser));
  return members;
}

export function mapBackendJoinRequest(request) {
  const user = request?.user || {};
  const approved = request?.approved === true;
  const declined = request?.approved === false && request?.status === 'declined';
  return {
    id: normalizeId(request?.id || request?.userId || user?.id),
    userId: normalizeId(request?.userId || user?.id),
    companyId: normalizeId(request?.companyId),
    name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.email || 'Team member',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.jobTitle || 'General',
    role: ROLE_TO_UI[request?.type] || 'viewer',
    roleValue: request?.type || CompanyUserTypeEnum.VIEWER,
    status: approved ? 'accepted' : declined ? 'declined' : 'pending',
    submittedDate: formatDate(request?.createdAt),
    raw: request,
  };
}

export function formToBackendJobInput(form) {
  const scheduleMode = form.scheduleMode === 'scheduled' ? 'scheduled' : 'active';
  const today = startOfTodayTimestamp();
  let startDate = null;
  let endDate = null;
  if (scheduleMode === 'scheduled') {
    startDate = dateInputToTimestamp(form.startDate);
    endDate = dateInputToEndTimestamp(form.endDate);

    if (!startDate) {
      throw new Error('Start date is required for scheduled jobs.');
    }
    if (!endDate) {
      throw new Error('End date is required for scheduled jobs.');
    }
    if (startDate < today) {
      throw new Error('Start date cannot be in the past.');
    }
    if (endDate <= startDate) {
      throw new Error('End date must be after start date.');
    }
  } else {
    // ACTIVE
    startDate = Date.now();
    endDate = dateInputToEndTimestamp(form.endDate);
    if (!endDate) {
      throw new Error('End date is required for active jobs.');
    }
    if (endDate <= startDate) {
      throw new Error('End date must be after today.');
    }
  }

  const mockIds = uniqueCompact(
    form.mocks.map((mock) => normalizeId(mock?.id || mock)).filter(Boolean)
  ).slice(0, 10);

  if (!mockIds.length) {
    throw new Error('Add at least one mock before publishing a job.');
  }

  return {
    title: requireText(form.title, 'Job title', 3, 30),
    description: requireText(form.description, 'Description', 10, 255),
    type: form.jobType || form.type || JobTypeEnum.FULL_TIME,
    departments: uniqueCompact([form.department, ...(form.departments || [])]).slice(0, 10),
    requirements: requireText(
      uniqueCompact(form.technologies || []).join(', '),
      'Technologies',
      1,
      255
    ),
    sendEmailToCandidates: Boolean(form.emails?.['on-apply'] ?? form.sendEmailToCandidates ?? true),
    shareFeedback: Boolean(form.emails?.['on-shortlist'] ?? form.shareFeedback ?? true),
    startDate,
    endDate,
    mockIds,
  };
}

export function formToBackendJobSchedulePatch(form, currentJob = {}) {
  const scheduleMode =
    currentJob.status === 'active'
      ? 'active'
      : form.scheduleMode === 'scheduled'
        ? 'scheduled'
        : 'active';
  const today = startOfTodayTimestamp();
  let startDate = null;
  let endDate = dateInputToEndTimestamp(form.endDate);

  if (scheduleMode === 'scheduled') {
    startDate = dateInputToTimestamp(form.startDate);

    if (!startDate) {
      throw new Error('Start date is required for scheduled jobs.');
    }
    if (!endDate) {
      throw new Error('End date is required for scheduled jobs.');
    }
    if (startDate < today) {
      throw new Error('Start date cannot be in the past.');
    }
    if (endDate <= startDate) {
      throw new Error('End date must be after start date.');
    }
  } else {
    startDate =
      toTimestamp(currentJob?.raw?.startDate) ||
      dateInputToTimestamp(currentJob?.startDateInput) ||
      Date.now();

    if (!endDate) {
      throw new Error('End date is required for active jobs.');
    }
    if (endDate <= Date.now()) {
      throw new Error('End date must be after today.');
    }
    const currentEndDate =
      toTimestamp(currentJob?.raw?.endDate) || dateInputToEndTimestamp(currentJob?.endDateInput);
    if (currentJob.status === 'active' && currentEndDate && endDate < currentEndDate) {
      throw new Error('Active jobs can only have their end date extended.');
    }
  }

  return {
    sendEmailToCandidates: Boolean(form.emails?.['on-apply'] ?? currentJob.sendEmailToCandidates),
    shareFeedback: Boolean(form.emails?.['on-shortlist'] ?? currentJob.shareFeedback),
    startDate,
    endDate,
  };
}

export function jobToForm(job) {
  const technologies = Array.isArray(job.technologiesTags)
    ? [...job.technologiesTags]
    : Array.isArray(job.technologies)
      ? [...job.technologies]
      : Array.isArray(job.skills)
        ? [...job.skills]
        : splitRequirementTags(job.technologies || job.requirements);
  return {
    title: job.title || '',
    department: job.departments?.[0] || job.department || '',
    departments: [...(job.departments || [])],
    jobType: job.jobTypeValue || JobTypeEnum.FULL_TIME,
    seniority: job.seniority || '',
    description: job.description || '',
    requirements: job.requirements || job.technologies || '',
    technologies,
    skills: technologies,
    locationType: job.locationType || '',
    location: job.location || '',
    mocks: (job.mocks || []).map((mock) => ({ ...mock, id: mock.id, name: mock.name })),
    emails: {
      'on-apply': job.sendEmailToCandidates !== false,
      'on-shortlist': job.shareFeedback !== false,
      'on-reject': false,
    },
    startDate: job.startDateInput || '',
    endDate: job.endDateInput || '',
    maxCandidates: job.maxCandidates || '',
    scheduleMode: job.status === 'scheduled' ? 'scheduled' : 'active',
  };
}

function normalizeMockType(type) {
  const raw = String(type || '').toUpperCase();
  return Object.values(MockTypeEnum).includes(raw) ? raw : MockTypeEnum.TECHNICAL;
}

function normalizeDifficulty(difficulty) {
  const raw = String(difficulty || '').toUpperCase();
  return Object.values(DifficultyEnum).includes(raw) ? raw : DifficultyEnum.MEDIUM;
}

function normalizeAnswerType(answerType) {
  const raw = String(answerType || '').toUpperCase();
  return Object.values(AnswerTypeEnum).includes(raw) ? raw : AnswerTypeEnum.FREE_TEXT;
}

function questionDifficultyToForm(question) {
  const raw = question?.difficultyValue || question?.raw?.difficulty || question?.difficulty;
  return String(raw || DifficultyEnum.MEDIUM).toLowerCase();
}

function estimatedTimeToForm(question) {
  const minutes = question?.estimatedTimeMin || parseMinutes(question?.estimatedTime, 5);
  return question?.estimatedTime && /\bminutes?\b/i.test(question.estimatedTime)
    ? question.estimatedTime
    : `${minutes} minutes`;
}

export function formToBackendMockInput(form) {
  const technologies = uniqueCompact(form.technologies || form.skills || []).slice(0, 10);
  if (!technologies.length) throw new Error('Add at least one technology before creating a mock.');
  const topicNames = (form.topics || []).map(normalizeTopicName);
  const legacyCriteria = (form.criteria || []).map((criterion) => criterion?.name);
  const topics = uniqueCompact([
    ...topicNames,
    ...legacyCriteria,
    ...(form.questions || []).map((question) => question.title),
    ...technologies,
  ]).slice(0, 10);
  return {
    title: requireText(form.title, 'Mock title', 3, 30),
    description: requireText(form.description, 'Description', 10, 255),
    difficulty: normalizeDifficulty(form.difficulty),
    type: normalizeMockType(form.type),
    estimatedTimeInMinutes: parseMinutes(form.durationMin || form.estimatedTimeInMinutes, 30),
    technologies,
    topics,
    jobIds: uniqueCompact(form.jobs || form.jobIds || [])
      .map((job) => normalizeId(job.id || job))
      .filter(Boolean)
      .slice(0, 10),
    enableFollowUpQuestions: Boolean(form.enableFollowUpQuestions ?? true),
    enableRecordReplay: Boolean(form.enableRecordReplay ?? false),
    questions: (form.questions || []).slice(0, 10).map((question, index) => ({
      title: requireText(question.title, `Question ${index + 1} title`, 3, 50),
      description: requireText(question.description, `Question ${index + 1} description`, 10, 255),
      difficulty: normalizeDifficulty(question.difficulty),
      estimatedTimeInMinutes: parseMinutes(
        question.estimatedTimeInMinutes || question.estimatedTime,
        5
      ),
      order: index + 1,
      answerType: normalizeAnswerType(question.answerType),
      correctAnswer: requireText(
        question.correctAnswer || question.answer || 'Manual review required',
        `Question ${index + 1} correct answer`,
        1,
        255
      ),
    })),
  };
}

export function mockToForm(mock) {
  const topics =
    Array.isArray(mock?.criteria) && mock.criteria.length
      ? mock.criteria.map((topic) => ({ ...topic }))
      : (mock?.topics || []).map((topic, index, source) => {
          const name = normalizeTopicName(topic);
          return {
            id: normalizeId(topic?.id || `t${index + 1}`),
            name,
            weight: numericWeight(
              topic?.weight,
              source.length ? Math.round(100 / source.length) : 0
            ),
          };
        });

  return {
    title: mock.title || '',
    type: normalizeMockType(mock.typeValue || mock.raw?.type || mock.type),
    difficulty: normalizeDifficulty(
      mock.difficultyValue || mock.raw?.difficulty || mock.difficulty
    ),
    durationMin: String(mock.durationMin || ''),
    description: mock.description || '',
    technologies: [...(mock.technologies || [])],
    topics,
    jobIds: [...(mock.jobIds || [])],
    enableFollowUpQuestions: Boolean(mock.enableFollowUpQuestions),
    enableRecordReplay: Boolean(mock.enableRecordReplay),
    questions: (mock.questions || []).map((question) => ({
      id: question.id,
      title: question.title,
      description: question.description,
      difficulty: questionDifficultyToForm(question),
      estimatedTime: estimatedTimeToForm(question),
      weight: numericWeight(question.weight, 0),
      answerType: normalizeAnswerType(question.answerType),
      correctAnswer: question.correctAnswer,
    })),
  };
}

export function formToBackendCompanyInput(form) {
  return {
    name: requireText(form.name, 'Company name', 1, 255),
    website: form.website || undefined,
    phone: form.phone || undefined,
    logoUrl: form.logoUrl || form.logo || undefined,
    description: form.description ? clampText(form.description, 255) : undefined,
  };
}

export function formToBackendCandidateApplication(form) {
  return {
    name: requireText(form.name, 'Candidate name', 1, 255),
    email: requireText(form.email, 'Candidate email', 3, 255),
    cvUrl: requireText(form.cvUrl, 'CV URL', 1, 255),
  };
}

export function fileEntityToUi(file) {
  return { ...file, publicUrl: publicFileUrl(file?.url) };
}
