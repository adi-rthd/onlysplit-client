/**
 * Global notification listener — renders nothing, just listens for
 * activity hub events and shows toast notifications.
 * Place in App.jsx or MainLayout.
 */
import { useMemo } from 'react';
import { useActivityEvents } from '../../hooks/useSignalR';
import toast from 'react-hot-toast';

const NotificationListener = () => {
  const handlers = useMemo(() => ({
    FriendRequestReceived: (data) => {
      toast(`${data.senderName || 'Someone'} sent you a friend request`, { icon: '👋' });
    },
    FriendRequestAccepted: (data) => {
      toast.success(`${data.recipientName || 'Your friend request'} was accepted!`);
    },
    FriendRequestRejected: () => {
      toast('Your friend request was declined', { icon: '😔' });
    },
    GroupInvitationReceived: (data) => {
      toast(`You were invited to join ${data.groupName || 'a group'}`, { icon: '🎉' });
    },
    GroupInvitationAccepted: (data) => {
      toast.success(`${data.recipientName || 'Someone'} joined ${data.groupName || 'your group'}`);
    },
    GroupInvitationRejected: (data) => {
      toast(`Your invitation to ${data.groupName || 'a group'} was declined`, { icon: '😔' });
    },
  }), []);

  useActivityEvents(handlers);

  return null;
};

export default NotificationListener;
