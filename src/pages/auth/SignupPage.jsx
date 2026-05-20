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
          <div className="relative mb-5">
            <div className="absolute inset-0 w-14 h-14 rounded-full bg-[#5e5ce6]/40 blur-2xl scale-150" />

            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#5e5ce6] to-[#4a6cf7] flex items-center justify-center text-white font-bold text-xl">
              OS
            </div>
          </div>

          <h1 className="text-[34px] font-bold text-white tracking-tight">
            Create your account
          </h1>

          <p className="text-white/55 text-[15px] mt-2">
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
          className="bg-white/[0.02] border border-white/[0.05] backdrop-blur-2xl rounded-[30px] p-7 shadow-[0_0_50px_rgba(0,0,0,0.45)]"
        >
          {/* Names */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-[0.18em] mb-2">
                First Name
              </label>

              <div className="flex items-center h-[58px] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] bg-white/[0.03] px-4 focus-within:border-[#5e5ce6]/50">
                <User
                  size={18}
                  className="text-white/35 mr-3"
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
                  className="w-full bg-transparent border-none outline-none ring-0 text-white placeholder:text-white/25"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-[0.18em] mb-2">
                Last Name
              </label>

              <div className="flex items-center h-[58px] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] bg-white/[0.03] px-4 focus-within:border-[#5e5ce6]/50">
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
                  className="w-full bg-transparent border-none outline-none ring-0 text-white placeholder:text-white/25"
                />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-[0.18em] mb-2">
              Email
            </label>

            <div className="flex items-center h-[58px] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] bg-white/[0.03] px-4 focus-within:border-[#5e5ce6]/50">
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
                className="w-full bg-transparent border-none outline-none ring-0 text-white placeholder:text-white/25"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-[11px] font-semibold text-white/45 uppercase tracking-[0.18em] mb-2">
              Password
            </label>

            <div className="flex items-center h-[58px] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.25)] bg-white/[0.03] px-4 focus-within:border-[#5e5ce6]/50">
              <Lock
                size={18}
                className="text-white/35 mr-3"
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
                className="w-full bg-transparent border-none outline-none ring-0 text-white placeholder:text-white/25"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="text-white/35 hover:text-white/70 transition-colors"
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
                Create Account
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </motion.form>

        {/* Footer */}
        <p className="text-center text-white/40 text-[14px] mt-7">
          Already have an account?{' '}
          <Link
            to={ROUTES.LOGIN}
            className="text-[#7c7cff] hover:text-white transition-colors font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;