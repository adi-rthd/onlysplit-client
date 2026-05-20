import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  TrendingUp,
  Wallet,
  PieChart,
  Layers3,
  Loader2,
} from 'lucide-react';

import {
  motion,
} from 'framer-motion';

import {
  GlassPanel,
} from '../components/ui/GlassCard';

import analyticsService from '../services/analyticsService';

const AnalyticsPage = () => {
  const [loading, setLoading] =
    useState(true);

  const [viewMode, setViewMode] =
    useState('personal');

  const [spendingTrends,
    setSpendingTrends] =
    useState([]);

  const [categories,
    setCategories] =
    useState([]);

  const [groups,
    setGroups] =
    useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics =
    async () => {
      try {
        setLoading(true);

        const [
          trends,
          categoryData,
          groupData,
        ] = await Promise.all([
          analyticsService.getSpendingTrends(),
          analyticsService.getCategoryBreakdown(),
          analyticsService.getGroupBreakdown(),
        ]);

        setSpendingTrends(
          trends?.data ||
          trends ||
          []
        );

        setCategories(
          categoryData?.data ||
          categoryData ||
          []
        );

        setGroups(
          groupData?.data ||
          groupData ||
          []
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  const totalSpent =
    useMemo(() => {
      return categories.reduce(
        (sum, item) =>
          sum +
          (item.amount || 0),
        0
      );
    }, [categories]);

  const topCategory =
    useMemo(() => {
      if (
        categories.length === 0
      ) {
        return null;
      }

      return [
        ...categories,
      ].sort(
        (a, b) =>
          (b.amount || 0) -
          (a.amount || 0)
      )[0];
    }, [categories]);

  const highestTrend =
    useMemo(() => {
      if (
        spendingTrends.length ===
        0
      ) {
        return 0;
      }

      return Math.max(
        ...spendingTrends.map(
          (x) =>
            x.amount || 0
        )
      );
    }, [spendingTrends]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-on-surface">
            Spending Insights
          </h1>

          <p className="mt-2 text-sm md:text-base text-on-surface-variant">
            Multi-layered financial analysis across your expenses.
          </p>
        </div>

        {/* <div className="flex items-center rounded-2xl bg-surface-container-low p-1.5">
          <button
            onClick={() =>
              setViewMode(
                'personal'
              )
            }
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${viewMode ===
                'personal'
                ? 'bg-surface-container-high text-white'
                : 'text-on-surface-variant hover:text-white'
              }`}
          >
            Personal
          </button>

          <button
            onClick={() =>
              setViewMode(
                'groups'
              )
            }
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${viewMode ===
                'groups'
                ? 'bg-surface-container-high text-white'
                : 'text-on-surface-variant hover:text-white'
              }`}
          >
            Group Totals
          </button>
        </div> */}
      </div>

      {/* TOP GRID */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* LEFT */}
        <div className="flex flex-col gap-5 lg:col-span-4">
          {/* TOTAL */}
          <GlassPanel className="relative overflow-hidden rounded-3xl p-5 md:p-6">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Wallet size={22} />
              </div>

              <span className="font-label-caps text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">
                THIS MONTH
              </span>
            </div>

            <div className="text-3xl md:text-4xl font-bold">
              ₹
              {totalSpent.toLocaleString()}
            </div>

            {spendingTrends.length >= 2 && (() => {
              const current =
                spendingTrends[
                  spendingTrends.length - 1
                ]?.amount || 0;

              const previous =
                spendingTrends[
                  spendingTrends.length - 2
                ]?.amount || 0;

              const change =
                previous === 0
                  ? 0
                  : (
                    ((current - previous) /
                      previous) *
                    100
                  ).toFixed(1);

              const isPositive =
                change >= 0;

              return (
                <div
                  className={`mt-3 flex items-center gap-2 text-sm font-medium ${isPositive
                      ? 'text-green-400'
                      : 'text-red-400'
                    }`}
                >
                  <TrendingUp
                    size={16}
                    className={
                      !isPositive
                        ? 'rotate-180'
                        : ''
                    }
                  />

                  {isPositive ? '+' : ''}
                  {change}%

                  <span className="text-on-surface-variant">
                    vs last month
                  </span>
                </div>
              );
            })()}
          </GlassPanel>

          {/* TOP CATEGORY */}
          <GlassPanel className="rounded-3xl p-5 md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary-container/10 text-secondary-container">
                <PieChart
                  size={22}
                />
              </div>

              <span className="font-label-caps text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">
                TOP CATEGORY
              </span>
            </div>

            <div className="text-2xl font-bold">
              {topCategory
                ?.category ||
                'No Data'}
            </div>

            <div className="mt-2 text-lg font-data-mono text-secondary">
              ₹
              {topCategory?.amount?.toLocaleString?.() ||
                0}
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-container-high">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: '75%',
                }}
                transition={{
                  duration: 1,
                }}
                className="h-2 rounded-full bg-gradient-to-r from-primary-container to-secondary-container"
              />
            </div>
          </GlassPanel>
        </div>
{/* CHART */}
<GlassPanel className="rounded-3xl p-5 md:p-6 lg:col-span-8">
  <div className="mb-8 flex items-center justify-between">
    <div>
      <h2 className="text-xl md:text-2xl font-bold">
        Monthly Spending
      </h2>

      <p className="mt-1 text-sm text-on-surface-variant">
        Monthly expense trends across your groups
      </p>
    </div>

    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      <Layers3
        size={22}
      />
    </div>
  </div>

  {spendingTrends.length ===
  0 ? (
    <div className="flex h-[260px] items-center justify-center text-on-surface-variant">
      No analytics data available.
    </div>
  ) : (
    <div className="flex h-[260px] items-end gap-3 overflow-x-auto pb-2 md:gap-5">
      {spendingTrends.map(
        (
          item,
          index
        ) => {
          const max =
            Math.max(
              ...spendingTrends.map(
                x =>
                  x.amount ||
                  0
              )
            );

          const height =
            max === 0
              ? 0
              : (
                  (item.amount ||
                    0) /
                  max
                ) *
                100;

          return (
            <div
              key={index}
              className="flex min-w-[72px] flex-1 flex-col items-center gap-3"
            >
              {/* BAR */}
              <motion.div
                initial={{
                  height: 0,
                }}
                animate={{
                  height: `${height}%`,
                }}
                transition={{
                  duration: 0.7,
                  delay:
                    index *
                    0.08,
                }}
                className="relative w-full rounded-t-2xl bg-gradient-to-t from-primary-container/20 to-secondary-container/70 shadow-[0_0_25px_rgba(91,77,255,0.18)]"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-white/20" />
              </motion.div>

              {/* LABELS */}
              <div className="flex flex-col items-center">
                <span className="text-[11px] md:text-xs font-medium text-on-surface-variant text-center">
                  {item.month}
                </span>

                <span className="mt-1 text-[11px] md:text-xs font-data-mono text-white">
                  ₹
                  {Number(
                    item.amount || 0
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          );
        }
      )}
    </div>
  )}
</GlassPanel>
      </div>

      {/* GROUP BREAKDOWN */}
      <GlassPanel className="rounded-3xl p-5 md:p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold">
              Group Breakdown
            </h2>

            <p className="mt-1 text-sm text-on-surface-variant">
              Spending across all your groups
            </p>
          </div>

          <div className="text-sm text-on-surface-variant">
            {groups.length}{' '}
            groups
          </div>
        </div>

        {groups.length === 0 ? (
          <div className="py-16 text-center text-on-surface-variant">
            No group analytics found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groups.map(
              (
                group,
                index
              ) => (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index *
                      0.05,
                  }}
                  className="rounded-2xl bg-surface-container-low p-5"
                >
                  <div className="mb-4 flex items-start justify-between">
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold">
                        {group.groupName}
                      </h3>

                      <p className="mt-1 text-sm text-on-surface-variant">
                        {
                          group.memberCount
                        }{' '}
                        members
                      </p>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-container to-secondary-container text-white font-bold">
                      {group.groupName?.[0]}
                    </div>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-on-surface-variant">
                        Total
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        ₹
                        {group.amount?.toLocaleString?.() ||
                          0}
                      </p>
                    </div>

                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      Active
                    </span>
                  </div>
                </motion.div>
              )
            )}
          </div>
        )}
      </GlassPanel>
    </div>
  );
};

export default AnalyticsPage;