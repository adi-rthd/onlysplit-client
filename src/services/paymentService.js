import client from '../api/client';
import { handleApiError } from '../utils/apiErrorHandler';
import toast from 'react-hot-toast';

const paymentService = {
  createOrder: async (settlementId) => {
    try {
      const { data } = await client.post('/payments/create-order', {
        settlementId,
      });

      return data.data;
    } catch (error) {
      handleApiError(error, 'Failed to initiate payment.');
      return null;
    }
  },

  verifyPayment: async paymentData => {
    try {
      const { data } = await client.post('/payments/verify', paymentData);

      toast.success('Payment verified successfully!');

      return data.data;
    } catch (error) {
      handleApiError(error, 'Payment verification failed.');
      return null;
    }
  },

  getPaymentHistory: async () => {
    try {
      const { data } = await client.get('/payments/history');

      return data.data;
    } catch (error) {
      handleApiError(error, 'Failed to load payment history.');
      return [];
    }
  },

  openCheckout: ({ order, onSuccess, onFailure }) => {
    const options = {
      key: order.keyId,
      amount: Number(order.amount) * 100,
      currency: order.currency,
      order_id: order.orderId,

      name: 'OnlySplit',
      description: 'Settlement Payment',

      theme: {
        color: '#6D5DFC',
      },

      handler: response => {
        console.log('RAZORPAY RESPONSE', response);

        onSuccess?.(response);
      },

      modal: {
        ondismiss: () => {
          onFailure?.('Payment cancelled.');
        },
      },
    };

    console.log('ORDER OBJECT', order);
    console.log('RAZORPAY OPTIONS', options);
    const razorpay = new window.Razorpay(options);

    razorpay.open();
  }
};

export default paymentService;