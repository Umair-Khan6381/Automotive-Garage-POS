import type { Request, Response } from 'express';
import { createApp } from '../backend/src/app';

const app = createApp();

/**
 * Vercel Serverless Function Entry Point
 * Routes all /api/* requests to the Express application backend
 */
export default function handler(req: Request, res: Response) {
  return app(req, res);
}
