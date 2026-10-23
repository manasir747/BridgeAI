import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VoiceDictation } from '@/components/analyze/VoiceDictation';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';

const startMock = vi.fn();
const stopMock = vi.fn();
const abortMock = vi.fn();

interface MockSpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onresult: ((e: {
    resultIndex: number;
    results: Array<{
      isFinal: boolean;
      0: { transcript: string };
    }>;
  }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

let activeInstance: MockSpeechRecognitionInstance | null = null;

function registerActiveInstance(instance: MockSpeechRecognitionInstance) {
  activeInstance = instance;
}

class MockSpeechRecognition implements MockSpeechRecognitionInstance {
  lang = 'en-IN';
  continuous = false;
  interimResults = false;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((e: { error: string }) => void) | null = null;
  onresult: ((e: {
    resultIndex: number;
    results: Array<{
      isFinal: boolean;
      0: { transcript: string };
    }>;
  }) => void) | null = null;

  start = startMock.mockImplementation(() => {
    this.onstart?.();
  });
  stop = stopMock.mockImplementation(() => {
    this.onend?.();
  });
  abort = abortMock.mockImplementation(() => {
    this.onend?.();
  });

  constructor() {
    registerActiveInstance(this);
  }
}

describe('VoiceDictation Component', () => {
  let originalSpeechRecognition: unknown;
  let originalWebkitSpeechRecognition: unknown;

  beforeEach(() => {
    startMock.mockClear();
    stopMock.mockClear();
    abortMock.mockClear();
    activeInstance = null;

    const win = window as unknown as Record<string, unknown>;
    originalSpeechRecognition = win.SpeechRecognition;
    originalWebkitSpeechRecognition = win.webkitSpeechRecognition;
  });

  afterEach(() => {
    const win = window as unknown as Record<string, unknown>;
    win.SpeechRecognition = originalSpeechRecognition;
    win.webkitSpeechRecognition = originalWebkitSpeechRecognition;
    vi.restoreAllMocks();
  });

  it('renders unsupported message when browser does not have SpeechRecognition', () => {
    const win = window as unknown as Record<string, unknown>;
    delete win.SpeechRecognition;
    delete win.webkitSpeechRecognition;

    render(
      <LanguageProvider>
        <VoiceDictation language="en" onTranscript={vi.fn()} />
      </LanguageProvider>
    );

    const micBtn = screen.getByRole('button', { name: /Start voice dictation/i });
    expect(micBtn).toBeDisabled();
    expect(screen.getByText(/Voice dictation is not supported in this browser/i)).toBeInTheDocument();
  });

  it('renders Ready state with appropriate language tag for en, hi, and mr', () => {
    const win = window as unknown as Record<string, unknown>;
    win.SpeechRecognition = MockSpeechRecognition;

    const { rerender } = render(
      <LanguageProvider>
        <VoiceDictation language="en" onTranscript={vi.fn()} />
      </LanguageProvider>
    );

    expect(screen.getByText('en-IN')).toBeInTheDocument();
    expect(screen.getByText('Ready to dictate')).toBeInTheDocument();

    rerender(
      <LanguageProvider>
        <VoiceDictation language="hi" onTranscript={vi.fn()} />
      </LanguageProvider>
    );
    expect(screen.getByText('hi-IN')).toBeInTheDocument();

    rerender(
      <LanguageProvider>
        <VoiceDictation language="mr" onTranscript={vi.fn()} />
      </LanguageProvider>
    );
    expect(screen.getByText('mr-IN')).toBeInTheDocument();
  });

  it('starts listening when microphone button is clicked and stops when clicked again', () => {
    const win = window as unknown as Record<string, unknown>;
    win.SpeechRecognition = MockSpeechRecognition;

    const handleTranscript = vi.fn();
    render(
      <LanguageProvider>
        <VoiceDictation language="en" onTranscript={handleTranscript} />
      </LanguageProvider>
    );

    const startBtn = screen.getByRole('button', { name: /Start voice dictation/i });
    fireEvent.click(startBtn);

    expect(activeInstance).not.toBeNull();
    expect(startMock).toHaveBeenCalled();
    expect(screen.getByText('Listening...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Stop voice dictation/i })).toBeInTheDocument();

    // Click to stop
    const stopBtn = screen.getByRole('button', { name: /Stop voice dictation/i });
    fireEvent.click(stopBtn);

    expect(stopMock).toHaveBeenCalled();
    expect(screen.queryByText('Listening...')).not.toBeInTheDocument();
  });

  it('emits finalized transcripts to onTranscript', () => {
    const win = window as unknown as Record<string, unknown>;
    win.SpeechRecognition = MockSpeechRecognition;

    const handleTranscript = vi.fn();
    render(
      <LanguageProvider>
        <VoiceDictation language="en" onTranscript={handleTranscript} />
      </LanguageProvider>
    );

    const startBtn = screen.getByRole('button', { name: /Start voice dictation/i });
    fireEvent.click(startBtn);

    act(() => {
      activeInstance?.onresult?.({
        resultIndex: 0,
        results: [
          {
            isFinal: true,
            0: { transcript: 'Emergency at Maple Street.' },
          },
        ],
      });
    });

    expect(handleTranscript).toHaveBeenCalledWith('Emergency at Maple Street.');
  });

  it('displays permission denied error when microphone permission is rejected', () => {
    const win = window as unknown as Record<string, unknown>;
    win.SpeechRecognition = MockSpeechRecognition;

    render(
      <LanguageProvider>
        <VoiceDictation language="en" onTranscript={vi.fn()} />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Start voice dictation/i }));

    act(() => {
      activeInstance?.onerror?.({ error: 'not-allowed' });
    });

    expect(screen.getByText(/Microphone permission denied/i)).toBeInTheDocument();
  });

  it('displays no-speech error gracefully and allows retry', () => {
    const win = window as unknown as Record<string, unknown>;
    win.SpeechRecognition = MockSpeechRecognition;

    render(
      <LanguageProvider>
        <VoiceDictation language="en" onTranscript={vi.fn()} />
      </LanguageProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /Start voice dictation/i }));

    act(() => {
      activeInstance?.onerror?.({ error: 'no-speech' });
    });

    expect(screen.getByText(/No speech detected/i)).toBeInTheDocument();

    const retryBtn = screen.getByText('Retry');
    fireEvent.click(retryBtn);

    expect(startMock).toHaveBeenCalledTimes(2);
  });
});
