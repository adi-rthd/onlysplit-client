import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import authService from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants/routes';
import { Spinner } from '../../components/ui/PageLoader';

const SignupPage = () => {
  const navigate = useNavigate();
  const { isAuthenticating } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await authService.signup({ firstName, lastName, email, password });
    if (result) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#08090b] flex items-center justify-center px-5 relative overflow-hidden">
      {/* ── Ambient background layers ── */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(94,92,230,0.12)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(62,144,255,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(94,92,230,0.08),transparent)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-[400px] relative z-10"
      >
        {/* ── Logo + heading ── */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="relative mb-5"
          >
            <div className="absolute inset-0 w-12 h-12 rounded-full bg-primary-container/30 blur-xl scale-150" />
            <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary-container to-inverse-primary flex items-center justify-center text-white font-bold text-lg tracking-tight">
              OS
            </div>
          </motion.div>
          <h1 className="font-display-lg text-[26px] font-bold text-on-surface tracking-tight">
            Create your account
          </h1>
          <p className="text-on-surface-variant/70 text-sm mt-1.5">
            Start splitting expenses with OnlySplit
          </p>
        </div>

        {/* ── Form card ── */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="auth-card rounded-2xl p-7 space-y-4"
        >
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-on-surface-variant/60 uppercase tracking-wider pl-0.5">
                First Name
              </label>
              <div className="auth-input flex items-center px-4 py-3">
                <User className="text-on-surface-variant/40 mr-2.5 shrink-0" size={16} />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Elena"
                  className="bg-transparent w-full outline-none text-on-surface text-[15px] placeholder:text-on-surface-variant/30"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-medium text-on-surface-variant/60 uppercase tracking-wider pl-0.5">
                Last Name
              </label>
              <div className="auth-input flex items-center px-4 py-3">
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Rostova"
                  className="bg-transparent w-full outline-none text-on-surface text-[15px] placeholder:text-on-surface-variant/30"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-on-surface-variant/60 uppercase tracking-wider pl-0.5">
              Email
            </label>
            <div className="auth-input flex items-center px-4 py-3">
              <Mail className="text-on-surface-variant/40 mr-3 shrink-0" size={17} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-transparent w-full outline-none text-on-surface text-[15px] placeholder:text-on-surface-variant/30"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-[11px] font-medium text-on-surface-variant/60 uppercase tracking-wider pl-0.5">
              Password
            </label>
            <div className="auth-input flex items-center px-4 py-3">
              <Lock className="text-on-surface-variant/40 mr-3 shrink-0" size={17} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="bg-transparent w-full outline-none text-on-surface text-[15px] placeholder:text-on-surface-variant/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-on-surface-variant/40 hover:text-on-surface-variant ml-2 shrink-0 transition-colors"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-1.5">
            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-gradient-to-r from-primary-container to-[#4a6cf7] text-white rounded-xl py-3 text-[15px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50 auth-cta"
            >
              {isAuthenticating ? (
                <Spinner size={20} />
              ) : (
                <>Create Account <ArrowRight size={17} /></>
              )}
            </button>
          </div>
        </motion.form>

        {/* ── Footer link ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center text-on-surface-variant/50 text-[13px] mt-7"
        >
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-primary/90 font-medium hover:text-primary transition-colors">
            Sign in
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
