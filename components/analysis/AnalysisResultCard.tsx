import React from 'react';
import {
  CheckCircle2,
  HelpCircle,
  MapPin,
  Package,
  Phone,
  Users,
  Clock,
  ArrowRightCircle,
  FileQuestion,
  ShieldCheck,
  AlertTriangle,
  Quote,
  Check,
} from 'lucide-react';
import { ActionStatus, StructuredAnalysisResult } from '@/types/analysis';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export interface AnalysisResultCardProps {
  result: StructuredAnalysisResult;
  className?: string;
  onActionToggle?: (actionId: string, currentStatus: ActionStatus) => void;
  isActionInteractive?: boolean;
}

export function AnalysisResultCard({
  result,
  className,
  onActionToggle,
  isActionInteractive = false,
}: AnalysisResultCardProps) {
  const {
    summary,
    category,
    urgency,
    verification,
    extractedDetails,
    missingInformation,
    recommendedActions,
    timestamp,
    rawInput,
    sources,
  } = result;

  const formattedCategory = category.replace(/_/g, ' ').toUpperCase();

  return (
    <article
      aria-label={`Analysis result: ${summary}`}
      className={`space-y-5 ${className || ''}`}
    >
      {/* 1. HERO SUMMARY & URGENCY CARD */}
      <div className="relative overflow-hidden rounded-[28px] sm:rounded-[32px] border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-[0_20px_50px_rgba(15,23,42,0.07)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl animate-entrance">
        {/* Ambient glow accent */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-br from-emerald-400/15 via-teal-300/10 to-transparent blur-2xl"
          aria-hidden="true"
        />

        <div className="relative z-10 space-y-4">
          {/* Header Badges & Timestamps */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono text-[11px] tracking-wider font-bold px-3 py-0.5 rounded-full border-slate-300 dark:border-slate-700">
                {formattedCategory}
              </Badge>
              <Badge
                urgency={urgency.level}
                aria-label={`Urgency level: ${urgency.level}`}
                className="text-xs font-bold px-3 py-0.5 rounded-full shadow-2xs"
              >
                URGENCY: {urgency.level.toUpperCase()} ({urgency.score}/10)
              </Badge>
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                aria-label={`Verification status: ${verification.status}`}
              >
                {verification.status === 'verified' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                ) : (
                  <HelpCircle className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                )}
                <span className="capitalize">{verification.status.replace(/_/g, ' ')}</span>
                <span className="font-mono text-[11px] text-slate-400">
                  ({Math.round(verification.confidenceScore * 100)}% conf)
                </span>
              </span>
            </div>

            <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 font-mono">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {formatDate(timestamp)}
            </span>
          </div>

          {/* Main Incident Summary */}
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight">
              {summary}
            </h2>
            <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-slate-50/90 dark:bg-slate-950/50 p-3.5 border border-slate-200/60 dark:border-slate-800/60">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong className="font-semibold text-slate-900 dark:text-slate-100">Reasoning:</strong> {urgency.reasoning}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. EXTRACTED OPERATIONAL DETAILS PANEL */}
      <div className="relative overflow-hidden rounded-[26px] sm:rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-5 sm:p-7 shadow-[0_12px_36px_rgba(15,23,42,0.05)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.3)] backdrop-blur-xl animate-entrance-stagger-1 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3
            id={`extracted-details-title-${result.id}`}
            className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Extracted Operational Details</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-400">
            Field Entity Extraction
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
          {extractedDetails.locations.length > 0 && (
            <div className="flex items-start gap-3 rounded-2xl bg-emerald-50/30 dark:bg-emerald-950/20 p-4 border border-emerald-500/20 card-hover-lift">
              <MapPin className="h-4.5 w-4.5 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <span className="font-bold text-xs block text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Locations:
                </span>
                <span className="text-slate-700 dark:text-slate-300 text-xs mt-0.5 block leading-relaxed">
                  {extractedDetails.locations.map((l) => l.name).join(', ')}
                </span>
                {extractedDetails.locations.some((l) => l.address) && (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5 font-mono">
                    {extractedDetails.locations.map((l) => l.address).filter(Boolean).join(' • ')}
                  </span>
                )}
              </div>
            </div>
          )}

          {extractedDetails.affectedPopulation && (
            <div className="flex items-start gap-3 rounded-2xl bg-sky-50/30 dark:bg-sky-950/20 p-4 border border-sky-500/20 card-hover-lift">
              <Users className="h-4.5 w-4.5 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <span className="font-bold text-xs block text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Affected Population:
                </span>
                <span className="text-slate-700 dark:text-slate-300 text-xs mt-0.5 block leading-relaxed">
                  {extractedDetails.affectedPopulation.countEstimate
                    ? `~${extractedDetails.affectedPopulation.countEstimate} people. `
                    : ''}
                  {extractedDetails.affectedPopulation.description || 'Estimated cohorts'}
                </span>
              </div>
            </div>
          )}

          {extractedDetails.contactInfo.length > 0 && (
            <div className="flex items-start gap-3 rounded-2xl bg-violet-50/30 dark:bg-violet-950/20 p-4 border border-violet-500/20 card-hover-lift">
              <Phone className="h-4.5 w-4.5 text-violet-600 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <span className="font-bold text-xs block text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Contact Info:
                </span>
                <span className="text-slate-700 dark:text-slate-300 text-xs mt-0.5 block leading-relaxed font-mono">
                  {extractedDetails.contactInfo.map((c) => `${c.type}: ${c.value}`).join(' | ')}
                </span>
              </div>
            </div>
          )}

          {extractedDetails.resourceNeeds.length > 0 && (
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50/30 dark:bg-amber-950/20 p-4 border border-amber-500/20 card-hover-lift">
              <Package className="h-4.5 w-4.5 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <span className="font-bold text-xs block text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Resource Needs:
                </span>
                <span className="text-slate-700 dark:text-slate-300 text-xs mt-0.5 block leading-relaxed">
                  {extractedDetails.resourceNeeds
                    .map((r) => `${r.item}${r.quantity ? ` (${r.quantity})` : ''}`)
                    .join(', ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. CRITICAL INFORMATION GAPS CARD */}
      {missingInformation.length > 0 && (
        <section
          aria-labelledby={`missing-info-title-${result.id}`}
          className="rounded-[26px] border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-5 sm:p-6 shadow-[0_12px_36px_rgba(15,23,42,0.04)] backdrop-blur-xl animate-entrance-stagger-2 space-y-3"
        >
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
              <FileQuestion className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h3
                id={`missing-info-title-${result.id}`}
                className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200"
              >
                Critical Information Gaps (Follow-up Required)
              </h3>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Responders must confirm these missing parameters before dispatching life-safety units.
              </p>
            </div>
          </div>

          <ul className="space-y-2 pl-2 list-none text-xs" role="list">
            {missingInformation.map((info, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-xl bg-white/70 dark:bg-slate-900/70 p-3 border border-amber-500/20 text-slate-700 dark:text-slate-300"
              >
                <span className="mt-0.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                <div className="space-y-0.5 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <strong className="text-slate-900 dark:text-slate-100 font-bold">
                      {info.field}:
                    </strong>
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      [{info.criticality}]
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {info.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 4. VERIFICATION EVIDENCE & SOURCE CITATIONS */}
      <div className="rounded-[26px] border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 p-5 sm:p-6 shadow-[0_12px_36px_rgba(15,23,42,0.05)] backdrop-blur-xl animate-entrance-stagger-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Quote className="h-4 w-4 text-teal-600" />
            <span>Verification & Grounding Evidence</span>
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Direct Dispatch Extraction
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <p className="text-slate-700 dark:text-slate-300">
            <strong>Verification Rationale:</strong> {verification.reasoning}
          </p>

          {sources && sources.length > 0 ? (
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Source Citations from Input:
              </span>
              <div className="space-y-1">
                {sources.map((src, i) => (
                  <blockquote
                    key={i}
                    className="border-l-2 border-emerald-500 pl-3 py-1 text-[11px] italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 rounded-r-lg"
                  >
                    &ldquo;{src.quote}&rdquo; —{' '}
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium font-sans not-italic">
                      Relevance: {src.relevance}
                    </span>
                  </blockquote>
                ))}
              </div>
            </div>
          ) : rawInput ? (
            <div className="pt-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Original Input Statement:
              </span>
              <p className="border-l-2 border-emerald-500/60 pl-3 py-1 text-xs italic text-slate-600 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-950/40 rounded-r-lg font-mono">
                &ldquo;{rawInput}&rdquo;
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* 5. RECOMMENDED ACTIONABLE NEXT STEPS */}
      {recommendedActions.length > 0 && (
        <section
          aria-labelledby={`actions-title-${result.id}`}
          className="rounded-[28px] border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 p-6 sm:p-8 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl animate-entrance-stagger-4 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600">
                <ArrowRightCircle className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
              <h3
                id={`actions-title-${result.id}`}
                className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100"
              >
                Prioritized Action Plan
              </h3>
            </div>
            {isActionInteractive && (
              <span className="text-[11px] text-slate-500 font-medium">
                Click status pill to cycle: Pending → In Progress → Completed
              </span>
            )}
          </div>

          <ol className="space-y-3 text-xs" role="list">
            {recommendedActions.map((action, idx) => {
              const isCompleted = action.status === 'completed';
              const isInProgress = action.status === 'in_progress';

              return (
                <li
                  key={action.id || idx}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all card-hover-lift ${
                    isCompleted
                      ? 'border-emerald-500/40 bg-emerald-50/20 dark:bg-emerald-950/20 opacity-80'
                      : isInProgress
                      ? 'border-sky-500/40 bg-sky-50/20 dark:bg-sky-950/20'
                      : 'border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 shadow-2xs'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex flex-wrap items-center gap-2">
                      <span className={isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                        {idx + 1}. {action.title}
                      </span>
                      {action.targetEntity && (
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          Target: {action.targetEntity}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs ${
                        isCompleted
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {action.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    {isActionInteractive && onActionToggle && (
                      <button
                        type="button"
                        onClick={() => onActionToggle(action.id, action.status)}
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase transition-all cursor-pointer border shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : isInProgress
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                        aria-label={`Toggle action status for ${action.title}. Current status: ${action.status}`}
                      >
                        {isCompleted && <Check className="h-3 w-3" />}
                        <span>{action.status.replace(/_/g, ' ')}</span>
                      </button>
                    )}
                    <Badge urgency={action.priority} className="text-[11px] font-bold px-2.5 py-0.5">
                      {action.priority.toUpperCase()}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </article>
  );
}
