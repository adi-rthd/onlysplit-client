import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import { useNavigate } from 'react-router-dom';
import { GlassPanel } from '../components/ui/GlassCard';
import {
  Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Plus, Utensils, Users, Receipt, ShoppingCart, Car, CreditCard
} from 'lucide-react';
import groupService from '../services/groupService';

import GroupCard from '../components/ui/GroupCard';

import { motion } from 'framer-motion';

import { useGroupStore } from '../store/groupStore';
import { useDashboardStore } from '../store/DashboardStore';
import { formatCurrency } from '../services/currencyService'
import { ROUTES } from '../constants/routes';
import NotificationBell from '../components/Dashboard/NotificationBell';

const Dashboard = () => {
  const navigate = useNavigate();
  const [graphView, setGraphView] = useState('monthly');

  const groups = useGroupStore(
    (state) => state.groups
  );
  const fetchGroups = useGroupStore(
    (state) => state.fetchGroups
  );
  const summary = useDashboardStore(
    (state) => state.summary
  );

  const isLoading = useDashboardStore(
    (state) => state.isLoading
  );

  const fetchSummary = useDashboardStore(
    (state) => state.fetchSummary
  );
  
  const handleDeleteGroup = async (groupId) => {
    try {
      await groupService.deleteGroup(groupId);

      await fetchGroups();
    } catch (err) {
      toast.error('Failed to delete group');
    }
  };
  useEffect(() => {
    const loadData = async () => {
      await fetchGroups();
      await fetchSummary();
    };

    loadData();
  }, []);

  const renderCurrencyTotals = (key) => {
    if (isLoading || !summary) return <div className="text-[32px] font-bold text-on-surface mb-1">--</div>;

    // Support flat structure where summary contains currency as a string
    if (typeof summary.currency === 'string') {
      return (
        <div className="space-y-1 mb-2">
          <div className="text-[28px] md:text-[32px] font-bold text-on-surface tracking-tight leading-none">
            {formatCurrency(summary[key] || 0, summary.currency)}
          </div>
        </div>
      );
    }

    // Support multi-currency structure if added in the future
    const entries = summary.balances ? Object.entries(summary.balances) : [];
    if (entries.length === 0) return <div className="text-[32px] font-bold text-on-surface mb-1">--</div>;

    return (
      <div className="space-y-1 mb-2">
        {entries.map(([currency, totals]) => (
          <div key={currency} className="text-[28px] md:text-[32px] font-bold text-on-surface tracking-tight leading-none">
            {formatCurrency(totals[key] || 0, currency)}
          </div>
        ))}
      </div>
    );
  };

  const formatCompact = (amount, currencyCode = 'INR') => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: currencyCode,
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(amount);
    } catch {
      return `${amount}`;
    }
  };

  const monthlyChart = useMemo(() => {
    const currency = summary?.currency || groups?.[0]?.currency || 'INR';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = Array(12).fill(0);
    let total = 0;

    groups?.forEach((group) => {
      if (group.createdAt) {
        const date = new Date(group.createdAt);
        if (!isNaN(date.getTime())) {
          monthlyData[date.getMonth()] += Number(group.totalSpending || 0);
          total += Number(group.totalSpending || 0);
        }
      }
    });

    const maxVal = Math.max(...monthlyData);
    const divisor = maxVal > 0 ? maxVal : 1;
    const bars = monthlyData.map((val, i) => ({
      height: total === 0 ? 4 : Math.min(Math.max((val / divisor) * 100, val > 0 ? 12 : 4), 100),
      label: months[i],
      value: val
    }));
    return {
      bars,
      yLabels: [
        total > 0 ? formatCompact(maxVal, currency) : formatCompact(0, currency),
        total > 0 ? formatCompact(maxVal / 2, currency) : formatCompact(0, currency),
        formatCompact(0, currency)
      ]
    };
  }, [groups, summary]);

  const groupChart = useMemo(() => {
    const currency = summary?.currency || groups?.[0]?.currency || 'INR';
    if (!groups?.length) return { bars: [], yLabels: ['0', '0', '0'] };

    const maxVal = Math.max(...groups.map(g => Number(g.totalSpending || 0)));
    const divisor = maxVal > 0 ? maxVal : 1;
    const bars = groups.map((group) => {
      const amount = Number(group.totalSpending || 0);
      return {
        height: Math.min(Math.max((amount / divisor) * 100, amount > 0 ? 12 : 4), 100),
        label: group.name?.length > 6 ? group.name.substring(0, 6) + '…' : (group.name || 'Group'),
        value: amount
      };
    });
    return {
      bars,
      yLabels: [
        formatCompact(maxVal, currency),
        formatCompact(maxVal / 2, currency),
        formatCompact(0, currency)
      ]
    };
  }, [groups, summary]);

  const chartData = graphView === 'monthly' ? monthlyChart : groupChart;

  const getActivityIcon = (title) => {
    const lower = (title || '').toLowerCase();
    if (lower.includes('food') || lower.includes('lunch') || lower.includes('dinner') || lower.includes('breakfast')) return Utensils;
    if (lower.includes('travel') || lower.includes('uber') || lower.includes('cab') || lower.includes('fuel')) return Car;
    if (lower.includes('shopping') || lower.includes('grocery')) return ShoppingCart;
    if (lower.includes('pay') || lower.includes('recharge') || lower.includes('bill')) return CreditCard;
    return Receipt;
  };

  return (
    <>
      {/* HEADER */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-on-surface">
            Overview
          </h1>

          <p className="text-on-surface-variant">
            Your financial breakdown for
            this month.
          </p>
        </div>
        <NotificationBell />
      </header>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* NET BALANCE */}
        <GlassPanel className="p-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-28 h-28 bg-primary/8 rounded-full blur-2xl"></div>

          <div className="flex justify-between items-center mb-5">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              Net Balance
            </span>

            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="text-primary" size={18} />
            </div>
          </div>

          {renderCurrencyTotals('totalSpending')}

          <div className="text-neon-lime flex items-center gap-1.5 text-sm">
            <TrendingUp size={14} />
            <span>{summary?.totalGroups || 0} active groups</span>
          </div>
        </GlassPanel>

        {/* YOU OWE */}
        <GlassPanel className="p-6 border-l-[3px] border-l-error/80">
          <div className="flex justify-between items-center mb-5">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              You Owe
            </span>

            <div className="w-9 h-9 rounded-xl bg-error/10 flex items-center justify-center">
              <ArrowUpRight className="text-error" size={18} />
            </div>
          </div>

          {renderCurrencyTotals('youOwe')}

          <p className="text-on-surface-variant text-sm">
            Across {summary?.youOweGroups || 0} groups
          </p>
        </GlassPanel>

        {/* YOU ARE OWED */}
        <GlassPanel className="p-6 border-l-[3px] border-l-neon-lime/80">
          <div className="flex justify-between items-center mb-5">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
              You Are Owed
            </span>

            <div className="w-9 h-9 rounded-xl bg-neon-lime/10 flex items-center justify-center">
              <ArrowDownRight className="text-neon-lime" size={18} />
            </div>
          </div>

          {renderCurrencyTotals('youAreOwed')}

          <p className="text-on-surface-variant text-sm">
            {summary?.youAreOwedGroups || 0} pending settlements
          </p>
        </GlassPanel>
      </div>

      {/* GRAPH + ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* GRAPH */}
        <GlassPanel className="lg:col-span-2 p-6 h-80 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="text-[15px] font-semibold text-on-surface">
                {graphView === 'monthly' ? 'Monthly Spending' : 'Spending by Group'}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                {graphView === 'monthly' ? new Date().getFullYear() : `${groups?.length || 0} groups`}
              </p>
            </div>
            <div className="flex items-center bg-surface-container rounded-lg p-1 gap-0.5">
              <button
                onClick={() => setGraphView('monthly')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${graphView === 'monthly'
                  ? 'bg-surface-container-high text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setGraphView('groups')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${graphView === 'groups'
                  ? 'bg-surface-container-high text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
                  }`}
              >
                By Group
              </button>
            </div>
          </div>

          {/* GRAPH AREA */}
          <div className="flex-1 flex gap-2">
            {/* Y-AXIS */}
            <div className="flex flex-col justify-between text-[10px] text-on-surface-variant font-medium items-end w-12 pr-2 py-2 pb-7">
              <span>{chartData.yLabels[0]}</span>
              <span>{chartData.yLabels[1]}</span>
              <span>{chartData.yLabels[2]}</span>
            </div>

            {/* BARS + X-AXIS */}
            <div className="flex-1 flex flex-col">
              {/* BARS */}
              <div className="flex-1 flex items-end gap-1.5 px-1 pb-2 border-l border-surface-container-high">
                {chartData.bars.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col justify-end items-center h-full group relative">
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${item.height}%`, opacity: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.04, ease: 'easeOut' }}
                      className={`w-full max-w-[24px] mx-auto rounded-t-lg transition-all duration-200 ${
                        item.value > 0
                          ? 'bg-primary/60 hover:bg-primary shadow-[0_0_12px_rgba(124,108,255,0.15)]'
                          : 'bg-surface-container-high/60'
                      }`}
                    >
                      {item.value > 0 && (
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest border border-glass-stroke px-2 py-1 rounded-lg text-[10px] whitespace-nowrap z-10 pointer-events-none text-on-surface font-medium shadow-lg">
                          {formatCompact(item.value, summary?.currency || 'INR')}
                        </div>
                      )}
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* X-AXIS LABELS */}
              <div className="flex gap-1.5 px-1 pt-2 border-t border-surface-container-high/50">
                {chartData.bars.map((item, index) => (
                  <div key={index} className="flex-1 text-center text-[9px] text-on-surface-variant truncate">
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassPanel>

        {/* RECENT ACTIVITY */}
        <GlassPanel className="p-6 flex flex-col h-80">
          <h3 className="text-[15px] font-semibold text-on-surface mb-4">
            Recent Activity
          </h3>

          <div className="flex-1 flex flex-col min-h-0">
            {!summary?.recentActivities || summary.recentActivities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-3">
                  <Receipt size={20} />
                </div>
                <p className="text-sm font-medium text-on-surface mb-1">No activity yet</p>
                <p className="text-xs text-on-surface-variant">Expenses will show up here</p>
              </div>
            ) : (
              <div className="space-y-1 flex-1 overflow-y-auto hide-scrollbar">
                {summary.recentActivities.slice(0, 5).map((activity, index) => {
                  const ActivityIcon = getActivityIcon(activity.title);
                  return (
                    <div
                      key={activity.expenseId || index}
                      className="flex items-center justify-between rounded-xl px-2 py-2.5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0">
                          <ActivityIcon size={16} className="text-on-surface-variant" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium truncate text-on-surface">{activity.title}</p>
                          <p className="text-xs text-on-surface-variant truncate">
                            {activity.groupName} · {new Date(activity.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[13px] font-bold ml-2 flex-shrink-0 tabular-nums ${
                        (activity.type?.toLowerCase() === 'paymentcompleted' || activity.type?.toLowerCase() === 'settlement')
                          ? 'text-green-400'
                          : 'text-error'
                      }`}>
                        {(activity.type?.toLowerCase() === 'paymentcompleted' || activity.type?.toLowerCase() === 'settlement') ? '+' : '-'}
                        {formatCurrency(activity.amount, activity.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </GlassPanel>
      </div>

      {/* GROUPS */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-on-surface">Your Groups</h2>
          <button
            onClick={() => navigate('/groups')}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Users size={13} /> View all
          </button>
        </div>

        {!groups?.length ? (
          <GlassPanel className="p-8 flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-3">
              <Users size={20} />
            </div>
            <p className="text-sm font-medium text-on-surface mb-1">No groups yet</p>
            <p className="text-xs text-on-surface-variant">Create a group to start splitting expenses</p>
          </GlassPanel>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.slice(0, 3).map((group) => (
              <GroupCard key={group.id || group.groupId} group={group} onDelete={handleDeleteGroup} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() =>
          navigate(ROUTES.ADD_EXPENSE.replace(':id', 'all'))
        }
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary-container to-inverse-primary rounded-full flex items-center justify-center shadow-lg neon-glow z-[60]"
      >
        <Plus
          className="text-white"
          size={28}
        />
      </motion.button>
    </>
  );
};

export default Dashboard;