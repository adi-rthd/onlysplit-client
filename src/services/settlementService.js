import client from '../api/client';
import { handleApiError } from '../utils/apiErrorHandler';
import toast from 'react-hot-toast';

const settlementService = {
  getPendingSettlements: async groupId => {
    try {
      const { data } = await client.get(
        `/settlements/group/${groupId}`
      );

      return data.data;
    } catch (error) {
      handleApiError(error, 'Failed to load settlements.');
      return [];
    }
  },

  getBalances: async groupId => {
    try {
      const { data } = await client.get(
        `/settlements/group/${groupId}/balances`
      );

      return data.data;
    } catch (error) {
      handleApiError(error, 'Failed to load balances.');
      return [];
    }
  },

  regenerateSettlements: async groupId => {
    try {
      const { data } = await client.post(
        `/settlements/group/${groupId}/regenerate`
      );

      toast.success('Settlements regenerated successfully!');

      return data.data;
    } catch (error) {
      handleApiError(error, 'Failed to regenerate settlements.');
      return [];
    }
  },
};

export default settlementService;