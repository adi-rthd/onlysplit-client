import client from '../api/client';
import { handleApiError } from '../utils/apiErrorHandler';

const dashboardService = {
  getOverview: async () => {
    try {
      const { data } = await client.get('/dashboard/summary');

      return data?.data;
    } catch (error) {
      handleApiError(error, 'Failed to load dashboard overview.');
      return null;
    }
  }
};

export default dashboardService;
