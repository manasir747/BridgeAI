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
  GeminiModelNotFoundError,
  GeminiNetworkError,
} from './client';
import { BRIDGEAI_SYSTEM_INSTRUCTION, buildAnalysisPrompt } from './prompts';
import { geminiAnalysisResponseSchema } from './schema';

/**
 * Normalizes raw model output to handle common LLM output idiosyncrasies
 * (e.g. nulls for optional fields, percentage confidence scores, missing arrays).
 */
function normalizeCandidateOutput(raw: Record<string, unknown>): Record<string, unknown> {
  const clean = { ...raw };

  // Helper to remove null values so Zod .optional() won't reject them
  const stripNulls = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) return undefined;
    if (Array.isArray(obj)) return obj.map(stripNulls).filter((x) => x !== undefined);
    if (typeof obj === 'object') {
      const res: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
        if (v !== null && v !== undefined) {
          res[k] = stripNulls(v);
        }
      }
      return res;
    }
    return obj;
  };

  const stripped = stripNulls(clean) as Record<string, unknown>;

  // Normalize urgency
  if (stripped.urgency && typeof stripped.urgency === 'object') {
    const urg = { ...(stripped.urgency as Record<string, unknown>) };
    if (typeof urg.score === 'string') {
      urg.score = parseInt(urg.score, 10) || 5;
    }
    stripped.urgency = urg;
  }

  // Normalize verification confidenceScore (if returned as 0-100 percentage)
  if (stripped.verification && typeof stripped.verification === 'object') {
    const ver = { ...(stripped.verification as Record<string, unknown>) };
    if (typeof ver.confidenceScore === 'number' && ver.confidenceScore > 1) {
      ver.confidenceScore = Math.min(1, Math.max(0, ver.confidenceScore / 100));
    }
    stripped.verification = ver;
  }

  // Normalize sources confidence scores
  if (Array.isArray(stripped.sources)) {
    stripped.sources = stripped.sources.map((src) => {
      if (src && typeof src === 'object') {
        const s = { ...(src as Record<string, unknown>) };
        if (typeof s.confidence === 'number' && s.confidence > 1) {
          s.confidence = Math.min(1, Math.max(0, s.confidence / 100));
        }
        return s;
      }
      return src;
    });
  }

  // Normalize extractedDetails entities fallback types if invalid
  if (stripped.extractedDetails && typeof stripped.extractedDetails === 'object') {
    const details = { ...(stripped.extractedDetails as Record<string, unknown>) };
    const validEntityTypes = ['person', 'organization', 'facility', 'group', 'other'];
    if (Array.isArray(details.entities)) {
      details.entities = details.entities.map((e) => {
        if (e && typeof e === 'object') {
          const entity = { ...(e as Record<string, unknown>) };
          if (typeof entity.type !== 'string' || !validEntityTypes.includes(entity.type)) {
            entity.type = 'other';
          }
          return entity;
        }
        return e;
      });
    }

    const validContactTypes = ['phone', 'email', 'radio', 'social', 'other'];
    if (Array.isArray(details.contactInfo)) {
      details.contactInfo = details.contactInfo.map((c) => {
        if (c && typeof c === 'object') {
          const contact = { ...(c as Record<string, unknown>) };
          if (typeof contact.type !== 'string' || !validContactTypes.includes(contact.type)) {
            contact.type = 'other';
          }
          return contact;
        }
        return c;
      });
    }
    stripped.extractedDetails = details;
  }

  return stripped;
}

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
    const model = env.GEMINI_MODEL || 'gemini-3.8-flash';
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
          responseSchema: geminiAnalysisResponseSchema,
          temperature: 0.1, // low temperature for deterministic, structured factual extraction
        },
      });

      responseText = response.text;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      const lower = errorMessage.toLowerCase();

      if (
        lower.includes('api_key_invalid') ||
        lower.includes('unauthenticated') ||
        lower.includes('api key not valid') ||
        lower.includes('401')
      ) {
        throw new GeminiAuthError();
      }

      if (
        lower.includes('resource_exhausted') ||
        lower.includes('quota') ||
        lower.includes('rate limit') ||
        lower.includes('429')
      ) {
        throw new GeminiRateLimitError();
      }

      if (
        lower.includes('not found') ||
        lower.includes('404') ||
        lower.includes('is not supported') ||
        lower.includes('unknown model')
      ) {
        throw new GeminiModelNotFoundError(
          `Gemini model "${model}" was not found or is unavailable: ${errorMessage}`
        );
      }

      if (
        lower.includes('etimedout') ||
        lower.includes('timeout') ||
        lower.includes('econnreset') ||
        lower.includes('fetch failed') ||
        lower.includes('network') ||
        lower.includes('504')
      ) {
        throw new GeminiNetworkError(
          `Network error while connecting to Gemini API: ${errorMessage}`
        );
      }

      throw new GeminiServiceError(
        `Gemini API invocation failed: ${errorMessage}`,
        'GEMINI_CALL_FAILED',
        500
      );
    }

    if (!responseText || !responseText.trim()) {
      throw new GeminiServiceError(
        'Empty response received from Gemini model.',
        'EMPTY_MODEL_RESPONSE',
        502
      );
    }

    // Strip markdown code fences if present (e.g. ```json ... ```)
    let cleanedText = responseText.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
    }

    let rawJson: Record<string, unknown>;
    try {
      rawJson = JSON.parse(cleanedText);
    } catch {
      throw new GeminiValidationError(
        'Gemini model did not return valid JSON.',
        { rawResponse: responseText }
      );
    }

    const processingTimeMs = Date.now() - startTime;
    const nowIso = new Date().toISOString();

    const normalizedJson = normalizeCandidateOutput(rawJson);

    // Ensure recommendedActions have valid IDs and default status
    const rawActions = Array.isArray(normalizedJson.recommendedActions) ? normalizedJson.recommendedActions : [];
    const validPriorities = ['critical', 'high', 'medium', 'low'];
    const validStatuses = ['pending', 'in_progress', 'completed', 'blocked'];
    const normalizedActions = rawActions.map((act: Record<string, unknown>) => ({
      ...act,
      id: (typeof act.id === 'string' && act.id) || randomUUID(),
      priority: (typeof act.priority === 'string' && validPriorities.includes(act.priority)) ? act.priority : 'medium',
      status: (typeof act.status === 'string' && validStatuses.includes(act.status)) ? act.status : 'pending',
    }));

    // Augment with canonical top-level fields
    const candidateResult: Record<string, unknown> = {
      ...normalizedJson,
      id: (typeof normalizedJson.id === 'string' && normalizedJson.id) || randomUUID(),
      rawInput: request.input,
      timestamp: nowIso,
      recommendedActions: normalizedActions,
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
      console.error(
        '[BridgeAI Gemini Validation Error]',
        JSON.stringify(validation.error.issues, null, 2)
      );
      throw new GeminiValidationError(
        'Model response failed BridgeAI structured schema validation.',
        validation.error.issues
      );
    }

    return validation.data;
  }
}

/**
 * Singleton analyzer instance.
 */
export const geminiAnalyzer = new GeminiAnalyzer();
