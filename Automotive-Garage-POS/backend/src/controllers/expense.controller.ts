import { Response } from 'express';
import { AuthRequest } from '../types';
import { expenseService } from '../services/expense.service';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const expenseController = {
  // 1. Get all expenses & fixed records unified
  getUnified: async (req: AuthRequest, res: Response) => {
    try {
      const filters = {
        month: req.query.month as string | undefined,
        category: req.query.category as string | undefined,
        type: req.query.type as string | undefined,
        status: req.query.status as string | undefined
      };
      const result = await expenseService.getUnifiedExpenses(filters);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch expenses', 500);
    }
  },

  // 2. Create daily operational expense (Breakfast, Tea, Lunch, Conveyance, Petrol, Workshop supplies, etc.)
  createDaily: async (req: AuthRequest, res: Response) => {
    try {
      const { title, category, amount, date, paymentMethod, status, notes, attachment } = req.body;
      if (!title || !category || amount === undefined || amount <= 0) {
        return sendError(res, 'Title, category, and positive amount are required.', 400);
      }

      const expense = await expenseService.createDailyExpense({
        title,
        category,
        amount: Number(amount),
        date: date ? new Date(date) : new Date(),
        paymentMethod: paymentMethod || 'Cash',
        status: status || 'Paid',
        paidBy: req.user?.name || 'Owner',
        notes,
        attachment
      });

      await logAuditEvent(
        req,
        'Expenses',
        'CREATE_EXPENSE',
        expense.id,
        `Logged ${expense.category} expense: Rs. ${expense.amount} (${expense.title})`
      );

      return sendSuccess(res, expense, 'Expense recorded successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to record expense', 500);
    }
  },

  updateDaily: async (req: AuthRequest, res: Response) => {
    try {
      const updated = await expenseService.updateDailyExpense(req.params.id, req.body);
      await logAuditEvent(
        req,
        'Expenses',
        'UPDATE_EXPENSE',
        req.params.id,
        `Updated expense record ID: ${req.params.id}`
      );
      return sendSuccess(res, updated, 'Expense updated successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update expense', 500);
    }
  },

  voidExpense: async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== 'owner') {
        return sendError(res, 'Only the garage OWNER is permitted to void financial expense records.', 403);
      }

      const { reason } = req.body;
      if (!reason) {
        return sendError(res, 'A justification reason is required to void an expense.', 400);
      }

      const voided = await expenseService.voidExpense(req.params.id, reason);
      await logAuditEvent(
        req,
        'Expenses',
        'VOID_EXPENSE',
        req.params.id,
        `Owner voided expense ID ${req.params.id}. Reason: ${reason}`
      );
      return sendSuccess(res, voided, 'Expense record voided');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to void expense', 500);
    }
  },

  deleteExpense: async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== 'owner') {
        return sendError(res, 'Only the garage OWNER can remove expense entries.', 403);
      }
      await expenseService.deleteExpense(req.params.id);
      await logAuditEvent(req, 'Expenses', 'DELETE_EXPENSE', req.params.id, `Removed expense ID: ${req.params.id}`);
      return sendSuccess(res, null, 'Expense deleted successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to delete expense', 500);
    }
  },

  // 3. Workshop Rent Endpoints
  getRents: async (req: AuthRequest, res: Response) => {
    try {
      const rents = await expenseService.getAllRents();
      return sendSuccess(res, rents);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch rent records', 500);
    }
  },

  createRent: async (req: AuthRequest, res: Response) => {
    try {
      const { month, monthLabel, amount, paidAmount, paymentDate, paymentMethod, status, notes, attachment } = req.body;
      if (!month || !amount || amount <= 0) {
        return sendError(res, 'Month and valid amount are required.', 400);
      }

      const rent = await expenseService.createRent({
        month,
        monthLabel: monthLabel || month,
        amount: Number(amount),
        paidAmount: paidAmount ? Number(paidAmount) : 0,
        paymentDate: paymentDate ? new Date(paymentDate) : undefined,
        paymentMethod: paymentMethod || 'Bank Transfer',
        status: status || 'Pending',
        notes,
        attachment
      });

      await logAuditEvent(req, 'Expenses', 'CREATE_RENT', rent.id, `Created rent record for ${rent.monthLabel}: Rs. ${rent.amount}`);
      return sendSuccess(res, rent, 'Workshop rent logged', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create rent record', 500);
    }
  },

  payRent: async (req: AuthRequest, res: Response) => {
    try {
      const { amount, paymentMethod, paymentDate } = req.body;
      if (!amount || amount <= 0) {
        return sendError(res, 'Positive payment amount is required.', 400);
      }

      const updated = await expenseService.recordRentPayment(
        req.params.id,
        Number(amount),
        paymentMethod || 'Bank Transfer',
        paymentDate ? new Date(paymentDate) : new Date()
      );

      await logAuditEvent(req, 'Expenses', 'PAY_RENT', req.params.id, `Recorded rent payment of Rs. ${amount}`);
      return sendSuccess(res, updated, 'Rent payment recorded');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to record rent payment', 500);
    }
  },

  // 4. Electricity Bills Endpoints
  getElectricityBills: async (req: AuthRequest, res: Response) => {
    try {
      const bills = await expenseService.getAllElectricityBills();
      return sendSuccess(res, bills);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch electricity bills', 500);
    }
  },

  createElectricityBill: async (req: AuthRequest, res: Response) => {
    try {
      const {
        billingMonth,
        monthLabel,
        billNumber,
        previousReading,
        currentReading,
        unitsConsumed,
        billAmount,
        dueDate,
        paymentMethod,
        notes,
        attachment
      } = req.body;

      if (!billingMonth || !billAmount || !dueDate) {
        return sendError(res, 'Billing month, bill amount, and due date are required.', 400);
      }

      const bill = await expenseService.createElectricityBill({
        billingMonth,
        monthLabel: monthLabel || billingMonth,
        billNumber,
        previousReading: previousReading ? Number(previousReading) : undefined,
        currentReading: currentReading ? Number(currentReading) : undefined,
        unitsConsumed: Number(unitsConsumed || 0),
        billAmount: Number(billAmount),
        dueDate: new Date(dueDate),
        paymentMethod: paymentMethod || 'Bank Transfer',
        notes,
        attachment
      });

      await logAuditEvent(req, 'Expenses', 'CREATE_ELEC_BILL', bill.id, `Logged electricity bill for ${bill.monthLabel}: Rs. ${bill.billAmount}`);
      return sendSuccess(res, bill, 'Electricity bill logged', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create electricity bill', 500);
    }
  },

  payElectricityBill: async (req: AuthRequest, res: Response) => {
    try {
      const { amount, paymentMethod, paymentDate } = req.body;
      if (!amount || amount <= 0) {
        return sendError(res, 'Valid payment amount is required.', 400);
      }

      const updated = await expenseService.recordElectricityPayment(
        req.params.id,
        Number(amount),
        paymentMethod || 'Bank Transfer',
        paymentDate ? new Date(paymentDate) : new Date()
      );

      await logAuditEvent(req, 'Expenses', 'PAY_ELEC_BILL', req.params.id, `Recorded electricity payment of Rs. ${amount}`);
      return sendSuccess(res, updated, 'Electricity bill payment recorded');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to record electricity bill payment', 500);
    }
  },

  // 5. Licenses & Legal Fees Endpoints
  getLicenses: async (req: AuthRequest, res: Response) => {
    try {
      const licenses = await expenseService.getAllLicenses();
      return sendSuccess(res, licenses);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch licenses', 500);
    }
  },

  createLicense: async (req: AuthRequest, res: Response) => {
    try {
      const { name, licenseNumber, issuingAuthority, issueDate, expiryDate, renewalCost, paymentMethod, notes, attachment } = req.body;
      if (!name || !licenseNumber || !issuingAuthority || !expiryDate || renewalCost === undefined) {
        return sendError(res, 'Name, license number, issuing authority, expiry date, and renewal cost are required.', 400);
      }

      const license = await expenseService.createLicense({
        name,
        licenseNumber,
        issuingAuthority,
        issueDate: issueDate ? new Date(issueDate) : new Date(),
        expiryDate: new Date(expiryDate),
        renewalCost: Number(renewalCost),
        paymentMethod: paymentMethod || 'Bank Transfer',
        notes,
        attachment
      });

      await logAuditEvent(req, 'Expenses', 'CREATE_LICENSE', license.id, `Added license: ${license.name}`);
      return sendSuccess(res, license, 'License registered', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to register license', 500);
    }
  },

  renewLicense: async (req: AuthRequest, res: Response) => {
    try {
      const { renewalCost, newExpiryDate, paymentMethod, paymentDate } = req.body;
      if (!newExpiryDate || renewalCost === undefined) {
        return sendError(res, 'Renewal cost and new expiry date are required.', 400);
      }

      const updated = await expenseService.recordLicenseRenewal(
        req.params.id,
        Number(renewalCost),
        new Date(newExpiryDate),
        paymentMethod || 'Bank Transfer',
        paymentDate ? new Date(paymentDate) : new Date()
      );

      await logAuditEvent(req, 'Expenses', 'RENEW_LICENSE', req.params.id, `Renewed license ID ${req.params.id} for Rs. ${renewalCost}`);
      return sendSuccess(res, updated, 'License renewal recorded');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to renew license', 500);
    }
  },

  // 6. Monthly Summary
  getMonthlySummary: async (req: AuthRequest, res: Response) => {
    try {
      const monthKey = (req.query.month as string) || new Date().toISOString().slice(0, 7);
      const summary = await expenseService.getMonthlySummary(monthKey);
      return sendSuccess(res, summary);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to calculate monthly summary', 500);
    }
  }
};
