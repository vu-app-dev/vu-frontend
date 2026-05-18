/**
 * Unified company data — single source of truth for company, team, roles, and requests.
 */

/* ── Roles & Permissions ── */

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

export function hasPermission(role, permission) {
  return ROLES[role]?.permissions.includes(permission) ?? false;
}

/* ── Company Info ── */

export const COMPANY = {
  name: 'Acme Technologies',
  industry: 'Software & Technology',
  website: 'https://acmetech.io',
  size: '50–200 employees',
  logo: null,
  createdDate: 'Sep 12, 2024',
  defaultEvaluationMode: 'criteria',
  defaultCandidateStatuses: ['Pending', 'Shortlist', 'Accepted', 'Rejected'],
  departments: ['Engineering', 'Design', 'Product', 'Data', 'HR', 'Operations'],
};

/* ── Current logged-in user (Owner) ── */

export const CURRENT_USER_ID = 1;

/* ── Team Members ── */

export const TEAM_MEMBERS = [
  {
    id: 1,
    name: 'Hamedisnt',
    email: 'hamedisnt@gmail.com',
    department: 'Engineering',
    role: 'owner',
    joinedDate: 'Sep 12, 2024',
    lastActivity: '2 hours ago',
    avatar: null,
    phone: '+966 55 900 0001',
    location: 'Riyadh, Saudi Arabia',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@acmetech.io',
    department: 'Engineering',
    role: 'editor',
    joinedDate: 'Oct 5, 2024',
    lastActivity: '15 min ago',
    avatar: null,
    phone: '+1 415 555 0102',
    location: 'San Francisco, USA',
  },
  {
    id: 3,
    name: 'Omar Al-Hassan',
    email: 'omar.h@acmetech.io',
    department: 'Design',
    role: 'editor',
    joinedDate: 'Nov 18, 2024',
    lastActivity: '1 day ago',
    avatar: null,
    phone: '+971 50 123 4567',
    location: 'Dubai, UAE',
  },
  {
    id: 4,
    name: 'Lina Markovic',
    email: 'lina.m@acmetech.io',
    department: 'Product',
    role: 'viewer',
    joinedDate: 'Dec 3, 2024',
    lastActivity: '3 days ago',
    avatar: null,
    phone: '+381 11 123 4567',
    location: 'Belgrade, Serbia',
  },
  {
    id: 5,
    name: 'James Park',
    email: 'james.p@acmetech.io',
    department: 'Data',
    role: 'editor',
    joinedDate: 'Jan 10, 2025',
    lastActivity: '5 hours ago',
    avatar: null,
    phone: '+82 10 1234 5678',
    location: 'Seoul, South Korea',
  },
  {
    id: 6,
    name: 'Priya Sharma',
    email: 'priya.s@acmetech.io',
    department: 'Engineering',
    role: 'viewer',
    joinedDate: 'Feb 1, 2025',
    lastActivity: '6 hours ago',
    avatar: null,
    phone: '+91 98765 43210',
    location: 'Mumbai, India',
  },
  {
    id: 7,
    name: 'Daniel Reed',
    email: 'daniel.r@acmetech.io',
    department: 'Engineering',
    role: 'owner',
    joinedDate: 'Sep 15, 2024',
    lastActivity: '30 min ago',
    avatar: null,
    phone: '+44 7911 123456',
    location: 'London, UK',
  },
  {
    id: 8,
    name: 'Fatima Al-Rashid',
    email: 'fatima.r@acmetech.io',
    department: 'Design',
    role: 'editor',
    joinedDate: 'Mar 12, 2025',
    lastActivity: '2 days ago',
    avatar: null,
    phone: '+966 55 234 5678',
    location: 'Jeddah, Saudi Arabia',
  },
  {
    id: 9,
    name: 'Nathan Brooks',
    email: 'nathan.b@acmetech.io',
    department: 'Product',
    role: 'viewer',
    joinedDate: 'Apr 1, 2025',
    lastActivity: '1 week ago',
    avatar: null,
    phone: '+1 312 555 0193',
    location: 'Chicago, USA',
  },
  {
    id: 10,
    name: 'Aya Mahmoud',
    email: 'aya.m@acmetech.io',
    department: 'Data',
    role: 'editor',
    joinedDate: 'May 20, 2025',
    lastActivity: '4 hours ago',
    avatar: null,
    phone: '+20 100 123 4567',
    location: 'Cairo, Egypt',
  },
  {
    id: 11,
    name: 'Kevin Walsh',
    email: 'kevin.w@acmetech.io',
    department: 'HR',
    role: 'viewer',
    joinedDate: 'Jun 3, 2025',
    lastActivity: '2 days ago',
    avatar: null,
    phone: '+353 87 123 4567',
    location: 'Dublin, Ireland',
  },
  {
    id: 12,
    name: 'Nora Petersen',
    email: 'nora.p@acmetech.io',
    department: 'Operations',
    role: 'editor',
    joinedDate: 'Jun 15, 2025',
    lastActivity: '3 hours ago',
    avatar: null,
    phone: '+47 920 12 345',
    location: 'Oslo, Norway',
  },
  {
    id: 13,
    name: 'Tariq Hadid',
    email: 'tariq.h@acmetech.io',
    department: 'Engineering',
    role: 'editor',
    joinedDate: 'Jul 1, 2025',
    lastActivity: '1 hour ago',
    avatar: null,
    phone: '+962 7 9012 3456',
    location: 'Amman, Jordan',
  },
  {
    id: 14,
    name: 'Mei Lin',
    email: 'mei.l@acmetech.io',
    department: 'Design',
    role: 'viewer',
    joinedDate: 'Jul 22, 2025',
    lastActivity: '5 days ago',
    avatar: null,
    phone: '+86 138 0013 8000',
    location: 'Shanghai, China',
  },
  {
    id: 15,
    name: 'Leo Ferreira',
    email: 'leo.f@acmetech.io',
    department: 'Product',
    role: 'editor',
    joinedDate: 'Aug 8, 2025',
    lastActivity: '45 min ago',
    avatar: null,
    phone: '+351 912 345 678',
    location: 'Lisbon, Portugal',
  },
];

/* ── Activity Log ── */

export const ACTIVITY_LOG = [
  {
    id: 1,
    memberId: 1,
    action: 'Created job',
    target: 'Senior Software Engineer',
    date: 'Feb 28, 2026',
    time: '2:30 PM',
  },
  {
    id: 2,
    memberId: 2,
    action: 'Reviewed candidate',
    target: 'Chen Wei for Data Analyst',
    date: 'Feb 28, 2026',
    time: '1:15 PM',
  },
  {
    id: 3,
    memberId: 1,
    action: 'Created mock',
    target: 'System Design Interview',
    date: 'Feb 27, 2026',
    time: '4:00 PM',
  },
  {
    id: 4,
    memberId: 3,
    action: 'Changed candidate status',
    target: 'Elena Volkov → Shortlisted',
    date: 'Feb 27, 2026',
    time: '11:30 AM',
  },
  {
    id: 5,
    memberId: 5,
    action: 'Updated job',
    target: 'Frontend Developer',
    date: 'Feb 26, 2026',
    time: '3:45 PM',
  },
  {
    id: 6,
    memberId: 7,
    action: 'Role changed',
    target: 'Priya Sharma → Viewer',
    date: 'Feb 26, 2026',
    time: '10:00 AM',
  },
  {
    id: 7,
    memberId: 2,
    action: 'Created job',
    target: 'UX Designer',
    date: 'Feb 25, 2026',
    time: '9:30 AM',
  },
  {
    id: 8,
    memberId: 4,
    action: 'Reviewed candidate',
    target: 'Isabella Rossi for UX Designer',
    date: 'Feb 25, 2026',
    time: '2:00 PM',
  },
  {
    id: 9,
    memberId: 1,
    action: 'Updated job',
    target: 'ML Engineer',
    date: 'Feb 24, 2026',
    time: '5:15 PM',
  },
  {
    id: 10,
    memberId: 8,
    action: 'Created mock',
    target: 'React Challenge',
    date: 'Feb 24, 2026',
    time: '11:00 AM',
  },
  {
    id: 11,
    memberId: 6,
    action: 'Reviewed candidate',
    target: 'Raj Patel for Data Analyst',
    date: 'Feb 23, 2026',
    time: '3:30 PM',
  },
  {
    id: 12,
    memberId: 10,
    action: 'Created job',
    target: 'Backend Engineer',
    date: 'Feb 23, 2026',
    time: '10:45 AM',
  },
  {
    id: 13,
    memberId: 5,
    action: 'Changed candidate status',
    target: 'Mark Reed → Accepted',
    date: 'Feb 22, 2026',
    time: '4:30 PM',
  },
  {
    id: 14,
    memberId: 3,
    action: 'Updated job',
    target: 'Product Manager',
    date: 'Feb 22, 2026',
    time: '1:00 PM',
  },
  {
    id: 15,
    memberId: 7,
    action: 'Created mock',
    target: 'SQL Assessment',
    date: 'Feb 21, 2026',
    time: '9:00 AM',
  },
  {
    id: 16,
    memberId: 9,
    action: 'Joined organization',
    target: 'Acme Technologies',
    date: 'Apr 1, 2025',
    time: '10:00 AM',
  },
  {
    id: 17,
    memberId: 8,
    action: 'Joined organization',
    target: 'Acme Technologies',
    date: 'Mar 12, 2025',
    time: '9:00 AM',
  },
  {
    id: 18,
    memberId: 10,
    action: 'Joined organization',
    target: 'Acme Technologies',
    date: 'May 20, 2025',
    time: '11:00 AM',
  },
  {
    id: 19,
    memberId: 6,
    action: 'Joined organization',
    target: 'Acme Technologies',
    date: 'Feb 1, 2025',
    time: '10:30 AM',
  },
  {
    id: 20,
    memberId: 1,
    action: 'Reviewed candidate',
    target: 'Layla Farouk for Backend Engineer',
    date: 'Feb 20, 2026',
    time: '2:15 PM',
  },
  {
    id: 21,
    memberId: 12,
    action: 'Updated job',
    target: 'Operations Coordinator',
    date: 'Feb 19, 2026',
    time: '11:30 AM',
  },
  {
    id: 22,
    memberId: 13,
    action: 'Created mock',
    target: 'Backend Coding Challenge',
    date: 'Feb 19, 2026',
    time: '3:00 PM',
  },
  {
    id: 23,
    memberId: 11,
    action: 'Joined organization',
    target: 'Acme Technologies',
    date: 'Jun 3, 2025',
    time: '9:15 AM',
  },
  {
    id: 24,
    memberId: 15,
    action: 'Created job',
    target: 'Senior Product Manager',
    date: 'Feb 18, 2026',
    time: '10:00 AM',
  },
  {
    id: 25,
    memberId: 2,
    action: 'Changed candidate status',
    target: 'Rina Tanaka → Shortlisted',
    date: 'Feb 18, 2026',
    time: '4:45 PM',
  },
  {
    id: 26,
    memberId: 14,
    action: 'Reviewed candidate',
    target: 'Paulo Gomes for UX Designer',
    date: 'Feb 17, 2026',
    time: '2:00 PM',
  },
  {
    id: 27,
    memberId: 7,
    action: 'Updated job',
    target: 'DevOps Engineer',
    date: 'Feb 17, 2026',
    time: '9:30 AM',
  },
  {
    id: 28,
    memberId: 10,
    action: 'Created mock',
    target: 'Python Data Science Challenge',
    date: 'Feb 16, 2026',
    time: '1:15 PM',
  },
  {
    id: 29,
    memberId: 5,
    action: 'Reviewed candidate',
    target: 'Sara Al-Amin for ML Engineer',
    date: 'Feb 16, 2026',
    time: '11:00 AM',
  },
  {
    id: 30,
    memberId: 1,
    action: 'Role changed',
    target: 'Kevin Walsh → Viewer',
    date: 'Feb 15, 2026',
    time: '3:30 PM',
  },
];

/* ── Join Requests ── */

export const JOIN_REQUESTS = [
  {
    id: 1,
    name: 'Mohammed Ali',
    email: 'mo.ali@outlook.com',
    department: 'HR',
    message:
      'I would like to join the recruitment team to help manage candidate pipelines and coordinate mock interviews.',
    submittedDate: 'Feb 27, 2026',
    status: 'pending',
  },
  {
    id: 2,
    name: 'Elena Volkov',
    email: 'elena.v@gmail.com',
    department: 'Talent Acquisition',
    message:
      'Experienced technical recruiter looking to collaborate on screening and evaluating engineering candidates.',
    submittedDate: 'Feb 26, 2026',
    status: 'pending',
  },
  {
    id: 3,
    name: 'Carlos Rivera',
    email: 'carlos.r@proton.me',
    department: 'Operations',
    message:
      'Currently managing the hiring workflow at another branch. Would like to join this workspace to review mock results.',
    submittedDate: 'Feb 25, 2026',
    status: 'pending',
  },
  {
    id: 4,
    name: 'Hana Kim',
    email: 'hana.kim@mail.com',
    department: 'Engineering',
    message:
      'Team lead interested in contributing to the technical assessment process for new hires.',
    submittedDate: 'Feb 24, 2026',
    status: 'pending',
  },
  {
    id: 5,
    name: 'Diego Morales',
    email: 'diego.m@outlook.com',
    department: 'Product',
    message:
      'Product strategist with 5 years of experience. Eager to help define job requirements and evaluation criteria.',
    submittedDate: 'Feb 20, 2026',
    status: 'accepted',
  },
  {
    id: 6,
    name: 'Amina Ndiaye',
    email: 'amina.n@gmail.com',
    department: 'HR',
    message:
      'HR professional specializing in recruitment workflows. Want to contribute to the candidate review process.',
    submittedDate: 'Feb 18, 2026',
    status: 'accepted',
  },
  {
    id: 7,
    name: 'Victor Osei',
    email: 'victor.o@proton.me',
    department: 'Data',
    message:
      'Data analyst looking to assist with assessment analytics and candidate scoring workflows.',
    submittedDate: 'Feb 15, 2026',
    status: 'declined',
  },
  {
    id: 8,
    name: 'Sophie Laurent',
    email: 'sophie.l@mail.com',
    department: 'Design',
    message:
      'Senior designer interested in reviewing design role applications and participating in mock assessments.',
    submittedDate: 'Feb 10, 2026',
    status: 'declined',
  },
];

/* -------------------------------------------------
   Helpers
   ------------------------------------------------- */

export function getMemberById(id) {
  return TEAM_MEMBERS.find((m) => m.id === id) ?? null;
}

export function getJoinRequestById(id) {
  return JOIN_REQUESTS.find((r) => r.id === id) ?? null;
}

export function removeMember(id) {
  const member = getMemberById(id);
  if (!member) return false;
  if (member.role === 'owner') {
    const ownerCount = TEAM_MEMBERS.filter((m) => m.role === 'owner').length;
    if (ownerCount <= 1) return false;
  }
  const idx = TEAM_MEMBERS.findIndex((m) => m.id === id);
  TEAM_MEMBERS.splice(idx, 1);
  return true;
}

export function getMemberActivities(memberId) {
  return ACTIVITY_LOG.filter((a) => a.memberId === memberId).sort((a, b) => b.id - a.id);
}

export function acceptJoinRequest(requestId, role = 'viewer') {
  const idx = JOIN_REQUESTS.findIndex((r) => r.id === requestId);
  if (idx === -1) return null;
  const request = JOIN_REQUESTS[idx];
  JOIN_REQUESTS[idx] = { ...request, status: 'accepted' };
  const maxId = TEAM_MEMBERS.reduce((m, t) => Math.max(m, t.id), 0);
  const newMember = {
    id: maxId + 1,
    name: request.name,
    email: request.email,
    department: request.department,
    role,
    joinedDate: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    lastActivity: 'Just now',
    avatar: null,
  };
  TEAM_MEMBERS.push(newMember);
  return newMember;
}

export function declineJoinRequest(requestId) {
  const idx = JOIN_REQUESTS.findIndex((r) => r.id === requestId);
  if (idx === -1) return false;
  JOIN_REQUESTS[idx] = { ...JOIN_REQUESTS[idx], status: 'declined' };
  return true;
}

export function updateJoinRequest(requestId, patch) {
  const idx = JOIN_REQUESTS.findIndex((r) => r.id === requestId);
  if (idx === -1) return null;
  JOIN_REQUESTS[idx] = { ...JOIN_REQUESTS[idx], ...patch };
  return JOIN_REQUESTS[idx];
}

export function updateCompany(patch) {
  Object.assign(COMPANY, patch);
  return COMPANY;
}

export function getPendingRequestsCount() {
  return JOIN_REQUESTS.filter((r) => r.status === 'pending').length;
}

export function generateInviteLink() {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  return `https://app.acmetech.io/join/${code}`;
}
