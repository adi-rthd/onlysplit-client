import { create } from 'zustand';

import invitationService from '../services/groupInviteService';

export const useInvitationStore = create(
    (set, get) => ({
        invitations: [],

        notifications: [],

        invitedUsers: [],

        isLoading: false,

        fetchMyInvitations:
            async () => {
                try {
                    set({
                        isLoading: true,
                    });

                    const invitations =
                        await invitationService.getMyInvites();

                    set({
                        invitations,
                        isLoading: false,
                    });

                    return invitations;
                } catch (error) {
                    set({
                        isLoading: false,
                    });

                    return [];
                }
            },

        fetchNotifications:
            async () => {
                try {
                    set({
                        isLoading: true,
                    });

                    const notifications =
                        await invitationService.getMyNotifications();

                    set({
                        notifications,
                        isLoading: false,
                    });

                    return notifications;
                } catch (error) {
                    set({
                        isLoading: false,
                    });

                    return [];
                }
            },

        fetchGroupInvites:
            async (groupId) => {
                try {
                    set({
                        isLoading: true,
                    });

                    const invitedUsers =
                        await invitationService.getGroupInvites(
                            groupId
                        );

                    set({
                        invitedUsers,
                        isLoading: false,
                    });

                    return invitedUsers;
                } catch (error) {
                    set({
                        isLoading: false,
                    });

                    return [];
                }
            },

        inviteToGroup: async (
            groupId,
            invitedUserId
        ) => {
            return await invitationService.inviteToGroup(
                groupId,
                invitedUserId
            );
        },
        markAllNotificationsAsRead: async () => {
            const success = await invitationService.markAllNotificationsAsRead();

            if (!success) return false;

            set((state) => ({
                notifications: state.notifications.map(
                    (notification) => ({
                        ...notification,
                        isRead: true,
                    })
                ),
            }));

            return true;
        },

        acceptInvitation:
            async (
                invitationId,
                notificationId
            ) => {
                try {
                    set({
                        isLoading: true,
                    });

                    await invitationService.acceptInvite(
                        invitationId
                    );

                    if (notificationId) {
                        await invitationService.markNotificationAsRead(
                            notificationId
                        );
                    }

                    set((state) => ({
                        invitations:
                            state.invitations.filter(
                                (
                                    invitation
                                ) =>
                                    invitation.invitationId !==
                                    invitationId
                            ),

                        notifications:
                            state.notifications.filter(
                                (
                                    notification
                                ) =>
                                    notification.id !==
                                    notificationId
                            ),

                        isLoading: false,
                    }));

                    return true;
                } catch (error) {
                    set({
                        isLoading: false,
                    });

                    return false;
                }
            },

        rejectInvitation:
            async (
                invitationId,
                notificationId
            ) => {
                try {
                    set({
                        isLoading: true,
                    });

                    const result =
                        await invitationService.rejectInvite(
                            invitationId
                        );

                    if (!result) {
                        set({
                            isLoading: false,
                        });

                        return false;
                    }

                    if (notificationId) {
                        await invitationService.markNotificationAsRead(
                            notificationId
                        );
                    }

                    set((state) => ({
                        invitations:
                            state.invitations.filter(
                                (
                                    invitation
                                ) =>
                                    invitation.id !==
                                    invitationId
                            ),

                        notifications:
                            state.notifications.map(
                                (
                                    notification
                                ) =>
                                    notification.id ===
                                        notificationId
                                        ? {
                                            ...notification,
                                            isRead: true,
                                        }
                                        : notification
                            ),

                        isLoading: false,
                    }));

                    return true;
                } catch (error) {
                    set({
                        isLoading: false,
                    });

                    return false;
                }
            },

        clearInvitations:
            () => {
                set({
                    invitations: [],
                });
            },

        clearNotifications:
            () => {
                set({
                    notifications: [],
                });
            },
    })
);