import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Mail, KeyRound, CheckCircle, ArrowRight } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [resetGenerated, setResetGenerated] = useState<{
    token: string;
    url: string;
  } | null>(null);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setSubmitting(true);
      const res = await api.forgotPassword(email.trim().toLowerCase());

      if (res.success) {
        showToast(res.message || 'Password reset link generated.');
        if (res.resetToken) {
          setResetGenerated({
            token: res.resetToken,
            url: res.resetUrl || `/reset-password?token=${res.resetToken}`
          });
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Error processing password reset request.', 'error');
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
            Reset Your Password
          </h1>
          <p className="text-xs sm:text-sm text-espresso-400 mt-1 max-w-sm mx-auto">
            Enter your registered email address and we'll generate a secure reset link for your account.
          </p>
        </div>

        {/* Card */}
        <div className="bg-espresso-900/40 border border-espresso-800 p-8 rounded-3xl shadow-2xl">
          {resetGenerated ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="font-serif text-lg font-bold text-white">
                  Reset Token Generated
                </h3>
                <p className="text-xs text-espresso-300 mt-2 leading-relaxed">
                  For your email <strong className="text-amber-300 font-mono">{email}</strong>, a secure password reset token has been issued.
                </p>
              </div>

              {/* Instant Reset Action */}
              <div className="p-4 bg-espresso-950 rounded-2xl border border-amber-500/30 text-left space-y-3">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                  Direct Password Reset Link
                </span>
                <p className="text-[11px] text-espresso-400">
                  Click the button below to set a new password right away:
                </p>
                <button
                  onClick={() => navigate(resetGenerated.url)}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  Proceed To Set New Password
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setResetGenerated(null)}
                  className="text-espresso-400 hover:text-white underline text-xs"
                >
                  Use a different email address
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs text-espresso-300 block mb-1.5 font-semibold">
                  Account Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. customer@example.com"
                    className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-4 py-3 pl-10 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <Mail className="w-4 h-4 text-espresso-500 absolute left-3.5 top-3.5" />
                </div>
                <span className="text-[11px] text-espresso-500 mt-1 block">
                  Tip: If using demo customer, enter <code className="text-amber-400">customer@example.com</code>
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating Reset Link...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    Send Password Reset Link
                  </>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-espresso-800 text-center">
            <Link
              to="/login"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
