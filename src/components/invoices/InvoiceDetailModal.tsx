import React from 'react';
import {
  X,
  Printer,
  Wrench,
  Receipt
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { formatPKR, formatDate } from '../../utils/formatters';

interface InvoiceDetailModalProps {
  invoiceId: string;
  onClose: () => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({ invoiceId, onClose }) => {
  const { invoices, customers, vehicles, settings } = useShop();

  const invoice = invoices.find(i => i.id === invoiceId);

  if (!invoice) return null;

  const customer = customers.find(c => c.id === invoice.customerId);
  const vehicle = vehicles.find(v => v.id === invoice.vehicleId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202321]/50 overflow-y-auto">
      <div className="relative w-full max-w-2xl my-6 rounded border border-[#DCDDD9] bg-white shadow-2xl overflow-hidden print-container">
        {/* Top Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9]">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-[#1B4D3E]" />
            <span className="text-xs font-bold text-[#202321]">
              Workshop Bill & Receipt Preview
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded bg-[#1B4D3E] px-3 py-1 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Bill</span>
            </button>
            <button
              onClick={onClose}
              className="rounded p-1 text-[#6B706D] hover:bg-[#F5F5F3] hover:text-[#202321]"
              aria-label="Close modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Bill Area */}
        <div className="p-6 bg-white text-[#202321] text-xs">
          {/* Shop Header */}
          <div className="flex justify-between items-start pb-4 border-b border-[#DCDDD9]">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded bg-[#1B4D3E] text-white">
                  <Wrench className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-[#202321] tracking-tight">
                    {settings.shopName}
                  </h1>
                  <p className="text-[11px] text-[#6B706D]">{settings.tagline}</p>
                </div>
              </div>
              <div className="mt-2 text-[11px] text-[#6B706D] space-y-0.5">
                <p>{settings.address}</p>
                <p>Phone: {settings.phone} · Email: {settings.email}</p>
                <p className="font-mono text-[#202321]">{settings.taxNumber}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2 py-0.5 rounded border border-[#DCDDD9] bg-[#F5F5F3] text-[10px] font-mono font-bold tracking-wider mb-1">
                WORKSHOP BILL
              </span>
              <div className="text-sm font-bold font-mono text-[#202321]">{invoice.invoiceNumber}</div>
              <div className="text-[11px] text-[#6B706D] mt-0.5">Date: {formatDate(invoice.date)}</div>
              <div className="text-[11px] font-semibold mt-1">
                Status:{' '}
                <span
                  className={
                    invoice.paymentStatus === 'Paid'
                      ? 'text-[#15803D]'
                      : invoice.paymentStatus === 'Partially Paid'
                      ? 'text-[#B45309]'
                      : 'text-[#DC2626]'
                  }
                >
                  {invoice.paymentStatus.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Client & Vehicle Meta */}
          <div className="py-3 border-b border-[#DCDDD9] grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B706D] mb-1">
                Billed To (Customer)
              </div>
              <div className="font-bold text-[#202321]">{customer?.fullName}</div>
              <div className="text-[11px] text-[#6B706D] font-mono">{customer?.phone}</div>
              <div className="text-[11px] text-[#6B706D]">{customer?.address}</div>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#6B706D] mb-1">
                Vehicle Serviced
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs bg-[#E8F0EC] text-[#1B4D3E] px-1.5 py-0.5 rounded border border-[#DCDDD9]">
                  {vehicle?.registrationNumber}
                </span>
                <span className="font-medium text-[#202321]">
                  {vehicle?.make} {vehicle?.model} ({vehicle?.year})
                </span>
              </div>
              <div className="text-[11px] text-[#6B706D] mt-0.5">
                Current Odometer: <span className="font-mono">{vehicle?.mileage.toLocaleString()} km</span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-3 border-b border-[#DCDDD9]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#DCDDD9] text-[10px] font-semibold uppercase tracking-wider text-[#6B706D]">
                <tr>
                  <th className="py-1.5">Description</th>
                  <th className="py-1.5 text-center">Type</th>
                  <th className="py-1.5 text-center">Qty</th>
                  <th className="py-1.5 text-right">Unit Price</th>
                  <th className="py-1.5 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCDDD9]">
                {invoice.items.map(item => (
                  <tr key={item.id}>
                    <td className="py-1.5 font-medium text-[#202321]">{item.name}</td>
                    <td className="py-1.5 text-center font-mono text-[10px] uppercase text-[#6B706D]">
                      {item.type}
                    </td>
                    <td className="py-1.5 text-center font-mono">{item.quantity}</td>
                    <td className="py-1.5 text-right font-mono tabular-nums text-[#6B706D]">
                      {formatPKR(item.unitPrice)}
                    </td>
                    <td className="py-1.5 text-right font-mono font-bold text-[#202321] tabular-nums">
                      {formatPKR(item.totalPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Calculation Summary */}
          <div className="py-3 border-b border-[#DCDDD9] flex justify-end">
            <div className="w-64 space-y-1 font-mono text-xs">
              <div className="flex justify-between text-[#6B706D]">
                <span>Parts Total:</span>
                <span>{formatPKR(invoice.partsTotal)}</span>
              </div>
              <div className="flex justify-between text-[#6B706D]">
                <span>Labour / Services:</span>
                <span>{formatPKR(invoice.labourTotal + invoice.servicesTotal)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-[#15803D]">
                  <span>Discount:</span>
                  <span>-{formatPKR(invoice.discount)}</span>
                </div>
              )}
              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-[#6B706D]">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>{formatPKR(invoice.taxAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-[#202321] pt-1 border-t border-[#DCDDD9]">
                <span className="font-sans">Grand Total:</span>
                <span>{formatPKR(invoice.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-[#15803D] pt-0.5">
                <span className="font-sans">Amount Paid:</span>
                <span>{formatPKR(invoice.paidAmount)}</span>
              </div>
              {invoice.balanceDue > 0 && (
                <div className="flex justify-between font-bold text-[#DC2626] pt-0.5 border-t border-[#DCDDD9]">
                  <span className="font-sans">Balance Due:</span>
                  <span>{formatPKR(invoice.balanceDue)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method & Terms */}
          <div className="pt-3 text-[11px] text-[#6B706D] flex justify-between items-end">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#202321] mb-0.5">
                Payment Method: {invoice.paymentMethod}
              </div>
              <p className="italic">
                Workmanship guaranteed for 30 days or 1,000 km. Electrical parts are non-refundable once installed.
              </p>
            </div>

            <div className="text-right shrink-0 ml-4">
              <div className="h-8 border-b border-[#DCDDD9] w-36"></div>
              <div className="text-[10px] uppercase font-semibold text-[#6B706D] mt-1">
                Authorized Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
