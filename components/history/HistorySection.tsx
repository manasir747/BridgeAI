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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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

  return (
    <div className="space-y-6 py-2 max-w-5xl mx-auto">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" aria-hidden="true" />
            <span>Intake History & Archives</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Browse, search, and reopen previous humanitarian triage dossiers saved in local storage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportBackup}
            disabled={items.length === 0}
            className="text-xs gap-1.5"
            aria-label="Export all history items as JSON backup"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Backup</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleImportBackup}
            className="text-xs gap-1.5"
            aria-label="Import history from JSON file"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import JSON</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadHistory()}
            className="text-xs gap-1"
            aria-label="Refresh history list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-[26px] border-slate-200/80 dark:border-slate-800/80 p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)] dark:shadow-[0_12px_35px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <CardContent className="p-0 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="sm:col-span-6 relative">
              <label htmlFor="history-search-input" className="sr-only">
                Search History
              </label>
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" aria-hidden="true" />
              <input
                id="history-search-input"
                type="text"
                placeholder="Search summaries, locations, notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 pl-10 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/25 focus-visible:border-emerald-500 shadow-2xs"
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
                className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
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
                className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              >
                <option value="all">All Urgency Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40 text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStarredOnly(!starredOnly)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                  starredOnly
                    ? 'border-amber-500/50 bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold'
                    : 'border-border/60 hover:bg-muted text-muted-foreground'
                }`}
                aria-pressed={starredOnly}
              >
                <Star className={`h-3 w-3 ${starredOnly ? 'fill-current' : ''}`} />
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
                  className="text-primary hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>

            {metrics && (
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <Database className="h-3 w-3 text-muted-foreground" />
                <span>
                  {metrics.itemCount} records • {Math.round(metrics.estimatedBytes / 1024)} KB stored (
                  {metrics.percentUsed}% quota)
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* History Items List / Empty States */}
      {items.length === 0 ? (
        <div className="py-12 text-center max-w-md mx-auto space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mx-auto">
            <FolderOpen className="h-7 w-7" aria-hidden="true" />
          </div>

          {hasActiveFilters ? (
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">No Matching Results</h3>
              <p className="text-xs text-muted-foreground">
                No saved analyses matched your search term or active filters.
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
                  className="text-xs"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">No Saved Analyses Yet</h3>
              <p className="text-xs text-muted-foreground">
                Run your first analysis to see previous triage results, operational actions, and notes
                saved here.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => onNavigateToAnalyze()}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Analyze a Problem</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLoadSampleAnalysis}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <span>Load Sample Scenario</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3" role="feed" aria-label="Analysis History Dossiers">
          {items.map((item) => {
            const { result } = item;
            const completedCount = result.recommendedActions.filter(
              (a) => a.status === 'completed'
            ).length;
            const totalActions = result.recommendedActions.length;

            return (
              <article
                key={item.id}
                className="group rounded-[24px] border border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 p-5 transition-all card-hover-lift shadow-2xs backdrop-blur-md space-y-3.5"
                aria-label={`Historical analysis: ${result.summary}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono capitalize">
                      {result.category.replace(/_/g, ' ')}
                    </Badge>
                    <Badge urgency={result.urgency.level} className="text-[10px]">
                      {result.urgency.level.toUpperCase()} ({result.urgency.score}/10)
                    </Badge>
                    {item.isStarred && (
                      <span className="flex items-center text-amber-500" title="Starred item">
                        <Star className="h-3.5 w-3.5 fill-current" />
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="text-[11px]">{formatDate(item.savedAt)}</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-foreground line-clamp-2">
                    {result.summary}
                  </h2>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {result.rawInput}
                  </p>
                </div>

                {item.notes && (
                  <div className="rounded bg-muted/40 p-2 text-xs text-muted-foreground">
                    <strong className="text-foreground">Field Note:</strong> {item.notes}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50 text-xs">
                  <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                    <span>
                      {completedCount}/{totalActions} Actions Completed
                    </span>
                    {result.missingInformation.length > 0 && (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        {result.missingInformation.length} Info Gaps
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStar(item.id, item.isStarred)}
                      className={`h-8 w-8 p-0 text-muted-foreground hover:text-amber-500 ${
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
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      aria-label="Delete this analysis record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSelectResult(result)}
                      className="gap-1.5 text-xs font-semibold"
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
