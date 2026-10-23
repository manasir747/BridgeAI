'use client';

import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  ArrowLeft,
  ShieldAlert,
  Save,
  Tag,
  FileText,
  Layers,
  Sparkles,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnalysisResultCard } from '@/components/analysis/AnalysisResultCard';
import { ActionStatus, StructuredAnalysisResult } from '@/types/analysis';
import { getHistoryService } from '@/services/history/factory';
import { HUMANITARIAN_PRESETS } from '@/lib/examples';

interface ResultsSectionProps {
  result: StructuredAnalysisResult | null;
  onUpdateResult: (updated: StructuredAnalysisResult) => void;
  onNavigateToAnalyze: () => void;
  onNavigateToHistory: () => void;
}

export function ResultsSection({
  result,
  onUpdateResult,
  onNavigateToAnalyze,
  onNavigateToHistory,
}: ResultsSectionProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [noteInput, setNoteInput] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  if (!result) {
    return (
      <div className="py-6 sm:py-10 max-w-2xl mx-auto space-y-6 animate-entrance text-center">
        {/* Layered Empty State Illustration Composition */}
        <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl" />
          <div className="absolute -inset-3 rounded-full border border-emerald-500/20 bg-emerald-500/5 animate-pulse-soft" />

          {/* Floating Backing Card */}
          <div className="absolute -rotate-6 transform rounded-2xl border border-slate-800 bg-slate-900/70 p-3.5 shadow-md w-20 h-20 flex items-center justify-center">
            <Activity className="h-7 w-7 text-teal-400/60" />
          </div>

          {/* Floating Foreground Card */}
          <div className="relative z-10 rotate-3 transform rounded-2xl border border-emerald-500/40 bg-slate-900 p-4 shadow-xl w-20 h-20 flex items-center justify-center card-hover-lift">
            <FileText className="h-8 w-8 text-emerald-400" aria-hidden="true" />
            <div className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
              <Sparkles className="h-3 w-3" />
            </div>
          </div>
        </div>

        {/* Text Guidance */}
        <div className="space-y-2 max-w-lg mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            No Active Analysis Selected
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Analyze a new real-world crisis dispatch or select an existing analysis from your saved
            history to inspect structured findings, operational tasks, and confidence metrics.
          </p>
        </div>

        {/* Primary Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <Button
            onClick={onNavigateToAnalyze}
            size="lg"
            className="gap-2 text-xs sm:text-sm font-bold rounded-xl h-10 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20"
          >
            <Sparkles className="h-4 w-4" />
            <span>Analyze a Problem</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onNavigateToHistory}
            className="gap-2 text-xs sm:text-sm font-semibold rounded-xl h-10 px-4 border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
          >
            <Layers className="h-4 w-4" />
            <span>View Saved History</span>
          </Button>
        </div>

        {/* Clickable Quick Scenario Suggestions */}
        <div className="pt-4 border-t border-slate-800 text-left space-y-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block text-center">
            Or open the triage intake tool with a field scenario:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {HUMANITARIAN_PRESETS.slice(0, 4).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={onNavigateToAnalyze}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-800 bg-slate-900/70 hover:bg-slate-850 hover:border-emerald-500/40 text-left transition-all card-hover-lift cursor-pointer"
              >
                <div className="overflow-hidden">
                  <p className="text-xs font-bold text-slate-100 truncate">
                    {preset.title}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {preset.rawInput.slice(0, 50)}...
                  </p>
                </div>
                <Badge urgency={preset.urgencyHint} className="text-[10px] uppercase font-bold ml-2 shrink-0">
                  {preset.urgencyHint}
                </Badge>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const completedActions = result.recommendedActions.filter((a) => a.status === 'completed');
  const totalActions = result.recommendedActions.length;
  const progressPercent = totalActions > 0 ? Math.round((completedActions.length / totalActions) * 100) : 0;

  const handleActionToggle = async (actionId: string, currentStatus: ActionStatus) => {
    let nextStatus: ActionStatus = 'in_progress';
    if (currentStatus === 'pending') nextStatus = 'in_progress';
    else if (currentStatus === 'in_progress') nextStatus = 'completed';
    else nextStatus = 'pending';

    const updatedActions = result.recommendedActions.map((action) =>
      action.id === actionId ? { ...action, status: nextStatus } : action
    );

    const updatedResult: StructuredAnalysisResult = {
      ...result,
      recommendedActions: updatedActions,
    };

    onUpdateResult(updatedResult);

    // Persist to history
    try {
      const historyService = getHistoryService();
      await historyService.save(updatedResult);
    } catch {
      // Best-effort history sync
    }
  };

  const handleSaveNotes = async () => {
    try {
      const historyService = getHistoryService();
      const tags = tagsInput
        ? tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : undefined;

      await historyService.save(result, {
        notes: noteInput.trim() || undefined,
        tags,
      });

      setSavedSuccess(true);
      setIsEditingNotes(false);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // Error handling
    }
  };

  const handleCopySummary = async () => {
    const textToCopy = `BridgeAI Triage Report [${result.category.toUpperCase()}]
Urgency: ${result.urgency.level.toUpperCase()} (${result.urgency.score}/10)
Summary: ${result.summary}
Actions:
${result.recommendedActions.map((a, i) => `${i + 1}. [${a.priority.toUpperCase()}] ${a.title}`).join('\n')}
Gaps:
${result.missingInformation.map((m) => `- ${m.field}: ${m.description}`).join('\n')}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `bridgeai-analysis-${result.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full space-y-5 py-2 animate-entrance">
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/85 p-3 sm:px-4 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToAnalyze}
            className="gap-1.5 text-xs text-slate-300 hover:text-white rounded-xl h-8"
            aria-label="Back to Analyze tool"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>New Analysis</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateToHistory}
            className="gap-1.5 text-xs text-slate-300 hover:text-white rounded-xl h-8"
            aria-label="View previous history dossiers"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Archive</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            className="text-xs gap-1.5 rounded-xl border-slate-700 bg-slate-800/80 text-slate-200 h-8"
            aria-label="Copy executive summary to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-slate-400" />
                <span>Copy Summary</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            className="text-xs gap-1.5 rounded-xl border-slate-700 bg-slate-800/80 text-slate-200 h-8"
            aria-label="Export analysis result as JSON document"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>Export JSON</span>
          </Button>
        </div>
      </div>

      {/* Critical Verification & Grounding Policy Notice */}
      <div
        role="region"
        aria-label="Verification Caveat"
        className="rounded-2xl border border-amber-500/25 bg-amber-950/20 p-4 text-xs space-y-1 text-amber-200 shadow-xs backdrop-blur-md"
      >
        <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span>Humanitarian Operational Grounding Notice</span>
        </div>
        <p className="text-slate-300 text-xs leading-relaxed">
          This report is machine-generated by Google Gemini to assist triage intake. AI claims, headcounts,
          and suggested coordinates are <strong>never independently verified</strong> until confirmed by
          on-scene emergency personnel. Always reconcile missing information before committing life-safety
          assets.
        </p>
      </div>

      {/* Interactive My Actions & Execution Progress Tracker */}
      {totalActions > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                <span>My Actions Tracker</span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                {completedActions.length} of {totalActions} tasks marked completed ({progressPercent}%)
              </p>
            </div>

            <Badge
              variant="outline"
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full font-mono ${
                progressPercent === 100
                  ? 'border-emerald-500 text-emerald-300 bg-emerald-950/40'
                  : 'text-slate-300 border-slate-700 bg-slate-800'
              }`}
            >
              {progressPercent}% RESOLVED
            </Badge>
          </div>

          {/* Visual Progress Bar */}
          <div
            className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700/60"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Action plan completion: ${progressPercent}%`}
          >
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-1.5 transition-all duration-500 rounded-full shadow-xs"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Structured Analysis Result Dashboard Card */}
      <AnalysisResultCard
        result={result}
        onActionToggle={handleActionToggle}
        isActionInteractive={true}
      />

      {/* Responder Notes & Annotations Drawer */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <h3 className="text-xs uppercase font-bold tracking-wider text-slate-400 flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-emerald-400" />
            <span>Dispatcher & Coordinator Annotations</span>
          </h3>
          {!isEditingNotes && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingNotes(true)}
              className="h-7 text-xs font-semibold text-emerald-400 hover:text-emerald-300 rounded-lg px-2"
            >
              Edit Notes
            </Button>
          )}
        </div>

        <div>
          {isEditingNotes ? (
            <div className="space-y-3 pt-1">
              <div>
                <label htmlFor="coordinator-notes" className="text-xs font-bold text-slate-300 block mb-1">
                  Field Notes / Incident Log:
                </label>
                <textarea
                  id="coordinator-notes"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="e.g. Unit 4 en route. Radio confirmed at 10:15am."
                  rows={3}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 leading-relaxed"
                />
              </div>

              <div>
                <label htmlFor="coordinator-tags" className="text-xs font-bold text-slate-300 block mb-1">
                  Tags (comma separated):
                </label>
                <input
                  id="coordinator-tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. river-basin, medical, boat-required"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button size="sm" onClick={handleSaveNotes} className="text-xs font-bold gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white h-8">
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Annotations</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingNotes(false)}
                  className="text-xs text-slate-400 hover:text-slate-200 rounded-xl h-8"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-300 space-y-2 pt-1 leading-relaxed">
              <p>
                {noteInput ? (
                  <span>
                    <strong className="text-slate-100">Notes:</strong> {noteInput}
                  </span>
                ) : (
                  <span className="italic text-slate-500">No field annotations attached yet.</span>
                )}
              </p>
              {tagsInput && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {tagsInput.split(',').map((tag, i) => (
                    <span key={i} className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300 border border-slate-700">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {savedSuccess && (
            <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 mt-2">
              <Check className="h-3.5 w-3.5" />
              <span>Annotations saved to history!</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
