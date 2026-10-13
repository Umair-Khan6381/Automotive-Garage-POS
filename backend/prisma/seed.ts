import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Initializing Clean Garage Database via Prisma...');

  // 1. Garage Settings
  await prisma.garageSetting.upsert({
    where: { id: 'garage-config-main' },
    update: {},
    create: {
      id: 'garage-config-main',
      shopName: 'Automotive Garage',
      garageName: 'Automotive Garage',
      garageOwnerName: 'Umair Ullah',
      garagePhone: '+971 50 789 4521',
      garageEmail: 'owner@umairautocare.ae',
      address: '',
      currency: 'AED',
      defaultTaxRate: 5.0,
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
      email: 'owner@umairautocare.ae',
      phone: '+971 50 789 4521',
      role: 'owner',
      status: 'active',
      passwordHash,
      salt
    }
  });
  console.log(`👤 Master Owner Configured: ${owner.username} (${owner.name})`);
  console.log('✅ Database is clean and ready for your live data (0 customers, 0 vehicles, 0 jobs, 0 invoices).');
}

main()
  .catch((e) => {
    console.error('❌ Error initializing database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
