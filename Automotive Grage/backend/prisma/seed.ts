import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Private Garage Database via Prisma...');

  // 1. Garage Settings
  await prisma.garageSetting.upsert({
    where: { id: 'garage-config-main' },
    update: {},
    create: {
      id: 'garage-config-main',
      shopName: 'Umair Ullah Auto Workshop',
      garageName: 'Umair Ullah Auto Workshop',
      garageOwnerName: 'Umair Ullah',
      garagePhone: '+92 300 1234567',
      garageEmail: 'owner@example.com',
      address: 'Main Workshop Boulevard, Commercial Area, Lahore',
      currency: 'Rs.',
      defaultTaxRate: 0.0,
      privateMode: true,
      setupCompleted: true,
      lowStockThreshold: 5
    }
  });

  // 2. Owner User Account
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('umair123#', salt);

  const owner = await prisma.user.upsert({
    where: { username: 'umair' },
    update: {},
    create: {
      name: 'Umair Ullah',
      username: 'umair',
      email: 'owner@example.com',
      phone: '+92 300 1234567',
      role: 'owner',
      status: 'active',
      passwordHash,
      salt
    }
  });
  console.log(`👤 Master Owner Seeded: ${owner.username} (${owner.name})`);

  // 3. Categories
  const catFluids = await prisma.category.upsert({
    where: { name: 'Engine Oil & Lubricants' },
    update: {},
    create: { name: 'Engine Oil & Lubricants' }
  });

  const catBrakes = await prisma.category.upsert({
    where: { name: 'Brake System' },
    update: {},
    create: { name: 'Brake System' }
  });

  // 4. Products
  const prodOil = await prisma.product.upsert({
    where: { sku: 'OIL-SHL-5W40' },
    update: {},
    create: {
      sku: 'OIL-SHL-5W40',
      name: 'Shell Helix Ultra 5W-40 Synthetic (4L)',
      categoryId: catFluids.id,
      brand: 'Shell',
      purchasePrice: 7800,
      sellingPrice: 10500,
      currentQuantity: 48,
      minStockLevel: 5,
      unit: 'bottles'
    }
  });

  const prodBrake = await prisma.product.upsert({
    where: { sku: 'BRK-AKB-001' },
    update: {},
    create: {
      sku: 'BRK-AKB-001',
      name: 'Akebono Ceramic Front Brake Pads',
      categoryId: catBrakes.id,
      brand: 'Akebono',
      purchasePrice: 4200,
      sellingPrice: 6400,
      currentQuantity: 12,
      minStockLevel: 4,
      unit: 'sets'
    }
  });

  // 5. Customer & Vehicle
  let customer = await prisma.customer.findFirst({
    where: { phone: '+92 300 5551234' }
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        fullName: 'Muhammad Bilal Khan',
        phone: '+92 300 5551234',
        email: 'bilal.khan@example.com',
        address: 'House 42, Street 8, Cavalry Ground, Lahore'
      }
    });
  }

  let vehicle = await prisma.vehicle.findUnique({
    where: { registrationNumber: 'LEA-2022-789' }
  });

  if (!vehicle) {
    vehicle = await prisma.vehicle.create({
      data: {
        customerId: customer.id,
        registrationNumber: 'LEA-2022-789',
        make: 'Toyota',
        model: 'Corolla Altis Grande 1.8',
        year: 2022,
        color: 'Super White',
        currentMileage: 38400,
        fuelType: 'Petrol'
      }
    });
  }

  // 6. Labour Worker
  let worker = await prisma.labourWorker.findFirst({
    where: { name: 'Ustad Tariq Mehmood' }
  });

  if (!worker) {
    worker = await prisma.labourWorker.create({
      data: {
        name: 'Ustad Tariq Mehmood',
        phone: '+92 302 9988776',
        position: 'Head Master Mechanic',
        rateType: 'daily',
        rateAmount: 2500,
        status: 'active'
      }
    });
  }

  // 7. Repair Job Card
  let job = await prisma.repairJob.findUnique({
    where: { jobNumber: 'JOB-2026-0001' }
  });

  if (!job) {
    job = await prisma.repairJob.create({
      data: {
        jobNumber: 'JOB-2026-0001',
        customerId: customer.id,
        vehicleId: vehicle.id,
        mileageIn: 38400,
        customerComplaint: 'Front brake grinding noise and periodic 5,000 KM oil maintenance service',
        diagnosis: 'Front brake pads worn to 2mm. Engine oil dark, oil filter due for replacement.',
        workRequired: 'Replace front pads, replace engine oil & filter, general brake disc service.',
        status: 'completed',
        estimatedCost: 19500,
        finalCost: 18900
      }
    });
  }

  // 8. Invoice
  let invoice = await prisma.invoice.findUnique({
    where: { invoiceNumber: 'INV-2026-0001' }
  });

  if (!invoice) {
    invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: 'INV-2026-0001',
        jobId: job.id,
        customerId: customer.id,
        vehicleId: vehicle.id,
        date: new Date('2026-09-28'),
        issuedBy: owner.name,
        partsTotal: 10500,
        partsCost: 7800,
        labourTotal: 2000,
        labourCost: 1200,
        servicesTotal: 0,
        servicesCost: 0,
        subtotal: 12500,
        discount: 500,
        grandTotal: 12000,
        paidAmount: 12000,
        balanceDue: 0,
        paymentStatus: 'Paid',
        paymentMethod: 'Cash',
        items: {
          create: [
            {
              productId: prodOil.id,
              name: prodOil.name,
              quantity: 1,
              unitPrice: 10500,
              totalPrice: 10500,
              unitCost: 7800,
              totalCost: 7800
            },
            {
              name: 'Labour: Oil & Filter Service',
              quantity: 1,
              unitPrice: 2000,
              totalPrice: 2000,
              unitCost: 1200,
              totalCost: 1200
            }
          ]
        },
        payments: {
          create: {
            amount: 12000,
            paymentMethod: 'Cash',
            receivedBy: owner.name,
            notes: 'Settled in full at counter'
          }
        }
      }
    });
  }

  // 9. Dedicated Workshop Rent (Requirement 8)
  await prisma.workshopRent.create({
    data: {
      month: '2026-09',
      monthLabel: 'September 2026',
      amount: 80000,
      paidAmount: 80000,
      paymentDate: new Date('2026-09-05'),
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      notes: 'Main workshop premises rent paid to landlord Malik Saeed'
    }
  });

  // 10. Dedicated Electricity Bills (Requirement 9)
  await prisma.electricityBill.create({
    data: {
      billingMonth: '2026-09',
      monthLabel: 'September 2026',
      billNumber: 'LESCO-2026-09-8812',
      previousReading: 14210,
      currentReading: 14980,
      unitsConsumed: 770,
      billAmount: 38500,
      paidAmount: 38500,
      issueDate: new Date('2026-09-08'),
      dueDate: new Date('2026-09-18'),
      paymentDate: new Date('2026-09-15'),
      paymentMethod: 'Online Bank',
      status: 'Paid',
      notes: '3-phase commercial workshop connection'
    }
  });

  // 11. Dedicated Licenses & Permits (Requirement 10)
  await prisma.licenseRecord.create({
    data: {
      name: 'Workshop Municipal Commercial Trade License',
      licenseNumber: 'LMC-TRD-2026-0994',
      issuingAuthority: 'Lahore Municipal Corporation',
      issueDate: new Date('2026-01-10'),
      expiryDate: new Date('2027-01-09'),
      renewalCost: 25000,
      paymentDate: new Date('2026-01-10'),
      paymentMethod: 'Bank Transfer',
      status: 'Active',
      notes: 'Annual commercial repair workshop premises trade certification'
    }
  });

  // 12. Daily Operational Expenses (Food, Tea, Transport, Operations - Requirements 2, 3, 4, 5, 6)
  const sampleExpenses = [
    {
      title: 'Workshop Staff Morning Breakfast (Halwa Puri & Channay)',
      category: 'Breakfast',
      type: 'daily',
      amount: 800,
      date: new Date('2026-09-29T08:30:00Z'),
      paymentMethod: 'Cash',
      status: 'Paid',
      paidBy: owner.name,
      notes: 'Morning breakfast for 5 workshop mechanics'
    },
    {
      title: 'Workshop Morning Doodh Patti Tea Round',
      category: 'Tea',
      type: 'daily',
      amount: 150,
      date: new Date('2026-09-29T10:45:00Z'),
      paymentMethod: 'Cash',
      status: 'Paid',
      paidBy: owner.name,
      notes: 'Morning tea from Tariq Tea Stall'
    },
    {
      title: 'Workshop Evening Tea & Rusks Round',
      category: 'Tea',
      type: 'daily',
      amount: 150,
      date: new Date('2026-09-29T16:30:00Z'),
      paymentMethod: 'Cash',
      status: 'Paid',
      paidBy: owner.name,
      notes: 'Evening tea round'
    },
    {
      title: 'Workshop Staff Afternoon Lunch (Biryani)',
      category: 'Lunch',
      type: 'daily',
      amount: 1200,
      date: new Date('2026-09-29T13:30:00Z'),
      paymentMethod: 'Cash',
      status: 'Paid',
      paidBy: owner.name,
      notes: 'Lunch for technical staff'
    },
    {
      title: 'Late Shift Mechanics Dinner',
      category: 'Dinner',
      type: 'daily',
      amount: 1500,
      date: new Date('2026-09-28T21:00:00Z'),
      paymentMethod: 'Cash',
      status: 'Paid',
      paidBy: owner.name,
      notes: 'Overtime team dinner'
    },
    {
      title: 'Parts Pickup Conveyance (Petrol for Workshop Bike)',
      category: 'Petrol/Fuel',
      type: 'daily',
      amount: 1000,
      date: new Date('2026-09-29T11:15:00Z'),
      paymentMethod: 'Cash',
      status: 'Paid',
      paidBy: owner.name,
      notes: 'Collected brake pads & suspension bushes from Montgomery Road auto market'
    },
    {
      title: 'Daily Workshop Floor Washing & Degreaser Chemical',
      category: 'Cleaning',
      type: 'daily',
      amount: 600,
      date: new Date('2026-09-29T09:00:00Z'),
      paymentMethod: 'Cash',
      status: 'Paid',
      paidBy: owner.name,
      notes: 'Floor cleaner and waste oil rags'
    },
    {
      title: 'Hydraulic 2-Post Lift Periodic Greasing & Valve Maintenance',
      category: 'Maintenance',
      type: 'workshop',
      amount: 3500,
      date: new Date('2026-09-25T14:00:00Z'),
      paymentMethod: 'Cash',
      status: 'Paid',
      paidBy: owner.name,
      notes: 'Bay 1 lift routine servicing'
    }
  ];

  for (const exp of sampleExpenses) {
    await prisma.expense.create({
      data: exp
    });
  }

  console.log(`✅ Sample Data Seeded: Invoice ${invoice.invoiceNumber}, Job ${job.jobNumber}, Rent, Electricity, Licenses & Daily Expenses.`);
  console.log('🎉 Prisma SQLite Database Seed Complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
