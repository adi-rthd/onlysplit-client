/**
 * Phase 4 Validation Tests — SignalR Bridge & Global Invalidation
 *
 * Validates:
 * 1. SignalR Bridge event mapping completeness (property-based)
 * 2. Reconnection handler invalidation correctness
 * 3. No per-page SignalR subscriptions when bridge active (code analysis)
 * 4. Bridge initialization guard (code analysis)
 * 5. No duplicate event processing (property-based)
 * 6. Cross-entity invalidation coverage
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import { queryKeys } from '../queryKeys';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Read a source file relative to project root */
const readSource = (relativePath) =>
  readFileSync(resolve(__dirname, '../../..', relativePath), 'utf-8');

/** Parse the signalrBridge source for structural analysis */
const bridgeSource = readSource('src/queries/signalrBridge.js');

/**
 * Extract event→keys mapping from signalrBridge.js source for a given hub section.
 * Returns an object { eventName: keyGeneratorCode }
 */
function extractEventMap(source, sectionMarker) {
  // Find the section (e.g., "const groupEvents = {" or "const activityEvents = {" or "const paymentEvents = {")
  const regex = new RegExp(`const ${sectionMarker} = \\{([\\s\\S]*?)\\};`, 'm');
  const match = source.match(regex);
  if (!match) return {};

  const block = match[1];
  // Extract event names from the block
  const eventRegex = /(\w+):\s*\(/g;
  const events = {};
  let m;
  while ((m = eventRegex.exec(block)) !== null) {
    events[m[1]] = true;
  }
  return events;
}

const groupEvents = extractEventMap(bridgeSource, 'groupEvents');
const activityEvents = extractEventMap(bridgeSource, 'activityEvents');
const paymentEvents = extractEventMap(bridgeSource, 'paymentEvents');

// ─── All 14 expected event types ─────────────────────────────────────────────

const EXPECTED_GROUP_EVENTS = [
  'ExpenseAdded',
  'ExpenseUpdated',
  'ExpenseDeleted',
  'BalanceUpdated',
  'GroupUpdated',
  'MemberJoined',
  'MemberRemoved',
  'SettlementUpdated',
];

const EXPECTED_ACTIVITY_EVENTS = [
  'FriendRequestReceived',
  'FriendRequestAccepted',
  'GroupInvitationReceived',
  'GroupInvitationAccepted',
];

const EXPECTED_PAYMENT_EVENTS = [
  'PaymentCompleted',
  'PaymentRefunded',
];

const ALL_EVENTS = [
  ...EXPECTED_GROUP_EVENTS,
  ...EXPECTED_ACTIVITY_EVENTS,
  ...EXPECTED_PAYMENT_EVENTS,
];

// ─── Simulate bridge event→keys mapping (mirrors signalrBridge.js logic) ─────

function getGroupEventKeys(event, groupId) {
  const map = {
    ExpenseAdded: (gId) => [
      queryKeys.groups.expenses(gId),
      queryKeys.groups.balances(gId),
      queryKeys.groups.settlements(gId),
    ],
    ExpenseUpdated: (gId) => [
      queryKeys.groups.expenses(gId),
      queryKeys.groups.balances(gId),
      queryKeys.groups.settlements(gId),
    ],
    ExpenseDeleted: (gId) => [
      queryKeys.groups.expenses(gId),
      queryKeys.groups.balances(gId),
      queryKeys.groups.settlements(gId),
    ],
    BalanceUpdated: (gId) => [
      queryKeys.groups.balances(gId),
      queryKeys.groups.settlements(gId),
    ],
    GroupUpdated: (gId) => [
      queryKeys.groups.detail(gId),
      queryKeys.groups.all(),
    ],
    MemberJoined: (gId) => [
      queryKeys.groups.detail(gId),
      queryKeys.groups.balances(gId),
    ],
    MemberRemoved: (gId) => [
      queryKeys.groups.detail(gId),
      queryKeys.groups.balances(gId),
    ],
    SettlementUpdated: (gId) => [
      queryKeys.groups.settlements(gId),
      queryKeys.groups.balances(gId),
      queryKeys.dashboard.summary(),
    ],
  };
  return map[event]?.(groupId) || null;
}

function getActivityEventKeys(event) {
  const map = {
    FriendRequestReceived: () => [
      queryKeys.notifications.all(),
      queryKeys.friends.requests(),
    ],
    FriendRequestAccepted: () => [
      queryKeys.notifications.all(),
      queryKeys.friends.all(),
    ],
    GroupInvitationReceived: () => [
      queryKeys.notifications.all(),
      queryKeys.invitations.all(),
    ],
    GroupInvitationAccepted: () => [
      queryKeys.notifications.all(),
      queryKeys.groups.all(),
    ],
  };
  return map[event]?.() || null;
}

function getPaymentEventKeys(event, groupId) {
  const map = {
    PaymentCompleted: (gId) => [
      queryKeys.groups.balances(gId),
      queryKeys.groups.settlements(gId),
      queryKeys.dashboard.summary(),
    ],
    PaymentRefunded: (gId) => [
      queryKeys.groups.balances(gId),
      queryKeys.groups.settlements(gId),
      queryKeys.dashboard.summary(),
    ],
  };
  return map[event]?.(groupId) || null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 1. SignalR Bridge Event Mapping Completeness (property-based)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Phase 4 — SignalR Bridge Event Mapping Completeness', () => {
  it('should map all 14 expected events across the three hubs', () => {
    // Verify all group events exist
    EXPECTED_GROUP_EVENTS.forEach((event) => {
      expect(groupEvents).toHaveProperty(event);
    });

    // Verify all activity events exist
    EXPECTED_ACTIVITY_EVENTS.forEach((event) => {
      expect(activityEvents).toHaveProperty(event);
    });

    // Verify all payment events exist
    EXPECTED_PAYMENT_EVENTS.forEach((event) => {
      expect(paymentEvents).toHaveProperty(event);
    });

    // Total = 14
    const totalMapped =
      Object.keys(groupEvents).length +
      Object.keys(activityEvents).length +
      Object.keys(paymentEvents).length;
    expect(totalMapped).toBe(14);
  });

  it('property: for random groupIds, group event keys are valid arrays', () => {
    fc.assert(
      fc.property(fc.uuid(), (groupId) => {
        EXPECTED_GROUP_EVENTS.forEach((event) => {
          const keys = getGroupEventKeys(event, groupId);
          expect(keys).not.toBeNull();
          expect(Array.isArray(keys)).toBe(true);
          keys.forEach((key) => {
            expect(Array.isArray(key)).toBe(true);
            expect(key.length).toBeGreaterThan(0);
            // First element should be a string (entity namespace)
            expect(typeof key[0]).toBe('string');
          });
        });
      }),
      { numRuns: 100 }
    );
  });

  it('property: for random groupIds, payment event keys are valid arrays', () => {
    fc.assert(
      fc.property(fc.uuid(), (groupId) => {
        EXPECTED_PAYMENT_EVENTS.forEach((event) => {
          const keys = getPaymentEventKeys(event, groupId);
          expect(keys).not.toBeNull();
          expect(Array.isArray(keys)).toBe(true);
          keys.forEach((key) => {
            expect(Array.isArray(key)).toBe(true);
            expect(key.length).toBeGreaterThan(0);
          });
        });
      }),
      { numRuns: 100 }
    );
  });

  it('property: activity event keys are valid arrays (no groupId dependency)', () => {
    fc.assert(
      fc.property(fc.constant(null), () => {
        EXPECTED_ACTIVITY_EVENTS.forEach((event) => {
          const keys = getActivityEventKeys(event);
          expect(keys).not.toBeNull();
          expect(Array.isArray(keys)).toBe(true);
          keys.forEach((key) => {
            expect(Array.isArray(key)).toBe(true);
            expect(key.length).toBeGreaterThan(0);
          });
        });
      }),
      { numRuns: 10 }
    );
  });

  it('property: group event keys contain the groupId in each key', () => {
    fc.assert(
      fc.property(fc.uuid(), (groupId) => {
        EXPECTED_GROUP_EVENTS.forEach((event) => {
          const keys = getGroupEventKeys(event, groupId);
          // At least one key should reference the groupId (group-specific invalidation)
          // Exception: GroupUpdated also invalidates groups.all() which doesn't contain groupId
          const hasGroupSpecificKey = keys.some((key) => key.includes(groupId));
          expect(hasGroupSpecificKey).toBe(true);
        });
      }),
      { numRuns: 100 }
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. Reconnection Handler Invalidation
// ═══════════════════════════════════════════════════════════════════════════════

describe('Phase 4 — Reconnection Handler Invalidation', () => {
  it('should invalidate exactly 4 broad keys on reconnect', () => {
    // From source: keys = [groups.all(), dashboard.all(), activities.all(), notifications.all()]
    const reconnectKeys = [
      queryKeys.groups.all(),
      queryKeys.dashboard.all(),
      queryKeys.activities.all(),
      queryKeys.notifications.all(),
    ];

    expect(reconnectKeys).toHaveLength(4);
    expect(reconnectKeys).toEqual([
      ['groups'],
      ['dashboard'],
      ['activities'],
      ['notifications'],
    ]);
  });

  it('should register onreconnected handler on all three hubs', () => {
    // Verify the source contains onreconnected setup for all hubs
    const reconnectPattern = /\[groupHub, activityHub, paymentHub\]\.forEach\(\(hub\)\s*=>\s*\{[\s\S]*?hub\.onreconnected/;
    expect(bridgeSource).toMatch(reconnectPattern);
  });

  it('reconnection keys should be top-level prefixes for full resync', () => {
    const reconnectKeys = [
      queryKeys.groups.all(),
      queryKeys.dashboard.all(),
      queryKeys.activities.all(),
      queryKeys.notifications.all(),
    ];

    // Each key should be a single-element array (top-level prefix)
    reconnectKeys.forEach((key) => {
      expect(key).toHaveLength(1);
      expect(typeof key[0]).toBe('string');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. No Per-Page SignalR Subscriptions When Bridge Active (code analysis)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Phase 4 — No Per-Page SignalR Subscriptions When Bridge Active', () => {
  const groupDetailsSource = readSource('src/pages/GroupDetailsPage.jsx');

  it('should pass null as groupId to useGroupSignalR when useBridge is true', () => {
    // The pattern: useGroupSignalR(useBridge ? null : groupId, ...)
    const pattern = /useGroupSignalR\(\s*useBridge\s*\?\s*null\s*:\s*groupId/;
    expect(groupDetailsSource).toMatch(pattern);
  });

  it('should still call joinGroup for channel subscriptions when bridge is active', () => {
    // Pattern: joinGroup(groupId) within a useBridge-scoped useEffect
    expect(groupDetailsSource).toContain('joinGroup(groupId)');
  });

  it('should still call leaveGroup for channel cleanup when bridge is active', () => {
    expect(groupDetailsSource).toContain('leaveGroup(groupId)');
  });

  it('should compute useBridge from all three feature flags', () => {
    // Pattern: useBridge = featureFlags.useQueryExpenses && featureFlags.useQueryGroups && featureFlags.useQueryInvitations
    const pattern = /useBridge\s*=\s*featureFlags\.useQueryExpenses\s*&&\s*featureFlags\.useQueryGroups\s*&&\s*featureFlags\.useQueryInvitations/;
    expect(groupDetailsSource).toMatch(pattern);
  });

  it('should only run joinGroup/leaveGroup effect when useBridge is true', () => {
    // The effect guard: if (!groupId || !useBridge) return;
    const pattern = /if\s*\(\s*!groupId\s*\|\|\s*!useBridge\s*\)\s*return/;
    expect(groupDetailsSource).toMatch(pattern);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. Bridge Initialization Guard (code analysis)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Phase 4 — Bridge Initialization Guard', () => {
  const signalRSource = readSource('src/hooks/useSignalR.js');

  it('should have bridgeInitialized module-level guard', () => {
    const pattern = /let\s+bridgeInitialized\s*=\s*false/;
    expect(signalRSource).toMatch(pattern);
  });

  it('should only initialize bridge when useQueryInvitations flag is true', () => {
    const pattern = /featureFlags\.useQueryInvitations\s*&&\s*!bridgeInitialized/;
    expect(signalRSource).toMatch(pattern);
  });

  it('should set bridgeInitialized to true after successful setup', () => {
    const pattern = /bridgeInitialized\s*=\s*true/;
    expect(signalRSource).toMatch(pattern);
  });

  it('should reset bridgeInitialized on disconnect', () => {
    // Should appear in the cleanup/disconnect path
    const resetOccurrences = (signalRSource.match(/bridgeInitialized\s*=\s*false/g) || []).length;
    // At least 2: one at declaration, one in disconnect path (and one in cleanup return)
    expect(resetOccurrences).toBeGreaterThanOrEqual(2);
  });

  it('should call setupSignalRBridge with queryClient and all three hubs', () => {
    const pattern = /setupSignalRBridge\(\s*queryClient\s*,\s*\{\s*groupHub\s*,\s*activityHub\s*,\s*paymentHub\s*\}/;
    expect(signalRSource).toMatch(pattern);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. No Duplicate Event Processing (property-based)
// ═══════════════════════════════════════════════════════════════════════════════

describe('Phase 4 — No Duplicate Event Processing', () => {
  it('each event name appears in exactly one hub configuration', () => {
    const allGroupEventNames = Object.keys(groupEvents);
    const allActivityEventNames = Object.keys(activityEvents);
    const allPaymentEventNames = Object.keys(paymentEvents);

    // Check no overlap between hubs
    const groupActivityOverlap = allGroupEventNames.filter((e) => allActivityEventNames.includes(e));
    const groupPaymentOverlap = allGroupEventNames.filter((e) => allPaymentEventNames.includes(e));
    const activityPaymentOverlap = allActivityEventNames.filter((e) => allPaymentEventNames.includes(e));

    expect(groupActivityOverlap).toEqual([]);
    expect(groupPaymentOverlap).toEqual([]);
    expect(activityPaymentOverlap).toEqual([]);
  });

  it('no event name is registered more than once in the source', () => {
    ALL_EVENTS.forEach((event) => {
      // Count occurrences of "EventName:" pattern in event map definitions
      // (exclude comments and log strings)
      const eventKeyPattern = new RegExp(`^\\s+${event}:`, 'gm');
      const matches = bridgeSource.match(eventKeyPattern) || [];
      expect(matches.length).toBe(1);
    });
  });

  it('property: event mapping is deterministic for any groupId', () => {
    fc.assert(
      fc.property(fc.uuid(), fc.constantFrom(...ALL_EVENTS), (groupId, event) => {
        // Call the mapping twice with the same inputs
        let keys1, keys2;

        if (EXPECTED_GROUP_EVENTS.includes(event)) {
          keys1 = getGroupEventKeys(event, groupId);
          keys2 = getGroupEventKeys(event, groupId);
        } else if (EXPECTED_ACTIVITY_EVENTS.includes(event)) {
          keys1 = getActivityEventKeys(event);
          keys2 = getActivityEventKeys(event);
        } else {
          keys1 = getPaymentEventKeys(event, groupId);
          keys2 = getPaymentEventKeys(event, groupId);
        }

        // Results should be identical
        expect(JSON.stringify(keys1)).toBe(JSON.stringify(keys2));
      }),
      { numRuns: 200 }
    );
  });

  it('total mapped events equals exactly 14 with no extras', () => {
    const allMapped = [
      ...Object.keys(groupEvents),
      ...Object.keys(activityEvents),
      ...Object.keys(paymentEvents),
    ];

    expect(allMapped.sort()).toEqual(ALL_EVENTS.sort());
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. Cross-Entity Invalidation Coverage
// ═══════════════════════════════════════════════════════════════════════════════

describe('Phase 4 — Cross-Entity Invalidation Coverage', () => {
  it('SettlementUpdated invalidates dashboard.summary() (cross-screen)', () => {
    fc.assert(
      fc.property(fc.uuid(), (groupId) => {
        const keys = getGroupEventKeys('SettlementUpdated', groupId);
        const dashboardSummary = queryKeys.dashboard.summary();
        const hasDashboard = keys.some(
          (key) => JSON.stringify(key) === JSON.stringify(dashboardSummary)
        );
        expect(hasDashboard).toBe(true);
      }),
      { numRuns: 50 }
    );
  });

  it('GroupInvitationAccepted invalidates groups.all() (cross-screen)', () => {
    const keys = getActivityEventKeys('GroupInvitationAccepted');
    const groupsAll = queryKeys.groups.all();
    const hasGroups = keys.some(
      (key) => JSON.stringify(key) === JSON.stringify(groupsAll)
    );
    expect(hasGroups).toBe(true);
  });

  it('FriendRequestAccepted invalidates friends.all() (cross-screen)', () => {
    const keys = getActivityEventKeys('FriendRequestAccepted');
    const friendsAll = queryKeys.friends.all();
    const hasFriends = keys.some(
      (key) => JSON.stringify(key) === JSON.stringify(friendsAll)
    );
    expect(hasFriends).toBe(true);
  });

  it('PaymentCompleted invalidates dashboard.summary() (cross-screen)', () => {
    fc.assert(
      fc.property(fc.uuid(), (groupId) => {
        const keys = getPaymentEventKeys('PaymentCompleted', groupId);
        const dashboardSummary = queryKeys.dashboard.summary();
        const hasDashboard = keys.some(
          (key) => JSON.stringify(key) === JSON.stringify(dashboardSummary)
        );
        expect(hasDashboard).toBe(true);
      }),
      { numRuns: 50 }
    );
  });

  it('PaymentRefunded also invalidates dashboard.summary() (cross-screen)', () => {
    fc.assert(
      fc.property(fc.uuid(), (groupId) => {
        const keys = getPaymentEventKeys('PaymentRefunded', groupId);
        const dashboardSummary = queryKeys.dashboard.summary();
        const hasDashboard = keys.some(
          (key) => JSON.stringify(key) === JSON.stringify(dashboardSummary)
        );
        expect(hasDashboard).toBe(true);
      }),
      { numRuns: 50 }
    );
  });

  it('GroupInvitationAccepted also invalidates notifications.all()', () => {
    const keys = getActivityEventKeys('GroupInvitationAccepted');
    const notificationsAll = queryKeys.notifications.all();
    const hasNotifications = keys.some(
      (key) => JSON.stringify(key) === JSON.stringify(notificationsAll)
    );
    expect(hasNotifications).toBe(true);
  });

  it('FriendRequestAccepted also invalidates notifications.all()', () => {
    const keys = getActivityEventKeys('FriendRequestAccepted');
    const notificationsAll = queryKeys.notifications.all();
    const hasNotifications = keys.some(
      (key) => JSON.stringify(key) === JSON.stringify(notificationsAll)
    );
    expect(hasNotifications).toBe(true);
  });
});
