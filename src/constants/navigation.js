import { LayoutDashboard, Users, Clock, Settings, PieChart } from 'lucide-react';

export const NAVIGATION_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/groups', icon: Users, label: 'Groups' },
  { path: '/activity', icon: Clock, label: 'Recent Activity' },
  { path: '/settlements', icon: Users, label: 'Settlements' },
  { path: '/analytics', icon: PieChart, label: 'Analytics' },
];

export const BOTTOM_NAV_ITEMS = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/groups', icon: Users, label: 'Groups' },
  { path: '/activity', icon: Clock, label: 'Activity' },
  { path: '/settings', icon: Settings, label: 'Profile' },
];
