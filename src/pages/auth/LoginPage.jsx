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

  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-surface-charcoal flex items-center justify-center px-5 relative overflow-hidden">

      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(91,77,255,0.16)_0%,transparent_70%)] pointer-events-none" />

      <div className="absolute bottom-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(79,140,255,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Back Button */}
      <button
        onClick={() => navigate(ROUTES.LANDING)}
        className="absolute top-6 left-6 flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-sm z-20"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      <div className="w-full max-w-[420px] relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className=" relative w-12 h-12 flex items-center justify-center rounded-2xl overflow-hidden" >
            <img
              src="/logo.png"
              alt="OnlySplit"
              className="w-full h-full object-contain drop-shadow-[0_8px_25px_rgba(94,92,230,0.35)]"
            />
          </div>
          {/* <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="relative mb-5"
          >
            <div className="absolute inset-0 w-14 h-14 rounded-full bg-primary-container/40 blur-2xl scale-150" />

            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center text-white font-bold text-xl">
              OS
            </div>
          </motion.div> */}

          <h1 className="text-[34px] font-bold text-on-surface tracking-tight">
            Welcome back
          </h1>

          <p className="text-on-surface-variant text-[15px] mt-2">
            Sign in to your OnlySplit account
          </p>
        </div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="auth-card backdrop-blur-2xl rounded-3xl p-7"
        >
          {/* Email */}
          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.18em] mb-2">
              Email
            </label>

            <div className="group auth-input flex items-center h-[58px] px-4 transition-all duration-200">
              <Mail
                size={18}
                className="text-on-surface-variant mr-3"
              />

              <input
                type="email"
                required
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="you@example.com"
                className="w-full bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none text-on-surface placeholder:text-on-surface-variant/50 text-[15px]"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.18em] mb-2">
              Password
            </label>

            <div className="group auth-input flex items-center h-[58px] px-4 transition-all duration-200 overflow-hidden">
              {/* Lock Icon */}
              <Lock
                size={18}
                className="text-on-surface-variant mr-3 shrink-0"
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
                className="flex-1 min-w-0 bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none text-on-surface placeholder:text-on-surface-variant/50 text-[15px]"
              />

              {/* Toggle Button */}
              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="ml-2 text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="mt-2 text-right">
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-primary text-[13px] hover:text-on-surface transition-colors font-medium"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full h-[58px] rounded-2xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-95 transition-all auth-cta"
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
        <p className="text-center text-on-surface-variant text-[14px] mt-7">
          Don't have an account?{' '}
          <Link
            to={ROUTES.SIGNUP}
            className="text-primary hover:text-on-surface transition-colors font-medium"
          >
            Create one
          </Link>
        </p>
      </div>
    </div >
  );
};

export default LoginPage;