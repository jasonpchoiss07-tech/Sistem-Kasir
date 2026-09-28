import express, { type Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import apiRouter from './routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

/**
 * Builds and configures the Express application (without starting a listener).
 * Kept separate from server bootstrap for testability.
 */
export function createApp(): Application {
  const app = express();

  // Security headers. Allow uploaded images to be embedded cross-origin
  // (frontend and API may be served from different origins).
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // Core middleware
  app.use(
    cors({
      origin: env.corsOrigin,
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve locally stored files (e.g. product images) during development.
  app.use('/uploads', express.static('uploads'));

  // API routes
  app.use('/api', apiRouter);

  // 404 + centralized error handling (must be last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
