import { z } from 'zod';

/**
 * Server-side environment schema.
 * Note: Never prefix GEMINI_API_KEY with NEXT_PUBLIC_!
 */
export const serverEnvSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required on the server'),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().or(z.literal('')),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validates and returns the server environment variables.
 * Fails safely with masked messages to prevent leaking partial secrets in logs.
 */
export function validateServerEnv(): ServerEnv {
  // Guard against running in browser contexts (allowed in Vitest test runner)
  if (typeof window !== 'undefined' && !process.env.VITEST) {
    throw new Error('FATAL SECURITY ERROR: Attempted to access server environment variables from client-side code.');
  }

  const result = serverEnvSchema.safeParse({
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    NODE_ENV: process.env.NODE_ENV || 'development',
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  });

  if (!result.success) {
    const missingKeys = result.error.issues.map((issue) => issue.path.join('.'));
    throw new Error(
      `Environment configuration invalid. Missing or invalid keys: [${missingKeys.join(', ')}]. Check your .env.local file.`
    );
  }

  return result.data;
}

/**
 * Safely masks sensitive keys (e.g., API keys, auth tokens) for logging or diagnostics.
 * Example: "AIzaSy...4xyz" -> "AIza...4xyz"
 */
export function maskSecret(secret?: string | null): string {
  if (!secret) return '[EMPTY]';
  if (secret.length <= 8) return '****';
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}
