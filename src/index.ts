import { Server } from 'http';
import app from './app';
import prisma from './client';
import config from './config/config';

let server: Server;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database via Prisma 6');

    server = app.listen(config.port, () => {
      console.log(`🚀 AI Lifestyle Server running on http://localhost:${config.port}`);
      console.log(`📡 Environment: ${config.env}`);
    });
  } catch (error) {
    console.error('❌ Database connection error:', error);
    // Fallback: start HTTP server even if database is not reachable immediately
    server = app.listen(config.port, () => {
      console.log(`⚠️ Server running in offline DB mode on http://localhost:${config.port}`);
    });
  }
}

startServer();

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  exitHandler();
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  exitHandler();
});
