import { Response } from 'express';
import { AuthRequest } from '../types';
import { productRepository } from '../repositories/product.repository';
import { inventoryService } from '../services/inventory.service';
import { validateProductData } from '../validators/product.validator';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const productController = {
  getAll: async (req: AuthRequest, res: Response) => {
    const products = await productRepository.findAll();
    return sendSuccess(res, products);
  },

  getById: async (req: AuthRequest, res: Response) => {
    const product = await productRepository.findById(req.params.id);
    if (!product) {
      return sendError(res, 'Product not found', 404);
    }
    return sendSuccess(res, product);
  },

  create: async (req: AuthRequest, res: Response) => {
    const { isValid, errors } = validateProductData(req.body);
    if (!isValid) {
      return sendError(res, 'Validation error', 400, errors);
    }

    const existing = await productRepository.findBySku(req.body.sku.trim().toUpperCase());
    if (existing) {
      return sendError(res, 'SKU already exists. Each spare part must have a unique SKU.', 409);
    }

    const product = await productRepository.create({
      ...req.body,
      sku: req.body.sku.trim().toUpperCase()
    });

    await logAuditEvent(req, 'Inventory', 'CREATE_PRODUCT', product.id, `Created product ${product.name} (${product.sku})`);
    return sendSuccess(res, product, 'Product created', 201);
  },

  update: async (req: AuthRequest, res: Response) => {
    const product = await productRepository.update(req.params.id, req.body);
    await logAuditEvent(req, 'Inventory', 'UPDATE_PRODUCT', product.id, `Updated product ${product.name}`);
    return sendSuccess(res, product, 'Product updated');
  },

  adjustStock: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { delta, type, reason } = req.body;

    if (delta === undefined || typeof delta !== 'number' || delta === 0) {
      return sendError(res, 'Delta quantity must be a non-zero number.', 400);
    }

    try {
      const result = await inventoryService.adjustStock(
        id,
        delta,
        type || 'adjustment',
        reason || 'Manual inventory adjustment'
      );
      await logAuditEvent(
        req,
        'Inventory',
        'STOCK_ADJUSTMENT',
        id,
        `Adjusted stock for ${result.product.name} by ${delta > 0 ? '+' : ''}${delta}. New stock: ${result.product.currentQuantity}. Reason: ${reason}`
      );
      return sendSuccess(res, result, 'Stock updated');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  recordPurchase: async (req: AuthRequest, res: Response) => {
    const { items, supplierId, invoiceNumber, notes } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, 'Items array required with at least one product purchase.', 400);
    }

    try {
      const purchase = await inventoryService.recordPurchase({
        supplierId,
        invoiceNumber,
        items,
        notes,
        createdBy: req.user?.name || 'Owner'
      });
      await logAuditEvent(
        req,
        'Inventory',
        'PURCHASE_PO',
        purchase.id,
        `Recorded purchase PO #${invoiceNumber || purchase.id} with ${items.length} items.`
      );
      return sendSuccess(res, purchase, 'Purchase recorded and stock updated', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getTransactions: async (req: AuthRequest, res: Response) => {
    const transactions = await productRepository.findAllTransactions();
    return sendSuccess(res, transactions);
  }
};
