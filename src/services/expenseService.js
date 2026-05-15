import client from '../api/client';
import { handleApiError } from '../utils/apiErrorHandler';
import toast from 'react-hot-toast';

/**
 * Expense service — CRUD operations for expenses.
 * Designed for the ASP.NET Core backend API.
 */
const expenseService = {
  getExpenses: async (params = {}) => {
    try {
      const { data } = await client.get('/expenses', { params });
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to load expenses.');
      return null;
    }
  },

  getExpenseById: async (id) => {
    try {
      const { data } = await client.get(`/expenses/${id}`);
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to load expense details.');
      return null;
    }
  },

  createExpense: async (expenseData) => {
    try {
      const { data } = await client.post('/expenses', expenseData);
      toast.success('Expense added!');
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to create expense.');
      return null;
    }
  },

  updateExpense: async (id, expenseData) => {
    try {
      const { data } = await client.put(`/expenses/${id}`, expenseData);
      toast.success('Expense updated.');
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to update expense.');
      return null;
    }
  },

  deleteExpense: async (id) => {
    try {
      await client.delete(`/expenses/${id}`);
      toast.success('Expense deleted.');
      return true;
    } catch (error) {
      handleApiError(error, 'Failed to delete expense.');
      return false;
    }
  },

  splitExpense: async (id, splitData) => {
    try {
      const { data } = await client.post(`/expenses/${id}/split`, splitData);
      toast.success('Expense split successfully!');
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to split expense.');
      return null;
    }
  },
};

export default expenseService;
