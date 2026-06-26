import client from '../api/client';

const settlementService = {
  getPendingSettlements: async (groupId) => {
    try {
      const { data } = await client.get(`/settlements/group/${groupId}`);
      return data.data;
    } catch (error) {
      const status = error.response?.status || 0;
      const message = error.response?.data?.message || error.message || 'Failed to load settlements.';
      throw { status, message };
    }
  },

  getBalances: async (groupId) => {
    try {
      const { data } = await client.get(`/settlements/group/${groupId}/balances`);
      return data.data;
    } catch (error) {
      const status = error.response?.status || 0;
      const message = error.response?.data?.message || error.message || 'Failed to load balances.';
      throw { status, message };
    }
  },

  regenerateSettlements: async (groupId) => {
    try {
      const { data } = await client.post(`/settlements/group/${groupId}/regenerate`);
      return data.data;
    } catch (error) {
      const status = error.response?.status || 0;
      const message = error.response?.data?.message || error.message || 'Failed to regenerate settlements.';
      throw { status, message };
    }
  },

  getGlobalPendingSettlements: async () => {
    try {
      const { data } = await client.get(`/settlements/summary`);
      return data.data;
    } catch (error) {
      const status = error.response?.status || 0;
      const message = error.response?.data?.message || error.message || 'Failed to load global settlements.';
      throw { status, message };
    }
  },
};

export default settlementService;