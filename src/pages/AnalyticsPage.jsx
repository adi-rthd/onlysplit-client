import React, { useEffect, useMemo, useState } from 'react';
import { TrendingUp, Wallet, PieChart, Users, Loader2, TrendingDown, Award, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassPanel } from '../components/ui/GlassCard';
import analyticsService from '../services/analyticsService';
import PageHeader from '../components/layout/PageHeader';
import { pageConfig } from '../constants/pageConfig';

const COLORS = ['#7c6cff', '#4f8cff', '#e4f222', '#ff6b6b', '#34d399', '#f59e0b', '#ec4899', '#8b5cf6'];

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [spendingTrends, setSpendingTrends] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groups, setGroups] = useState([]);

  useEffect(() => { loadAnalytics(); }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [trends, catData, grpData] = await Promise.all([
        analyticsService.getSpendingTrends(),
        analyticsService.getCategoryBreakdown(),
        analyticsService.getGroupBreakdown(),
      ]);
      setSpendingTrends(trends?.data || trends || []);
      setCategories(catData?.data || catData || []);
      setGroups(grpData?.data || grpData || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const totalSpent = useMemo(() => categories.reduce((s, i) => s + (i.amount || 0), 0), [categories]);
  const totalMembers = useMemo(() => groups.reduce((s, g) => s + (g.memberCount || 0), 0), [groups]);
  const topGroup = useMemo(() => [...groups].sort((a, b) => (b.amount || 0) - (a.amount || 0))[0], [groups]);
  const topCategory = useMemo(() => [...categories].sort((a, b) => (b.amount || 0) - (a.amount || 0))[0], [categories]);

  // Month change
  const monthChange = useMemo(() => {
    if (spendingTrends.length < 2) return null;
    const cur = spendingTrends[spendingTrends.length - 1]?.amount || 0;
    const prev = spendingTrends[spendingTrends.length - 2]?.amount || 0;
    if (prev === 0) return null;
    return ((cur - prev) / prev * 100).toFixed(1);
  }, [spendingTrends]);

  if (loading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-primary" size={28} /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={pageConfig.analytics.title}
        description={pageConfig.analytics.description}
        guide={pageConfig.analytics.guide}
      />

      {/* INSIGHT CARDS — unique metrics not on dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <GlassPanel className="rounded-2xl p-4">
          <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Total Spent</span>
          <div className="mt-2 text-xl font-bold text-on-surface tabular-nums">₹{totalSpent.toLocaleString()}</div>
          <p className="text-[10px] text-on-surface-variant mt-1">Across {groups.length} groups</p>
        </GlassPanel>
        <GlassPanel className="rounded-2xl p-4">
          <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Top Spender Group</span>
          <div className="mt-2 text-xl font-bold text-primary truncate">{topGroup?.groupName || '--'}</div>
          <p className="text-[10px] text-on-surface-variant mt-1">₹{(topGroup?.amount || 0).toLocaleString()}</p>
        </GlassPanel>
        <GlassPanel className="rounded-2xl p-4">
          <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Top Category</span>
          <div className="mt-2 text-xl font-bold text-on-surface truncate">{topCategory?.category || '--'}</div>
          <p className="text-[10px] text-on-surface-variant mt-1">{totalSpent > 0 ? ((topCategory?.amount || 0) / totalSpent * 100).toFixed(0) : 0}% of total</p>
        </GlassPanel>
        <GlassPanel className="rounded-2xl p-4">
          <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Month Trend</span>
          <div className={`mt-2 text-xl font-bold flex items-center gap-1 ${monthChange === null ? 'text-on-surface-variant' : monthChange >= 0 ? 'text-error' : 'text-green-400'}`}>
            {monthChange === null ? '--' : <>{monthChange > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}{monthChange > 0 ? '+' : ''}{monthChange}%</>}
          </div>
          <p className="text-[10px] text-on-surface-variant mt-1">vs last month</p>
        </GlassPanel>
      </div>

      {/* MAIN ROW — Category Pie + Per-Person Efficiency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* CATEGORY PIE */}
        <GlassPanel className="rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-on-surface mb-4">Where You Spend</h2>
          {categories.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-sm text-on-surface-variant">No category data.</div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Donut */}
              <div className="relative w-40 h-40 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {(() => {
                    let offset = 0;
                    return categories.map((cat, i) => {
                      const pct = totalSpent > 0 ? ((cat.amount || 0) / totalSpent) * 100 : 0;
                      const dash = pct * 0.88;
                      const strokeOffset = -offset * 0.88;
                      offset += pct;
                      return (
                        <motion.circle key={i} initial={{ strokeDasharray: '0 88' }} animate={{ strokeDasharray: `${dash} ${88 - dash}` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          cx="18" cy="18" r="14" fill="none" stroke={COLORS[i % COLORS.length]}
                          strokeWidth="3.5" strokeDashoffset={strokeOffset} strokeLinecap="round" />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-base font-bold text-on-surface">{categories.length}</span>
                  <span className="text-[9px] text-on-surface-variant">categories</span>
                </div>
              </div>
              {/* Legend */}
              <div className="flex-1 space-y-2.5 w-full">
                {categories.slice(0, 6).map((cat, i) => {
                  const pct = totalSpent > 0 ? ((cat.amount || 0) / totalSpent * 100).toFixed(0) : 0;
                  return (
                    <div key={i} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-on-surface truncate">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-medium text-on-surface tabular-nums">₹{(cat.amount || 0).toLocaleString()}</span>
                        <span className="text-[10px] text-on-surface-variant w-7 text-right">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </GlassPanel>

        {/* GROUP ACTIVITY RANKING — who has most expenses */}
        <GlassPanel className="rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-on-surface">Most Active Groups</h2>
              <p className="text-[10px] text-on-surface-variant">Ranked by total group spending</p>
            </div>
            <Award size={16} className="text-on-surface-variant" />
          </div>
          {groups.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-sm text-on-surface-variant">No data.</div>
          ) : (
            <div className="space-y-3">
              {[...groups].sort((a, b) => (b.amount || 0) - (a.amount || 0)).map((group, i) => {
                const maxAmount = groups.reduce((max, g) => Math.max(max, g.amount || 0), 0);
                const pct = maxAmount > 0 ? ((group.amount || 0) / maxAmount) * 100 : 0;
                const share = totalSpent > 0 ? ((group.amount || 0) / totalSpent * 100).toFixed(0) : 0;
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`text-[10px] font-bold w-5 text-center ${i === 0 ? 'text-green-400' : 'text-on-surface-variant'}`}>#{i + 1}</span>
                        <span className="text-xs font-medium text-on-surface truncate">{group.groupName}</span>
                        <span className="text-[10px] text-on-surface-variant">({group.memberCount} members)</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-on-surface tabular-nums">₹{(group.amount || 0).toLocaleString()}</span>
                        <span className="text-[10px] text-on-surface-variant">{share}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                        className="h-full rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </GlassPanel>
      </div>

      {/* SPENDING DISTRIBUTION — how concentrated is spending */}
      <GlassPanel className="rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-on-surface">Spending Distribution</h2>
            <p className="text-[10px] text-on-surface-variant">How your spending is spread across groups</p>
          </div>
        </div>
        {groups.length === 0 ? (
          <div className="py-8 text-center text-sm text-on-surface-variant">No groups yet.</div>
        ) : (
          <div className="space-y-2">
            {/* Stacked full-width bar */}
            <div className="h-8 rounded-xl overflow-hidden flex">
              {groups.map((g, i) => {
                const pct = totalSpent > 0 ? ((g.amount || 0) / totalSpent) * 100 : 0;
                return (
                  <motion.div key={i} initial={{ width: 0 }} animate={{ width: `${Math.max(pct, 1)}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full flex items-center justify-center overflow-hidden border-r border-surface-charcoal/50 last:border-r-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  >
                    {pct > 12 && <span className="text-[9px] font-bold text-white/90 truncate px-1">{g.groupName}</span>}
                  </motion.div>
                );
              })}
            </div>
            {/* Labels below */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              {groups.map((g, i) => {
                const pct = totalSpent > 0 ? ((g.amount || 0) / totalSpent * 100).toFixed(0) : 0;
                return (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-[11px] text-on-surface-variant">{g.groupName} <span className="font-medium text-on-surface">{pct}%</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </GlassPanel>
    </div>
  );
};

export default AnalyticsPage;
