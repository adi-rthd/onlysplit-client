import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';

import authService from '../../services/authService';
import { useAuthStore } from '../../store/authStore';
import { ROUTES } from '../../constants/routes';
import { Spinner } from '../../components/ui/PageLoader';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticating } = useAuthStore();

  const from =
    location.state?.from?.pathname ||
    ROUTES.DASHBOARD;

  const [email, setEmail] = useState('');
  const [password, setPassword] =
    useState('');
  const [showPassword, setShowPassword] =
    useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await authService.login({
      email,
      password,
    });

    if (result) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-[#05060a] flex items-center justify-center px-5 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(94,92,230,0.16)_0%,transparent_70%)] pointer-events-none" />

      <div className="absolute bottom-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(62,144,255,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Back Button */}
      <button
        onClick={() => navigate(ROUTES.LANDING)}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors text-sm z-20"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative mb-5"
          >
            <div className="absolute inset-0 w-14 h-14 rounded-full bg-[#5e5ce6]/40 blur-2xl scale-150" />

            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#5e5ce6] to-[#4a6cf7] flex items-center justify-center text-white font-bold text-xl">
              OS
            </div>
          </motion.div>

          <h1 className="text-[34px] font-bold text-white tracking-tight">
            Welcome back
          </h1>

          <p className="text-white/55 text-[15px] mt-2">
            Sign in to your OnlySplit account
          </p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl rounded-[30px] p-7 shadow-[0_0_50px_rgba(0,0,0,0.45)]"
        >
          {/* Email */}
          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-[0.18em] mb-2">
              Email
            </label>

            <div className="group flex items-center h-[58px] rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 transition-all duration-200 focus-within:border-[#5e5ce6]/50 focus-within:bg-white/[0.04] focus-within:shadow-[0_0_0_4px_rgba(94,92,230,0.08)]">
              <Mail
                size={18}
                className="text-white/35 mr-3"
              />

              <input
                type="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                className="w-full bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none text-white placeholder:text-white/25 text-[15px]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-[0.18em] mb-2">
              Password
            </label>

            <div className="group flex items-center h-[58px] rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 transition-all duration-200 focus-within:border-[#5e5ce6]/50 focus-within:bg-white/[0.04] focus-within:shadow-[0_0_0_4px_rgba(94,92,230,0.08)]">
              {/* Lock Icon */}
              <Lock
                size={18}
                className="text-white/35 mr-3 shrink-0"
              />

              {/* Input */}
              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                required
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="••••••••"
                autoComplete="current-password"
                className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none text-white placeholder:text-white/25 text-[15px]"
              />

              {/* Toggle Button */}
              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="ml-3 text-white/35 hover:text-white/70 transition-colors shrink-0"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full h-[58px] rounded-2xl bg-gradient-to-r from-[#5e5ce6] to-[#4a6cf7] text-white font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-[0_10px_30px_rgba(94,92,230,0.35)]"
          >
            {isAuthenticating ? (
              <Spinner size={20} />
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </motion.form>

        {/* Footer */}
        <p className="text-center text-white/40 text-[14px] mt-7">
          Don't have an account?{' '}
          <Link
            to={ROUTES.SIGNUP}
            className="text-[#7c7cff] hover:text-white transition-colors font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;