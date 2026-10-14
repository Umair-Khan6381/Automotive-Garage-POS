import React, { useState } from 'react';
import {
  Wrench,
  Car,
  Clock,
  Droplet,
  History,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  User,
  DollarSign,
  Calendar,
  FileText,
  Printer,
  ChevronRight,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { JobCard, JobStatus } from '../../types';
import { formatAED, formatDate } from '../../utils/formatters';
import { JobCardsView } from '../jobs/JobCardsView';
import { VehiclesView } from '../vehicles/VehiclesView';
import { OilChangesView } from '../oil/OilChangesView';
import { InvoiceDetailModal } from '../invoices/InvoiceDetailModal';

export const WorkshopView: React.FC = () => {
  const {
    jobCards,
    customers,
    vehicles,
    invoices,
    labourWorkers,
    updateJobStatus,
    deleteJobCard,
    setActiveView
  } = useShop();

  const [activeTab, setActiveTab] = useState<'jobs' | 'job_cards' | 'vehicles' | 'service_history' | 'oil_changes'>('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Tab counts
  const openJobs = jobCards.filter(j => j.status !== 'completed' && j.status !== 'delivered' && j.status !== 'cancelled');
  const pendingInspectionCount = jobCards.filter(j => j.status === 'inspection' || j.status === 'waiting').length;
  const inProgressCount = jobCards.filter(j => j.status === 'in_progress').length;
  const waitingPartsCount = jobCards.filter(j => j.status === 'waiting_for_parts').length;
  const readyDeliveredCount = jobCards.filter(j => j.status === 'completed' || j.status === 'delivered').length;

  // Filtered Jobs
  const filteredJobs = jobCards.filter(job => {
    const cust = customers.find(c => c.id === job.customerId);
    const veh = vehicles.find(v => v.id === job.vehicleId);
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      job.jobNumber.toLowerCase().includes(search) ||
      (cust && cust.fullName.toLowerCase().includes(search)) ||
      (veh && (veh.registrationNumber.toLowerCase().includes(search) || veh.model.toLowerCase().includes(search)));

    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#202321]">
            Automotive Workshop & Technical Floor
          </h1>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Operational bay work orders, vehicle check-ins, service histories, and technician allocations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('job_cards');
            }}
            className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Job Card</span>
          </button>
        </div>
      </div>

      {/* Workshop Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#DCDDD9] overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'jobs'
              ? 'border-[#1B4D3E] text-[#1B4D3E]'
              : 'border-transparent text-[#6B706D] hover:text-[#202321]'
          }`}
        >
          <Wrench className="h-3.5 w-3.5" />
          <span>Active Jobs Floor ({openJobs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('job_cards')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'job_cards'
              ? 'border-[#1B4D3E] text-[#1B4D3E]'
              : 'border-transparent text-[#6B706D] hover:text-[#202321]'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Work Order Cards</span>
        </button>

        <button
          onClick={() => setActiveTab('vehicles')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'vehicles'
              ? 'border-[#1B4D3E] text-[#1B4D3E]'
              : 'border-transparent text-[#6B706D] hover:text-[#202321]'
          }`}
        >
          <Car className="h-3.5 w-3.5" />
          <span>Vehicle Registry & Plates ({vehicles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('oil_changes')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-semibold transition-colors whitespace-nowrap ${
            activeTab === 'oil_changes'
              ? 'border-[#1B4D3E] text-[#1B4D3E]'
              : 'border-transparent text-[#6B706D] hover:text-[#202321]'
          }`}
        >
          <Droplet className="h-3.5 w-3.5" />
          <span>Oil & Fluid Services</span>
        </button>
      </div>

      {/* Render Subsections */}
      {activeTab === 'jobs' && (
        <div className="space-y-4">
          {/* Status Ribbon */}
          <div className="rounded border border-[#DCDDD9] bg-white divide-y sm:divide-y-0 sm:divide-x divide-[#DCDDD9] grid grid-cols-2 sm:grid-cols-4">
            <div className="p-3">
              <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                Inspection & Waiting
              </div>
              <div className="mt-1 text-lg font-bold font-mono text-[#B45309]">
                {pendingInspectionCount}
              </div>
              <div className="text-[10px] text-[#6B706D] mt-0.5">Awaiting bay allocation</div>
            </div>

            <div className="p-3">
              <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                In Progress
              </div>
              <div className="mt-1 text-lg font-bold font-mono text-[#1B4D3E]">
                {inProgressCount}
              </div>
              <div className="text-[10px] text-[#6B706D] mt-0.5">Under technician repair</div>
            </div>

            <div className="p-3">
              <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                Waiting for Parts
              </div>
              <div className="mt-1 text-lg font-bold font-mono text-[#DC2626]">
                {waitingPartsCount}
              </div>
              <div className="text-[10px] text-[#6B706D] mt-0.5">PO / supplier delivery pending</div>
            </div>

            <div className="p-3">
              <div className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                Completed & Delivered
              </div>
              <div className="mt-1 text-lg font-bold font-mono text-[#15803D]">
                {readyDeliveredCount}
              </div>
              <div className="text-[10px] text-[#6B706D] mt-0.5">Quality tested & released</div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
              <input
                type="text"
                placeholder="Search job #, customer, plate, model..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded border border-[#DCDDD9] bg-white pl-8 pr-3 py-1.5 text-xs text-[#202321] placeholder-[#6B706D] focus:border-[#1B4D3E] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-white border border-[#DCDDD9] rounded text-xs">
              {[
                { id: 'all', label: 'All Jobs' },
                { id: 'waiting', label: 'Waiting' },
                { id: 'inspection', label: 'Inspection' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'waiting_for_parts', label: 'Waiting Parts' },
                { id: 'completed', label: 'Completed' },
                { id: 'delivered', label: 'Delivered' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setStatusFilter(st.id)}
                  className={`rounded px-2.5 py-1 font-medium transition-colors ${
                    statusFilter === st.id
                      ? 'bg-[#1B4D3E] text-white font-semibold'
                      : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table-based Job List (Section 9 Specification) */}
          <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                  <tr>
                    <th className="px-3.5 py-2.5">Job #</th>
                    <th className="px-3 py-2.5">Date</th>
                    <th className="px-3 py-2.5">Customer</th>
                    <th className="px-3 py-2.5">Vehicle</th>
                    <th className="px-3 py-2.5">Registration</th>
                    <th className="px-3 py-2.5">Technician</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                    <th className="px-3 py-2.5 text-right">Parts Cost</th>
                    <th className="px-3 py-2.5 text-right">Labour</th>
                    <th className="px-3 py-2.5 text-right">Total (AED)</th>
                    <th className="px-3 py-2.5 text-center">Payment</th>
                    <th className="px-3.5 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCDDD9]">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-xs text-[#6B706D]">
                        No repair jobs found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map(job => {
                      const cust = customers.find(c => c.id === job.customerId);
                      const veh = vehicles.find(v => v.id === job.vehicleId);
                      const assignedNames = job.assignedLabour.map(l => l.labourName).join(', ') || 'Unassigned';

                      const partsCostTotal = job.partsUsed.reduce((acc, p) => acc + (p.totalCost || (p.unitCost * p.quantity)), 0);
                      const labourChargeTotal = job.assignedLabour.reduce((acc, l) => acc + l.customerCharge, 0);
                      const jobTotal = job.finalCost || job.estimatedCost;

                      // Check if billed in an invoice
                      const relatedInvoice = invoices.find(i => i.jobCardId === job.id);

                      return (
                        <tr key={job.id} className="hover:bg-[#F5F5F3] transition-colors">
                          <td className="px-3.5 py-2.5 font-mono font-bold text-[#1B4D3E]">
                            {job.jobNumber}
                          </td>

                          <td className="px-3 py-2.5 font-mono text-[#6B706D] whitespace-nowrap">
                            {formatDate(job.createdDate)}
                          </td>

                          <td className="px-3 py-2.5">
                            <div className="font-semibold text-[#202321]">{cust?.fullName || 'Walk-in'}</div>
                            <div className="text-[10px] text-[#6B706D] font-mono">{cust?.phone}</div>
                          </td>

                          <td className="px-3 py-2.5 text-[#202321]">
                            {veh ? `${veh.make} ${veh.model}` : '—'}
                          </td>

                          <td className="px-3 py-2.5 font-mono">
                            {veh ? (
                              <span className="bg-[#E8F0EC] text-[#1B4D3E] px-1.5 py-0.5 rounded font-bold">
                                {veh.registrationNumber}
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>

                          <td className="px-3 py-2.5 text-[#6B706D] max-w-[130px] truncate" title={assignedNames}>
                            {assignedNames}
                          </td>

                          <td className="px-3 py-2.5 text-center">
                            <select
                              value={job.status}
                              onChange={e => updateJobStatus(job.id, e.target.value as JobStatus)}
                              className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${
                                job.status === 'completed' || job.status === 'delivered'
                                  ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                                  : job.status === 'in_progress'
                                  ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                                  : job.status === 'waiting_for_parts'
                                  ? 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                                  : 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                              }`}
                            >
                              <option value="waiting">Waiting</option>
                              <option value="inspection">Inspection</option>
                              <option value="in_progress">In Progress</option>
                              <option value="waiting_for_parts">Waiting Parts</option>
                              <option value="completed">Completed</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>

                          <td className="px-3 py-2.5 text-right font-mono text-[#6B706D] tabular-nums">
                            {formatAED(partsCostTotal)}
                          </td>

                          <td className="px-3 py-2.5 text-right font-mono text-[#202321] tabular-nums">
                            {formatAED(labourChargeTotal)}
                          </td>

                          <td className="px-3 py-2.5 text-right font-mono font-bold text-[#1B4D3E] tabular-nums">
                            {formatAED(jobTotal)}
                          </td>

                          <td className="px-3 py-2.5 text-center">
                            {relatedInvoice ? (
                              <button
                                onClick={() => setSelectedInvoiceId(relatedInvoice.id)}
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                                  relatedInvoice.paymentStatus === 'Paid'
                                    ? 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]'
                                    : 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                                }`}
                                title={`Invoice ${relatedInvoice.invoiceNumber}`}
                              >
                                {relatedInvoice.paymentStatus}
                              </button>
                            ) : (
                              <span className="text-[10px] text-[#9CA3AF] font-mono">Unbilled</span>
                            )}
                          </td>

                          <td className="px-3.5 py-2.5 text-right space-x-1.5 shrink-0">
                            {!relatedInvoice && (
                              <button
                                onClick={() => setActiveView('pos')}
                                title="Generate POS Bill"
                                className="p-1 rounded border border-[#A7D0C0] bg-[#E8F0EC] text-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white transition-colors cursor-pointer"
                              >
                                <Receipt className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(`Remove job card ${job.jobNumber}?`)) {
                                  deleteJobCard(job.id);
                                }
                              }}
                              title="Delete Job"
                              className="p-1 rounded border border-[#DCDDD9] bg-white text-[#6B706D] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'job_cards' && <JobCardsView />}

      {activeTab === 'vehicles' && <VehiclesView />}

      {activeTab === 'oil_changes' && <OilChangesView />}

      {/* Invoice Viewer Modal */}
      {selectedInvoiceId && (
        <InvoiceDetailModal
          invoiceId={selectedInvoiceId}
          onClose={() => setSelectedInvoiceId(null)}
        />
      )}
    </div>
  );
};
