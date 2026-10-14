import { Response } from 'express';
import { AuthRequest } from '../types';
import { invoiceRepository } from '../repositories/invoice.repository';
import { productRepository } from '../repositories/product.repository';
import { validateInvoiceData } from '../validators/invoice.validator';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const invoiceController = {
  getAll: async (req: AuthRequest, res: Response) => {
    const invoices = await invoiceRepository.findAll();
    return sendSuccess(res, invoices);
  },

  getById: async (req: AuthRequest, res: Response) => {
    const invoice = await invoiceRepository.findById(req.params.id);
    if (!invoice) {
      return sendError(res, 'Invoice not found', 404);
    }
    return sendSuccess(res, invoice);
  },

  create: async (req: AuthRequest, res: Response) => {
    const { isValid, errors } = validateInvoiceData(req.body);
    if (!isValid) {
      return sendError(res, 'Validation error', 400, errors);
    }

    const {
      customerId,
      vehicleId,
      jobCardId,
      items,
      partsTotal = 0,
      labourTotal = 0,
      servicesTotal = 0,
      partsCost = 0,
      labourCost = 0,
      servicesCost = 0,
      discount = 0,
      taxRate = 0,
      taxAmount = 0,
      grandTotal,
      paidAmount = 0,
      paymentMethod = 'Cash',
      notes
    } = req.body;

    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const balanceDue = Math.max(0, grandTotal - paidAmount);
    const paymentStatus = balanceDue === 0 ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid';

    // Auto-deduct any POS direct parts sales
    for (const item of items) {
      if (item.type === 'part' && item.productId) {
        try {
          await productRepository.updateStock(
            item.productId,
            -item.quantity,
            'sale',
            item.unitCost || 0,
            invoiceNumber,
            `POS Sale on Invoice ${invoiceNumber}`
          );
        } catch (e) {
          // ignore or log
        }
      }
    }

    const invoice = await invoiceRepository.create(
      {
        invoiceNumber,
        customerId,
        vehicleId,
        jobCardId,
        date: req.body.date ? new Date(req.body.date) : new Date(),
        partsTotal,
        labourTotal,
        servicesTotal,
        partsCost,
        labourCost,
        servicesCost,
        discount,
        taxRate,
        taxAmount,
        grandTotal,
        paidAmount,
        balanceDue,
        paymentStatus,
        paymentMethod,
        notes
      },
      items.map((i: any) => ({
        type: i.type,
        productId: i.productId || null,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.totalPrice,
        unitCost: i.unitCost || 0,
        totalCost: i.totalCost || 0
      }))
    );

    // If initial payment was made, record payment receipt
    if (paidAmount > 0) {
      await invoiceRepository.addPayment(invoice.id, {
        amount: paidAmount,
        paymentDate: new Date(),
        paymentMethod,
        receivedBy: req.user?.name || 'Owner',
        notes: 'Initial billing payment'
      });
    }

    await logAuditEvent(
      req,
      'Invoices',
      'CREATE_INVOICE',
      invoice.id,
      `Generated invoice ${invoice.invoiceNumber} for Rs. ${grandTotal}. Paid: Rs. ${paidAmount}`
    );

    return sendSuccess(res, invoice, 'Invoice created', 201);
  },

  addPayment: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { amount, paymentMethod, referenceNumber, notes } = req.body;

    if (!amount || amount <= 0) {
      return sendError(res, 'Payment amount must be greater than zero.', 400);
    }

    const payment = await invoiceRepository.addPayment(id, {
      amount,
      paymentDate: new Date(),
      paymentMethod: paymentMethod || 'Cash',
      referenceNumber: referenceNumber || null,
      receivedBy: req.user?.name || 'Owner',
      notes: notes || null
    });

    await logAuditEvent(
      req,
      'Invoices',
      'ADD_PAYMENT',
      id,
      `Recorded payment receipt of Rs. ${amount} via ${paymentMethod} on Invoice ID ${id}`
    );

    return sendSuccess(res, payment, 'Payment recorded', 201);
  }
};
