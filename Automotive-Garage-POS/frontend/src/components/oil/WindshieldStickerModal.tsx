import React, { useState } from 'react';
import {
  X,
  Printer,
  Droplet,
  Calendar,
  Gauge,
  Car,
  CheckCircle2,
  Wrench,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatDate } from '../../utils/formatters';
import { printDocument } from '../../utils/printUtils';
import { OilChangeRecord } from '../../types';

interface WindshieldStickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: OilChangeRecord;
}

export const WindshieldStickerModal: React.FC<WindshieldStickerModalProps> = ({
  isOpen,
  onClose,
  record
}) => {
  const { settings, vehicles, customers } = useShop();
  const [stickerFormat, setStickerFormat] = useState<'decal' | 'slip'>('decal');
  const [printNotice, setPrintNotice] = useState<string | null>(null);

  if (!isOpen || !record) return null;

  const vehicle = vehicles.find(v => v.id === record.vehicleId);
  const customer = customers.find(c => c.id === record.customerId);

  const handlePrintSticker = () => {
    const success = printDocument({
      title: `Oil_Decal_${vehicle?.registrationNumber || 'Vehicle'}_${record.date}`,
      elementId: 'printable-oil-sticker-area',
      pageSize: '80mm',
      scale: 1.0,
      onAfterPrint: () => {
        setPrintNotice('Sticker sent to label printer.');
        setTimeout(() => setPrintNotice(null), 3000);
      }
    });

    if (success) {
      setPrintNotice('Printing Windshield Oil Service Decal...');
      setTimeout(() => setPrintNotice(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#202321]/60 backdrop-blur-2xs font-sans">
      <div className="w-full max-w-md rounded-lg border border-[#DCDDD9] bg-white shadow-2xl overflow-hidden print-container flex flex-col">
        {/* Header */}
        <div className="no-print flex items-center justify-between border-b border-[#DCDDD9] px-4 py-3 bg-[#FAFAF9]">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#1B4D3E] text-white">
              <Droplet className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#202321]">
                Windshield Service Decal (ملصق غيار الزيت للزجاج)
              </h3>
              <p className="text-[10px] text-[#6B706D] font-mono">
                {vehicle?.registrationNumber} · {vehicle?.make} {vehicle?.model}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Paper / Layout Toggle */}
        <div className="no-print flex items-center justify-between px-4 py-2 bg-[#F5F5F3] border-b border-[#DCDDD9] text-xs">
          <span className="text-[11px] font-bold text-[#6B706D]">Format:</span>
          <div className="inline-flex rounded border border-[#DCDDD9] bg-white p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setStickerFormat('decal')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                stickerFormat === 'decal'
                  ? 'bg-[#1B4D3E] text-white font-bold'
                  : 'text-[#6B706D] hover:text-[#202321]'
              }`}
            >
              🏷️ Decal (Square 60mm)
            </button>
            <button
              type="button"
              onClick={() => setStickerFormat('slip')}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                stickerFormat === 'slip'
                  ? 'bg-[#1B4D3E] text-white font-bold'
                  : 'text-[#6B706D] hover:text-[#202321]'
              }`}
            >
              🧾 80mm Roll Slip
            </button>
          </div>
        </div>

        {printNotice && (
          <div className="no-print mx-4 mt-3 p-2 rounded bg-[#DCFCE7] text-[#15803D] text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{printNotice}</span>
          </div>
        )}

        {/* Printable Area Container */}
        <div className="p-6 bg-[#EFEFEA] flex justify-center items-center">
          {/* Physical Decal Preview */}
          <div
            id="printable-oil-sticker-area"
            className={`bg-white border-2 border-[#1B4D3E] rounded-md p-4 text-[#202321] shadow-md font-sans mx-auto ${
              stickerFormat === 'decal' ? 'w-[260px]' : 'w-[300px]'
            }`}
          >
            {/* Header */}
            <div className="text-center pb-2 border-b-2 border-[#1B4D3E]">
              <div className="flex items-center justify-center gap-1 text-[#1B4D3E] font-bold">
                <Wrench className="h-3.5 w-3.5" />
                <span className="text-xs uppercase tracking-wider font-black">
                  {settings.garageName || settings.shopName || 'UMAIR AUTO CARE'}
                </span>
              </div>
              <div className="text-[10px] text-[#202321] font-semibold mt-0.5">
                SERVICE REMINDER (تذكير بالصيانة الدورية)
              </div>
              <div className="text-[9px] text-[#6B706D] font-mono">
                Tel: {settings.phone || '+971 4 347 8899'}
              </div>
            </div>

            {/* Vehicle Plate Badge */}
            <div className="my-2 p-1 text-center bg-[#E8F0EC] border border-[#A7D0C0] rounded">
              <span className="font-mono font-black text-sm text-[#1B4D3E] tracking-wider uppercase">
                {vehicle?.registrationNumber || 'PLATE'}
              </span>
              <span className="text-[10px] text-[#6B706D] block font-medium">
                {vehicle?.make} {vehicle?.model}
              </span>
            </div>

            {/* Service & Due Data Grid */}
            <div className="space-y-1.5 text-xs py-1 border-b border-dashed border-[#DCDDD9]">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#6B706D]">Service Date:</span>
                <span className="font-mono font-bold text-[#202321]">{formatDate(record.date)}</span>
              </div>

              <div className="flex justify-between items-center text-[10px]">
                <span className="text-[#6B706D]">Current Mileage:</span>
                <span className="font-mono font-bold text-[#202321]">{record.mileage.toLocaleString()} km</span>
              </div>

              <div className="bg-[#FEF3C7] border border-[#FDE68A] p-1.5 rounded mt-1.5 space-y-0.5 text-center">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[#92400E] block">
                  NEXT SERVICE DUE (موعد الصيانة القادم)
                </span>
                <div className="font-mono font-black text-base text-[#B45309]">
                  {record.nextRecommendedMileage.toLocaleString()} km
                </div>
                <div className="text-[10px] font-mono font-semibold text-[#78350F]">
                  or Date: {formatDate(record.nextRecommendedDate)}
                </div>
              </div>

              <div className="pt-1 text-[10px] flex justify-between">
                <span className="text-[#6B706D]">Oil Grade:</span>
                <span className="font-mono font-bold text-[#1B4D3E] truncate max-w-[150px]">{record.oilProductName}</span>
              </div>
            </div>

            {/* Footer Notice */}
            <div className="text-[8px] text-center text-[#6B706D] pt-2 leading-tight">
              Please stick to inside of driver-side windshield. Thank you for your trust!
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="no-print border-t border-[#DCDDD9] px-4 py-3 bg-[#FAFAF9] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-[#DCDDD9] bg-white text-xs font-semibold text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321] cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handlePrintSticker}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#1B4D3E] text-white text-xs font-bold hover:bg-[#153E32] transition-colors shadow-xs cursor-pointer active:scale-95"
          >
            <Printer className="h-4 w-4" />
            <span>Print Windshield Sticker</span>
          </button>
        </div>
      </div>
    </div>
  );
};
