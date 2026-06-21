# Implementation Plan: State Management Redesign

## Overview

Migrate OnlySplit from fragmented Zustand-based server-state management to a unified TanStack Query layer across 5 incremental phases. Each phase is independently deployable and rollback-safe via feature flags. Zustand is retained only for auth, currency, and transient UI state.

## Tasks

- [x] 1. Phase 1 Foundation: Install dependencies, create query infrastructure, and migrate expenseStore + settlementStore
  - [x] 1.1 Install TanStack Query and set up project infrastructure
    - Run `npm install @tanstack/react-query` and `npm install -D @tanstack/react-query-devtools vitest @testing-library/react fast-check`
    - Create `src/queries/` directory structure
    - Create `src/queries/queryClient.js` with QueryClient singleton (staleTime 60s, gcTime 10min, retry 3, exponential backoff, refetchOnWindowFocus, refetchOnReconnect)
    - Create `src/queries/queryKeys.js` with the complete query key factory (groups, friends, activities, dashboard, notifications, invitations — all hierarchy levels)
    - Create `src/queries/invalidationMap.js` with the full mutation-to-invalidation mapping
    - Create `src/utils/featureFlags.js` with `useQueryExpenses`, `useQueryGroups`, `useQueryFriends`, `useQueryInvitations` flags
    - _Requirements: 1.1, 1.2, 1.5, 3.1, 3.3, 10.1, 10.2, 10.3, 10.4, 10.5, 12.1, 12.2, 12.3, 12.4_

  - [x] 1.2 Create QueryProvider and wrap the application
    - Create `src/providers/QueryProvider.jsx` with `QueryClientProvider`, lazy-loaded ReactQueryDevtools (DEV only), and Suspense boundary
    - Modify `src/App.jsx` to wrap the entire component tree inside `QueryProvider` (above `HashRouter`)
    - Verify DevTools panel renders in development mode
    - _Requirements: 14.1, 14.4_

  - [x] 1.3 Refactor expenseService to remove side effects
    - Modify `src/services/expenseService.js`: remove `import toast from 'react-hot-toast'` and `import { handleApiError }` calls
    - Make all methods throw structured errors `{ status, message }` instead of catching and returning null
    - Return raw `data?.data || data` on success without wrapping
    - Ensure `getGroupExpenses` returns the array directly
    - _Requirements: 11.1, 11.2, 11.4, 11.5, 11.6_

  - [x] 1.4 Refactor settlementService to remove side effects
    - Modify `src/services/settlementService.js`: remove `import toast` and `handleApiError` calls
    - Make all methods throw structured errors `{ status, message }` on failure
    - Return raw response data on success
    - _Requirements: 11.1, 11.2, 11.4, 11.5, 11.6_

  - [x] 1.5 Create expense and settlement query hooks
    - Create `src/queries/hooks/useGroupExpenses.js` — useQuery with `queryKeys.groups.expenses(groupId)`, staleTime 60s, enabled when groupId truthy
    - Create `src/queries/hooks/useGroupBalances.js` — useQuery with `queryKeys.groups.balances(groupId)`, staleTime 30s
    - Create `src/queries/hooks/useGroupSettlements.js` — useQuery with `queryKeys.groups.settlements(groupId)`, staleTime 30s
    - Each hook calls the corresponding refactored service method as `queryFn`
    - _Requirements: 1.1, 1.2, 1.3, 12.1, 12.2_

  - [x] 1.6 Create expense mutation hooks with optimistic updates
    - Create `src/queries/mutations/useCreateExpense.js` with optimistic insert (add to top of list with `_isPending: true`, `id: temp-{timestamp}`), rollback on error, toast on success/error, invalidate per invalidationMap
    - Create `src/queries/mutations/useUpdateExpense.js` with cache update, rollback, toast, and invalidation
    - Create `src/queries/mutations/useDeleteExpense.js` with optimistic removal, rollback, toast, and invalidation
    - Create `src/queries/mutations/useRecordSettlement.js` with toast and invalidation per invalidationMap
    - Create `src/queries/mutations/useRegenerateSettlements.js` with invalidation of balances and settlements keys
    - Add DEV-only console logging in `onSettled` for each mutation (mutation key + invalidated keys)
    - _Requirements: 2.1, 2.2, 2.3, 2.8, 4.1, 4.2, 4.3, 4.6, 4.7, 14.3_

  - [x] 1.7 Create QueryBoundary and PendingBadge UI components
    - Create `src/components/ui/QueryBoundary.jsx` — renders loading skeleton when `isLoading && !data`, error state with retry button when `isError && !data`, calls `children(data)` on success
    - Create `src/components/ui/PendingBadge.jsx` — renders a small visual indicator on items with `_isPending: true`
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [x] 1.8 Migrate GroupDetailsPage to use query hooks
    - Modify `src/pages/GroupDetailsPage.jsx`: replace `useExpenseStore` and `useSettlementStore` imports with `useGroupExpenses`, `useGroupBalances`, `useGroupSettlements` hooks
    - Replace `fetchExpenses(groupId)` / `fetchBalances(groupId)` / `fetchSettlements(groupId)` calls with hook data
    - Use `useDeleteExpense(groupId)` for expense deletion
    - Wrap expense list and settlements list with QueryBoundary for error/loading states
    - Keep `useGroupStore` for `currentGroup` and `fetchGroupById` (migrated in Phase 2)
    - Show PendingBadge on optimistically-inserted expenses
    - Guard behind `flags.useQueryExpenses` — fall back to old stores if flag is false
    - _Requirements: 1.1, 1.4, 9.1, 9.2, 9.4, 13.1, 13.2, 13.3_

  - [x] 1.9 Migrate AddExpenseModal and EditExpenseModal to use mutation hooks
    - Modify `src/components/modals/AddExpenseModal.jsx`: replace `useExpenseStore().createExpense` with `useCreateExpense(groupId).mutate`
    - Remove `isLoading` from expenseStore; use `mutation.isPending` for button disabled state
    - Modify `src/components/modals/EditExpenseModal.jsx`: replace `useExpenseStore().updateExpense` with `useUpdateExpense(groupId).mutate`
    - Remove manual `fetchExpenses`, `fetchBalances`, `fetchSettlements` callbacks in `onUpdated` (query invalidation handles it)
    - _Requirements: 2.1, 2.2, 4.1, 4.3_

  - [ ]* 1.10 Write property tests for query key factory and invalidation map
    - **Property 1: Invalidation Map Completeness and Correctness** — For random mutation types and entity IDs, verify invalidationMap returns arrays of valid query keys matching the specification
    - **Property 2: Query Key Factory Structural Integrity** — For random entity names and IDs, verify arrays have length 1–3, entity as first segment, deterministic output, and 3+ hierarchy levels per entity
    - **Validates: Requirements 1.4, 2.1–2.13, 3.1, 10.4**

- [x] 2. Checkpoint — Phase 1 Validation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Phase 2: Migrate groupStore + DashboardStore to TanStack Query
  - [x] 3.1 Refactor groupService and dashboardService to remove side effects
    - Modify `src/services/groupService.js`: remove `import toast`, remove `handleApiError`, throw structured errors, return raw data
    - Modify `src/services/dashboardService.js`: remove `handleApiError`, throw structured errors, return raw data
    - _Requirements: 11.1, 11.2, 11.4, 11.5, 11.6_

  - [x] 3.2 Create group and dashboard query hooks
    - Create `src/queries/hooks/useGroups.js` — exports `useGroups()` (list, staleTime 60s) and `useGroupDetail(groupId)` (detail)
    - Create `src/queries/hooks/useDashboardSummary.js` — exports `useDashboardSummary()` with staleTime 60s
    - _Requirements: 1.1, 7.1, 12.2_

  - [x] 3.3 Create group mutation hooks
    - Create `src/queries/mutations/useCreateGroup.js` with optimistic insert into groups list, rollback, toast, invalidation per invalidationMap
    - Create `src/queries/mutations/useUpdateGroup.js` with optimistic detail update, rollback, toast, invalidation
    - Create `src/queries/mutations/useDeleteGroup.js` with `removeQueries` for prefix `['groups', groupId]` plus invalidation of `groups.all()` and `dashboard.summary()`
    - _Requirements: 2.4, 2.5, 2.6, 2.7, 3.2, 4.4_

  - [x] 3.4 Migrate Dashboard page to use query hooks
    - Modify `src/pages/Dashboard.jsx`: replace `useDashboardStore` with `useDashboardSummary()` hook
    - Replace `useGroupStore().groups` / `fetchGroups` with `useGroups()` hook
    - Remove `useEffect` that calls `fetchGroups()` and `fetchSummary()` on mount
    - Use QueryBoundary for loading/error states (replace DashboardSkeleton logic with QueryBoundary)
    - Guard behind `flags.useQueryGroups`
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 3.5 Migrate GroupsPage and group modals to use query hooks
    - Modify `src/pages/GroupsPage.jsx` (or equivalent): replace `useGroupStore().groups` / `fetchGroups` with `useGroups()` hook
    - Migrate `CreateGroupModal` to use `useCreateGroup()` mutation hook
    - Migrate `EditGroupModal` to use `useUpdateGroup()` mutation hook
    - Update GroupDetailsPage to use `useGroupDetail(groupId)` instead of `useGroupStore().fetchGroupById`
    - _Requirements: 2.4, 2.5, 4.4, 9.1_

  - [ ]* 3.6 Write unit tests for Dashboard query integration
    - Test that `useDashboardSummary` returns cached data immediately when cache is warm
    - Test that invalidation of `['dashboard', 'summary']` triggers background refetch
    - Test error state renders retry button via QueryBoundary
    - _Requirements: 7.1, 7.4, 7.5_

- [x] 4. Checkpoint — Phase 2 Validation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Phase 3: Migrate FriendsPage + activityStore to TanStack Query
  - [~] 5.1 Refactor friendshipService and activityService to remove side effects
    - Modify `src/services/friendshipService.js`: remove `import toast`, remove `handleApiError`, throw structured errors, return raw data
    - Modify `src/services/activityService.js`: remove `handleApiError`, throw structured errors, return raw data
    - _Requirements: 11.1, 11.2, 11.4, 11.5, 11.6_

  - [~] 5.2 Create friends and activity query hooks
    - Create `src/queries/hooks/useFriends.js` — exports `useFriends()` (staleTime 5min), `useFriendRequests()` (staleTime 5min), `useSentRequests()` (staleTime 5min)
    - Create `src/queries/hooks/useActivities.js` — exports `useActivities()` with staleTime 60s
    - _Requirements: 6.1, 6.2, 12.3_

  - [~] 5.3 Create friends mutation hooks
    - Create `src/queries/mutations/useSendFriendRequest.js` with optimistic add to sent list, rollback, toast, invalidation
    - Create `src/queries/mutations/useAcceptFriendRequest.js` with optimistic remove from requests, rollback, toast, invalidation of `friends.all()`, `friends.requests()`, `activities.all()`
    - Create `src/queries/mutations/useRejectFriendRequest.js` with invalidation of `friends.requests()`
    - Create `src/queries/mutations/useRemoveFriend.js` with optimistic removal from friends list, rollback, toast, invalidation of `friends.all()`
    - _Requirements: 2.9, 2.10, 2.11, 2.12, 4.5, 6.3, 6.4, 6.5, 6.6_

  - [~] 5.4 Rewrite FriendsPage to use query hooks
    - Modify `src/pages/FriendsPage.jsx`: remove all `useState` for `friends`, `receivedRequests`, `sentRequests`, `loading`
    - Use `useFriends()`, `useFriendRequests()`, `useSentRequests()` query hooks for data
    - Keep local state only for: `searchInput`, `activeTab`, `sendingIds`, `removingIds`, `processingIds`, `searchResults`
    - Replace manual `loadData()` calls with automatic query invalidation via mutation hooks
    - Wrap each tab content with QueryBoundary for error/loading handling
    - Guard behind `flags.useQueryFriends`
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 9.1_

  - [ ]* 5.5 Write unit tests for FriendsPage mutation invalidation
    - Test that `useAcceptFriendRequest` invalidates `['friends']`, `['friends', 'requests']`, and `['activities']`
    - Test that `useSendFriendRequest` optimistically adds to sent list and rolls back on error
    - Test that `useRemoveFriend` optimistically removes from friends list
    - _Requirements: 6.3, 6.4, 6.5, 6.6_

- [~] 6. Checkpoint — Phase 3 Validation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Phase 4: Migrate groupInvitationStore + implement SignalR Bridge
  - [~] 7.1 Refactor groupInviteService to remove side effects
    - Modify `src/services/groupInviteService.js`: remove `import toast`, remove `handleApiError`, throw structured errors, return raw data
    - _Requirements: 11.1, 11.2, 11.4, 11.5, 11.6_

  - [~] 7.2 Create invitation and notification query hooks
    - Create `src/queries/hooks/useInvitations.js` — exports `useInvitations()` and `useGroupInvites(groupId)` with staleTime 60s
    - Create `src/queries/hooks/useNotifications.js` — exports `useNotifications()` with staleTime 60s
    - _Requirements: 1.1, 12.2_

  - [~] 7.3 Create invitation mutation hooks
    - Create `src/queries/mutations/useAcceptInvitation.js` with optimistic remove from invitations, rollback, toast, invalidation of `groups.all()`, `invitations.all()`, `dashboard.summary()`
    - Create `src/queries/mutations/useRejectInvitation.js` with invalidation of `invitations.all()`
    - Create `src/queries/mutations/useInviteToGroup.js` with invalidation of `invitations.group(groupId)`
    - Create `src/queries/mutations/useMarkNotificationsRead.js` with optimistic cache update, invalidation of `notifications.all()`
    - _Requirements: 2.13_

  - [~] 7.4 Implement SignalR Bridge for global cache invalidation
    - Create `src/queries/signalrBridge.js` implementing `setupSignalRBridge(queryClient, { groupHub, activityHub, paymentHub })`
    - Map all group hub events (ExpenseAdded, ExpenseUpdated, ExpenseDeleted, BalanceUpdated, GroupUpdated, MemberJoined, MemberRemoved, SettlementUpdated) to query key invalidations per the design matrix
    - Map all activity hub events (FriendRequestReceived, FriendRequestAccepted, GroupInvitationReceived, GroupInvitationAccepted) to invalidations
    - Map payment hub events (PaymentCompleted, PaymentRefunded) to invalidations
    - Implement reconnection handler: on hub reconnect, invalidate all groups, dashboard, activities, notifications keys
    - Add DEV-only console logging for each event received (hub, event name, invalidated keys)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 14.2_

  - [~] 7.5 Integrate SignalR Bridge into app lifecycle
    - Modify `src/hooks/useSignalR.js`: after `connectAll()`, call `setupSignalRBridge(queryClient, { groupHub: getGroupHub(), activityHub: getActivityHub(), paymentHub: getPaymentHub() })`
    - Import `queryClient` from `src/queries/queryClient.js`
    - Remove per-page SignalR event handlers from `GroupDetailsPage.jsx` (the `useGroupSignalR` call and its handlers)
    - Remove `NotificationListener` and `PaymentListener` component usage from `App.jsx` (bridge handles globally)
    - Guard behind `flags.useQueryInvitations`
    - _Requirements: 5.1, 5.9, 5.10, 9.1_

  - [ ]* 7.6 Write property tests for SignalR event-to-key mapping
    - **Property 3: SignalR Event-to-Key Mapping Correctness** — For random event types and group IDs, verify the bridge produces exactly the specified set of query keys, all valid factory outputs
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8**

- [~] 8. Checkpoint — Phase 4 Validation
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Phase 5: Implement Offline Queue + final cleanup
  - [~] 9.1 Implement Offline Queue with Capacitor Filesystem persistence
    - Create `src/queries/offlineQueue.js` implementing the `OfflineQueue` class
    - Support `init()`, `enqueue(mutation)`, `processQueue()`, `subscribe(listener)`, `pendingCount` getter
    - Persist queue to Capacitor Filesystem `offline-mutation-queue.json` in Data directory
    - Load queue from disk on init; survive app restarts
    - Process queue in FIFO order on network restore (listen to Capacitor Network `networkStatusChange`)
    - Enforce max 50 mutations: throw error and preserve existing queue if limit reached
    - Handle 409 conflicts: skip after 3 retries, notify user, continue with remaining queue
    - _Requirements: 8.1, 8.2, 8.3, 8.5, 8.7_

  - [~] 9.2 Create useOfflineQueue hook and OfflineIndicator component
    - Create `src/hooks/useOfflineQueue.js` — React hook that subscribes to queue pending count, returns `{ pendingCount, isOffline }`
    - Create `src/components/ui/OfflineIndicator.jsx` — persistent badge showing pending mutation count when > 0
    - Add OfflineIndicator to the app layout (visible on all pages when queue has pending items)
    - _Requirements: 8.4, 8.6_

  - [~] 9.3 Wire offline detection into mutation pipeline
    - Modify expense mutation hooks (`useCreateExpense`, `useUpdateExpense`) to check network status before calling service
    - When offline: enqueue mutation payload via `offlineQueue.enqueue()`, apply optimistic update, show "saved locally" toast
    - When online and queue processes: trigger invalidation per invalidationMap after each successful replay
    - _Requirements: 8.1, 8.2, 8.4_

  - [~] 9.4 Modify Axios interceptor for structured error handling
    - Modify `src/api/client.js` response interceptor: for non-401 errors, reject with `{ status, message, data }` structure
    - For network errors (no response): reject with `{ status: 0, message: 'Network unavailable' }`
    - _Requirements: 11.5, 11.6, 11.7_

  - [~] 9.5 Create global error boundary component
    - Create `src/components/ui/GlobalErrorBoundary.jsx` — class component wrapping top-level route content
    - Catches unhandled rendering errors, displays recovery screen with error description and "Reload" button that re-renders the route (not a full page refresh)
    - Wrap route content in `AppRoutes` with this error boundary
    - _Requirements: 13.6_

  - [~] 9.6 Create uiStore for consolidated transient UI state
    - Create `src/store/uiStore.js` with modal states, active tabs per page, and filter/search state
    - Export `useUIStore` with `openModal`, `closeModal`, `setTab`, `setFilter` actions
    - _Requirements: 1.6, 1.7_

  - [~] 9.7 Remove deprecated stores and feature flags (final cleanup)
    - Remove feature flag checks from all components (make query hooks the only code path)
    - Delete `src/store/expenseStore.js`, `src/store/settlementStore.js`, `src/store/groupStore.js`, `src/store/DashboardStore.js`, `src/store/activityStore.js`, `src/store/groupInvitationStore.js`
    - Delete `src/utils/featureFlags.js`
    - Remove `handleApiError` utility if no longer imported anywhere
    - Audit all service files: ensure zero `import toast` statements remain
    - Remove unused `NotificationListener` and `PaymentListener` component files if fully replaced by bridge
    - _Requirements: 9.1, 11.1, 11.4_

  - [ ]* 9.8 Write property tests for offline queue invariants
    - **Property 5: Offline Queue FIFO Ordering** — For random sequences of enqueued mutations, verify processQueue submits them in insertion order
    - **Property 6: Offline Queue Size Invariant** — For sequences exceeding 50, verify queue never exceeds 50 and enqueue throws without modifying existing entries
    - **Validates: Requirements 8.2, 8.5, 8.7**

  - [ ]* 9.9 Write property tests for optimistic update rollback
    - **Property 4: Optimistic Update Rollback Round-Trip** — For random expense arrays and insert/remove operations, verify onError rollback restores original cache state exactly
    - **Validates: Requirements 4.3, 4.6**

- [~] 10. Final Checkpoint — Full Migration Validation
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between migration phases
- Property tests validate universal correctness properties from the design document
- Feature flags (`VITE_USE_QUERY_*`) enable per-phase rollback during migration
- authStore and useCurrencyStore are deliberately excluded from migration (retained as Zustand)
- The SignalR bridge (Phase 4) replaces all per-page event handlers with a single global invalidation system
- Services must be refactored (remove toast/handleApiError) BEFORE creating mutation hooks that depend on them

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "1.3", "1.4"] },
    { "id": 2, "tasks": ["1.5", "1.6", "1.7"] },
    { "id": 3, "tasks": ["1.8", "1.9"] },
    { "id": 4, "tasks": ["1.10"] },
    { "id": 5, "tasks": ["3.1"] },
    { "id": 6, "tasks": ["3.2", "3.3"] },
    { "id": 7, "tasks": ["3.4", "3.5"] },
    { "id": 8, "tasks": ["3.6"] },
    { "id": 9, "tasks": ["5.1"] },
    { "id": 10, "tasks": ["5.2", "5.3"] },
    { "id": 11, "tasks": ["5.4"] },
    { "id": 12, "tasks": ["5.5"] },
    { "id": 13, "tasks": ["7.1"] },
    { "id": 14, "tasks": ["7.2", "7.3", "7.4"] },
    { "id": 15, "tasks": ["7.5"] },
    { "id": 16, "tasks": ["7.6"] },
    { "id": 17, "tasks": ["9.1", "9.4", "9.5", "9.6"] },
    { "id": 18, "tasks": ["9.2", "9.3"] },
    { "id": 19, "tasks": ["9.7"] },
    { "id": 20, "tasks": ["9.8", "9.9"] }
  ]
}
```
