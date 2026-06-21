import client from '../api/client';
import { handleApiError } from '../utils/apiErrorHandler';

/**
 * Analytics service — handles landing page statistics and analytics APIs.
 */
const analyticsService = {
  /**
   * Fetch public landing page statistics.
   *
   * @returns {Promise<{
   *   registeredUsers: number,
   *   activeGroups: number,
   *   expensesProcessed: number
   * } | null>}
   */
  getLandingStats: async () => {
    try {
      let { data } = await client.get('/basic-page/stats');

      data = data?.data || data;

      return {
        registeredUsers: data.registeredUsers || 0,
        activeGroups: data.activeGroups || 0,
        expensesProcessed: data.expensesProcessed || 0,
      };
    } catch (error) {
      handleApiError(
        error,
        'Failed to load landing page analytics.'
      );

      return null;
    }
  },

  getSpendingTrends: async () => {
    try {
      const { data } = await client.get('/analytics/spending-trends');
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to load spending trends.');
      return null;
    }
  },

  getCategoryBreakdown: async () => {
    try {
      const { data } = await client.get('/analytics/category-breakdown');
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to load category breakdown.');
      return null;
    }
  },

  getGroupBreakdown: async () => {
    try {
      const { data } = await client.get('/analytics/group-breakdown');
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to load group breakdown.');
      return null;
    }
  },

  /**
   * Track download-related events (fire-and-forget).
   *
   * @param {string} eventName - Event name (e.g., 'download_page_loaded', 'inapp_browser_detected')
   * @param {Record<string, any>} [metadata] - Optional metadata
   */
  trackDownloadEvent: (eventName, metadata = {}) => {
    try {
      console.log(`[Analytics:Download] ${eventName}`, metadata);
      // Fire-and-forget POST to analytics endpoint
      client.post('/analytics/download-event', {
        event: eventName,
        metadata,
        timestamp: new Date().toISOString(),
      }).catch(() => {
        // Silently ignore analytics failures
      });
    } catch {
      // Never let analytics break the user flow
    }
  },
};

export default analyticsService;