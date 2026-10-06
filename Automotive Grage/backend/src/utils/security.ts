import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthenticatedUser } from '../types';

export const hashPassword = async (password: string): Promise<{ hash: string; salt: string }> => {
  const salt = await bcrypt.genSalt(config.saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return { hash, salt };
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = (user: AuthenticatedUser): string => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
};

export const verifyToken = (token: string): AuthenticatedUser | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as AuthenticatedUser;
  } catch (error) {
    return null;
  }
};
