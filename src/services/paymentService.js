import client from '../api/client';
import { handleApiError } from '../utils/apiErrorHandler';
import toast from 'react-hot-toast';

/**
 * Payment service — Razorpay integration architecture.
 *
 * Flow:
 *   1. Frontend calls createOrder() → backend creates a Razorpay order
 *   2. Frontend opens Razorpay checkout with the order ID
 *   3. On payment success, frontend calls verifyPayment() → backend verifies signature
 *   4. Settlement status updates, balances refresh via SignalR
 */
const paymentService = {
  /**
   * Ask the backend to create a Razorpay order for a settlement.
   * @param {{ settlementId: string, amount: number }} params
   * @returns {Promise<{ orderId: string, amount: number, currency: string } | null>}
   */
  createOrder: async ({ settlementId, amount }) => {
    try {
      const { data } = await client.post('/payments/create-order', { settlementId, amount });
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to initiate payment.');
      return null;
    }
  },

  /**
   * Verify the Razorpay payment signature on the backend.
   * @param {{ razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }} paymentData
   */
  verifyPayment: async (paymentData) => {
    try {
      const { data } = await client.post('/payments/verify', paymentData);
      toast.success('Payment verified! Settlement complete.');
      return data;
    } catch (error) {
      handleApiError(error, 'Payment verification failed.');
      return null;
    }
  },

  /**
   * Fetch payment/transaction history for the current user.
   */
  getPaymentHistory: async (params = {}) => {
    try {
      const { data } = await client.get('/payments/history', { params });
      return data;
    } catch (error) {
      handleApiError(error, 'Failed to load payment history.');
      return null;
    }
  },

  /**
   * Open the Razorpay checkout modal.
   * Requires the Razorpay script to be loaded in index.html.
   *
   * @param {{ orderId: string, amount: number, currency: string, onSuccess: function, onFailure: function }} options
   */
  openCheckout: ({ orderId, amount, currency = 'INR', onSuccess, onFailure }) => {
    const key = import.meta.env.VITE_RAZORPAY_KEY;
    if (!key) {
      toast.error('Payment gateway is not configured.');
      return;
    }

    const options = {
      key,
      amount: amount * 100, // Razorpay expects paise
      currency,
      order_id: orderId,
      name: 'OnlySplit',
      description: 'Settle expense',
      theme: { color: '#5e5ce6' },
      handler: (response) => {
        onSuccess?.(response);
      },
      modal: {
        ondismiss: () => {
          onFailure?.('Payment was cancelled.');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  },
};

export default paymentService;
