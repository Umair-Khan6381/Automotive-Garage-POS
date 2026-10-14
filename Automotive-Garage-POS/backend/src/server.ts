/**
 * Automotive Garage POS & Workshop Management — Backend Server
 * Standalone entry point to start the Express server.
 * File: backend/src/server.ts
 */

import { createApp } from './app';
import { config } from './config';
import { logger } from './utils/logger';

const app = createApp();
const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`============================================================`);
  logger.info(`🚀 Garage POS Backend Server running on http://localhost:${PORT}`);
  logger.info(`📊 Mode: Private Dedicated Garage POS (Dubai, UAE)`);
  logger.info(`🔌 Port: ${PORT} | Environment: ${config.nodeEnv}`);
  logger.info(`============================================================`);
});

export default server;
