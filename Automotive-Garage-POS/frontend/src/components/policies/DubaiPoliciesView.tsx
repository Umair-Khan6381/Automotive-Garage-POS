import React, { useState } from 'react';
import {
  Shield,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Printer,
  Scale,
  Car,
  Wrench,
  Building2,
  Receipt,
  Search,
  CheckSquare,
  Square,
  ExternalLink,
  Info,
  Calendar,
  Phone,
  FileCheck,
  Flame,
  Award
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatAED, formatDate } from '../../utils/formatters';
import { printDocument } from '../../utils/printUtils';

type PolicyTab =
  | 'police'
  | 'rta'
  | 'consumer'
  | 'municipality'
  | 'vat'
  | 'printable_agreement';

interface RtaCheckItem {
  id: string;
  category: string;
  item: string;
  criterion: string;
  severity: 'Critical Fail' | 'Standard Fail';
}

const RTA_INSPECTION_ITEMS: RtaCheckItem[] = [
  {
    id: 'rta-1',
    category: 'Braking System',
    item: 'Service Brake Efficiency',
    criterion: 'Total braking force must be ≥ 50% of vehicle gross weight with < 30% axle imbalance.',
    severity: 'Critical Fail'
  },
  {
    id: 'rta-2',
    category: 'Braking System',
    item: 'Parking / Emergency Brake',
    criterion: 'Mechanical or electronic handbrake must hold vehicle firmly with ≥ 16% efficiency.',
    severity: 'Critical Fail'
  },
  {
    id: 'rta-3',
    category: 'Tyres & Wheels (ESMA/MoIAT)',
    item: 'Tyre Age & Manufacturing Date',
    criterion: 'Maximum 5 years from DOT date code (ESMA/GSO 42 UAE standard). Tyres > 5 years are automatic fail.',
    severity: 'Critical Fail'
  },
  {
    id: 'rta-4',
    category: 'Tyres & Wheels (ESMA/MoIAT)',
    item: 'Tread Depth & Condition',
    criterion: 'Minimum remaining tread depth ≥ 1.6 mm across central 3/4. Zero cords, bulges, cuts or uneven wear.',
    severity: 'Critical Fail'
  },
  {
    id: 'rta-5',
    category: 'Chassis & Structure',
    item: 'Underbody Frame & Alignment',
    criterion: 'No structural rust, collision deformation, chassis cracks, or unpermitted cut/weld joints.',
    severity: 'Critical Fail'
  },
  {
    id: 'rta-6',
    category: 'Suspension & Steering',
    item: 'Steering Play & Suspension Bushings',
    criterion: 'Zero free play in tie rod ends, control arm bushings intact, zero oil leaks from shock absorbers.',
    severity: 'Standard Fail'
  },
  {
    id: 'rta-7',
    category: 'Engine & Fluids',
    item: 'Hazardous Fluid Leaks',
    criterion: 'Zero dripping engine oil, automatic transmission fluid, brake fluid, or engine coolant.',
    severity: 'Critical Fail'
  },
  {
    id: 'rta-8',
    category: 'Emissions & Exhaust',
    item: 'Catalytic Converter & Noise',
    criterion: 'Catalytic converter must be installed and functional. Exhaust sound level must be below 95 dB. No visible smoke.',
    severity: 'Critical Fail'
  },
  {
    id: 'rta-9',
    category: 'Visibility & Glass',
    item: 'Windscreen & Window Tinting',
    criterion: 'Wiper swept area free of stone chips/cracks. Window tinting must not exceed legal 50% Dubai Police limit.',
    severity: 'Standard Fail'
  },
  {
    id: 'rta-10',
    category: 'Lighting System',
    item: 'Headlamps Beam & Indicators',
    criterion: 'Accurately aligned headlamp beams, working brake lights, amber turn signals, and hazard lights.',
    severity: 'Standard Fail'
  },
  {
    id: 'rta-11',
    category: 'Safety Restraints',
    item: 'Seatbelts & SRS Airbag System',
    criterion: 'All seatbelts lock smoothly. No persistent SRS airbag warning light illuminated on dashboard cluster.',
    severity: 'Critical Fail'
  },
  {
    id: 'rta-12',
    category: 'Electrical & Horn',
    item: 'Battery Bracket & Audible Horn',
    criterion: 'Battery must be clamped securely with insulated positive terminal. Horn must produce clear audible warning.',
    severity: 'Standard Fail'
  }
];

export const DubaiPoliciesView: React.FC = () => {
  const { settings, currentUser } = useShop();
  const [activeTab, setActiveTab] = useState<PolicyTab>('police');

  // Interactive Police Permit Logger / Quick Verifier
  const [plateInput, setPlateInput] = useState('');
  const [permitInput, setPermitInput] = useState('');
  const [permitNotes, setPermitNotes] = useState('');
  const [verifiedPermits, setVerifiedPermits] = useState<
    Array<{ plate: string; permit: string; date: string; verifiedBy: string; notes?: string }>
  >([
    {
      plate: 'DXB-B-10842',
      permit: 'DP-ACC-2026-88910',
      date: '2026-09-24',
      verifiedBy: 'Umair Ullah (Owner)',
      notes: 'Front bumper & right fender impact certified via Dubai Police App'
    },
    {
      plate: 'DXB-K-94215',
      permit: 'DP-CID-2026-44102',
      date: '2026-09-22',
      verifiedBy: 'Umair Ullah (Owner)',
      notes: 'Rear tailgate dent repair authorized by Dubai Police accident report'
    }
  ]);
  const [permitFeedback, setPermitFeedback] = useState<string | null>(null);

  // Interactive RTA Inspection Checklist State
  const [checkedRtaItems, setCheckedRtaItems] = useState<Record<string, boolean>>({
    'rta-1': true,
    'rta-2': true,
    'rta-3': true,
    'rta-4': true,
    'rta-5': true,
    'rta-7': true,
    'rta-10': true
  });

  const toggleRtaItem = (id: string) => {
    setCheckedRtaItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelectAllRta = (val: boolean) => {
    const updated: Record<string, boolean> = {};
    RTA_INSPECTION_ITEMS.forEach(item => {
      updated[item.id] = val;
    });
    setCheckedRtaItems(updated);
  };

  const rtaPassedCount = Object.values(checkedRtaItems).filter(Boolean).length;
  const rtaTotalCount = RTA_INSPECTION_ITEMS.length;
  const isRtaFullyCompliant = rtaPassedCount === rtaTotalCount;

  const handleAddPermitVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateInput.trim() || !permitInput.trim()) return;

    const newRecord = {
      plate: plateInput.trim().toUpperCase(),
      permit: permitInput.trim().toUpperCase(),
      date: new Date().toISOString().slice(0, 10),
      verifiedBy: currentUser?.name || 'Workshop Supervisor',
      notes: permitNotes.trim() || 'Verified against Dubai Police electronic traffic database'
    };

    setVerifiedPermits([newRecord, ...verifiedPermits]);
    setPlateInput('');
    setPermitInput('');
    setPermitNotes('');
    setPermitFeedback(`Dubai Police Permit #${newRecord.permit} logged for Plate ${newRecord.plate}`);
    setTimeout(() => setPermitFeedback(null), 4000);
  };

  const handlePrintAgreement = () => {
    printDocument({
      title: `Dubai_Workshop_Policies_Agreement_${settings.garageName || settings.shopName}`,
      elementId: 'printable-dubai-agreement',
      onAfterPrint: () => {
        // print done
      }
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Official Header */}
      <div className="rounded-lg border border-[#DCDDD9] bg-white p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded bg-[#1B4D3E] text-white">
                <Shield className="h-4 w-4" />
              </span>
              <h1 className="text-lg font-bold text-[#202321] tracking-tight">
                Dubai Automotive Workshop Regulatory Policies
              </h1>
              <span className="rounded bg-[#E8F0EC] px-2 py-0.5 text-[11px] font-mono font-bold text-[#1B4D3E] border border-[#A7D0C0]">
                DUBAI, UAE
              </span>
            </div>
            <p className="text-xs text-[#6B706D]">
              أنظمة ولوائح كراجات صيانة السيارات في إمارة دبي — Official legal guidelines under Dubai Police,
              Roads & Transport Authority (RTA), UAE Consumer Protection Law (Federal Law No. 15 of 2020),
              Dubai Municipality (DM-EHS), and Federal Tax Authority (FTA).
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActiveTab('printable_agreement');
                setTimeout(() => handlePrintAgreement(), 100);
              }}
              className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#153E32] transition-colors shadow-xs active:scale-95"
            >
              <Printer className="h-4 w-4" />
              <span>Print Dubai Customer Agreement</span>
            </button>
          </div>
        </div>

        {/* Dubai Regulatory Pillars Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-4 border-t border-[#DCDDD9] text-xs">
          <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-2.5">
            <span className="text-[10px] uppercase font-bold text-[#1E3A8A] block">1. Dubai Police CID</span>
            <div className="font-bold text-[#202321] mt-0.5">Accident Permit</div>
            <span className="text-[11px] text-[#6B706D] block mt-0.5">Mandatory for body/dent repair</span>
          </div>

          <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-2.5">
            <span className="text-[10px] uppercase font-bold text-[#B45309] block">2. RTA Standards</span>
            <div className="font-bold text-[#202321] mt-0.5">Testing Checklist</div>
            <span className="text-[11px] text-[#6B706D] block mt-0.5">Tyres ≤ 5 yrs, Brakes ≥ 50%</span>
          </div>

          <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-2.5">
            <span className="text-[10px] uppercase font-bold text-[#15803D] block">3. Consumer Rights</span>
            <div className="font-bold text-[#202321] mt-0.5">90-Day Warranty</div>
            <span className="text-[11px] text-[#6B706D] block mt-0.5">Law 15/2020 & Old parts return</span>
          </div>

          <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-2.5">
            <span className="text-[10px] uppercase font-bold text-[#047857] block">4. Municipality EHS</span>
            <div className="font-bold text-[#202321] mt-0.5">Hazardous Waste</div>
            <span className="text-[11px] text-[#6B706D] block mt-0.5">Zero oil drain & AC gas recovery</span>
          </div>

          <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-2.5">
            <span className="text-[10px] uppercase font-bold text-[#7C3AED] block">5. UAE FTA VAT</span>
            <div className="font-bold text-[#202321] mt-0.5">5% Tax Invoicing</div>
            <span className="text-[11px] text-[#6B706D] block mt-0.5">TRN 100482937400003 Active</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#DCDDD9] bg-white rounded-t-lg px-2 pt-2 gap-1 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('police')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'police'
              ? 'border-[#1B4D3E] text-[#1B4D3E]'
              : 'border-transparent text-[#6B706D] hover:text-[#202321]'
          }`}
        >
          <Shield className="h-3.5 w-3.5 text-[#1E3A8A]" />
          <span>Dubai Police & CID Regulations</span>
        </button>

        <button
          onClick={() => setActiveTab('rta')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'rta'
              ? 'border-[#1B4D3E] text-[#1B4D3E]'
              : 'border-transparent text-[#6B706D] hover:text-[#202321]'
          }`}
        >
          <Car className="h-3.5 w-3.5 text-[#B45309]" />
          <span>RTA Technical Standards & Inspection</span>
          <span className="rounded-full bg-[#E8F0EC] text-[#1B4D3E] text-[10px] px-1.5 py-0.2 font-mono">
            {rtaPassedCount}/{rtaTotalCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('consumer')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'consumer'
              ? 'border-[#1B4D3E] text-[#1B4D3E]'
              : 'border-transparent text-[#6B706D] hover:text-[#202321]'
          }`}
        >
          <Scale className="h-3.5 w-3.5 text-[#15803D]" />
          <span>Consumer Protection & Warranty (DED)</span>
        </button>

        <button
          onClick={() => setActiveTab('municipality')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'municipality'
              ? 'border-[#1B4D3E] text-[#1B4D3E]'
              : 'border-transparent text-[#6B706D] hover:text-[#202321]'
          }`}
        >
          <Building2 className="h-3.5 w-3.5 text-[#047857]" />
          <span>Dubai Municipality EHS & Waste</span>
        </button>

        <button
          onClick={() => setActiveTab('vat')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'vat'
              ? 'border-[#1B4D3E] text-[#1B4D3E]'
              : 'border-transparent text-[#6B706D] hover:text-[#202321]'
          }`}
        >
          <Receipt className="h-3.5 w-3.5 text-[#7C3AED]" />
          <span>UAE FTA 5% VAT Compliance</span>
        </button>

        <button
          onClick={() => setActiveTab('printable_agreement')}
          className={`flex items-center gap-1.5 px-3 py-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'printable_agreement'
              ? 'border-[#1B4D3E] text-[#1B4D3E]'
              : 'border-transparent text-[#6B706D] hover:text-[#202321]'
          }`}
        >
          <Printer className="h-3.5 w-3.5 text-[#202321]" />
          <span>Official Customer Agreement (Bilingual)</span>
        </button>
      </div>

      {/* Tab 1: Dubai Police & CID Regulations */}
      {activeTab === 'police' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#DCDDD9] bg-white p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#DCDDD9] pb-3">
              <Shield className="h-5 w-5 text-[#1E3A8A]" />
              <div>
                <h2 className="font-bold text-sm text-[#202321]">
                  Dubai Police & CID Mandatory Workshop Regulations (لوائح شرطة دبي والتحريات)
                </h2>
                <p className="text-[11px] text-[#6B706D]">
                  Strict regulatory enforcement under Dubai Police Criminal Investigation Department (CID) and UAE Traffic Law.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded border border-[#BFDBFE] bg-[#EFF6FF] p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#1E3A8A]">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-[#2563EB]" />
                  <span>1. Mandatory Accident Repair Permit (تصريح تصليح حادث من شرطة دبي)</span>
                </div>
                <p className="text-[#1E3A8A]/90 leading-relaxed text-[11px]">
                  <strong>STRICT LEGAL CLAUSE:</strong> Under Dubai Police General Headquarters regulations, no auto garage, workshop, or body shop is permitted to receive, panel-beat, weld, straighten, or spray-paint any vehicle with accident or collision damage without an authentic <strong>Dubai Police Accident Report</strong> or electronic <strong>CID Repair Permit</strong> generated through the official <strong>Dubai Police Smart App</strong>.
                </p>
                <div className="rounded bg-white p-2.5 border border-[#BFDBFE] text-[10px] space-y-1 font-mono text-[#1E3A8A]">
                  <div>• Violation Penalty: AED 20,000 fine + vehicle impound + temporary workshop shutdown.</div>
                  <div>• Permit Format: DP-ACC-YYYY-XXXXX or electronic QR code permit.</div>
                  <div>• Technicians must cross-check Chassis VIN on Mulkiya with police clearance.</div>
                </div>
              </div>

              <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#202321]">
                  <FileCheck className="h-4 w-4 shrink-0 text-[#1B4D3E]" />
                  <span>2. Vehicle Mulkiya & Ownership Verification</span>
                </div>
                <p className="text-[#6B706D] leading-relaxed text-[11px]">
                  Before vehicle intake for major engine overhauls, transmission swaps, or electrical retrofits, workshop staff must inspect the customer's <strong>Mulkiya (Vehicle Registration Card)</strong> or Dubai Trade License (for corporate fleet vehicles). The VIN stamped on the dashboard and B-pillar must match the Mulkiya exactly.
                </p>
                <div className="rounded bg-white p-2.5 border border-[#DCDDD9] text-[10px] space-y-1 text-[#6B706D]">
                  <div>• Verify vehicle plate emirate (Dubai, Abu Dhabi, Sharjah, Ajman, RAK, UAQ, Fujairah).</div>
                  <div>• Confirm registration validity; un-registered vehicles cannot be test-driven on public roads.</div>
                </div>
              </div>

              <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#202321]">
                  <Calendar className="h-4 w-4 shrink-0 text-[#B45309]" />
                  <span>3. Abandoned / Unclaimed Vehicle Protocol</span>
                </div>
                <p className="text-[#6B706D] leading-relaxed text-[11px]">
                  When a vehicle has completed repair work and remains unclaimed by the client:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[#6B706D]">
                  <li><strong>Day 1 - 3 (Grace Period):</strong> Free parking for 72 hours following delivery notification.</li>
                  <li><strong>Day 4+ (Storage Fee):</strong> AED 50.00 / day storage charge applied as per garage policy.</li>
                  <li><strong>Day 14 (Written Notice):</strong> Registered SMS/Email notice sent to customer address.</li>
                  <li><strong>Day 60+ (Police Handover):</strong> Formal report submitted to Dubai Police & Dubai Municipality for abandoned vehicle towing & auction procedures.</li>
                </ul>
              </div>

              <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#202321]">
                  <Car className="h-4 w-4 shrink-0 text-[#DC2626]" />
                  <span>4. Illegal Modifications & Tinting Limits</span>
                </div>
                <p className="text-[#6B706D] leading-relaxed text-[11px]">
                  Compliance standards enforced under Dubai Police Traffic Department:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[#6B706D]">
                  <li><strong>Window Tinting:</strong> Strictly maximum 50% darkness. Front windshield tinting is illegal.</li>
                  <li><strong>Engine & Turbo Swaps:</strong> Prohibited without prior RTA Technical Modification Certificate.</li>
                  <li><strong>Exhaust Decat:</strong> Removal of catalytic converters or installation of straight pipes is illegal.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Interactive Police Permit Verifier & Audit Log */}
          <div className="rounded-lg border border-[#DCDDD9] bg-white p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1B4D3E]" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#202321]">
                  Dubai Police Permit Quick Logger & Workshop Intake Verification
                </h3>
              </div>
              <span className="text-[11px] text-[#6B706D]">
                Records saved in Local Audit Trail
              </span>
            </div>

            {permitFeedback && (
              <div className="rounded border border-[#A7D0C0] bg-[#E8F0EC] p-2 text-xs font-semibold text-[#1B4D3E] flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{permitFeedback}</span>
              </div>
            )}

            <form onSubmit={handleAddPermitVerification} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Vehicle Plate # (e.g. DXB-A-12345) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="DXB-C-54321"
                  value={plateInput}
                  onChange={e => setPlateInput(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono uppercase focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Dubai Police Permit / Report Ref *
                </label>
                <input
                  type="text"
                  required
                  placeholder="DP-ACC-2026-9042"
                  value={permitInput}
                  onChange={e => setPermitInput(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 font-mono uppercase focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">
                  Inspection Damage Scope
                </label>
                <input
                  type="text"
                  placeholder="Right door dent & rear quarter panel"
                  value={permitNotes}
                  onChange={e => setPermitNotes(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full rounded bg-[#1B4D3E] px-3 py-1.5 font-bold text-white hover:bg-[#153E32] transition-colors shadow-xs"
                >
                  Verify & Log Permit
                </button>
              </div>
            </form>

            {/* Verified Permits Ledger */}
            <div className="rounded border border-[#DCDDD9] overflow-hidden">
              <div className="bg-[#FAFAF9] px-3 py-2 border-b border-[#DCDDD9] text-[11px] font-bold text-[#6B706D] uppercase">
                Active Verified Dubai Police Permits in Garage
              </div>
              <div className="divide-y divide-[#DCDDD9] text-xs">
                {verifiedPermits.map((item, idx) => (
                  <div key={idx} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FAFAF9]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#1B4D3E] bg-[#E8F0EC] px-1.5 py-0.5 rounded border border-[#A7D0C0]">
                          {item.plate}
                        </span>
                        <span className="font-mono font-bold text-[#202321]">
                          {item.permit}
                        </span>
                        <span className="rounded bg-[#DCFCE7] text-[#15803D] text-[10px] px-1.5 py-0.2 font-semibold">
                          Permit Authenticated
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B706D]">{item.notes}</p>
                    </div>
                    <div className="text-right text-[11px] text-[#6B706D] font-mono">
                      <div>Logged by: {item.verifiedBy}</div>
                      <div>Date: {item.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: RTA Technical Standards & Inspection Checklist */}
      {activeTab === 'rta' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#DCDDD9] bg-white p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DCDDD9] pb-3">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-[#B45309]" />
                <div>
                  <h2 className="font-bold text-sm text-[#202321]">
                    RTA Vehicle Testing & Passing Standards (معايير فحص وترخيص المركبات - هيئة الطرق والمواصلات)
                  </h2>
                  <p className="text-[11px] text-[#6B706D]">
                    Pre-inspection guidelines matching RTA Tasjeel and Shamil technical testing requirements in Dubai.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSelectAllRta(true)}
                  className="rounded border border-[#DCDDD9] px-2.5 py-1 text-xs font-semibold hover:bg-[#F5F5F3]"
                >
                  Check All
                </button>
                <button
                  onClick={() => handleSelectAllRta(false)}
                  className="rounded border border-[#DCDDD9] px-2.5 py-1 text-xs font-semibold hover:bg-[#F5F5F3]"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Scorecard Strip */}
            <div className={`rounded-lg border p-4 flex items-center justify-between gap-4 text-xs ${
              isRtaFullyCompliant
                ? 'border-[#A7D0C0] bg-[#E8F0EC] text-[#1B4D3E]'
                : 'border-[#FDE68A] bg-[#FEF3C7] text-[#92400E]'
            }`}>
              <div className="flex items-center gap-2">
                {isRtaFullyCompliant ? (
                  <CheckCircle2 className="h-5 w-5 text-[#15803D]" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-[#B45309]" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {isRtaFullyCompliant
                      ? '100% RTA Pre-Inspection Compliant — Guaranteed to Pass Tasjeel / Shamil'
                      : `Pre-Inspection Incomplete: ${rtaPassedCount} of ${rtaTotalCount} RTA Criteria Passed`}
                  </div>
                  <p className="text-[11px] mt-0.5 opacity-90">
                    Vehicles meeting all criteria are certified ready for annual Dubai vehicle registration renewal.
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-mono text-xl font-black">
                  {Math.round((rtaPassedCount / rtaTotalCount) * 100)}%
                </div>
                <div className="text-[10px] font-semibold uppercase">Passing Score</div>
              </div>
            </div>

            {/* 12-Point Checklist Table */}
            <div className="rounded border border-[#DCDDD9] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAFAF9] border-b border-[#DCDDD9] text-[10px] font-bold uppercase tracking-wider text-[#6B706D]">
                  <tr>
                    <th className="py-2.5 px-3 w-10 text-center">Status</th>
                    <th className="py-2.5 px-3">System / Component</th>
                    <th className="py-2.5 px-3">RTA Dubai Technical Passing Criterion</th>
                    <th className="py-2.5 px-3 text-center w-28">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCDDD9]">
                  {RTA_INSPECTION_ITEMS.map(item => {
                    const isChecked = !!checkedRtaItems[item.id];
                    return (
                      <tr
                        key={item.id}
                        onClick={() => toggleRtaItem(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isChecked ? 'bg-white hover:bg-[#F5F5F3]' : 'bg-[#FFFBEB]/40 hover:bg-[#FEF3C7]/40'
                        }`}
                      >
                        <td className="py-2.5 px-3 text-center">
                          {isChecked ? (
                            <CheckSquare className="h-4 w-4 text-[#15803D] inline-block" />
                          ) : (
                            <Square className="h-4 w-4 text-[#9CA3AF] inline-block" />
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#202321] block">{item.item}</span>
                          <span className="text-[10px] text-[#6B706D]">{item.category}</span>
                        </td>
                        <td className="py-2.5 px-3 text-[11px] text-[#4B5563] leading-relaxed">
                          {item.criterion}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              item.severity === 'Critical Fail'
                                ? 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA]'
                                : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                            }`}
                          >
                            {item.severity}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: UAE Consumer Protection & Warranty (DED) */}
      {activeTab === 'consumer' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#DCDDD9] bg-white p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#DCDDD9] pb-3">
              <Scale className="h-5 w-5 text-[#15803D]" />
              <div>
                <h2 className="font-bold text-sm text-[#202321]">
                  UAE Consumer Protection Law & Dubai DED Regulations (حماية المستهلك - اقتصادية دبي)
                </h2>
                <p className="text-[11px] text-[#6B706D]">
                  Governed by UAE Federal Law No. 15 of 2020 on Consumer Protection and Dubai Department of Economy & Tourism (DET / CCCP).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#15803D]">
                  <Award className="h-4 w-4" />
                  <span>1. Mandatory Workmanship & Labour Warranty</span>
                </div>
                <p className="text-[#6B706D] leading-relaxed text-[11px]">
                  As per Dubai Consumer Protection standard policies, Umair Auto Care provides a minimum warranty of:
                </p>
                <div className="rounded bg-white p-3 border border-[#DCDDD9] font-mono text-[11px] space-y-1">
                  <div className="font-bold text-[#1B4D3E]">
                    • Mechanical & Electrical Labour: 90 Days or 5,000 Kilometers
                  </div>
                  <div>(Whichever milestone is reached first following vehicle delivery)</div>
                  <div className="text-[10px] text-[#6B706D] mt-1 pt-1 border-t border-[#F5F5F3]">
                    If a repaired fault recurs within the warranty window, the workshop resolves it without additional labour charges.
                  </div>
                </div>
              </div>

              <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#202321]">
                  <Wrench className="h-4 w-4 text-[#1B4D3E]" />
                  <span>2. Spare Parts Warranty & Transparency</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-[#6B706D]">
                  <li>
                    <strong>• Genuine OEM Parts:</strong> Carry manufacturer warranty (minimum 6 months to 1 year as specified by authorized UAE distributor).
                  </li>
                  <li>
                    <strong>• Tier-1 Aftermarket Parts:</strong> Warranted according to manufacturer terms stated on the official tax invoice.
                  </li>
                  <li>
                    <strong>• Used / Salvage Parts:</strong> Strictly fitted only upon written or digital customer consent with agreed inspection terms.
                  </li>
                </ul>
              </div>

              <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#202321]">
                  <CheckCircle2 className="h-4 w-4 text-[#15803D]" />
                  <span>3. Customer Right to Replaced Old Parts (حق استرجاع القطع المستبدلة)</span>
                </div>
                <p className="text-[#6B706D] leading-relaxed text-[11px]">
                  Under UAE Consumer Protection Law Article 12, customers have the absolute legal right to inspect and take possession of all old replaced components upon vehicle handover.
                </p>
                <div className="rounded bg-white p-2 border border-[#DCDDD9] text-[10px] text-[#6B706D]">
                  * Old parts not collected within 24 hours of vehicle delivery are disposed of via Dubai Municipality hazardous waste protocols.
                </div>
              </div>

              <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#202321]">
                  <FileText className="h-4 w-4 text-[#B45309]" />
                  <span>4. Quotation Authorization & Hidden Charges Ban</span>
                </div>
                <p className="text-[#6B706D] leading-relaxed text-[11px]">
                  No technician or service advisor may execute repairs or install parts exceeding the approved quotation without prior customer written/WhatsApp approval. Hidden costs or unauthorized additional work are strictly prohibited.
                </p>
                <div className="rounded bg-white p-2 border border-[#DCDDD9] text-[10px] text-[#6B706D]">
                  All estimates are provided with an explicit breakdown of parts cost, labour charge, and 5% UAE VAT.
                </div>
              </div>
            </div>

            {/* Storage Fees and Garage Lien Banner */}
            <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 text-xs space-y-2">
              <h3 className="font-bold text-[#202321] uppercase text-[11px] tracking-wider">
                Vehicle Collection, Storage Fees & Garage Lien Policy
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-[#6B706D]">
                <div className="rounded bg-white p-2.5 border border-[#DCDDD9]">
                  <strong className="text-[#202321] block">72-Hour Free Grace Period</strong>
                  No storage charge for the first 3 days after notification that the vehicle is ready for pickup.
                </div>
                <div className="rounded bg-white p-2.5 border border-[#DCDDD9]">
                  <strong className="text-[#202321] block">Daily Storage Fee: AED 50.00 / day</strong>
                  Applies starting on the 4th day to cover secure yard storage, insurance, and liability risk.
                </div>
                <div className="rounded bg-white p-2.5 border border-[#DCDDD9]">
                  <strong className="text-[#202321] block">Garage Lien & Release</strong>
                  Vehicles released solely upon full payment in AED. Garage holds legal lien rights under UAE Civil Code.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Dubai Municipality EHS & Hazardous Waste */}
      {activeTab === 'municipality' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#DCDDD9] bg-white p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#DCDDD9] pb-3">
              <Building2 className="h-5 w-5 text-[#047857]" />
              <div>
                <h2 className="font-bold text-sm text-[#202321]">
                  Dubai Municipality Environmental, Health & Safety (EHS) Compliance (بلدية دبي)
                </h2>
                <p className="text-[11px] text-[#6B706D]">
                  Hazardous workshop waste management, air conditioning gas recovery, and civil defence standards.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#047857]">
                  <Flame className="h-4 w-4" />
                  <span>1. Used Engine Oil & Hazardous Fluid Handling</span>
                </div>
                <p className="text-[#6B706D] text-[11px] leading-relaxed">
                  Under Dubai Municipality Environment Department Local Order No. 61 of 1991:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[#6B706D]">
                  <li>Used engine oil, transmission fluid, and brake fluid must be stored in bunded, double-wall steel containers.</li>
                  <li><strong>Zero Drainage Disposal:</strong> Pouring any petroleum fluid into public sewerage or ground soil is an environmental crime subject to AED 50,000+ fines.</li>
                  <li>Disposal contracted solely with <strong>Dubai Municipality Approved Hazardous Waste Contractors (Tadweer)</strong>.</li>
                </ul>
              </div>

              <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#202321]">
                  <AlertTriangle className="h-4 w-4 text-[#B45309]" />
                  <span>2. AC Refrigerant (R134a / R1234yf) Zero-Atmospheric Venting</span>
                </div>
                <p className="text-[#6B706D] text-[11px] leading-relaxed">
                  As per UAE Ministry of Climate Change and Environment & Dubai Municipality regulations:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[#6B706D]">
                  <li>All vehicle automotive air conditioning evacuation must use a closed-loop recovery machine.</li>
                  <li>Direct atmospheric venting of CFCs or HFCs is strictly prohibited.</li>
                  <li>Refrigerant purity tested before recycling back into customer AC systems.</li>
                </ul>
              </div>

              <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#202321]">
                  <Building2 className="h-4 w-4 text-[#1B4D3E]" />
                  <span>3. Scrap Metal, Batteries & Filter Recycling</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[#6B706D]">
                  <li>Spent lead-acid car batteries stored on acid-resistant plastic pallets and returned to licensed battery recyclers.</li>
                  <li>Used oil filters crushed and drained before metal recycling.</li>
                  <li>Scrap brake rotors and suspension steel segregated in dedicated metal recycling bins.</li>
                </ul>
              </div>

              <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#202321]">
                  <Flame className="h-4 w-4 text-[#DC2626]" />
                  <span>4. Dubai Civil Defence (DCD) Fire Safety</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[11px] text-[#6B706D]">
                  <li>Class B and CO2 fire extinguishers installed every 15 meters on the workshop floor.</li>
                  <li>Flammable solvents (brake cleaners, thinners, paints) kept in fireproof steel chemical lockers.</li>
                  <li>Fire alarm and automatic sprinkler system tested annually.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: UAE FTA 5% VAT Compliance */}
      {activeTab === 'vat' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-[#DCDDD9] bg-white p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-[#DCDDD9] pb-3">
              <Receipt className="h-5 w-5 text-[#7C3AED]" />
              <div>
                <h2 className="font-bold text-sm text-[#202321]">
                  UAE Federal Tax Authority (FTA) 5% VAT Regulations (ضريبة القيمة المضافة)
                </h2>
                <p className="text-[11px] text-[#6B706D]">
                  Compliance under UAE Federal Decree-Law No. 8 of 2017 on Value Added Tax.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#7C3AED]">Standard Tax Rate</span>
                <div className="text-xl font-bold font-mono text-[#202321]">5.00% VAT</div>
                <p className="text-[11px] text-[#6B706D] mt-1">
                  Applied to all spare parts, mechanical/electrical labour, diagnostic fees, and workshop services.
                </p>
              </div>

              <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#7C3AED]">Garage TRN Registration</span>
                <div className="text-xl font-bold font-mono text-[#1B4D3E]">100482937400003</div>
                <p className="text-[11px] text-[#6B706D] mt-1">
                  15-digit Federal Tax Authority Registration Number prominently shown on all invoices.
                </p>
              </div>

              <div className="rounded border border-[#DCDDD9] bg-[#FAFAF9] p-4 space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#7C3AED]">Mandatory Currency</span>
                <div className="text-xl font-bold font-mono text-[#202321]">AED (د.إ)</div>
                <p className="text-[11px] text-[#6B706D] mt-1">
                  All accounting ledgers, invoices, receipts, and quotations strictly denominated in UAE Dirham.
                </p>
              </div>
            </div>

            <div className="rounded border border-[#DCDDD9] p-4 bg-[#FAFAF9] space-y-3 text-xs">
              <h3 className="font-bold text-[#202321] text-xs uppercase tracking-wider">
                Official FTA Tax Invoice Mandatory Elements Checklist
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#6B706D]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#15803D] shrink-0" />
                  <span>The words <strong>"TAX INVOICE / فاتورة ضريبية"</strong> clearly displayed at the top.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#15803D] shrink-0" />
                  <span>Garage Legal Registered Trade Name and Dubai Address.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#15803D] shrink-0" />
                  <span>Garage 15-digit Tax Registration Number (TRN).</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#15803D] shrink-0" />
                  <span>Sequential invoice number and date of issuance.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#15803D] shrink-0" />
                  <span>Itemized description of parts, quantities, unit prices, and labour charges in AED.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#15803D] shrink-0" />
                  <span>Explicit breakdown of Net Subtotal, 5% VAT Amount, and Gross Grand Total in AED.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Printable Bilingual Customer Agreement */}
      {activeTab === 'printable_agreement' && (
        <div className="space-y-4">
          <div className="no-print flex items-center justify-between bg-white p-4 rounded-lg border border-[#DCDDD9]">
            <div>
              <h3 className="font-bold text-xs text-[#202321] uppercase tracking-wider">
                Official Dubai Workshop Terms & Customer Agreement (وثيقة الشروط والأحكام)
              </h3>
              <p className="text-[11px] text-[#6B706D]">
                Ready to print on standard A4 paper for customer signatures or reception display.
              </p>
            </div>
            <button
              onClick={handlePrintAgreement}
              className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-4 py-2 text-xs font-bold text-white hover:bg-[#153E32] transition-colors shadow-xs"
            >
              <Printer className="h-4 w-4" />
              <span>Print Agreement Now</span>
            </button>
          </div>

          {/* Printable Document Paper */}
          <div
            id="printable-dubai-agreement"
            className="rounded border border-[#DCDDD9] bg-white p-8 text-xs text-[#202321] space-y-5 print-container"
          >
            {/* Header */}
            <div className="text-center border-b border-[#DCDDD9] pb-4">
              <h1 className="text-lg font-bold text-[#202321] uppercase tracking-wide">
                {settings.garageName || settings.shopName}
              </h1>
              <p className="text-xs text-[#6B706D]">{settings.tagline}</p>
              <p className="text-[11px] text-[#6B706D] mt-1 font-mono">
                {settings.address} · Tel: {settings.phone} · TRN: {settings.taxNumber || '100482937400003'}
              </p>
              <div className="mt-3 inline-block rounded bg-[#E8F0EC] border border-[#A7D0C0] px-4 py-1 text-xs font-bold text-[#1B4D3E] uppercase tracking-wider">
                WORKSHOP TERMS, POLICIES & CONSUMER RIGHTS AGREEMENT (اتفاقية الشروط وحقوق المستهلك)
              </div>
            </div>

            {/* Bilingual Clauses */}
            <div className="space-y-3.5 text-[11px] leading-relaxed divide-y divide-[#F5F5F3]">
              <div className="pt-2">
                <strong className="text-[#202321] block">
                  1. DUBAI POLICE ACCIDENT PERMIT REQUIREMENT (تصريح تصليح من شرطة دبي)
                </strong>
                <p className="text-[#4B5563]">
                  Under Dubai Police regulations, no body, chassis, denting, or spray-painting work shall commence on any collision-damaged vehicle without an authentic Dubai Police Accident Report or electronic CID Repair Permit.
                </p>
                <p className="text-[#6B706D] text-right font-sans" dir="rtl">
                  وفقاً لتعليمات القيادة العامة لشرطة دبي، يمنع منعاً باتاً البدء بأعمال السمكرة أو الدهان للمركبات المتعرضة لحوادث إلا بعد تقديم تصريح تصليح حادث رسمي معتمد.
                </p>
              </div>

              <div className="pt-2">
                <strong className="text-[#202321] block">
                  2. WORKMANSHIP & SPARE PARTS WARRANTY (الضمان على الصيانة وقطع الغيار)
                </strong>
                <p className="text-[#4B5563]">
                  Under UAE Consumer Protection Law (Federal Law No. 15 of 2020), mechanical and electrical labour is warranted for <strong>90 Days or 5,000 Kilometers</strong> (whichever occurs first). Genuine OEM parts carry manufacturer distributor warranty. Electrical components are non-refundable once installed.
                </p>
                <p className="text-[#6B706D] text-right font-sans" dir="rtl">
                  وفقاً للقانون الاتحادي رقم 15 لسنة 2020 بشأن حماية المستهلك، يمنح العميل ضماناً على أجور الصيانة الميكانيكية والكهربائية لمدة 90 يوماً أو 5,000 كم أيهما أقرب.
                </p>
              </div>

              <div className="pt-2">
                <strong className="text-[#202321] block">
                  3. RIGHT TO REPLACED OLD PARTS (حق استرجاع القطع القديمة المستبدلة)
                </strong>
                <p className="text-[#4B5563]">
                  The customer has the legal right to inspect and retrieve all replaced old parts upon vehicle delivery. Any old parts unclaimed within 24 hours of delivery notification will be recycled according to Dubai Municipality hazardous waste protocols.
                </p>
                <p className="text-[#6B706D] text-right font-sans" dir="rtl">
                  يحق للعميل استلام القطع القديمة المستبدلة عند استلام المركبة. في حال عدم المطالبة بها خلال 24 ساعة يتم إتلافها وفق اشتراطات بلدية دبي.
                </p>
              </div>

              <div className="pt-2">
                <strong className="text-[#202321] block">
                  4. STORAGE FEES & VEHICLE RELEASE (رسوم حجز وأرضية المركبة وحق الحبس)
                </strong>
                <p className="text-[#4B5563]">
                  A free 72-hour grace period is granted following notice of completion. Thereafter, a daily storage fee of <strong>AED 50.00 / day</strong> applies. The workshop retains lien rights until the invoice is settled in full in UAE Dirham (AED). Vehicles abandoned over 60 days are reported to Dubai Police/Municipality.
                </p>
                <p className="text-[#6B706D] text-right font-sans" dir="rtl">
                  تمنح فترة سماح مجانية لمدة 72 ساعة من إشعار إتمام العمل، وبعدها تطبق رسوم أرضية بواقع 50 درهم إماراتي يومياً. يحق للورشة حبس المركبة لحين سداد كامل الفاتورة.
                </p>
              </div>

              <div className="pt-2">
                <strong className="text-[#202321] block">
                  5. PERSONAL PROPERTY DISCLAIMER (إخلاء مسؤولية المتعلقات الشخصية)
                </strong>
                <p className="text-[#4B5563]">
                  The workshop is not liable for cash, jewelry, sunglasses, mobile phones, or personal valuables left inside the vehicle. Customers must remove all valuables prior to handing over the vehicle keys.
                </p>
                <p className="text-[#6B706D] text-right font-sans" dir="rtl">
                  الورشة غير مسؤولة عن فقدان أو تلف أي مبالغ نقدية أو مجوهرات أو مقتنيات شخصية متروكة داخل المركبة.
                </p>
              </div>

              <div className="pt-2">
                <strong className="text-[#202321] block">
                  6. UAE 5% VALUE ADDED TAX (ضريبة القيمة المضافة)
                </strong>
                <p className="text-[#4B5563]">
                  All prices and estimates are subject to 5% UAE VAT as mandated by the Federal Tax Authority (FTA).
                </p>
                <p className="text-[#6B706D] text-right font-sans" dir="rtl">
                  تخضع جميع الفواتير الصادرة لنسبة 5٪ ضريبة القيمة المضافة وفق أنظمة الهيئة الاتحادية للضرائب.
                </p>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-6 border-t border-[#DCDDD9] grid grid-cols-2 gap-8 text-xs">
              <div>
                <span className="text-[#6B706D] block">Customer Signature & Acknowledgment:</span>
                <div className="mt-8 border-b border-[#202321] w-48" />
                <span className="text-[10px] text-[#6B706D] mt-1 block">
                  Name / Emirates ID / Date
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#6B706D] block">Authorized Garage Manager & Stamp:</span>
                <div className="mt-8 border-b border-[#202321] w-48 ml-auto" />
                <span className="text-[10px] text-[#6B706D] mt-1 block">
                  {settings.garageName || settings.shopName} · Dubai, UAE
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
