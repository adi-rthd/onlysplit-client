import client from '../api/client';

/**
 * Settlement Payment Service
 * Maps 1:1 to backend settlement payment APIs.
 */
const settlementPaymentService = {
  /**
   * GET /api/settlements/{settlementId}/payments
   * Fetches all payments for a settlement.
   */
  getPayments: async (settlementId) => {
    const { data } = await client.get(`/settlements/${settlementId}/payments`);
    return data.data;
  },

  /**
   * POST /api/settlements/{settlementId}/payments
   * Records a new manual payment.
   * @param {string} settlementId
   * @param {{ amount: number, method: string, transactionReference?: string, notes?: string }} payload
   */
  recordPayment: async (settlementId, payload) => {
    // Map frontend method keys to backend-expected values
    const methodMap = {
      cash: 'Cash',
      upi: 'UPI',
      bank_transfer: 'BankTransfer',
      banktransfer: 'BankTransfer',
    };

    const backendPayload = {
      ...payload,
      method: methodMap[payload.method?.toLowerCase()] || payload.method,
    };

    const { data } = await client.post(`/settlements/${settlementId}/payments`, backendPayload);
    return data.data;
  },

  /**
   * POST /api/settlements/payments/{paymentId}/confirm
   * Confirms a pending payment (receiver only).
   */
  confirmPayment: async (paymentId) => {
    const { data } = await client.post(`/settlements/payments/${paymentId}/confirm`);
    return data.data;
  },

  /**
   * POST /api/settlements/payments/{paymentId}/reject
   * Rejects a pending payment with a reason (receiver only).
   * @param {string} paymentId
   * @param {{ reason: string }} payload
   */
  rejectPayment: async (paymentId, payload) => {
    const { data } = await client.post(`/settlements/payments/${paymentId}/reject`, payload);
    return data.data;
  },

  /**
   * POST /api/settlements/payments/{paymentId}/cancel
   * Cancels a pending payment (payer only).
   */
  cancelPayment: async (paymentId) => {
    const { data } = await client.post(`/settlements/payments/${paymentId}/cancel`);
    return data.data;
  },

  /**
   * POST /api/settlements/payments/{paymentId}/proof
   * Uploads proof file for a payment.
   * @param {string} paymentId
   * @param {File} file
   */
  uploadProof: async (paymentId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await client.post(`/settlements/payments/${paymentId}/proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  },
};

export default settlementPaymentService;
