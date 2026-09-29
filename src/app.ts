import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import config from './config/config';
import routes from './routes';

const app = express();

import ApiResponse from './utils/ApiResponse';

// Core Middlewares
app.use(helmet({ crossOriginResourcePolicy: false })); // Allow cross-origin static image loads
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
}));
app.use(express.json({ limit: '16mb' }));
app.use(express.urlencoded({ extended: true, limit: '16mb' }));
app.use(cookieParser());
app.use(compression());

// Static Uploads Directory
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json(
    new ApiResponse(200, {
      status: 'UP',
      service: 'AI Personal Lifestyle Assistant API',
      timestamp: new Date().toISOString(),
    }, 'Health check successful')
  );
});

// API Routes
app.use('/api/v1', routes);
app.use('/api', routes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json(new ApiResponse(404, null, 'Endpoint not found.'));
});

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled API Error:', err);
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors ? err.errors : undefined;

  res.status(statusCode).json(
    new ApiResponse(
      statusCode,
      null,
      message,
      typeof errors === 'string' ? errors : Array.isArray(errors) ? errors.join(', ') : undefined
    )
  );
});

export default app;
