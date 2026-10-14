import { Response } from 'express';
import { AuthRequest } from '../types';
import { authService } from '../services/auth.service';
import { validateLoginInput, validateCreateUserInput } from '../validators/auth.validator';
import { sendSuccess, sendError } from '../utils/response';
import { logAuditEvent } from '../middleware/audit.middleware';

export const authController = {
  login: async (req: AuthRequest, res: Response) => {
    const { isValid, errors } = validateLoginInput(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    try {
      const { user, token } = await authService.login(req.body.username, req.body.password);
      req.user = user;
      await logAuditEvent(req, 'Authentication', 'LOGIN', user.id, `User ${user.username} logged in successfully.`);
      return sendSuccess(res, { user, token }, 'Login successful');
    } catch (err: any) {
      return sendError(res, err.message || 'Login failed', 401);
    }
  },

  getCurrentUser: async (req: AuthRequest, res: Response) => {
    return sendSuccess(res, req.user);
  },

  createUser: async (req: AuthRequest, res: Response) => {
    const { isValid, errors } = validateCreateUserInput(req.body);
    if (!isValid) {
      return sendError(res, 'Validation failed', 400, errors);
    }

    try {
      const newUser = await authService.createUser({
        name: req.body.name,
        username: req.body.username,
        email: req.body.email,
        phone: req.body.phone,
        passwordPlain: req.body.password,
        role: req.body.role
      });

      await logAuditEvent(req, 'User Management', 'CREATE_USER', newUser.id, `Created user ${newUser.username} with role ${newUser.role}.`);
      return sendSuccess(res, newUser, 'User created successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message, 400);
    }
  },

  getUsers: async (req: AuthRequest, res: Response) => {
    const users = await authService.getUsers();
    return sendSuccess(res, users);
  },

  toggleUserStatus: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    if (!['active', 'disabled'].includes(status)) {
      return sendError(res, 'Status must be active or disabled.', 400);
    }
    const updated = await authService.toggleUserStatus(id, status);
    await logAuditEvent(req, 'User Management', 'UPDATE_STATUS', id, `Changed user status to ${status}.`);
    return sendSuccess(res, updated, `User account ${status}`);
  }
};
