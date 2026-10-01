import { existsSync } from 'node:fs';
import { z } from 'zod';

const commaSeparatedList = z
  .string()
  .default('')
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
  );

const booleanFlag = z
  .enum(['true', 'false'])
  .default('false')
  .transform((value) => value === 'true');

const baseSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('0.0.0.0'),
  PORT: z.coerce.number().int().positive().default(3333),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().default(5432),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),
  DB_NAME_TEST: z.string().min(1).default('shifty_test'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET precisa ter pelo menos 32 caracteres'),
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+[smhd]$/, 'Use um número seguido de s, m, h ou d (ex.: 7d)')
    .default('7d'),
  BCRYPT_COST: z.coerce.number().int().min(4).max(15).default(12),
  CORS_ORIGINS: commaSeparatedList,
});

const emailSchema = z.discriminatedUnion('EMAIL_DRIVER', [
  z.object({ EMAIL_DRIVER: z.literal('console') }),
  z.object({
    EMAIL_DRIVER: z.literal('smtp'),
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.coerce.number().int().positive(),
    SMTP_SECURE: booleanFlag,
    SMTP_USER: z.string().min(1),
    SMTP_PASSWORD: z.string().min(1),
    EMAIL_FROM: z.string().min(1),
  }),
]);

const envSchema = z.intersection(baseSchema, emailSchema);

type Env = z.infer<typeof envSchema>;

export type EmailConfig =
  | { driver: 'console' }
  | {
      driver: 'smtp';
      host: string;
      port: number;
      secure: boolean;
      user: string;
      password: string;
      from: string;
    };

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface Config {
  environment: Env['NODE_ENV'];
  server: { host: string; port: number };
  logLevel: Env['LOG_LEVEL'];
  database: DatabaseConfig;
  testDatabaseName: string;
  auth: { jwtSecret: string; jwtExpiresIn: string; bcryptCost: number };
  corsOrigins: string[];
  email: EmailConfig;
}

export class InvalidConfigError extends Error {
  constructor(readonly issues: string[]) {
    super(`Configuração inválida:\n${issues.map((issue) => `  - ${issue}`).join('\n')}`);
    this.name = 'InvalidConfigError';
  }
}

export function loadConfig(envFile = '.env'): Config {
  if (existsSync(envFile)) {
    process.loadEnvFile(envFile);
  }

  const parsed = envSchema.safeParse({ EMAIL_DRIVER: 'console', ...process.env });
  if (!parsed.success) {
    throw new InvalidConfigError(
      parsed.error.issues.map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`),
    );
  }

  return toConfig(parsed.data);
}

function toConfig(env: Env): Config {
  return {
    environment: env.NODE_ENV,
    server: { host: env.HOST, port: env.PORT },
    logLevel: env.LOG_LEVEL,
    database: {
      host: env.DB_HOST,
      port: env.DB_PORT,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
    },
    testDatabaseName: env.DB_NAME_TEST,
    auth: {
      jwtSecret: env.JWT_SECRET,
      jwtExpiresIn: env.JWT_EXPIRES_IN,
      bcryptCost: env.BCRYPT_COST,
    },
    corsOrigins: env.CORS_ORIGINS,
    email: toEmailConfig(env),
  };
}

function toEmailConfig(env: Env): EmailConfig {
  if (env.EMAIL_DRIVER === 'console') {
    return { driver: 'console' };
  }
  return {
    driver: 'smtp',
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    from: env.EMAIL_FROM,
  };
}
