import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuthSession } = useAuth();
  const { showToast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const tokenFromUrl = searchParams.get('token') || '';

  const [token, setToken] = useState<string>(tokenFromUrl);
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [tokenFromUrl]);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isLengthValid = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token.trim()) {
      showToast('Password reset token is required.', 'error');
      return;
    }

    if (!isLengthValid) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    if (!passwordsMatch) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.resetPassword({
        token: token.trim(),
        password,
        confirmPassword
      });

      if (res.success && res.token && res.user) {
        setAuthSession(res.token, res.user);
        showToast('Password updated successfully! Welcome back to Kavah & Co.');
        navigate('/account');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password. Token may be invalid or expired.', 'error');
    } finally {
      setSubmitting(false);
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
            Set New Password
          </h1>
          <p className="text-xs sm:text-sm text-espresso-400 mt-1 max-w-sm mx-auto">
            Choose a secure new password for your roastery account.
          </p>
        </div>

        {/* Card */}
        <div className="bg-espresso-900/40 border border-espresso-800 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Token Input */}
            <div>
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">
                Security Reset Token *
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste your reset token here..."
                className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-4 py-2.5 text-xs text-white font-mono placeholder-espresso-600 focus:outline-none focus:border-amber-500"
              />
              {tokenFromUrl && (
                <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Token verified from reset link
                </span>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">
                New Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-4 py-3 pr-10 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-espresso-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                <span className={`flex items-center gap-1 ${isLengthValid ? 'text-emerald-400' : 'text-espresso-400'}`}>
                  {isLengthValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  Minimum 6 characters
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your new password"
                  className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-4 py-3 pr-10 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-espresso-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                  <span className={`flex items-center gap-1 ${passwordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {passwordsMatch ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || !passwordsMatch || !isLengthValid}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Update Password & Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-espresso-800 text-center">
            <Link to="/login" className="text-xs text-espresso-400 hover:text-amber-400">
              Cancel and return to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
