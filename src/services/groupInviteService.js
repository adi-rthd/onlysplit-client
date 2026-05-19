import client from '../api/client';
import { handleApiError } from '../utils/apiErrorHandler';
import toast from 'react-hot-toast';

const InviteGroupStore = {
    inviteToGroup: async (
        groupId,
        invitedUserId
    ) => {
        try {
            const { data } =
                await client.post(
                    '/group-invitations/invite',
                    {
                        groupId,
                        invitedUserId,
                    }
                );

            toast.success(
                data?.message ||
                'Invitation sent.'
            );

            return (
                data?.data ?? true
            );
        } catch (error) {
            handleApiError(
                error,
                'Failed to invite user.'
            );

            return null;
        }
    },
    getGroupInvites: async (
        groupId
    ) => {
        try {
            const { data } =
                await client.get(
                    `/group-invitations/${groupId}/invited`
                );

            return (
                data?.data ?? []
            );
        } catch (error) {
            handleApiError(
                error,
                'Failed to load invited users.'
            );

            return [];
        }
    },
    getMyInvites:
        async () => {
            try {
                const { data } =
                    await client.get(
                        '/group-invitations/mine'
                    );

                return (
                    data?.data ?? []
                );
            } catch (error) {
                handleApiError(
                    error,
                    'Failed to load invitations.'
                );

                return [];
            }
        },
    getMyNotifications:
        async () => {
            try {
                const { data } =
                    await client.get(
                        '/notifications'
                    );

                return (
                    data?.data ?? []
                );
            } catch (error) {
                handleApiError(
                    error,
                    'Failed to load invitations.'
                );

                return [];
            }
        },

    handleAccept:
        async (
            invitationId,
            notificationId
        ) => {
            const result =
                await InviteGroupStore.acceptInvite(
                    invitationId
                );

            if (!result) return;

            toast.success(
                'Invitation accepted.'
            );

            if (notificationId) {
                await InviteGroupStore.markNotificationAsRead(
                    notificationId
                );
            }

            setMyInvitations((prev) =>
                prev.filter(
                    (x) =>
                        x.invitationId !==
                        invitationId
                )
            );
        },

    handleReject:
        async (
            invitationId,
            notificationId
        ) => {
            const result =
                await InviteGroupStore.rejectInvite(
                    invitationId
                );

            if (!result) return;

            toast.success(
                'Invitation rejected.'
            );

            if (notificationId) {
                await InviteGroupStore.markNotificationAsRead(
                    notificationId
                );
            }

            setMyInvitations((prev) =>
                prev.filter(
                    (x) =>
                        x.invitationId !==
                        invitationId
                )
            );
        },
    markNotificationAsRead:
        async (
            notificationId
        ) => {
            try {
                await client.put(
                    `/notifications/${notificationId}/read`
                );

                return true;
            } catch (error) {
                handleApiError(
                    error,
                    'Failed to mark notification as read.'
                );

                return false;
            }
        },
};

export default InviteGroupStore;