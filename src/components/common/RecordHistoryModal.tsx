import React from 'react';
import {
  History,
  X,
  User,
  Clock,
  Calendar,
  ArrowRight,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { RecordChangeEntry } from '../../types';
import { formatDateTime, formatDate, formatTime } from '../../utils/formatters';

interface RecordHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordTitle: string;
  recordReference: string;
  recordType: RecordChangeEntry['recordType'];
  recordId: string;
  createdByName?: string;
  createdAt?: string;
  updatedByName?: string;
  updatedAt?: string;
  historyEntries: RecordChangeEntry[];
}

export const RecordHistoryModal: React.FC<RecordHistoryModalProps> = ({
  isOpen,
  onClose,
  recordTitle,
  recordReference,
  recordType,
  recordId,
  createdByName,
  createdAt,
  updatedByName,
  updatedAt,
  historyEntries
}) => {
  if (!isOpen) return null;

  // Filter history entries strictly for this record ID or reference
  const entries = historyEntries
    .filter(e => e.recordId === recordId || (recordReference && e.recordReference === recordReference))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'created':
        return 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]';
      case 'edited':
        return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
      case 'printed':
        return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
      case 'payment recorded':
        return 'bg-[#E0E7FF] text-[#4338CA] border-[#C7D2FE]';
      case 'voided':
        return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
      default:
        return 'bg-[#F5F5F3] text-[#6B706D] border-[#DCDDD9]';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/50 p-4 backdrop-blur-2xs">
      <div className="w-full max-w-2xl rounded-lg border border-[#DCDDD9] bg-white p-5 shadow-2xl max-h-[90vh] flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#E8F0EC] text-[#1B4D3E]">
              <History className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#202321]">
                  Activity & Change History
                </h3>
                <span className="rounded bg-[#F5F5F3] px-2 py-0.5 text-[11px] font-mono font-semibold text-[#6B706D] border border-[#DCDDD9]">
                  {recordType}
                </span>
              </div>
              <p className="text-xs text-[#6B706D] font-mono mt-0.5">
                {recordReference || recordTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Audit Meta Summary Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded border border-[#DCDDD9] bg-[#FAFAF9] text-xs mb-4">
          <div className="flex items-start gap-2">
            <div className="p-1 rounded bg-white border border-[#DCDDD9] text-[#1B4D3E] mt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[#6B706D] uppercase tracking-wider block">
                Created By
              </span>
              <span className="font-bold text-[#202321] text-xs">
                {createdByName || 'Ali (System)'}
              </span>
              <span className="text-[11px] text-[#6B706D] block font-mono">
                {createdAt ? formatDateTime(createdAt) : '01-Oct-2026 09:30 AM'}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="p-1 rounded bg-white border border-[#DCDDD9] text-[#B45309] mt-0.5">
              <History className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-[#6B706D] uppercase tracking-wider block">
                Last Modified By
              </span>
              <span className="font-bold text-[#202321] text-xs">
                {updatedByName || createdByName || 'Not Modified'}
              </span>
              <span className="text-[11px] text-[#6B706D] block font-mono">
                {updatedAt ? formatDateTime(updatedAt) : (createdAt ? formatDateTime(createdAt) : 'Original State')}
              </span>
            </div>
          </div>
        </div>

        {/* History Timeline */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
          <div className="text-[11px] font-bold text-[#6B706D] uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Tag className="h-3 w-3" />
            <span>Detailed Field Change Log ({entries.length} Events)</span>
          </div>

          {entries.length === 0 ? (
            <div className="p-6 text-center text-[#6B706D] rounded border border-dashed border-[#DCDDD9]">
              <History className="h-8 w-8 mx-auto mb-2 text-[#DCDDD9]" />
              <p className="font-semibold text-xs text-[#202321]">Initial Record Creation</p>
              <p className="text-[11px] mt-0.5">
                Created by <strong>{createdByName || 'System User'}</strong> on {createdAt ? formatDateTime(createdAt) : 'record date'}. No subsequent field edits recorded.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#DCDDD9]">
              {entries.map((entry, index) => (
                <div key={entry.id || index} className="relative">
                  {/* Timeline bullet */}
                  <div className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#1B4D3E] shadow-xs" />

                  <div className="rounded border border-[#DCDDD9] bg-white p-3 shadow-2xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-[#F5F5F3] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#202321] flex items-center gap-1">
                          <User className="h-3 w-3 text-[#1B4D3E]" />
                          <span>{entry.userName}</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F5F5F3] text-[#6B706D] uppercase font-semibold">
                          {entry.userRole}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getActionBadgeColor(entry.action)}`}>
                          {entry.action}
                        </span>
                      </div>

                      <span className="text-[11px] font-mono text-[#6B706D] flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#6B706D]" />
                        <span>{formatDateTime(entry.timestamp)}</span>
                      </span>
                    </div>

                    <p className="text-xs text-[#202321] font-medium leading-relaxed">
                      {entry.description}
                    </p>

                    {/* Field level diff if present */}
                    {entry.fieldChanged && (
                      <div className="rounded bg-[#FAFAF9] border border-[#DCDDD9] p-2 text-[11px] font-mono">
                        <div className="text-[10px] font-semibold text-[#6B706D] uppercase mb-1">
                          Field Changed: <strong className="text-[#202321]">{entry.fieldChanged}</strong>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="line-through text-[#DC2626] bg-[#FEE2E2] px-1.5 py-0.5 rounded">
                            {entry.oldValue || 'None'}
                          </span>
                          <ArrowRight className="h-3 w-3 text-[#6B706D]" />
                          <span className="text-[#15803D] bg-[#DCFCE7] px-1.5 py-0.5 rounded font-bold">
                            {entry.newValue || 'None'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-[#DCDDD9] mt-3">
          <span className="text-[11px] text-[#6B706D] font-mono">
            Immutable Audit Trail · Local Timezone
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded bg-[#1B4D3E] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
