import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const { login, loginAsCustomer, loginAsAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/account';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);
    if (success) {
      navigate(redirect);
    }
  };

  const handleDemoCustomer = async () => {
    setSubmitting(true);
    const success = await loginAsCustomer();
    setSubmitting(false);
    if (success) {
      navigate(redirect);
    }
  };

  const handleDemoAdmin = async () => {
    setSubmitting(true);
    const success = await loginAsAdmin();
    setSubmitting(false);
    if (success) {
      navigate('/admin');
    }
  };

  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-serif text-xl font-bold shadow-lg">
              K
            </div>
            <span className="font-serif text-2xl font-bold tracking-tight text-white">
              Kavah & Co.
            </span>
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-espresso-400 mt-1">
            Sign in to manage your orders, saved addresses, and subscriptions.
          </p>
        </div>

        {/* Demo Fast Login Buttons (Essential for review/testing) */}
        <div className="bg-espresso-900/60 border border-amber-600/30 p-4 rounded-2xl mb-6 shadow-lg">
          <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold block mb-2 text-center">
            Instant Demo Sign In (1-Click)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoCustomer}
              disabled={submitting}
              className="py-2.5 px-3 bg-espresso-800 hover:bg-espresso-750 text-amber-200 border border-espresso-700 rounded-xl text-xs font-semibold transition-all hover:border-amber-500/50"
            >
              Customer Demo
              <span className="block text-[10px] text-espresso-400 font-normal">Marcus Romero</span>
            </button>
            <button
              type="button"
              onClick={handleDemoAdmin}
              disabled={submitting}
              className="py-2.5 px-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold transition-all"
            >
              Admin Demo
              <span className="block text-[10px] text-amber-400 font-normal">Roastery Staff</span>
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-espresso-900/40 border border-espresso-800 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@example.com"
                className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-4 py-3 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-espresso-300 font-semibold">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-amber-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-4 py-3 pr-10 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-espresso-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-900/30 transition-all"
            >
              {submitting ? 'Authenticating...' : 'Sign In To Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-espresso-800 text-center">
            <p className="text-xs text-espresso-400">
              New to Kavah & Co.?{' '}
              <Link to="/register" className="text-amber-400 hover:underline font-semibold">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
