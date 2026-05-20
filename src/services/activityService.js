import client from '../api/client';

import { handleApiError } from '../utils/apiErrorHandler';

const activityService = {
  getActivities: async () => {
    try {
      const { data } =
        await client.get('/activities');

      return data?.data || [];
    } catch (error) {
      handleApiError(
        error,
        'Failed to load activities.'
      );

      return [];
    }
  },
};

export default activityService;