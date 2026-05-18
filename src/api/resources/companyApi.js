import { datastore } from '../datastore';
import {
  hasPermission,
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
} from '../database/company';

export const ROLES = datastore.roles;
export const COMPANY = datastore.company;
export const CURRENT_USER_ID = datastore.currentUserId;
export const TEAM_MEMBERS = datastore.teamMembers;
export const ACTIVITY_LOG = datastore.activityLog;
export const JOIN_REQUESTS = datastore.joinRequests;

export const companyApi = Object.freeze({
  get: () => datastore.company,
  roles: ROLES,
  hasPermission,
  currentUserId: CURRENT_USER_ID,
  teamMembers: () => datastore.teamMembers,
  activityLog: () => datastore.activityLog,
  joinRequests: () => datastore.joinRequests,
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
});

export {
  hasPermission,
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
};
