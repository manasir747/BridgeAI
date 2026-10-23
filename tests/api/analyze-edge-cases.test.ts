import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/analyze/route';
import { NextRequest } from 'next/server';
import { geminiAnalyzer } from '@/services/gemini/analyzer';
import {
  GeminiValidationError,
  GeminiNetworkError,
} from '@/services/gemini/client';

describe('POST /api/analyze Route Handler - Edge Cases & Robustness', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Input validation failure paths', () => {
    it('rejects requests with missing input field', async () => {
      const req = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ categoryHint: 'emergency_relief' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_FAILED');
      expect(json.error.details).toBeDefined();
    });

    it('rejects oversized inputs exceeding 10,000 characters', async () => {
      const oversizedText = 'A'.repeat(10001);
      const req = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ input: oversizedText }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_FAILED');
      expect(json.error.message).toContain('maximum allowed limit');
    });

    it('rejects invalid categoryHint values', async () => {
      const req = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({
          input: 'Valid emergency message requiring assistance in sector 4.',
          categoryHint: 'invalid_category_name',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_FAILED');
    });

    it('rejects invalid urgencyHint values', async () => {
      const req = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({
          input: 'Valid emergency message requiring assistance in sector 4.',
          urgencyHint: 'ultra_critical_now',
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('VALIDATION_FAILED');
    });

    it('sanitizes inputs by stripping invisible unicode overrides before processing', async () => {
      const mockResult = {
        id: 'mock-sanitized-1',
        rawInput: 'Emergency at shelter 12.',
        timestamp: new Date().toISOString(),
        summary: 'Emergency at shelter 12.',
        category: 'emergency_relief' as const,
        urgency: { level: 'high' as const, score: 8, reasoning: 'Flooding' },
        extractedDetails: { locations: [{ name: 'Shelter 12' }], entities: [], contactInfo: [], resourceNeeds: [] },
        missingInformation: [],
        verification: { status: 'verified' as const, confidenceScore: 0.9, reasoning: 'Confirmed' },
        sources: [],
        recommendedActions: [{ id: 'a1', title: 'Evacuate', description: 'Deploy vans', priority: 'high' as const, status: 'pending' as const }],
        metadata: { modelVersion: 'gemini-2.5-flash', processingTimeMs: 150, inputLength: 23, sanitized: true, createdAt: new Date().toISOString() },
      };

      const spy = vi.spyOn(geminiAnalyzer, 'analyze').mockResolvedValue(mockResult);

      // Input containing zero-width spaces (\u200B) and RTL override (\u202E)
      const dirtyInput = '\u200BEmergency at\u202E shelter 12.\uFEFF';
      const req = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ input: dirtyInput }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      // Verify that sanitized input was passed to analyzer
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          input: 'Emergency at shelter 12.',
        })
      );
    });
  });

  describe('Gemini upstream failure paths & HTTP status mapping', () => {
    it('returns 504 when Gemini network times out', async () => {
      vi.spyOn(geminiAnalyzer, 'analyze').mockRejectedValue(new GeminiNetworkError());

      const req = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ input: 'Disaster reported near riverbank with water rising.' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      expect(res.status).toBe(504);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('GEMINI_NETWORK_TIMEOUT');
    });

    it('returns 422 with validation errors when Gemini output fails schema validation', async () => {
      const valError = new GeminiValidationError('Model response missing required urgency', {
        missingFields: ['urgency.score'],
      });
      vi.spyOn(geminiAnalyzer, 'analyze').mockRejectedValue(valError);

      const req = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ input: 'Disaster reported near riverbank with water rising.' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      expect(res.status).toBe(422);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('GEMINI_VALIDATION_ERROR');
      expect(json.error.details).toEqual({ missingFields: ['urgency.score'] });
    });

    it('returns 500 when an unhandled server error occurs', async () => {
      vi.spyOn(geminiAnalyzer, 'analyze').mockRejectedValue(new Error('Unexpected database fault'));

      const req = new NextRequest('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: JSON.stringify({ input: 'Disaster reported near riverbank with water rising.' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await POST(req);
      expect(res.status).toBe(500);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });
});
