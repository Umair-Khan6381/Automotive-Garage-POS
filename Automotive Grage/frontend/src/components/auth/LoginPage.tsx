import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  X,
  Clock,
  Car,
  CheckCircle2,
  HardHat
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { checkLoginRateLimit } from '../../utils/security';

export const LoginPage: React.FC = () => {
  const { login, settings, setupCompleted, setActiveView, authFlashMessage } = useShop();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(0);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  // Check rate limit timer on mount and tick
  useEffect(() => {
    if (!identifier) return;
    const { locked, remainingSeconds } = checkLoginRateLimit(identifier);
    if (locked) {
      setLockoutSeconds(remainingSeconds);
    }
  }, [identifier]);

  // Lockout countdown timer
  useEffect(() => {
    if (lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      setLockoutSeconds(prev => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password) {
      setErrorMessage('Please enter both your username/email and password.');
      return;
    }

    if (lockoutSeconds > 0) {
      setErrorMessage(`Too many login attempts. Please wait ${lockoutSeconds} seconds before trying again.`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(identifier.trim(), password);
      if (!res.success) {
        setErrorMessage(res.error || 'Invalid username or password.');
        // Re-check rate limit status after failed attempt
        const rate = checkLoginRateLimit(identifier);
        if (rate.locked) {
          setLockoutSeconds(rate.remainingSeconds);
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Security best practice: Never reveal if an email exists
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F5F5F3] font-sans text-[#202321]">
      {/* Left Column: Automotive Garage Identity (Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#1B4D3E] text-white p-12 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #FFFFFF 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top Branding */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-white text-[#1B4D3E]">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight block">
                {settings.garageName || settings.shopName || 'Umair Auto Care'}
              </span>
              <span className="text-xs text-white/70 tracking-wide uppercase font-medium">
                Automotive Workshop Management System
              </span>
            </div>
          </div>
        </div>

        {/* Center Automotive Information */}
        <div className="relative z-10 max-w-md my-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-xs border border-white/15">
            <Lock className="h-3.5 w-3.5 text-white/90" />
            <span>Private Garage System</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight leading-tight">
            Manage your workshop, customers, vehicles, inventory and payments from one place.
          </h2>

          <p className="text-sm text-white/80 leading-relaxed">
            High-efficiency terminal for repair work orders, digital vehicle inspections, counter POS billing, technician payroll, and real-time inventory management.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/15 text-xs text-white/85">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-white/90" />
              <span>Vehicle Service Ledger</span>
            </div>
            <div className="flex items-center gap-2">
              <HardHat className="h-4 w-4 text-white/90" />
              <span>Mechanic Job Cards</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-white/90" />
              <span>Owner Access Control</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-white/90" />
              <span>Strict Private Mode</span>
            </div>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="relative z-10 text-xs text-white/60 flex items-center justify-between border-t border-white/15 pt-4">
          <span>Private Garage Deployment</span>
          <span>Authorized Personnel Only</span>
        </div>
      </div>

      {/* Right Column: Secure Terminal Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Header Branding */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-[#1B4D3E] text-white">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#202321] block">
                {settings.garageName || settings.shopName || 'Umair Auto Care'}
              </span>
              <span className="text-[11px] text-[#6B706D]">
                Private Garage POS System
              </span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold tracking-tight text-[#202321]">
                Welcome back
              </h1>
              <span className="inline-flex items-center gap-1 rounded bg-[#E8F0EC] px-2 py-0.5 text-[10px] font-bold text-[#1B4D3E] uppercase tracking-wide">
                <Lock className="h-2.5 w-2.5" /> Private
              </span>
            </div>
            <p className="text-xs text-[#6B706D] mt-1">
              Sign in to your garage management system
            </p>
          </div>

          {/* First-time Setup Prompt if system is not initialized */}
          {!setupCompleted && (
            <div className="rounded border border-[#B45309] bg-[#FEF3C7] p-3 mb-5 text-xs text-[#92400E]">
              <div className="font-semibold flex items-center gap-1.5 mb-1">
                <ShieldCheck className="h-4 w-4" /> First-time installation detected
              </div>
              <p className="mb-2">
                The database currently has no master administrator account. Please initialize your private garage owner account.
              </p>
              <button
                type="button"
                onClick={() => setActiveView('setup')}
                className="inline-flex items-center gap-1 rounded bg-[#B45309] px-2.5 py-1 text-[11px] font-bold text-white hover:bg-[#78350F] transition-colors"
              >
                <span>Launch First-Time Setup (/setup)</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Flash message (e.g. from setup completion) */}
          {authFlashMessage && (
            <div className="rounded border border-[#86EFAC] bg-[#F0FDF4] p-3 mb-5 text-xs text-[#15803D] flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{authFlashMessage}</span>
            </div>
          )}

          {/* Lockout Warning Banner */}
          {lockoutSeconds > 0 && (
            <div className="rounded border border-[#FCA5A5] bg-[#FEF2F2] p-3 mb-5 text-xs text-[#DC2626] flex items-start gap-2">
              <Clock className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Too many failed login attempts</span>
                <span>Security cooldown active. Please wait <strong>{lockoutSeconds}s</strong> before retrying.</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && lockoutSeconds === 0 && (
            <div className="rounded border border-[#FCA5A5] bg-[#FEF2F2] p-3 mb-5 text-xs text-[#DC2626] flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[13px] font-medium text-[#202321] block mb-1">
                Email / Username
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="e.g. umair or owner@example.com"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                disabled={lockoutSeconds > 0 || isLoading}
                className="w-full rounded border border-[#DCDDD9] bg-white px-3 py-2 text-sm text-[#202321] placeholder-[#9CA3AF] focus:border-[#1B4D3E] focus:outline-none disabled:bg-[#F5F5F3] font-mono text-[13px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[13px] font-medium text-[#202321]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-[#1B4D3E] hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your garage password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={lockoutSeconds > 0 || isLoading}
                  className="w-full rounded border border-[#DCDDD9] bg-white pl-3 pr-9 py-2 text-sm text-[#202321] placeholder-[#9CA3AF] focus:border-[#1B4D3E] focus:outline-none disabled:bg-[#F5F5F3] font-mono text-[13px]"
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

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#6B706D]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-[#DCDDD9] text-[#1B4D3E] focus:ring-0"
                />
                <span>Remember this terminal session</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={lockoutSeconds > 0 || isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded bg-[#1B4D3E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors disabled:opacity-50 shadow-xs"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Quick Fill Owner Account button */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIdentifier('umair');
                  setPassword('umair123#');
                  setErrorMessage(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs text-[#1B4D3E] hover:underline font-semibold"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Fill Owner Credentials (umair / umair123#)</span>
              </button>
            </div>
          </form>

          {/* Bottom Security Footer */}
          <div className="mt-8 pt-6 border-t border-[#DCDDD9] text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#6B706D] mb-1 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-[#1B4D3E]" />
              <span>Private Garage System</span>
            </div>
            <p className="text-[11px] text-[#9CA3AF]">
              Single workshop deployment. Public user registration is permanently disabled.
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded border border-[#DCDDD9] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-[#1B4D3E]" />
                <h3 className="text-sm font-bold text-[#202321]">
                  Garage Password Recovery
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotSent(false);
                  setForgotEmail('');
                }}
                className="text-[#6B706D] hover:text-[#202321]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!forgotSent ? (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <p className="text-xs text-[#6B706D] leading-relaxed">
                  As this is a private garage system, passwords can also be directly reset by your Garage Owner / Administrator from <strong>Settings → Users & Access</strong>.
                </p>

                <p className="text-xs text-[#6B706D] leading-relaxed">
                  To request password reset instructions for your account, enter your verified email address below:
                </p>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. employee@example.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-3 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="rounded border border-[#DCDDD9] bg-white px-3 py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32]"
                  >
                    Send Reset Instructions
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="rounded border border-[#86EFAC] bg-[#F0FDF4] p-3 text-xs text-[#15803D] leading-relaxed">
                  If an account exists for <strong>{forgotEmail}</strong>, password reset instructions and security tokens have been sent.
                </div>
                <p className="text-xs text-[#6B706D] leading-relaxed">
                  For immediate assistance in the garage, the workshop owner can also reset your password in real-time from the master management console.
                </p>
                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(false);
                      setForgotSent(false);
                      setForgotEmail('');
                    }}
                    className="rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32]"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
