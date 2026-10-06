import { userRepository } from '../repositories/user.repository';
import { hashPassword, verifyPassword, generateToken } from '../utils/security';
import { AuthenticatedUser } from '../types';

export const authService = {
  login: async (usernameOrEmail: string, passwordPlain: string) => {
    const user = await userRepository.findByUsernameOrEmail(usernameOrEmail.trim());
    if (!user) {
      throw new Error('Invalid credentials or user account does not exist.');
    }

    if (user.status !== 'active') {
      throw new Error('This user account is disabled. Contact workshop owner.');
    }

    const isMatch = await verifyPassword(passwordPlain, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid credentials or incorrect password.');
    }

    // Update last login
    await userRepository.update(user.id, { lastLogin: new Date() });

    const authUser: AuthenticatedUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role as any,
      status: user.status
    };

    const token = generateToken(authUser);
    return { user: authUser, token };
  },

  createUser: async (userData: {
    name: string;
    username: string;
    email: string;
    phone?: string;
    passwordPlain: string;
    role: string;
  }) => {
    const existing = await userRepository.findByUsernameOrEmail(userData.username);
    if (existing) {
      throw new Error('Username or email already in use by another staff member.');
    }

    const { hash, salt } = await hashPassword(userData.passwordPlain);

    const user = await userRepository.create({
      name: userData.name,
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      role: userData.role,
      status: 'active',
      passwordHash: hash,
      salt
    });

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status
    };
  },

  getUsers: async () => {
    return userRepository.findAll();
  },

  toggleUserStatus: async (userId: string, status: 'active' | 'disabled') => {
    return userRepository.update(userId, { status });
  }
};
