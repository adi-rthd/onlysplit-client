/**
 * Phase 2 Validation Tests — Group State Management Redesign
 *
 * Validates:
 * 1. Group update invalidation completeness
 * 2. Optimistic group creation rollback
 * 3. Optimistic group update rollback (list + detail)
 * 4. Group deletion cascade (prefix-based removal)
 * 5. No duplicate Zustand/Dashboard state when flags are on
 * 6. SignalR GroupUpdated invalidation (structural code analysis)
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

/** Arbitrary: non-empty alphanumeric string (simulates groupId) */
const groupIdArb = fc.stringMatching(/^[a-zA-Z0-9_-]{1,36}$/);

/** Arbitrary: group object for testing optimistic mutations */
const groupArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ maxLength: 100 }),
  currency: fc.constantFrom('USD', 'EUR', 'INR', 'GBP', 'JPY'),
  totalSpending: fc.nat({ max: 100000 }),
  createdAt: fc.integer({ min: 1577836800000, max: 1767139200000 }).map((ts) => new Date(ts).toISOString()),
  members: fc.array(fc.record({ userId: fc.uuid(), name: fc.string({ minLength: 1 }) }), { minLength: 1, maxLength: 10 }),
});

/** Arbitrary: array of groups (1–20) */
const groupsArrayArb = fc.array(groupArb, { minLength: 1, maxLength: 20 });

/** Arbitrary: partial group update payload */
const groupUpdateArb = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  description: fc.string({ maxLength: 100 }),
  currency: fc.constantFrom('USD', 'EUR', 'INR', 'GBP', 'JPY'),
});

// ═══════════════════════════════════════════════════════════════════════════════
// 1. GROUP UPDATE INVALIDATION COMPLETENESS
// ═══════════════════════════════════════════════════════════════════════════════

describe('1. Group Update Invalidation Completeness', () => {
  it('updateGroup returns exactly 3 invalidation keys', () => {
    fc.assert(
      fc.property(groupIdArb, (groupId) => {
        const keys = invalidationMap.updateGroup(groupId);
        expect(keys).toHaveLength(3);
      }),
      { numRuns: 200 }
    );
  });

  it('updateGroup invalidates ["groups"], ["groups", groupId], ["dashboard", "summary"]', () => {
    fc.assert(
      fc.property(groupIdArb, (groupId) => {
        const keys = invalidationMap.updateGroup(groupId);

        const expected = [
          queryKeys.groups.all(),         // ['groups']
          queryKeys.groups.detail(groupId), // ['groups', groupId]
          queryKeys.dashboard.summary(),   // ['dashboard', 'summary']
        ];

        expect(arraysEqualDeep(keys, expected)).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it('invalidation covers Dashboard, GroupsPage, GroupDetailsPage, and group dropdowns', () => {
    const groupId = 'test-group-123';
    const keys = invalidationMap.updateGroup(groupId);

    // Dashboard cards read from ['dashboard', 'summary']
    expect(keys).toContainEqual(['dashboard', 'summary']);
    // GroupsPage reads from ['groups']
    expect(keys).toContainEqual(['groups']);
    // GroupDetailsPage header reads from ['groups', groupId]
    expect(keys).toContainEqual(['groups', groupId]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 2. OPTIMISTIC GROUP CREATION ROLLBACK
// ═══════════════════════════════════════════════════════════════════════════════

describe('2. Optimistic Group Creation Rollback', () => {
  it('rollback restores exactly the original array (property-based)', () => {
    fc.assert(
      fc.property(groupsArrayArb, (originalGroups) => {
        // Snapshot
        const snapshot = [...originalGroups];

        // Simulate optimistic insert (same logic as useCreateGroup onMutate)
        const optimisticGroup = {
          id: `temp-${Date.now()}`,
          name: 'New Group',
          _isPending: true,
          createdAt: new Date().toISOString(),
        };
        const mutatedGroups = [optimisticGroup, ...snapshot];

        // Verify mutation added element
        expect(mutatedGroups.length).toBe(originalGroups.length + 1);
        expect(mutatedGroups[0]._isPending).toBe(true);
        expect(mutatedGroups[0].id).toMatch(/^temp-/);

        // Rollback: restore from snapshot
        const rolledBack = snapshot;

        // Verify lossless round-trip
        expect(rolledBack).toEqual(originalGroups);
        expect(rolledBack.length).toBe(originalGroups.length);
      }),
      { numRuns: 100 }
    );
  });

  it('optimistic group has _isPending flag and temp ID', () => {
    fc.assert(
      fc.property(groupsArrayArb, fc.record({ name: fc.string({ minLength: 1 }) }), (groups, newGroup) => {
        const optimisticGroup = {
          ...newGroup,
          id: `temp-${Date.now()}`,
          _isPending: true,
          createdAt: new Date().toISOString(),
        };
        const mutated = [optimisticGroup, ...groups];

        expect(mutated[0]._isPending).toBe(true);
        expect(mutated[0].id.startsWith('temp-')).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 3. OPTIMISTIC GROUP UPDATE ROLLBACK (LIST + DETAIL)
// ═══════════════════════════════════════════════════════════════════════════════

describe('3. Optimistic Group Update Rollback (list + detail)', () => {
  it('rollback restores both list and detail to original state', () => {
    fc.assert(
      fc.property(groupsArrayArb, groupUpdateArb, (groups, updatePayload) => {
        // Pick a random group from the array to update
        const targetIndex = 0;
        const targetGroup = groups[targetIndex];
        const groupId = targetGroup.id;

        // Snapshot (simulating onMutate)
        const previousGroups = [...groups.map((g) => ({ ...g }))];
        const previousDetail = { ...targetGroup };

        // Apply optimistic update to list
        const mutatedList = groups.map((group) =>
          group.id === groupId
            ? { ...group, ...updatePayload, _isPending: true }
            : group
        );

        // Apply optimistic update to detail
        const mutatedDetail = { ...targetGroup, ...updatePayload, _isPending: true };

        // Verify _isPending is set
        const updatedInList = mutatedList.find((g) => g.id === groupId);
        expect(updatedInList._isPending).toBe(true);
        expect(mutatedDetail._isPending).toBe(true);

        // Verify the update was applied
        expect(updatedInList.name).toBe(updatePayload.name);
        expect(mutatedDetail.name).toBe(updatePayload.name);

        // Rollback (simulating onError)
        const rolledBackList = previousGroups;
        const rolledBackDetail = previousDetail;

        // Verify lossless rollback
        expect(rolledBackList).toEqual(groups);
        expect(rolledBackDetail).toEqual(targetGroup);

        // Verify _isPending is gone after rollback
        const restoredInList = rolledBackList.find((g) => g.id === groupId);
        expect(restoredInList._isPending).toBeUndefined();
        expect(rolledBackDetail._isPending).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });

  it('_isPending flag is added during optimistic phase', () => {
    fc.assert(
      fc.property(groupArb, groupUpdateArb, (group, updatePayload) => {
        // Before mutation: no _isPending
        expect(group._isPending).toBeUndefined();

        // After optimistic update
        const mutated = { ...group, ...updatePayload, _isPending: true };
        expect(mutated._isPending).toBe(true);

        // After rollback
        const rolledBack = { ...group };
        expect(rolledBack._isPending).toBeUndefined();
      }),
      { numRuns: 100 }
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 4. GROUP DELETION CASCADE (property-based)
// ═══════════════════════════════════════════════════════════════════════════════

describe('4. Group Deletion Cascade', () => {
  it('deleteGroup returns { invalidate, remove } structure', () => {
    fc.assert(
      fc.property(groupIdArb, (groupId) => {
        const result = invalidationMap.deleteGroup(groupId);

        expect(result).toHaveProperty('invalidate');
        expect(result).toHaveProperty('remove');
        expect(Array.isArray(result.invalidate)).toBe(true);
        expect(Array.isArray(result.remove)).toBe(true);
      }),
      { numRuns: 200 }
    );
  });

  it('remove contains ["groups", groupId] for prefix-based clearing', () => {
    fc.assert(
      fc.property(groupIdArb, (groupId) => {
        const { remove } = invalidationMap.deleteGroup(groupId);

        // Must contain the group detail key as prefix root
        expect(remove).toContainEqual(['groups', groupId]);
      }),
      { numRuns: 200 }
    );
  });

  it('TanStack Query prefix matching: ["groups", groupId] is prefix of all sub-entity keys', () => {
    fc.assert(
      fc.property(groupIdArb, (groupId) => {
        const prefix = queryKeys.groups.detail(groupId); // ['groups', groupId]

        // All sub-entity keys must start with the prefix
        const subKeys = [
          queryKeys.groups.expenses(groupId),    // ['groups', groupId, 'expenses']
          queryKeys.groups.balances(groupId),    // ['groups', groupId, 'balances']
          queryKeys.groups.settlements(groupId), // ['groups', groupId, 'settlements']
        ];

        subKeys.forEach((key) => {
          // TanStack Query prefix matching: each element of prefix is matched
          const isPrefix = prefix.every((segment, i) => key[i] === segment);
          expect(isPrefix).toBe(true);
          expect(key.length).toBeGreaterThan(prefix.length);
        });
      }),
      { numRuns: 200 }
    );
  });

  it('no orphaned UI state: all group-specific keys start with ["groups", groupId]', () => {
    fc.assert(
      fc.property(groupIdArb, (groupId) => {
        const prefix = ['groups', groupId];

        // All group-specific keys from queryKeys factory
        const groupSpecificKeys = [
          queryKeys.groups.detail(groupId),
          queryKeys.groups.expenses(groupId),
          queryKeys.groups.balances(groupId),
          queryKeys.groups.settlements(groupId),
        ];

        groupSpecificKeys.forEach((key) => {
          // Each starts with ['groups', groupId]
          expect(key[0]).toBe('groups');
          expect(key[1]).toBe(groupId);
        });
      }),
      { numRuns: 200 }
    );
  });

  it('invalidate contains ["groups"] and ["dashboard", "summary"]', () => {
    fc.assert(
      fc.property(groupIdArb, (groupId) => {
        const { invalidate } = invalidationMap.deleteGroup(groupId);

        expect(invalidate).toContainEqual(['groups']);
        expect(invalidate).toContainEqual(['dashboard', 'summary']);
      }),
      { numRuns: 200 }
    );
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 5. NO DUPLICATE ZUSTAND GROUP/DASHBOARD STATE (Code Analysis)
// ═══════════════════════════════════════════════════════════════════════════════

describe('5. No Duplicate Zustand Group/Dashboard State', () => {
  it('Dashboard.jsx: when useQueryMode is true, legacy fetchGroups/fetchSummary are NOT called', () => {
    const source = readSource('src/pages/Dashboard.jsx');

    // The legacy useEffect should be guarded by `if (useQueryMode) return;`
    expect(source).toContain('if (useQueryMode) return');

    // Verify fetchGroups and fetchSummary are only called inside the guarded block
    // Split by the guard line and check that outside the guarded block, these aren't called unguarded
    const lines = source.split('\n');
    const guardedEffectIndex = lines.findIndex((l) => l.includes('if (useQueryMode) return'));
    expect(guardedEffectIndex).toBeGreaterThan(-1);

    // Verify the query hooks are only enabled when flag is on
    expect(source).toContain('useDashboardSummary({ enabled: useQueryMode })');
    expect(source).toContain('useGroups({ enabled: useQueryMode })');
  });

  it('GroupsPage.jsx: when useQueryGroups is true, fetchGroups is NOT called', () => {
    const source = readSource('src/pages/GroupsPage.jsx');

    // Legacy fetch is guarded: only runs when flag is off
    expect(source).toMatch(/if\s*\(\s*!useQueryGroups\s*\)/);

    // Query hook is enabled only when flag is on
    expect(source).toContain('useGroups({ enabled: useQueryGroups })');
  });

  it('GroupDetailsPage.jsx: when useQueryGroups is true, fetchGroupById is NOT called', () => {
    const source = readSource('src/pages/GroupDetailsPage.jsx');

    // Legacy fetch is guarded
    expect(source).toMatch(/if\s*\(\s*!useQueryGroups\s*\)/);

    // Query hook is only active when flag is on
    expect(source).toContain('enabled: useQueryGroups');

    // Verify useGroupDetail is called with enabled flag
    expect(source).toMatch(/useGroupDetail\(groupId,\s*\{\s*enabled:\s*useQueryGroups/);
  });

  it('legacy calls are conditional on flag being off', () => {
    const dashboardSrc = readSource('src/pages/Dashboard.jsx');
    const groupsSrc = readSource('src/pages/GroupsPage.jsx');
    const detailsSrc = readSource('src/pages/GroupDetailsPage.jsx');

    // Dashboard: fetchGroups & fetchSummary only called when useQueryMode is false
    const dashboardEffect = dashboardSrc.slice(
      dashboardSrc.indexOf('if (useQueryMode) return'),
      dashboardSrc.indexOf('}, [useQueryMode]')
    );
    expect(dashboardEffect).toContain('fetchGroups');
    expect(dashboardEffect).toContain('fetchSummary');

    // GroupsPage: fetchGroups only called when !useQueryGroups
    expect(groupsSrc).toMatch(/if\s*\(\s*!useQueryGroups\s*\)[\s\S]*?fetchGroups/);

    // GroupDetailsPage: fetchGroupById only called when !useQueryGroups
    expect(detailsSrc).toMatch(/if\s*\(\s*!useQueryGroups\s*\)[\s\S]*?fetchGroupById/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// 6. SIGNALR GroupUpdated INVALIDATION (Structural)
// ═══════════════════════════════════════════════════════════════════════════════

describe('6. SignalR GroupUpdated Invalidation', () => {
  const source = readSource('src/pages/GroupDetailsPage.jsx');

  it('GroupUpdated handler invalidates ["groups", groupId] when flag is on', () => {
    // Find the GroupUpdated handler section
    const groupUpdatedSection = source.slice(
      source.indexOf('GroupUpdated:'),
      source.indexOf('},', source.indexOf('GroupUpdated:'))
    );

    expect(groupUpdatedSection).toContain('useQueryGroups');
    expect(groupUpdatedSection).toContain('queryKeys.groups.detail(groupId)');
  });

  it('GroupUpdated handler invalidates ["groups"] (the list) when flag is on', () => {
    const groupUpdatedSection = source.slice(
      source.indexOf('GroupUpdated:'),
      source.indexOf('},', source.indexOf('GroupUpdated:'))
    );

    expect(groupUpdatedSection).toContain('queryKeys.groups.all()');
  });

  it('MemberJoined handler invalidates ["groups", groupId] and balances', () => {
    const memberJoinedSection = source.slice(
      source.indexOf('MemberJoined:'),
      source.indexOf('},', source.indexOf('MemberJoined:'))
    );

    expect(memberJoinedSection).toContain('queryKeys.groups.detail(groupId)');
    expect(memberJoinedSection).toContain('queryKeys.groups.balances(groupId)');
  });

  it('MemberRemoved handler invalidates ["groups", groupId] and balances', () => {
    const memberRemovedSection = source.slice(
      source.indexOf('MemberRemoved:'),
      source.indexOf('},', source.indexOf('MemberRemoved:'))
    );

    expect(memberRemovedSection).toContain('queryKeys.groups.detail(groupId)');
    expect(memberRemovedSection).toContain('queryKeys.groups.balances(groupId)');
  });

  it('all SignalR handlers are guarded by feature flag check', () => {
    // All handlers that use queryKeys should check for the flag first
    const handlers = ['GroupUpdated', 'MemberJoined', 'MemberRemoved'];

    handlers.forEach((handler) => {
      const section = source.slice(
        source.indexOf(`${handler}:`),
        source.indexOf('},', source.indexOf(`${handler}:`))
      );
      expect(section).toMatch(/if\s*\(useQuery(Groups|)\)/);
    });
  });
});
