/**
 * Page Information Card content for all major pages.
 * Each key corresponds to a page and maps to PageInfoCard props.
 * Content is SEO-friendly and always rendered in the DOM.
 */
export const pageInfo = {
  dashboard: {
    id: 'dashboard',
    title: 'About Dashboard',
    description:
      'Get a complete overview of your shared expenses, balances, and recent activity across all active groups.',
    features: [
      'View balances across groups',
      'Recent expenses at a glance',
      'Spending summary',
      'Quick actions',
    ],
    tips: [
      'Paused groups are excluded from dashboard calculations.',
      'Tap a group card to see full details.',
    ],
  },

  groups: {
    id: 'groups',
    title: 'About Groups',
    description:
      'Groups help you organize shared expenses with friends, family, roommates and trips. Track balances, split bills fairly and settle payments together.',
    features: [
      'Create unlimited groups',
      'Invite friends',
      'Split expenses equally, exactly, by percentage or shares',
      'Pause inactive groups',
      'Leave groups',
      'Track balances',
    ],
    tips: [
      'Paused groups don\'t affect dashboard totals.',
      'Invite friends before creating large groups.',
    ],
    notes: [
      'Only owners can edit group settings.',
      'Historical expenses remain even if a member leaves.',
    ],
  },

  groupDetails: {
    id: 'group-details',
    title: 'About This Group',
    description:
      'View all expenses, settlements, and balances within this group. Add expenses, invite members, or manage settings.',
    features: [
      'Add and edit expenses',
      'View member balances',
      'Track settlements',
      'Invite new members',
      'Recalculate settlements',
      'Mark settlements as settled',
    ],
    tips: [
      'Receivers can mark settlements as settled directly from the card.',
      'Use the recalculate button if balances seem off.',
    ],
    notes: ['Only the group owner can remove members or edit group settings.'],
  },

  friends: {
    id: 'friends',
    title: 'About Friends',
    description:
      'Manage your friends for faster expense sharing. Send requests, accept invites, and keep track of who you split with.',
    features: [
      'Send friend requests',
      'Accept or reject requests',
      'View per-friend balances',
      'Invite friends to groups',
    ],
    tips: [
      'Friend request notifications appear instantly.',
      'You can remove a friend at any time from the friend list.',
    ],
  },

  settlements: {
    id: 'settlements',
    title: 'About Settlements',
    description:
      'Track payments between members and keep balances accurate. Record payments, upload proof, or mark settlements as complete.',
    features: [
      'View pending payments',
      'Record offline payments',
      'Upload payment proof',
      'Mark as settled',
      'Settlement history',
    ],
    tips: [
      'Receivers can manually mark payments as settled if paid offline.',
      'Upload a screenshot as proof when recording a payment.',
    ],
  },

  analytics: {
    id: 'analytics',
    title: 'About Analytics',
    description:
      'Visualize your spending patterns, top categories, and expense trends across all groups.',
    features: [
      'Spending by category',
      'Monthly trends',
      'Group comparisons',
      'Top spenders',
    ],
    tips: ['Analytics only include active (non-paused) groups by default.'],
  },

  settings: {
    id: 'settings',
    title: 'About Settings',
    description:
      'Manage your profile, currency preferences, notifications, and account settings.',
    features: [
      'Update profile info',
      'Change default currency',
      'Notification preferences',
      'Account security',
    ],
    tips: ['Changing your default currency does not affect existing group currencies.'],
  },
};
