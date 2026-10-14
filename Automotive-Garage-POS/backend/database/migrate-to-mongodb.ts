/**
 * Migration Script: Migrate Garage Records to MongoDB
 * Connects to MongoDB Atlas or local MongoDB using Prisma and upserts all records.
 * File: database/scripts/migrate-to-mongodb.ts
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateToMongo() {
  console.log('============================================================');
  console.log('🍃 GARAGE DATABASE MIGRATION TO MONGODB');
  console.log('============================================================');

  const mongoUrl = process.env.DATABASE_URL || process.env.MONGODB_URI;

  if (!mongoUrl || !mongoUrl.startsWith('mongodb')) {
    console.error('❌ Error: DATABASE_URL must be a valid MongoDB connection string.');
    console.error('   Example:');
    console.error('   DATABASE_URL="mongodb+srv://<username>:<password>@cluster0.mongodb.net/garage_pos?retryWrites=true&w=majority"');
    console.error('   or for local MongoDB:');
    console.error('   DATABASE_URL="mongodb://localhost:27017/garage_pos"');
    process.exit(1);
  }

  // Find latest backup file or initialize fresh
  const backupDir = path.join(process.cwd(), 'database', 'backups');
  let backupData: any = null;

  if (fs.existsSync(backupDir)) {
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).sort().reverse();
    if (files.length > 0) {
      const latestFile = path.join(backupDir, files[0]);
      console.log(`📂 Found local backup snapshot: ${latestFile}`);
      backupData = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
    }
  }

  try {
    console.log(`🔌 Connecting to MongoDB...`);
    await prisma.$connect();
    console.log('✅ Connected to MongoDB successfully!');

    if (backupData?.data) {
      const { settings, users, customers, vehicles, products, invoices, payments, expenses } = backupData.data;

      console.log('🔄 Migrating garage configuration...');
      for (const s of settings || []) {
        await prisma.garageSetting.upsert({
          where: { id: s.id },
          update: s,
          create: s
        });
      }

      console.log(`🔄 Migrating ${users?.length || 0} user accounts...`);
      for (const u of users || []) {
        await prisma.user.upsert({
          where: { username: u.username },
          update: u,
          create: u
        });
      }

      console.log(`🔄 Migrating ${customers?.length || 0} customers...`);
      for (const c of customers || []) {
        await prisma.customer.upsert({
          where: { id: c.id },
          update: c,
          create: c
        });
      }

      console.log(`🔄 Migrating ${vehicles?.length || 0} vehicles...`);
      for (const v of vehicles || []) {
        await prisma.vehicle.upsert({
          where: { id: v.id },
          update: v,
          create: v
        });
      }

      console.log(`🔄 Migrating ${products?.length || 0} inventory items...`);
      for (const p of products || []) {
        await prisma.product.upsert({
          where: { id: p.id },
          update: p,
          create: p
        });
      }

      console.log(`🔄 Migrating ${invoices?.length || 0} invoices and ${payments?.length || 0} payments...`);
      for (const inv of invoices || []) {
        await prisma.invoice.upsert({
          where: { id: inv.id },
          update: inv,
          create: inv
        });
      }

      for (const pmt of payments || []) {
        await prisma.payment.upsert({
          where: { id: pmt.id },
          update: pmt,
          create: pmt
        });
      }

      console.log(`🔄 Migrating ${expenses?.length || 0} expenses...`);
      for (const exp of expenses || []) {
        await prisma.expense.upsert({
          where: { id: exp.id },
          update: exp,
          create: exp
        });
      }

      // Verification
      const targetCustomers = await prisma.customer.count();
      const targetVehicles = await prisma.vehicle.count();
      const targetInvoices = await prisma.invoice.count();
      const targetUsers = await prisma.user.count();

      console.log('\n============================================================');
      console.log('📊 MONGODB MIGRATION VERIFICATION AUDIT');
      console.log('============================================================');
      console.log(`  Source Customers: ${customers?.length || 0} -> MongoDB: ${targetCustomers}`);
      console.log(`  Source Vehicles:  ${vehicles?.length || 0} -> MongoDB: ${targetVehicles}`);
      console.log(`  Source Invoices:  ${invoices?.length || 0} -> MongoDB: ${targetInvoices}`);
      console.log(`  Source Users:     ${users?.length || 0} -> MongoDB: ${targetUsers}`);
      console.log('✅ Migration to MongoDB completed successfully!');
    } else {
      console.log('ℹ️ No backup found to migrate. Push schema collections via `npx prisma db push`');
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateToMongo();
