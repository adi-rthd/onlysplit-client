import { create } from 'zustand';
import expenseService from '../services/expenseService';

export const useExpenseStore = create((set, get) => ({
  expenses: [],
  isLoading: false,
  error: null,

  fetchExpenses: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await expenseService.getGroupExpenses(groupId);
      const expensesArray = Array.isArray(data) ? data : data?.data || [];
      set({ expenses: expensesArray, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  createExpense: async (expenseData) => {
    set({ isLoading: true, error: null });
    try {
      const newExpense = await expenseService.createExpense(expenseData);
      if (newExpense) {
        set((state) => ({ 
          expenses: [newExpense, ...state.expenses],
          isLoading: false 
        }));
      }
      return newExpense;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateExpense: async (id, expenseData) => {
    set({ isLoading: true, error: null });
    try {
      const updatedExpense = await expenseService.updateExpense(id, expenseData);
      if (updatedExpense) {
        set((state) => ({
          expenses: state.expenses.map(exp => exp.id === id ? updatedExpense : exp),
          isLoading: false
        }));
      }
      return updatedExpense;
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await expenseService.deleteExpense(id);
      set((state) => ({
        expenses: state.expenses.filter(exp => exp.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  }
}));
