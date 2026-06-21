// src/constants/seoConfig.js

// Centralized SEO configuration — single source of truth for metadata defaults and per-route SEO settings.

export const SEO_DEFAULTS = {
  siteName: 'OnlySplit',
  baseUrl: 'https://onlysplit.in',
  defaultTitle: 'OnlySplit - Premium Expense Splitting',
  defaultDescription:
    'OnlySplit helps you split expenses with friends and groups effortlessly. Track balances, settle debts, and manage shared spending.',
  defaultImage: 'https://onlysplit.in/og-image.png',
  twitterCard: 'summary_large_image',
};

export const ROUTE_SEO = {
  '/': {
    title: 'OnlySplit - Premium Expense Splitting App',
    description:
      'Split expenses with friends and groups effortlessly. Track balances, settle debts, and manage shared spending with OnlySplit.',
    keywords: 'expense splitting, split bills, group expenses, settle debts, shared spending',
    priority: 1.0,
    changefreq: 'weekly',
  },
  '/features': {
    title: 'Features - OnlySplit Expense Splitting',
    description:
      'Discover OnlySplit features: group expense tracking, smart settlements, real-time sync, and multi-currency support.',
    keywords: 'expense tracker features, group splitting, smart settlements, real-time sync',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/how-it-works': {
    title: 'How It Works - OnlySplit',
    description:
      'Learn how OnlySplit makes expense splitting simple. Create a group, add expenses, and settle up in three easy steps.',
    keywords: 'how to split expenses, expense splitting app tutorial, group expense management',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/splitwise-alternative': {
    title: 'Best Splitwise Alternative - OnlySplit',
    description:
      'Looking for a Splitwise alternative? OnlySplit offers modern expense sharing with instant settlements and zero ads.',
    keywords: 'splitwise alternative, best expense sharing app, split expenses with friends, group expense tracker, roommate expense app',
    priority: 0.5,
    changefreq: 'monthly',
  },
  '/blog': {
    title: 'Blog - OnlySplit',
    description:
      'Tips, guides, and insights on managing shared expenses, splitting bills fairly, and simplifying group finances.',
    keywords: 'expense splitting tips, group finance blog, money management advice',
    priority: 0.5,
    changefreq: 'monthly',
  },
  '/contact': {
    title: 'Contact Us - OnlySplit',
    description:
      'Get in touch with the OnlySplit team. We are here to help with questions, feedback, or partnership inquiries.',
    keywords: 'contact OnlySplit, support, feedback, help',
    priority: 0.5,
    changefreq: 'monthly',
  },
  '/privacy-policy': {
    title: 'Privacy Policy - OnlySplit',
    description:
      'Read our privacy policy to understand how OnlySplit collects, uses, and protects your personal data.',
    keywords: 'privacy policy, data protection, user privacy, OnlySplit privacy',
    priority: 0.5,
    changefreq: 'monthly',
  },
  '/terms': {
    title: 'Terms of Service - OnlySplit',
    description:
      'Review the terms and conditions governing your use of the OnlySplit expense splitting platform.',
    keywords: 'terms of service, terms and conditions, user agreement, OnlySplit terms',
    priority: 0.5,
    changefreq: 'monthly',
  },
  '/download': {
    title: 'Download OnlySplit App',
    description:
      'Download OnlySplit on Android and iOS. Start splitting expenses with friends and groups on the go.',
    keywords: 'download OnlySplit, expense splitting app, Android, iOS, mobile app',
    priority: 0.5,
    changefreq: 'monthly',
  },
};
