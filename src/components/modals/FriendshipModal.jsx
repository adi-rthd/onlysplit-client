import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useNavigate } from 'react-router-dom';
import FriendshipStore from '../../services/friendshipService';
import Avatar from '../common/Avatar';

import {
  motion,
  AnimatePresence,
  useAnimation,
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

  const [showSearch, setShowSearch] =
    useState(false);

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
        receivedData,
        sentData,
      ] = await Promise.all([
        FriendshipStore.getFriends(),
        FriendshipStore.getRequests(),
        FriendshipStore.getSent(),
      ]);

      setFriends(friendsData || []);
      setReceivedRequests(receivedData || []);
      setSentRequests(sentData || []);
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

  const FMAvatar = ({ user }) => {
    return (
      <Avatar
        firstName={user?.firstName || user?.requesterName?.split(' ')[0]}
        lastName={user?.lastName || user?.requesterName?.split(' ')[1]}
        avatarUrl={user?.avatarUrl}
        size="md"
        className="w-11 h-11 md:w-12 md:h-12"
      />
    );
  };

  const UserCard = ({
    user,
    children,
  }) => {
    const name =
      user?.requesterName ||
      `${user.firstName || ''} ${user.lastName || ''}`;

    return (
      <div className="rounded-2xl border border-glass-stroke bg-surface-container-low px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar
              firstName={user?.firstName || user?.requesterName?.split(' ')[0]}
              lastName={user?.lastName || user?.requesterName?.split(' ')[1]}
              avatarUrl={user?.avatarUrl}
              size="md"
              className="w-11 h-11"
            />

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
    const [showConfirm, setShowConfirm] = useState(false);
    const controls = useAnimation();

    const name =
      `${user.firstName || ''} ${user.lastName || ''}`;

    const resetPosition = () => {
      controls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } });
    };

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
          dragMomentum={false}
          whileTap={{
            scale: 0.99,
          }}
          animate={controls}
          onDragEnd={(_, info) => {
            if (
              info.offset.x < -80 &&
              !isRemoving
            ) {
              setShowConfirm(true);
              resetPosition();
            } else {
              resetPosition();
            }
          }}
          className="relative z-10 rounded-2xl border border-white/5 bg-surface-charcoal p-4 cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-3">
            <FMAvatar user={user} />

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
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs border border-green-500/20">
                <Check size={14} />
                Friend
              </div>
            )}
          </div>
        </motion.div>

        {/* Confirm remove popup */}
        {showConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false); }}>
            <div className="bg-surface-container rounded-2xl border border-glass-stroke p-6 w-full max-w-xs text-center">
              <h3 className="text-lg font-bold text-on-surface mb-2">Remove Friend?</h3>
              <p className="text-sm text-on-surface-variant mb-5">Remove {name} from your friends list?</p>
              <div className="flex gap-3">
                <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-glass-stroke text-on-surface-variant text-sm font-medium">Cancel</button>
                <button onClick={() => { setShowConfirm(false); handleRemoveFriend(user.id); }} className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-semibold">Remove</button>
              </div>
            </div>
          </div>
        )}
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

    const name =
      user?.requesterName ||
      `${user.firstName || ''} ${user.lastName || ''}`;

    return (
      <div className="rounded-2xl border border-glass-stroke bg-surface-container-low p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            firstName={user?.firstName || user?.requesterName?.split(' ')[0]}
            lastName={user?.lastName || user?.requesterName?.split(' ')[1]}
            avatarUrl={user?.avatarUrl}
            size="md"
            className="w-11 h-11"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-on-surface">
              {name}
            </p>
            <p className="truncate text-sm text-on-surface-variant">
              {user.email}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            disabled={loading}
            onClick={() =>
              handleAccept(user.id)
            }
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 transition-all text-sm font-medium disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Accept
          </button>

          <button
            disabled={loading}
            onClick={() =>
              handleReject(user.id)
            }
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all text-sm font-medium disabled:opacity-50"
          >
            <X size={14} />
            Reject
          </button>
        </div>
      </div>
    );
  };

  const SentRequestCard = ({
    user,
  }) => {
    const name = user?.addresseeName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown';

    return (
      <div className="rounded-2xl border border-glass-stroke bg-surface-container-low px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar
              firstName={user?.firstName || user?.addresseeName?.split(' ')[0]}
              lastName={user?.lastName || user?.addresseeName?.split(' ')[1]}
              avatarUrl={user?.avatarUrl}
              size="md"
              className="w-11 h-11"
            />

            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-on-surface">
                {name}
              </p>

              <p className="truncate text-sm text-on-surface-variant">
                {user.email || ''}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <Clock3 size={16} />
              Pending
            </div>
          </div>
        </div>
      </div>
    );
  }; return (
    <div className="fixed inset-0 z-[100] !ml-0 !left-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && navigate(-1)}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full h-[92vh] md:h-[85vh] md:max-w-3xl glass-card overflow-hidden flex flex-col rounded-2xl shadow-2xl"
      >
        {/* HEADER */}
        <header className="sticky top-0 z-20 px-5 py-4 border-b border-glass-stroke backdrop-blur-xl bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-on-surface">
                Friends
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* Search toggle */}
              <button
                onClick={() => {
                  if (showSearch) { setSearchInput(''); setSearch(''); }
                  setShowSearch(!showSearch);
                }}
                className="w-8 h-8 rounded-lg glass-button flex items-center justify-center"
              >
                <Search size={14} className={showSearch ? 'text-primary' : 'text-on-surface-variant'} />
              </button>

              <button
                onClick={() => navigate(-1)}
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <X size={14} className="text-on-surface-variant" />
              </button>
            </div>
          </div>

          {/* Search bar — toggled */}
          {showSearch && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-container-low border border-glass-stroke px-3 py-2.5 focus-within:border-primary/40 transition-colors">
              <Search size={14} className="text-on-surface-variant shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search users or friends..."
                className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant/50"
              />
              {searchInput && (
                <button onClick={() => { setSearchInput(''); setSearch(''); }}>
                  <X size={12} className="text-on-surface-variant" />
                </button>
              )}
            </div>
          )}

          {/* TABS — underline style */}
          <div className="flex items-center gap-6 mt-3 border-b border-glass-stroke -mx-5 px-5">
            {tabs.map((tab) => {
              const count = tab === 'received' ? receivedRequests.length : tab === 'sent' ? sentRequests.length : 0;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-3 text-sm font-medium capitalize transition-all flex items-center gap-1.5 ${
                    activeTab === tab
                      ? 'text-on-surface'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tab === 'friends' ? 'Friends' : tab === 'received' ? 'Received' : 'Sent'}
                  {count > 0 && (
                    <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold px-1">
                      {count}
                    </span>
                  )}
                  {activeTab === tab && (
                    <span className="absolute left-0 bottom-0 w-full h-[2px] bg-primary rounded-full" />
                  )}
                </button>
              );
            })}
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
