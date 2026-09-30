import dotenv from 'dotenv';

dotenv.config();

/**
 * Centralized, typed access to environment variables.
 * Fail fast if a required variable is missing.
 */
function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  // DATABASE_URL is read by Prisma directly; kept here for reference/validation later.
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwt: {
    secret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '12h',
  },
  // Store name shown on receipts (configurable via env; store settings UI comes later).
  storeName: process.env.STORE_NAME ?? 'POS Toko Bangunan',
  // Supabase Storage for product images. When SUPABASE_URL is set, uploads go to
  // object storage (needed on serverless/Vercel). Otherwise files are saved to
  // the local uploads/ folder (development).
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    bucket: process.env.SUPABASE_STORAGE_BUCKET ?? 'product-photos',
    get enabled() {
      return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
    },
  },
  get isProduction() {
    return this.nodeEnv === 'production';
  },
} as const;

/**
 * Fails fast in production if secrets are left at their insecure defaults.
 * Called during server bootstrap.
 */
export function assertProductionSecrets(): void {
  if (!env.isProduction) return;
  const problems: string[] = [];
  if (!process.env.JWT_SECRET || env.jwt.secret === 'dev-secret-change-me') {
    problems.push('JWT_SECRET must be set to a strong secret in production');
  }
  if (!process.env.DATABASE_URL) {
    problems.push('DATABASE_URL must be set in production');
  }
  if (problems.length > 0) {
    throw new Error(`Insecure production config:\n - ${problems.join('\n - ')}`);
  }
}

// Reference `required` so the helper is available for stricter validation in later steps.
export { required };
