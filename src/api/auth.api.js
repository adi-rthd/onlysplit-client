import client from './client';

export const authApi = {
  signup: async (userData) => {
    const response = await client.post('/auth/signup', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await client.post('/auth/login', credentials);
    return response.data;
  },

  logout: async () => {
    // Optionally hit a backend endpoint to invalidate token
    // const response = await client.post('/auth/logout');
    // return response.data;
  },

  getCurrentUser: async () => {
    const response = await client.get('/auth/me');
    return response.data;
  },
  
  refresh: async () => {
    const response = await client.post('/auth/refresh');
    return response.data;
  }
};
