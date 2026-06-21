import client from '../api/client';

/**
 * Activity service — activity feed operations.
 *
 * All methods return raw data on success and let errors propagate.
 * Callers (mutation hooks, stores) are responsible for error handling and toasts.
 */
const activityService = {
  getActivities: async () => {
    const { data } = await client.get('/activities');
    return data?.data || [];
  },
};

export default activityService;
