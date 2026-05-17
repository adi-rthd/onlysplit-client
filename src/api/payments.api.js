import client from './client';

export const paymentsApi = {
  createOrder: async (paymentData) => {
    const response = await client.post('/payments/create-order', paymentData);
    return response.data;
  },

  verifyPayment: async (verificationData) => {
    const response = await client.post('/payments/verify', verificationData);
    return response.data;
  },

  getPaymentHistory: async () => {
    const response = await client.get('/payments/history');
    return response.data;
  }
};
