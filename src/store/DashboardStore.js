import { create } from 'zustand';
import dashboardService from '../services/dashboardService';

export const useDashboardStore = create((set) => ({
  summary: null,
  isLoading: false,
  error: null,

  fetchSummary: async () => {
    set({ isLoading: true, error: null });

    try {
      const data = await dashboardService.getOverview();
      const summaryObj = data?.data || data;
      set({ summary: summaryObj, isLoading: false });
      return summaryObj;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  clearError: () =>
    set({
      error: null
    }),

  resetDashboard: () =>
    set({
      summary: null,
      error: null,
      isLoading: false
    })
}));