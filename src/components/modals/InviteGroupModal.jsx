import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import { motion } from 'framer-motion';

import {
  X,
  Search,
  Loader2,
  UserPlus,
  Check,
  Clock3,
} from 'lucide-react';

import FriendshipStore from '../../services/friendshipService';

import {
  useInvitationStore,
} from '../../store/groupInvitationStore';

const InviteGroupModal = () => {
  const { id: groupId } =
    useParams();

  const navigate =
    useNavigate();

  const isInvitationMode =
    groupId === 'bell';

  const tabs =
    isInvitationMode
      ? ['invitations']
      : ['friends', 'invited'];

  const [activeTab, setActiveTab] =
    useState(
      isInvitationMode
        ? 'invitations'
        : 'friends'
    );

  const [friends, setFriends] =
    useState([]);

  const [search, setSearch] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [invitingIds, setInvitingIds] =
    useState([]);

  const {
    invitations,
    invitedUsers,
    fetchMyInvitations,
    fetchGroupInvites,
    inviteToGroup,
    acceptInvitation,
    rejectInvitation,
  } = useInvitationStore();

  const loadData = async () => {
    setLoading(true);

    try {
      if (isInvitationMode) {
        await fetchMyInvitations();
      } else {
        const friendsData =
          await FriendshipStore.getFriends();

        await fetchGroupInvites(
          groupId
        );

        setFriends(
          friendsData || []
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const invitedUserIds =
    useMemo(() => {
      return (
        invitedUsers?.map(
          (invite) =>
            invite.invitedUserId
        ) || []
      );
    }, [invitedUsers]);

  const filteredFriends =
    useMemo(() => {
      return friends.filter(
        (friend) => {
          const matchesSearch =
            !search.trim() ||
            friend.firstName
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            friend.lastName
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            friend.email
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          return matchesSearch;
        }
      );
    }, [friends, search]);

  const handleInvite =
    async (userId) => {
      try {
        setInvitingIds(
          (prev) => [
            ...prev,
            userId,
          ]
        );

        const result =
          await inviteToGroup(
            groupId,
            userId
          );

        if (!result) return;

        await fetchGroupInvites(
          groupId
        );
      } catch (error) {
        console.error(error);
      } finally {
        setInvitingIds(
          (prev) =>
            prev.filter(
              (id) =>
                id !== userId
            )
        );
      }
    };

  const handleAccept =
    async (
      invitationId,
      notificationId
    ) => {
      await acceptInvitation(
        invitationId,
        notificationId
      );
    };

  const handleReject =
    async (
      invitationId,
      notificationId
    ) => {
      await rejectInvitation(
        invitationId,
        notificationId
      );
    };

  const renderUserCard = (
    user,
    actions
  ) => (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-glass-stroke bg-surface-container-low px-5 py-4">
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold">
          {user.firstName}{' '}
          {user.lastName}
        </p>

        <p className="truncate text-sm text-on-surface-variant">
          {user.email}
        </p>
      </div>

      <div className="shrink-0">
        {actions}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
          y: 20,
        }}
        className="flex h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-glass-stroke bg-surface-charcoal/90 shadow-2xl backdrop-blur-2xl"
      >
        {/* HEADER */}
        <header className="shrink-0 border-b border-glass-stroke bg-white/5 px-6 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold text-on-surface md:text-5xl">
                {isInvitationMode
                  ? 'Group Invitations'
                  : 'Invite Friends'}
              </h2>

              <p className="mt-1 text-sm text-on-surface-variant md:text-base">
                {isInvitationMode
                  ? 'Accept or reject invitations'
                  : 'Add friends to your group'}
              </p>
            </div>

            <button
              onClick={() =>
                navigate(-1)
              }
              className="rounded-full p-2 transition-colors hover:bg-white/10"
            >
              <X size={22} />
            </button>
          </div>
        </header>

        {/* BODY */}
        <div className="hide-scrollbar flex-1 space-y-6 overflow-y-auto px-6 py-5">
          {/* TABS */}
          <div className="hide-scrollbar flex items-center gap-8 overflow-x-auto border-b border-glass-stroke">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(
                    tab
                  );

                  setSearch('');
                }}
                className={`relative whitespace-nowrap pb-4 text-sm font-semibold capitalize transition-all md:text-lg ${
                  activeTab ===
                  tab
                    ? 'text-white'
                    : 'text-on-surface-variant hover:text-white'
                }`}
              >
                {tab}

                {activeTab ===
                  tab && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* LOADING */}
          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin" />
            </div>
          )}

          {/* INVITATIONS */}
          {!loading &&
            activeTab ===
              'invitations' && (
              <div className="space-y-4">
                {invitations.length ===
                0 ? (
                  <div className="py-20 text-center text-on-surface-variant">
                    No invitations.
                  </div>
                ) : (
                  invitations.map(
                    (
                      invitation
                    ) => (
                      <div
                        key={
                          invitation.invitationId
                        }
                        className="rounded-3xl border border-glass-stroke bg-surface-container-low p-5"
                      >
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="text-xl font-bold">
                              🔥 You
                              were
                              invited
                              to
                              join{' '}
                              {
                                invitation.groupName
                              }
                            </h3>

                            <p className="mt-1 text-on-surface-variant">
                              Invited
                              by{' '}
                              {
                                invitation.invitedByName
                              }
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() =>
                                handleAccept(
                                  invitation.invitationId,
                                  invitation.notificationId
                                )
                              }
                              className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-5 py-3 text-sm font-medium text-green-400 transition-all hover:bg-green-500/20"
                            >
                              <Check
                                size={
                                  16
                                }
                              />

                              Accept
                            </button>

                            <button
                              onClick={() =>
                                handleReject(
                                  invitation.invitationId,
                                  invitation.notificationId
                                )
                              }
                              className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20"
                            >
                              <X
                                size={
                                  16
                                }
                              />

                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            )}

          {/* FRIENDS */}
          {!loading &&
            activeTab ===
              'friends' && (
              <>
                <div className="flex items-center gap-3 rounded-3xl border border-glass-stroke bg-surface-container-low px-5 py-4">
                  <Search
                    size={20}
                    className="shrink-0 text-outline"
                  />

                  <input
                    type="text"
                    placeholder="Search friends..."
                    value={
                      search
                    }
                    onChange={(
                      e
                    ) =>
                      setSearch(
                        e.target
                          .value
                      )
                    }
                    className="w-full bg-transparent text-base outline-none placeholder:text-outline"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold md:text-xl">
                      Friends
                    </h3>

                    <span className="text-sm text-on-surface-variant">
                      {
                        filteredFriends.length
                      }{' '}
                      available
                    </span>
                  </div>

                  {filteredFriends.length ===
                  0 ? (
                    <div className="py-20 text-center text-on-surface-variant">
                      No
                      friends
                      available.
                    </div>
                  ) : (
                    filteredFriends.map(
                      (
                        friend
                      ) => {
                        const alreadyInvited =
                          invitedUserIds.includes(
                            friend.id
                          );

                        return renderUserCard(
                          friend,

                          alreadyInvited ? (
                            <div className="flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2.5 text-sm font-medium text-yellow-400">
                              <Clock3
                                size={
                                  16
                                }
                              />

                              Invited
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                handleInvite(
                                  friend.id
                                )
                              }
                              disabled={invitingIds.includes(
                                friend.id
                              )}
                              className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/15 px-4 py-2.5 text-sm font-medium text-primary transition-all hover:bg-primary/20"
                            >
                              {invitingIds.includes(
                                friend.id
                              ) ? (
                                <Loader2
                                  size={
                                    16
                                  }
                                  className="animate-spin"
                                />
                              ) : (
                                <UserPlus
                                  size={
                                    16
                                  }
                                />
                              )}

                              Invite
                            </button>
                          )
                        );
                      }
                    )
                  )}
                </div>
              </>
            )}

          {/* INVITED */}
          {!loading &&
            activeTab ===
              'invited' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold md:text-xl">
                    Invited
                    Users
                  </h3>

                  <span className="text-sm text-on-surface-variant">
                    {
                      invitedUsers.length
                    }{' '}
                    invited
                  </span>
                </div>

                {invitedUsers.length ===
                0 ? (
                  <div className="py-20 text-center text-on-surface-variant">
                    No
                    invites
                    yet.
                  </div>
                ) : (
                  invitedUsers.map(
                    (
                      user
                    ) =>
                      renderUserCard(
                        user,

                        <div className="flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-4 py-2.5 text-sm font-medium text-green-400">
                          <Check
                            size={
                              16
                            }
                          />

                          Invited
                        </div>
                      )
                  )
                )}
              </div>
            )}
        </div>
      </motion.div>
    </div>
  );
};

export default InviteGroupModal;