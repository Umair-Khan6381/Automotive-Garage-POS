import React, { useState, useMemo } from 'react';
import {
  ShoppingCart,
  Plus,
  Trash2,
  Search,
  User,
  Car,
  HardHat,
  Receipt,
  Check,
  AlertCircle,
  Wrench,
  Percent,
  X
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import {
  Product,
  InvoiceItem,
  PaymentMethod
} from '../../types';
import { formatPKR } from '../../utils/formatters';
import { InvoiceDetailModal } from '../invoices/InvoiceDetailModal';

export const POSView: React.FC = () => {
  const {
    customers,
    vehicles,
    products,
    labourWorkers,
    jobCards,
    createInvoice,
    addCustomer,
    addVehicle,
    settings
  } = useShop();

  // Selection State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedJobCardId, setSelectedJobCardId] = useState<string>('');

  // Cart State
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);

  // Modifiers
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [amountPaid, setAmountPaid] = useState<number | null>(null);
  const [invoiceNotes, setInvoiceNotes] = useState<string>('');

  // Search & Filter
  const [productSearch, setProductSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeCatalogTab, setActiveCatalogTab] = useState<'parts' | 'labour' | 'presets'>('parts');

  // Quick Customer & Vehicle Modals
  const [isQuickCustomerOpen, setIsQuickCustomerOpen] = useState<boolean>(false);
  const [quickCustName, setQuickCustName] = useState<string>('');
  const [quickCustPhone, setQuickCustPhone] = useState<string>('');
  const [quickCustAddress, setQuickCustAddress] = useState<string>('');

  const [isQuickVehicleOpen, setIsQuickVehicleOpen] = useState<boolean>(false);
  const [quickVehReg, setQuickVehReg] = useState<string>('');
  const [quickVehMake, setQuickVehMake] = useState<string>('Toyota');
  const [quickVehModel, setQuickVehModel] = useState<string>('');
  const [quickVehMileage, setQuickVehMileage] = useState<number>(50000);

  // Labour Custom Input
  const [selectedLabourId, setSelectedLabourId] = useState<string>('');
  const [labourDesc, setLabourDesc] = useState<string>('');
  const [labourCharge, setLabourCharge] = useState<number>(1500);
  const [labourCost, setLabourCost] = useState<number>(1000);

  // Completed Invoice State for Printing
  const [completedInvoiceId, setCompletedInvoiceId] = useState<string | null>(null);

  // Filtered vehicles for selected customer
  const customerVehicles = useMemo(() => {
    if (!selectedCustomerId) return [];
    return vehicles.filter(v => v.customerId === selectedCustomerId);
  }, [vehicles, selectedCustomerId]);

  // Open Job Cards available to import
  const openJobCards = useMemo(() => {
    return jobCards.filter(j => j.status !== 'completed' && j.status !== 'delivered' && j.status !== 'cancelled');
  }, [jobCards]);

  // Handle Load from Job Card
  const handleImportJobCard = (jobId: string) => {
    const job = jobCards.find(j => j.id === jobId);
    if (!job) return;

    setSelectedJobCardId(job.id);
    setSelectedCustomerId(job.customerId);
    setSelectedVehicleId(job.vehicleId);

    const importedItems: InvoiceItem[] = [];

    // Import parts
    job.partsUsed.forEach(part => {
      importedItems.push({
        id: `item-part-${Date.now()}-${part.productId}`,
        type: 'part',
        productId: part.productId,
        name: part.productName,
        quantity: part.quantity,
        unitPrice: part.unitPrice,
        totalPrice: part.totalPrice,
        unitCost: part.unitCost,
        totalCost: part.totalCost
      });
    });

    // Import labour
    job.assignedLabour.forEach(lab => {
      importedItems.push({
        id: `item-lab-${Date.now()}-${lab.labourId}`,
        type: 'labour',
        name: `Labour: ${lab.notes || 'Service'} (${lab.labourName})`,
        quantity: lab.units,
        unitPrice: lab.customerCharge,
        totalPrice: lab.customerCharge * lab.units,
        unitCost: lab.costToShop,
        totalCost: lab.costToShop * lab.units
      });
    });

    // Import services
    job.additionalServices.forEach(srv => {
      importedItems.push({
        id: `item-srv-${Date.now()}-${srv.id}`,
        type: 'service',
        name: srv.name,
        quantity: 1,
        unitPrice: srv.charge,
        totalPrice: srv.charge,
        unitCost: srv.cost,
        totalCost: srv.cost
      });
    });

    setCartItems(importedItems);
  };

  // Add Product to Cart
  const handleAddProduct = (product: Product) => {
    const existing = cartItems.find(it => it.productId === product.id);
    const existingQty = existing ? existing.quantity : 0;

    if (existingQty + 1 > product.currentQuantity && !settings.allowNegativeStock) {
      alert(`Cannot add more. Available stock for ${product.name} is ${product.currentQuantity}.`);
      return;
    }

    if (existing) {
      setCartItems(prev =>
        prev.map(it =>
          it.productId === product.id
            ? {
                ...it,
                quantity: it.quantity + 1,
                totalPrice: (it.quantity + 1) * it.unitPrice,
                totalCost: (it.quantity + 1) * it.unitCost
              }
            : it
        )
      );
    } else {
      const newItem: InvoiceItem = {
        id: `cart-item-${Date.now()}`,
        type: 'part',
        productId: product.id,
        name: product.name,
        quantity: 1,
        unitPrice: product.sellingPrice,
        totalPrice: product.sellingPrice,
        unitCost: product.purchasePrice,
        totalCost: product.purchasePrice
      };
      setCartItems(prev => [...prev, newItem]);
    }
  };

  // Update Cart Item Quantity
  const handleUpdateQty = (itemId: string, newQty: number) => {
    if (newQty <= 0) {
      setCartItems(prev => prev.filter(it => it.id !== itemId));
      return;
    }

    const item = cartItems.find(it => it.id === itemId);
    if (!item) return;

    if (item.type === 'part' && item.productId) {
      const prod = products.find(p => p.id === item.productId);
      if (prod && newQty > prod.currentQuantity && !settings.allowNegativeStock) {
        alert(`Stock limit reached. Only ${prod.currentQuantity} units in stock.`);
        return;
      }
    }

    setCartItems(prev =>
      prev.map(it =>
        it.id === itemId
          ? {
              ...it,
              quantity: newQty,
              totalPrice: newQty * it.unitPrice,
              totalCost: newQty * it.unitCost
            }
          : it
      )
    );
  };

  const handleRemoveCartItem = (itemId: string) => {
    setCartItems(prev => prev.filter(it => it.id !== itemId));
  };

  // Add Labour to Cart
  const handleAddLabour = () => {
    if (!selectedLabourId) {
      alert('Please select a technician/mechanic');
      return;
    }
    const worker = labourWorkers.find(w => w.id === selectedLabourId);
    if (!worker) return;

    const newItem: InvoiceItem = {
      id: `labour-${Date.now()}`,
      type: 'labour',
      name: `Labour: ${labourDesc || worker.role} (${worker.name})`,
      quantity: 1,
      unitPrice: Number(labourCharge),
      totalPrice: Number(labourCharge),
      unitCost: Number(labourCost),
      totalCost: Number(labourCost)
    };
    setCartItems(prev => [...prev, newItem]);
    setLabourDesc('');
  };

  // Add Preset Service
  const handleAddPresetService = (name: string, charge: number, cost: number) => {
    const newItem: InvoiceItem = {
      id: `service-${Date.now()}`,
      type: 'service',
      name,
      quantity: 1,
      unitPrice: charge,
      totalPrice: charge,
      unitCost: cost,
      totalCost: cost
    };
    setCartItems(prev => [...prev, newItem]);
  };

  // Quick Customer Creation
  const handleCreateQuickCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCustName || !quickCustPhone) return;

    const newCust = addCustomer({
      fullName: quickCustName,
      phone: quickCustPhone,
      email: `${quickCustName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      address: quickCustAddress || 'Lahore'
    });

    setSelectedCustomerId(newCust.id);
    setIsQuickCustomerOpen(false);
    setQuickCustName('');
    setQuickCustPhone('');
    setQuickCustAddress('');
  };

  // Quick Vehicle Creation
  const handleCreateQuickVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickVehReg || !selectedCustomerId) {
      alert('Please select or create a customer first.');
      return;
    }

    const newVeh = addVehicle({
      registrationNumber: quickVehReg.toUpperCase(),
      make: quickVehMake,
      model: quickVehModel || 'Corolla',
      year: 2022,
      color: 'White',
      mileage: Number(quickVehMileage),
      customerId: selectedCustomerId
    });

    setSelectedVehicleId(newVeh.id);
    setIsQuickVehicleOpen(false);
    setQuickVehReg('');
    setQuickVehModel('');
  };

  // Calculations
  const partsItems = cartItems.filter(it => it.type === 'part');
  const labourItems = cartItems.filter(it => it.type === 'labour');
  const serviceItems = cartItems.filter(it => it.type === 'service');

  const partsTotal = partsItems.reduce((acc, it) => acc + it.totalPrice, 0);
  const partsCost = partsItems.reduce((acc, it) => acc + it.totalCost, 0);

  const labourTotal = labourItems.reduce((acc, it) => acc + it.totalPrice, 0);
  const labourCostTotal = labourItems.reduce((acc, it) => acc + it.totalCost, 0);

  const servicesTotal = serviceItems.reduce((acc, it) => acc + it.totalPrice, 0);
  const servicesCost = serviceItems.reduce((acc, it) => acc + it.totalCost, 0);

  const subtotal = partsTotal + labourTotal + servicesTotal;
  const taxAmount = Math.round((subtotal - discount) * (taxRate / 100));
  const grandTotal = Math.max(0, subtotal - discount + taxAmount);

  const effectivePaidAmount = amountPaid !== null ? amountPaid : grandTotal;
  const balanceDue = Math.max(0, grandTotal - effectivePaidAmount);

  // Process Checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Please add at least one part, labour, or service item to the cart.');
      return;
    }
    if (!selectedCustomerId) {
      alert('Please select or add a customer for this invoice.');
      return;
    }
    if (!selectedVehicleId) {
      alert('Please select or register a vehicle.');
      return;
    }

    const now = new Date();
    const invoiceNum = `${settings.invoicePrefix}${Date.now().toString().slice(-4)}`;

    const newInvoice = createInvoice({
      invoiceNumber: invoiceNum,
      date: now.toISOString().slice(0, 10),
      dueDate: now.toISOString().slice(0, 10),
      customerId: selectedCustomerId,
      vehicleId: selectedVehicleId,
      jobCardId: selectedJobCardId || undefined,
      items: cartItems,
      partsTotal,
      labourTotal,
      servicesTotal,
      subtotal,
      partsCost,
      labourCost: labourCostTotal,
      servicesCost,
      discount,
      discountType: 'fixed',
      taxRate,
      taxAmount,
      grandTotal,
      paidAmount: effectivePaidAmount,
      balanceDue,
      paymentMethod,
      paymentStatus: balanceDue <= 0 ? 'Paid' : effectivePaidAmount > 0 ? 'Partially Paid' : 'Unpaid',
      notes: invoiceNotes
    });

    // Reset Form
    setCartItems([]);
    setDiscount(0);
    setTaxRate(0);
    setAmountPaid(null);
    setInvoiceNotes('');
    setSelectedJobCardId('');

    // Open print preview
    setCompletedInvoiceId(newInvoice.id);
  };

  // Filtered Products Catalog
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Engine Oil', 'Oil Filters', 'Brake System', 'Spark Plugs & Ignition', 'Coolant & Fluids'];

  return (
    <div className="space-y-4">
      {/* Top Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#DCDDD9] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#202321]">
            Counter POS & Billing Terminal
          </h1>
          <p className="text-xs text-[#6B706D] mt-0.5">
            Direct stock deduction, technician labour allocation, and instant receipt generation
          </p>
        </div>

        {/* Load From Job Card Selector */}
        {openJobCards.length > 0 && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#6B706D]">Load Job Card:</label>
            <select
              value={selectedJobCardId}
              onChange={e => handleImportJobCard(e.target.value)}
              className="rounded border border-[#DCDDD9] bg-white px-2.5 py-1 text-xs text-[#1B4D3E] font-mono font-semibold focus:border-[#1B4D3E] focus:outline-none"
            >
              <option value="">-- Select Open Job --</option>
              {openJobCards.map(j => {
                const veh = vehicles.find(v => v.id === j.vehicleId);
                return (
                  <option key={j.id} value={j.id}>
                    {j.jobNumber} — {veh?.registrationNumber} ({j.complaint.slice(0, 24)}...)
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </div>

      {/* POS Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Client Selection + Catalog (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Customer & Vehicle Selector */}
          <div className="rounded border border-[#DCDDD9] bg-white p-3 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Customer */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                    Customer Account *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuickCustomerOpen(true)}
                    className="text-[11px] font-medium text-[#1B4D3E] hover:underline"
                  >
                    + New Customer
                  </button>
                </div>
                <select
                  value={selectedCustomerId}
                  onChange={e => {
                    setSelectedCustomerId(e.target.value);
                    setSelectedVehicleId('');
                  }}
                  className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.fullName} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Vehicle */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                    Vehicle Plate *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (!selectedCustomerId) {
                        alert('Select a customer first to add a vehicle.');
                        return;
                      }
                      setIsQuickVehicleOpen(true);
                    }}
                    className="text-[11px] font-medium text-[#1B4D3E] hover:underline"
                  >
                    + Register Vehicle
                  </button>
                </div>
                <select
                  value={selectedVehicleId}
                  onChange={e => setSelectedVehicleId(e.target.value)}
                  disabled={!selectedCustomerId}
                  className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none disabled:bg-[#F5F5F3]"
                >
                  <option value="">
                    {selectedCustomerId ? '-- Choose Vehicle Plate --' : 'Select Customer First'}
                  </option>
                  {customerVehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} — {v.make} {v.model} ({v.year})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedVehicleId && (
              <div className="text-[11px] text-[#6B706D] bg-[#F5F5F3] px-2 py-1 rounded flex items-center justify-between font-mono">
                <span>Selected: {vehicles.find(v => v.id === selectedVehicleId)?.registrationNumber}</span>
                <span>Odometer: {vehicles.find(v => v.id === selectedVehicleId)?.mileage.toLocaleString()} km</span>
              </div>
            )}
          </div>

          {/* Catalog: Tabs (Parts, Labour, Quick Presets) */}
          <div className="rounded border border-[#DCDDD9] bg-white">
            {/* Catalog Tab Buttons */}
            <div className="flex border-b border-[#DCDDD9] bg-[#FAFAF9] px-3 pt-2 gap-2 text-xs">
              <button
                onClick={() => setActiveCatalogTab('parts')}
                className={`pb-2 px-3 font-semibold transition-colors border-b-2 -mb-[1px] ${
                  activeCatalogTab === 'parts'
                    ? 'border-[#1B4D3E] text-[#1B4D3E]'
                    : 'border-transparent text-[#6B706D] hover:text-[#202321]'
                }`}
              >
                Auto Parts & Stock
              </button>
              <button
                onClick={() => setActiveCatalogTab('labour')}
                className={`pb-2 px-3 font-semibold transition-colors border-b-2 -mb-[1px] ${
                  activeCatalogTab === 'labour'
                    ? 'border-[#1B4D3E] text-[#1B4D3E]'
                    : 'border-transparent text-[#6B706D] hover:text-[#202321]'
                }`}
              >
                Technician Labour
              </button>
              <button
                onClick={() => setActiveCatalogTab('presets')}
                className={`pb-2 px-3 font-semibold transition-colors border-b-2 -mb-[1px] ${
                  activeCatalogTab === 'presets'
                    ? 'border-[#1B4D3E] text-[#1B4D3E]'
                    : 'border-transparent text-[#6B706D] hover:text-[#202321]'
                }`}
              >
                Quick Services
              </button>
            </div>

            {/* Content Tab: Parts */}
            {activeCatalogTab === 'parts' && (
              <div className="p-3 space-y-3">
                {/* Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#6B706D]" />
                    <input
                      type="text"
                      placeholder="Search parts by name, SKU, brand..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      className="w-full rounded border border-[#DCDDD9] bg-[#F5F5F3] pl-8 pr-3 py-1.5 text-xs text-[#202321] placeholder-[#6B706D] focus:border-[#1B4D3E] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Parts Table */}
                <div className="max-h-[360px] overflow-y-auto divide-y divide-[#DCDDD9] border border-[#DCDDD9] rounded">
                  {filteredProducts.length === 0 ? (
                    <div className="py-8 text-center text-xs text-[#6B706D]">
                      No products matched "{productSearch}"
                    </div>
                  ) : (
                    filteredProducts.map(p => {
                      const isLow = p.currentQuantity <= p.minStockLevel;
                      const isOut = p.currentQuantity <= 0;

                      return (
                        <div
                          key={p.id}
                          onClick={() => !isOut && handleAddProduct(p)}
                          className={`p-2.5 flex items-center justify-between text-xs transition-colors ${
                            isOut
                              ? 'bg-[#F5F5F3] opacity-60 cursor-not-allowed'
                              : 'hover:bg-[#F5F5F3] cursor-pointer'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-[#202321] truncate">{p.name}</div>
                            <div className="text-[11px] text-[#6B706D] font-mono mt-0.5 flex items-center gap-2">
                              <span>{p.sku}</span>
                              <span>·</span>
                              <span>{p.brand}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <div className="font-mono font-bold text-[#202321]">
                                {formatPKR(p.sellingPrice)}
                              </div>
                              <span
                                className={`text-[10px] font-mono ${
                                  isOut
                                    ? 'text-[#DC2626] font-bold'
                                    : isLow
                                    ? 'text-[#B45309]'
                                    : 'text-[#15803D]'
                                }`}
                              >
                                {p.currentQuantity} {p.unit} in stock
                              </span>
                            </div>

                            <button
                              type="button"
                              disabled={isOut}
                              className="rounded border border-[#DCDDD9] bg-white p-1 text-[#202321] hover:bg-[#1B4D3E] hover:text-white transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Content Tab: Labour Allocation */}
            {activeCatalogTab === 'labour' && (
              <div className="p-3 space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider block mb-1">
                      Assigned Mechanic *
                    </label>
                    <select
                      value={selectedLabourId}
                      onChange={e => setSelectedLabourId(e.target.value)}
                      className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                    >
                      <option value="">-- Choose Mechanic --</option>
                      {labourWorkers.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.name} — {w.role} (Daily: {formatPKR(w.dailyRate)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider block mb-1">
                      Service / Job Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Brake Pad Replacement, Engine Tuneup"
                      value={labourDesc}
                      onChange={e => setLabourDesc(e.target.value)}
                      className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider block mb-1">
                      Customer Charge (PKR)
                    </label>
                    <input
                      type="number"
                      value={labourCharge}
                      onChange={e => setLabourCharge(Number(e.target.value))}
                      className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] font-mono focus:border-[#1B4D3E] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider block mb-1">
                      Mechanic Wage Cost (PKR)
                    </label>
                    <input
                      type="number"
                      value={labourCost}
                      onChange={e => setLabourCost(Number(e.target.value))}
                      className="w-full rounded border border-[#DCDDD9] bg-white px-2.5 py-1.5 text-xs text-[#202321] font-mono focus:border-[#1B4D3E] focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddLabour}
                  className="rounded bg-[#1B4D3E] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32] transition-colors"
                >
                  + Add Labour to Invoice
                </button>
              </div>
            )}

            {/* Content Tab: Quick Presets */}
            {activeCatalogTab === 'presets' && (
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { name: 'Standard Oil Change Service Labour', charge: 800, cost: 500 },
                  { name: 'Brake Disc Inspection & Caliper Bleed', charge: 1500, cost: 1000 },
                  { name: 'Full Engine Tune-up & Throttle Body Clean', charge: 2500, cost: 1800 },
                  { name: 'Suspension Check & Bushing Lubrication', charge: 1200, cost: 800 },
                  { name: 'AC Filter Check & Gas Top-up', charge: 3500, cost: 2400 },
                  { name: 'Diagnostic Scan (OBD-II Code Check)', charge: 1000, cost: 300 }
                ].map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleAddPresetService(preset.name, preset.charge, preset.cost)}
                    className="p-2.5 border border-[#DCDDD9] rounded hover:border-[#1B4D3E] hover:bg-[#FAFAF9] cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-[#202321]">{preset.name}</div>
                      <div className="text-[10px] text-[#6B706D] font-mono">Cost: {formatPKR(preset.cost)}</div>
                    </div>
                    <div className="font-mono font-bold text-[#1B4D3E]">
                      {formatPKR(preset.charge)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Bill / Invoice Slip (5 Cols) */}
        <div className="lg:col-span-5 rounded border border-[#DCDDD9] bg-white flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="border-b border-[#DCDDD9] px-4 py-2.5 bg-[#FAFAF9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-[#1B4D3E]" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#202321]">
                  Invoice Slip ({cartItems.length} items)
                </h2>
              </div>
              {cartItems.length > 0 && (
                <button
                  onClick={() => setCartItems([])}
                  className="text-[11px] text-[#DC2626] hover:underline font-medium"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="p-3 max-h-[320px] overflow-y-auto divide-y divide-[#DCDDD9]">
              {cartItems.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#6B706D]">
                  No items added yet. Click on parts or labour on the left to build the bill.
                </div>
              ) : (
                cartItems.map(item => (
                  <div key={item.id} className="py-2 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-[#202321] truncate">{item.name}</div>
                      <div className="text-[11px] text-[#6B706D] font-mono">
                        {formatPKR(item.unitPrice)} each
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.type === 'part' ? (
                        <div className="flex items-center border border-[#DCDDD9] rounded">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, item.quantity - 1)}
                            className="px-1.5 py-0.5 text-xs text-[#6B706D] hover:bg-[#F5F5F3]"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-medium text-[#202321]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.id, item.quantity + 1)}
                            className="px-1.5 py-0.5 text-xs text-[#6B706D] hover:bg-[#F5F5F3]"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono text-[11px] bg-[#F5F5F3] px-1.5 py-0.5 rounded text-[#6B706D]">
                          1 unit
                        </span>
                      )}

                      <div className="w-18 text-right font-mono font-bold text-[#202321]">
                        {formatPKR(item.totalPrice)}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCartItem(item.id)}
                        className="text-[#6B706D] hover:text-[#DC2626] p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Checkout Totals & Payment Actions */}
          <div className="border-t border-[#DCDDD9] p-3.5 bg-[#FAFAF9] space-y-3">
            {/* Subtotals breakdown */}
            <div className="space-y-1 text-xs text-[#6B706D] font-mono">
              <div className="flex justify-between">
                <span>Parts Subtotal:</span>
                <span>{formatPKR(partsTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Labour / Services:</span>
                <span>{formatPKR(labourTotal + servicesTotal)}</span>
              </div>

              {/* Discount Input */}
              <div className="flex justify-between items-center pt-1 border-t border-[#DCDDD9]">
                <span className="font-sans text-[11px]">Discount (PKR):</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                  className="w-20 rounded border border-[#DCDDD9] bg-white px-2 py-0.5 text-right text-xs font-mono text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              {/* Tax Rate Input */}
              <div className="flex justify-between items-center">
                <span className="font-sans text-[11px]">Tax Rate (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={taxRate}
                  onChange={e => setTaxRate(Math.max(0, Number(e.target.value)))}
                  className="w-20 rounded border border-[#DCDDD9] bg-white px-2 py-0.5 text-right text-xs font-mono text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center pt-2 border-t border-[#DCDDD9] text-sm text-[#202321] font-bold">
                <span className="font-sans">Grand Total:</span>
                <span className="text-base text-[#1B4D3E]">{formatPKR(grandTotal)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 border-t border-[#DCDDD9] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="text-[11px] font-semibold text-[#6B706D] uppercase tracking-wider">
                  Payment Method
                </label>
                <div className="flex gap-1">
                  {(['Cash', 'Bank Transfer', 'JazzCash / EasyPaisa', 'Card'] as PaymentMethod[]).map(pm => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`px-2 py-0.5 text-[11px] rounded border transition-colors ${
                        paymentMethod === pm
                          ? 'border-[#1B4D3E] bg-[#E8F0EC] text-[#1B4D3E] font-semibold'
                          : 'border-[#DCDDD9] bg-white text-[#6B706D] hover:bg-[#F5F5F3]'
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Paid vs Balance */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-[#6B706D] block mb-0.5">Amount Paid (PKR):</label>
                  <input
                    type="number"
                    value={amountPaid === null ? grandTotal : amountPaid}
                    onChange={e => setAmountPaid(Number(e.target.value))}
                    className="w-full rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs font-mono font-semibold text-[#202321] focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#6B706D] block mb-0.5">Balance Due:</label>
                  <div className={`p-1 rounded font-mono font-bold text-xs ${
                    balanceDue > 0 ? 'text-[#DC2626] bg-[#FEE2E2]' : 'text-[#15803D] bg-[#DCFCE7]'
                  }`}>
                    {formatPKR(balanceDue)}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <input
                type="text"
                placeholder="Invoice notes / warranty remarks..."
                value={invoiceNotes}
                onChange={e => setInvoiceNotes(e.target.value)}
                className="w-full rounded border border-[#DCDDD9] bg-white px-2 py-1 text-xs text-[#202321] placeholder-[#6B706D] focus:border-[#1B4D3E] focus:outline-none"
              />

              {/* Complete & Issue Bill Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={cartItems.length === 0}
                className="w-full rounded bg-[#1B4D3E] py-2 text-xs font-bold text-white hover:bg-[#153E32] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-1.5"
              >
                <Check className="h-4 w-4" />
                <span>Issue & Print Workshop Bill</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Customer Modal */}
      {isQuickCustomerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/40 p-4">
          <div className="w-full max-w-sm rounded border border-[#DCDDD9] bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#202321]">
                Quick Add Customer
              </h3>
              <button
                onClick={() => setIsQuickCustomerOpen(false)}
                className="text-[#6B706D] hover:text-[#202321]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickCustomer} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Mehmood"
                  value={quickCustName}
                  onChange={e => setQuickCustName(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="0300-1234567"
                  value={quickCustPhone}
                  onChange={e => setQuickCustPhone(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Address / City</label>
                <input
                  type="text"
                  placeholder="e.g. Gulberg, Lahore"
                  value={quickCustAddress}
                  onChange={e => setQuickCustAddress(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setIsQuickCustomerOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#6B706D] hover:text-[#202321]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32]"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Vehicle Modal */}
      {isQuickVehicleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#202321]/40 p-4">
          <div className="w-full max-w-sm rounded border border-[#DCDDD9] bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#DCDDD9] pb-2 mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#202321]">
                Register Vehicle Plate
              </h3>
              <button
                onClick={() => setIsQuickVehicleOpen(false)}
                className="text-[#6B706D] hover:text-[#202321]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickVehicle} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Registration Plate *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LEA-21-9988"
                  value={quickVehReg}
                  onChange={e => setQuickVehReg(e.target.value)}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Make</label>
                  <select
                    value={quickVehMake}
                    onChange={e => setQuickVehMake(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  >
                    {['Toyota', 'Honda', 'Suzuki', 'Hyundai', 'KIA', 'MG', 'Nissan'].map(m => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yaris, Civic"
                    value={quickVehModel}
                    onChange={e => setQuickVehModel(e.target.value)}
                    className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#6B706D] block mb-1">Current Odometer (km)</label>
                <input
                  type="number"
                  value={quickVehMileage}
                  onChange={e => setQuickVehMileage(Number(e.target.value))}
                  className="w-full rounded border border-[#DCDDD9] px-2.5 py-1.5 focus:border-[#1B4D3E] focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#DCDDD9]">
                <button
                  type="button"
                  onClick={() => setIsQuickVehicleOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#6B706D] hover:text-[#202321]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded bg-[#1B4D3E] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153E32]"
                >
                  Register & Attach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Detail / Print Modal */}
      {completedInvoiceId && (
        <InvoiceDetailModal
          invoiceId={completedInvoiceId}
          onClose={() => setCompletedInvoiceId(null)}
        />
      )}
    </div>
  );
};
