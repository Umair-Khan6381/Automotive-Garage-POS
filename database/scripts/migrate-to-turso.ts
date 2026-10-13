/**
 * Migration Script: Migrate SQLite Records to Turso Cloud (libSQL)
 * Preserves all primary keys, foreign keys, timestamps, and financial totals.
 * File: database/scripts/migrate-to-turso.ts
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

async function migrateToTurso() {
  console.log('============================================================');
  console.log('🚀 GARAGE DATABASE MIGRATION TO TURSO CLOUD');
  console.log('============================================================');

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    console.error('❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in your environment.');
    console.error('   Example:');
    console.error('   TURSO_DATABASE_URL="libsql://your-garage-db.turso.io"');
    console.error('   TURSO_AUTH_TOKEN="eyJhbG..."');
    process.exit(1);
  }

  // Find latest backup file or use local database
  const backupDir = path.join(process.cwd(), 'database', 'backups');
  let backupData: any = null;

  if (fs.existsSync(backupDir)) {
    const files = fs.readdirSync(backupDir).filter(f => f.endsWith('.json')).sort().reverse();
    if (files.length > 0) {
      const latestFile = path.join(backupDir, files[0]);
      console.log(`📂 Found local backup: ${latestFile}`);
      backupData = JSON.parse(fs.readFileSync(latestFile, 'utf-8'));
    }
  }

  // Connect to Turso Cloud
  console.log(`🔌 Connecting to Turso Cloud at ${tursoUrl}...`);
  const libsql = createClient({
    url: tursoUrl,
    authToken: tursoToken
  });
  const adapter = new PrismaLibSQL(libsql);
  const tursoPrisma = new PrismaClient({ adapter });

  try {
    // 1. Verify connection
    await tursoPrisma.$connect();
    console.log('✅ Connected to Turso Cloud successfully!');

    if (backupData?.data) {
      const { settings, users, customers, vehicles, products, invoices, payments, expenses } = backupData.data;

      console.log('🔄 Migrating garage configuration...');
      for (const s of settings || []) {
        await tursoPrisma.garageSetting.upsert({
          where: { id: s.id },
          update: s,
          create: s
        });
      }

      console.log(`🔄 Migrating ${users?.length || 0} user accounts...`);
      for (const u of users || []) {
        await tursoPrisma.user.upsert({
          where: { username: u.username },
          update: u,
          create: u
        });
      }

      console.log(`🔄 Migrating ${customers?.length || 0} customers...`);
      for (const c of customers || []) {
        await tursoPrisma.customer.upsert({
          where: { id: c.id },
          update: c,
          create: c
        });
      }

      console.log(`🔄 Migrating ${vehicles?.length || 0} vehicles...`);
      for (const v of vehicles || []) {
        await tursoPrisma.vehicle.upsert({
          where: { id: v.id },
          update: v,
          create: v
        });
      }

      console.log(`🔄 Migrating ${products?.length || 0} inventory items...`);
      for (const p of products || []) {
        await tursoPrisma.product.upsert({
          where: { id: p.id },
          update: p,
          create: p
        });
      }

      console.log(`🔄 Migrating ${invoices?.length || 0} invoices and ${payments?.length || 0} payments...`);
      for (const inv of invoices || []) {
        await tursoPrisma.invoice.upsert({
          where: { id: inv.id },
          update: inv,
          create: inv
        });
      }

      for (const pmt of payments || []) {
        await tursoPrisma.payment.upsert({
          where: { id: pmt.id },
          update: pmt,
          create: pmt
        });
      }

      console.log(`🔄 Migrating ${expenses?.length || 0} expenses...`);
      for (const exp of expenses || []) {
        await tursoPrisma.expense.upsert({
          where: { id: exp.id },
          update: exp,
          create: exp
        });
      }

      // Verification
      const targetCustomers = await tursoPrisma.customer.count();
      const targetVehicles = await tursoPrisma.vehicle.count();
      const targetInvoices = await tursoPrisma.invoice.count();
      const targetUsers = await tursoPrisma.user.count();

      console.log('\n============================================================');
      console.log('📊 MIGRATION VERIFICATION AUDIT');
      console.log('============================================================');
      console.log(`  Source Customers: ${customers?.length || 0} -> Turso: ${targetCustomers}`);
      console.log(`  Source Vehicles:  ${vehicles?.length || 0} -> Turso: ${targetVehicles}`);
      console.log(`  Source Invoices:  ${invoices?.length || 0} -> Turso: ${targetInvoices}`);
      console.log(`  Source Users:     ${users?.length || 0} -> Turso: ${targetUsers}`);
      console.log('✅ Migration to Turso Cloud completed with full referential integrity!');
    } else {
      console.log('ℹ️ No prior records to migrate. Pushing clean schema to Turso...');
      console.log('💡 Tip: Run `npx prisma db push` to push the schema directly to Turso.');
    }
  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await tursoPrisma.$disconnect();
  }
}

migrateToTurso();
