import client from '../api/client';

/**
 * Friendship service — friend management operations.
 *
 * All methods return raw data on success and let errors propagate.
 * Callers (mutation hooks, stores) are responsible for error handling and toasts.
 */
const FriendshipStore = {
  searchUsers: async (query) => {
    const { data } = await client.get(`/friends/search?q=${query}`);
    return data?.data ?? [];
  },

  getFriends: async () => {
    const { data } = await client.get('/friends');
    return data?.data ?? [];
  },

  getRequests: async () => {
    const { data } = await client.get('/friends/requests');
    return data?.data ?? [];
  },

  getSent: async () => {
    const { data } = await client.get('/friends/sent');
    return data?.data ?? [];
  },

  sendRequest: async (addresseeId) => {
    const { data } = await client.post('/friends/request', { addresseeId });
    return data?.data || data;
  },

  acceptRequest: async (id) => {
    const { data } = await client.post(`/friends/${id}/accept`);
    return data?.data || data;
  },

  rejectRequest: async (id) => {
    const { data } = await client.post(`/friends/${id}/reject`);
    return data?.data || data;
  },

  removeFriend: async (friendId) => {
    const { data } = await client.delete(`/friends/${friendId}`);
    return data?.data || data;
  },
};

export default FriendshipStore;
