import React, {
  useEffect,
  useMemo,
  useState
} from 'react';

import { useNavigate } from 'react-router-dom';

import { GlassPanel } from '../components/ui/GlassCard';
import {
  Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Plus, Utensils, Users
} from 'lucide-react';

import GroupCard from '../components/ui/GroupCard';

import { motion } from 'framer-motion';

import { useGroupStore } from '../store/groupStore';
import { useDashboardStore } from '../store/dashboardStore';
import { formatCurrency } from '../services/currencyService'

const Dashboard = () => {
  const navigate = useNavigate();
  const [graphView, setGraphView] = useState('monthly'); // 'monthly' | 'groups'

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

  const formatCompact = (amount, currencyCode = 'USD') => {
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
    const currency = summary?.currency || groups?.[0]?.currency || 'USD';
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
    const currency = summary?.currency || groups?.[0]?.currency || 'USD';
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

  return (
    <>
      {/* HEADER */}
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-on-surface">
            Overview
          </h1>

          <p className="text-on-surface-variant">
            Your financial breakdown for
            this month.
          </p>
        </div>
      </header>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* NET BALANCE */}
        <GlassPanel className="p-6 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-container/20 rounded-full blur-3xl group-hover:bg-primary-container/30 transition-all duration-500"></div>

          <div className="flex justify-between items-center mb-4">
            <span className="font-label-caps text-[12px] text-on-surface-variant">
              NET BALANCE
            </span>

            <Wallet
              className="text-primary"
              size={24}
            />
          </div>

          {renderCurrencyTotals('totalSpending')}

          <div className="text-neon-lime flex items-center gap-1">
            <TrendingUp size={16} />

            <span>
              {summary?.totalGroups || 0}{' '}
              active groups
            </span>
          </div>
        </GlassPanel>

        {/* YOU OWE */}
        <GlassPanel className="p-6 border-l-4 border-l-error">
          <div className="flex justify-between items-center mb-4">
            <span className="font-label-caps text-[12px] text-on-surface-variant">
              YOU OWE
            </span>

            <ArrowUpRight
              className="text-error"
              size={24}
            />
          </div>

          {renderCurrencyTotals('youOwe')}

          <p className="text-on-surface-variant text-sm">
            Across{' '}
            {summary?.activeGroups || 0}{' '}
            groups
          </p>
        </GlassPanel>

        {/* YOU ARE OWED */}
        <GlassPanel className="p-6 border-l-4 border-l-neon-lime">
          <div className="flex justify-between items-center mb-4">
            <span className="font-label-caps text-[12px] text-on-surface-variant">
              YOU ARE OWED
            </span>

            <ArrowDownRight
              className="text-neon-lime"
              size={24}
            />
          </div>

          {renderCurrencyTotals('youAreOwed')}

          <p className="text-on-surface-variant text-sm">
            {summary?.youOwe || 0} pending settlements
          </p>
        </GlassPanel>
      </div>

      {/* GRAPH + ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* GRAPH */}
        <GlassPanel className="lg:col-span-2 p-6 h-80 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-medium">
                {graphView === 'monthly' ? 'Monthly Spending' : 'Spending by Group'}
              </h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">
                {graphView === 'monthly' ? new Date().getFullYear() : `${groups?.length || 0} groups`}
              </p>
            </div>
            <div className="flex items-center bg-surface-container-high rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setGraphView('monthly')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                  graphView === 'monthly'
                    ? 'bg-primary-container text-white'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setGraphView('groups')}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                  graphView === 'groups'
                    ? 'bg-primary-container text-white'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                By Group
              </button>
            </div>
          </div>

          {/* GRAPH AREA */}
          <div className="flex-1 flex gap-2 mt-2 h-full">
            {/* Y-AXIS */}
            <div className="flex flex-col justify-between py-6 text-[10px] text-on-surface-variant font-medium items-end w-12 border-r border-glass-stroke pr-2 pb-8">
              <span>{chartData.yLabels[0]}</span>
              <span>{chartData.yLabels[1]}</span>
              <span>{chartData.yLabels[2]}</span>
            </div>

            {/* BARS + X-AXIS */}
            <div className="flex-1 flex flex-col">
              {/* BARS */}
              <div className="flex-1 flex items-end gap-2 px-1 pb-2">
                {chartData.bars.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col justify-end items-center h-full group relative">
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: `${item.height}%`, opacity: 1 }}
                      transition={{ duration: 0.45, delay: index * 0.05 }}
                      className="w-full rounded-t-xl bg-gradient-to-t from-[#5e5ce6]/30 to-[#5e5ce6]/70 hover:from-[#5e5ce6]/50 hover:to-[#7c7aff] transition-all relative"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-highest px-2 py-1 rounded text-xs whitespace-nowrap z-10 pointer-events-none text-white">
                        {item.label}
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>

              {/* X-AXIS LABELS */}
              <div className="flex gap-2 px-1 pt-2 border-t border-glass-stroke">
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
          <h3 className="font-medium mb-4">
            Recent Activity
          </h3>

          <div className="flex-1 flex flex-col min-h-0">
            {!summary?.recentActivities || summary.recentActivities.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-3">
                  <Utensils size={20} />
                </div>
                <p className="text-sm font-medium text-on-surface mb-1">No activity yet</p>
                <p className="text-xs text-on-surface-variant">Expenses will show up here</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto hide-scrollbar pr-1">
                {summary.recentActivities.slice(0, 5).map((activity, index) => (
                  <div
                    key={activity.expenseId || index}
                    className="flex items-center justify-between cursor-pointer hover:bg-white/[0.03] rounded-lg px-1 py-1 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                        EX
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        <p className="text-xs text-on-surface-variant truncate">
                          {activity.groupName} · {new Date(activity.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-error ml-2 flex-shrink-0">
                      {formatCurrency(activity.amount, activity.currency)}
                    </span>
                  </div>
                ))}
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
            {groups.slice(0, 6).map((group) => (
              <GroupCard key={group.id || group.groupId} group={group} />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() =>
          navigate('/add-expense')
        }
        className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-br from-primary-container to-inverse-primary rounded-full flex items-center justify-center shadow-lg neon-glow z-50"
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