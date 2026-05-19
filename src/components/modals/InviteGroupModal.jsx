import React, { useEffect, useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import { motion } from 'framer-motion';

import toast from 'react-hot-toast';

import {
  X,
  Search,
  Loader2,
  UserPlus,
  Check,
  Clock3,
} from 'lucide-react';

import FriendshipStore from '../../services/friendshipService';
import InviteGroupStore from '../../services/groupInviteService';

const InviteGroupModal = () => {
  const { id: groupId } = useParams();

  const navigate = useNavigate();

  const isInvitationMode =
    groupId === 'bell';

  const tabs = isInvitationMode
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

  const [groupInvites, setGroupInvites] =
    useState([]);

  const [myInvitations, setMyInvitations] =
    useState([]);

  const loadData = async () => {
    setLoading(true);

    try {
      if (isInvitationMode) {
        const invitations =
          await InviteGroupStore.getMyInvites();

        setMyInvitations(
          invitations || []
        );
      } else {
        const [
          friendsData,
          invitesData,
        ] = await Promise.all([
          FriendshipStore.getFriends(),
          InviteGroupStore.getGroupInvites(
            groupId
          ),
        ]);

        setFriends(
          friendsData || []
        );

        setGroupInvites(
          invitesData || []
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
        groupInvites?.map(
          (invite) =>
            invite.invitedUserId
        ) || []
      );
    }, [groupInvites]);

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

  const invitedUsers =
    useMemo(() => {
      return groupInvites.map(
        (invite) => ({
          id:
            invite.invitedUserId,

          firstName:
            invite.invitedUserName?.split(
              ' '
            )[0] || '',

          lastName:
            invite.invitedUserName
              ?.split(' ')
              ?.slice(1)
              ?.join(' ') || '',

          email:
            invite.invitedUserEmail,
        })
      );
    }, [groupInvites]);

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
          await InviteGroupStore.inviteToGroup(
            groupId,
            userId
          );

        if (!result) return;

        toast.success(
          'Invitation sent.'
        );

        await loadData();
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
    };

  const handleReject =
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
    };

 const renderUserCard = (
  user,
  actions
) => (
  <div className="flex items-center justify-between gap-4 rounded-2xl border border-glass-stroke bg-surface-container-low px-5 py-4">
    <div className="min-w-0">
      <p className="font-semibold text-lg truncate">
        {user.firstName} {user.lastName}
      </p>

      <p className="text-sm text-on-surface-variant truncate">
        {user.email}
      </p>
    </div>

    <div className="shrink-0">
      {actions}
    </div>
  </div>
);

 return (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
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
      className="w-full max-w-xl h-[80vh] bg-surface-charcoal/90 backdrop-blur-2xl border border-glass-stroke rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* HEADER */}
      <header className="flex items-start justify-between px-6 py-5 border-b border-glass-stroke bg-white/5 shrink-0">
        <div>
          <h2 className="text-3xl md:text-5xl font-bold text-on-surface">
            {isInvitationMode
              ? 'Group Invitations'
              : 'Invite Friends'}
          </h2>

          <p className="text-sm md:text-base text-on-surface-variant mt-1">
            {isInvitationMode
              ? 'Accept or reject invitations'
              : 'Add friends to your group'}
          </p>
        </div>

        <button
          onClick={() =>
            navigate(-1)
          }
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={22} />
        </button>
      </header>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-5 space-y-6">
        {/* TABS INSIDE BODY */}
        <div className="flex items-center gap-8 border-b border-glass-stroke overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSearch('');
              }}
              className={`relative pb-4 text-sm md:text-lg font-semibold capitalize whitespace-nowrap transition-all ${activeTab === tab ? 'text-white' : 'text-on-surface-variant hover:text-white'}`}
            >
              {tab}

              {activeTab === tab && (
                <span className="absolute left-0 bottom-0 w-full h-[2px] bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* INVITATIONS */}
        {activeTab === 'invitations' && (
          <div className="space-y-4">
            {myInvitations.length === 0 ? (
              <div className="py-20 text-center text-on-surface-variant">
                No invitations.
              </div>
            ) : (
              myInvitations.map((invitation) => (
                <div key={invitation.invitationId} className="rounded-3xl border border-glass-stroke bg-surface-container-low p-5">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                    <div>
                      <h3 className="text-xl font-bold">
                        🔥 You were invited to join {invitation.groupName}
                      </h3>

                      <p className="text-on-surface-variant mt-1">
                        Invited by {invitation.invitedByName}
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
                        className="flex items-center gap-2 px-5 py-3 rounded-full bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20 hover:bg-green-500/20 transition-all"
                      >
                        <Check size={16} />
                        Accept
                      </button>

                      <button
                        onClick={() =>
                          handleReject(
                            invitation.invitationId,
                            invitation.notificationId
                          )
                        }
                        className="flex items-center gap-2 px-5 py-3 rounded-full bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/20 hover:bg-red-500/20 transition-all"
                      >
                        <X size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* FRIENDS */}
        {activeTab === 'friends' && (
          <>
            <div className="flex items-center gap-3 rounded-3xl border border-glass-stroke bg-surface-container-low px-5 py-4">
              <Search size={20} className="text-outline shrink-0" />

              <input
                type="text"
                placeholder="Search friends..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="w-full bg-transparent outline-none text-base placeholder:text-outline"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg md:text-xl font-semibold">
                  Friends
                </h3>

                <span className="text-sm text-on-surface-variant">
                  {filteredFriends.length} available
                </span>
              </div>

              {filteredFriends.length === 0 ? (
                <div className="py-20 text-center text-on-surface-variant">
                  No friends available.
                </div>
              ) : (
                filteredFriends.map((friend) => {
                  const alreadyInvited =
                    invitedUserIds.includes(friend.id);

                  return renderUserCard(
                    friend,
                    alreadyInvited ? (
                      <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-medium border border-yellow-500/20">
                        <Clock3 size={16} />
                        Invited
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          handleInvite(friend.id)
                        }
                        disabled={invitingIds.includes(friend.id)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary/15 text-primary text-sm font-medium border border-primary/20 hover:bg-primary/20 transition-all"
                      >
                        {invitingIds.includes(friend.id) ? (
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <UserPlus size={16} />
                        )}

                        Invite
                      </button>
                    )
                  );
                })
              )}
            </div>
          </>
        )}

        {/* INVITED */}
        {activeTab === 'invited' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-semibold">
                Invited Users
              </h3>

              <span className="text-sm text-on-surface-variant">
                {invitedUsers.length} invited
              </span>
            </div>

            {invitedUsers.length === 0 ? (
              <div className="py-20 text-center text-on-surface-variant">
                No invites yet.
              </div>
            ) : (
              invitedUsers.map((user) =>
                renderUserCard(
                  user,
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20">
                    <Check size={16} />
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