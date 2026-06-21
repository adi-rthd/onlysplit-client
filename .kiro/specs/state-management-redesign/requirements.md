# Requirements Document

## Introduction

The OnlySplit application suffers from pervasive stale state issues caused by isolated Zustand stores with no cross-store invalidation, incomplete callback-based refresh patterns, and SignalR events scoped only to GroupDetailsPage. This redesign introduces a unified server-state management layer (TanStack Query) alongside a slimmed Zustand layer for UI-only state, establishing deterministic mutation → invalidation chains that guarantee all consuming components display fresh data after any write operation.

## Glossary

- **Query_Cache**: The TanStack Query cache that stores server-fetched data, keyed by hierarchical query keys, and provides automatic invalidation, deduplication, and background refetching
- **Mutation_Pipeline**: The centralized TanStack Query mutation handler that executes an API call, performs optimistic updates, and triggers cache invalidation across all affected query keys upon success or rollback on failure
- **Invalidation_Map**: A declarative configuration mapping each mutation type to the set of query keys that must be invalidated or refetched after that mutation succeeds
- **Query_Key**: A structured array identifier (e.g., `['groups', groupId, 'expenses']`) used by Query_Cache to uniquely address cached data and enable hierarchical invalidation
- **Optimistic_Update**: A technique where the UI is updated immediately before the server responds, then rolled back if the server returns an error
- **SignalR_Bridge**: A module that listens to SignalR hub events and translates them into Query_Cache invalidations, enabling real-time multi-user consistency
- **UI_Store**: A Zustand store that holds only client-side transient state (modals, filters, active tabs, form drafts) with no server-fetched data
- **Offline_Queue**: A persistence layer (Capacitor Filesystem or IndexedDB) that stores pending mutations when the device is offline and replays them upon reconnection
- **Server_State**: Any data fetched from the backend API that represents the authoritative source of truth (groups, expenses, balances, settlements, friends, activities, dashboard summary)
- **Stale_Time**: The duration for which cached data is considered fresh and will not trigger a background refetch

## Requirements

### Requirement 1: Server-State Layer Adoption

**User Story:** As a developer, I want all server-fetched data managed by a dedicated server-state library, so that caching, deduplication, background refetching, and invalidation are handled automatically rather than manually in each store.

#### Acceptance Criteria

1. THE Query_Cache SHALL manage all Server_State including groups, expenses, balances, settlements, invitations, activities, dashboard summary, and notifications
2. WHEN a component mounts that consumes Server_State, THE Query_Cache SHALL serve cached data immediately and initiate a background refetch if the data is older than the configured Stale_Time of 30 seconds
3. WHEN multiple components request the same Query_Key within a 2-second window, THE Query_Cache SHALL deduplicate the requests into a single network call
4. WHEN a mutation succeeds that modifies Server_State (create, update, or delete of groups, expenses, or settlements), THE Query_Cache SHALL invalidate all Query_Keys whose data depends on the mutated resource within 1 second of mutation completion
5. IF a background refetch fails due to a network error, THEN THE Query_Cache SHALL retain the previously cached data and retry the refetch up to 3 times with exponential backoff starting at 1 second
6. THE UI_Store SHALL contain only client-side transient state such as modal visibility, selected tabs, search input values, form drafts, sort preferences, and user locale or currency preferences
7. THE UI_Store SHALL NOT store any data that originates from backend API responses including lists, detail objects, counts, or status values returned by the server

### Requirement 2: Deterministic Mutation-to-Invalidation Chain

**User Story:** As a user, I want every data modification to immediately reflect across all screens, so that I never see stale balances, outdated group names, or missing expenses regardless of which page I navigate to.

#### Acceptance Criteria

1. WHEN an expense is created, THE Mutation_Pipeline SHALL invalidate the Query_Keys for that group's expenses, that group's balances, that group's settlements, the dashboard summary, and the activity feed within 2 seconds of receiving a successful API response
2. WHEN an expense is updated, THE Mutation_Pipeline SHALL invalidate the Query_Keys for that group's expenses, that group's balances, that group's settlements, and the dashboard summary within 2 seconds of receiving a successful API response
3. WHEN an expense is deleted, THE Mutation_Pipeline SHALL invalidate the Query_Keys for that group's expenses, that group's balances, that group's settlements, the dashboard summary, and the activity feed within 2 seconds of receiving a successful API response
4. WHEN a group is created, THE Mutation_Pipeline SHALL invalidate the Query_Keys for the groups list, the dashboard summary, and the activity feed within 2 seconds of receiving a successful API response
5. WHEN a group is updated, THE Mutation_Pipeline SHALL invalidate the Query_Keys for the groups list, that group's detail, and the dashboard summary within 2 seconds of receiving a successful API response
6. WHEN a group is deleted, THE Mutation_Pipeline SHALL invalidate the Query_Keys for the groups list and the dashboard summary within 2 seconds of receiving a successful API response
7. WHEN a group is deleted, THE Mutation_Pipeline SHALL remove all cached data for that group's expenses, balances, and settlements so that subsequent navigation to that group's screens does not render stale data
8. WHEN a settlement is recorded, THE Mutation_Pipeline SHALL invalidate the Query_Keys for that group's balances, that group's settlements, the dashboard summary, and the activity feed within 2 seconds of receiving a successful API response
9. WHEN a friend request is sent, THE Mutation_Pipeline SHALL invalidate the Query_Keys for the sent-requests list within 2 seconds of receiving a successful API response
10. WHEN a friend request is accepted, THE Mutation_Pipeline SHALL invalidate the Query_Keys for the friends list, the received-requests list, and the activity feed within 2 seconds of receiving a successful API response
11. WHEN a friend request is rejected, THE Mutation_Pipeline SHALL invalidate the Query_Keys for the received-requests list within 2 seconds of receiving a successful API response
12. WHEN a friend is removed, THE Mutation_Pipeline SHALL invalidate the Query_Keys for the friends list within 2 seconds of receiving a successful API response
13. WHEN a group invitation is accepted, THE Mutation_Pipeline SHALL invalidate the Query_Keys for the groups list, the invitations list, and the dashboard summary within 2 seconds of receiving a successful API response
14. IF the API mutation call succeeds but one or more dependent Query_Key re-fetches fail, THEN THE Mutation_Pipeline SHALL retain the mutation success state, mark the failed Query_Keys as stale, and retry the failed re-fetches up to 3 times with exponential backoff
15. WHEN any mutation triggers invalidation of multiple Query_Keys, THE Mutation_Pipeline SHALL initiate all invalidations in parallel and SHALL not block the user from interacting with the application while re-fetches are in progress

### Requirement 3: Hierarchical Query Key Structure

**User Story:** As a developer, I want query keys organized hierarchically, so that I can invalidate an entire entity subtree (e.g., all data for a specific group) with a single prefix-based invalidation.

#### Acceptance Criteria

1. THE Query_Cache SHALL use hierarchical Query_Keys with a maximum depth of 3 segments following the pattern `[entity, id?, sub-entity?]`, where `entity` is one of: groups, expenses, balances, settlements, friends, activities, dashboard, notifications (e.g., `['groups']`, `['groups', groupId]`, `['groups', groupId, 'expenses']`)
2. WHEN a group is deleted, THE Mutation_Pipeline SHALL invalidate all Query_Keys prefixed with `['groups', groupId]` such that all matching cached entries (including sub-entities: expenses, balances, and settlements for that group) are removed from the cache and any active observers trigger a refetch on next access
3. THE Query_Cache SHALL support invalidation by prefix matching, where providing an array of 1 or more key segments invalidates all cached entries whose key starts with those exact segments in order, without requiring enumeration of individual leaf keys
4. WHEN a mutation succeeds that modifies a sub-entity (e.g., an expense is created or deleted within a group), THE Mutation_Pipeline SHALL invalidate all Query_Keys prefixed with `[entity, id]` for the affected parent entity to ensure related sub-entity caches remain consistent
5. IF a prefix-based invalidation is triggered with an empty array or a key segment that matches no cached entries, THEN THE Query_Cache SHALL complete the operation without error and without modifying any existing cache entries

### Requirement 4: Optimistic Updates for Common Operations

**User Story:** As a user, I want the UI to respond instantly when I create or delete an expense, so that the app feels fast and responsive even on slow mobile networks.

#### Acceptance Criteria

1. WHEN an expense is created, THE Mutation_Pipeline SHALL optimistically insert the new expense at the top of the cached expenses list within 100 milliseconds of the user confirming the action, before the server responds
2. WHEN an expense is deleted, THE Mutation_Pipeline SHALL optimistically remove the expense from the cached expenses list within 100 milliseconds of the user confirming the deletion, before the server responds
3. IF the server returns an error or fails to respond within 10 seconds after an Optimistic_Update, THEN THE Mutation_Pipeline SHALL rollback the cache to its pre-mutation state within 500 milliseconds and display an error toast visible for at least 4 seconds indicating the operation that failed
4. WHEN a group is created, THE Mutation_Pipeline SHALL optimistically insert the new group at the top of the cached groups list within 100 milliseconds of the user confirming the action, before the server responds
5. WHEN a friend request is sent, THE Mutation_Pipeline SHALL optimistically add the user to the sent-requests list within 100 milliseconds of the user confirming the action, before the server responds
6. IF an Optimistic_Update rollback occurs, THEN THE Mutation_Pipeline SHALL re-render all affected UI components to reflect the rolled-back state without requiring a manual page refresh or navigation action
7. WHILE a mutation is pending server confirmation, THE Mutation_Pipeline SHALL mark the optimistically-inserted item with a visual pending indicator distinguishable from confirmed items

### Requirement 5: SignalR Real-Time Integration with Query Cache

**User Story:** As a user in a shared group, I want real-time updates from other group members to appear on any screen I am viewing, so that I always see the latest expenses and settlements without manually refreshing.

#### Acceptance Criteria

1. THE SignalR_Bridge SHALL subscribe to the groups hub, activity hub, and payments hub, and SHALL trigger store re-fetches mapped to the event type within 2 seconds of receiving a server-pushed event
2. WHEN the SignalR_Bridge receives an ExpenseAdded, ExpenseUpdated, or ExpenseDeleted event, THE Query_Cache SHALL invalidate the affected group's expenses, balances, and settlements Query_Keys
3. WHEN the SignalR_Bridge receives a BalanceUpdated event, THE Query_Cache SHALL invalidate the affected group's balances and settlements Query_Keys
4. WHEN the SignalR_Bridge receives a GroupUpdated event, THE Query_Cache SHALL invalidate that group's detail Query_Key and the groups list Query_Key
5. WHEN the SignalR_Bridge receives a MemberJoined or MemberRemoved event, THE Query_Cache SHALL invalidate that group's detail Query_Key and balances Query_Key
6. WHEN the SignalR_Bridge receives a SettlementUpdated event, THE Query_Cache SHALL invalidate that group's settlements, balances, and dashboard summary Query_Keys
7. WHEN the SignalR_Bridge receives a FriendRequestReceived, FriendRequestAccepted, GroupInvitationReceived, or GroupInvitationAccepted event on the activity hub, THE Query_Cache SHALL invalidate the notifications and invitations Query_Keys
8. WHEN the SignalR_Bridge receives a PaymentCompleted or PaymentRefunded event on the payments hub, THE Query_Cache SHALL invalidate the affected group's balances, settlements, and dashboard summary Query_Keys
9. WHILE the user is on any page, THE SignalR_Bridge SHALL propagate cache invalidations to all active stores so that visible data is re-fetched without requiring page navigation or manual refresh
10. IF a SignalR hub connection is lost and then re-established, THEN THE SignalR_Bridge SHALL invalidate all Query_Keys associated with groups the user has joined, triggering a full re-fetch of stale data within 5 seconds of reconnection

### Requirement 6: Friends State Migration to Query Cache

**User Story:** As a developer, I want the FriendsPage to use the same server-state pattern as all other pages, so that friend request mutations properly invalidate dependent views and external mutations can trigger updates.

#### Acceptance Criteria

1. THE Query_Cache SHALL manage friends data using Query_Keys: `['friends']`, `['friends', 'requests']`, `['friends', 'sent']`
2. WHEN the FriendsPage mounts, THE Query_Cache SHALL serve cached friends, received-requests, and sent-requests data immediately and initiate a background refetch for any query whose data exceeds the configured Stale_Time of 5 minutes
3. WHEN a friend request is accepted from the FriendsPage, THE Mutation_Pipeline SHALL invalidate the `['friends']`, `['friends', 'requests']`, and activity feed Query_Keys
4. WHEN a friend request is rejected from the FriendsPage, THE Mutation_Pipeline SHALL invalidate the `['friends', 'requests']` Query_Key
5. WHEN a friend request is sent from the FriendsPage, THE Mutation_Pipeline SHALL invalidate the `['friends', 'sent']` Query_Key
6. WHEN a friend is removed from the FriendsPage, THE Mutation_Pipeline SHALL invalidate the `['friends']` Query_Key
7. THE FriendsPage SHALL NOT use local React useState for friends list, received requests, or sent requests data that originates from the server; local state SHALL be limited to transient UI concerns such as search input value, active tab selection, and in-progress operation identifiers
8. IF a friends query fetch fails, THEN THE FriendsPage SHALL display an error message with a retry button that re-executes the failed query

### Requirement 7: Dashboard Freshness Guarantee

**User Story:** As a user, I want the Dashboard to always show accurate totals for net balance, amounts owed, and amounts owed to me, so that I can trust the financial summary at a glance.

#### Acceptance Criteria

1. WHEN the Dashboard mounts, THE Query_Cache SHALL serve cached summary data immediately (rendering within 100 ms if cached data exists) and trigger a background refetch if the data exceeds the configured Stale_Time (default: 30 seconds)
2. WHEN any of the following mutations succeeds anywhere in the application — expense creation, expense update, expense deletion, settlement recording, group creation, group update, or group deletion — THE Mutation_Pipeline SHALL invalidate the `['dashboard', 'summary']` Query_Key within 1 second of mutation completion
3. WHEN the user navigates to the Dashboard from any other page and the `['dashboard', 'summary']` Query_Key has been invalidated since the last successful fetch, THE Query_Cache SHALL refetch the summary data before or during render and display updated totals within 3 seconds of navigation (assuming network availability)
4. THE Dashboard SHALL NOT rely solely on a one-time `fetchSummary()` call on initial mount; it SHALL receive automatic updates through Query_Cache invalidation so that the displayed net balance, amount owed, and amount owed to the user reflect all mutations made during the current session
5. IF the background refetch triggered by stale data or invalidation fails due to a network error or server error, THEN THE Dashboard SHALL continue displaying the last successfully fetched cached data and SHALL display an indicator informing the user that the summary may be outdated

### Requirement 8: Offline Mutation Queueing

**User Story:** As a mobile user on an unreliable network, I want my expense creation and edits to be queued when offline and submitted automatically when connectivity returns, so that I never lose data entry work.

#### Acceptance Criteria

1. WHEN a mutation (expense creation or expense edit) is triggered while the Capacitor Network plugin reports no connectivity, THE Offline_Queue SHALL persist the mutation payload to device storage within 1 second of the user action and display a confirmation indicating the action was saved locally
2. WHEN network connectivity is restored as reported by the Capacitor Network plugin, THE Offline_Queue SHALL replay all persisted mutations in FIFO order within 10 seconds of connectivity restoration, processing one mutation at a time before sending the next
3. IF a replayed mutation fails due to a server conflict (HTTP 409) after a maximum of 3 retry attempts, THEN THE Offline_Queue SHALL skip that mutation, remove it from the queue, preserve the remaining queued mutations for continued replay, and notify the user with an error message indicating which expense failed and the reason for the conflict
4. WHILE the device is offline, THE Query_Cache SHALL serve the most recently cached data for read operations without displaying error states, and SHALL reflect locally queued mutations (optimistic updates) in the displayed data
5. THE Offline_Queue SHALL persist mutations using Capacitor Filesystem or IndexedDB such that queued mutations survive app restarts, app kills, and device reboots, supporting a maximum of 50 queued mutations
6. WHEN the Offline_Queue contains one or more pending mutations, THE Offline_Queue SHALL display a persistent indicator showing the count of queued mutations awaiting sync
7. IF the device storage is full or the queue has reached 50 mutations, THEN THE Offline_Queue SHALL reject the new mutation, preserve all previously queued mutations, and notify the user with an error message indicating that the offline queue is full

### Requirement 9: Incremental Migration Path

**User Story:** As a developer, I want to migrate stores one at a time without breaking the running application, so that the redesign can be shipped incrementally with each store migration deployable independently.

#### Acceptance Criteria

1. THE migration SHALL proceed in phases: Phase 1 (expenseStore + settlementStore), Phase 2 (groupStore + DashboardStore), Phase 3 (FriendsPage + activityStore), Phase 4 (groupInvitationStore + SignalR_Bridge), Phase 5 (Offline_Queue + cleanup), with authStore and useCurrencyStore excluded from migration and retained as Zustand stores
2. WHILE a store is being migrated, THE application SHALL remain functional such that all existing user-facing features continue to operate without runtime errors, and no data fetch returns stale results older than 5 seconds compared to the source of truth
3. WHEN a migrated query hook and an unmigrated Zustand store both depend on the same data, THE Invalidation_Map SHALL trigger refreshes in both systems within 2 seconds of the originating mutation completing
4. IF a migration phase introduces a regression detected by automated tests failing or a runtime error occurring in a migrated store's data path, THEN THE system SHALL support reverting that phase via a feature flag toggle that restores the previous Zustand store implementation without requiring redeployment, and without altering the data or behavior of stores migrated in other phases
5. WHEN a migration phase is completed, THE migrated query hooks SHALL pass all existing integration tests that previously exercised the corresponding Zustand store, with no modifications to test assertions
6. WHILE migrated query hooks and unmigrated Zustand stores coexist, THE application SHALL ensure that mutations performed through either system are reflected in both within a single render cycle, preventing the user from observing inconsistent state across components

### Requirement 10: Query Key Factory Pattern

**User Story:** As a developer, I want query keys generated from a centralized factory, so that key typos and inconsistencies across the codebase are impossible and invalidation logic is maintainable.

#### Acceptance Criteria

1. THE application SHALL define a single `queryKeys` factory module exporting Query_Key generators as pure functions (deterministic, no side effects) for each application entity: groups, expenses, balances, settlements, friends, activities, dashboard, notifications, and invitations
2. WHEN a new query is added to the codebase, THE application SHALL contain zero inline query key string literals or array literals outside the factory module (verifiable by static analysis or code search)
3. THE Invalidation_Map SHALL reference query keys exclusively through the factory module, with zero hardcoded key strings or arrays in invalidation logic
4. THE factory module SHALL expose a minimum of 3 hierarchy levels per entity using array-based keys that support TanStack Query prefix matching: a scope level returning the entity prefix (e.g., `queryKeys.groups.all()`), a list level for filtered collections (e.g., `queryKeys.groups.lists()`), and a detail level accepting an identifier parameter (e.g., `queryKeys.groups.detail(id)`)
5. WHEN `queryClient.invalidateQueries` is called with a scope-level key (e.g., `queryKeys.groups.all()`), THE application SHALL invalidate all queries whose keys start with that prefix, including list and detail levels for that entity

### Requirement 11: Separation of Concerns in Service Layer

**User Story:** As a developer, I want the service layer to handle only API communication without side effects like toast notifications or store mutations, so that the mutation pipeline has full control over success/error handling.

#### Acceptance Criteria

1. THE service layer (expenseService, groupService, friendshipService, settlementService) SHALL contain zero imports of toast notification libraries (e.g., react-hot-toast) and zero invocations of toast display functions
2. THE service layer (expenseService, groupService, friendshipService, settlementService) SHALL return the parsed API response data (the response body object) on successful calls without transforming, filtering, or wrapping it in additional structures
3. THE Mutation_Pipeline SHALL be responsible for displaying success and error toasts after mutations complete or fail
4. THE service layer SHALL NOT directly import or invoke Zustand store setters, React Query cache invalidation methods, or any other state management side effects
5. WHEN an API call fails, THE service layer SHALL throw an error object containing at minimum two properties: the HTTP status code (integer) and the server error message (string extracted from the response body), rather than catching the error internally and returning null, false, or an empty array
6. WHEN an API call fails due to a network error (no response received), THE service layer SHALL throw an error object containing a status code of 0 and a message indicating network unavailability
7. THE handleApiError utility SHALL NOT display toast notifications; it SHALL only parse the error and return or throw a structured error object suitable for consumption by the Mutation_Pipeline

### Requirement 12: Stale Time and Cache Lifetime Configuration

**User Story:** As a developer, I want centralized control over cache durations per entity type, so that frequently-changing data (balances) refetches often while rarely-changing data (user profile) stays cached longer.

#### Acceptance Criteria

1. THE Query_Cache SHALL use a Stale_Time of 30 seconds for balances and settlements data
2. THE Query_Cache SHALL use a Stale_Time of 60 seconds for expenses, groups list, and dashboard summary data
3. THE Query_Cache SHALL use a Stale_Time of 5 minutes for friends list and user profile data
4. THE Query_Cache SHALL use a garbage collection time of 10 minutes for all queries that have zero active subscribers (no mounted component observing the query)
5. WHERE a query specifies its own Stale_Time value, THE Query_Cache SHALL use that query-level Stale_Time instead of the entity-type default defined in criteria 1–3
6. WHEN a component mounts and its query data has exceeded the configured Stale_Time, THE Query_Cache SHALL trigger a background refetch while continuing to display the stale cached data
7. WHEN the app returns to the foreground after being backgrounded, THE Query_Cache SHALL mark all queries whose data age exceeds their configured Stale_Time as stale and trigger a background refetch for any that have active subscribers

### Requirement 13: Error and Loading State Standardization

**User Story:** As a user, I want consistent loading and error feedback across all screens, so that I always know when data is being fetched, when it failed, and how to retry.

#### Acceptance Criteria

1. WHILE a data store is fetching data for the first time (no cached data exists for the requested resource), THE consuming component SHALL display either a skeleton placeholder or a loading spinner within 100 milliseconds of the fetch starting
2. WHILE a data store is refetching data in the background (cached data already exists for the requested resource), THE consuming component SHALL continue displaying the previously cached data without showing a loading indicator
3. IF a data fetch fails due to a network error or a server response with status code 4xx or 5xx, THEN THE consuming component SHALL display an error message describing the failure reason and a "Try again" retry button, both visible without scrolling within the component's content area
4. WHEN the user taps the retry button displayed after a fetch failure, THE data store SHALL re-execute the exact failed fetch operation using the same parameters as the original request, and the component SHALL display the loading state from criterion 1 until the retry completes or fails
5. IF the retry fetch also fails, THEN THE consuming component SHALL update the error message to reflect the latest failure reason and SHALL continue displaying the retry button, allowing unlimited retry attempts
6. THE application SHALL provide a global error boundary component wrapping the top-level route content that catches unhandled rendering errors and displays a recovery screen containing an error description and a button that reloads the current route without a full page refresh

### Requirement 14: DevTools and Observability

**User Story:** As a developer, I want visibility into the query cache state during development, so that I can debug invalidation chains and confirm mutations trigger the expected refetches.

#### Acceptance Criteria

1. WHILE the application runs in development mode (Vite `import.meta.env.DEV` is true), THE Query_Cache SHALL render the React Query DevTools panel, displaying active queries, inactive queries, mutations, and their current cache states
2. WHILE the application runs in development mode, WHEN the SignalR_Bridge receives a server event, THE SignalR_Bridge SHALL log to the browser console the event name, the hub that received it, and the list of query keys scheduled for invalidation
3. WHILE the application runs in development mode, WHEN a mutation completes successfully, THE Mutation_Pipeline SHALL log to the browser console the mutation key, the list of query keys targeted for invalidation, and whether each invalidation triggered a refetch
4. IF the application runs in production mode (Vite `import.meta.env.DEV` is false), THEN THE Query_Cache SHALL NOT include React Query DevTools in the production bundle, and THE SignalR_Bridge and Mutation_Pipeline SHALL suppress all debug console logging
