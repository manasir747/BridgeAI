import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/analyze/route';
import { NextRequest } from 'next/server';
import { geminiAnalyzer } from '@/services/gemini/analyzer';
import { GeminiAuthError, GeminiRateLimitError, GeminiValidationError } from '@/services/gemini/client';

describe('POST /api/analyze route handler', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns 400 when body is not valid JSON', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: 'invalid-non-json',
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_JSON');
  });

  it('returns 400 when input text is too short (< 10 chars)', async () => {
    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ input: 'Too short' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_FAILED');
  });

  it('returns 200 with structured analysis result on success', async () => {
    const mockResult = {
      id: 'mock-100',
      rawInput: 'Bridge collapsed on Route 9, urgent traffic halt required.',
      timestamp: new Date().toISOString(),
      summary: 'Route 9 bridge collapsed.',
      category: 'infrastructure_damage' as const,
      urgency: { level: 'critical' as const, score: 10, reasoning: 'Structural failure' },
      extractedDetails: { locations: [{ name: 'Route 9' }], entities: [], contactInfo: [], resourceNeeds: [] },
      missingInformation: [],
      verification: { status: 'verified' as const, confidenceScore: 0.95, reasoning: 'Direct' },
      sources: [],
      recommendedActions: [{ id: 'a1', title: 'Close ramps', description: 'Immediate halt', priority: 'critical' as const, status: 'pending' as const }],
      metadata: { modelVersion: 'gemini-2.5-flash', processingTimeMs: 200, inputLength: 60, sanitized: true, createdAt: new Date().toISOString() },
    };

    vi.spyOn(geminiAnalyzer, 'analyze').mockResolvedValue(mockResult);

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({
        input: 'Bridge collapsed on Route 9, urgent traffic halt required.',
        categoryHint: 'infrastructure_damage',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.summary).toBe('Route 9 bridge collapsed.');
  });

  it('returns 401 when GeminiAuthError is thrown', async () => {
    vi.spyOn(geminiAnalyzer, 'analyze').mockRejectedValue(new GeminiAuthError());

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ input: 'Emergency situation with medical need.' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('GEMINI_AUTH_ERROR');
  });

  it('returns 429 when GeminiRateLimitError is thrown', async () => {
    vi.spyOn(geminiAnalyzer, 'analyze').mockRejectedValue(new GeminiRateLimitError());

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ input: 'Emergency situation with medical need.' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(429);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('GEMINI_RATE_LIMIT_ERROR');
  });

  it('returns 422 with details when GeminiValidationError is thrown', async () => {
    const details = [{ path: ['urgency', 'score'], message: 'Expected number, received string' }];
    vi.spyOn(geminiAnalyzer, 'analyze').mockRejectedValue(new GeminiValidationError('Invalid model response schema', details));

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ input: 'Emergency situation with medical need.' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(422);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('GEMINI_VALIDATION_ERROR');
    expect(json.error.details).toEqual(details);
  });

  it('returns 404 when model is unavailable or not found', async () => {
    const { GeminiModelNotFoundError } = await import('@/services/gemini/client');
    vi.spyOn(geminiAnalyzer, 'analyze').mockRejectedValue(new GeminiModelNotFoundError('Model not found'));

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ input: 'Emergency situation with medical need.' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('MODEL_NOT_FOUND');
  });

  it('returns 504 when network timeout or connection failure occurs', async () => {
    const { GeminiNetworkError } = await import('@/services/gemini/client');
    vi.spyOn(geminiAnalyzer, 'analyze').mockRejectedValue(new GeminiNetworkError('ETIMEDOUT to Google API'));

    const req = new NextRequest('http://localhost:3000/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ input: 'Emergency situation with medical need.' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req);
    expect(res.status).toBe(504);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('GEMINI_NETWORK_TIMEOUT');
  });
});
