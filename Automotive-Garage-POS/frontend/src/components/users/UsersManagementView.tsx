import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  Edit,
  KeyRound,
  UserX,
  UserCheck,
  Trash2,
  AlertTriangle,
  Lock,
  Search,
  CheckCircle,
  X,
  Eye,
  EyeOff,
  Clock,
  Mail,
  Phone,
  Shield
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { User, UserRole } from '../../types';
import { validatePasswordStrength } from '../../utils/security';

export const UsersManagementView: React.FC = () => {
  const {
    currentUser,
    allUsers,
    createUserByOwner,
    updateUserByOwner,
    toggleUserStatus,
    resetUserPasswordByOwner,
    deleteUserByOwner
  } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Form states for Add User
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('employee');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Form states for Reset Password
  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [showAdminNewPassword, setShowAdminNewPassword] = useState(false);

  // Form states for Edit User
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('employee');

  // Owner Authorization Check
  const isOwner = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  if (!isOwner) {
    return (
      <div className="rounded border border-[#FCA5A5] bg-[#FEF2F2] p-8 text-center max-w-xl mx-auto my-12">
        <Lock className="h-8 w-8 text-[#DC2626] mx-auto mb-3" />
        <h2 className="text-lg font-bold text-[#DC2626]">
          403 Forbidden — Owner Access Required
        </h2>
        <p className="text-xs text-[#6B706D] mt-2">
          Only the garage owner can access internal user management, provision employee credentials, and modify role permissions.
        </p>
      </div>
    );
  }

  // Filtered users
  const filteredUsers = allUsers.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Owner counts for last owner protection
  const ownerCount = allUsers.filter(u => (u.role === 'owner' || u.role === 'admin') && u.status === 'active').length;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const val = validatePasswordStrength(newPassword);
    if (!val.valid) {
      setActionError(val.errors[0]);
      return;
    }

    const res = await createUserByOwner({
      name: newName,
      username: newUsername,
      email: newEmail,
      phone: newPhone,
      role: newRole,
      password: newPassword
    });

    if (res.success) {
      setActionSuccess(`Account for ${newName} (@${newUsername}) created successfully.`);
      setTimeout(() => setActionSuccess(null), 4000);
      setShowAddModal(false);
      setNewName('');
      setNewUsername('');
      setNewEmail('');
      setNewPhone('');
      setNewRole('employee');
      setNewPassword('');
    } else {
      setActionError(res.error || 'Failed to create user.');
    }
  };

  const handleEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setActionError(null);

    const res = updateUserByOwner(editingUser.id, {
      name: editName,
      email: editEmail,
      phone: editPhone,
      role: editRole
    });

    if (res.success) {
      setActionSuccess(`Updated profile for ${editName}.`);
      setTimeout(() => setActionSuccess(null), 4000);
      setEditingUser(null);
    } else {
      setActionError(res.error || 'Failed to update user.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    setActionError(null);

    const val = validatePasswordStrength(adminNewPassword);
    if (!val.valid) {
      setActionError(val.errors[0]);
      return;
    }

    const res = await resetUserPasswordByOwner(resettingUser.id, adminNewPassword);
    if (res.success) {
      setActionSuccess(`Password reset successfully for @${resettingUser.username}.`);
      setTimeout(() => setActionSuccess(null), 4000);
      setResettingUser(null);
      setAdminNewPassword('');
    } else {
      setActionError(res.error || 'Failed to reset password.');
    }
  };

  const handleToggleStatus = (u: User) => {
    setActionError(null);
    const res = toggleUserStatus(u.id);
    if (!res.success) {
      setActionError(res.error || 'Action not permitted.');
      setTimeout(() => setActionError(null), 4000);
    } else {
      setActionSuccess(`User @${u.username} is now ${u.status === 'active' ? 'disabled' : 'active'}.`);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  const handleDeleteUser = (u: User) => {
    setActionError(null);
    if (confirm(`Permanently delete internal user ${u.name} (@${u.username})? This cannot be undone.`)) {
      const res = deleteUserByOwner(u.id);
      if (!res.success) {
        setActionError(res.error || 'Cannot delete user.');
        setTimeout(() => setActionError(null), 4000);
      } else {
        setActionSuccess(`User @${u.username} deleted.`);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#202321]">
              Garage Users & Access Control
            </h1>
            <span className="rounded bg-[#E8F0EC] px-2 py-0.5 text-[10px] font-bold text-[#1B4D3E] uppercase tracking-wide">
              Owner Console
            </span>
          </div>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Manage garage workforce credentials, role permissions, and access status. Public signup is disabled.
          </p>
        </div>

        <button
          onClick={() => {
            setActionError(null);
            setShowAddModal(true);
          }}
          className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Add Garage Employee</span>
        </button>
      </div>

      {/* Action Banners */}
      {actionSuccess && (
        <div className="rounded border border-[#86EFAC] bg-[#F0FDF4] p-3 text-xs text-[#15803D] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-[#15803D] hover:opacity-75">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="rounded border border-[#FCA5A5] bg-[#FEF2F2] p-3 text-xs text-[#DC2626] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-[#DC2626] hover:opacity-75">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Summary Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded border border-[#DCDDD9] bg-white p-3">
          <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wide block">
            Total Staff
          </span>
          <span className="text-2xl font-bold font-mono text-[#202321] mt-0.5 block tabular-nums">
            {allUsers.length}
          </span>
        </div>

        <div className="rounded border border-[#DCDDD9] bg-white p-3">
          <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wide block">
            Active Accounts
          </span>
          <span className="text-2xl font-bold font-mono text-[#15803D] mt-0.5 block tabular-nums">
            {allUsers.filter(u => u.status === 'active').length}
          </span>
        </div>

        <div className="rounded border border-[#DCDDD9] bg-white p-3">
          <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wide block">
            Owners (Full Admin)
          </span>
          <span className="text-2xl font-bold font-mono text-[#1B4D3E] mt-0.5 block tabular-nums">
            {ownerCount}
          </span>
        </div>

        <div className="rounded border border-[#DCDDD9] bg-white p-3">
          <span className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wide block">
            Disabled Accounts
          </span>
          <span className="text-2xl font-bold font-mono text-[#DC2626] mt-0.5 block tabular-nums">
            {allUsers.filter(u => u.status === 'disabled').length}
          </span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded border border-[#DCDDD9] bg-white p-2.5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded border border-[#DCDDD9] bg-[#F5F5F3] pl-8 pr-3 py-1.5 text-xs text-[#202321] placeholder-[#9CA3AF] focus:border-[#1B4D3E] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as any)}
            className="rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DCDDD9] bg-[#F5F5F3] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wide">
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Contact</th>
                <th className="py-2.5 px-4">Last Login</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#6B706D]">
                    No garage users found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => {
                  const isUserOwner = u.role === 'owner' || u.role === 'admin';
                  const isCurrent = currentUser?.id === u.id;
                  const isLastOwner = isUserOwner && ownerCount <= 1;

                  return (
                    <tr key={u.id} className="hover:bg-[#F5F5F3] transition-colors">
                      {/* User Name & Username */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-7 w-7 items-center justify-center rounded text-xs font-bold ${
                            isUserOwner
                              ? 'bg-[#1B4D3E] text-white'
                              : u.role === 'manager'
                              ? 'bg-[#E8F0EC] text-[#1B4D3E]'
                              : 'bg-[#F5F5F3] text-[#202321] border border-[#DCDDD9]'
                          }`}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#202321] flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="rounded bg-[#E8F0EC] px-1.5 py-0.2 text-[9px] font-bold text-[#1B4D3E]">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="font-mono text-[11px] text-[#6B706D]">
                              @{u.username}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                          isUserOwner
                            ? 'bg-[#1B4D3E] text-white'
                            : u.role === 'manager'
                            ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                            : 'bg-[#F5F5F3] text-[#202321] border border-[#DCDDD9]'
                        }`}>
                          {isUserOwner && <Shield className="h-3 w-3" />}
                          {u.role === 'admin' ? 'Owner' : u.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-medium ${
                          u.status === 'active'
                            ? 'bg-[#DCFCE7] text-[#15803D]'
                            : 'bg-[#FEE2E2] text-[#DC2626]'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'active' ? 'bg-[#15803D]' : 'bg-[#DC2626]'}`} />
                          {u.status === 'active' ? 'Active' : 'Disabled'}
                        </span>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 text-[#6B706D]">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Mail className="h-3 w-3" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] mt-0.5 font-mono">
                            <Phone className="h-3 w-3" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="py-3 px-4 text-[#6B706D] font-mono text-[11px]">
                        {u.lastLogin ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(u.lastLogin).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ) : (
                          <span className="text-[#9CA3AF]">Never logged in</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Edit User */}
                          <button
                            onClick={() => {
                              setActionError(null);
                              setEditingUser(u);
                              setEditName(u.name);
                              setEditEmail(u.email);
                              setEditPhone(u.phone || '');
                              setEditRole(u.role);
                            }}
                            className="rounded p-1 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321]"
                            title="Edit User Profile"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setActionError(null);
                              setResettingUser(u);
                              setAdminNewPassword('');
                            }}
                            className="rounded p-1 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#1B4D3E]"
                            title="Reset Employee Password"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>

                          {/* Disable / Enable Toggle */}
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={isLastOwner}
                            className={`rounded p-1 transition-colors ${
                              isLastOwner
                                ? 'opacity-30 cursor-not-allowed text-[#9CA3AF]'
                                : u.status === 'active'
                                ? 'text-[#B45309] hover:bg-[#FEF3C7]'
                                : 'text-[#15803D] hover:bg-[#DCFCE7]'
                            }`}
                            title={
                              isLastOwner
                                ? 'Cannot disable the last active Owner'
                                : u.status === 'active'
                                ? 'Disable Employee Account'
                                : 'Enable Employee Account'
                            }
                          >
                            {u.status === 'active' ? (
                              <UserX className="h-3.5 w-3.5" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5" />
                            )}
                          </button>

                          {/* Delete (Cannot delete last owner or self) */}
                          {!isLastOwner && !isCurrent && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              className="rounded p-1 text-[#DC2626] hover:bg-[#FEE2E2]"
                              title="Delete User"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded border border-[#DCDDD9] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-[#1B4D3E]" />
                <h3 className="text-sm font-bold text-[#202321]">
                  Provision Garage User Account
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#202321] block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmed Raza"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#202321] block mb-1">Username (Login ID) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ahmed"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#202321] block mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="ahmed@garage.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#202321] block mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="0300-1234567"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#202321] block mb-1">Assigned Role *</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none bg-white"
                  >
                    <option value="employee">Employee (Assigned Jobs, Floor Operations)</option>
                    <option value="manager">Manager (POS, Inventory, Billing, Operations)</option>
                    <option value="owner">Owner (Full System & User Control)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#202321] block mb-1">Initial Password *</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="Min. 8 chars (A-Z, a-z, 0-9)"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full rounded border border-[#DCDDD9] pl-2.5 pr-8 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-2 text-[#6B706D]"
                    >
                      {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded border border-[#DCDDD9] bg-[#F5F5F3] p-2 text-[11px] text-[#6B706D]">
                Password must be at least 8 characters long and include uppercase, lowercase, and a number.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded border border-[#DCDDD9] px-3 py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32]"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded border border-[#DCDDD9] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Edit className="h-4 w-4 text-[#1B4D3E]" />
                <h3 className="text-sm font-bold text-[#202321]">
                  Edit Profile: @{editingUser.username}
                </h3>
              </div>
              <button onClick={() => setEditingUser(null)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleEditUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#202321] block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#202321] block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#202321] block mb-1">Phone</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-[#202321] block mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={e => setEditRole(e.target.value as UserRole)}
                  disabled={editingUser.role === 'owner' && ownerCount <= 1}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none bg-white disabled:bg-[#F5F5F3]"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="owner">Owner</option>
                </select>
                {editingUser.role === 'owner' && ownerCount <= 1 && (
                  <span className="text-[11px] text-[#B45309] mt-1 block">
                    Cannot change the role of the last remaining Owner.
                  </span>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded border border-[#DCDDD9] px-3 py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {resettingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded border border-[#DCDDD9] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-[#1B4D3E]" />
                <h3 className="text-sm font-bold text-[#202321]">
                  Reset Password for @{resettingUser.username}
                </h3>
              </div>
              <button onClick={() => setResettingUser(null)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
              <p className="text-xs text-[#6B706D] leading-relaxed">
                As garage owner, you can directly set a new secure password for this user without exposing email links.
              </p>

              <div>
                <label className="font-semibold text-[#202321] block mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showAdminNewPassword ? 'text' : 'password'}
                    required
                    placeholder="Min. 8 chars (A-Z, a-z, 0-9)"
                    value={adminNewPassword}
                    onChange={e => setAdminNewPassword(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] pl-2.5 pr-8 py-1.5 font-mono focus:border-[#1B4D3E] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminNewPassword(!showAdminNewPassword)}
                    className="absolute right-2 top-2 text-[#6B706D]"
                  >
                    {showAdminNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setResettingUser(null)}
                  className="rounded border border-[#DCDDD9] px-3 py-1.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32]"
                >
                  Apply New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
