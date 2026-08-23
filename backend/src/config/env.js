const { z } = require('zod');

const envSchema = z.object({
  PORT: z.string().default('4000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().default(''),
  JWT_SECRET: z.string().default('dillibites_default_jwt_secret_change_me_in_prod'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().default('dillibites_default_refresh_secret_change_me_in_prod'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  AI_SERVICE_URL: z.string().default('http://localhost:8000'),
  AI_SERVICE_API_KEY: z.string().optional(),
  CORS_ORIGIN: z.string().default('*'),
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE: z.string().default('5242880'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn('Warning: Some environment variables are missing or invalid:', parsed.error.flatten().fieldErrors);
}

module.exports = parsed.success ? parsed.data : envSchema.parse({});
