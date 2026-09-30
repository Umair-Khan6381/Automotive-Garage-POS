import React from 'react';
import {
  Wrench,
  Package,
  Users,
  Car,
  Receipt,
  TrendingUp,
  Droplet,
  HardHat,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import heroImg from '../../assets/images/hero_automotive_workshop_1790320377403.jpg';
import featureImg from '../../assets/images/workshop_mechanic_diagnostic_1790320397696.jpg';

export const LandingPage: React.FC = () => {
  const { setActiveView } = useShop();

  const workflowSteps = [
    { step: '01', title: 'Customer', desc: 'Instant intake of customer profile and telephone' },
    { step: '02', title: 'Vehicle', desc: 'Registration plate, current odometer and check-in' },
    { step: '03', title: 'Job Card', desc: 'Mechanic diagnosis, bay allocation and work order' },
    { step: '04', title: 'Parts + Labour', desc: 'Stock deduction with weighted cost and labour charges' },
    { step: '05', title: 'Invoice', desc: 'Itemized billing with tax and discount calculation' },
    { step: '06', title: 'Payment', desc: 'Cash, bank or mobile wallet collection and receipt' },
    { step: '07', title: 'Service History', desc: 'Next oil interval and maintenance reminders' }
  ];

  const features = [
    {
      icon: Package,
      title: 'Smart Inventory',
      desc: 'Automatic Weighted Average Cost calculation on stock shipments. Real-time consumption in repair jobs and direct counter sales.'
    },
    {
      icon: Users,
      title: 'Customer Management',
      desc: 'Complete accounts directory with multi-vehicle ownership, service logs, invoice history, and balance due tracking.'
    },
    {
      icon: Car,
      title: 'Vehicle Service History',
      desc: 'Permanent odometer and repair archive indexed by registration plate (e.g. LEA-19). Instant inspection of past work orders.'
    },
    {
      icon: Wrench,
      title: 'Repair Job Cards',
      desc: 'Track intake symptoms, diagnostic findings, allocated parts, assigned technician hours, and live workshop bay status.'
    },
    {
      icon: HardHat,
      title: 'Labour Management',
      desc: 'Technician directory with daily/hourly wage tracking, job allocations, wage disbursements, and remaining payable balances.'
    },
    {
      icon: Receipt,
      title: 'POS & Billing',
      desc: 'High-speed counter checkout desk with job card loading, itemized parts, labor charges, discounts, taxes, and printable bills.'
    },
    {
      icon: TrendingUp,
      title: 'Profit Tracking',
      desc: 'Detailed gross margin analysis separating parts profit and technician charges minus workshop overhead expenses.'
    },
    {
      icon: Droplet,
      title: 'Service Reminders',
      desc: 'Preventative oil service tracking flagging nominal, due soon, and overdue vehicles based on odometer km and calendar intervals.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F3] text-[#202321] font-sans">
      {/* Top Bar Contract */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between border-b border-[#DCDDD9] bg-white px-4 lg:px-8">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-[#1B4D3E] text-white">
            <Wrench className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-bold tracking-tight text-[#202321]">
            Apex Auto POS
          </span>
        </div>

        {/* Zone 2: Clean nav links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-[#6B706D]">
          <a href="#features" className="hover:text-[#202321] transition-colors">Features</a>
          <a href="#workflow" className="hover:text-[#202321] transition-colors">How It Works</a>
          <a href="#preview" className="hover:text-[#202321] transition-colors">Terminal Preview</a>
          <a href="#specifications" className="hover:text-[#202321] transition-colors">Specifications</a>
        </nav>

        {/* Zone 3: Primary action */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('dashboard')}
            className="rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs"
          >
            Launch POS App
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-[#DCDDD9] bg-white py-14 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center space-y-5">
          <div className="inline-flex items-center gap-2 rounded border border-[#DCDDD9] bg-[#F5F5F3] px-3 py-1 text-xs text-[#6B706D]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#1B4D3E]" />
            <span>Industrial Workshop & Service Station Management System</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#202321] max-w-3xl mx-auto text-balance">
            Complete Automotive Workshop Management
          </h1>

          <p className="text-sm sm:text-base text-[#6B706D] max-w-2xl mx-auto text-balance leading-relaxed">
            Manage customers, vehicles, inventory, repairs, labour, billing and profits from one powerful platform.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setActiveView('dashboard')}
              className="rounded bg-[#1B4D3E] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors shadow-xs inline-flex items-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setActiveView('pos')}
              className="rounded border border-[#DCDDD9] bg-white px-5 py-2.5 text-xs font-semibold text-[#202321] hover:bg-[#F5F5F3] transition-colors"
            >
              View Counter POS Demo
            </button>
          </div>

          {/* Real Workshop Photography */}
          <div className="pt-8">
            <div className="rounded border border-[#DCDDD9] overflow-hidden shadow-sm bg-white p-1">
              <img
                src={heroImg}
                alt="Automotive repair facility with modern service bays"
                className="w-full h-72 sm:h-96 lg:h-[420px] object-cover rounded"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section: "How It Works" */}
      <section id="workflow" className="py-12 px-4 sm:px-6 lg:px-8 border-b border-[#DCDDD9] bg-[#F5F5F3]">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-[#202321]">
              How the Workshop System Works
            </h2>
            <p className="text-xs text-[#6B706D] mt-1">
              Every operation from vehicle check-in to inventory deduction and billing is automatically linked
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
            {workflowSteps.map((ws, idx) => (
              <div
                key={idx}
                className="rounded border border-[#DCDDD9] bg-white p-3 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-[#1B4D3E]">{ws.step}</span>
                  <div className="font-bold text-xs text-[#202321] mt-1">{ws.title}</div>
                  <p className="text-[11px] text-[#6B706D] mt-1 leading-snug">{ws.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-14 px-4 sm:px-6 lg:px-8 border-b border-[#DCDDD9] bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-[#202321]">
              Engineered for Real Automotive Workshops
            </h2>
            <p className="text-xs text-[#6B706D] mt-1">
              Practical, high-speed tools designed for front-desk service advisors, parts managers, and shop owners
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded border border-[#DCDDD9] bg-white p-4 space-y-2 hover:border-[#1B4D3E] transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-[#E8F0EC] text-[#1B4D3E]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-xs text-[#202321]">{feat.title}</h3>
                  <p className="text-[11px] text-[#6B706D] leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Dashboard & POS Preview Section */}
      <section id="preview" className="py-14 px-4 sm:px-6 lg:px-8 border-b border-[#DCDDD9] bg-[#F5F5F3]">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1B4D3E]">
                High-Speed Counter Interface
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#202321]">
                Counter POS Terminal Built for Rapid Service
              </h2>
              <p className="text-xs text-[#6B706D] leading-relaxed">
                Cashiers and technicians can process customer bills in seconds. Automatically search parts by SKU, apply labour charges by mechanic, deduct inventory in real-time, and print itemized bills.
              </p>

              <div className="space-y-2 text-xs text-[#202321]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#15803D]" />
                  <span>Weighted Average Cost stock deduction</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#15803D]" />
                  <span>One-click load from active repair job cards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#15803D]" />
                  <span>Automatic odometer oil service interval calculation</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setActiveView('pos')}
                  className="rounded bg-[#1B4D3E] px-4 py-2 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors inline-flex items-center gap-2"
                >
                  <span>Open POS Counter</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded border border-[#DCDDD9] overflow-hidden shadow-sm bg-white p-1">
                <img
                  src={featureImg}
                  alt="Technician conducting vehicle diagnostics in the bay"
                  className="w-full h-80 object-cover rounded"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specifications Strip */}
      <section id="specifications" className="py-10 px-4 sm:px-6 lg:px-8 border-b border-[#DCDDD9] bg-white">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="border border-[#DCDDD9] p-3 rounded bg-[#FAFAF9]">
              <div className="font-mono text-xl font-bold text-[#1B4D3E]">100%</div>
              <div className="text-[11px] text-[#6B706D] mt-0.5 font-medium">Automatic Reconciliation</div>
            </div>
            <div className="border border-[#DCDDD9] p-3 rounded bg-[#FAFAF9]">
              <div className="font-mono text-xl font-bold text-[#202321]">PKR (Rs.)</div>
              <div className="text-[11px] text-[#6B706D] mt-0.5 font-medium">Decimal-Safe Currency</div>
            </div>
            <div className="border border-[#DCDDD9] p-3 rounded bg-[#FAFAF9]">
              <div className="font-mono text-xl font-bold text-[#202321]">&lt; 200ms</div>
              <div className="text-[11px] text-[#6B706D] mt-0.5 font-medium">Instant Counter Lookup</div>
            </div>
            <div className="border border-[#DCDDD9] p-3 rounded bg-[#FAFAF9]">
              <div className="font-mono text-xl font-bold text-[#15803D]">0 Error</div>
              <div className="text-[11px] text-[#6B706D] mt-0.5 font-medium">Stock Audit Integrity</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 bg-white text-xs text-[#6B706D]">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[#1B4D3E] text-white">
              <Wrench className="h-3 w-3" />
            </div>
            <span className="font-bold text-[#202321]">Apex Auto POS & Workshop Management</span>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setActiveView('dashboard')} className="hover:text-[#202321]">Dashboard</button>
            <button onClick={() => setActiveView('pos')} className="hover:text-[#202321]">POS Counter</button>
            <button onClick={() => setActiveView('jobs')} className="hover:text-[#202321]">Job Cards</button>
            <button onClick={() => setActiveView('inventory')} className="hover:text-[#202321]">Inventory</button>
          </div>

          <div>
            © 2026 Apex Workshop Management System. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
