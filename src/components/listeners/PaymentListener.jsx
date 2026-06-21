/**
 * Global payment listener — renders nothing, just listens for
 * payment hub events and shows toast notifications.
 * Place in App.jsx or MainLayout.
 */
import { useMemo } from 'react';
import { usePaymentEvents } from '../../hooks/useSignalR';
import toast from 'react-hot-toast';

const PaymentListener = () => {
  const handlers = useMemo(() => ({
    PaymentCompleted: (data) => {
      toast.success(`Payment of ₹${data.amount || ''} completed!`);
    },
    PaymentFailed: () => {
      toast.error('Payment failed. Please try again.');
    },
    PaymentRefunded: (data) => {
      toast(`Payment of ₹${data.amount || ''} was refunded`, { icon: '↩️' });
    },
  }), []);

  usePaymentEvents(handlers);

  return null;
};

export default PaymentListener;
