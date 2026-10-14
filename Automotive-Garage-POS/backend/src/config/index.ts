import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/garage_pos',
  jwtSecret: process.env.JWT_SECRET || 'garage_super_secret_jwt_key_2026_xyz987',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  privateMode: process.env.PRIVATE_GARAGE_MODE === 'true' || true,
  saltRounds: 10
};
