'use client';

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import { Mic, Square, RotateCcw, X } from 'lucide-react';
import { SupportedLanguage } from '@/types/i18n';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export interface VoiceDictationProps {
  language: SupportedLanguage;
  onTranscript: (transcript: string) => void;
  disabled?: boolean;
}

const emptySubscribe = () => () => {};

function checkSpeechRecognitionSupport(): boolean {
  if (typeof window === 'undefined') return true;
  return !!(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}

const LANG_MAP: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  mr: 'mr-IN',
};

const LANG_LABEL: Record<SupportedLanguage, string> = {
  en: 'English (en-IN)',
  hi: 'हिंदी (hi-IN)',
  mr: 'मराठी (mr-IN)',
};

// Web Speech API interface definitions for TypeScript
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

export function VoiceDictation({
  language,
  onTranscript,
  disabled = false,
}: VoiceDictationProps) {
  const { t, format } = useLanguage();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [interimText, setInterimText] = useState<string>('');

  const isSupported = useSyncExternalStore(
    emptySubscribe,
    checkSpeechRecognitionSupport,
    () => true
  );

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Clean up any active speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Best effort cleanup
        }
      }
    };
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Best effort stop
      }
    }
    setIsListening(false);
    if (interimText.trim()) {
      onTranscript(interimText.trim());
      setInterimText('');
    }
  }, [interimText, onTranscript]);

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return;

    setError(null);
    setInterimText('');

    const SpeechRecognitionClass =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setError(t.dictation.unsupported);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionClass();
      recognition.lang = LANG_MAP[language] || 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let finalChunk = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            finalChunk += (finalChunk ? ' ' : '') + text.trim();
          } else {
            currentInterim += text;
          }
        }

        if (finalChunk.trim()) {
          onTranscript(finalChunk.trim());
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        setIsListening(false);
        const errType = event.error;

        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          setError(t.dictation.permissionDenied);
        } else if (errType === 'no-speech') {
          setError(t.dictation.noSpeech);
        } else if (errType === 'audio-capture') {
          setError(t.dictation.audioCapture);
        } else if (errType === 'network') {
          setError(t.dictation.networkError);
        } else if (errType === 'aborted') {
          // Clean abort, no user-facing error needed
        } else {
          setError(format(t.dictation.genericError, { error: errType || 'unknown' }));
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      setIsListening(false);
      setError(err instanceof Error ? err.message : String(err));
    }
  }, [language, onTranscript, t.dictation, format]);

  // If disabled externally, stop active recording
  useEffect(() => {
    if (disabled && isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  }, [disabled, isListening]);

  return (
    <div
      className={`rounded-2xl border transition-all p-3 sm:p-4 flex flex-row sm:flex-col items-center justify-between sm:justify-between sm:w-36 shrink-0 shadow-xs backdrop-blur-md gap-3 ${
        isListening
          ? 'border-rose-500/70 bg-rose-950/30 ring-2 ring-rose-500/25'
          : error
          ? 'border-amber-500/50 bg-amber-950/20'
          : 'border-slate-700/80 bg-slate-950/80 hover:border-slate-600'
      }`}
      role="region"
      aria-label="Voice Dictation"
    >
      {/* Top / Left: Language Tag & Status */}
      <div className="flex sm:flex-col items-center sm:items-center gap-1.5 sm:gap-1 text-left sm:text-center shrink-0">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700/80 bg-slate-900/90 px-2.5 py-0.5 text-[10px] font-mono font-bold text-slate-300">
          {isListening ? (
            <span className="flex h-2 w-2 relative" aria-hidden="true">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          ) : (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true"></span>
          )}
          <span>{LANG_MAP[language]}</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-300 hidden sm:inline">
          {isListening ? t.dictation.listening : t.dictation.title}
        </span>
      </div>

      {/* Center: Microphone Button */}
      <div className="flex flex-col items-center shrink-0">
        <button
          type="button"
          onClick={isListening ? stopListening : startListening}
          disabled={disabled || !isSupported}
          className={`group relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
            isListening
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 ring-4 ring-rose-500/20 animate-pulse'
              : error
              ? 'bg-amber-950/70 text-amber-300 border border-amber-500/40 hover:bg-amber-900/60'
              : !isSupported
              ? 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
              : 'bg-slate-900 text-slate-200 border border-slate-700 hover:border-emerald-500/60 hover:bg-emerald-950/40 hover:text-emerald-300 shadow-sm'
          }`}
          aria-label={
            isListening
              ? t.dictation.stopAria
              : format(t.dictation.startAria, { lang: LANG_LABEL[language] })
          }
          aria-pressed={isListening}
        >
          {isListening ? (
            <Square className="h-5 w-5 fill-current" />
          ) : (
            <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
          )}
        </button>

        {interimText && (
          <span className="text-[10px] text-emerald-300 font-mono italic max-w-[130px] truncate mt-1 hidden sm:block">
            {interimText}
          </span>
        )}
      </div>

      {/* Bottom / Right: Action Label or Error Alert */}
      <div className="w-auto sm:w-full text-right sm:text-center text-xs">
        {error ? (
          <div className="space-y-1 max-w-[180px] sm:max-w-none">
            <p className="text-[10px] text-amber-300 line-clamp-2 leading-tight" title={error} role="alert">
              {error}
            </p>
            <div className="flex items-center justify-end sm:justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  startListening();
                }}
                className="text-[10px] text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>{t.dictation.retry}</span>
              </button>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-[10px] text-slate-400 hover:text-slate-200 p-0.5 cursor-pointer"
                aria-label={t.dictation.dismiss}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
        ) : isListening ? (
          <button
            type="button"
            onClick={stopListening}
            className="text-[11px] font-bold text-rose-300 hover:text-rose-200 hover:underline cursor-pointer"
          >
            {t.dictation.clickToStop}
          </button>
        ) : !isSupported ? (
          <span className="text-[10px] text-slate-500 leading-tight block">
            {t.dictation.unsupported}
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 leading-tight block">
            {t.dictation.ready}
          </span>
        )}
      </div>
    </div>
  );
}
