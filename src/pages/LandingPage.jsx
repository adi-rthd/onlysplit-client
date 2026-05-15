import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GlassCard } from '../components/ui/GlassCard';
import { GradientButton } from '../components/ui/GradientButton';
import { Zap, BarChart3, ShieldCheck, ArrowRight, PlayCircle } from 'lucide-react';
import { ROUTES } from '../constants/routes';

const LandingPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-surface-charcoal min-h-screen">
      <header className="flex justify-between items-center w-full px-container-padding-desktop h-16 sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-glass-stroke shadow-md">
        <div className="font-display-lg text-headline-lg font-bold text-primary">OnlySplit</div>
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-4">
            <a className="text-on-surface-variant font-medium hover:bg-white/5 px-3 py-2 rounded-lg" href="#features">Features</a>
            <a className="text-on-surface-variant font-medium hover:bg-white/5 px-3 py-2 rounded-lg" href="#how">How it Works</a>
          </nav>
          <div className="flex items-center gap-4 border-l border-glass-stroke pl-4">
            <button onClick={() => navigate(ROUTES.LOGIN)} className="text-on-surface-variant hover:text-on-surface">Log in</button>
            <GradientButton onClick={() => navigate(ROUTES.SIGNUP)} className="px-5 py-2 btn-inner-glow">
              Get Started
            </GradientButton>
          </div>
        </div>
      </header>
      
      <main>
        <section className="relative pt-24 pb-32 px-4 flex flex-col items-center text-center overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary-container/20 rounded-full blur-[120px] -z-10"></div>
          <div className="max-w-4xl mx-auto space-y-8 z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container border border-glass-stroke"
            >
              <span className="w-2 h-2 rounded-full bg-neon-lime animate-pulse"></span>
              <span className="font-label-caps text-[12px] text-on-surface-variant">V2.0 is live</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display-lg text-[40px] md:text-[64px] font-bold text-on-surface tracking-tight"
            >
              Split with <span className="text-gradient">Vision</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-on-surface-variant text-lg max-w-2xl mx-auto"
            >
              The ultra-modern expense splitting engine. Instant settlements, deep analytics, and absolute clarity for your shared financial life.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <GradientButton onClick={() => navigate(ROUTES.SIGNUP)} className="w-full sm:w-auto px-8 py-3.5 shadow-lg shadow-glow-purple">
                Start Splitting <ArrowRight size={20} />
              </GradientButton>
              <button className="w-full sm:w-auto glass-card px-8 py-3.5 rounded-xl font-medium text-on-surface flex items-center justify-center gap-2 transition-colors hover:bg-white/5">
                <PlayCircle size={20} /> View Demo
              </button>
            </motion.div>
          </div>
        </section>
        
        <div id="features" className="py-20 max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <GlassCard className="p-8 h-64 flex flex-col justify-between group">
            <Zap className="text-primary" size={40} />
            <div>
              <h3 className="text-xl font-bold mb-2">Instant Settlements</h3>
              <p className="text-on-surface-variant text-sm">Settle debts in real-time across supported networks instantly.</p>
            </div>
          </GlassCard>
          <GlassCard className="p-8 h-64 flex flex-col justify-between">
            <BarChart3 className="text-secondary" size={40} />
            <div>
              <h3 className="text-xl font-bold mb-2">Deep Analytics</h3>
              <p className="text-on-surface-variant text-sm">Visualize spending patterns with multi-layered dimensional charts.</p>
            </div>
          </GlassCard>
          <GlassCard className="p-8 h-64 flex flex-col justify-between">
            <ShieldCheck className="text-neon-lime" size={40} />
            <div>
              <h3 className="text-xl font-bold mb-2">Bank-Grade Security</h3>
              <p className="text-on-surface-variant text-sm">Your data is encrypted using AES-256 standards at all times.</p>
            </div>
          </GlassCard>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
