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

    it('successfully parses markdown-wrapped JSON responses from model', async () => {
      const validMockResponse = {
        summary: 'Emergency evacuation required.',
        category: 'emergency_relief',
        urgency: { level: 'high', score: 8, reasoning: 'Flooding' },
        extractedDetails: { locations: [], entities: [], contactInfo: [], resourceNeeds: [] },
        missingInformation: [],
        verification: { status: 'unverified', confidenceScore: 0.8, reasoning: 'Single report' },
        sources: [],
        recommendedActions: [{ title: 'Deploy units', priority: 'high', description: 'Immediate' }],
      };

      const markdownWrapped = `\`\`\`json\n${JSON.stringify(validMockResponse)}\n\`\`\``;

      vi.spyOn(clientModule, 'getGeminiClient').mockReturnValue({
        models: {
          generateContent: vi.fn().mockResolvedValue({ text: markdownWrapped }),
        },
      } as unknown as ReturnType<typeof clientModule.getGeminiClient>);

      const result = await analyzer.analyze({ input: 'Emergency flood report on Route 9.' });
      expect(result.summary).toBe('Emergency evacuation required.');
      expect(result.recommendedActions[0].id).toBeDefined();
      expect(result.recommendedActions[0].status).toBe('pending');
    });

    it('throws GeminiValidationError when model response is missing required schema fields', async () => {
      const incompleteResponse = {
        summary: 'Missing urgency and other required fields.',
      };

      vi.spyOn(clientModule, 'getGeminiClient').mockReturnValue({
        models: {
          generateContent: vi.fn().mockResolvedValue({ text: JSON.stringify(incompleteResponse) }),
        },
      } as unknown as ReturnType<typeof clientModule.getGeminiClient>);

      await expect(
        analyzer.analyze({ input: 'Incomplete emergency response test.' })
      ).rejects.toThrow(GeminiValidationError);
    });

    it('throws GeminiServiceError when model response is empty', async () => {
      vi.spyOn(clientModule, 'getGeminiClient').mockReturnValue({
        models: {
          generateContent: vi.fn().mockResolvedValue({ text: '' }),
        },
      } as unknown as ReturnType<typeof clientModule.getGeminiClient>);

      await expect(
        analyzer.analyze({ input: 'Sample emergency input longer than 10 characters' })
      ).rejects.toThrow('Empty response received from Gemini model.');
    });

    it('throws GeminiServiceError with 404 when model is not found', async () => {
      vi.spyOn(clientModule, 'getGeminiClient').mockReturnValue({
        models: {
          generateContent: vi.fn().mockRejectedValue(new Error('models/gemini-not-real is not found for API version v1beta: 404')),
        },
      } as unknown as ReturnType<typeof clientModule.getGeminiClient>);

      await expect(
        analyzer.analyze({ input: 'Sample emergency input longer than 10 characters' })
      ).rejects.toThrow('was not found or is unavailable');
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

    it('throws GeminiNetworkError when network timeout occurs', async () => {
      vi.spyOn(clientModule, 'getGeminiClient').mockReturnValue({
        models: {
          generateContent: vi.fn().mockRejectedValue(new Error('fetch failed: ETIMEDOUT')),
        },
      } as unknown as ReturnType<typeof clientModule.getGeminiClient>);

      await expect(
        analyzer.analyze({ input: 'Sample emergency input longer than 10 characters' })
      ).rejects.toThrow('Network error while connecting to Gemini API');
    });

    it('normalizes percentage confidence scores and null fields cleanly', async () => {
      const responseWithNullsAndPercentages = {
        summary: 'Water main break in downtown sector.',
        category: 'infrastructure_damage',
        urgency: {
          level: 'high',
          score: 8,
          reasoning: 'Water flooding street',
        },
        extractedDetails: {
          locations: [{ name: 'Downtown Main St', address: null }],
          entities: [{ name: 'Fire Dept', type: 'first_responder', role: null }],
          contactInfo: [],
          resourceNeeds: [],
        },
        missingInformation: [],
        verification: {
          status: 'verified',
          confidenceScore: 92, // Integer percentage that needs normalization to 0.92
          reasoning: 'City dispatch report',
        },
        sources: [
          {
            quote: 'Water main broke downtown.',
            relevance: 'Location detail',
            confidence: 85, // Integer percentage that needs normalization to 0.85
          },
        ],
        recommendedActions: [
          {
            title: 'Isolate main valve',
            description: 'Turn off shutoff valve at 4th and Main.',
            priority: 'high',
          },
        ],
      };

      vi.spyOn(clientModule, 'getGeminiClient').mockReturnValue({
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: JSON.stringify(responseWithNullsAndPercentages),
          }),
        },
      } as unknown as ReturnType<typeof clientModule.getGeminiClient>);

      const result = await analyzer.analyze({
        input: 'Massive water main broke on Downtown Main St. Flooding street!',
      });

      expect(result.verification.confidenceScore).toBe(0.92);
      expect(result.sources[0].confidence).toBe(0.85);
      expect(result.extractedDetails.entities[0].type).toBe('other'); // Normalized from unrecognized 'first_responder'
      expect(result.extractedDetails.locations[0].address).toBeUndefined(); // Null stripped
    });

    it('throws GeminiValidationError when an unrecoverable invalid enum value is present', async () => {
      const responseWithInvalidCategory = {
        summary: 'Alien invasion reported.',
        category: 'unrecognized_nonexistent_category',
        urgency: { level: 'critical', score: 10, reasoning: 'Unknown threat' },
        extractedDetails: { locations: [], entities: [], contactInfo: [], resourceNeeds: [] },
        missingInformation: [],
        verification: { status: 'unverified', confidenceScore: 0.1, reasoning: 'Unsubstantiated' },
        sources: [],
        recommendedActions: [],
      };

      vi.spyOn(clientModule, 'getGeminiClient').mockReturnValue({
        models: {
          generateContent: vi.fn().mockResolvedValue({
            text: JSON.stringify(responseWithInvalidCategory),
          }),
        },
      } as unknown as ReturnType<typeof clientModule.getGeminiClient>);

      await expect(
        analyzer.analyze({ input: 'Sample emergency input longer than 10 characters' })
      ).rejects.toThrow(GeminiValidationError);
    });
  });
});
