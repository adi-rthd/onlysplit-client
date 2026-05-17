import client from './client';

export const expensesApi = {
  createExpense: async (expenseData) => {
    const response = await client.post('/expenses', expenseData);
    return response.data;
  },

  getGroupExpenses: async (groupId) => {
    const response = await client.get(`/expenses/group/${groupId}`);
    return response.data;
  },

  updateExpense: async (id, expenseData) => {
    const response = await client.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await client.delete(`/expenses/${id}`);
    return response.data;
  }
};
