import client from '../api/client';
import { handleApiError } from '../utils/apiErrorHandler';
import toast from 'react-hot-toast';

const groupService = {
  getGroups: async () => {
    try {
      const { data } = await client.get('/groups');
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to load groups.');
      return null;
    }
  },

  getGroupById: async (groupId) => {
    try {
      const { data } = await client.get(`/groups/${groupId}`);
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to load group details.');
      return null;
    }
  },

  createGroup: async (groupData) => {
    try {
      const { data } = await client.post('/groups', groupData);
      toast.success('Group created successfully!');
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to create group.');
      return null;
    }
  },

  updateGroup: async (groupId, groupData) => {
    try {
      const { data } = await client.put(`/groups/${groupId}`, groupData);
      toast.success('Group updated.');
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to update group.');
      return null;
    }
  },

  deleteGroup: async (groupId) => {
    try {
      await client.delete(`/groups/${groupId}/delete`);
      toast.success('Group deleted.');
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to delete group.');
      return false;
    }
  },

  addMember: async (groupId, memberData) => {
    try {
      const { data } = await client.post(`/groups/${groupId}/members`, memberData);
      toast.success('Member added.');
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to add member.');
      return null;
    }
  },

  removeMember: async (groupId, memberId) => {
    try {
      await client.delete(`/groups/${groupId}/member/${memberId}`);
      toast.success('Member removed.');
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to remove member.');
      return false;
    }
  },

  invite: async (groupId, inviteData) => {
    try {
      const { data } = await client.post(`/groups/${groupId}/invite`, inviteData);
      toast.success('Invitations sent.');
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to send invitations.');
      return null;
    }
  },

  joinGroup: async (joinData) => {
    try {
      const { data } = await client.post(`/groups/join`, joinData);
      toast.success('Joined group successfully.');
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to join group.');
      return null;
    }
  }
};

export default groupService;
