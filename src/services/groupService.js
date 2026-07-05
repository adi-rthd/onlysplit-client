import client from '../api/client';

/**
 * Group service — CRUD operations for groups and membership.
 * Designed for the ASP.NET Core backend API.
 *
 * All methods return raw data on success and let errors propagate.
 * Callers (mutation hooks, stores) are responsible for error handling and toasts.
 */
const groupService = {
  getGroups: async () => {
    const { data } = await client.get('/groups');
    return data?.data || data;
  },

  getGroupById: async (groupId) => {
    const { data } = await client.get(`/groups/${groupId}`);
    return data?.data || data;
  },

  createGroup: async (groupData) => {
    const { data } = await client.post('/groups', groupData);
    return data?.data || data;
  },

  updateGroup: async (groupId, groupData) => {
    const { data } = await client.put(`/groups/${groupId}`, groupData);
    return data?.data || data;
  },

  deleteGroup: async (groupId) => {
    await client.delete(`/groups/${groupId}/delete`);
    return true;
  },

  addMember: async (groupId, memberData) => {
    const { data } = await client.post(`/groups/${groupId}/members`, memberData);
    return data?.data || data;
  },

  removeMember: async (groupId, memberId) => {
    await client.delete(`/groups/${groupId}/member/${memberId}`);
    return true;
  },

  invite: async (groupId, inviteData) => {
    const { data } = await client.post(`/groups/${groupId}/invite`, inviteData);
    return data?.data || data;
  },

  joinGroup: async (joinData) => {
    const { data } = await client.post(`/groups/join`, joinData);
    return data?.data || data;
  },

  leaveGroup: async (groupId) => {
    const { data } = await client.post(`/groups/${groupId}/leave`);
    return data?.data || data;
  },
};

export default groupService;
