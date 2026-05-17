import client from '../api/client';
import { handleApiError } from '../utils/apiErrorHandler';
import toast from 'react-hot-toast';

const settlementService = {
  getSettlements: async (params = {}) => {
    try {
      const { data } = await client.get('/settlements', { params });
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to load settlements.');
      return null;
    }
  },

  getBalances: async (groupId) => {
    try {
      const { data } = await client.get(`/settlements/group/${groupId}/balances`);
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to load balances.');
      return null;
    }
  },

  regenerateSettlements: async (groupId) => {
    try {
      const { data } = await client.post(`/settlements/group/${groupId}/regenerate`);
      toast.success('Settlements recalculated successfully!');
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to regenerate settlements.');
      return null;
    }
  },

  createSettlement: async (settlementData) => {
    try {
      const { data } = await client.post('/settlements', settlementData);
      toast.success('Settlement recorded successfully!');
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to record settlement.');
      return null;
    }
  }
};

export default settlementService;
