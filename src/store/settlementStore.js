import { create } from 'zustand';
import settlementService from '../services/settlementService';

export const useSettlementStore = create((set, get) => ({
  balances: [],
  settlements: [], 
  globalSettlements: [], 
  isLoading: false,
  error: null,

  fetchBalances: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await settlementService.getBalances(groupId);

      set({ balances: Array.isArray(data) ? data : [], isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.message, balances: [], isLoading: false });
      return [];
    }
  },

  fetchSettlements: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await settlementService.getPendingSettlements(groupId);
      const settlementsArray = Array.isArray(data) ? data : data?.data || data?.settlements || [];
      set({
        settlements: settlementsArray,
        isLoading: false
      });
      return data;
    } catch (error) {
      set({ error: error.message, settlements: [], isLoading: false });
      return [];
    }
  },

  // ✅ NEW: Fetcher for the global dashboard
  fetchGlobalSettlements: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await settlementService.getGlobalPendingSettlements();
      const settlementsArray = Array.isArray(data) ? data : data?.data || data?.settlements || [];
      set({
        globalSettlements: settlementsArray,
        isLoading: false
      });
      return data;
    } catch (error) {
      set({ error: error.message, globalSettlements: [], isLoading: false });
      return [];
    }
  },

  regenerateSettlements: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await settlementService.regenerateSettlements(groupId);
      set({
        settlements: Array.isArray(data) ? data : data?.settlements || [],
        isLoading: false
      });
      await get().fetchBalances(groupId);
      return data;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  /**
   * CLEAR DATA
   */
  clearSettlements: () =>
    set({
      balances: [],
      settlements: [],
      globalSettlements: [], 
      error: null
    }),

  clearError: () =>
    set({
      error: null
    })
}));