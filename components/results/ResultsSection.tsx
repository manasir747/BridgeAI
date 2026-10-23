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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalysisResultCard } from '@/components/analysis/AnalysisResultCard';
import { ActionStatus, StructuredAnalysisResult } from '@/types/analysis';
import { getHistoryService } from '@/services/history/factory';

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
      <div className="py-12 text-center max-w-lg mx-auto space-y-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mx-auto">
          <FileText className="h-8 w-8" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            No Active Analysis Selected
          </h2>
          <p className="text-xs text-muted-foreground">
            Analyze a new real-world crisis dispatch or select an existing analysis from your saved
            history.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button onClick={onNavigateToAnalyze} className="gap-2 text-xs font-semibold">
            <Sparkles className="h-4 w-4" />
            <span>Analyze a Problem</span>
          </Button>
          <Button variant="outline" onClick={onNavigateToHistory} className="gap-2 text-xs font-semibold">
            <Layers className="h-4 w-4" />
            <span>View Saved History</span>
          </Button>
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
    <div className="space-y-6 py-2 max-w-4xl mx-auto">
      {/* Top Action & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigateToAnalyze}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          aria-label="Back to Analyze tool"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>New Analysis</span>
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopySummary}
            className="text-xs gap-1.5"
            aria-label="Copy executive summary to clipboard"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Copy Summary</span>
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            className="text-xs gap-1.5"
            aria-label="Export analysis result as JSON document"
          >
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Export JSON</span>
          </Button>
        </div>
      </div>

      {/* Critical Verification & Grounding Policy Banner */}
      <div
        role="region"
        aria-label="Verification Caveat"
        className="rounded-2xl border border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10 p-4 sm:p-5 text-xs space-y-1.5 text-amber-900 dark:text-amber-200 shadow-2xs backdrop-blur-md"
      >
        <div className="flex items-center gap-2 font-bold text-sm">
          <ShieldAlert className="h-4.5 w-4.5 text-amber-600 dark:text-amber-400 shrink-0" aria-hidden="true" />
          <span>Humanitarian Operational Grounding Notice</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
          This report is machine-generated by Google Gemini to assist triage intake. AI claims, headcounts,
          and suggested coordinates are <strong>never independently verified</strong> until confirmed by
          on-scene emergency personnel. Always reconcile missing information before committing life-safety
          assets.
        </p>
      </div>

      {/* Interactive My Actions & Execution Tracker */}
      {totalActions > 0 && (
        <Card className="rounded-[26px] border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <CardHeader className="p-0 pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <span>My Actions Tracker</span>
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {completedActions.length} of {totalActions} tasks marked completed ({progressPercent}%)
                </CardDescription>
              </div>

              <Badge
                variant="outline"
                className={`text-xs font-mono font-semibold px-2.5 py-0.5 ${
                  progressPercent === 100
                    ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {progressPercent}% RESOLVED
              </Badge>
            </div>

            {/* Visual Progress Bar */}
            <div
              className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mt-3 overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/50"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Action plan completion: ${progressPercent}%`}
            >
              <div
                className="bg-gradient-to-r from-emerald-600 to-teal-500 h-1.5 transition-all duration-500 rounded-full shadow-xs"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Structured Analysis Card Display */}
      <AnalysisResultCard
        result={result}
        onActionToggle={handleActionToggle}
        isActionInteractive={true}
      />

      {/* Responder Notes & Annotations Drawer */}
      <Card className="rounded-[26px] border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-6 shadow-[0_12px_35px_rgba(15,23,42,0.06)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <CardHeader className="p-0 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xs uppercase font-mono tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              <span>Dispatcher & Coordinator Annotations</span>
            </CardTitle>
            {!isEditingNotes && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingNotes(true)}
                className="h-7 text-xs text-primary"
              >
                Edit Notes
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {isEditingNotes ? (
            <div className="space-y-3">
              <div>
                <label htmlFor="coordinator-notes" className="text-xs font-semibold text-foreground block mb-1">
                  Field Notes / Incident Log:
                </label>
                <textarea
                  id="coordinator-notes"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="e.g. Unit 4 en route. Radio confirmed at 10:15am."
                  rows={2}
                  className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="coordinator-tags" className="text-xs font-semibold text-foreground block mb-1">
                  Tags (comma separated):
                </label>
                <input
                  id="coordinator-tags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. river-basin, medical, boat-required"
                  className="w-full rounded-md border border-input bg-background p-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveNotes} className="text-xs gap-1">
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Annotations</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingNotes(false)}
                  className="text-xs text-muted-foreground"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                {noteInput ? (
                  <span>
                    <strong>Notes:</strong> {noteInput}
                  </span>
                ) : (
                  <span className="italic">No field annotations attached yet.</span>
                )}
              </p>
              {tagsInput && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {tagsInput.split(',').map((tag, i) => (
                    <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {savedSuccess && (
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              <span>Annotations saved to history!</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
