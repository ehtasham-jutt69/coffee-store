import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Mail, Lock, Eye, EyeOff, User, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const isPasswordLongEnough = password.length >= 6;
  const isMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast('Please provide both an email and password.', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const success = await signup({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        password,
        confirmPassword
      });

      if (success) {
        navigate('/account');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    setFirstName('Sarah');
    setLastName('Jenkins');
    setEmail(`sarah.roast${randomId}@example.com`);
    setPhone('+1 (555) 982-1144');
    setPassword('Coffee2026!');
    setConfirmPassword('Coffee2026!');
    showToast('Example credentials populated.');
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
            Create Coffee Account
          </h1>
          <p className="text-xs sm:text-sm text-espresso-400 mt-1 max-w-sm mx-auto">
            Sign up to unlock 10% off your first roast order. A welcome confirmation will be sent to your inbox from <span className="text-amber-400">instahelper7109648@gmail.com</span>.
          </p>
        </div>

        {/* Quick Fill Button for testing */}
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={handleQuickFill}
            className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium flex items-center gap-1"
          >
            ⚡ Quick-fill sample data
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-espresso-900/40 border border-espresso-800 p-8 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields (Optional / Graceful) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-espresso-300 block mb-1 font-semibold">
                  First Name <span className="text-[10px] text-espresso-500 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Elena"
                    className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                  />
                  <User className="w-3.5 h-3.5 text-espresso-500 absolute left-3 top-3" />
                </div>
              </div>
              <div>
                <label className="text-xs text-espresso-300 block mb-1 font-semibold">
                  Last Name <span className="text-[10px] text-espresso-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Vance"
                  className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Email Field (Required) */}
            <div>
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. coffee.lover@example.com"
                  className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-3.5 py-2.5 pl-9 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                />
                <Mail className="w-3.5 h-3.5 text-espresso-500 absolute left-3 top-3" />
              </div>
            </div>

            {/* Password Field (Required) */}
            <div>
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-3.5 py-2.5 pl-9 pr-10 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                />
                <Lock className="w-3.5 h-3.5 text-espresso-500 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-espresso-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px]">
                <span className={`flex items-center gap-1 ${isPasswordLongEnough ? 'text-emerald-400' : 'text-espresso-400'}`}>
                  {isPasswordLongEnough ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  At least 6 characters
                </span>
              </div>
            </div>

            {/* Confirm Password Field (Required) */}
            <div>
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-3.5 py-2.5 pl-9 pr-10 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                />
                <Lock className="w-3.5 h-3.5 text-espresso-500 absolute left-3 top-3" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-espresso-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <div className="flex items-center gap-2 mt-1 text-[11px]">
                  <span className={`flex items-center gap-1 ${isMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isMatch ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {isMatch ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                </div>
              )}
            </div>

            {/* Optional Phone */}
            <div>
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">
                Phone Number <span className="text-[10px] text-espresso-500 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 234-5678"
                className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-900/30 transition-all mt-4 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account & Join Club
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-espresso-800 text-center">
            <p className="text-xs text-espresso-400">
              Already have an account?{' '}
              <Link to="/login" className="text-amber-400 hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
