import client from '../api/client';

/**
 * Dashboard service — fetches dashboard summary data.
 * Designed for the ASP.NET Core backend API.
 *
 * All methods return raw data on success and let errors propagate.
 * Callers (mutation hooks, stores) are responsible for error handling and toasts.
 */
const dashboardService = {
  getOverview: async () => {
    const { data } = await client.get('/dashboard/summary');
    return data?.data || data;
  },
};

export default dashboardService;
