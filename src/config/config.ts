import { z } from 'zod';

const envVarsSchema = z.object({
  NODE_ENV: z.enum(['production', 'development', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().optional().describe('PostgreSQL database connection string'),
  GEMINI_API_KEY: z.string().optional().describe('Google Gemini API Key'),
  JWT_SECRET: z.string().default('super-secret-jwt-key-change-in-production'),
  JWT_ACCESS_EXPIRATION_MINUTES: z.coerce.number().default(60),
  JWT_REFRESH_EXPIRATION_DAYS: z.coerce.number().default(30),
  CORS_ORIGINS: z.string().optional().describe('comma-separated list of allowed origins for CORS'),
});

const parseEnvVars = () => {
  try {
    return envVarsSchema.parse(process.env);
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Config validation error: ${error.message}`);
    } else {
      throw new Error('Config validation error: Unknown error');
    }
  }
};

const envVars = parseEnvVars();

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
  geminiApiKey: envVars.GEMINI_API_KEY || process.env.GEMINI_API_KEY,
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
  },
  cors: {
    origins: envVars.CORS_ORIGINS
      ? envVars.CORS_ORIGINS.split(',').map((origin) => origin.trim())
      : ['http://localhost:5173', 'http://localhost:3000'],
  },
};
