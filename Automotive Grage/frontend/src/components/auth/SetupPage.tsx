import React, { useState } from 'react';
import {
  Wrench,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Building,
  UserCheck,
  KeyRound
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { validatePasswordStrength } from '../../utils/security';

export const SetupPage: React.FC = () => {
  const { completeFirstTimeSetup, setActiveView } = useShop();

  const [fullName, setFullName] = useState('');
  const [garageName, setGarageName] = useState('Umair Auto Care');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordValidation = validatePasswordStrength(password);

  const fillExample = () => {
    setFullName('Umair Ullah');
    setGarageName('Umair Auto Care');
    setEmail('owner@example.com');
    setUsername('umair');
    setPhone('+92 300 1234567');
    setPassword('Garage2026!');
    setConfirmPassword('Garage2026!');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !garageName.trim() || !email.trim() || !username.trim() || !password) {
      setErrorMessage('Please fill in all required setup fields.');
      return;
    }

    if (!passwordValidation.valid) {
      setErrorMessage(passwordValidation.errors[0]);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify both password fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await completeFirstTimeSetup({
        fullName,
        garageName,
        email,
        username,
        phone,
        password,
        confirmPassword
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to complete setup. Please try again.');
        setIsSubmitting(false);
      }
      // On success, completeFirstTimeSetup automatically routes to login with success flash
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during setup.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F5F3] px-4 py-10 font-sans">
      <div className="w-full max-w-xl rounded border border-[#DCDDD9] bg-white p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#DCDDD9] pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-[#1B4D3E] text-white">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-[#202321]">
                  Create Admin / Owner Account
                </h1>
                <span className="rounded bg-[#E8F0EC] px-2 py-0.5 text-[10px] font-bold text-[#1B4D3E] uppercase tracking-wide">
                  Master Access
                </span>
              </div>
              <p className="text-xs text-[#6B706D] mt-0.5">
                Set up your own custom garage owner credentials with full system authority
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fillExample}
              className="hidden sm:inline-flex items-center gap-1 rounded border border-[#DCDDD9] bg-[#F5F5F3] px-2.5 py-1 text-[11px] font-semibold text-[#1B4D3E] hover:bg-[#E8F0EC] transition-colors"
              title="Pre-fill standard garage example"
            >
              <span>Demo Fill</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('login')}
              className="inline-flex items-center gap-1 rounded border border-[#DCDDD9] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#202321] hover:bg-[#F5F5F3] transition-colors"
            >
              <span>Sign In</span>
            </button>
          </div>
        </div>

        {/* Notice on Private System */}
        <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-3 mb-6 flex items-start gap-2.5 text-xs text-[#6B706D]">
          <Lock className="h-4 w-4 text-[#1B4D3E] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-[#202321]">Private Owner Account:</strong> This will create your master administrator profile with unlimited authority across POS billing, financial reports, workshop repair jobs, inventory, and staff management.
          </div>
        </div>

        {errorMessage && (
          <div className="rounded border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#DC2626] mb-5 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Garage Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-medium text-[#202321] block mb-1">
                Garage / Workshop Name *
              </label>
              <div className="relative">
                <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-[#6B706D]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Umair Auto Care"
                  value={garageName}
                  onChange={e => setGarageName(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] bg-white pl-9 pr-3 py-2 text-sm text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[13px] font-medium text-[#202321] block mb-1">
                Garage Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. +92 300 1234567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded border border-[#DCDDD9] bg-white px-3 py-2 text-sm text-[#202321] focus:border-[#1B4D3E] focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Owner Account Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#DCDDD9]">
            <div>
              <label className="text-[13px] font-medium text-[#202321] block mb-1">
                Owner Full Name *
              </label>
              <div className="relative">
                <UserCheck className="absolute left-2.5 top-2.5 h-4 w-4 text-[#6B706D]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Umair Ullah"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] bg-white pl-9 pr-3 py-2 text-sm text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[13px] font-medium text-[#202321] block mb-1">
                Owner Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="e.g. owner@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded border border-[#DCDDD9] bg-white px-3 py-2 text-sm text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[13px] font-medium text-[#202321] block mb-1">
                Master Owner Username *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. umair or owner"
                value={username}
                onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                className="w-full rounded border border-[#DCDDD9] bg-white px-3 py-2 text-sm text-[#202321] font-mono focus:border-[#1B4D3E] focus:outline-none"
              />
              <span className="text-[11px] text-[#6B706D] mt-0.5 block">
                Lowercase alphanumeric letters used to log into the counter and POS terminals
              </span>
            </div>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#DCDDD9]">
            <div>
              <label className="text-[13px] font-medium text-[#202321] block mb-1">
                Password *
              </label>
              <div className="relative">
                <KeyRound className="absolute left-2.5 top-2.5 h-4 w-4 text-[#6B706D]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] bg-white pl-9 pr-9 py-2 text-sm text-[#202321] focus:border-[#1B4D3E] focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-[#6B706D] hover:text-[#202321]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[13px] font-medium text-[#202321] block mb-1">
                Confirm Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full rounded border border-[#DCDDD9] bg-white px-3 py-2 text-sm text-[#202321] focus:border-[#1B4D3E] focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Password Strength Checklist */}
          {password && (
            <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-2.5 text-[11px] space-y-1">
              <span className="font-semibold text-[#202321] block">Password Security Policy:</span>
              <div className="grid grid-cols-2 gap-1">
                <span className={`flex items-center gap-1 ${password.length >= 6 ? 'text-[#15803D]' : 'text-[#DC2626]'}`}>
                  <CheckCircle className="h-3 w-3" /> Min. 6 characters
                </span>
                <span className={`flex items-center gap-1 ${/[0-9#@$!%*?]/.test(password) ? 'text-[#15803D]' : 'text-[#6B706D]'}`}>
                  <CheckCircle className="h-3 w-3" /> Numbers & symbols recommended
                </span>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-[#DCDDD9] space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded bg-[#1B4D3E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors disabled:opacity-50 shadow-xs"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isSubmitting ? 'Creating Owner Account...' : 'Create Admin / Owner Account & Enter Dashboard'}</span>
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setActiveView('login')}
                className="text-xs text-[#6B706D] hover:text-[#1B4D3E] hover:underline"
              >
                Already have an account? Sign in to your garage →
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
