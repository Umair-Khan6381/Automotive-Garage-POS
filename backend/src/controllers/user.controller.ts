import { Response } from 'express';
import { AuthRequest } from '../types';
import { userService } from '../services/user.service';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const userController = {
  getAll: async (req: AuthRequest, res: Response) => {
    try {
      const users = await userService.getAll();
      return sendSuccess(res, users);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  },

  getById: async (req: AuthRequest, res: Response) => {
    try {
      const user = await userService.getById(req.params.id);
      if (!user) return sendError(res, 'User not found', 404);
      return sendSuccess(res, user);
    } catch (err: any) {
      return sendError(res, err.message, 500);
    }
  },

  create: async (req: AuthRequest, res: Response) => {
    try {
      const { name, username, email, phone, role, password } = req.body;
      if (!name || !username || !email || !password) {
        return sendError(res, 'Name, username, email, and password are required', 400);
      }

      const user = await userService.create({
        name,
        username,
        email,
        phone,
        role: role || 'employee',
        password
      });

      await logAuditEvent(req, 'Users', 'CREATE_USER', user.id, `Created user account: ${user.username} (${user.role})`);
      return sendSuccess(res, user, 'User created successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  update: async (req: AuthRequest, res: Response) => {
    try {
      const updated = await userService.update(req.params.id, req.body);
      await logAuditEvent(req, 'Users', 'UPDATE_USER', req.params.id, `Updated user account ID: ${req.params.id}`);
      return sendSuccess(res, updated, 'User updated successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  toggleStatus: async (req: AuthRequest, res: Response) => {
    try {
      const updated = await userService.toggleStatus(req.params.id);
      await logAuditEvent(req, 'Users', 'STATUS_CHANGE', req.params.id, `Toggled account status to: ${updated.status}`);
      return sendSuccess(res, updated, `User account ${updated.status}`);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  resetPassword: async (req: AuthRequest, res: Response) => {
    try {
      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 6) {
        return sendError(res, 'Password must be at least 6 characters long', 400);
      }
      await userService.resetPassword(req.params.id, newPassword);
      await logAuditEvent(req, 'Users', 'RESET_PASSWORD', req.params.id, `Owner reset password for user ID: ${req.params.id}`);
      return sendSuccess(res, null, 'Password reset successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  delete: async (req: AuthRequest, res: Response) => {
    try {
      await userService.delete(req.params.id);
      await logAuditEvent(req, 'Users', 'DELETE_USER', req.params.id, `Owner deleted user ID: ${req.params.id}`);
      return sendSuccess(res, null, 'User deleted successfully');
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  }
};
