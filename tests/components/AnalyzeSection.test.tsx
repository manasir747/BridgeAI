import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyzeSection } from '@/components/analyze/AnalyzeSection';
import { HUMANITARIAN_PRESETS } from '@/lib/examples';

describe('AnalyzeSection Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders input elements, presets, and category pills', () => {
    render(<AnalyzeSection onAnalysisSuccess={vi.fn()} />);

    expect(screen.getByPlaceholderText(/Example: Emergency at St. Jude Clinic/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run BridgeAI Analysis/i })).toBeInTheDocument();
    expect(screen.getByText('Healthcare Access')).toBeInTheDocument();
    expect(screen.getByText('Emergency Relief')).toBeInTheDocument();
  });

  it('populates fields when a preset chip is selected', () => {
    render(<AnalyzeSection onAnalysisSuccess={vi.fn()} />);

    const preset = HUMANITARIAN_PRESETS[0];
    const presetChip = screen.getByLabelText(`Load preset scenario: ${preset.title}`);
    fireEvent.click(presetChip);

    const textarea = screen.getByPlaceholderText(/Example: Emergency at St. Jude Clinic/i) as HTMLTextAreaElement;
    expect(textarea.value).toBe(preset.rawInput);
  });

  it('disables submit when input is shorter than 10 characters', () => {
    render(<AnalyzeSection onAnalysisSuccess={vi.fn()} />);

    const textarea = screen.getByPlaceholderText(/Example: Emergency at St. Jude Clinic/i);
    const submitBtn = screen.getByRole('button', { name: /Run BridgeAI Analysis/i });

    fireEvent.change(textarea, { target: { value: 'Too short' } });
    expect(submitBtn).toBeDisabled();
  });

  it('handles successful API analysis and invokes onAnalysisSuccess', async () => {
    const handleSuccess = vi.fn();

    const mockResult = {
      id: 'mock-1',
      rawInput: 'Bridge collapsed on Route 9, urgent traffic halt required.',
      timestamp: new Date().toISOString(),
      summary: 'Bridge collapse on Route 9.',
      category: 'infrastructure_damage',
      urgency: { level: 'critical', score: 9, reasoning: 'Structural failure' },
      extractedDetails: {
        locations: [{ name: 'Route 9' }],
        entities: [],
        contactInfo: [],
        resourceNeeds: [],
      },
      missingInformation: [],
      verification: { status: 'verified', confidenceScore: 0.95, reasoning: 'Police report' },
      sources: [],
      recommendedActions: [
        { id: 'act-1', title: 'Halt traffic', description: 'Close ramps', priority: 'critical', status: 'pending' },
      ],
      metadata: { modelVersion: 'gemini-2.5-flash', processingTimeMs: 250, inputLength: 60, sanitized: true, createdAt: new Date().toISOString() },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: mockResult }),
    });

    render(<AnalyzeSection onAnalysisSuccess={handleSuccess} />);

    const textarea = screen.getByPlaceholderText(/Example: Emergency at St. Jude Clinic/i);
    fireEvent.change(textarea, { target: { value: 'Bridge collapsed on Route 9, urgent traffic halt required.' } });

    const submitBtn = screen.getByRole('button', { name: /Run BridgeAI Analysis/i });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledWith(mockResult);
    });
  });

  it('displays error banner and allows demo simulation fallback on API failure', async () => {
    const handleSuccess = vi.fn();

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        success: false,
        error: { message: 'GEMINI_API_KEY is not configured on the server.' },
      }),
    });

    render(<AnalyzeSection onAnalysisSuccess={handleSuccess} />);

    const textarea = screen.getByPlaceholderText(/Example: Emergency at St. Jude Clinic/i);
    fireEvent.change(textarea, {
      target: { value: 'Flash flood trapped 12 residents in community center with medical needs.' },
    });

    const submitBtn = screen.getByRole('button', { name: /Run BridgeAI Analysis/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/GEMINI_API_KEY is not configured on the server/i)).toBeInTheDocument();
    });

    const fallbackBtn = screen.getByRole('button', { name: /Load Demo Simulation/i });
    expect(fallbackBtn).toBeInTheDocument();

    fireEvent.click(fallbackBtn);

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalled();
      const passedResult = handleSuccess.mock.calls[0][0];
      expect(passedResult.summary).toContain('[Demo Simulation]');
      expect(passedResult.metadata.modelVersion).toBe('simulated-demo-engine');
    });
  });

  it('resets input state when clicking Reset button', () => {
    render(<AnalyzeSection onAnalysisSuccess={vi.fn()} />);

    const textarea = screen.getByPlaceholderText(/Example: Emergency at St. Jude Clinic/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Emergency dispatch test string.' } });
    expect(textarea.value).toBe('Emergency dispatch test string.');

    const resetBtn = screen.getByLabelText(/Clear all inputs and reset form/i);
    fireEvent.click(resetBtn);

    expect(textarea.value).toBe('');
  });

  it('renders microphone button beside textarea and appends dictated speech with spacing', () => {
    interface MockInstance {
      start: ReturnType<typeof vi.fn>;
      onstart: (() => void) | null;
      onresult: ((e: {
        resultIndex: number;
        results: Array<{ isFinal: boolean; 0: { transcript: string } }>;
      }) => void) | null;
    }

    let mockInstance: MockInstance | null = null;
    function registerMockInstance(instance: MockInstance) {
      mockInstance = instance;
    }

    class MockSpeechRecognition {
      lang = 'en-IN';
      continuous = false;
      interimResults = false;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((e: { error: string }) => void) | null = null;
      onresult: ((e: {
        resultIndex: number;
        results: Array<{ isFinal: boolean; 0: { transcript: string } }>;
      }) => void) | null = null;
      start = vi.fn().mockImplementation(() => {
        this.onstart?.();
      });
      stop = vi.fn().mockImplementation(() => {
        this.onend?.();
      });
      abort = vi.fn().mockImplementation(() => {
        this.onend?.();
      });
      constructor() {
        registerMockInstance(this);
      }
    }

    const win = window as unknown as Record<string, unknown>;
    const originalSR = win.SpeechRecognition;
    win.SpeechRecognition = MockSpeechRecognition;

    const handleSuccess = vi.fn();
    render(<AnalyzeSection onAnalysisSuccess={handleSuccess} />);

    // Check that voice dictation region and mic button are present
    const micBtn = screen.getByRole('button', { name: /Start voice dictation/i });
    expect(micBtn).toBeInTheDocument();

    const textarea = screen.getByPlaceholderText(/Example: Emergency at St. Jude Clinic/i) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Bridge collapsed on Route 9.' } });

    // Click mic button to start dictation
    fireEvent.click(micBtn);
    const instance = mockInstance as unknown as MockInstance;
    expect(instance.start).toHaveBeenCalled();

    // Emit transcribed speech
    act(() => {
      instance.onresult?.({
        resultIndex: 0,
        results: [
          {
            isFinal: true,
            0: { transcript: 'Send ambulances immediately.' },
          },
        ],
      });
    });

    // Verify text is appended with a space and NOT replaced
    expect(textarea.value).toBe('Bridge collapsed on Route 9. Send ambulances immediately.');

    // Verify submission was NOT automatically triggered
    expect(handleSuccess).not.toHaveBeenCalled();

    // Verify character counter updated
    expect(
      screen.getByText(new RegExp(`${textarea.value.length} / 10000 chars`, 'i'))
    ).toBeInTheDocument();

    win.SpeechRecognition = originalSR;
  });
});
