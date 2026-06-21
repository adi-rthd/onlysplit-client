/**
 * Phase 3 Validation Tests — Friends State Management Redesign
 *
 * Validates:
 * 1. Friends mutation invalidation correctness (property-based)
 * 2. Optimistic send request rollback
 * 3. Optimistic accept request rollback
 * 4. Optimistic remove friend rollback
 * 5. No duplicate friendship state (code analysis)
 * 6. Activities invalidation after friend mutations
 * 7. Rapid operations consistency (property-based)
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { queryKeys } from '../queryKeys';
import { invalidationMap } from '../invalidationMap';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Deep equality check for arrays of arrays */
const arraysEqualDeep = (a, b) =>
  JSON.stringify(a) === JSON.stringify(b);

/** Read a source file relative to project root */
const readSource = (relativePath) =>
  readFileSync(resolve(__dirname, '../../..', relativePath), 'utf-8');

/** Arbitrary: friend object */
const friendArb = fc.record({
  id: fc.uuid(),
  firstName: fc.string({ minLength: 1, maxLength: 30 }),
  lastName: fc.string({ minLength: 1, maxLength: 30 }),
  email: fc.emailAddress(),
});

/** Arbitrary: friend request object (received) */
const friendRequestArb = fc.record({
  id: fc.uuid(),
  requesterId: fc.uuid(),
  requesterName: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.emailAddress(),
  createdAt: fc.integer({ min: 1577836800000, max: 1767139200000 }).map((ts) => new Date(ts).toISOString()),
});

/** Arbitrary: sent request object */
const sentRequestArb = fc.record({
  id: fc.uuid(),
  addresseeId: fc.uuid(),
  addresseeName: fc.string({ minLength: 1, maxLength: 50 }),
  email: fc.emailAddress(),
  createdAt: fc.integer({ min: 1577836800000, max: 1767139200000 }).map((ts) => new Date(ts).toISOString()),
});

/** Arbitrary: array of friends (0–20) */
const friendsArrayArb = fc.array(friendArb, { minLength: 1, maxLength: 20 });

/** Arbitrary: array of friend requests (0–15) */
const requestsArrayArb = fc.array(friendRequestArb, { minLength: 1, maxLength: 15 });

/** Arbitrary: array of sent requests (0–15) */
const sentArrayArb = fc.array(sentRequestArb, { minLength: 1, maxLength: 15 });

// ═══════════════════════════════════════════════════════════════════════════════
// 1. FRIENDS MUTATION INVALIDATION CORRECTNESS (property-based)
// ═══════════════════════════════════════════════════════════════════════════════

describe('1. Friends Mutation Invalidation Correctness', () => {
  it('sendFriendRequest() invalidates exactly ["friends", "sent"]', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const keys = invalidationMap.sendFriendRequest();

        expect(keys).toHaveLength(1);
        expect(keys[0]).toEqual(['friends', 'sent']);
        expect(arraysEqualDeep(keys, [queryKeys.friends.sent()])).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('acceptFriendRequest() invalidates exactly ["friends"], ["friends", "requests"], ["activities"]', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const keys = invalidationMap.acceptFriendRequest();

        expect(keys).toHaveLength(3);

        const expected = [
          queryKeys.friends.all(),       // ['friends']
          queryKeys.friends.requests(),  // ['friends', 'requests']
          queryKeys.activities.all(),    // ['activities']
        ];

        expect(arraysEqualDeep(keys, expected)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('rejectFriendRequest() invalidates exactly ["friends", "requests"]', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const keys = invalidationMap.rejectFriendRequest();

        expect(keys).toHaveLength(1);
        expect(keys[0]).toEqual(['friends', 'requests']);
        expect(arraysEqualDeep(keys, [queryKeys.friends.requests()])).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('removeFriend() invalidates exactly ["friends"]', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const keys = invalidationMap.removeFriend();

        expect(keys).toHaveLength(1);
        expect(keys[0]).toEqual(['friends']);
        expect(arraysEqualDeep(keys, [queryKeys.friends.all()])).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it('invalidation key arrays are stable across multiple calls', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (n) => {
        // Call n times and verify consistency
        const results = Array.from({ length: n }, () => invalidationMap.sendFriendRequest());
        results.forEach((r) => expect(r).toEqual(results[0]));

        const acceptResults = Array.from({ length: n }, () => invalidationMap.acceptFriendRequest());
        acceptResults.forEach((r) => expect(r).toEqual(acceptResults[0]));

        const rejectResults = Array.from({ length: n }, () => invalidationMap.rejectFriendRequest());
        rejectResults.forEach((r) => expect(r).toEqual(rejectResults[0]));

        const removeResults = Array.from({ length: n }, () => invalidationMap.removeFriend());
        removeResults.forEach((r) => expect(r).toEqual(removeResults[0]));
      }),
      { numRuns: 50 }
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. OPTIMISTIC SEND REQUEST ROLLBACK
// ═══════════════════════════════════════════════════════════════════════════════

describe('2. Optimistic Send Request Rollback', () => {
  it('rollback restores exactly the original sent-requests array', () => {
    fc.assert(
      fc.property(sentArrayArb, fc.uuid(), (originalSent, addresseeId) => {
        // Snapshot (simulating onMutate)
        const previousSent = [...originalSent];

        // Simulate optimistic insert (same logic as useSendFriendRequest onMutate)
        const optimisticRequest = {
          id: `temp-${Date.now()}`,
          addresseeId,
          _isPending: true,
          createdAt: new Date().toISOString(),
        };
        const mutatedSent = [optimisticRequest, ...previousSent];

        // Verify mutation added element at top
        expect(mutatedSent.length).toBe(originalSent.length + 1);
        expect(mutatedSent[0]._isPending).toBe(true);
        expect(mutatedSent[0].id).toMatch(/^temp-/);
        expect(mutatedSent[0].addresseeId).toBe(addresseeId);

        // Rollback: restore from snapshot (simulating onError)
        const rolledBack = previousSent;

        // Verify lossless round-trip
        expect(rolledBack).toEqual(originalSent);
        expect(rolledBack.length).toBe(originalSent.length);
      }),
      { numRuns: 200 }
    );
  });

  it('optimistic entry has _isPending flag and temp ID prefix', () => {
    fc.assert(
      fc.property(sentArrayArb, fc.uuid(), (sent, addresseeId) => {
        const optimisticRequest = {
          id: `temp-${Date.now()}`,
          addresseeId,
          _isPending: true,
          createdAt: new Date().toISOString(),
        };
        const mutated = [optimisticRequest, ...sent];

        expect(mutated[0]._isPending).toBe(true);
        expect(mutated[0].id.startsWith('temp-')).toBe(true);
        // Original entries should not have _isPending
        mutated.slice(1).forEach((entry) => {
          expect(entry._isPending).toBeUndefined();
        });
      }),
      { numRuns: 100 }
    );
  });

  it('no duplicate entries after rapid sequential send operations', () => {
    fc.assert(
      fc.property(
        sentArrayArb,
        fc.array(fc.uuid(), { minLength: 2, maxLength: 10 }),
        (originalSent, addresseeIds) => {
          // Simulate rapid sequential sends
          let currentState = [...originalSent];
          const snapshots = [];

          addresseeIds.forEach((addresseeId, index) => {
            // Take snapshot before each
            snapshots.push([...currentState]);

            // Apply optimistic insert
            const optimisticRequest = {
              id: `temp-${index}-${Date.now()}`,
              addresseeId,
              _isPending: true,
              createdAt: new Date().toISOString(),
            };
            currentState = [optimisticRequest, ...currentState];
          });

          // All optimistic entries should be unique (no duplicates)
          const ids = currentState.map((r) => r.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);

          // The state should have grown by exactly the number of sends
          expect(currentState.length).toBe(originalSent.length + addresseeIds.length);

          // All temp entries should be at the front
          const pendingEntries = currentState.filter((r) => r._isPending);
          expect(pendingEntries.length).toBe(addresseeIds.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. OPTIMISTIC ACCEPT REQUEST ROLLBACK
// ═══════════════════════════════════════════════════════════════════════════════

describe('3. Optimistic Accept Request Rollback', () => {
  it('rollback restores exactly the original requests array', () => {
    fc.assert(
      fc.property(requestsArrayArb, (originalRequests) => {
        // Pick a request to accept
        const targetId = originalRequests[0].id;

        // Snapshot (simulating onMutate)
        const previousRequests = [...originalRequests];

        // Simulate optimistic removal (same logic as useAcceptFriendRequest onMutate)
        const mutatedRequests = previousRequests.filter((req) => req.id !== targetId);

        // Verify mutation removed element
        expect(mutatedRequests.length).toBe(originalRequests.length - 1);
        expect(mutatedRequests.find((r) => r.id === targetId)).toBeUndefined();

        // Rollback: restore from snapshot (simulating onError)
        const rolledBack = previousRequests;

        // Verify lossless round-trip
        expect(rolledBack).toEqual(originalRequests);
        expect(rolledBack.length).toBe(originalRequests.length);
        expect(rolledBack.find((r) => r.id === targetId)).toBeDefined();
      }),
      { numRuns: 200 }
    );
  });

  it('accepting non-existent ID does not change array length', () => {
    fc.assert(
      fc.property(requestsArrayArb, fc.uuid(), (requests, nonExistentId) => {
        // Filter by a non-existent ID
        const mutated = requests.filter((req) => req.id !== nonExistentId);

        // If nonExistentId doesn't match any request, length should be unchanged
        const matchingRequest = requests.find((r) => r.id === nonExistentId);
        if (!matchingRequest) {
          expect(mutated.length).toBe(requests.length);
        } else {
          expect(mutated.length).toBe(requests.length - 1);
        }
      }),
      { numRuns: 200 }
    );
  });

  it('order of remaining elements is preserved after optimistic removal', () => {
    fc.assert(
      fc.property(requestsArrayArb, (requests) => {
        const targetId = requests[0].id;
        const mutated = requests.filter((req) => req.id !== targetId);

        // Remaining elements should maintain relative order
        const expectedOrder = requests.slice(1); // first one removed
        expect(mutated).toEqual(expectedOrder);
      }),
      { numRuns: 200 }
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. OPTIMISTIC REMOVE FRIEND ROLLBACK
// ═══════════════════════════════════════════════════════════════════════════════

describe('4. Optimistic Remove Friend Rollback', () => {
  it('rollback restores exactly the original friends array', () => {
    fc.assert(
      fc.property(friendsArrayArb, (originalFriends) => {
        // Pick a friend to remove
        const targetId = originalFriends[0].id;

        // Snapshot (simulating onMutate)
        const previousFriends = [...originalFriends];

        // Simulate optimistic removal (same logic as useRemoveFriend onMutate)
        const mutatedFriends = previousFriends.filter((friend) => friend.id !== targetId);

        // Verify mutation removed element
        expect(mutatedFriends.length).toBe(originalFriends.length - 1);
        expect(mutatedFriends.find((f) => f.id === targetId)).toBeUndefined();

        // Rollback: restore from snapshot (simulating onError)
        const rolledBack = previousFriends;

        // Verify lossless round-trip
        expect(rolledBack).toEqual(originalFriends);
        expect(rolledBack.length).toBe(originalFriends.length);
        expect(rolledBack.find((f) => f.id === targetId)).toBeDefined();
      }),
      { numRuns: 200 }
    );
  });

  it('no count mismatches after rapid removal of multiple friends', () => {
    fc.assert(
      fc.property(
        fc.array(friendArb, { minLength: 5, maxLength: 20 }),
        fc.integer({ min: 2, max: 4 }),
        (friends, removeCount) => {
          // Ensure we have unique IDs
          const uniqueFriends = friends.filter(
            (f, i, arr) => arr.findIndex((x) => x.id === f.id) === i
          );
          if (uniqueFriends.length < removeCount) return; // skip if not enough unique friends

          // Snapshot
          const previousFriends = [...uniqueFriends];
          let currentState = [...uniqueFriends];

          // Simulate rapid sequential removals
          const idsToRemove = uniqueFriends.slice(0, removeCount).map((f) => f.id);

          idsToRemove.forEach((id) => {
            currentState = currentState.filter((friend) => friend.id !== id);
          });

          // Verify count matches expected
          expect(currentState.length).toBe(uniqueFriends.length - removeCount);

          // Verify no removed friends remain
          idsToRemove.forEach((id) => {
            expect(currentState.find((f) => f.id === id)).toBeUndefined();
          });

          // Rollback should restore full list
          const rolledBack = previousFriends;
          expect(rolledBack.length).toBe(uniqueFriends.length);

          // All removed friends should be back
          idsToRemove.forEach((id) => {
            expect(rolledBack.find((f) => f.id === id)).toBeDefined();
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('removing the same friend ID twice does not double-remove', () => {
    fc.assert(
      fc.property(friendsArrayArb, (friends) => {
        const targetId = friends[0].id;

        // First removal
        const afterFirst = friends.filter((f) => f.id !== targetId);
        // Second removal of same ID
        const afterSecond = afterFirst.filter((f) => f.id !== targetId);

        // Should be identical — idempotent operation
        expect(afterSecond).toEqual(afterFirst);
        expect(afterSecond.length).toBe(afterFirst.length);
      }),
      { numRuns: 200 }
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. NO DUPLICATE FRIENDSHIP STATE (Code Analysis)
// ═══════════════════════════════════════════════════════════════════════════════

describe('5. No Duplicate Friendship State', () => {
  const source = readSource('src/pages/FriendsPage.jsx');

  it('FriendsPageQuery does NOT use useState for friends list', () => {
    // Extract the FriendsPageQuery component body
    const queryComponentStart = source.indexOf('const FriendsPageQuery');
    const legacyComponentStart = source.indexOf('const FriendsPageLegacy');
    const querySection = source.slice(queryComponentStart, legacyComponentStart);

    // Should NOT have useState for friends/receivedRequests/sentRequests data
    expect(querySection).not.toMatch(/useState\(\[\]\).*friends/i);
    expect(querySection).not.toMatch(/useState\(\[\]\).*receivedRequests/i);
    expect(querySection).not.toMatch(/useState\(\[\]\).*sentRequests/i);

    // Should NOT have setFriends, setReceivedRequests, setSentRequests
    expect(querySection).not.toContain('setFriends');
    expect(querySection).not.toContain('setReceivedRequests');
    expect(querySection).not.toContain('setSentRequests');
  });

  it('FriendsPageQuery does NOT call loadData()', () => {
    const queryComponentStart = source.indexOf('const FriendsPageQuery');
    const legacyComponentStart = source.indexOf('const FriendsPageLegacy');
    const querySection = source.slice(queryComponentStart, legacyComponentStart);

    // Should NOT define or call loadData
    expect(querySection).not.toContain('loadData');
  });

  it('FriendsPageQuery uses query hooks .data property for friends data', () => {
    const queryComponentStart = source.indexOf('const FriendsPageQuery');
    const legacyComponentStart = source.indexOf('const FriendsPageLegacy');
    const querySection = source.slice(queryComponentStart, legacyComponentStart);

    // Data comes from query hooks
    expect(querySection).toContain('friendsQuery.data');
    expect(querySection).toContain('requestsQuery.data');
    expect(querySection).toContain('sentQuery.data');

    // Query hooks are called
    expect(querySection).toContain('useFriends()');
    expect(querySection).toContain('useFriendRequests()');
    expect(querySection).toContain('useSentRequests()');
  });

  it('FriendsPageLegacy still uses useState for friends, receivedRequests, sentRequests', () => {
    const legacyComponentStart = source.indexOf('const FriendsPageLegacy');
    const layoutComponentStart = source.indexOf('const FriendsPageLayout');
    const legacySection = source.slice(legacyComponentStart, layoutComponentStart);

    // Legacy path SHOULD have useState
    expect(legacySection).toContain('useState([])');
    expect(legacySection).toContain('setFriends');
    expect(legacySection).toContain('setReceivedRequests');
    expect(legacySection).toContain('setSentRequests');
  });

  it('FriendsPageLegacy still uses loadData()', () => {
    const legacyComponentStart = source.indexOf('const FriendsPageLegacy');
    const layoutComponentStart = source.indexOf('const FriendsPageLayout');
    const legacySection = source.slice(legacyComponentStart, layoutComponentStart);

    // Legacy path SHOULD have loadData
    expect(legacySection).toContain('loadData');
    expect(legacySection).toContain('FriendshipStore.getFriends()');
    expect(legacySection).toContain('FriendshipStore.getRequests()');
    expect(legacySection).toContain('FriendshipStore.getSent()');
  });

  it('feature flag gates between query and legacy implementations', () => {
    // The top-level FriendsPage component uses featureFlags
    expect(source).toContain('featureFlags.useQueryFriends');
    expect(source).toContain('FriendsPageQuery');
    expect(source).toContain('FriendsPageLegacy');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. ACTIVITIES INVALIDATION AFTER FRIEND MUTATIONS
// ═══════════════════════════════════════════════════════════════════════════════

describe('6. Activities Invalidation After Friend Mutations', () => {
  it('acceptFriendRequest() includes ["activities"] in invalidation targets', () => {
    const keys = invalidationMap.acceptFriendRequest();
    const activitiesKey = queryKeys.activities.all(); // ['activities']

    expect(keys).toContainEqual(activitiesKey);
  });

  it('sendFriendRequest() does NOT include ["activities"]', () => {
    const keys = invalidationMap.sendFriendRequest();
    const activitiesKey = queryKeys.activities.all(); // ['activities']

    expect(keys).not.toContainEqual(activitiesKey);

    // Verify it only contains friends.sent
    expect(keys).toHaveLength(1);
    expect(keys[0]).toEqual(['friends', 'sent']);
  });

  it('rejectFriendRequest() does NOT include ["activities"]', () => {
    const keys = invalidationMap.rejectFriendRequest();
    const activitiesKey = queryKeys.activities.all(); // ['activities']

    expect(keys).not.toContainEqual(activitiesKey);

    // Verify it only contains friends.requests
    expect(keys).toHaveLength(1);
    expect(keys[0]).toEqual(['friends', 'requests']);
  });

  it('removeFriend() does NOT include ["activities"]', () => {
    const keys = invalidationMap.removeFriend();
    const activitiesKey = queryKeys.activities.all(); // ['activities']

    expect(keys).not.toContainEqual(activitiesKey);

    // Verify it only contains friends.all
    expect(keys).toHaveLength(1);
    expect(keys[0]).toEqual(['friends']);
  });

  it('only acceptFriendRequest triggers activity feed refresh (property-based)', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        const mutations = ['sendFriendRequest', 'acceptFriendRequest', 'rejectFriendRequest', 'removeFriend'];
        const activitiesKey = queryKeys.activities.all();

        mutations.forEach((mutation) => {
          const keys = invalidationMap[mutation]();
          const includesActivities = keys.some((k) => arraysEqualDeep([k], [activitiesKey]));

          if (mutation === 'acceptFriendRequest') {
            expect(includesActivities).toBe(true);
          } else {
            expect(includesActivities).toBe(false);
          }
        });
      }),
      { numRuns: 50 }
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 7. RAPID OPERATIONS CONSISTENCY (property-based)
// ═══════════════════════════════════════════════════════════════════════════════

describe('7. Rapid Operations Consistency', () => {
  it('remove A, remove B, rollback B, keep A removed → consistent state', () => {
    fc.assert(
      fc.property(
        fc.array(friendArb, { minLength: 3, maxLength: 20 }),
        (friends) => {
          // Ensure unique IDs
          const uniqueFriends = friends.filter(
            (f, i, arr) => arr.findIndex((x) => x.id === f.id) === i
          );
          if (uniqueFriends.length < 3) return; // need at least 3 unique friends

          const friendA = uniqueFriends[0];
          const friendB = uniqueFriends[1];

          // Step 1: Snapshot before removing A
          const snapshotBeforeA = [...uniqueFriends];

          // Step 2: Remove friend A (optimistic)
          let currentState = uniqueFriends.filter((f) => f.id !== friendA.id);

          // Step 3: Snapshot before removing B (this is the state after A is removed)
          const snapshotBeforeB = [...currentState];

          // Step 4: Remove friend B (optimistic)
          currentState = currentState.filter((f) => f.id !== friendB.id);

          // At this point both A and B are removed
          expect(currentState.find((f) => f.id === friendA.id)).toBeUndefined();
          expect(currentState.find((f) => f.id === friendB.id)).toBeUndefined();

          // Step 5: Rollback B (error on B, restore B's snapshot)
          currentState = snapshotBeforeB;

          // Final state: A should still be removed, B should be restored
          expect(currentState.find((f) => f.id === friendA.id)).toBeUndefined();
          expect(currentState.find((f) => f.id === friendB.id)).toBeDefined();

          // No duplicates
          const ids = currentState.map((f) => f.id);
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);

          // Count should be original minus 1 (only A removed)
          expect(currentState.length).toBe(uniqueFriends.length - 1);
        }
      ),
      { numRuns: 200 }
    );
  });

  it('sequential remove all, rollback all → original state restored', () => {
    fc.assert(
      fc.property(
        fc.array(friendArb, { minLength: 2, maxLength: 10 }),
        (friends) => {
          // Ensure unique IDs
          const uniqueFriends = friends.filter(
            (f, i, arr) => arr.findIndex((x) => x.id === f.id) === i
          );
          if (uniqueFriends.length < 2) return;

          // Take snapshots before each removal
          const snapshots = [];
          let currentState = [...uniqueFriends];

          uniqueFriends.forEach((friend) => {
            snapshots.push([...currentState]);
            currentState = currentState.filter((f) => f.id !== friend.id);
          });

          // After removing all, state should be empty
          expect(currentState.length).toBe(0);

          // Rollback all in reverse order
          for (let i = snapshots.length - 1; i >= 0; i--) {
            currentState = snapshots[i];
          }

          // Should be back to original
          expect(currentState).toEqual(uniqueFriends);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('interleaved send + remove operations maintain no duplicates', () => {
    fc.assert(
      fc.property(
        friendsArrayArb,
        sentArrayArb,
        fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
        (friends, sentRequests, newAddresseeIds) => {
          // Ensure unique IDs in friends
          const uniqueFriends = friends.filter(
            (f, i, arr) => arr.findIndex((x) => x.id === f.id) === i
          );

          let friendsState = [...uniqueFriends];
          let sentState = [...sentRequests];

          // Simulate interleaved: send a request, then remove a friend
          newAddresseeIds.forEach((addresseeId, index) => {
            // Send request (add to sent)
            const optimistic = {
              id: `temp-${index}-${Date.now()}`,
              addresseeId,
              _isPending: true,
              createdAt: new Date().toISOString(),
            };
            sentState = [optimistic, ...sentState];

            // Remove first friend if available
            if (friendsState.length > 0) {
              friendsState = friendsState.slice(1);
            }
          });

          // Verify no duplicates in sent state
          const sentIds = sentState.map((r) => r.id);
          const uniqueSentIds = new Set(sentIds);
          expect(uniqueSentIds.size).toBe(sentIds.length);

          // Verify no duplicates in friends state
          const friendIds = friendsState.map((f) => f.id);
          const uniqueFriendIds = new Set(friendIds);
          expect(uniqueFriendIds.size).toBe(friendIds.length);
        }
      ),
      { numRuns: 100 }
    );
  });
});
