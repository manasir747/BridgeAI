'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Star,
  Trash2,
  ExternalLink,
  Download,
  Upload,
  RefreshCw,
  FolderOpen,
  Layers,
  Sparkles,
  Database,
  Ambulance,
  AlertTriangle,
  Utensils,
  Flame,
  ShieldAlert,
  Clock,
  CheckCircle2,
  FileQuestion,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HistoryItem, StorageMetrics } from '@/types/history';
import { AnalysisCategory, StructuredAnalysisResult, UrgencyLevel } from '@/types/analysis';
import { getHistoryService } from '@/services/history/factory';
import { formatDate } from '@/lib/utils';
import { CATEGORY_METADATA, HUMANITARIAN_PRESETS, ScenarioPreset } from '@/lib/examples';

interface HistorySectionProps {
  onSelectResult: (result: StructuredAnalysisResult) => void;
  onNavigateToAnalyze: (preset?: ScenarioPreset) => void;
}

export function HistorySection({ onSelectResult, onNavigateToAnalyze }: HistorySectionProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [metrics, setMetrics] = useState<StorageMetrics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<AnalysisCategory | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<UrgencyLevel | 'all'>('all');
  const [starredOnly, setStarredOnly] = useState<boolean>(false);

  const loadHistory = useCallback(async () => {
    try {
      const historyService = getHistoryService();
      const res = await historyService.list(
        {
          searchTerm: searchTerm.trim() || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          urgency: urgencyFilter !== 'all' ? urgencyFilter : undefined,
          isStarred: starredOnly ? true : undefined,
        },
        { page: 1, pageSize: 50 }
      );
      setItems(res.items);

      const m = await historyService.getMetrics();
      setMetrics(m);
    } catch {
      // Best-effort
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, categoryFilter, urgencyFilter, starredOnly]);

  useEffect(() => {
    let ignore = false;
    getHistoryService()
      .list(
        {
          searchTerm: searchTerm.trim() || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          urgency: urgencyFilter !== 'all' ? urgencyFilter : undefined,
          isStarred: starredOnly ? true : undefined,
        },
        { page: 1, pageSize: 50 }
      )
      .then((res) => {
        if (!ignore) {
          setItems(res.items);
          setIsLoading(false);
          getHistoryService()
            .getMetrics()
            .then((m) => {
              if (!ignore) setMetrics(m);
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [searchTerm, categoryFilter, urgencyFilter, starredOnly]);

  const handleToggleStar = async (id: string, currentStarred?: boolean) => {
    try {
      const historyService = getHistoryService();
      await historyService.update(id, { isStarred: !currentStarred });
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isStarred: !currentStarred } : item))
      );
    } catch {
      // Best-effort
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this analysis from your history?')) {
      return;
    }
    try {
      const historyService = getHistoryService();
      await historyService.delete(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      const m = await historyService.getMetrics();
      setMetrics(m);
    } catch {
      // Best-effort
    }
  };

  const handleExportBackup = async () => {
    try {
      const historyService = getHistoryService();
      const dataStr = await historyService.exportData();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bridgeai-history-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export history backup.');
    }
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const content = event.target?.result as string;
        try {
          const historyService = getHistoryService();
          const { importedCount, skippedCount } = await historyService.importData(content);
          alert(`Import complete: ${importedCount} items imported, ${skippedCount} skipped.`);
          loadHistory();
        } catch (err: unknown) {
          alert(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleLoadSampleAnalysis = async () => {
    const samplePreset = HUMANITARIAN_PRESETS[0];
    onNavigateToAnalyze(samplePreset);
  };

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    categoryFilter !== 'all' ||
    urgencyFilter !== 'all' ||
    starredOnly;

  const getCategoryIcon = (cat: AnalysisCategory) => {
    switch (cat) {
      case 'emergency_relief':
        return <Ambulance className="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />;
      case 'healthcare_access':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />;
      case 'food_water_security':
        return <Utensils className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />;
      case 'infrastructure_damage':
        return <Flame className="h-3.5 w-3.5 text-orange-500" aria-hidden="true" />;
      default:
        return <ShieldAlert className="h-3.5 w-3.5 text-teal-600" aria-hidden="true" />;
    }
  };

  return (
    <div className="space-y-6 py-2 max-w-5xl mx-auto animate-entrance">
      {/* Header & Backup Toolset */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Triage Dossier Archives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Saved Analysis Gallery
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            Search, filter, review, and reopen previous emergency dispatches and operational action plans.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportBackup}
            disabled={items.length === 0}
            className="text-xs gap-1.5 rounded-xl border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70"
            aria-label="Export all history items as JSON backup"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export Backup</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleImportBackup}
            className="text-xs gap-1.5 rounded-xl border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70"
            aria-label="Import history from JSON file"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            <span>Import JSON</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadHistory()}
            className="text-xs gap-1 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            aria-label="Refresh history list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar Floating Panel */}
      <div className="rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-5 sm:p-6 shadow-[0_12px_36px_rgba(15,23,42,0.06)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.3)] backdrop-blur-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <label htmlFor="history-search-input" className="sr-only">
              Search History
            </label>
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              id="history-search-input"
              type="text"
              placeholder="Search summaries, locations, notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 shadow-2xs transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <label htmlFor="category-filter-select" className="sr-only">
              Filter by Category
            </label>
            <select
              id="category-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as AnalysisCategory | 'all')}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 cursor-pointer shadow-2xs transition-all"
            >
              <option value="all">All Sectors</option>
              {(Object.keys(CATEGORY_METADATA) as AnalysisCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_METADATA[cat].label}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="sm:col-span-3">
            <label htmlFor="urgency-filter-select" className="sr-only">
              Filter by Urgency
            </label>
            <select
              id="urgency-filter-select"
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value as UrgencyLevel | 'all')}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 cursor-pointer shadow-2xs transition-all"
            >
              <option value="all">All Urgency Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Filter Badges and Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStarredOnly(!starredOnly)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                starredOnly
                  ? 'border-amber-500 bg-amber-500/15 text-amber-700 dark:text-amber-400 shadow-2xs'
                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
              aria-pressed={starredOnly}
            >
              <Star className={`h-3.5 w-3.5 ${starredOnly ? 'fill-current text-amber-500' : ''}`} />
              <span>Starred Only</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setUrgencyFilter('all');
                  setStarredOnly(false);
                }}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer ml-1"
              >
                Clear Filters
              </button>
            )}
          </div>

          {metrics && (
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
              <Database className="h-3 w-3" />
              <span>
                {metrics.itemCount} dossiers • {Math.round(metrics.estimatedBytes / 1024)} KB (
                {metrics.percentUsed}% storage)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Gallery List or Polished Empty State */}
      {items.length === 0 ? (
        <div className="py-12 text-center max-w-md mx-auto space-y-6 animate-entrance">
          {/* Empty State Composition */}
          <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/20 via-teal-400/15 to-transparent blur-xl" />
            <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-[24px] border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 shadow-lg">
              <FolderOpen className="h-9 w-9 text-emerald-600" aria-hidden="true" />
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                No Matching Results
              </h3>
              <p className="text-xs text-slate-500">
                No saved analyses matched your search term or active sector/urgency filters.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setUrgencyFilter('all');
                    setStarredOnly(false);
                  }}
                  className="text-xs rounded-xl"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                No Saved Analyses Yet
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                Run your first analysis to see previous triage results, operational actions, and notes
                saved here.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                <Button
                  size="lg"
                  onClick={() => onNavigateToAnalyze()}
                  className="gap-2 text-xs sm:text-sm font-bold rounded-2xl h-11 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze a Problem</span>
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleLoadSampleAnalysis}
                  className="gap-2 text-xs sm:text-sm font-semibold rounded-2xl h-11 px-4"
                >
                  <span>Load Sample Scenario</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4" role="feed" aria-label="Analysis History Dossiers">
          {items.map((item) => {
            const { result } = item;
            const completedCount = result.recommendedActions.filter(
              (a) => a.status === 'completed'
            ).length;
            const totalActions = result.recommendedActions.length;

            return (
              <article
                key={item.id}
                className="group relative overflow-hidden rounded-[26px] sm:rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 p-5 sm:p-6 transition-all card-hover-lift shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-xl space-y-3.5"
                aria-label={`Historical analysis: ${result.summary}`}
              >
                {/* Top Badge Strip */}
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-0.5 text-[11px] font-mono font-bold capitalize text-slate-700 dark:text-slate-300">
                      {getCategoryIcon(result.category)}
                      <span>{result.category.replace(/_/g, ' ')}</span>
                    </span>

                    <Badge urgency={result.urgency.level} className="text-[10px] font-bold px-2.5 py-0.5">
                      {result.urgency.level.toUpperCase()} ({result.urgency.score}/10)
                    </Badge>

                    {item.isStarred && (
                      <span className="flex items-center text-amber-500" title="Starred item">
                        <Star className="h-4 w-4 fill-current" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(item.savedAt)}</span>
                  </div>
                </div>

                {/* Summary & Raw Preview */}
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                    {result.summary}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {result.rawInput}
                  </p>
                </div>

                {/* Field Notes Callout */}
                {item.notes && (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-950/40 p-2.5 text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/60">
                    <strong className="text-slate-900 dark:text-slate-100">Field Note:</strong> {item.notes}
                  </div>
                )}

                {/* Footer Metrics & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
                    <span className="flex items-center gap-1 font-medium">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>
                        {completedCount}/{totalActions} Tasks Done
                      </span>
                    </span>

                    {result.missingInformation.length > 0 && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                        <FileQuestion className="h-3.5 w-3.5" />
                        <span>{result.missingInformation.length} Info Gaps</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStar(item.id, item.isStarred)}
                      className={`h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-amber-500 ${
                        item.isStarred ? 'text-amber-500' : ''
                      }`}
                      aria-label={item.isStarred ? 'Unstar this analysis' : 'Star this analysis'}
                    >
                      <Star className={`h-4 w-4 ${item.isStarred ? 'fill-current' : ''}`} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:text-rose-600"
                      aria-label="Delete this analysis record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSelectResult(result)}
                      className="gap-1.5 text-xs font-bold rounded-xl px-3 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:text-emerald-700 dark:hover:text-emerald-300"
                      aria-label={`Open detailed result for ${result.summary}`}
                    >
                      <span>Open Dossier</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

