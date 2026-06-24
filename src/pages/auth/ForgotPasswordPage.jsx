import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

import authService from '../../services/authService';
import { ROUTES } from '../../constants/routes';
import { Spinner } from '../../components/ui/PageLoader';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    await authService.forgotPassword(email);

    setIsLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-surface-charcoal flex items-center justify-center px-5 relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(91,77,255,0.16)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(79,140,255,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Back Button */}
      <button
        onClick={() => navigate(ROUTES.LOGIN)}
        className="absolute top-6 left-6 flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors text-sm z-20"
      >
        <ArrowLeft size={16} />
        <span>Back to Login</span>
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
            <div className="absolute inset-0 w-14 h-14 rounded-full bg-primary-container/40 blur-2xl scale-150" />
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center text-white font-bold text-xl">
              OS
            </div>
          </motion.div>

          <h1 className="text-[34px] font-bold text-on-surface tracking-tight">
            Forgot password?
          </h1>
          <p className="text-on-surface-variant text-[15px] mt-2 text-center">
            No worries, we'll send you a reset link
          </p>
        </div>

        {/* Form / Success */}
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="auth-card backdrop-blur-2xl rounded-3xl p-7 text-center"
          >
            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-on-surface text-lg font-semibold mb-2">
              Check your email
            </h2>
            <p className="text-on-surface-variant text-[14px] mb-6">
              If an account exists for <span className="text-on-surface font-medium">{email}</span>, we've sent a reset link. Check your inbox and spam folder.
            </p>
            <Link
              to={ROUTES.LOGIN}
              className="w-full h-[58px] rounded-2xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-95 transition-all auth-cta"
            >
              Back to Sign In
              <ArrowRight size={18} />
            </Link>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="auth-card backdrop-blur-2xl rounded-3xl p-7"
          >
            {/* Email */}
            <div className="mb-6">
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.18em] mb-2">
                Email
              </label>
              <div className="group auth-input flex items-center h-[58px] px-4 transition-all duration-200">
                <Mail size={18} className="text-on-surface-variant mr-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none text-on-surface placeholder:text-on-surface-variant/50 text-[15px]"
                />
              </div>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-[58px] rounded-2xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-95 transition-all auth-cta"
            >
              {isLoading ? (
                <Spinner size={20} />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </motion.form>
        )}

        {/* Footer */}
        <p className="text-center text-on-surface-variant text-[14px] mt-7">
          Remember your password?{' '}
          <Link
            to={ROUTES.LOGIN}
            className="text-primary hover:text-on-surface transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
