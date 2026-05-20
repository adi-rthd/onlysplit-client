import React, { useEffect, useMemo, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';

import {
  X,
  Search,
  Loader2,
  Check,
  UserPlus,
  Clock3,
  Trash2,
} from 'lucide-react';

import FriendshipStore from '../../services/friendshipService';

const tabs = ['friends', 'requests', 'pending'];

const FriendshipModal = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('friends');

  const [friends, setFriends] = useState([]);

  const [requests, setRequests] = useState([]);

  const [pending, setPending] = useState([]);

  const [search, setSearch] = useState('');

  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const [sendingIds, setSendingIds] = useState([]);

  const [removingIds, setRemovingIds] = useState([]);

  const loadData = async () => {
    setLoading(true);

    try {
      const [friendsData, requestsData] =
        await Promise.all([
          FriendshipStore.getFriends(),
          FriendshipStore.getRequests(),
        ]);

      setFriends(friendsData || []);

      const sent = requestsData.filter(
        (r) =>
          r.status === 'Pending' &&
          r.isSender
      );

      const received =
        requestsData.filter(
          (r) =>
            r.status === 'Pending' &&
            !r.isSender
        );

      setRequests(sent);

      setPending(received);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab !== 'friends') {
      return;
    }

    const delay = setTimeout(async () => {
      if (!search.trim()) {
        setSearchResults([]);

        return;
      }

      const users =
        await FriendshipStore.searchUsers(
          search
        );

      setSearchResults(users || []);
    }, 400);

    return () => clearTimeout(delay);
  }, [search, activeTab]);

  const filteredFriends = useMemo(() => {
    if (!search.trim()) {
      return friends;
    }

    return friends.filter(
      (friend) =>
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
          )
    );
  }, [friends, search]);

  const handleSendRequest = async (id) => {
    try {
      setSendingIds((prev) => [
        ...prev,
        id,
      ]);

      await FriendshipStore.sendRequest(id);

      await loadData();
    } finally {
      setSendingIds((prev) =>
        prev.filter((x) => x !== id)
      );
    }
  };

  const handleAccept = async (id) => {
    await FriendshipStore.acceptRequest(id);

    loadData();
  };

  const handleReject = async (id) => {
    await FriendshipStore.rejectRequest(id);

    loadData();
  };

  const handleRemoveFriend = async (
    id
  ) => {
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

  const renderUserCard = (
    user,
    actions,
    swipeable = false
  ) => {
    if (!swipeable) {
      return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.03] px-5 py-4 transition-all hover:bg-white/[0.05]">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-lg font-semibold shrink-0">
              {user?.firstName?.[0] ||
                user?.requesterName?.[0] ||
                'U'}
            </div>

            <div className="min-w-0">
              <p className="text-white font-semibold text-lg truncate">
                {user?.requesterName ||
                  `${user.firstName || ''} ${
                    user.lastName || ''
                  }`}
              </p>

              <p className="text-sm text-zinc-500 truncate">
                {user.email}
              </p>
            </div>
          </div>

          <div className="shrink-0">
            {actions}
          </div>
        </div>
      );
    }

    return (
      <div className="relative overflow-hidden rounded-2xl">
        {/* DELETE BG */}
        <div className="absolute inset-0 flex items-center justify-end px-6">
          <div className="flex items-center gap-2 text-white font-medium">
            <Trash2 size={18} />
            Remove
          </div>
        </div>

        {/* SWIPE CARD */}
        <motion.div
          drag="x"
          dragConstraints={{
            left: -120,
            right: 0,
          }}
          dragElastic={0.08}
          onDragEnd={(_, info) => {
            if (
              info.offset.x < -100
            ) {
              handleRemoveFriend(
                user.id
              );
            }
          }}
          whileTap={{
            scale: 0.99,
          }}
          className="relative z-10 flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#0b0b0b] px-5 py-4 cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-lg font-semibold shrink-0">
              {user?.firstName?.[0] ||
                'U'}
            </div>

            <div className="min-w-0">
              <p className="text-white font-semibold text-lg truncate">
                {`${user.firstName || ''} ${
                  user.lastName || ''
                }`}
              </p>

              <p className="text-sm text-zinc-500 truncate">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20">
            <Check size={16} />
            Friend
          </div>
        </motion.div>
      </div>
    );
  };

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
        className="w-full max-w-2xl h-[82vh] bg-[#050505] shadow-[0_8px_30px_rgba(0,0,0,0.25)] rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* HEADER */}
        <header className="flex items-start justify-between px-8 py-7 border-b border-white/[0.06] shrink-0">
          <div>
            <h2 className="text-5xl font-bold tracking-tight text-white">
              Friends
            </h2>

            <p className="text-zinc-500 mt-2 text-lg">
              Manage friends and requests
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/5 transition-all text-zinc-400"
          >
            <X size={22} />
          </button>
        </header>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-8 py-6 space-y-6">
          {/* TABS */}
          <div className="flex items-center gap-8 border-b border-white/[0.06] overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);

                  setSearch('');

                  setSearchResults([]);
                }}
                className={`relative pb-4 text-lg font-semibold capitalize whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                {tab}

                {activeTab === tab && (
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-indigo-300 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-24 flex justify-center">
              <Loader2 className="animate-spin text-white" />
            </div>
          ) : (
            <>
              {/* FRIENDS */}
              {activeTab === 'friends' && (
                <>
                  <div className="flex items-center gap-4 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] bg-white/[0.03] px-6 py-5">
                    <Search
                      size={22}
                      className="text-zinc-600 shrink-0"
                    />

                    <input
                      type="text"
                      placeholder="Search users or friends..."
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      className="w-full bg-transparent outline-none text-lg text-white placeholder:text-zinc-600"
                    />
                  </div>

                  {/* SEARCH RESULTS */}
                  {searchResults.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-white">
                          Search Results
                        </h3>

                        <span className="text-sm text-zinc-500">
                          {
                            searchResults.length
                          }{' '}
                          found
                        </span>
                      </div>

                      {searchResults.map((user) =>
                        renderUserCard(
                          user,
                          <button
                            onClick={() =>
                              handleSendRequest(
                                user.id
                              )
                            }
                            disabled={sendingIds.includes(
                              user.id
                            )}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-indigo-400/15 text-indigo-300 text-sm font-medium border border-indigo-400/20 hover:bg-indigo-400/20 transition-all"
                          >
                            {sendingIds.includes(
                              user.id
                            ) ? (
                              <Loader2
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <UserPlus size={16} />
                            )}

                            Add Friend
                          </button>
                        )
                      )}
                    </div>
                  )}

                  {/* FRIENDS LIST */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-white">
                        Your Friends
                      </h3>

                      <span className="text-sm text-zinc-500">
                        {
                          filteredFriends.length
                        }{' '}
                        total
                      </span>
                    </div>

                    {filteredFriends.length ===
                    0 ? (
                      <div className="py-20 text-center text-zinc-500">
                        No friends found.
                      </div>
                    ) : (
                      <AnimatePresence>
                        {filteredFriends.map(
                          (friend) => (
                            <motion.div
                              key={friend.id}
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
                                x: -100,
                              }}
                            >
                              {renderUserCard(
                                friend,
                                null,
                                true
                              )}
                            </motion.div>
                          )
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                </>
              )}

              {/* REQUESTS */}
              {activeTab === 'requests' && (
                <div className="space-y-4">
                  {requests.length === 0 ? (
                    <div className="py-20 text-center text-zinc-500">
                      No sent requests.
                    </div>
                  ) : (
                    requests.map((user) =>
                      renderUserCard(
                        user,
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-medium border border-yellow-500/20">
                          <Clock3 size={16} />
                          Pending
                        </div>
                      )
                    )
                  )}
                </div>
              )}

              {/* PENDING */}
              {activeTab === 'pending' && (
                <div className="space-y-4">
                  {pending.length === 0 ? (
                    <div className="py-20 text-center text-zinc-500">
                      No pending requests.
                    </div>
                  ) : (
                    pending.map((user) =>
                      renderUserCard(
                        user,
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleAccept(
                                user.id
                              )
                            }
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-green-500/10 text-green-400 text-sm font-medium border border-green-500/20 hover:bg-green-500/20 transition-all"
                          >
                            <Check size={16} />
                            Accept
                          </button>

                          <button
                            onClick={() =>
                              handleReject(
                                user.id
                              )
                            }
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/20 hover:bg-red-500/20 transition-all"
                          >
                            <X size={16} />
                            Reject
                          </button>
                        </div>
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