import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, ArrowLeft, Eye, EyeOff, AlertTriangle } from 'lucide-react';

import authService from '../../services/authService';
import { ROUTES } from '../../constants/routes';
import { Spinner } from '../../components/ui/PageLoader';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationError, setValidationError] = useState('');

  const validate = () => {
    if (newPassword.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setIsLoading(true);

    const result = await authService.resetPassword(token, newPassword);

    setIsLoading(false);

    if (result.success) {
      navigate(ROUTES.LOGIN, { replace: true });
    } else {
      setError(result.message);
    }
  };

  // No token in URL
  if (!token) {
    return (
      <div className="min-h-screen bg-surface-charcoal flex items-center justify-center px-5 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(91,77,255,0.16)_0%,transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(79,140,255,0.08)_0%,transparent_70%)] pointer-events-none" />

        <div className="w-full max-w-[420px] relative z-10">
          <div className="auth-card backdrop-blur-2xl rounded-3xl p-7 text-center">
            <AlertTriangle size={48} className="text-yellow-400 mx-auto mb-4" />
            <h2 className="text-on-surface text-lg font-semibold mb-2">
              Invalid Reset Link
            </h2>
            <p className="text-on-surface-variant text-[14px] mb-6">
              This link is missing a valid token. Please request a new password reset.
            </p>
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="w-full h-[58px] rounded-2xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-95 transition-all auth-cta"
            >
              Request New Link
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            Set new password
          </h1>
          <p className="text-on-surface-variant text-[15px] mt-2 text-center">
            Choose a strong password for your account
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
          {/* Error message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-300 text-[13px]">{error}</p>
                <Link
                  to={ROUTES.FORGOT_PASSWORD}
                  className="text-primary text-[13px] font-medium mt-1 inline-block hover:text-on-surface transition-colors"
                >
                  Request a new link →
                </Link>
              </div>
            </div>
          )}

          {/* Validation error */}
          {validationError && (
            <div className="mb-5 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-yellow-300 text-[13px]">{validationError}</p>
            </div>
          )}

          {/* New Password */}
          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.18em] mb-2">
              New Password
            </label>
            <div className="group auth-input flex items-center h-[58px] px-4 transition-all duration-200">
              <Lock size={18} className="text-on-surface-variant mr-3 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setValidationError('');
                }}
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none text-on-surface placeholder:text-on-surface-variant/50 text-[15px]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-3 text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.18em] mb-2">
              Confirm Password
            </label>
            <div className="group auth-input flex items-center h-[58px] px-4 transition-all duration-200">
              <Lock size={18} className="text-on-surface-variant mr-3 shrink-0" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setValidationError('');
                }}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                className="flex-1 bg-transparent border-none outline-none ring-0 focus:ring-0 focus:outline-none text-on-surface placeholder:text-on-surface-variant/50 text-[15px]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="ml-3 text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
                Reset Password
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </motion.form>

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

export default ResetPasswordPage;
