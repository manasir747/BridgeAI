import { describe, it, expect } from 'vitest';
import {
  structuredAnalysisSchema,
  analysisCategorySchema,
  urgencyLevelSchema,
} from '@/lib/validation/analysis.schema';
import {
  analysisRequestSchema,
  sanitizeInput,
  INPUT_LIMITS,
} from '@/lib/validation/input.schema';
import { maskSecret, serverEnvSchema } from '@/lib/validation/env.schema';
import { StructuredAnalysisResult } from '@/types/analysis';

describe('Zod Contracts & Validation', () => {
  const validResult: StructuredAnalysisResult = {
    id: 'test-uuid-1234',
    rawInput: 'Emergency at 123 Main St: flooding and power outage.',
    timestamp: '2026-10-23T10:00:00.000Z',
    summary: 'Flooding and power outage affecting 123 Main St.',
    category: 'emergency_relief',
    urgency: {
      level: 'critical',
      score: 9,
      reasoning: 'Imminent danger from live water and electrical outage.',
    },
    extractedDetails: {
      locations: [{ name: '123 Main St', address: '123 Main St' }],
      entities: [{ name: 'First Responders', type: 'organization', role: 'rescue' }],
      affectedPopulation: { countEstimate: 20, vulnerableGroups: ['Elderly'] },
      temporalInfo: { reportedTime: '10:00 AM' },
      contactInfo: [{ type: 'phone', value: '555-0100', name: 'John Doe' }],
      resourceNeeds: [{ category: 'Medical', item: 'First aid kits', urgency: 'high' }],
    },
    missingInformation: [
      {
        field: 'Water Depth',
        description: 'Current water depth inside the building',
        criticality: 'high',
      },
    ],
    verification: {
      status: 'verified',
      confidenceScore: 0.95,
      reasoning: 'Direct witness report with contact info.',
    },
    sources: [
      {
        quote: 'Emergency at 123 Main St',
        relevance: 'Location confirmation',
        confidence: 0.99,
      },
    ],
    recommendedActions: [
      {
        id: 'act-1',
        title: 'Dispatch water rescue unit',
        description: 'Send high-water vehicle to 123 Main St',
        priority: 'critical',
        targetEntity: 'Rescue Squad',
        status: 'pending',
      },
    ],
    metadata: {
      modelVersion: 'gemini-2.5-flash',
      processingTimeMs: 450,
      inputLength: 53,
      sanitized: true,
      createdAt: '2026-10-23T10:00:00.000Z',
    },
  };

  describe('structuredAnalysisSchema', () => {
    it('validates a complete, compliant analysis result', () => {
      const result = structuredAnalysisSchema.safeParse(validResult);
      expect(result.success).toBe(true);
    });

    it('rejects an invalid category enum', () => {
      const invalid = { ...validResult, category: 'non_existent_category' };
      const result = structuredAnalysisSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('category');
      }
    });

    it('rejects an urgency score outside 1-10 range', () => {
      const invalidLow = {
        ...validResult,
        urgency: { ...validResult.urgency, score: 0 },
      };
      const invalidHigh = {
        ...validResult,
        urgency: { ...validResult.urgency, score: 11 },
      };
      expect(structuredAnalysisSchema.safeParse(invalidLow).success).toBe(false);
      expect(structuredAnalysisSchema.safeParse(invalidHigh).success).toBe(false);
    });

    it('rejects a confidence score outside 0-1 range', () => {
      const invalid = {
        ...validResult,
        verification: { ...validResult.verification, confidenceScore: 1.5 },
      };
      expect(structuredAnalysisSchema.safeParse(invalid).success).toBe(false);
    });

    it('rejects missing mandatory fields like summary or rawInput', () => {
      const missingSummary = { ...validResult, summary: '' };
      expect(structuredAnalysisSchema.safeParse(missingSummary).success).toBe(false);

      const missingRaw = { ...validResult, rawInput: '' };
      expect(structuredAnalysisSchema.safeParse(missingRaw).success).toBe(false);
    });
  });

  describe('analysisCategorySchema & urgencyLevelSchema', () => {
    it('accepts all humanitarian categories', () => {
      const validCategories = [
        'emergency_relief',
        'healthcare_access',
        'infrastructure_damage',
        'food_water_security',
        'shelter_housing',
        'public_safety',
        'missing_persons',
        'community_assistance',
        'other',
      ];
      validCategories.forEach((cat) => {
        expect(analysisCategorySchema.safeParse(cat).success).toBe(true);
      });
    });

    it('accepts valid urgency levels', () => {
      const levels = ['critical', 'high', 'medium', 'low'];
      levels.forEach((lvl) => {
        expect(urgencyLevelSchema.safeParse(lvl).success).toBe(true);
      });
    });
  });

  describe('Input Sanitization & Request Validation', () => {
    it('sanitizes harmful control characters, null bytes, and zero-width spaces', () => {
      const dirty = 'Alert: \x00Danger\x08 at \u200BLocation\uFEFF! \t\n';
      const clean = sanitizeInput(dirty);
      expect(clean).toBe('Alert: Danger at Location!');
    });

    it('rejects input shorter than minimum length', () => {
      const tooShort = { input: 'Too short' }; // 9 chars
      const result = analysisRequestSchema.safeParse(tooShort);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          `at least ${INPUT_LIMITS.MIN_LENGTH} characters`
        );
      }
    });

    it('rejects input exceeding maximum length', () => {
      const tooLong = { input: 'a'.repeat(INPUT_LIMITS.MAX_LENGTH + 1) };
      const result = analysisRequestSchema.safeParse(tooLong);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('exceeds the maximum allowed limit');
      }
    });

    it('successfully parses valid input with optional hints', () => {
      const valid = {
        input: 'Flash flood reported at downtown avenue, 3 cars submerged.',
        categoryHint: 'emergency_relief',
        urgencyHint: 'high',
        locale: 'en-US',
      };
      const result = analysisRequestSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.categoryHint).toBe('emergency_relief');
        expect(result.data.urgencyHint).toBe('high');
      }
    });
  });

  describe('Server Environment & Secret Masking', () => {
    it('masks secrets safely without leaking sensitive tokens', () => {
      expect(maskSecret('AIzaSyDk123456789XyZ')).toBe('AIza...9XyZ');
      expect(maskSecret('short')).toBe('****');
      expect(maskSecret(null)).toBe('[EMPTY]');
      expect(maskSecret(undefined)).toBe('[EMPTY]');
    });

    it('validates server env schema requires GEMINI_API_KEY', () => {
      const valid = {
        GEMINI_API_KEY: 'test-key-12345',
        GEMINI_MODEL: 'gemini-2.5-flash',
        NODE_ENV: 'test',
      };
      expect(serverEnvSchema.safeParse(valid).success).toBe(true);

      const missingKey = {
        GEMINI_API_KEY: '',
        GEMINI_MODEL: 'gemini-2.5-flash',
      };
      expect(serverEnvSchema.safeParse(missingKey).success).toBe(false);
    });
  });
});
