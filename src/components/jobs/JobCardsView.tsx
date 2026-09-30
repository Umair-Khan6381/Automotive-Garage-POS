import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  CheckCircle,
  Clock,
  Car,
  User,
  Trash2,
  Edit2,
  ArrowRight,
  Receipt,
  AlertTriangle,
  HardHat,
  Package,
  Camera,
  Image,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { JobCard, JobStatus, LabourAssignment, JobPartItem } from '../../types';
import { formatPKR, formatDate } from '../../utils/formatters';

export const JobCardsView: React.FC = () => {
  const {
    jobCards,
    customers,
    vehicles,
    products,
    labourWorkers,
    createJobCard,
    updateJobCard,
    updateJobStatus,
    deleteJobCard,
    setActiveView,
    setSelectedJobId
  } = useShop();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobCard | null>(null);

  // Form State
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formVehicleId, setFormVehicleId] = useState('');
  const [formMileage, setFormMileage] = useState(50000);
  const [formComplaint, setFormComplaint] = useState('');
  const [formInspectionNotes, setFormInspectionNotes] = useState('');
  const [formEstimatedCost, setFormEstimatedCost] = useState(5000);
  const [formStatus, setFormStatus] = useState<JobStatus>('waiting');

  // Assigned Labour inside modal
  const [modalLabour, setModalLabour] = useState<LabourAssignment[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [workerDesc, setWorkerDesc] = useState('');
  const [workerCharge, setWorkerCharge] = useState(1500);
  const [workerCost, setWorkerCost] = useState(1000);

  // Parts inside modal
  const [modalParts, setModalParts] = useState<JobPartItem[]>([]);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [partQty, setPartQty] = useState(1);

  // Photos attached to Job (Brake pads, engine bay, damages)
  const [modalPhotos, setModalPhotos] = useState<string[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        if (dataUrl) {
          setModalPhotos(prev => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openCreateModal = () => {
    setEditingJob(null);
    setFormCustomerId(customers[0]?.id || '');
    setFormVehicleId(vehicles.find(v => v.customerId === customers[0]?.id)?.id || vehicles[0]?.id || '');
    setFormMileage(vehicles[0]?.mileage || 50000);
    setFormComplaint('');
    setFormInspectionNotes('');
    setFormEstimatedCost(5000);
    setFormStatus('waiting');
    setModalLabour([]);
    setModalParts([]);
    setModalPhotos([]);
    setIsModalOpen(true);
  };

  const openEditModal = (job: JobCard) => {
    setEditingJob(job);
    setFormCustomerId(job.customerId);
    setFormVehicleId(job.vehicleId);
    setFormMileage(job.mileage);
    setFormComplaint(job.complaint);
    setFormInspectionNotes(job.inspectionNotes || '');
    setFormEstimatedCost(job.estimatedCost);
    setFormStatus(job.status);
    setModalLabour([...job.assignedLabour]);
    setModalParts([...job.partsUsed]);
    setModalPhotos(job.photos || []);
    setIsModalOpen(true);
  };

  const handleAddLabourToJob = () => {
    if (!selectedWorkerId) return;
    const worker = labourWorkers.find(w => w.id === selectedWorkerId);
    if (!worker) return;

    const assignment: LabourAssignment = {
      id: `la-${Date.now()}`,
      labourId: worker.id,
      labourName: worker.name,
      rateType: 'fixed',
      rate: workerCharge,
      units: 1,
      costToShop: workerCost,
      customerCharge: workerCharge,
      notes: workerDesc || worker.role
    };

    setModalLabour(prev => [...prev, assignment]);
    setWorkerDesc('');
  };

  const handleAddPartToJob = () => {
    if (!selectedPartId || partQty <= 0) return;
    const prod = products.find(p => p.id === selectedPartId);
    if (!prod) return;

    const item: JobPartItem = {
      id: `pi-${Date.now()}`,
      productId: prod.id,
      productName: prod.name,
      sku: prod.sku,
      quantity: partQty,
      unitCost: prod.purchasePrice,
      unitPrice: prod.sellingPrice,
      totalCost: prod.purchasePrice * partQty,
      totalPrice: prod.sellingPrice * partQty,
      profit: (prod.sellingPrice - prod.purchasePrice) * partQty
    };

    setModalParts(prev => [...prev, item]);
    setPartQty(1);
  };

  const handleSaveJob = (e: React.FormEvent) => {
    e.preventDefault();

    const partsTotal = modalParts.reduce((a, b) => a + b.totalPrice, 0);
    const labourTotal = modalLabour.reduce((a, b) => a + b.customerCharge * b.units, 0);
    const calculatedFinalCost = partsTotal + labourTotal > 0 ? partsTotal + labourTotal : formEstimatedCost;

    if (editingJob) {
      updateJobCard(editingJob.id, {
        customerId: formCustomerId,
        vehicleId: formVehicleId,
        mileage: formMileage,
        complaint: formComplaint,
        inspectionNotes: formInspectionNotes,
        assignedLabour: modalLabour,
        partsUsed: modalParts,
        photos: modalPhotos,
        estimatedCost: formEstimatedCost,
        finalCost: calculatedFinalCost,
        status: formStatus
      });
    } else {
      const jobNum = `JC-2026-${(jobCards.length + 1).toString().padStart(3, '0')}`;
      createJobCard({
        jobNumber: jobNum,
        customerId: formCustomerId,
        vehicleId: formVehicleId,
        date: new Date().toISOString().slice(0, 10),
        mileage: formMileage,
        complaint: formComplaint,
        inspectionNotes: formInspectionNotes,
        assignedLabour: modalLabour,
        partsUsed: modalParts,
        additionalServices: [],
        photos: modalPhotos,
        estimatedCost: formEstimatedCost,
        finalCost: calculatedFinalCost,
        status: formStatus
      });
    }

    setIsModalOpen(false);
  };

  // Filtered Jobs
  const filteredJobs = jobCards.filter(job => {
    const veh = vehicles.find(v => v.id === job.vehicleId);
    const cust = customers.find(c => c.id === job.customerId);
    const matchSearch =
      job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.complaint.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veh?.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      veh?.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust?.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: JobStatus) => {
    switch (status) {
      case 'in_progress':
        return 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]';
      case 'inspection':
        return 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]';
      case 'waiting_for_parts':
        return 'bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]';
      case 'completed':
        return 'bg-[#DCFCE7] text-[#15803D] border-[#BBF7D0]';
      case 'delivered':
        return 'bg-[#E8F0EC] text-[#1B4D3E] border-[#A7D7C5]';
      case 'cancelled':
        return 'bg-[#F5F5F3] text-[#6B706D] border-[#DCDDD9]';
      default:
        return 'bg-[#F5F5F3] text-[#6B706D] border-[#DCDDD9]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#202321]">
            Repair Job Cards & Work Orders
          </h1>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Floor intake, diagnostic logs, parts & technician charges ledger
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Job Card</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
          <input
            type="text"
            placeholder="Search job #, plate (LEA-19), customer..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full rounded border border-[#DCDDD9] bg-white pl-8 pr-3 py-1.5 text-xs text-[#202321] placeholder-[#6B706D] focus:border-[#1B4D3E] focus:outline-none"
          />
        </div>

        {/* Clean Segmented Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto p-1 bg-white border border-[#DCDDD9] rounded">
          {['all', 'waiting', 'inspection', 'in_progress', 'completed', 'delivered'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-[#1B4D3E] text-white font-semibold'
                  : 'text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards Table */}
      <div className="rounded border border-[#DCDDD9] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#DCDDD9] bg-[#FAFAF9] text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-2.5">Job Number</th>
                <th className="px-3 py-2.5">Vehicle Plate</th>
                <th className="px-3 py-2.5">Customer</th>
                <th className="px-3 py-2.5">Complaint / Symptoms</th>
                <th className="px-3 py-2.5">Technician</th>
                <th className="px-3 py-2.5 text-right">Estimate / Final</th>
                <th className="px-3 py-2.5 text-center">Status</th>
                <th className="px-3.5 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCDDD9]">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#6B706D]">
                    No job cards found matching current criteria.
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => {
                  const veh = vehicles.find(v => v.id === job.vehicleId);
                  const cust = customers.find(c => c.id === job.customerId);
                  const assignedTechs = job.assignedLabour.map(l => l.labourName).join(', ');

                  return (
                    <tr key={job.id} className="hover:bg-[#F5F5F3] transition-colors">
                      <td className="px-3.5 py-2.5 font-mono font-bold text-[#1B4D3E]">
                        {job.jobNumber}
                        <div className="flex items-center gap-1.5 text-[10px] text-[#6B706D] font-normal font-sans">
                          <span>{formatDate(job.date)}</span>
                          {job.photos && job.photos.length > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[#1B4D3E] font-medium" title={`${job.photos.length} inspection photos attached`}>
                              <Camera className="h-3 w-3" />
                              <span>{job.photos.length}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-3 py-2.5">
                        <span className="font-mono text-xs font-semibold bg-[#E8F0EC] text-[#1B4D3E] px-1.5 py-0.5 rounded">
                          {veh?.registrationNumber}
                        </span>
                        <div className="text-[11px] text-[#6B706D] mt-0.5">
                          {veh?.make} {veh?.model}
                        </div>
                      </td>

                      <td className="px-3 py-2.5">
                        <div className="font-medium text-[#202321]">{cust?.fullName}</div>
                        <div className="text-[11px] text-[#6B706D] font-mono">{cust?.phone}</div>
                      </td>

                      <td className="px-3 py-2.5 max-w-xs">
                        <div className="truncate text-[#202321]">{job.complaint}</div>
                        <div className="text-[10px] text-[#6B706D]">
                          {job.partsUsed.length} parts · {job.mileage.toLocaleString()} km
                        </div>
                      </td>

                      <td className="px-3 py-2.5 text-[#6B706D]">
                        {assignedTechs || 'Unassigned'}
                      </td>

                      <td className="px-3 py-2.5 text-right font-mono font-bold text-[#202321] tabular-nums">
                        {formatPKR(job.finalCost || job.estimatedCost)}
                      </td>

                      <td className="px-3 py-2.5 text-center">
                        <select
                          value={job.status}
                          onChange={e => updateJobStatus(job.id, e.target.value as JobStatus)}
                          className={`rounded border text-[11px] font-semibold px-2 py-0.5 focus:outline-none ${getStatusBadge(job.status)}`}
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

                      <td className="px-3.5 py-2.5 text-right space-x-1.5 shrink-0">
                        <button
                          onClick={() => {
                            setActiveView('pos');
                          }}
                          title="Generate POS Invoice"
                          className="p-1 rounded border border-[#DCDDD9] bg-white text-[#1B4D3E] hover:bg-[#E8F0EC]"
                        >
                          <Receipt className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => openEditModal(job)}
                          title="Edit Job Card"
                          className="p-1 rounded border border-[#DCDDD9] bg-white text-[#6B706D] hover:text-[#202321] hover:bg-[#F5F5F3]"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete job card ${job.jobNumber}?`)) {
                              deleteJobCard(job.id);
                            }
                          }}
                          title="Delete Job"
                          className="p-1 rounded border border-[#DCDDD9] bg-white text-[#6B706D] hover:text-[#DC2626] hover:bg-[#FEE2E2]"
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

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/40 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded border border-[#DCDDD9] bg-white p-4 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#202321]">
                {editingJob ? `Edit Job Card (${editingJob.jobNumber})` : 'New Repair Job Card'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#6B706D] hover:text-[#202321]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Customer */}
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Customer *</label>
                  <select
                    value={formCustomerId}
                    onChange={e => {
                      setFormCustomerId(e.target.value);
                      const matchingVeh = vehicles.find(v => v.customerId === e.target.value);
                      if (matchingVeh) setFormVehicleId(matchingVeh.id);
                    }}
                    required
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehicle */}
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Vehicle *</label>
                  <select
                    value={formVehicleId}
                    onChange={e => setFormVehicleId(e.target.value)}
                    required
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                  >
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} — {v.make} {v.model}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mileage */}
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Odometer (km)</label>
                  <input
                    type="number"
                    value={formMileage}
                    onChange={e => setFormMileage(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as JobStatus)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  >
                    <option value="waiting">Waiting</option>
                    <option value="inspection">Inspection</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_for_parts">Waiting for Parts</option>
                    <option value="completed">Completed</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Complaint */}
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Customer Complaint / Symptoms *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Squeaking noise from front wheels during braking at low speeds"
                  value={formComplaint}
                  onChange={e => setFormComplaint(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              {/* Inspection notes */}
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Technician Diagnostic Findings</label>
                <input
                  type="text"
                  placeholder="e.g. Front brake pads worn down to 2mm, rotors scored"
                  value={formInspectionNotes}
                  onChange={e => setFormInspectionNotes(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              {/* Parts Section */}
              <div className="border border-[#DCDDD9] rounded p-2.5 bg-[#FAFAF9] space-y-2">
                <div className="font-semibold text-[#202321] text-[11px] uppercase tracking-wider">
                  Parts Allocated to Job ({modalParts.length})
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedPartId}
                    onChange={e => setSelectedPartId(e.target.value)}
                    className="flex-1 rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs"
                  >
                    <option value="">-- Select Product Part --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatPKR(p.sellingPrice)}) - {p.currentQuantity} in stock
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={partQty}
                    onChange={e => setPartQty(Number(e.target.value))}
                    className="w-16 rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddPartToJob}
                    className="rounded border border-[#DCDDD9] bg-white px-2.5 py-1 text-xs font-semibold text-[#1B4D3E] hover:bg-[#E8F0EC]"
                  >
                    + Add
                  </button>
                </div>

                {modalParts.length > 0 && (
                  <div className="divide-y divide-[#DCDDD9] bg-white rounded border border-[#DCDDD9] text-[11px]">
                    {modalParts.map((p, idx) => (
                      <div key={idx} className="p-1.5 flex justify-between items-center">
                        <span>{p.quantity}x {p.productName}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{formatPKR(p.totalPrice)}</span>
                          <button
                            type="button"
                            onClick={() => setModalParts(modalParts.filter((_, i) => i !== idx))}
                            className="text-[#DC2626]"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Labour Section */}
              <div className="border border-[#DCDDD9] rounded p-2.5 bg-[#FAFAF9] space-y-2">
                <div className="font-semibold text-[#202321] text-[11px] uppercase tracking-wider">
                  Labour / Mechanics Assigned ({modalLabour.length})
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={selectedWorkerId}
                    onChange={e => setSelectedWorkerId(e.target.value)}
                    className="rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs"
                  >
                    <option value="">-- Choose Mechanic --</option>
                    {labourWorkers.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.role})
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="Work description"
                    value={workerDesc}
                    onChange={e => setWorkerDesc(e.target.value)}
                    className="rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs"
                  />

                  <div className="flex gap-1">
                    <input
                      type="number"
                      placeholder="Charge (PKR)"
                      value={workerCharge}
                      onChange={e => setWorkerCharge(Number(e.target.value))}
                      className="w-full rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleAddLabourToJob}
                      className="rounded border border-[#DCDDD9] bg-white px-2.5 py-1 text-xs font-semibold text-[#1B4D3E] hover:bg-[#E8F0EC]"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {modalLabour.length > 0 && (
                  <div className="divide-y divide-[#DCDDD9] bg-white rounded border border-[#DCDDD9] text-[11px]">
                    {modalLabour.map((l, idx) => (
                      <div key={idx} className="p-1.5 flex justify-between items-center">
                        <span>{l.labourName} · {l.notes}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold">{formatPKR(l.customerCharge)}</span>
                          <button
                            type="button"
                            onClick={() => setModalLabour(modalLabour.filter((_, i) => i !== idx))}
                            className="text-[#DC2626]"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Photos & Damage Attachments (Section 49) */}
              <div className="border border-[#DCDDD9] rounded p-2.5 bg-[#FAFAF9] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-[#202321] text-[11px] uppercase tracking-wider">
                    <Camera className="h-3.5 w-3.5 text-[#1B4D3E]" />
                    <span>Inspection Photos & Damaged Parts ({modalPhotos.length})</span>
                  </div>
                  <label className="cursor-pointer inline-flex items-center gap-1 rounded border border-[#DCDDD9] bg-white px-2 py-1 text-[11px] font-semibold text-[#1B4D3E] hover:bg-[#E8F0EC] transition-colors">
                    <Camera className="h-3 w-3" />
                    <span>Take / Attach Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {modalPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1">
                    {modalPhotos.map((photo, pIdx) => (
                      <div key={pIdx} className="relative group rounded border border-[#DCDDD9] bg-white p-1">
                        <img
                          src={photo}
                          alt={`Job attachment ${pIdx + 1}`}
                          className="h-16 w-full object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setModalPhotos(modalPhotos.filter((_, idx) => idx !== pIdx))}
                          className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-white text-[10px] shadow-xs"
                          title="Remove photo"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#6B706D] italic">
                    Attach inspection photos (e.g. worn brake pads, engine bay, chassis damage, replaced filters).
                  </p>
                )}
              </div>

              {/* Estimate Cost fallback */}
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Estimated Repair Cost (PKR)
                </label>
                <input
                  type="number"
                  value={formEstimatedCost}
                  onChange={e => setFormEstimatedCost(Number(e.target.value))}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#6B706D] hover:text-[#202321]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32]"
                >
                  {editingJob ? 'Save Changes' : 'Create Job Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
