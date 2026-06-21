import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  Zap,
  BarChart3,
  ArrowRight,
  PlayCircle,
  Users,
  Wallet,
  Receipt,
  Menu,
  X,
  Smartphone,
} from 'lucide-react';

import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { ROUTES } from '../constants/routes';

import analyticsService from '../services/analyticsService';

const LandingPage = () => {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalExpenses: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlatformStats = async () => {
      try {
        setLoading(true);

        const data =
          await analyticsService.getLandingStats();

        if (data) {
          setStats({
            totalUsers:
              data.registeredUsers || 0,
            totalGroups:
              data.activeGroups || 0,
            totalExpenses:
              data.expensesProcessed || 0,
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadPlatformStats();
  }, []);

  return (
    <div className="min-h-screen bg-[#05060a] overflow-x-hidden overflow-y-auto text-white">

      <div className="absolute top-[-5%] left-[-5%] w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(94,92,230,0.10)_0%,transparent_90%)] blur-3xl pointer-events-none" />

      <div className="absolute bottom-[-10%] right-[-8%] w-[660px] h-[660px] rounded-full bg-[radial-gradient(circle,rgba(62,144,255,0.06)_0%,transparent_90%)] blur-3xl pointer-events-none" />
      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 w-full border-b border-white/[0.04] bg-black/30 backdrop-blur-2xl">

        <div className="max-w-7xl mx-auto h-20 px-4 lg:px-8 flex items-center justify-between">

          <div className="flex items-center gap-3">

            <div className="relative">

              <div className="absolute inset-0 bg-primary-container/30 blur-2xl rounded-full scale-125" />
              <div
                className=" relative w-12 h-12 flex items-center justify-center rounded-2xl overflow-hidden"
              >
                <img
                  src="/logo.png"
                  alt="OnlySplit"
                  className="w-full h-full object-contain drop-shadow-[0_8px_25px_rgba(94,92,230,0.35)]"
                />
              </div>
            </div>

            <div>
              <h1 className="text-[28px] font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                OnlySplit
              </h1>

              <p className="text-[11px] uppercase tracking-[0.25em] text-white/35 -mt-1 hidden sm:block">
                Expense Platform
              </p>
            </div>
          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-8">

            <nav className="flex items-center gap-2 border border-white/[0.05] bg-white/[0.02] backdrop-blur-xl rounded-2xl px-2 py-2">

              <a
                href="#features"
                className="px-5 py-2.5 rounded-xl text-white/55 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
              >
                Features
              </a>

              <a
                href="#stats"
                className="px-5 py-2.5 rounded-xl text-white/55 hover:text-white hover:bg-white/[0.05] transition-all duration-200"
              >
                Stats
              </a>
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  navigate(ROUTES.LOGIN)
                }
                className="text-white/60 hover:text-white transition-all duration-200"
              >
                Log in
              </button>

              <GradientButton
                onClick={() =>
                  navigate(ROUTES.SIGNUP)
                }
                className="px-6 py-3 rounded-2xl text-sm font-semibold"
              >
                Get Started
              </GradientButton>
            </div>
          </div>

          {/* MOBILE LOGIN + MENU */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => navigate(ROUTES.LOGIN)}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-sm font-medium hover:bg-white/[0.08] transition-all"
            >
              Log in
            </button>

            <button
              onClick={() =>
                setMobileMenuOpen(
                  !mobileMenuOpen
                )
              }
              className="w-11 h-11 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] bg-white/[0.03] flex items-center justify-center text-white"
            >
              {mobileMenuOpen ? (
                <X size={22} />
              ) : (
                <Menu size={22} />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.05] bg-black/70 backdrop-blur-2xl">

            <div className="px-4 py-5 space-y-3">

              <a
                href="#features"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="block px-4 py-3 rounded-2xl bg-white/[0.03] text-white/75"
              >
                Features
              </a>

              <a
                href="#stats"
                onClick={() =>
                  setMobileMenuOpen(false)
                }
                className="block px-4 py-3 rounded-2xl bg-white/[0.03] text-white/75"
              >
                Stats
              </a>

              <button
                onClick={() =>
                  navigate(ROUTES.LOGIN)
                }
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.03] text-white/75 text-left"
              >
                Log in
              </button>

              <GradientButton
                onClick={() =>
                  navigate(ROUTES.SIGNUP)
                }
                className="w-full justify-center py-3 rounded-2xl"
              >
                Get Started
              </GradientButton>
            </div>
          </div>
        )}
      </header>

      <main>


        {/* ================= HERO ================= */}

        <section className="relative pt-24 md:pt-12 pb-24 md:pb-12 px-4 overflow-hidden flex flex-col items-center text-center">

          <div className="absolute top-1/2 left-1/2 w-[1000px] h-[700px] -translate-x-1/2 -translate-y-1/2 bg-primary-container/20 rounded-full blur-[140px] -z-10 pointer-events-none" />

          <div className="max-w-5xl mx-auto relative z-10">

            <motion.div
              initial={{
                opacity: 0,
                y: 16,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />

              <span className="text-[11px] uppercase tracking-[0.25em] text-white/60">
                Real-time settlements
              </span>
            </motion.div>

            <motion.h1
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.1,
              }}
              className="text-[52px] sm:text-[68px] md:text-[92px] md:leading-[96px] leading-[1.02] font-black tracking-tight"
            >
              Split expenses
              <br />

              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                with precision
              </span>
            </motion.h1>

            <motion.p
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
              }}
              className="text-white/55 text-lg md:text-[21px] leading-[34px] max-w-3xl mx-auto mt-8"
            >
              Modern expense splitting with
              live balances, analytics,
              secure settlements, and
              powerful group management.
            </motion.p>

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3,
              }}
              className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-10"
            >
              <GradientButton
                onClick={() =>
                  navigate(ROUTES.SIGNUP)
                }
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-[15px] font-semibold shadow-[0_10px_40px_rgba(94,92,230,0.35)]"
              >
                Start Splitting
                <ArrowRight size={18} />
              </GradientButton>

              <button
                onClick={() =>
                  navigate(ROUTES.SIGNUP)
                }
                className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl text-white flex items-center justify-center gap-2 hover:bg-white/[0.05] transition-all"
              >
                <PlayCircle size={18} />
                View Demo
              </button>

              <button
                onClick={() => navigate(ROUTES.DOWNLOAD)}
                className="hidden sm:flex w-full sm:w-auto px-8 py-4 rounded-2xl border border-lime-400/20 bg-lime-400/5 backdrop-blur-xl text-lime-400 items-center justify-center gap-2 hover:bg-lime-400/10 transition-all font-medium cursor-pointer"
              >
                <Smartphone size={18} />
                Download for Android
              </button>
            </motion.div>
          </div>
        </section>
        {/* ================= STATS ================= */}

        <section
          id="stats"
          className="scroll-mt-32 max-w-7xl mx-auto px-4 pt-6 md:pt-10 pb-28"
        >

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* USERS */}
            <GlassCard className="relative overflow-hidden rounded-[32px] p-10 border border-white/[0.05] hover:-translate-y-1 transition-all duration-300 min-h-[280px] flex flex-col items-center justify-center text-center">

              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-52 h-52 bg-cyan-400/10 blur-3xl rounded-full" />

              <div className="relative z-10">

                <div className="w-20 h-20 rounded-3xl bg-cyan-400/10 flex items-center justify-center mx-auto mb-8">
                  <Users
                    className="text-cyan-400"
                    size={40}
                  />
                </div>

                <h3 className="text-[72px] leading-none font-black text-white tracking-tight">
                  {loading
                    ? '...'
                    : stats.totalUsers.toLocaleString()}
                </h3>

                <p className="text-white/45 text-xl mt-5">
                  Registered Users
                </p>
              </div>
            </GlassCard>

            {/* GROUPS */}
            <GlassCard className="relative overflow-hidden rounded-[32px] p-10 border border-white/[0.05] hover:-translate-y-1 transition-all duration-300 min-h-[280px] flex flex-col items-center justify-center text-center">

              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-52 h-52 bg-violet-400/10 blur-3xl rounded-full" />

              <div className="relative z-10">

                <div className="w-20 h-20 rounded-3xl bg-violet-400/10 flex items-center justify-center mx-auto mb-8">
                  <Wallet
                    className="text-violet-400"
                    size={40}
                  />
                </div>

                <h3 className="text-[72px] leading-none font-black text-white tracking-tight">
                  {loading
                    ? '...'
                    : stats.totalGroups.toLocaleString()}
                </h3>

                <p className="text-white/45 text-xl mt-5">
                  Active Groups
                </p>
              </div>
            </GlassCard>

            {/* EXPENSES */}
            <GlassCard className="relative overflow-hidden rounded-[32px] p-10 border border-white/[0.05] hover:-translate-y-1 transition-all duration-300 min-h-[280px] flex flex-col items-center justify-center text-center">

              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-52 h-52 bg-lime-400/10 blur-3xl rounded-full" />

              <div className="relative z-10">

                <div className="w-20 h-20 rounded-3xl bg-lime-400/10 flex items-center justify-center mx-auto mb-8">
                  <Receipt
                    className="text-lime-400"
                    size={40}
                  />
                </div>

                <h3 className="text-[72px] leading-none font-black text-white tracking-tight">
                  {loading
                    ? '...'
                    : stats.totalExpenses.toLocaleString()}
                </h3>

                <p className="text-white/45 text-xl mt-5">
                  Expenses Processed
                </p>
              </div>
            </GlassCard>

          </div>
        </section>
        {/* ================= PRODUCT GRID ================= */}

        <section
          id="features"
          className="scroll-mt-12 max-w-7xl mx-auto px-4 pb-28"
        >

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* SMART SPLIT ENGINE */}
            <GlassCard className="lg:col-span-2 rounded-[32px] p-8 md:p-10 relative overflow-hidden min-h-[320px] border border-white/[0.05] hover:-translate-y-1 transition-all duration-300">

              <div className="absolute top-0 right-0 w-80 h-80 bg-primary-container/10 rounded-full blur-3xl" />

              <div className="relative z-10 h-full flex flex-col justify-between">

                <div>
                  <Zap
                    className="text-primary mb-6"
                    size={34}
                  />

                  <h3 className="text-[38px] md:text-[48px] leading-[1.05] font-black text-white mb-5">
                    Smart split engine
                  </h3>

                  <p className="text-white/50 text-lg md:text-[22px] leading-[38px] max-w-2xl">
                    Split expenses exactly how your
                    group needs with intelligent
                    calculations and real-time balance
                    updates.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">

                  {[
                    ['Equal', 'Split evenly'],
                    ['Exact', 'Custom amounts'],
                    ['Percent', 'Percentage split'],
                    ['Custom', 'Flexible shares'],
                  ].map((item) => (
                    <div
                      key={item[0]}
                      className="rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] bg-white/[0.03] p-5"
                    >
                      <p className="text-white text-lg font-semibold">
                        {item[0]}
                      </p>

                      <p className="text-white/45 text-sm mt-1">
                        {item[1]}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* GROUP PREVIEW */}
            <GlassCard className="rounded-[32px] p-7 sm:p-8 border border-white/[0.05] min-h-[320px] hover:-translate-y-1 transition-all duration-300">

              <div className="flex flex-col h-full justify-between">

                {/* TOP SECTION */}
                <div>

                  <div className="flex items-start justify-between gap-3">

                    {/* LEFT CONTENT */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">

                      {/* ICON */}
                      <div className="w-14 h-14 rounded-full bg-white/[0.04] flex items-center justify-center shrink-0">
                        <Users
                          className="text-primary"
                          size={22}
                        />
                      </div>

                      {/* TEXT */}
                      <div className="flex-1 min-w-0">

                        <h4 className="text-[28px] sm:text-[32px] leading-tight font-bold text-white">
                          A Trip
                        </h4>

                        <p className="text-white/45 text-sm sm:text-[15px] mt-2 leading-normal">
                          4 members • 18 expenses
                        </p>
                      </div>
                    </div>

                    {/* BADGE */}
                    <div className="shrink-0 ml-2">
                      <div className="px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10">
                        <span className="text-[11px] uppercase tracking-[0.18em] text-primary font-semibold">
                          Demo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AMOUNT */}
                  <div className="mt-14">

                    <p className="text-white/45 text-lg">
                      Group expenses
                    </p>

                    <p className="text-[54px] sm:text-[64px] md:text-[72px] leading-none font-black text-primary mt-4 tracking-tight">
                      ₹12,445
                    </p>

                    <p className="text-white/35 text-sm mt-3 leading-relaxed">
                      Example group dashboard preview
                    </p>
                  </div>
                </div>

                {/* BOTTOM */}
                <div className="space-y-4 mt-12">

                  <div className="flex items-center justify-between text-lg">
                    <span className="text-white/55">
                      Pending balances
                    </span>

                    <span className="text-white font-semibold">
                      2
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-lg">
                    <span className="text-white/55">
                      Settled
                    </span>

                    <span className="text-lime-400 font-semibold">
                      12
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* INSIGHTS */}
            <GlassCard className="rounded-[32px] p-8 min-h-[280px] border border-white/[0.05] hover:-translate-y-1 transition-all duration-300">

              <BarChart3
                className="text-violet-400 mb-8"
                size={34}
              />

              <h3 className="text-4xl font-black text-white mb-8">
                Insights
              </h3>

              <div className="space-y-6">

                {[
                  [
                    'bg-violet-400',
                    'Monthly spending trends',
                    'Understand group expenses over time',
                  ],
                  [
                    'bg-cyan-400',
                    'Balance tracking',
                    'Real-time updates for every member',
                  ],
                  [
                    'bg-lime-400',
                    'Expense categories',
                    'Organized analytics and summaries',
                  ],
                ].map((item) => (
                  <div
                    key={item[1]}
                    className="flex items-start gap-4"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-3 ${item[0]}`}
                    />

                    <div>
                      <p className="text-white text-lg font-medium">
                        {item[1]}
                      </p>

                      <p className="text-white/45 text-sm mt-1">
                        {item[2]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* LIVE TRACKING */}
            <GlassCard className="lg:col-span-2 rounded-[32px] p-8 md:p-10 min-h-[280px] border border-white/[0.05] flex flex-col lg:flex-row items-start lg:items-center justify-between relative overflow-hidden hover:-translate-y-1 transition-all duration-300">

              <div className="absolute bottom-0 left-1/2 w-full h-32 bg-primary-container/5 rounded-full blur-3xl" />

              <div className="relative z-10 max-w-2xl">

                <Wallet
                  className="text-primary mb-6"
                  size={34}
                />

                <h3 className="text-[38px] md:text-[52px] leading-[1.05] font-black text-white mb-5">
                  Real-time balance tracking
                </h3>

                <p className="text-white/50 text-lg md:text-[22px] leading-[38px]">
                  Keep track of who paid, who owes,
                  and what’s settled with live balance
                  updates across every group.
                </p>
              </div>

              <div className="w-full lg:w-auto mt-10 lg:mt-0 flex flex-col gap-4 min-w-[240px]">

                {[
                  ['Rahul paid', '$120'],
                  ['Split between', '4 members'],
                  ['Pending settlements', '2'],
                ].map((item, index) => (
                  <div
                    key={item[0]}
                    className="rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] bg-white/[0.03] p-5"
                  >
                    <div className="flex justify-between">
                      <span className="text-white/55">
                        {item[0]}
                      </span>

                      <span
                        className={`font-semibold ${index === 2
                          ? 'text-primary'
                          : 'text-white'
                          }`}
                      >
                        {item[1]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </section>

        {/* ================= STATS ================= */}
        {/* 
        <section
          id="stats"
          className="scroll-mt-32 max-w-7xl mx-auto px-4 pb-28 grid grid-cols-1 md:grid-cols-3 gap-6"
        >

          <GlassCard className="p-10 rounded-[30px] text-center border border-white/[0.05] hover:-translate-y-1 transition-all duration-300">

            <Users
              className="mx-auto mb-5 text-cyan-400"
              size={42}
            />

            <h3 className="text-5xl font-black text-white mb-3">
              {loading
                ? '...'
                : stats.totalUsers.toLocaleString()}
            </h3>

            <p className="text-white/45 text-lg">
              Registered Users
            </p>
          </GlassCard>

          <GlassCard className="p-10 rounded-[30px] text-center border border-white/[0.05] hover:-translate-y-1 transition-all duration-300">

            <Wallet
              className="mx-auto mb-5 text-violet-400"
              size={42}
            />

            <h3 className="text-5xl font-black text-white mb-3">
              {loading
                ? '...'
                : stats.totalGroups.toLocaleString()}
            </h3>

            <p className="text-white/45 text-lg">
              Active Groups
            </p>
          </GlassCard>

          <GlassCard className="p-10 rounded-[30px] text-center border border-white/[0.05] hover:-translate-y-1 transition-all duration-300">

            <Receipt
              className="mx-auto mb-5 text-lime-400"
              size={42}
            />

            <h3 className="text-5xl font-black text-white mb-3">
              {loading
                ? '...'
                : stats.totalExpenses.toLocaleString()}
            </h3>

            <p className="text-white/45 text-lg">
              Expenses Processed
            </p>
          </GlassCard>
        </section> */}
      </main>
    </div>
  );
};

export default LandingPage;
