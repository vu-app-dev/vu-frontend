/**
 * Unified config data — form constants for job and mock creation/editing.
 */

import { MOCKS } from './mocks';

/* -------------------------------------------------
   Job Config
   ------------------------------------------------- */

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
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
];

export const SENIORITY_OPTIONS = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
  { value: 'lead', label: 'Lead' },
  { value: 'manager', label: 'Manager' },
];

export const LOCATION_TYPE_OPTIONS = [
  { value: 'on-site', label: 'On-site' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' },
];

export const DEPARTMENT_OPTIONS = [
  { value: 'engineering', label: 'Engineering' },
  { value: 'design', label: 'Design' },
  { value: 'product', label: 'Product' },
  { value: 'data', label: 'Data' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'hr', label: 'Human Resources' },
];

/** Mock library for the job config mock picker — derived from unified MOCKS */
export const MOCK_LIBRARY = MOCKS.map((m) => ({
  id: m.id,
  name: m.title,
  type: m.type,
  difficulty: m.difficulty,
  duration: m.duration,
  durationMin: m.durationMin,
  technologies: (m.technologies || []).slice(0, 3),
}));

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
  emails: { 'on-apply': true, 'on-shortlist': true, 'on-reject': false },
  scheduleMode: 'active',
  startDate: '',
  endDate: '',
  maxCandidates: '',
};

export function parseDurationMin(str) {
  const match = String(str).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/* -------------------------------------------------
   Mock Config
   ------------------------------------------------- */

export const MOCK_STEPS_CREATE = [
  { label: 'Basic Info & Technologies' },
  { label: 'Evaluation' },
  { label: 'Review & Publish' },
];

export const MOCK_STEPS_EDIT = [
  { label: 'Basic Info & Technologies' },
  { label: 'Evaluation' },
  { label: 'Review & Save' },
];

export const MOCK_TYPE_OPTIONS = [
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
  { value: 'analytical', label: 'Analytical' },
  { value: 'design', label: 'Design' },
];

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export const DURATION_OPTIONS = [
  { value: '15', label: '15 min' },
  { value: '20', label: '20 min' },
  { value: '25', label: '25 min' },
  { value: '30', label: '30 min' },
  { value: '35', label: '35 min' },
  { value: '40', label: '40 min' },
  { value: '45', label: '45 min' },
  { value: '50', label: '50 min' },
  { value: '60', label: '60 min' },
  { value: '90', label: '90 min' },
];

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
