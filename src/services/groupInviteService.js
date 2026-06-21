import client from '../api/client';

/**
 * Invitation service — group invitations and notifications.
 * Designed for the ASP.NET Core backend API.
 *
 * All methods return raw data on success and let errors propagate.
 * Callers (mutation hooks, stores) are responsible for error handling and toasts.
 */
const invitationService = {
  inviteToGroup: async (groupId, invitedUserId) => {
    const { data } = await client.post('/group-invitations/invite', {
      groupId,
      invitedUserId,
    });
    return data?.data || data;
  },

  getGroupInvites: async (groupId) => {
    const { data } = await client.get(`/group-invitations/${groupId}/invited`);
    return data?.data || [];
  },

  getMyInvites: async () => {
    const { data } = await client.get('/group-invitations/mine');
    return data?.data || [];
  },

  getMyNotifications: async () => {
    const { data } = await client.get('/notifications');
    return data?.data || [];
  },

  acceptInvite: async (invitationId) => {
    const { data } = await client.post(`/group-invitations/${invitationId}/accept`);
    return data?.data || true;
  },

  rejectInvite: async (invitationId) => {
    const { data } = await client.post(`/group-invitations/${invitationId}/reject`);
    return data?.data || true;
  },

  markNotificationAsRead: async (notificationId) => {
    await client.put(`/notifications/${notificationId}/read`);
    return true;
  },

  markAllNotificationsAsRead: async () => {
    await client.put('/notifications/read-all');
    return true;
  },
};

export default invitationService;
