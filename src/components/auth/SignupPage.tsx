import React, { useState } from 'react';
import {
  Wrench,
  Lock,
  User as UserIcon,
  Mail,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Car,
  CheckCircle2,
  HardHat,
  Briefcase,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { UserRole } from '../../types';

export const SignupPage: React.FC = () => {
  const { registerUser, setActiveView, settings } = useShop();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [autoLogin, setAutoLogin] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password evaluation metrics
  const hasMinLength = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const strengthScore = [hasMinLength, hasLetter, hasNumber, hasSpecial].filter(Boolean).length;
  const strengthLabels = ['Too Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-[#DC2626]', 'bg-[#F59E0B]', 'bg-[#10B981]', 'bg-[#1B4D3E]'];

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!username.trim() || username.trim().length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please create a secure password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('Please accept the workshop guidelines to proceed.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser({
        name: fullName.trim(),
        username: username.toLowerCase().trim(),
        email: email.toLowerCase().trim(),
        phone: phone.trim() || undefined,
        role,
        password,
        autoLogin
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while creating your account.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickDemo = (demoRole: UserRole) => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    if (demoRole === 'employee') {
      setFullName('Ahmed Raza');
      setUsername(`mechanic_${randomSuffix}`);
      setEmail(`mechanic${randomSuffix}@garage.com`);
      setPhone('+971 50 882 1045');
      setRole('employee');
      setPassword('Garage123#');
      setConfirmPassword('Garage123#');
    } else if (demoRole === 'manager') {
      setFullName('Sara Tariq');
      setUsername(`manager_${randomSuffix}`);
      setEmail(`manager${randomSuffix}@garage.com`);
      setPhone('+971 52 441 9920');
      setRole('manager');
      setPassword('Garage123#');
      setConfirmPassword('Garage123#');
    } else {
      setFullName('Hassan Ali');
      setUsername(`admin_${randomSuffix}`);
      setEmail(`admin${randomSuffix}@garage.com`);
      setPhone('+971 55 119 7733');
      setRole('admin');
      setPassword('Garage123#');
      setConfirmPassword('Garage123#');
    }
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F5F5F3] font-sans text-[#202321]">
      {/* Left Column: Workshop Brand Identity (Desktop) */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between bg-[#1B4D3E] text-white p-12 relative overflow-hidden">
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
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 backdrop-blur-xs border border-white/20 text-white shadow-xs">
              <Wrench className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight block text-white">
                {settings?.garageName || settings?.shopName || 'Automotive Garage'}
              </span>
              <span className="text-xs uppercase tracking-wider text-[#A3C9BD] font-semibold">
                Workshop Management & POS
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#D1E7DD] border border-white/15">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Self-Registration Portal</span>
            </div>
            <h1 className="text-2xl font-bold leading-tight">
              Join the Workshop Team
            </h1>
            <p className="text-xs text-[#D1E7DD] leading-relaxed max-w-sm">
              Create your garage staff or technician profile to access real-time repair work orders, parts inventory, counter billing, and customer service logs.
            </p>
          </div>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 space-y-4 py-8">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white/10 text-[#A3C9BD]">
              <HardHat className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Technician & Mechanic Floor</h4>
              <p className="text-[11px] text-[#A3C9BD] leading-relaxed">
                Log diagnostic notes, billable labour hours, and requested replacement parts directly to job cards.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white/10 text-[#A3C9BD]">
              <Briefcase className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Service Advisor & POS Desk</h4>
              <p className="text-[11px] text-[#A3C9BD] leading-relaxed">
                Counter invoicing, customer vehicle intake, quotation generation, and receipt printing.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white/10 text-[#A3C9BD]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Cryptographic Security</h4>
              <p className="text-[11px] text-[#A3C9BD] leading-relaxed">
                PBKDF2-HMAC-SHA256 salted password hashing, audit activity logging, and role-based access control.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-[#A3C9BD]">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
            <span>Terminal Gateway Online</span>
          </div>
          <span>Version 2.0.0</span>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-4 sm:p-8 lg:p-12 overflow-y-auto max-h-screen">
        <div className="w-full max-w-lg rounded border border-[#DCDDD9] bg-white p-6 sm:p-8 shadow-xs my-auto">
          {/* Mobile Header */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded bg-[#1B4D3E] text-white">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-[#202321] block">
                {settings?.garageName || settings?.shopName || 'Automotive Garage'}
              </span>
              <span className="text-[11px] text-[#6B706D]">Staff Registration</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-[#202321]">
                Create Your Account
              </h2>
              <button
                type="button"
                onClick={() => setActiveView('login')}
                className="text-xs font-semibold text-[#1B4D3E] hover:underline"
              >
                Sign In Instead
              </button>
            </div>
            <p className="text-xs text-[#6B706D] mt-1">
              Enter your details to create an account and access the workshop terminal.
            </p>
          </div>

          {/* Quick Demo Pre-fills */}
          <div className="mb-5 rounded border border-[#DCDDD9] bg-[#F5F5F3] p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6B706D] flex items-center gap-1">
                <UserCheck className="h-3 w-3 text-[#1B4D3E]" />
                Quick Test Pre-fills:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillQuickDemo('employee')}
                className="rounded border border-[#DCDDD9] bg-white px-2.5 py-1 text-[11px] font-medium text-[#202321] hover:border-[#1B4D3E] hover:text-[#1B4D3E] transition-colors shadow-2xs"
              >
                + Technician Account
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('manager')}
                className="rounded border border-[#DCDDD9] bg-white px-2.5 py-1 text-[11px] font-medium text-[#202321] hover:border-[#1B4D3E] hover:text-[#1B4D3E] transition-colors shadow-2xs"
              >
                + Manager Account
              </button>
              <button
                type="button"
                onClick={() => fillQuickDemo('admin')}
                className="rounded border border-[#DCDDD9] bg-white px-2.5 py-1 text-[11px] font-medium text-[#202321] hover:border-[#1B4D3E] hover:text-[#1B4D3E] transition-colors shadow-2xs"
              >
                + Admin Account
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#DC2626]">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#202321] block mb-1">
                  Full Name <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Mahmood"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] pl-9 pr-3 py-2 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#202321] block mb-1">
                  Username <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold text-[#6B706D]">@</span>
                  <input
                    type="text"
                    required
                    placeholder="tariq_m"
                    value={username}
                    onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full rounded border border-[#DCDDD9] pl-7 pr-3 py-2 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#202321] block mb-1">
                  Email Address <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
                  <input
                    type="email"
                    required
                    placeholder="tariq@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] pl-9 pr-3 py-2 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#202321] block mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
                  <input
                    type="tel"
                    placeholder="+971 50 123 4567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] pl-9 pr-3 py-2 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="text-xs font-semibold text-[#202321] block mb-1">
                Workshop Role / Position <span className="text-[#DC2626]">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('employee')}
                  className={`p-2.5 rounded border text-left transition-all ${
                    role === 'employee'
                      ? 'border-[#1B4D3E] bg-[#E8F0EC] text-[#1B4D3E] ring-1 ring-[#1B4D3E]'
                      : 'border-[#DCDDD9] bg-white text-[#202321] hover:bg-[#F5F5F3]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Technician / Staff</span>
                    {role === 'employee' && <CheckCircle2 className="h-3.5 w-3.5 text-[#1B4D3E]" />}
                  </div>
                  <p className="text-[10px] text-[#6B706D] leading-tight">
                    Job cards, repair floor, inspections & POS
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('manager')}
                  className={`p-2.5 rounded border text-left transition-all ${
                    role === 'manager'
                      ? 'border-[#1B4D3E] bg-[#E8F0EC] text-[#1B4D3E] ring-1 ring-[#1B4D3E]'
                      : 'border-[#DCDDD9] bg-white text-[#202321] hover:bg-[#F5F5F3]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Workshop Manager</span>
                    {role === 'manager' && <CheckCircle2 className="h-3.5 w-3.5 text-[#1B4D3E]" />}
                  </div>
                  <p className="text-[10px] text-[#6B706D] leading-tight">
                    Payroll, supplier purchases & reports
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-2.5 rounded border text-left transition-all ${
                    role === 'admin'
                      ? 'border-[#1B4D3E] bg-[#E8F0EC] text-[#1B4D3E] ring-1 ring-[#1B4D3E]'
                      : 'border-[#DCDDD9] bg-white text-[#202321] hover:bg-[#F5F5F3]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">Garage Admin</span>
                    {role === 'admin' && <CheckCircle2 className="h-3.5 w-3.5 text-[#1B4D3E]" />}
                  </div>
                  <p className="text-[10px] text-[#6B706D] leading-tight">
                    Full management, settings & security
                  </p>
                </button>
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#202321] block mb-1">
                  Create Password <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] pl-9 pr-9 py-2 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#6B706D] hover:text-[#202321]"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#202321] block mb-1">
                  Confirm Password <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] pl-9 pr-9 py-2 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-2.5 text-[#6B706D] hover:text-[#202321]"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#6B706D]">Password Strength:</span>
                  <span className="font-semibold text-[#202321]">
                    {strengthLabels[strengthScore - 1] || 'Too Weak'}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#DCDDD9] rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-300 ${strengthColors[strengthScore - 1] || 'bg-[#DC2626]'}`}
                    style={{ width: `${(strengthScore / 4) * 100}%` }}
                  />
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#6B706D] pt-0.5">
                  <span className={hasMinLength ? 'text-[#10B981] font-semibold' : ''}>
                    ✓ 6+ chars
                  </span>
                  <span className={hasLetter ? 'text-[#10B981] font-semibold' : ''}>
                    ✓ Letter
                  </span>
                  <span className={hasNumber ? 'text-[#10B981] font-semibold' : ''}>
                    ✓ Number
                  </span>
                  <span className={passwordsMatch ? 'text-[#10B981] font-semibold' : ''}>
                    ✓ Passwords match
                  </span>
                </div>
              </div>
            )}

            {/* Options */}
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-xs text-[#202321] cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoLogin}
                  onChange={e => setAutoLogin(e.target.checked)}
                  className="rounded border-[#DCDDD9] text-[#1B4D3E] focus:ring-0"
                />
                <span>Sign in immediately upon account creation</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-[#202321] cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="rounded border-[#DCDDD9] text-[#1B4D3E] focus:ring-0"
                />
                <span>I agree to the workshop operations safety and privacy guidelines</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded bg-[#1B4D3E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors disabled:opacity-50 shadow-xs"
              >
                <span>{isLoading ? 'Creating Account...' : 'Create Account & Proceed'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>

          {/* Footer Back to Login */}
          <div className="mt-6 pt-4 border-t border-[#DCDDD9] text-center">
            <p className="text-xs text-[#6B706D]">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setActiveView('login')}
                className="font-semibold text-[#1B4D3E] hover:underline ml-0.5 inline-flex items-center gap-1"
              >
                Sign In to Terminal
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
