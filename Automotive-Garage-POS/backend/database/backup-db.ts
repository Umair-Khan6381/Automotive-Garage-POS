/**
 * Database Backup Script
 * Exports all existing tables and records from the local SQLite/Prisma database to a JSON backup file
 * File: database/scripts/backup-db.ts
 */

import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'database', 'backups');

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(backupDir, `garage_backup_${timestamp}.json`);
  console.log(`📦 Starting Database Backup to: ${backupFilePath}...`);

  try {
    // 1. Query all tables safely
    const [
      settings,
      users,
      customers,
      vehicles,
      categories,
      suppliers,
      products,
      transactions,
      purchases,
      purchaseItems,
      labourWorkers,
      labourPayments,
      repairJobs,
      jobParts,
      jobLabour,
      jobPhotos,
      invoices,
      invoiceItems,
      payments,
      expenses,
      workshopRents,
      electricityBills,
      licenseRecords,
      oilChanges,
      auditLogs
    ] = await Promise.all([
      prisma.garageSetting.findMany().catch(() => []),
      prisma.user.findMany().catch(() => []),
      prisma.customer.findMany().catch(() => []),
      prisma.vehicle.findMany().catch(() => []),
      prisma.category.findMany().catch(() => []),
      prisma.supplier.findMany().catch(() => []),
      prisma.product.findMany().catch(() => []),
      prisma.inventoryTransaction.findMany().catch(() => []),
      prisma.purchase.findMany().catch(() => []),
      prisma.purchaseItem.findMany().catch(() => []),
      prisma.labourWorker.findMany().catch(() => []),
      prisma.labourPayment.findMany().catch(() => []),
      prisma.repairJob.findMany().catch(() => []),
      prisma.jobPart.findMany().catch(() => []),
      prisma.jobLabour.findMany().catch(() => []),
      prisma.jobPhoto.findMany().catch(() => []),
      prisma.invoice.findMany().catch(() => []),
      prisma.invoiceItem.findMany().catch(() => []),
      prisma.payment.findMany().catch(() => []),
      prisma.expense.findMany().catch(() => []),
      prisma.workshopRent.findMany().catch(() => []),
      prisma.electricityBill.findMany().catch(() => []),
      prisma.licenseRecord.findMany().catch(() => []),
      prisma.oilChange.findMany().catch(() => []),
      prisma.auditLog.findMany().catch(() => [])
    ]);

    const backupPayload = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      counts: {
        settings: settings.length,
        users: users.length,
        customers: customers.length,
        vehicles: vehicles.length,
        categories: categories.length,
        suppliers: suppliers.length,
        products: products.length,
        transactions: transactions.length,
        purchases: purchases.length,
        purchaseItems: purchaseItems.length,
        labourWorkers: labourWorkers.length,
        labourPayments: labourPayments.length,
        repairJobs: repairJobs.length,
        jobParts: jobParts.length,
        jobLabour: jobLabour.length,
        jobPhotos: jobPhotos.length,
        invoices: invoices.length,
        invoiceItems: invoiceItems.length,
        payments: payments.length,
        expenses: expenses.length,
        workshopRents: workshopRents.length,
        electricityBills: electricityBills.length,
        licenseRecords: licenseRecords.length,
        oilChanges: oilChanges.length,
        auditLogs: auditLogs.length
      },
      data: {
        settings,
        users,
        customers,
        vehicles,
        categories,
        suppliers,
        products,
        transactions,
        purchases,
        purchaseItems,
        labourWorkers,
        labourPayments,
        repairJobs,
        jobParts,
        jobLabour,
        jobPhotos,
        invoices,
        invoiceItems,
        payments,
        expenses,
        workshopRents,
        electricityBills,
        licenseRecords,
        oilChanges,
        auditLogs
      }
    };

    fs.writeFileSync(backupFilePath, JSON.stringify(backupPayload, null, 2), 'utf-8');
    console.log(`✅ Backup successfully saved!`);
    console.log(`📊 Summary:`);
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Vehicles: ${vehicles.length}`);
    console.log(`   - Invoices: ${invoices.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Users: ${users.length}`);
  } catch (error) {
    console.error('❌ Backup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runBackup();
