import client from '../api/client';

/**
 * Expense service — CRUD operations for expenses.
 * Designed for the ASP.NET Core backend API.
 *
 * All methods return raw data on success and let errors propagate.
 * Callers (mutation hooks, stores) are responsible for error handling and toasts.
 */
const expenseService = {
  getExpenses: async (params = {}) => {
    const { data } = await client.get('/expenses', { params });
    return data?.data || data;
  },

  getGroupExpenses: async (groupId, params = {}) => {
    const { data } = await client.get(`/expenses/group/${groupId}`, { params });
    return data?.data || [];
  },

  getExpenseById: async (id) => {
    const { data } = await client.get(`/expenses/${id}`);
    return data?.data || data;
  },

  createExpense: async (expenseData) => {
    const { data } = await client.post('/expenses', expenseData);
    return data?.data || data;
  },

  updateExpense: async (id, expenseData) => {
    const { data } = await client.put(`/expenses/${id}`, expenseData);
    const result = data?.data || data;
    // Backend may return 200 with { success: false, message: "..." }
    if (result && result.success === false) {
      throw { status: 403, message: result.message || 'Permission denied' };
    }
    return result;
  },

  deleteExpense: async (id) => {
    const { data } = await client.delete(`/expenses/${id}`);
    // Backend may return 200 with { success: false, message: "..." }
    if (data && data.success === false) {
      throw { status: 403, message: data.message || 'Permission denied' };
    }
    return true;
  },

  splitExpense: async (id, splitData) => {
    const { data } = await client.post(`/expenses/${id}/split`, splitData);
    return data?.data || data;
  },
};

export default expenseService;
