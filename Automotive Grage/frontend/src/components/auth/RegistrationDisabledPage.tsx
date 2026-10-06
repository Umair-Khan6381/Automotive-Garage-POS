import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const RegistrationDisabledPage: React.FC = () => {
  const { setActiveView } = useShop();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F5F5F3] px-4 py-12">
      <div className="w-full max-w-md rounded border border-[#DCDDD9] bg-white p-6 shadow-xs">
        <div className="flex h-12 w-12 items-center justify-center rounded bg-[#FEE2E2] text-[#DC2626] mx-auto mb-4">
          <ShieldAlert className="h-6 w-6" />
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded bg-[#F5F5F3] px-2.5 py-1 text-xs font-semibold text-[#6B706D] mb-2 border border-[#DCDDD9]">
            <Lock className="h-3 w-3 text-[#DC2626]" />
            <span>Private Garage System</span>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-[#202321]">
            Public Registration is Disabled
          </h1>

          <p className="text-xs text-[#6B706D] mt-2 leading-relaxed">
            This Automotive Repair Garage POS is a private workshop management system. Public and customer self-registration is strictly prohibited.
          </p>

          <p className="text-xs text-[#6B706D] mt-2 leading-relaxed">
            Employee and technician accounts can only be created internally by the garage owner from within the administration console.
          </p>

          <div className="mt-6 pt-4 border-t border-[#DCDDD9]">
            <button
              onClick={() => setActiveView('login')}
              className="w-full inline-flex items-center justify-center gap-2 rounded bg-[#1B4D3E] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Garage Login</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
