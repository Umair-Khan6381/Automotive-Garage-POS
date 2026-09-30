import { userRepository } from '../repositories/user.repository';
import { hashPassword, generateSalt } from '../utils/security';

export const userService = {
  getAll: async () => {
    return userRepository.findAll();
  },

  getById: async (id: string) => {
    return userRepository.findById(id);
  },

  create: async (data: {
    name: string;
    username: string;
    email: string;
    phone?: string;
    role: string;
    password: string;
  }) => {
    const existing = await userRepository.findByUsernameOrEmail(data.username);
    if (existing) {
      throw new Error('Username or email already in use');
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(data.password, salt);

    return userRepository.create({
      name: data.name,
      username: data.username,
      email: data.email,
      phone: data.phone,
      role: data.role,
      status: 'active',
      passwordHash,
      salt
    });
  },

  update: async (id: string, data: any) => {
    return userRepository.update(id, data);
  },

  toggleStatus: async (id: string) => {
    const user = await userRepository.findById(id);
    if (!user) throw new Error('User not found');
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    return userRepository.update(id, { status: newStatus });
  },

  resetPassword: async (id: string, newPassword: string) => {
    const salt = generateSalt();
    const passwordHash = hashPassword(newPassword, salt);
    return userRepository.update(id, { passwordHash, salt });
  },

  delete: async (id: string) => {
    return userRepository.delete(id);
  }
};
