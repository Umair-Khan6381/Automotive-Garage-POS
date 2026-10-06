import React, { useState } from 'react';
import {
  History,
  Search,
  Filter,
  ShieldCheck,
  Download,
  Calendar,
  User,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatDate } from '../../utils/formatters';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recordId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    const matchesRole = roleFilter === 'all' || log.userRole === roleFilter;

    return matchesSearch && matchesModule && matchesRole;
  });

  const exportAuditLogCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Module', 'Action', 'Record ID', 'Description'];
    const rows = filteredLogs.map(l => [
      l.timestamp,
      `"${l.userName}"`,
      l.userRole,
      l.module,
      `"${l.action}"`,
      l.recordId,
      `"${l.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getModuleBadgeColor = (mod: string) => {
    switch (mod) {
      case 'Auth':
      case 'User':
        return 'bg-[#E8F0EC] text-[#1B4D3E] border-[#A7D0C0]';
      case 'Job':
        return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
      case 'Inventory':
      case 'Purchase':
        return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
      case 'Invoice':
      case 'Payment':
        return 'bg-[#F0FDF4] text-[#15803D] border-[#BBF7D0]';
      case 'Settings':
        return 'bg-[#F3E8FF] text-[#7E22CE] border-[#E9D5FF]';
      default:
        return 'bg-[#F5F5F3] text-[#6B706D] border-[#DCDDD9]';
    }
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#202321]">
              System Audit Logs & Traceability
            </h1>
            <span className="rounded bg-[#E8F0EC] px-2 py-0.5 text-[10px] font-bold text-[#1B4D3E] uppercase tracking-wide">
              Tamper-Evident Ledger
            </span>
          </div>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Immutable chronological record of logins, repair job card updates, inventory movements, purchases, and settings changes.
          </p>
        </div>

        <button
          onClick={exportAuditLogCSV}
          className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
        >
          <Download className="h-3.5 w-3.5" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 rounded border border-[#DCDDD9] bg-white p-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
          <input
            type="text"
            placeholder="Search action, description, record ID or user..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded border border-[#DCDDD9] bg-white pl-9 pr-3 py-1.5 text-xs text-[#202321] placeholder-[#6B706D] focus:border-[#1B4D3E] focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
          >
            <option value="all">All Modules</option>
            <option value="Auth">Auth & Sessions</option>
            <option value="User">User Accounts</option>
            <option value="Job">Repair Jobs</option>
            <option value="Inventory">Inventory & Parts</option>
            <option value="Purchase">Stock Purchases</option>
            <option value="Invoice">Invoices & POS</option>
            <option value="Payment">Payments</option>
            <option value="Settings">Settings & Backup</option>
          </select>

          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#202321]">
            <thead className="border-b border-[#DCDDD9] bg-[#F5F5F3] font-semibold text-[#6B706D]">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">Timestamp</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Record Ref</th>
                <th className="py-2.5 px-3">Description & State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9]">
              {filteredLogs.length > 0 ? (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#F5F5F3] transition-colors">
                    <td className="py-2 px-3 whitespace-nowrap font-mono text-[11px] text-[#6B706D]">
                      {formatDate(log.timestamp)}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[#202321]">{log.userName}</span>
                        <span className="rounded bg-[#F5F5F3] border border-[#DCDDD9] px-1.5 py-0.2 text-[10px] uppercase font-bold text-[#6B706D]">
                          {log.userRole}
                        </span>
                      </div>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap">
                      <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${getModuleBadgeColor(log.module)}`}>
                        {log.module}
                      </span>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap font-medium text-[#202321]">
                      {log.action}
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap font-mono text-[11px] text-[#6B706D]">
                      {log.recordId}
                    </td>
                    <td className="py-2 px-3 text-[#202321] max-w-md">
                      {log.description}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#6B706D]">
                    No audit records match the selected filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#DCDDD9] bg-[#F5F5F3] px-3 py-2 text-[11px] text-[#6B706D] flex justify-between items-center">
          <span>Showing {filteredLogs.length} of {auditLogs.length} total audit entries</span>
          <span>Security Policy: Never overwrite audit history</span>
        </div>
      </div>
    </div>
  );
};
