// mirroring the backend API endpoints then simplify the calls in client.js
// URL PARAMETERIZATION : Converts endpoint istead of apiFetch('/jobs/get_paginated') to apiFetch(endpoints.jobs.paginated)

export const endpoints = {
  auth: {
    registerManager: '/auth/register_manager',
    joinRequest: (companyId) => `/auth/companies/${companyId}/join_request`,
    requestCode: '/auth/code_verify_request',
    verifyEmail: '/auth/verify_email',
    resetPassword: '/auth/reset_password',
    login: '/auth/login',
    logout: '/auth/logout',
    logoutAllDevices: '/auth/logout_all_devices',
  },
  users: {
    me: '/users/me',
    byId: (id) => `/users/${id}`,
    edit: '/users/edit',
    changePassword: '/users/change-password',
  },
  companies: {
    info: '/companies/info',
    users: '/companies/users',
    joinRequests: '/companies/join_requests',
    replyJoinRequest: '/companies/reply_join_request',
    removeFromCompany: '/companies/remove_from_company',
    update: '/companies/update',
  },
  files: {
    upload: '/files/upload',
  },
  mocks: {
    byId: (mockId) => `/mock/get/${mockId}`,
    paginated: '/mock/get_paginated',
    create: '/mock/create',
    update: (mockId) => `/mock/update/${mockId}`,
    delete: (mockId) => `/mock/delete/${mockId}`,
  },
  jobs: {
    byId: (jobId) => `/jobs/get/${jobId}`,
    paginated: '/jobs/get_paginated',
    create: '/jobs/create',
    update: (jobId) => `/jobs/update/${jobId}`,
    delete: (jobId) => `/jobs/delete/${jobId}`,
  },
  jobMock: {
    countMocksForJob: (jobId) => `/job-mock/job/${jobId}`,
    countJobsForMock: (mockId) => `/job-mock/mock/${mockId}`,
  },
  candidates: {
    byId: (candidateId) => `/candidates/get/${candidateId}`,
    paginated: '/candidates/get_paginated',
    apply: (companyId, jobId) => `/candidates/apply/${companyId}/${jobId}`,
    updateStatus: (candidateId) => `/candidates/update/${candidateId}`,
  },
};
