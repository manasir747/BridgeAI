import { z } from 'zod';
import { analysisCategorySchema, urgencyLevelSchema } from './analysis.schema';

/**
 * Bounds on input payload sizes to prevent Denial of Service and excessive token consumption.
 */
export const INPUT_LIMITS = {
  MIN_LENGTH: 10,
  MAX_LENGTH: 10000,
} as const;

/**
 * Sanitizes raw text input:
 * - Trims leading/trailing whitespace
 * - Strips ASCII control characters (preserving \n and \t)
 * - Strips zero-width characters and invisible formatting overrides
 * - Normalizes Unicode to NFC
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';

  return (
    input
      // Normalize unicode characters to standard form
      .normalize('NFC')
      // Strip NULL bytes and control chars except tab (0x09), line feed (0x0A), carriage return (0x0D)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Strip zero-width spaces and bidirectional text override characters used in obfuscation
      .replace(/[\u200B-\u200D\uFEFF\u202A-\u202E\u2066-\u2069]/g, '')
      .trim()
  );
}

/**
 * Zod schema for client requests sent to /api/analyze.
 */
export const analysisRequestSchema = z.object({
  input: z
    .string()
    .transform((val) => sanitizeInput(val))
    .pipe(
      z
        .string()
        .min(
          INPUT_LIMITS.MIN_LENGTH,
          `Input text must be at least ${INPUT_LIMITS.MIN_LENGTH} characters long.`
        )
        .max(
          INPUT_LIMITS.MAX_LENGTH,
          `Input text exceeds the maximum allowed limit of ${INPUT_LIMITS.MAX_LENGTH} characters.`
        )
    ),
  categoryHint: analysisCategorySchema.optional(),
  urgencyHint: urgencyLevelSchema.optional(),
  locale: z.string().max(10).optional(),
});

export type AnalysisRequestSchemaType = z.infer<typeof analysisRequestSchema>;
