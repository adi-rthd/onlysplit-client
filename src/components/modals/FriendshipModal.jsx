import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';
import FriendshipStore from '../../services/friendshipService';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  X,
  Search,
  Loader2,
  Check,
  UserPlus,
  Clock3,
  Trash2,
  Users,
} from 'lucide-react';


const tabs = [
  'friends',
  'received',
  'sent',
];

const FriendshipModal = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] =
    useState('friends');

  const [friends, setFriends] =
    useState([]);

  const [receivedRequests, setReceivedRequests] =
    useState([]);

  const [sentRequests, setSentRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [searchInput, setSearchInput] =
    useState('');

  const [search, setSearch] =
    useState('');

  const [searchResults, setSearchResults] =
    useState([]);

  const [sendingIds, setSendingIds] =
    useState([]);

  const [removingIds, setRemovingIds] =
    useState([]);

  const [processingIds, setProcessingIds] =
    useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        friendsData,
        requestsData,
      ] = await Promise.all([
        FriendshipStore.getFriends(),
        FriendshipStore.getRequests(),
      ]);

      setFriends(friendsData || []);

      const sent =
        requestsData?.filter(
          (r) =>
            r.status === 'Pending' &&
            r.isSender
        ) || [];

      const received =
        requestsData?.filter(
          (r) =>
            r.status === 'Pending' &&
            !r.isSender
        ) || [];

      setSentRequests(sent);
      setReceivedRequests(received);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        navigate(-1);
      }
    };

    window.addEventListener(
      'keydown',
      handleEscape
    );

    return () =>
      window.removeEventListener(
        'keydown',
        handleEscape
      );
  }, [navigate]);

  useEffect(() => {
    if (
      activeTab !== 'friends' ||
      !search.trim()
    ) {
      setSearchResults([]);
      return;
    }

    const runSearch = async () => {
      const users =
        await FriendshipStore.searchUsers(
          search
        );

      setSearchResults(users || []);
    };

    runSearch();
  }, [search, activeTab]);

  const filteredFriends = useMemo(() => {
    if (!search.trim()) {
      return friends;
    }

    const q =
      search.toLowerCase();

    return friends.filter(
      (friend) =>
        friend.firstName
          ?.toLowerCase()
          .includes(q) ||
        friend.lastName
          ?.toLowerCase()
          .includes(q) ||
        friend.email
          ?.toLowerCase()
          .includes(q)
    );
  }, [friends, search]);

  const handleSendRequest =
    async (id) => {
      try {
        setSendingIds((prev) => [
          ...prev,
          id,
        ]);

        await FriendshipStore.sendRequest(
          id
        );

        await loadData();
      } finally {
        setSendingIds((prev) =>
          prev.filter((x) => x !== id)
        );
      }
    };

  const handleAccept =
    async (id) => {
      try {
        setProcessingIds((prev) => [
          ...prev,
          id,
        ]);

        await FriendshipStore.acceptRequest(
          id
        );

        await loadData();
      } finally {
        setProcessingIds((prev) =>
          prev.filter((x) => x !== id)
        );
      }
    };

  const handleReject =
    async (id) => {
      try {
        setProcessingIds((prev) => [
          ...prev,
          id,
        ]);

        await FriendshipStore.rejectRequest(
          id
        );

        await loadData();
      } finally {
        setProcessingIds((prev) =>
          prev.filter((x) => x !== id)
        );
      }
    };

  const handleRemoveFriend =
    async (id) => {
      try {
        setRemovingIds((prev) => [
          ...prev,
          id,
        ]);

        await FriendshipStore.removeFriend(
          id
        );

        setFriends((prev) =>
          prev.filter(
            (friend) =>
              friend.id !== id
          )
        );
      } finally {
        setRemovingIds((prev) =>
          prev.filter((x) => x !== id)
        );
      }
    };
  const EmptyState = ({
    title,
    subtitle,
  }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Users
          size={28}
          className="text-on-surface-variant"
        />
      </div>

      <h3 className="text-lg font-semibold text-white">
        {title}
      </h3>

      <p className="text-sm text-on-surface-variant mt-2 max-w-xs">
        {subtitle}
      </p>
    </div>
  );

  const Avatar = ({ user }) => {
    const initial =
      user?.firstName?.[0] ||
      user?.requesterName?.[0] ||
      'U';

    return (
      <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center text-white font-semibold shrink-0">
        {initial.toUpperCase()}
      </div>
    );
  };

  const UserCard = ({
    user,
    children,
  }) => {
    const name =
      user?.requesterName ||
      `${user.firstName || ''} ${user.lastName || ''}`;

    const initial =
      user?.firstName?.[0] ||
      user?.requesterName?.[0] ||
      'U';

    return (
      <div className="rounded-2xl border border-glass-stroke bg-surface-container-low px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-11 h-11 rounded-full bg-primary/20 text-primary flex items-center justify-center font-semibold shrink-0">
              {initial.toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-on-surface">
                {name}
              </p>

              <p className="truncate text-sm text-on-surface-variant">
                {user.email}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {children}
          </div>
        </div>
      </div>
    );
  };

  const FriendCard = ({ user }) => {
    const isRemoving =
      removingIds.includes(user.id);

    const name =
      `${user.firstName || ''} ${user.lastName || ''}`;

    return (
      <div className="relative overflow-hidden rounded-2xl">
        {/* DELETE BG */}
        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-end px-6">
          <div className="flex items-center gap-2 text-red-400 font-medium">
            <Trash2 size={18} />
            Remove
          </div>
        </div>

        <motion.div
          drag="x"
          dragConstraints={{
            left: -120,
            right: 0,
          }}
          dragElastic={0.08}
          whileTap={{
            scale: 0.99,
          }}
          onDragEnd={(_, info) => {
            if (
              info.offset.x < -100 &&
              !isRemoving
            ) {
              handleRemoveFriend(
                user.id
              );
            }
          }}
          className="relative z-10 rounded-2xl border border-white/5 bg-surface-charcoal p-4 cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-3">
            <Avatar user={user} />

            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold truncate">
                {name}
              </h3>

              <p className="text-sm text-on-surface-variant truncate mt-1">
                {user.email}
              </p>
            </div>

            {isRemoving ? (
              <Loader2
                size={18}
                className="animate-spin text-red-400"
              />
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs border border-green-500/20">
                <Check size={14} />
                Friend
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  const SearchResultCard = ({
    user,
  }) => {
    const loading =
      sendingIds.includes(user.id);

    return (
      <UserCard user={user}>
        <button
          onClick={() =>
            handleSendRequest(
              user.id
            )
          }
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all disabled:opacity-60"
        >
          {loading ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <UserPlus size={16} />
          )}

          Add Friend
        </button>
      </UserCard>
    );
  };

  const ReceivedRequestCard = ({
    user,
  }) => {
    const loading =
      processingIds.includes(
        user.id
      );

    return (
      <UserCard user={user}>
        <div className="flex flex-wrap gap-2">
          <button
            disabled={loading}
            onClick={() =>
              handleAccept(user.id)
            }
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all"
          >
            <Check size={16} />
            Accept
          </button>

          <button
            disabled={loading}
            onClick={() =>
              handleReject(user.id)
            }
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
          >
            <X size={16} />
            Reject
          </button>
        </div>
      </UserCard>
    );
  };

  const SentRequestCard = ({
    user,
  }) => (
    <UserCard user={user}>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
        <Clock3 size={16} />
        Pending
      </div>
    </UserCard>
  ); return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-end md:items-center justify-center">
      <motion.div
        initial={{
          opacity: 0,
          y: 30,
          scale: 0.98,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          y: 30,
          scale: 0.98,
        }}
        transition={{
          duration: 0.2,
        }}
        className="
        w-full
        h-[100dvh]
        md:h-[85vh]
        md:max-w-3xl
        bg-surface-charcoal
        overflow-hidden
        flex
        flex-col
        rounded-none
        md:rounded-3xl
        border
        border-white/5
        shadow-2xl
      "
      >
        {/* HEADER */}
        <header className="sticky top-0 z-20 bg-surface-charcoal border-b border-white/5 px-4 md:px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Friends
              </h2>

              <p className="text-sm md:text-base text-on-surface-variant mt-1">
                Manage your OnlySplit connections
              </p>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-white/5 transition-all"
            >
              <X
                size={20}
                className="text-on-surface-variant"
              />
            </button>
          </div>

          {/* SEARCH */}
          <div className="mt-4">
            <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] border border-white/10 px-4 py-3 transition-all focus-within:border-primary/40 focus-within:bg-white/[0.05]">              <Search
              size={18}
              className="text-on-surface-variant shrink-0"
            />

              <input
                type="text"
                value={searchInput}
                onChange={(e) =>
                  setSearchInput(e.target.value)
                }
                placeholder="Search users..."
                className=" w-full bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none text-on-surface placeholder:text-on-surface-variant" />
            </div>
          </div>

          {/* TABS */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                }}
                className={`
        h-11
        rounded-xl
        text-sm
        font-medium
        transition-all
        border

        ${activeTab === tab
                    ? 'bg-primary/15 text-primary border-primary/30'
                    : 'bg-surface-container-low border-transparent text-on-surface-variant hover:text-on-surface'
                  }
      `}
              >
                {tab === 'friends'
                  ? 'Friends'
                  : tab === 'received'
                    ? 'Received'
                    : 'Sent'}
              </button>
            ))}
          </div>
        </header>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2
                size={28}
                className="animate-spin text-primary"
              />
            </div>
          ) : (
            <>
              {/* FRIENDS TAB */}
              {activeTab ===
                'friends' && (
                  <div className="space-y-4">
                    {/* SEARCH RESULTS */}
                    {searchResults.length >
                      0 && (
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-white font-semibold">
                              Search Results
                            </h3>

                            <span className="text-xs text-on-surface-variant">
                              {
                                searchResults.length
                              }{' '}
                              found
                            </span>
                          </div>

                          <div className="space-y-3">
                            {searchResults.map(
                              (user) => (
                                <SearchResultCard
                                  key={
                                    user.id
                                  }
                                  user={
                                    user
                                  }
                                />
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* FRIENDS */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-semibold">
                          Your Friends
                        </h3>

                        <span className="text-xs text-on-surface-variant">
                          {
                            filteredFriends.length
                          }{' '}
                          total
                        </span>
                      </div>

                      {filteredFriends.length ===
                        0 ? (
                        <EmptyState
                          title="No friends yet"
                          subtitle="Search for users and start building your network."
                        />
                      ) : (
                        <div className="space-y-3">
                          <AnimatePresence>
                            {filteredFriends.map(
                              (
                                friend
                              ) => (
                                <motion.div
                                  key={
                                    friend.id
                                  }
                                  layout
                                  initial={{
                                    opacity: 0,
                                    y: 10,
                                  }}
                                  animate={{
                                    opacity: 1,
                                    y: 0,
                                  }}
                                  exit={{
                                    opacity: 0,
                                    x: -50,
                                  }}
                                >
                                  <FriendCard
                                    user={
                                      friend
                                    }
                                  />
                                </motion.div>
                              )
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* RECEIVED TAB */}
              {activeTab ===
                'received' && (
                  <div className="space-y-3">
                    {receivedRequests.length ===
                      0 ? (
                      <EmptyState
                        title="No incoming requests"
                        subtitle="When someone sends you a request it will appear here."
                      />
                    ) : (
                      receivedRequests.map(
                        (user) => (
                          <ReceivedRequestCard
                            key={
                              user.id
                            }
                            user={
                              user
                            }
                          />
                        )
                      )
                    )}
                  </div>
                )}

              {/* SENT TAB */}
              {activeTab ===
                'sent' && (
                  <div className="space-y-3">
                    {sentRequests.length ===
                      0 ? (
                      <EmptyState
                        title="No sent requests"
                        subtitle="Friend requests you've sent will appear here."
                      />
                    ) : (
                      sentRequests.map(
                        (user) => (
                          <SentRequestCard
                            key={
                              user.id
                            }
                            user={
                              user
                            }
                          />
                        )
                      )
                    )}
                  </div>
                )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default FriendshipModal;