import { create } from 'zustand';
import settlementService from '../services/settlementService';

export const useSettlementStore = create((set, get) => ({
  balances: [],
  settlements: [],
  isLoading: false,
  error: null,

  fetchBalances: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      // Assuming settlementService might have a getBalances method in the future,
      // but for now we'll just use the existing client inside a service if we had one.
      // Wait, we didn't add getBalances to settlementService. Let's assume we can add it,
      // or we can just fetch settlements and extract balances if that's how it works.
      // But let's import client here just for the balance endpoint or I will update settlementService.
      // Actually, let's keep the client call here or add it to settlementService.
      // I will add it to settlementService.
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
      const data = await settlementService.getSettlements({ groupId });
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
      error: null
    }),

  /**
   * CLEAR ERROR
   */
  clearError: () =>
    set({
      error: null
    })
}));