import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import { useNavigate } from 'react-router-dom';

import { motion } from 'framer-motion';

import {
  X,
  Search,
  Loader2,
  Check,
  UserPlus,
  Trash2,
} from 'lucide-react';

import FriendshipStore from '../../services/friendshipService';

const tabs = [
  'friends',
  'requests',
  'pending',
];

const FriendshipModal = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [pending, setPending] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);

    try {
      const [
        friendsData,
        requestsData,
      ] = await Promise.all([
        FriendshipStore.getFriends(),
        FriendshipStore.getRequests(),
      ]);

      setFriends(friendsData || []);

      const sent =
        requestsData.filter(
          (r) =>
            r.status ===
              'Pending' &&
            r.isSender
        );

      const received =
        requestsData.filter(
          (r) =>
            r.status ===
              'Pending' &&
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
    if (
      activeTab !==
      'friends'
    ) {
      return;
    }

    const delay =
      setTimeout(async () => {
        if (
          !search.trim()
        ) {
          setSearchResults(
            []
          );

          return;
        }

        const users =
          await FriendshipStore.searchUsers(
            search
          );

        setSearchResults(
          users || []
        );
      }, 400);

    return () =>
      clearTimeout(delay);
  }, [search, activeTab]);

  const filteredFriends =
    useMemo(() => {
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

  const handleSendRequest =
    async (id) => {
      await FriendshipStore.sendRequest(
        id
      );

      loadData();
    };

  const handleAccept =
    async (id) => {
      await FriendshipStore.acceptRequest(
        id
      );

      loadData();
    };

  const handleReject =
    async (id) => {
      await FriendshipStore.rejectRequest(
        id
      );

      loadData();
    };

  const handleRemove =
    async (id) => {
      await FriendshipStore.removeFriend(
        id
      );

      loadData();
    };

  const renderUserCard = (
    user,
    actions
  ) => (
    <div
      key={user.id}
      className="
        flex
        items-center
        justify-between
        gap-3
        rounded-2xl
        border
        border-glass-stroke
        bg-surface-container-low
        px-4
        py-4
      "
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div
          className="
            w-12
            h-12
            md:w-14
            md:h-14
            rounded-full
            bg-gradient-to-br
            from-primary-container
            to-secondary-container
            flex
            items-center
            justify-center
            text-white
            text-lg
            md:text-xl
            font-bold
            shrink-0
          "
        >
          {user?.firstName?.[0] || user?.requesterName?.[0] }
        </div>

        <div className="min-w-0">
          <p className="font-semibold text-base md:text-lg truncate">
            {user?.requesterName || user.firstName + ' '  + user.lastName  }
          </p>

          <p className="text-xs md:text-sm text-on-surface-variant truncate">
            {user.email}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        {actions}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-0 md:p-4">
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
          y: 20,
        }}
        className="
          w-full
          h-full
          md:h-auto
          md:max-h-[92vh]
          md:max-w-5xl
          bg-surface-charcoal/95
          backdrop-blur-2xl
          border
          border-glass-stroke
          md:rounded-3xl
          shadow-2xl
          overflow-hidden
          flex
          flex-col
        "
      >
        {/* HEADER */}
        <header
          className="
            flex
            items-start
            justify-between
            px-5
            md:px-8
            py-5
            md:py-6
            border-b
            border-glass-stroke
            shrink-0
          "
        >
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-on-surface">
              Friends
            </h2>

            <p className="text-sm md:text-base text-on-surface-variant mt-1">
              Manage friends and requests
            </p>
          </div>

          <button
            onClick={() =>
              navigate(-1)
            }
            className="
              p-2
              rounded-full
              hover:bg-white/10
              transition-colors
            "
          >
            <X size={22} />
          </button>
        </header>

        {/* TABS */}
        <div className="px-5 md:px-8 pt-5 shrink-0">
          <div className="flex gap-2 md:gap-3 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(
                    tab
                  );

                  setSearch('');
                  setSearchResults(
                    []
                  );
                }}
                className={`
                  px-4
                  md:px-5
                  py-2.5
                  md:py-3
                  rounded-2xl
                  text-sm
                  md:text-lg
                  font-semibold
                  capitalize
                  whitespace-nowrap
                  transition-all
                  ${
                    activeTab ===
                    tab
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-white/5'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div
          className="
            flex-1
            overflow-y-auto
            px-5
            md:px-8
            py-5
            space-y-6
          "
        >
          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <>
              {/* FRIENDS TAB */}
              {activeTab ===
                'friends' && (
                <>
                  {/* SEARCH */}
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      rounded-3xl
                      border
                      border-glass-stroke
                      bg-surface-container-low
                      px-5
                      py-4
                      md:py-5
                    "
                  >
                    <Search
                      size={20}
                      className="text-outline shrink-0"
                    />

                    <input
                      type="text"
                      placeholder="Search users or friends..."
                      value={search}
                      onChange={(e) =>
                        setSearch(
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        bg-transparent
                        outline-none
                        text-base
                        md:text-lg
                        placeholder:text-outline
                      "
                    />
                  </div>

                  {/* SEARCH RESULTS */}
                  {searchResults.length >
                    0 && (
                    <div className="space-y-4">
                      <p className="text-xs md:text-sm uppercase tracking-wider text-on-surface-variant">
                        Search Results
                      </p>

                      {searchResults.map(
                        (user) =>
                          renderUserCard(
                            user,
                            <button
                              onClick={() =>
                                handleSendRequest(
                                  user.id
                                )
                              }
                              className="
                                bg-primary
                                text-white
                                px-4
                                md:px-5
                                py-2.5
                                md:py-3
                                rounded-2xl
                                flex
                                items-center
                                gap-2
                                font-medium
                                text-sm
                                md:text-base
                                hover:opacity-90
                              "
                            >
                              <UserPlus
                                size={16}
                              />

                              Add
                            </button>
                          )
                      )}
                    </div>
                  )}

                  {/* FRIENDS LIST */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg md:text-xl font-semibold">
                        Your Friends
                      </h3>

                      <span className="text-sm text-on-surface-variant">
                        {
                          filteredFriends.length
                        }{' '}
                        total
                      </span>
                    </div>

                    {filteredFriends.length ===
                    0 ? (
                      <div className="py-20 text-center text-on-surface-variant">
                        No friends found.
                      </div>
                    ) : (
                      filteredFriends.map(
                        (friend) =>
                          renderUserCard(
                            friend,
                            <button
                              onClick={() =>
                                handleRemove(
                                  friend.id
                                )
                              }
                              className="
                                p-3
                                rounded-2xl
                                bg-red-500/10
                                text-red-400
                                hover:bg-red-500/20
                              "
                            >
                              <Trash2
                                size={18}
                              />
                            </button>
                          )
                      )
                    )}
                  </div>
                </>
              )}

              {/* REQUESTS TAB */}
              {activeTab ===
                'requests' && (
                <div className="space-y-4">
                  {requests.length ===
                  0 ? (
                    <div className="py-20 text-center text-on-surface-variant">
                      No sent requests.
                    </div>
                  ) : (
                    requests.map(
                      (user) =>
                        renderUserCard(user,
                          <span
                            className="
                              px-4
                              py-2
                              rounded-2xl
                              bg-yellow-500/10
                              text-yellow-400
                              text-sm
                              font-medium
                            "
                          >
                            Pending
                          </span>
                        )
                    )
                  )}
                </div>
              )}

              {/* PENDING TAB */}
              {activeTab ===
                'pending' && (
                <div className="space-y-4">
                  {pending.length ===
                  0 ? (
                    <div className="py-20 text-center text-on-surface-variant">
                      No pending requests.
                    </div>
                  ) : (
                    pending.map(
                      (user) =>
                        renderUserCard(
                          user,
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleAccept(
                                  user.id
                                )
                              }
                              className="
                                p-3
                                rounded-2xl
                                bg-green-500/10
                                text-green-400
                                hover:bg-green-500/20
                              "
                            >
                              <Check
                                size={18}
                              />
                            </button>

                            <button
                              onClick={() =>
                                handleReject(
                                  user.id
                                )
                              }
                              className="
                                p-3
                                rounded-2xl
                                bg-red-500/10
                                text-red-400
                                hover:bg-red-500/20
                              "
                            >
                              <X
                                size={18}
                              />
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