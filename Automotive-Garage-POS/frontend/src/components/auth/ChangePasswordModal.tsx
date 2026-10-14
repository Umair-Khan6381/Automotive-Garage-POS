import React, { useState } from 'react';
import { KeyRound, X, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { validatePasswordStrength } from '../../utils/security';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { changeMyPassword, currentUser } = useShop();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    const val = validatePasswordStrength(newPassword);
    if (!val.valid) {
      setError(val.errors[0]);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await changeMyPassword(currentPassword, newPassword);
      if (res.success) {
        setSuccess('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 1500);
      } else {
        setError(res.error || 'Failed to update password.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs font-sans">
      <div className="w-full max-w-md rounded border border-[#DCDDD9] bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-[#1B4D3E]" />
            <h3 className="text-sm font-bold text-[#202321]">
              Change Password: @{currentUser?.username}
            </h3>
          </div>
          <button onClick={onClose} className="text-[#6B706D] hover:text-[#202321]">
            <X className="h-4 w-4" />
          </button>
        </div>

        {success && (
          <div className="rounded border border-[#86EFAC] bg-[#F0FDF4] p-3 text-xs text-[#15803D] mb-4 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="rounded border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#DC2626] mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-[#202321] block mb-1">
              Current Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-[#202321] block mb-1">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Min. 8 chars (A-Z, a-z, 0-9)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full rounded border border-[#DCDDD9] pl-2.5 pr-8 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-2 text-[#6B706D]"
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-[#202321] block mb-1">
              Confirm New Password *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-[#DCDDD9] px-3 py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
