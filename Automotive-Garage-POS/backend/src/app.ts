import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

export const createApp = () => {
  const app = express();

  // Security & Utility Middleware
  app.use(helmet());
  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Health Checks
  const healthHandler = (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      app: 'Private Garage POS & Workshop Engine (Dubai)',
      currency: 'AED',
      timezone: 'Asia/Dubai',
      version: '2.0.0',
      timestamp: new Date().toISOString()
    });
  };
  app.get('/api/health', healthHandler);
  app.get('/health', healthHandler);

  // Master API Mount
  app.use('/api', apiRouter);
  app.use('/', apiRouter);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};

// Start Server if invoked directly
if (process.env.NODE_ENV !== 'test') {
  const app = createApp();
  const PORT = config.port;

  app.listen(PORT, () => {
    logger.info(`🚀 Garage POS Backend Server running on http://localhost:${PORT}`);
    logger.info(`📊 Mode: Private Garage Dedicated Deployment`);
    logger.info(`🔌 Database: MongoDB via Prisma (${config.databaseUrl})`);
  });
}

export default createApp;
