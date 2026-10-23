'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  AlertCircle,
  Loader2,
  Send,
  RotateCcw,
  Info,
  ChevronDown,
  SlidersHorizontal,
  Flame,
  Ambulance,
  AlertTriangle,
  Utensils,
  ShieldAlert,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageUpload, ImageAttachment } from './ImageUpload';
import { AnalysisCategory, UrgencyLevel, StructuredAnalysisResult } from '@/types/analysis';
import { INPUT_LIMITS, sanitizeInput } from '@/lib/validation/input.schema';
import { CATEGORY_METADATA, HUMANITARIAN_PRESETS, ScenarioPreset, generateDemoSimulationResult } from '@/lib/examples';
import { getHistoryService } from '@/services/history/factory';

interface AnalyzeSectionProps {
  initialPreset?: ScenarioPreset | null;
  onAnalysisSuccess: (result: StructuredAnalysisResult) => void;
  onClearPreset?: () => void;
}

export function AnalyzeSection({
  initialPreset,
  onAnalysisSuccess,
  onClearPreset,
}: AnalyzeSectionProps) {
  const [input, setInput] = useState<string>(initialPreset?.rawInput || '');
  const [category, setCategory] = useState<AnalysisCategory | 'auto'>(
    initialPreset?.category || 'auto'
  );
  const [urgencyHint, setUrgencyHint] = useState<UrgencyLevel | 'auto'>(
    initialPreset?.urgencyHint || 'auto'
  );
  const [attachment, setAttachment] = useState<ImageAttachment | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<{ message: string; isAuthOrConfig: boolean } | null>(
    null
  );

  const charCount = input.trim().length;
  const isTooShort = charCount > 0 && charCount < INPUT_LIMITS.MIN_LENGTH;
  const isTooLong = charCount > INPUT_LIMITS.MAX_LENGTH;

  const handlePresetSelect = (preset: ScenarioPreset) => {
    setInput(preset.rawInput);
    setCategory(preset.category);
    setUrgencyHint(preset.urgencyHint);
    setClientError(null);
    setApiError(null);
  };

  const handleReset = () => {
    setInput('');
    setCategory('auto');
    setUrgencyHint('auto');
    setAttachment(null);
    setClientError(null);
    setApiError(null);
    onClearPreset?.();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setClientError(null);
    setApiError(null);

    const sanitized = sanitizeInput(input);
    if (sanitized.length < INPUT_LIMITS.MIN_LENGTH) {
      setClientError(
        `Input text must be at least ${INPUT_LIMITS.MIN_LENGTH} characters long to evaluate context (currently ${sanitized.length}).`
      );
      return;
    }

    if (sanitized.length > INPUT_LIMITS.MAX_LENGTH) {
      setClientError(
        `Input text exceeds the maximum character limit of ${INPUT_LIMITS.MAX_LENGTH} characters.`
      );
      return;
    }

    setIsLoading(true);

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 45000);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: sanitized,
          categoryHint: category !== 'auto' ? category : undefined,
          urgencyHint: urgencyHint !== 'auto' ? urgencyHint : undefined,
        }),
        signal: abortController.signal,
      });

      clearTimeout(timeoutId);

      const json = await response.json();

      if (!response.ok || !json.success) {
        const message = json.error?.message || 'Server failed to analyze the input.';
        const isAuthOrConfig =
          response.status === 401 ||
          message.includes('API_KEY') ||
          message.includes('authentication') ||
          message.includes('configuration');

        setApiError({
          message,
          isAuthOrConfig,
        });
        setIsLoading(false);
        return;
      }

      // Successful analysis via Gemini
      const analysisResult: StructuredAnalysisResult = json.data;

      // Save to client history
      const historyService = getHistoryService();
      await historyService.save(analysisResult, {
        notes: attachment ? `Attached field photo: ${attachment.name}` : undefined,
      });

      setIsLoading(false);
      onAnalysisSuccess(analysisResult);
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      if (err instanceof DOMException && err.name === 'AbortError') {
        setApiError({
          message: 'The analysis request timed out after 45 seconds. Please check your network connection and try again.',
          isAuthOrConfig: false,
        });
      } else {
        const message = err instanceof Error ? err.message : 'Network error connecting to analysis API.';
        setApiError({
          message,
          isAuthOrConfig: false,
        });
      }
      setIsLoading(false);
    }
  };

  const handleRunSimulationFallback = async () => {
    const sanitized = sanitizeInput(input) || 'Simulated disaster response scenario triage request.';
    const chosenCat = category !== 'auto' ? category : 'emergency_relief';
    const simResult = generateDemoSimulationResult(sanitized, chosenCat);

    const historyService = getHistoryService();
    await historyService.save(simResult, {
      notes: '[Simulated Mode] Generated for testing without live Gemini API key.',
      tags: ['simulation', 'demo'],
    });

    onAnalysisSuccess(simResult);
  };

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Ambulance':
        return <Ambulance className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />;
      case 'AlertTriangle':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />;
      case 'Utensils':
        return <Utensils className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />;
      case 'Flame':
        return <Flame className="h-3.5 w-3.5 text-orange-400" aria-hidden="true" />;
      default:
        return <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />;
    }
  };

  return (
    <div className="w-full space-y-6 py-2 animate-entrance">
      {/* Header and Value Context */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-950/40 px-3 py-0.5 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Intake & Triage Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Analyze a Crisis Dispatch
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Paste or type chaotic crisis information from radio transcripts, SMS dispatches, or field notes.
              Gemini extracts locations, urgency, missing facts, and operational action plans.
            </p>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isLoading || (!input && category === 'auto' && !attachment)}
            className="text-xs text-slate-400 hover:text-slate-100 gap-1.5 rounded-xl h-8 px-3"
            aria-label="Clear all inputs and reset form"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
        </div>

        {/* Quick Scenario Preset Chips */}
        <div className="pt-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-emerald-400" />
              <span>Presets:</span>
            </span>
            {HUMANITARIAN_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handlePresetSelect(preset)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 hover:bg-slate-800 hover:border-emerald-500/40 px-3 py-1 text-xs font-medium text-slate-200 transition-all card-hover-lift cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                aria-label={`Load preset scenario: ${preset.title}`}
              >
                {getPresetIcon(preset.iconName)}
                <span>{preset.title.split(' ')[0]}</span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  [{preset.urgencyHint}]
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Central Rounded Workspace Panel */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-7 shadow-md backdrop-blur-xl space-y-4">
          {/* Textarea Composer */}
          <div className="relative z-10 space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="raw-problem-input"
                className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5"
              >
                <span>Raw Field Dispatch / Problem Statement</span>
              </label>
              <span
                className={`text-xs font-medium font-mono ${
                  isTooShort
                    ? 'text-amber-400 font-semibold'
                    : isTooLong
                    ? 'text-rose-400 font-semibold'
                    : 'text-slate-400'
                }`}
                aria-live="polite"
              >
                {charCount} / {INPUT_LIMITS.MAX_LENGTH} chars
                {isTooShort && ` (min ${INPUT_LIMITS.MIN_LENGTH})`}
              </span>
            </div>

            <textarea
              id="raw-problem-input"
              name="rawInput"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={6}
              disabled={isLoading}
              placeholder="Example: Emergency at St. Jude Clinic on 44 Riverside Rd. Flood waters rising to 2nd floor, 4 dialysis patients trapped without generator fuel, need boat evacuation immediately. Call Sarah 555-0199 or radio VHF-16..."
              className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-4 sm:p-5 text-sm sm:text-base text-slate-100 placeholder:text-slate-500 shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/35 focus-visible:border-emerald-500 transition-all resize-y leading-relaxed"
              required
              aria-invalid={!!clientError || isTooShort || isTooLong}
              aria-describedby={clientError ? 'input-error-msg' : undefined}
            />
          </div>

          {/* Compact Category Selector */}
          <div className="relative z-10 space-y-2 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Sector / Category Focus:
              </label>
              <span className="text-[11px] text-slate-400">
                Guides Gemini schema classification
              </span>
            </div>

            <div
              role="radiogroup"
              aria-label="Sector or Problem Category Hint"
              className="flex flex-wrap gap-2"
            >
              {/* Auto-detect option */}
              <button
                type="button"
                onClick={() => setCategory('auto')}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border ${
                  category === 'auto'
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 shadow-xs ring-1 ring-emerald-500/30'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                }`}
                role="radio"
                aria-checked={category === 'auto'}
              >
                Auto-Detect
              </button>

              {/* Category Options rendered as compact segmented chips */}
              {(Object.keys(CATEGORY_METADATA) as AnalysisCategory[]).map((catKey) => {
                const meta = CATEGORY_METADATA[catKey];
                const isSelected = category === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold shadow-xs ring-1 ring-emerald-500/30'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-800'
                    }`}
                    role="radio"
                    aria-checked={isSelected}
                  >
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Refined Image Upload Area */}
          <div className="relative z-10 pt-2 border-t border-slate-800">
            <ImageUpload
              attachment={attachment}
              onAttachmentChange={setAttachment}
              disabled={isLoading}
            />
          </div>

          {/* Collapsible Advanced Options Panel */}
          <div className="relative z-10 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="flex w-full items-center justify-between py-1 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              aria-expanded={isAdvancedOpen}
              aria-controls="advanced-options-panel"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
                <span>Advanced Triage & Urgency Calibration</span>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  isAdvancedOpen ? 'rotate-180 text-emerald-400' : ''
                }`}
              />
            </button>

            {isAdvancedOpen && (
              <div
                id="advanced-options-panel"
                className="mt-2.5 space-y-3.5 rounded-xl bg-slate-950 p-4 border border-slate-800 animate-entrance"
              >
                {/* Urgency Hint Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Prioritized Urgency Calibration:
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Optional responder baseline
                    </span>
                  </div>
                  <div
                    className="flex flex-wrap gap-2 text-xs"
                    role="radiogroup"
                    aria-label="Urgency Hint"
                  >
                    {(['auto', 'critical', 'high', 'medium', 'low'] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setUrgencyHint(level)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer border ${
                          urgencyHint === level
                            ? level === 'critical'
                              ? 'border-rose-500 bg-rose-600 text-white shadow-xs'
                              : level === 'high'
                              ? 'border-amber-500 bg-amber-600 text-white shadow-xs'
                              : 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
                            : 'border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800'
                        }`}
                        role="radio"
                        aria-checked={urgencyHint === level}
                      >
                        {level.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grounding & Verification Note */}
                <div className="flex items-start gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <HelpCircle className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <p>
                    All Gemini outputs adhere to strict schema validation. Information not present in the dispatch is categorized as an information gap rather than hallucinated.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Client Validation Error */}
        {clientError && (
          <div
            id="input-error-msg"
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/25 p-3 text-xs text-amber-300 shadow-xs"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
            <span>{clientError}</span>
          </div>
        )}

        {/* API / Server Error with Simulation Fallback */}
        {apiError && (
          <div
            role="alert"
            className="rounded-2xl border border-rose-500/30 bg-rose-950/25 p-4 space-y-3 text-xs text-rose-200 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold text-slate-100">Gemini Analysis Notice:</p>
                <p className="text-slate-300 leading-relaxed">{apiError.message}</p>
                {apiError.isAuthOrConfig && (
                  <p className="text-[11px] text-slate-400">
                    To enable live AI inference, configure your <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-400">GEMINI_API_KEY</code> in <code className="bg-slate-800 px-1 py-0.5 rounded text-slate-200">.env.local</code>.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-rose-500/20 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                Preview full triage workflows with simulated responses without live API keys:
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRunSimulationFallback}
                className="font-semibold text-xs gap-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 h-8"
              >
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>Load Demo Simulation [Simulation Mode]</span>
              </Button>
            </div>
          </div>
        )}

        {/* Submit Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>
              Real-time server processing with schema validation & prompt grounding.
            </span>
          </div>

          <Button
            type="submit"
            disabled={isLoading || isTooShort || isTooLong}
            size="lg"
            className="font-bold tracking-wide gap-2 min-w-[190px] h-11 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all cursor-pointer"
            aria-label={isLoading ? 'Analyzing input with Gemini' : 'Run BridgeAI Analysis'}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Analyzing with Gemini...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>Run Analysis</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
