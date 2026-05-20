import client from '../api/client';

import toast from 'react-hot-toast';

import { handleApiError } from '../utils/apiErrorHandler';

const invitationService = {
  inviteToGroup: async (
    groupId,
    invitedUserId
  ) => {
    try {
      const { data } =
        await client.post(
          '/group-invitations/invite',
          {
            groupId,
            invitedUserId,
          }
        );

      toast.success(
        data?.message ||
          'Invitation sent.'
      );

      return data?.data || true;
    } catch (error) {
      handleApiError(
        error,
        'Failed to invite user.'
      );

      return null;
    }
  },

  getGroupInvites: async (
    groupId
  ) => {
    try {
      const { data } =
        await client.get(
          `/group-invitations/${groupId}/invited`
        );

      return data?.data || [];
    } catch (error) {
      handleApiError(
        error,
        'Failed to load invited users.'
      );

      return [];
    }
  },

  getMyInvites: async () => {
    try {
      const { data } =
        await client.get(
          '/group-invitations/mine'
        );

      return data?.data || [];
    } catch (error) {
      handleApiError(
        error,
        'Failed to load invitations.'
      );

      return [];
    }
  },

  getMyNotifications:
    async () => {
      try {
        const { data } =
          await client.get(
            '/notifications'
          );

        return data?.data || [];
      } catch (error) {
        handleApiError(
          error,
          'Failed to load notifications.'
        );

        return [];
      }
    },

  acceptInvite: async (
    invitationId
  ) => {
    try {
      const { data } =
        await client.post(
          `/group-invitations/${invitationId}/accept`
        );

      return data?.data || true;
    } catch (error) {
      handleApiError(
        error,
        'Failed to accept invitation.'
      );

      return null;
    }
  },

  rejectInvite: async (
    invitationId
  ) => {
    try {
      const { data } =
        await client.post(
          `/group-invitations/${invitationId}/reject`
        );

      return data?.data || true;
    } catch (error) {
      handleApiError(
        error,
        'Failed to reject invitation.'
      );

      return null;
    }
  },

  markNotificationAsRead:
    async (
      notificationId
    ) => {
      try {
        await client.put(
          `/notifications/${notificationId}/read`
        );

        return true;
      } catch (error) {
        handleApiError(
          error,
          'Failed to mark notification as read.'
        );

        return false;
      }
    },
};

export default invitationService;