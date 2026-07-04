/**
 * Friends Page — manage friends, accept/reject requests, search users.
 * Clean, minimal, mobile-first design.
 */
import { useEffect, useMemo, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Search, Loader2, Check, UserPlus, Clock3, Trash2, X, Users } from 'lucide-react';
import FriendshipStore from '../services/friendshipService';
import { featureFlags } from '../utils/featureFlags';
import { useFriends, useFriendRequests, useSentRequests } from '../queries/hooks/useFriends';
import { useSendFriendRequest } from '../queries/mutations/useSendFriendRequest';
import { useAcceptFriendRequest } from '../queries/mutations/useAcceptFriendRequest';
import { useRejectFriendRequest } from '../queries/mutations/useRejectFriendRequest';
import { useRemoveFriend } from '../queries/mutations/useRemoveFriend';
import { QueryBoundary } from '../components/ui/QueryBoundary';
import Avatar from '../components/common/Avatar';

const tabs = ['friends', 'received', 'sent'];

const FriendsPage = () => {
  if (featureFlags.useQueryFriends) {
    return <FriendsPageQuery />;
  }
  return <FriendsPageLegacy />;
};

// ─── Query-based implementation ─────────────────────────────────────────────
const FriendsPageQuery = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [sendingIds, setSendingIds] = useState([]);
  const [removingIds, setRemovingIds] = useState([]);
  const [processingIds, setProcessingIds] = useState([]);

  // Query hooks
  const friendsQuery = useFriends();
  const requestsQuery = useFriendRequests();
  const sentQuery = useSentRequests();

  // Mutation hooks
  const sendFriendRequestMutation = useSendFriendRequest();
  const acceptFriendRequestMutation = useAcceptFriendRequest();
  const rejectFriendRequestMutation = useRejectFriendRequest();
  const removeFriendMutation = useRemoveFriend();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Search users (local debounced API call, not cached)
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    FriendshipStore.searchUsers(search).then((users) => setSearchResults(users || []));
  }, [search]);

  const friends = friendsQuery.data || [];
  const receivedRequests = requestsQuery.data || [];
  const sentRequests = sentQuery.data || [];

  const filteredFriends = useMemo(() => {
    if (!search.trim()) return friends;
    const q = search.toLowerCase();
    return friends.filter((f) =>
      f.firstName?.toLowerCase().includes(q) ||
      f.lastName?.toLowerCase().includes(q) ||
      f.email?.toLowerCase().includes(q)
    );
  }, [friends, search]);

  const handleSendRequest = (id) => {
    setSendingIds((prev) => [...prev, id]);
    sendFriendRequestMutation.mutate(id, {
      onSettled: () => {
        setSendingIds((prev) => prev.filter((x) => x !== id));
        setSearchResults((prev) => prev.filter((u) => u.id !== id));
      },
    });
  };

  const handleAccept = (id) => {
    setProcessingIds((prev) => [...prev, id]);
    acceptFriendRequestMutation.mutate(id, {
      onSettled: () => setProcessingIds((prev) => prev.filter((x) => x !== id)),
    });
  };

  const handleReject = (id) => {
    setProcessingIds((prev) => [...prev, id]);
    rejectFriendRequestMutation.mutate(id, {
      onSettled: () => setProcessingIds((prev) => prev.filter((x) => x !== id)),
    });
  };

  const handleRemoveFriend = (id) => {
    setRemovingIds((prev) => [...prev, id]);
    removeFriendMutation.mutate(id, {
      onSettled: () => setRemovingIds((prev) => prev.filter((x) => x !== id)),
    });
  };

  const loading = friendsQuery.isLoading || requestsQuery.isLoading || sentQuery.isLoading;

  return (
    <FriendsPageLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchInput={searchInput}
      setSearchInput={setSearchInput}
      search={search}
      setSearch={setSearch}
      friends={friends}
      receivedRequests={receivedRequests}
      sentRequests={sentRequests}
      loading={loading}
      searchResults={searchResults}
      sendingIds={sendingIds}
      removingIds={removingIds}
      processingIds={processingIds}
      filteredFriends={filteredFriends}
      handleSendRequest={handleSendRequest}
      handleAccept={handleAccept}
      handleReject={handleReject}
      handleRemoveFriend={handleRemoveFriend}
      friendsQuery={friendsQuery}
      requestsQuery={requestsQuery}
      sentQuery={sentQuery}
      useQueryBoundary
    />
  );
};

// ─── Legacy implementation ──────────────────────────────────────────────────
const FriendsPageLegacy = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [sendingIds, setSendingIds] = useState([]);
  const [removingIds, setRemovingIds] = useState([]);
  const [processingIds, setProcessingIds] = useState([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [friendsData, receivedData, sentData] = await Promise.all([
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

  useEffect(() => { loadData(); }, []);

  // Search users
  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return; }
    FriendshipStore.searchUsers(search).then((users) => setSearchResults(users || []));
  }, [search]);

  const filteredFriends = useMemo(() => {
    if (!search.trim()) return friends;
    const q = search.toLowerCase();
    return friends.filter((f) =>
      f.firstName?.toLowerCase().includes(q) ||
      f.lastName?.toLowerCase().includes(q) ||
      f.email?.toLowerCase().includes(q)
    );
  }, [friends, search]);

  const handleSendRequest = async (id) => {
    setSendingIds((prev) => [...prev, id]);
    const result = await FriendshipStore.sendRequest(id);
    if (result) {
      // Refresh sent list and remove from search results
      const sentData = await FriendshipStore.getSent();
      setSentRequests(sentData || []);
      setSearchResults((prev) => prev.filter((u) => u.id !== id));
    }
    setSendingIds((prev) => prev.filter((x) => x !== id));
  };

  const handleAccept = async (id) => {
    setProcessingIds((prev) => [...prev, id]);
    await FriendshipStore.acceptRequest(id);
    await loadData();
    setProcessingIds((prev) => prev.filter((x) => x !== id));
  };

  const handleReject = async (id) => {
    setProcessingIds((prev) => [...prev, id]);
    await FriendshipStore.rejectRequest(id);
    await loadData();
    setProcessingIds((prev) => prev.filter((x) => x !== id));
  };

  const handleRemoveFriend = async (id) => {
    setRemovingIds((prev) => [...prev, id]);
    await FriendshipStore.removeFriend(id);
    setFriends((prev) => prev.filter((f) => f.id !== id));
    setRemovingIds((prev) => prev.filter((x) => x !== id));
  };

  return (
    <FriendsPageLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      searchInput={searchInput}
      setSearchInput={setSearchInput}
      search={search}
      setSearch={setSearch}
      friends={friends}
      receivedRequests={receivedRequests}
      sentRequests={sentRequests}
      loading={loading}
      searchResults={searchResults}
      sendingIds={sendingIds}
      removingIds={removingIds}
      processingIds={processingIds}
      filteredFriends={filteredFriends}
      handleSendRequest={handleSendRequest}
      handleAccept={handleAccept}
      handleReject={handleReject}
      handleRemoveFriend={handleRemoveFriend}
    />
  );
};

// ─── Shared Layout ──────────────────────────────────────────────────────────
const FriendsPageLayout = ({
  activeTab, setActiveTab, searchInput, setSearchInput, search, setSearch,
  friends, receivedRequests, sentRequests, loading, searchResults,
  sendingIds, removingIds, processingIds, filteredFriends,
  handleSendRequest, handleAccept, handleReject, handleRemoveFriend,
  friendsQuery, requestsQuery, sentQuery, useQueryBoundary,
}) => {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface">Friends</h1>
        <p className="text-sm text-on-surface-variant mt-1">Manage your connections</p>
      </div>

      {/* Tabs — underline style */}
      <div className="flex items-center gap-6 border-b border-glass-stroke">
        {tabs.map((tab) => {
          const count = tab === 'received' ? receivedRequests.length : tab === 'sent' ? sentRequests.length : friends.length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative pb-3 text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === tab
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab === 'friends' ? 'Friends' : tab === 'received' ? 'Requests' : 'Sent'}
              {count > 0 && (
                <span className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1 ${
                  activeTab === tab ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant'
                }`}>
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
      {/* Search — only on Friends tab */}
      {activeTab === 'friends' && (
        <div className="flex items-center gap-3 rounded-xl bg-surface-container-low border border-glass-stroke px-4 py-3 focus-within:border-primary/40 transition-colors">
          <Search size={16} className="text-on-surface-variant shrink-0" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search friends or add new..."
            className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant/50"
          />
          {searchInput && (
            <button onClick={() => { setSearchInput(''); setSearch(''); }}>
              <X size={14} className="text-on-surface-variant" />
            </button>
          )}
        </div>
      )}
      {/* Content */}
      {!useQueryBoundary && loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Search Results — only on Friends tab */}
          {activeTab === 'friends' && search.trim() && searchResults.length > 0 && (
            <div className="space-y-3 mb-6">
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Search Results</p>
              {searchResults.map((user) => {
                const alreadySent = sentRequests.some((s) => s.addresseeId === user.id);
                const alreadyFriend = friends.some((f) => f.id === user.id);
                return (
                  <div key={user.id} className="flex items-center gap-3 rounded-xl bg-surface-container-low border border-glass-stroke p-4">
                    <Avatar
                      firstName={user.firstName}
                      lastName={user.lastName}
                      avatarUrl={user.avatarUrl}
                      size="md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-on-surface-variant truncate">{user.email}</p>
                    </div>
                    {alreadyFriend ? (
                      <div className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs border border-green-500/20 flex items-center gap-1.5 shrink-0">
                        <Check size={12} /> Friend
                      </div>
                    ) : alreadySent ? (
                      <div className="px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs border border-yellow-500/20 flex items-center gap-1.5 shrink-0">
                        <Clock3 size={12} /> Sent
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(user.id)}
                        disabled={sendingIds.includes(user.id)}
                        className="px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium border border-primary/20 flex items-center gap-1.5 disabled:opacity-50 shrink-0"
                      >
                        {sendingIds.includes(user.id) ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                        Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Friends Tab */}
          {activeTab === 'friends' && (
            
            useQueryBoundary ? (
              
              <QueryBoundary query={friendsQuery}>
                {() => (
                  filteredFriends.length === 0 ? (
                    <EmptyState icon={Users} title="No friends yet" subtitle="Search for users above to connect." />
                  ) : (
                    filteredFriends.map((friend) => (
                      <FriendCard key={friend.id} user={friend} isRemoving={removingIds.includes(friend.id)} onRemove={() => handleRemoveFriend(friend.id)} />
                    ))
                  )
                )}
              </QueryBoundary>
            ) : (
              filteredFriends.length === 0 ? (
                <EmptyState icon={Users} title="No friends yet" subtitle="Search for users above to connect." />
              ) : (
                filteredFriends.map((friend) => (
                  <FriendCard key={friend.id} user={friend} isRemoving={removingIds.includes(friend.id)} onRemove={() => handleRemoveFriend(friend.id)} />
                ))
              )
            )
          )}

          {/* Received Tab */}
          {activeTab === 'received' && (
            useQueryBoundary ? (
              <QueryBoundary query={requestsQuery}>
                {() => (
                  receivedRequests.length === 0 ? (
                    <EmptyState icon={UserPlus} title="No pending requests" subtitle="Incoming friend requests will appear here." />
                  ) : (
                    receivedRequests.map((req) => (
                      <ReceivedRequestCard key={req.id} req={req} processingIds={processingIds} handleAccept={handleAccept} handleReject={handleReject} />
                    ))
                  )
                )}
              </QueryBoundary>
            ) : (
              receivedRequests.length === 0 ? (
                <EmptyState icon={UserPlus} title="No pending requests" subtitle="Incoming friend requests will appear here." />
              ) : (
                receivedRequests.map((req) => (
                  <ReceivedRequestCard key={req.id} req={req} processingIds={processingIds} handleAccept={handleAccept} handleReject={handleReject} />
                ))
              )
            )
          )}

          {/* Sent Tab */}
          {activeTab === 'sent' && (
            useQueryBoundary ? (
              <QueryBoundary query={sentQuery}>
                {() => (
                  sentRequests.length === 0 ? (
                    <EmptyState icon={Clock3} title="No sent requests" subtitle="Friend requests you send will appear here." />
                  ) : (
                    sentRequests.map((req) => (
                      <SentRequestCard key={req.id} req={req} />
                    ))
                  )
                )}
              </QueryBoundary>
            ) : (
              sentRequests.length === 0 ? (
                <EmptyState icon={Clock3} title="No sent requests" subtitle="Friend requests you send will appear here." />
              ) : (
                sentRequests.map((req) => (
                  <SentRequestCard key={req.id} req={req} />
                ))
              )
            )
          )}
        </div>
      )}
    </div>
  );
};

// ─── Received Request Card ──────────────────────────────────────────────────
const ReceivedRequestCard = ({ req, processingIds, handleAccept, handleReject }) => (
  <div className="rounded-xl bg-surface-container-low border border-glass-stroke p-4">
    <div className="flex items-center gap-3 mb-3">
      <Avatar
        firstName={req.firstName || req.requesterName?.split(' ')[0]}
        lastName={req.lastName || req.requesterName?.split(' ')[1]}
        avatarUrl={req.avatarUrl}
        size="md"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-on-surface truncate">{req.requesterName || `${req.firstName || ''} ${req.lastName || ''}`.trim() || 'Unknown'}</p>
        <p className="text-xs text-on-surface-variant truncate">{req.email || ''}</p>
      </div>
    </div>
    <div className="flex gap-2">
      <button
        onClick={() => handleAccept(req.id)}
        disabled={processingIds.includes(req.id)}
        className="flex-1 py-2.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
      >
        <Check size={14} /> Accept
      </button>
      <button
        onClick={() => handleReject(req.id)}
        disabled={processingIds.includes(req.id)}
        className="flex-1 py-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-sm font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
      >
        <X size={14} /> Decline
      </button>
    </div>
  </div>
);

// ─── Sent Request Card ──────────────────────────────────────────────────────
const SentRequestCard = ({ req }) => (
  <div className="flex items-center gap-3 rounded-xl bg-surface-container-low border border-glass-stroke p-4">
    <Avatar
      firstName={req.firstName || req.addresseeName?.split(' ')[0]}
      lastName={req.lastName || req.addresseeName?.split(' ')[1]}
      avatarUrl={req.avatarUrl}
      size="md"
    />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-on-surface truncate">{req.addresseeName || `${req.firstName || ''} ${req.lastName || ''}`.trim() || 'Unknown'}</p>
      <p className="text-xs text-on-surface-variant truncate">{req.email || ''}</p>
    </div>
    <div className="px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs border border-yellow-500/20 flex items-center gap-1.5 shrink-0">
      <Clock3 size={12} /> Pending
    </div>
  </div>
);

// Swipe-to-remove friend card
const FriendCard = ({ user, isRemoving, onRemove }) => {
  const controls = useAnimation();
  const [showConfirm, setShowConfirm] = useState(false);
  const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();

  const resetPosition = () => {
    controls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } });
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete background */}
      <div className="absolute inset-0 bg-red-500/10 flex items-center justify-end px-6">
        <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
          <Trash2 size={16} />
          Remove
        </div>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.08}
        dragMomentum={false}
        animate={controls}
        onDragEnd={(_, info) => {
          if (info.offset.x < -60) {
            setShowConfirm(true);
          }
          resetPosition();
        }}
        className="relative z-10 flex items-center gap-4 rounded-2xl bg-surface-container-low border border-glass-stroke p-4"
      >
        <Avatar
          firstName={user.firstName}
          lastName={user.lastName}
          avatarUrl={user.avatarUrl}
          size="md"
          className="w-11 h-11"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-on-surface truncate">{name}</p>
          <p className="text-xs text-on-surface-variant truncate mt-0.5">{user.email}</p>
        </div>
        {isRemoving ? (
          <Loader2 size={14} className="animate-spin text-red-400 shrink-0" />
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20 shrink-0">
            <Check size={12} />
            Friend
          </div>
        )}
      </motion.div>

      {/* Confirm popup */}
      {showConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false); }}>
          <div className="bg-surface-container rounded-2xl border border-glass-stroke p-6 w-full max-w-xs text-center">
            <h3 className="text-lg font-bold text-on-surface mb-2">Remove Friend?</h3>
            <p className="text-sm text-on-surface-variant mb-5">Remove {name} from your friends?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl border border-glass-stroke text-on-surface-variant text-sm font-medium">Cancel</button>
              <button onClick={() => { setShowConfirm(false); onRemove(); }} className="flex-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-sm font-semibold">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, subtitle }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-14 h-14 rounded-2xl bg-surface-container border border-glass-stroke flex items-center justify-center mb-4">
      <Icon size={24} className="text-on-surface-variant" />
    </div>
    <h3 className="text-base font-semibold text-on-surface">{title}</h3>
    <p className="text-sm text-on-surface-variant mt-1 max-w-[200px]">{subtitle}</p>
  </div>
);

export default FriendsPage;
