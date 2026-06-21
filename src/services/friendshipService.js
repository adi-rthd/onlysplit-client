import client from '../api/client';
import { handleApiError } from '../utils/apiErrorHandler';
import toast from 'react-hot-toast';

const FriendshipStore = {
  searchUsers: async (query) => {
    try {
      const { data } = await client.get(
        `/friends/search?q=${query}`
      );

      return data?.data ?? [];
    } catch (error) {
      handleApiError(
        error,
        'Failed to search users.'
      );

      return [];
    }
  },

  getFriends: async () => {
    try {
      const { data } = await client.get(
        '/friends'
      );

      return data?.data ?? [];
    } catch (error) {
      handleApiError(
        error,
        'Failed to load friends.'
      );

      return [];
    }
  },

  getRequests: async () => {
    try {
      const { data } = await client.get(
        '/friends/requests'
      );

      return data?.data ?? [];
    } catch (error) {
      handleApiError(
        error,
        'Failed to load friend requests.'
      );

      return [];
    }
  },

  sendRequest: async (addresseeId) => {
    try {
      const { data } = await client.post(
        '/friends/request',
        {
          addresseeId,
        }
      );

      toast.success(
        data?.data || 'Friend request sent.'
      );

      return data?.data;
    } catch (error) {
      handleApiError(
        error,
        'Failed to send friend request.'
      );

      return null;
    }
  },

  acceptRequest: async (id) => {
    try {
      const { data } = await client.post(
        `/friends/${id}/accept`
      );

      toast.success(
        data?.data || 'Request accepted.'
      );

      return data?.data;
    } catch (error) {
      handleApiError(
        error,
        'Failed to accept request.'
      );

      return null;
    }
  },

  rejectRequest: async (id) => {
    try {
      const { data } = await client.post(
        `/friends/${id}/reject`
      );

      toast.success(
        data?.data || 'Request rejected.'
      );

      return data?.data;
    } catch (error) {
      handleApiError(
        error,
        'Failed to reject request.'
      );

      return null;
    }
  },

  removeFriend: async (friendId) => {
    try {
      const { data } = await client.delete(
        `/friends/${friendId}`
      );

      toast.success(
        data?.data || 'Friend removed.'
      );

      return data?.data;
    } catch (error) {
      handleApiError(
        error,
        'Failed to remove friend.'
      );

      return null;
    }
  },
};

export default FriendshipStore;