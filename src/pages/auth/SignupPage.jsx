import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import {
  Mail,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
} from 'lucide-react';

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

    const result =
      await authService.signup({
        firstName,
        lastName,
        email,
        password,
      });

    if (result) {
      navigate(ROUTES.DASHBOARD, {
        replace: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-surface-charcoal flex items-center justify-center px-5 relative overflow-hidden">
      {/* Background */}
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
          <div className="relative mb-5">
            <div className="absolute inset-0 w-14 h-14 rounded-full bg-primary-container/40 blur-2xl scale-150" />

            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center text-white font-bold text-xl">
              OS
            </div>
          </div>

          <h1 className="text-[34px] font-bold text-on-surface tracking-tight">
            Create your account
          </h1>

          <p className="text-on-surface-variant text-[15px] mt-2">
            Start splitting expenses with
            OnlySplit
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
          {/* Names */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.18em] mb-2">
                First Name
              </label>

              <div className="auth-input flex items-center h-[58px] px-4">
                <User
                  size={18}
                  className="text-on-surface-variant mr-3"
                />

                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) =>
                    setFirstName(
                      e.target.value
                    )
                  }
                  placeholder="John"
                  className="w-full bg-transparent border-none outline-none ring-0 text-on-surface placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.18em] mb-2">
                Last Name
              </label>

              <div className="auth-input flex items-center h-[58px] px-4">
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) =>
                    setLastName(
                      e.target.value
                    )
                  }
                  placeholder="Doe"
                  className="w-full bg-transparent border-none outline-none ring-0 text-on-surface placeholder:text-on-surface-variant/50"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.18em] mb-2">
              Email
            </label>

            <div className="auth-input flex items-center h-[58px] px-4">
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
                className="w-full bg-transparent border-none outline-none ring-0 text-on-surface placeholder:text-on-surface-variant/50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-[0.18em] mb-2">
              Password
            </label>

            <div className="auth-input flex items-center h-[58px] px-4">
              <Lock
                size={18}
                className="text-on-surface-variant mr-3"
              />

              <input
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                required
                minLength={8}
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Minimum 8 characters"
                className="w-full bg-transparent border-none outline-none ring-0 text-on-surface placeholder:text-on-surface-variant/50"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="text-on-surface-variant hover:text-on-surface transition-colors"
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
            className="w-full h-[58px] rounded-2xl bg-gradient-to-r from-primary-container to-secondary-container text-white font-semibold text-[15px] flex items-center justify-center gap-2 hover:opacity-95 transition-all auth-cta"
          >
            {isAuthenticating ? (
              <Spinner size={20} />
            ) : (
              <>
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </motion.form>

        {/* Footer */}
        <p className="text-center text-on-surface-variant text-[14px] mt-7">
          Already have an account?{' '}
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

export default SignupPage;
