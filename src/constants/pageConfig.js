import { pageInfo } from './pageInfo';

/**
 * Unified page configuration.
 * Each page has a title, description, and guide (quick guide card content).
 * Pages import their config and pass it to <PageHeader>.
 */
export const pageConfig = {
  dashboard: {
    title: 'Overview',
    description: 'Your financial breakdown for this month.',
    guide: pageInfo.dashboard,
  },

  groups: {
    title: 'Your Groups',
    description: 'Manage your shared expenses and groups.',
    guide: pageInfo.groups,
  },

  groupDetails: {
    title: '', // dynamic — uses group name
    description: '',
    guide: pageInfo.groupDetails,
  },

  friends: {
    title: 'Friends',
    description: 'Manage your connections.',
    guide: pageInfo.friends,
  },

  settlements: {
    title: 'Settlements',
    description: 'Track pending payments and history.',
    guide: pageInfo.settlements,
  },

  analytics: {
    title: 'Analytics',
    description: 'Insights and patterns from your spending.',
    guide: pageInfo.analytics,
  },

  settings: {
    title: 'Settings',
    description: 'Manage your profile, account preferences, security and application settings.',
    guide: pageInfo.settings,
  },
};
