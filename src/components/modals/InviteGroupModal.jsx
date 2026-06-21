import React, {
  useEffect,
  useMemo,
  useState,
  useRef, // Added for focus management
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
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef(null); // Reference to the search input

  const isInvitationMode = groupId === 'bell';

  const tabs = isInvitationMode
    ? ['invitations']
    : ['friends', 'invited'];

  const [activeTab, setActiveTab] = useState(
    isInvitationMode ? 'invitations' : 'friends'
  );

  const [friends, setFriends] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [invitingIds, setInvitingIds] = useState([]);

  const {
    invitations,
    invitedUsers,
    fetchMyInvitations,
    fetchGroupInvites,
    inviteToGroup,
    acceptInvitation,
    rejectInvitation,
  } = useInvitationStore();

  // Escape key
  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') navigate(-1); };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (isInvitationMode) {
        await fetchMyInvitations();
      } else {
        const friendsData = await FriendshipStore.getFriends();
        await fetchGroupInvites(groupId);
        setFriends(friendsData || []);
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

  // Fix: Ensure the input keeps focus if the tab is 'friends'
  useEffect(() => {
    if (activeTab === 'friends' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [search, activeTab]);

  const invitedUserIds = useMemo(() => {
    return invitedUsers?.map((invite) => invite.invitedUserId) || [];
  }, [invitedUsers]);

  const filteredFriends = useMemo(() => {
    return friends.filter((friend) => {
      const searchTerm = search.toLowerCase();
      return (
        !search.trim() ||
        friend.firstName?.toLowerCase().includes(searchTerm) ||
        friend.lastName?.toLowerCase().includes(searchTerm) ||
        friend.email?.toLowerCase().includes(searchTerm)
      );
    });
  }, [friends, search]);

  const handleInvite = async (userId) => {
    try {
      setInvitingIds((prev) => [...prev, userId]);
      const result = await inviteToGroup(groupId, userId);
      if (!result) return;
      await fetchGroupInvites(groupId);
    } catch (error) {
      console.error(error);
    } finally {
      setInvitingIds((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleAccept = async (invitationId, notificationId) => {
    await acceptInvitation(invitationId, notificationId);
  };

  const handleReject = async (invitationId, notificationId) => {
    await rejectInvitation(invitationId, notificationId);
  };

  const renderUserCard = (user, actions) => (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-glass-stroke bg-surface-container-low px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-base sm:text-lg font-bold leading-snug text-white">
          {user.firstName} {user.lastName}
        </p>
        <p className="truncate text-xs sm:text-sm text-on-surface-variant leading-normal mt-0.5">
          {user.email}
        </p>
      </div>
      <div className="shrink-0 ml-2">
        {actions}
      </div>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-[100] !ml-0 !left-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && navigate(-1)}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="flex h-[90vh] md:h-[80vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl glass-card shadow-2xl"
      >
        {/* HEADER */}
        <header className="shrink-0 px-5 py-4 border-b border-glass-stroke backdrop-blur-xl bg-white/[0.03]">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold text-on-surface sm:text-3xl">
                {isInvitationMode ? 'Group Invitations' : 'Invite Friends'}
              </h2>
              <p className="mt-1 text-xs text-on-surface-variant sm:text-sm">
                {isInvitationMode ? 'Accept or reject invitations' : 'Add friends to your group'}
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="rounded-full p-1.5 text-on-surface-variant transition-colors hover:bg-white/10 hover:text-white shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* BODY */}
        <div className="hide-scrollbar flex-1 space-y-5 sm:space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          {/* TABS */}
          <div className="hide-scrollbar flex items-center gap-6 sm:gap-8 overflow-x-auto border-b border-glass-stroke">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setSearch('');
                }}
                className={`relative whitespace-nowrap pb-3 text-sm font-semibold capitalize transition-all sm:text-base md:text-lg ${
                  activeTab === tab ? 'text-white font-bold' : 'text-on-surface-variant hover:text-white'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 h-[2px] w-full rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-primary" />
            </div>
          )}

          {!loading && activeTab === 'friends' && (
            <>
              {/* SEARCH INPUT - FIXED UGLY BORDER & FOCUS ISSUE */}
              <div className="flex items-center gap-3 rounded-2xl border border-glass-stroke bg-surface-container-low px-4 py-3.5 transition-all focus-within:ring-1 focus-within:ring-primary/40 focus-within:border-primary/40">
                <Search size={18} className="shrink-0 text-outline" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search friends..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm sm:text-base border-none outline-none focus:outline-none focus:ring-0 placeholder:text-outline text-white p-0"
                />
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between px-0.5">
                  <h3 className="text-base font-semibold sm:text-lg text-white">Friends</h3>
                  <span className="text-xs text-on-surface-variant">{filteredFriends.length} available</span>
                </div>

                {filteredFriends.length === 0 ? (
                  <div className="py-16 text-center text-sm text-on-surface-variant">No friends available.</div>
                ) : (
                  filteredFriends.map((friend) => {
                    const alreadyInvited = invitedUserIds.includes(friend.id);
                    return renderUserCard(
                      friend,
                      alreadyInvited ? (
                        <div className="flex items-center gap-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-2 text-xs font-medium text-yellow-400">
                          <Clock3 size={14} /> Invited
                        </div>
                      ) : (
                        <button
                          onClick={() => handleInvite(friend.id)}
                          disabled={invitingIds.includes(friend.id)}
                          className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/15 px-4 py-2 text-xs font-medium text-primary transition-all hover:bg-primary/20 disabled:opacity-50"
                        >
                          {invitingIds.includes(friend.id) ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <UserPlus size={14} />
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

          {/* ... Rest of the tabs (Invited/Invitations) follow same renderUserCard pattern ... */}
          {!loading && activeTab === 'invited' && (
            <div className="space-y-3 sm:space-y-4">
              {invitedUsers?.length === 0 ? (
                <div className="py-16 text-center text-sm text-on-surface-variant">No invited users yet.</div>
              ) : (
                invitedUsers.map(user => renderUserCard(user, <div className="flex items-center gap-1.5 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs font-medium text-yellow-400"><Clock3 size={12} /> Pending</div>))
              )}
            </div>
          )}

          {!loading && activeTab === 'invitations' && (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-base font-semibold sm:text-lg text-white">Pending Invitations</h3>

              {!invitations || invitations.length === 0 ? (
                <div className="py-16 text-center text-sm text-on-surface-variant">
                  No pending invitations.
                </div>
              ) : (
                invitations.map((invite) => (
                  <div
                    key={invite.invitationId || invite.id}
                    className="rounded-2xl border border-glass-stroke bg-surface-container-low p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold text-on-surface truncate">
                          {invite.groupName || 'Unknown Group'}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5">
                          Invited by {invite.inviterName || invite.senderName || invite.invitedByName || invite.sender?.firstName || 'a group member'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAccept(invite.invitationId, invite.notificationId)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-green-500/10 border border-green-500/20 py-2.5 text-sm font-medium text-green-400 hover:bg-green-500/20 transition-colors"
                      >
                        <Check size={14} />
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(invite.invitationId, invite.notificationId)}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-red-500/10 border border-red-500/20 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        <X size={14} />
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default InviteGroupModal;
