import { GoogleGenAI } from '@google/genai';
import { validateServerEnv } from '@/lib/validation/env.schema';

/**
 * Base custom error for Gemini operations.
 */
export class GeminiServiceError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code = 'GEMINI_ERROR', statusCode = 500) {
    super(message);
    this.name = 'GeminiServiceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export class GeminiAuthError extends GeminiServiceError {
  constructor(message = 'Gemini API authentication failed. Verify your GEMINI_API_KEY.') {
    super(message, 'GEMINI_AUTH_ERROR', 401);
    this.name = 'GeminiAuthError';
  }
}

export class GeminiRateLimitError extends GeminiServiceError {
  constructor(message = 'Gemini API rate limit or quota exceeded. Please try again shortly.') {
    super(message, 'GEMINI_RATE_LIMIT_ERROR', 429);
    this.name = 'GeminiRateLimitError';
  }
}

export class GeminiValidationError extends GeminiServiceError {
  public readonly validationErrors?: unknown;

  constructor(message: string, validationErrors?: unknown) {
    super(message, 'GEMINI_VALIDATION_ERROR', 422);
    this.name = 'GeminiValidationError';
    this.validationErrors = validationErrors;
  }
}

export class GeminiModelNotFoundError extends GeminiServiceError {
  constructor(message = 'Gemini model was not found or is unavailable.') {
    super(message, 'MODEL_NOT_FOUND', 404);
    this.name = 'GeminiModelNotFoundError';
  }
}

export class GeminiNetworkError extends GeminiServiceError {
  constructor(message = 'Network error occurred while communicating with Gemini API.') {
    super(message, 'GEMINI_NETWORK_TIMEOUT', 504);
    this.name = 'GeminiNetworkError';
  }
}

let cachedClient: GoogleGenAI | null = null;

/**
 * Retrieves the GoogleGenAI instance on the server.
 * Ensures the API key is NEVER accessed on the client-side.
 */
export function getGeminiClient(): GoogleGenAI {
  if (typeof window !== 'undefined' && !process.env.VITEST) {
    throw new GeminiServiceError(
      'Security Violation: Gemini client cannot be initialized in browser context.',
      'CLIENT_SIDE_FORBIDDEN',
      500
    );
  }

  if (cachedClient) {
    return cachedClient;
  }

  const env = validateServerEnv();
  cachedClient = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
  });

  return cachedClient;
}

/**
 * Helper to reset client (for testing purposes).
 */
export function resetGeminiClientForTesting(): void {
  cachedClient = null;
}
