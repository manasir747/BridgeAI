'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  AlertCircle,
  Loader2,
  Send,
  RotateCcw,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
      });

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
      const message = err instanceof Error ? err.message : 'Network error connecting to analysis API.';
      setApiError({
        message,
        isAuthOrConfig: false,
      });
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

  return (
    <div className="space-y-6 py-2 max-w-4xl mx-auto">
      {/* Title & Presets Header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Intake & Problem Analysis
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Paste or type chaotic crisis information. Gemini extracts entities, urgency, missing facts, and
              action steps.
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isLoading || (!input && category === 'auto' && !attachment)}
            className="text-xs text-muted-foreground hover:text-foreground gap-1"
            aria-label="Clear all inputs and reset form"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </Button>
        </div>

        {/* Quick Scenario Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-semibold text-muted-foreground mr-1 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Quick Presets:</span>
          </span>
          {HUMANITARIAN_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              disabled={isLoading}
              className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 hover:bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Load preset scenario: ${preset.title}`}
            >
              <span>{preset.title.split(' ')[0]}</span>
              <span className="text-muted-foreground">({preset.urgencyHint})</span>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="rounded-[26px] border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-8 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between">
              <span>Raw Problem Statement / Field Dispatch</span>
              <span
                className={`text-xs font-mono font-normal ${
                  isTooShort
                    ? 'text-amber-600 font-semibold'
                    : isTooLong
                    ? 'text-rose-600 font-semibold'
                    : 'text-slate-500'
                }`}
                aria-live="polite"
              >
                {charCount} / {INPUT_LIMITS.MAX_LENGTH} characters
                {isTooShort && ` (min ${INPUT_LIMITS.MIN_LENGTH})`}
              </span>
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Include locations, numbers, medical needs, contact channels, or urgent timestamps.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0 space-y-5 pt-0">
            <div>
              <label htmlFor="raw-problem-input" className="sr-only">
                Messy Real-World Input Text
              </label>
              <textarea
                id="raw-problem-input"
                name="rawInput"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
                disabled={isLoading}
                placeholder="Example: Emergency at St. Jude Clinic on 44 Riverside Rd. Flood waters rising to 2nd floor, 4 dialysis patients trapped without generator fuel, need boat evacuation immediately. Call Sarah 555-0199 or radio VHF-16..."
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 text-sm text-slate-900 dark:text-slate-100 shadow-2xs placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 transition-all resize-y"
                required
                aria-invalid={!!clientError || isTooShort || isTooLong}
                aria-describedby={clientError ? 'input-error-msg' : undefined}
              />
            </div>

            {/* Category Selection Pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Sector / Problem Category Hint:
                </label>
                <span className="text-[11px] text-muted-foreground">
                  Helps Gemini tailor triage logic
                </span>
              </div>

              <div
                role="radiogroup"
                aria-label="Sector or Problem Category Hint"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2"
              >
                <button
                  type="button"
                  onClick={() => setCategory('auto')}
                  className={`rounded-md border p-2 text-left text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    category === 'auto'
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                  }`}
                  role="radio"
                  aria-checked={category === 'auto'}
                >
                  <div className="font-medium text-foreground">Auto-Detect</div>
                  <div className="text-[10px] text-muted-foreground line-clamp-1">
                    AI determines category
                  </div>
                </button>

                {(Object.keys(CATEGORY_METADATA) as AnalysisCategory[]).map((catKey) => {
                  const meta = CATEGORY_METADATA[catKey];
                  const isSelected = category === catKey;

                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setCategory(catKey)}
                      className={`rounded-md border p-2 text-left text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isSelected
                          ? 'border-primary bg-primary/10 text-primary font-semibold shadow-2xs'
                          : 'border-border/70 hover:bg-muted/40 text-muted-foreground'
                      }`}
                      role="radio"
                      aria-checked={isSelected}
                    >
                      <div className="font-medium text-foreground truncate">{meta.label}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1 truncate">
                        {meta.description}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Urgency Hint */}
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-foreground">
                Optional Urgency Hint:
              </label>
              <div className="flex flex-wrap gap-2 text-xs" role="radiogroup" aria-label="Urgency Hint">
                {(['auto', 'critical', 'high', 'medium', 'low'] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setUrgencyHint(level)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      urgencyHint === level
                        ? 'border-primary bg-primary text-primary-foreground font-semibold'
                        : 'border-border/70 bg-background text-muted-foreground hover:bg-muted'
                    }`}
                    role="radio"
                    aria-checked={urgencyHint === level}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Image Upload UI */}
            <div className="pt-2 border-t border-border/50">
              <ImageUpload
                attachment={attachment}
                onAttachmentChange={setAttachment}
                disabled={isLoading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Client Validation Error */}
        {clientError && (
          <div
            id="input-error-msg"
            role="alert"
            className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{clientError}</span>
          </div>
        )}

        {/* API / Server Error with Simulation Fallback */}
        {apiError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 space-y-3 text-xs text-destructive-foreground"
          >
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-bold text-foreground">Gemini Analysis Notice:</p>
                <p className="text-muted-foreground">{apiError.message}</p>
                {apiError.isAuthOrConfig && (
                  <p className="text-muted-foreground text-[11px]">
                    To enable live AI inference, configure your <code className="font-mono bg-muted px-1">GEMINI_API_KEY</code> in <code className="font-mono bg-muted px-1">.env.local</code>.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-1 border-t border-destructive/20 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-muted-foreground">
                You can run a simulated demonstration to preview the full triage and action workflow without live API keys:
              </span>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleRunSimulationFallback}
                className="font-semibold text-xs gap-1.5 shadow-2xs"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Load Demo Simulation [Simulation Mode]</span>
              </Button>
            </div>
          </div>
        )}

        {/* Submit Action */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span>
              Server-side processing with schema validation & prompt grounding.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={isLoading || isTooShort || isTooLong}
              size="lg"
              className="font-semibold gap-2 min-w-[180px] shadow-sm"
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
        </div>
      </form>
    </div>
  );
}
