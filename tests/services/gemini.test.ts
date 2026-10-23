import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildAnalysisPrompt, BRIDGEAI_SYSTEM_INSTRUCTION } from '@/services/gemini/prompts';
import {
  GeminiServiceError,
  GeminiAuthError,
  GeminiRateLimitError,
  GeminiValidationError,
} from '@/services/gemini/client';
import { GeminiAnalyzer } from '@/services/gemini/analyzer';
import * as clientModule from '@/services/gemini/client';

describe('Gemini Service Module', () => {
  describe('Prompts & System Instructions', () => {
    it('contains comprehensive humanitarian triage system instructions', () => {
      expect(BRIDGEAI_SYSTEM_INSTRUCTION).toContain('humanitarian intelligence system');
      expect(BRIDGEAI_SYSTEM_INSTRUCTION).toContain('urgency');
      expect(BRIDGEAI_SYSTEM_INSTRUCTION).toContain('missingInformation');
      expect(BRIDGEAI_SYSTEM_INSTRUCTION).toContain('verification');
      expect(BRIDGEAI_SYSTEM_INSTRUCTION).toContain('recommendedActions');
    });

    it('builds a structured prompt with raw input and hints', () => {
      const prompt = buildAnalysisPrompt({
        input: 'Wildfire spotted near Ridge Road.',
        categoryHint: 'emergency_relief',
        urgencyHint: 'critical',
        locale: 'en-US',
      });

      expect(prompt).toContain('Wildfire spotted near Ridge Road.');
      expect(prompt).toContain('User Category Hint: emergency_relief');
      expect(prompt).toContain('User Urgency Hint: critical');
      expect(prompt).toContain('Target Locale: en-US');
    });
  });

  describe('Gemini Custom Errors', () => {
    it('assigns correct HTTP status codes and error codes', () => {
      const baseErr = new GeminiServiceError('Base error');
      expect(baseErr.statusCode).toBe(500);
      expect(baseErr.code).toBe('GEMINI_ERROR');

      const authErr = new GeminiAuthError();
      expect(authErr.statusCode).toBe(401);
      expect(authErr.code).toBe('GEMINI_AUTH_ERROR');

      const rateErr = new GeminiRateLimitError();
      expect(rateErr.statusCode).toBe(429);
      expect(rateErr.code).toBe('GEMINI_RATE_LIMIT_ERROR');

      const valErr = new GeminiValidationError('Validation failed', { field: 'required' });
      expect(valErr.statusCode).toBe(422);
      expect(valErr.code).toBe('GEMINI_VALIDATION_ERROR');
      expect(valErr.validationErrors).toEqual({ field: 'required' });
    });
  });

  describe('GeminiAnalyzer', () => {
    const analyzer = new GeminiAnalyzer();
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = {
        ...originalEnv,
        GEMINI_API_KEY: 'test-api-key-for-vitest',
        GEMINI_MODEL: 'gemini-2.5-flash',
        NODE_ENV: 'test',
        VITEST: 'true',
      };
    });

    afterEach(() => {
      process.env = originalEnv;
      vi.restoreAllMocks();
    });

    it('successfully analyzes input when Gemini returns compliant structured JSON', async () => {
      const validMockResponse = {
        summary: 'Wildfire encroaching upon residential zone.',
        category: 'emergency_relief',
        urgency: {
          level: 'critical',
          score: 10,
          reasoning: 'Active fire front approaching residences within minutes.',
        },
        extractedDetails: {
          locations: [{ name: 'Ridge Road' }],
          entities: [],
          contactInfo: [],
          resourceNeeds: [{ category: 'Firefighting', item: 'Water tankers', urgency: 'critical' }],
        },
        missingInformation: [],
        verification: {
          status: 'verified',
          confidenceScore: 0.95,
          reasoning: 'Visual sighting by local patrol.',
        },
        sources: [
          {
            quote: 'Wildfire spotted near Ridge Road.',
            relevance: 'Initial sighting',
            confidence: 0.95,
          },
        ],
        recommendedActions: [
          {
            id: 'act-1',
            title: 'Evacuate Ridge Road',
            description: 'Issue immediate Level 3 Go Now evacuation order.',
            priority: 'critical',
            status: 'pending',
          },
        ],
      };

      const mockGenerateContent = vi.fn().mockResolvedValue({
        text: JSON.stringify(validMockResponse),
      });

      vi.spyOn(clientModule, 'getGeminiClient').mockReturnValue({
        models: {
          generateContent: mockGenerateContent,
        },
      } as unknown as ReturnType<typeof clientModule.getGeminiClient>);

      const result = await analyzer.analyze({
        input: 'Wildfire spotted near Ridge Road. Approaching houses quickly!',
      });

      expect(result.summary).toBe('Wildfire encroaching upon residential zone.');
      expect(result.category).toBe('emergency_relief');
      expect(result.urgency.level).toBe('critical');
      expect(result.metadata.sanitized).toBe(true);
      expect(result.metadata.processingTimeMs).toBeGreaterThanOrEqual(0);
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('throws GeminiValidationError when model response is not valid JSON', async () => {
      vi.spyOn(clientModule, 'getGeminiClient').mockReturnValue({
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: 'I cannot parse this report into JSON.',
          }),
        },
      } as unknown as ReturnType<typeof clientModule.getGeminiClient>);

      await expect(
        analyzer.analyze({ input: 'Sample report text longer than ten chars' })
      ).rejects.toThrow(GeminiValidationError);
    });

    it('throws GeminiAuthError when API key is invalid', async () => {
      vi.spyOn(clientModule, 'getGeminiClient').mockReturnValue({
        models: {
          generateContent: vi.fn().mockRejectedValue(new Error('API_KEY_INVALID: 401 unauthenticated')),
        },
      } as unknown as ReturnType<typeof clientModule.getGeminiClient>);

      await expect(
        analyzer.analyze({ input: 'Sample emergency input longer than 10 characters' })
      ).rejects.toThrow(GeminiAuthError);
    });

    it('throws GeminiRateLimitError when quota is exhausted', async () => {
      vi.spyOn(clientModule, 'getGeminiClient').mockReturnValue({
        models: {
          generateContent: vi.fn().mockRejectedValue(new Error('RESOURCE_EXHAUSTED: 429 quota reached')),
        },
      } as unknown as ReturnType<typeof clientModule.getGeminiClient>);

      await expect(
        analyzer.analyze({ input: 'Sample emergency input longer than 10 characters' })
      ).rejects.toThrow(GeminiRateLimitError);
    });
  });
});
