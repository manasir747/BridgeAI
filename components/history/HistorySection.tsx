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
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatTemplate } from '@/lib/i18n';

interface HistorySectionProps {
  onSelectResult: (result: StructuredAnalysisResult) => void;
  onNavigateToAnalyze: (preset?: ScenarioPreset) => void;
}

export function HistorySection({ onSelectResult, onNavigateToAnalyze }: HistorySectionProps) {
  const { t } = useLanguage();
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
        return <Ambulance className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />;
      case 'healthcare_access':
        return <AlertTriangle className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />;
      case 'food_water_security':
        return <Utensils className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />;
      case 'infrastructure_damage':
        return <Flame className="h-3.5 w-3.5 text-orange-400" aria-hidden="true" />;
      default:
        return <ShieldAlert className="h-3.5 w-3.5 text-teal-400" aria-hidden="true" />;
    }
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 py-3 animate-entrance">
      {/* Header & Backup Toolset */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-1 text-xs font-semibold text-emerald-300">
            <Layers className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t.history.badge}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-100 leading-tight">
            {t.history.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-0.5 max-w-2xl">
            {t.history.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportBackup}
            disabled={items.length === 0}
            className="text-xs gap-2 rounded-xl border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 h-9 px-3.5 transition-all shadow-xs"
            aria-label={t.history.exportBackupAria}
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span>{t.history.exportBackup}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleImportBackup}
            className="text-xs gap-2 rounded-xl border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 h-9 px-3.5 transition-all shadow-xs"
            aria-label={t.history.importJsonAria}
          >
            <Upload className="h-3.5 w-3.5 text-slate-400" />
            <span>{t.history.importJson}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadHistory()}
            className="text-xs rounded-xl border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-slate-100 h-9 w-9 p-0 flex items-center justify-center transition-all shadow-xs"
            aria-label={t.history.refreshAria}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar Floating Panel */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-sm space-y-4 backdrop-blur-xl">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <label htmlFor="history-search-input" className="sr-only">
              {t.history.searchLabel}
            </label>
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
            <input
              id="history-search-input"
              type="text"
              placeholder={t.history.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 focus-visible:border-emerald-500 shadow-inner transition-all h-10"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <label htmlFor="category-filter-select" className="sr-only">
              {t.history.filterSectorAria}
            </label>
            <select
              id="category-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as AnalysisCategory | 'all')}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs sm:text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 cursor-pointer h-10 shadow-inner"
            >
              <option value="all">{t.history.allCategories}</option>
              {(Object.keys(CATEGORY_METADATA) as AnalysisCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {t.categories[cat as keyof typeof t.categories] || CATEGORY_METADATA[cat].label}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="sm:col-span-3">
            <label htmlFor="urgency-filter-select" className="sr-only">
              {t.history.filterUrgencyAria}
            </label>
            <select
              id="urgency-filter-select"
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value as UrgencyLevel | 'all')}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs sm:text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 cursor-pointer h-10 shadow-inner"
            >
              <option value="all">{t.history.allUrgencies}</option>
              <option value="critical">{t.urgency.critical}</option>
              <option value="high">{t.urgency.high}</option>
              <option value="medium">{t.urgency.medium}</option>
              <option value="low">{t.urgency.low}</option>
            </select>
          </div>
        </div>

        {/* Filter Badges and Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-800/80 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setStarredOnly(!starredOnly)}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer h-8.5 ${
                starredOnly
                  ? 'border-amber-500/50 bg-amber-950/40 text-amber-300 shadow-xs'
                  : 'border-slate-800 bg-slate-950/70 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              aria-pressed={starredOnly}
            >
              <Star className={`h-3.5 w-3.5 ${starredOnly ? 'fill-current text-amber-400' : ''}`} />
              <span>{t.history.starredOnly}</span>
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
                className="text-emerald-400 font-semibold hover:underline cursor-pointer ml-1.5 text-xs"
              >
                {t.history.clearFilters}
              </button>
            )}
          </div>

          {metrics && (
            <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
              <Database className="h-3.5 w-3.5 text-slate-500" />
              <span>
                {metrics.itemCount} {t.history.dossiers} • {Math.round(metrics.estimatedBytes / 1024)} KB (
                {metrics.percentUsed}% {t.history.storage})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Gallery List or Polished Empty State */}
      {items.length === 0 ? (
        <div className="py-12 sm:py-16 text-center max-w-md mx-auto space-y-5 animate-entrance">
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl" />
            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 shadow-md">
              <FolderOpen className="h-7 w-7 text-emerald-400" aria-hidden="true" />
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="space-y-2.5">
              <h3 className="text-lg font-bold text-slate-100">
                {t.history.noResultsTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {t.history.noResultsDesc}
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
                  className="text-xs rounded-xl h-9 px-3.5 border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  {t.history.resetFilters}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
                {t.history.noHistoryTitle}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                {t.history.noHistoryDesc}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button
                  size="lg"
                  onClick={() => onNavigateToAnalyze()}
                  className="gap-2 text-xs sm:text-sm font-bold rounded-xl h-10 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/20"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{t.history.ctaAnalyze}</span>
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleLoadSampleAnalysis}
                  className="gap-2 text-xs sm:text-sm font-semibold rounded-xl h-10 px-5 bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                >
                  <span>{t.history.loadSample}</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5" role="feed" aria-label="Analysis History Dossiers">
          {items.map((item) => {
            const { result } = item;
            const completedCount = result.recommendedActions.filter(
              (a) => a.status === 'completed'
            ).length;
            const totalActions = result.recommendedActions.length;

            return (
              <article
                key={item.id}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 sm:p-7 transition-all card-hover-lift shadow-sm backdrop-blur-xl space-y-4"
                aria-label={`Historical analysis: ${result.summary}`}
              >
                {/* Top Badge & Metadata Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-800/90 px-3 py-1 text-xs font-bold capitalize text-slate-200">
                      {getCategoryIcon(result.category)}
                      <span>{t.categories[result.category as keyof typeof t.categories] || result.category.replace(/_/g, ' ')}</span>
                    </span>

                    <Badge urgency={result.urgency.level} className="text-xs font-bold px-2.5 py-1 uppercase">
                      {t.urgency[result.urgency.level] || result.urgency.level} <span className="font-mono">({result.urgency.score}/10)</span>
                    </Badge>

                    {item.isStarred && (
                      <span className="inline-flex items-center text-amber-400 p-0.5" title="Starred item">
                        <Star className="h-4 w-4 fill-current" />
                      </span>
                    )}
                  </div>

                  {/* Distinct Timestamp Pill */}
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-800/80 bg-slate-950/60 px-3 py-1 text-xs text-slate-400 font-mono shrink-0">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>{formatDate(item.savedAt)}</span>
                  </div>
                </div>

                {/* Summary & Raw Emergency Dispatch Preview */}
                <div className="space-y-2.5 pt-0.5">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-100 line-clamp-2 leading-snug tracking-tight">
                    {result.summary}
                  </h2>
                  <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60">
                    <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed font-normal">
                      {result.rawInput}
                    </p>
                  </div>
                </div>

                {/* Field Notes Callout */}
                {item.notes && (
                  <div className="rounded-xl bg-slate-950/70 p-3 sm:p-3.5 text-xs sm:text-sm text-slate-300 border border-slate-800/80 leading-relaxed">
                    <strong className="text-slate-100 font-semibold">{t.history.fieldNotePrefix}</strong> {item.notes}
                  </div>
                )}

                {/* Footer Metrics & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3.5 pt-3.5 border-t border-slate-800/80 text-xs sm:text-sm">
                  <div className="flex items-center gap-3.5 sm:gap-4 text-slate-400 text-xs">
                    <span className="flex items-center gap-1.5 font-medium font-mono text-slate-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>
                        {completedCount}/{totalActions} {t.history.tasksDone}
                      </span>
                    </span>

                    {result.missingInformation.length > 0 && (
                      <span className="flex items-center gap-1.5 text-amber-400 font-semibold font-mono">
                        <FileQuestion className="h-3.5 w-3.5" />
                        <span>{result.missingInformation.length} {t.history.infoGaps}</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStar(item.id, item.isStarred)}
                      className={`h-9 w-9 p-0 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-slate-800 hover:text-amber-400 hover:border-amber-500/30 text-slate-400 transition-all ${
                        item.isStarred ? 'text-amber-400 border-amber-500/40 bg-amber-950/30' : ''
                      }`}
                      aria-label={item.isStarred ? t.history.unstarAria : t.history.starAria}
                    >
                      <Star className={`h-4 w-4 ${item.isStarred ? 'fill-current' : ''}`} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="h-9 w-9 p-0 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:bg-rose-950/30 hover:border-rose-500/30 hover:text-rose-400 text-slate-400 transition-all"
                      aria-label={t.history.deleteAria}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSelectResult(result)}
                      className="gap-2 text-xs sm:text-sm font-bold rounded-xl px-4 h-9 bg-slate-800 hover:bg-emerald-950/50 hover:text-emerald-300 hover:border-emerald-500/40 border border-slate-700/80 text-slate-100 shadow-xs transition-all"
                      aria-label={formatTemplate(t.history.openDossierAria, { summary: result.summary })}
                    >
                      <span>{t.history.openDossier}</span>
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
