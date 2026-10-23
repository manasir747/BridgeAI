import { randomUUID } from 'crypto';
import { AnalysisRequest, StructuredAnalysisResult } from '@/types/analysis';
import { structuredAnalysisSchema } from '@/lib/validation/analysis.schema';
import { validateServerEnv } from '@/lib/validation/env.schema';
import {
  getGeminiClient,
  GeminiAuthError,
  GeminiRateLimitError,
  GeminiServiceError,
  GeminiValidationError,
} from './client';
import { BRIDGEAI_SYSTEM_INSTRUCTION, buildAnalysisPrompt } from './prompts';

/**
 * Service orchestrating analysis via Google Gemini API.
 */
export class GeminiAnalyzer {
  /**
   * Analyzes raw unstructured text and returns a validated StructuredAnalysisResult.
   */
  async analyze(request: AnalysisRequest): Promise<StructuredAnalysisResult> {
    const startTime = Date.now();
    const env = validateServerEnv();
    const model = env.GEMINI_MODEL || 'gemini-2.5-flash';
    const client = getGeminiClient();

    const promptText = buildAnalysisPrompt(request);

    let responseText: string | undefined;

    try {
      const response = await client.models.generateContent({
        model,
        contents: promptText,
        config: {
          systemInstruction: BRIDGEAI_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.1, // low temperature for deterministic, structured factual extraction
        },
      });

      responseText = response.text;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);

      if (
        errorMessage.includes('API_KEY_INVALID') ||
        errorMessage.includes('unauthenticated') ||
        errorMessage.includes('401')
      ) {
        throw new GeminiAuthError();
      }

      if (
        errorMessage.includes('RESOURCE_EXHAUSTED') ||
        errorMessage.includes('quota') ||
        errorMessage.includes('429')
      ) {
        throw new GeminiRateLimitError();
      }

      throw new GeminiServiceError(
        `Gemini API invocation failed: ${errorMessage}`,
        'GEMINI_CALL_FAILED',
        500
      );
    }

    if (!responseText) {
      throw new GeminiServiceError(
        'Empty response received from Gemini model.',
        'EMPTY_MODEL_RESPONSE',
        502
      );
    }

    let rawJson: Record<string, unknown>;
    try {
      rawJson = JSON.parse(responseText);
    } catch {
      throw new GeminiValidationError(
        'Gemini model did not return valid JSON.',
        { rawResponse: responseText }
      );
    }

    const processingTimeMs = Date.now() - startTime;
    const nowIso = new Date().toISOString();

    // Augment with canonical top-level fields
    const candidateResult: Record<string, unknown> = {
      ...rawJson,
      id: rawJson.id || randomUUID(),
      rawInput: request.input,
      timestamp: nowIso,
      metadata: {
        modelVersion: model,
        processingTimeMs,
        inputLength: request.input.length,
        sanitized: true,
        createdAt: nowIso,
      },
    };

    // Strict validation against canonical Zod schema
    const validation = structuredAnalysisSchema.safeParse(candidateResult);

    if (!validation.success) {
      throw new GeminiValidationError(
        'Model response failed BridgeAI structured schema validation.',
        validation.error.format()
      );
    }

    return validation.data;
  }
}

/**
 * Singleton analyzer instance.
 */
export const geminiAnalyzer = new GeminiAnalyzer();
