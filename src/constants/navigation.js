import { LayoutDashboard, Users, Clock, Settings, PieChart, UserPlus } from 'lucide-react';

export const NAVIGATION_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/groups', icon: Users, label: 'Groups' },
  { path: '/friends', icon: UserPlus, label: 'Friends' },
  { path: '/settlements', icon: Clock, label: 'Settlements' },
  { path: '/analytics', icon: PieChart, label: 'Analytics' },
];

export const BOTTOM_NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/groups', icon: Users, label: 'Groups' },
  { path: '/friends', icon: UserPlus, label: 'Friends' },
  { path: '/settlements', icon: Clock, label: 'Settle' },
  { path: '/settings', icon: Settings, label: 'Profile' },
];
