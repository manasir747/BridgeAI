'use client';

import React, { useState } from 'react';
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
  ChevronDown,
  ChevronUp,
  Radio,
} from 'lucide-react';
import { ActionStatus, StructuredAnalysisResult } from '@/types/analysis';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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
  const { t } = useLanguage();
  const [showSecondaryDetails, setShowSecondaryDetails] = useState<boolean>(false);

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

  // Verification status styling helper
  const getVerificationBadge = () => {
    switch (verification.status) {
      case 'verified':
        return {
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />,
          classes: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30',
          label: t.verification.verified,
        };
      case 'unverified':
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />,
          classes: 'bg-rose-950/40 text-rose-300 border-rose-500/30',
          label: t.verification.unverified,
        };
      case 'conflicting':
        return {
          icon: <AlertTriangle className="h-3.5 w-3.5 text-orange-400" aria-hidden="true" />,
          classes: 'bg-orange-950/40 text-orange-300 border-orange-500/30',
          label: t.verification.conflicting,
        };
      default:
        return {
          icon: <HelpCircle className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />,
          classes: 'bg-amber-950/40 text-amber-300 border-amber-500/30',
          label: t.verification.needs_followup,
        };
    }
  };

  const verBadge = getVerificationBadge();

  return (
    <article
      aria-label={`Analysis result: ${summary}`}
      className={`space-y-4 ${className || ''}`}
    >
      {/* 1. CRISIS SUMMARY & SEVERITY DASHBOARD BANNER */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-md backdrop-blur-xl animate-entrance">
        {/* Subtle accent corner glow */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative z-10 space-y-3.5">
          {/* Metadata & Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border-slate-700 text-slate-300 bg-slate-800/80 tracking-wider"
              >
                {(t.categories[category as keyof typeof t.categories] || formattedCategory).toUpperCase()}
              </Badge>

              <Badge
                urgency={urgency.level}
                aria-label={`Urgency level: ${urgency.level}`}
                className="text-xs font-bold px-3 py-0.5 rounded-full shadow-xs"
              >
                {t.urgency.urgencyPrefix} {(t.urgency[urgency.level] || urgency.level).toUpperCase()} <span className="font-mono">({urgency.score}/10)</span>
              </Badge>

              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${verBadge.classes}`}
                aria-label={`Verification status: ${verification.status}`}
              >
                {verBadge.icon}
                <span className="capitalize">{verBadge.label}</span>
                <span className="text-[11px] opacity-75 font-mono">
                  ({Math.round(verification.confidenceScore * 100)}% {t.verification.conf})
                </span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Clock className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
              <span>{formatDate(timestamp)}</span>
            </div>
          </div>

          {/* Incident Summary Headline */}
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100 leading-snug">
              {summary}
            </h2>

            {/* Assessment Reasoning */}
            <div className="flex items-start gap-2.5 rounded-xl bg-slate-950/60 p-3 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" aria-hidden="true" />
              <p>
                <strong className="font-semibold text-slate-100">{t.card.reasoning}</strong> {urgency.reasoning}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. KEY EXTRACTED OPERATIONAL DETAILS (Responsive 2-Column Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column: Locations & Contacts */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4 sm:p-5 shadow-sm space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>{t.card.locationsTitle}</span>
              </h3>
              <span className="text-[11px] text-slate-500">{t.card.fieldTargets}</span>
            </div>

            {/* Locations */}
            {extractedDetails.locations.length > 0 ? (
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-slate-300 block uppercase tracking-wide text-[11px]">
                  {t.card.identifiedLocations}
                </span>
                <div className="space-y-1">
                  {extractedDetails.locations.map((loc, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl bg-slate-950/50 p-2.5 border border-slate-800/80 space-y-0.5"
                    >
                      <p className="font-bold text-slate-100">{loc.name}</p>
                      {loc.address && (
                        <p className="text-[11px] text-slate-400">{loc.address}</p>
                      )}
                      {loc.context && (
                        <p className="text-[11px] text-slate-400 italic">{loc.context}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">{t.card.noLocations}</p>
            )}

            {/* Entities & Roles */}
            {extractedDetails.entities.length > 0 && (
              <div className="space-y-1 text-xs pt-1">
                <span className="font-semibold text-slate-300 block uppercase tracking-wide text-[11px]">
                  {t.card.entitiesInvolved}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {extractedDetails.entities.map((ent, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300 border border-slate-700/60"
                    >
                      <span className="font-semibold text-slate-200">{ent.name}</span>
                      <span className="text-[10px] text-slate-400">({ent.type})</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          {extractedDetails.contactInfo.length > 0 && (
            <div className="pt-2 border-t border-slate-800/70 text-xs">
              <span className="font-semibold text-slate-300 block uppercase tracking-wide text-[11px] mb-1">
                {t.card.commChannels}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {extractedDetails.contactInfo.map((contact, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-violet-950/30 border border-violet-500/30 px-2.5 py-1 text-xs text-violet-300"
                  >
                    {contact.type === 'radio' ? (
                      <Radio className="h-3 w-3 text-violet-400" />
                    ) : (
                      <Phone className="h-3 w-3 text-violet-400" />
                    )}
                    <span className="font-semibold uppercase">{contact.type}:</span>
                    <span className="font-mono">{contact.value}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Affected Population & Resource Needs */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4 sm:p-5 shadow-sm space-y-3.5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-400" />
                <span>{t.card.affectedTitle}</span>
              </h3>
              <span className="text-[11px] text-slate-500">{t.card.demographics}</span>
            </div>

            {/* Affected Population */}
            {extractedDetails.affectedPopulation ? (
              <div className="rounded-xl bg-slate-950/50 p-2.5 border border-slate-800/80 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">
                    {t.card.populationEstimate}
                  </span>
                  {extractedDetails.affectedPopulation.countEstimate !== undefined && (
                    <span className="rounded-full bg-sky-950/40 border border-sky-500/30 px-2 py-0.5 text-[11px] font-bold text-sky-300 font-mono">
                      ~{extractedDetails.affectedPopulation.countEstimate} {t.card.people}
                    </span>
                  )}
                </div>
                {extractedDetails.affectedPopulation.description && (
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {extractedDetails.affectedPopulation.description}
                  </p>
                )}
                {extractedDetails.affectedPopulation.vulnerableGroups &&
                  extractedDetails.affectedPopulation.vulnerableGroups.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {extractedDetails.affectedPopulation.vulnerableGroups.map((vg, i) => (
                        <span
                          key={i}
                          className="rounded bg-rose-950/30 border border-rose-500/20 px-1.5 py-0.2 text-[10px] text-rose-300"
                        >
                          {t.card.vulnerable} {vg}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">{t.card.noPopulation}</p>
            )}

            {/* Resource Needs */}
            {extractedDetails.resourceNeeds.length > 0 ? (
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-slate-300 block uppercase tracking-wide text-[11px]">
                  {t.card.resourceNeeds}
                </span>
                <div className="space-y-1">
                  {extractedDetails.resourceNeeds.map((resItem, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl bg-slate-950/50 p-2 border border-slate-800/80"
                    >
                      <div className="flex items-center gap-2">
                        <Package className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-100">{resItem.item}</span>
                          {resItem.quantity && (
                            <span className="text-slate-400 text-[11px] ml-1">
                              ({resItem.quantity})
                            </span>
                          )}
                        </div>
                      </div>
                      {resItem.urgency && (
                        <Badge
                          urgency={resItem.urgency}
                          className="text-[10px] font-bold px-2 py-0.2 uppercase"
                        >
                          {t.urgency[resItem.urgency] || resItem.urgency}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">{t.card.noResources}</p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/70 text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Operational parameters verified by Gemini factual grounding.</span>
          </div>
        </div>
      </div>

      {/* 3. CRITICAL INFORMATION GAPS (Compact Prioritized List) */}
      {missingInformation.length > 0 && (
        <section
          aria-labelledby={`missing-info-title-${result.id}`}
          className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-4 sm:p-5 shadow-sm space-y-3 animate-entrance-stagger-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                <FileQuestion className="h-4 w-4" aria-hidden="true" />
              </div>
              <h3
                id={`missing-info-title-${result.id}`}
                className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-300"
              >
                {t.card.infoGapsTitle}
              </h3>
            </div>
            <span className="text-[11px] text-amber-400/80 font-semibold">
              {missingInformation.length} {t.card.infoGapsSubtitle}
            </span>
          </div>

          <ul className="space-y-2 list-none text-xs" role="list">
            {missingInformation.map((info, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 rounded-xl bg-slate-900/90 p-3 border border-amber-500/20 text-slate-300"
              >
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                <div className="space-y-0.5 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <strong className="text-slate-100 font-bold">
                      {info.field}:
                    </strong>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      [{info.criticality}]
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {info.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 4. RECOMMENDED ACTIONABLE NEXT STEPS (Ordered by Priority) */}
      {recommendedActions.length > 0 && (
        <section
          aria-labelledby={`actions-title-${result.id}`}
          className="rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 shadow-md backdrop-blur-xl animate-entrance-stagger-3 space-y-3.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400">
                <ArrowRightCircle className="h-4 w-4" aria-hidden="true" />
              </div>
              <h3
                id={`actions-title-${result.id}`}
                className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-100"
              >
                {t.card.actionsTitle}
              </h3>
            </div>
            {isActionInteractive && (
              <span className="text-[11px] text-slate-400">
                {t.card.actionToggleHelp}
              </span>
            )}
          </div>

          <ol className="space-y-2.5 text-xs" role="list">
            {recommendedActions.map((action, idx) => {
              const isCompleted = action.status === 'completed';
              const isInProgress = action.status === 'in_progress';

              return (
                <li
                  key={action.id || idx}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                    isCompleted
                      ? 'border-emerald-500/30 bg-emerald-950/20 opacity-80'
                      : isInProgress
                      ? 'border-sky-500/30 bg-sky-950/20'
                      : 'border-slate-800 bg-slate-950/60 shadow-xs'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="font-bold text-sm text-slate-100 flex flex-wrap items-center gap-2">
                      <span className={isCompleted ? 'line-through text-slate-500' : ''}>
                        {idx + 1}. {action.title}
                      </span>
                      {action.targetEntity && (
                        <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700">
                          {t.card.target} {action.targetEntity}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs leading-relaxed ${
                        isCompleted
                          ? 'line-through text-slate-500'
                          : 'text-slate-300'
                      }`}
                    >
                      {action.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
                    {isActionInteractive && onActionToggle && (
                      <button
                        type="button"
                        onClick={() => onActionToggle(action.id, action.status)}
                        className={`rounded-full px-3 py-1 text-xs font-bold uppercase transition-all cursor-pointer border flex items-center gap-1 ${
                          isCompleted
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                            : isInProgress
                            ? 'bg-sky-600 text-white border-sky-500 shadow-xs'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                        }`}
                        aria-label={`Toggle action status for ${action.title}. Current status: ${action.status}`}
                      >
                        {isCompleted && <Check className="h-3 w-3" />}
                        <span>{action.status.replace(/_/g, ' ')}</span>
                      </button>
                    )}
                    <Badge urgency={action.priority} className="text-[11px] font-bold px-2.5 py-0.5 uppercase">
                      {action.priority.toUpperCase()}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* 5. COLLAPSIBLE ADDITIONAL CONTEXT & GROUNDING EVIDENCE */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/85 p-4 sm:p-5 shadow-sm space-y-3">
        <button
          type="button"
          onClick={() => setShowSecondaryDetails(!showSecondaryDetails)}
          className="flex w-full items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          aria-expanded={showSecondaryDetails}
          aria-controls="grounding-evidence-drawer"
        >
          <div className="flex items-center gap-2">
            <Quote className="h-4 w-4 text-teal-400" />
            <span>{t.card.evidenceTitle}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
            <span>{showSecondaryDetails ? t.card.hide : t.card.inspect}</span>
            {showSecondaryDetails ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </div>
        </button>

        {showSecondaryDetails && (
          <div
            id="grounding-evidence-drawer"
            className="pt-2 border-t border-slate-800 space-y-3 text-xs animate-entrance"
          >
            <div className="space-y-1">
              <strong className="text-slate-200">Verification Rationale:</strong>
              <p className="text-slate-300 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
                {verification.reasoning}
              </p>
            </div>

            {sources && sources.length > 0 ? (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Verbatim Quotes from Input:
                </span>
                <div className="space-y-1.5">
                  {sources.map((src, i) => (
                    <blockquote
                      key={i}
                      className="border-l-2 border-emerald-500 pl-3 py-1 text-xs italic text-slate-300 bg-slate-950/40 rounded-r-lg"
                    >
                      &ldquo;{src.quote}&rdquo; —{' '}
                      <span className="text-emerald-400 not-italic font-semibold">
                        {src.relevance}
                      </span>
                    </blockquote>
                  ))}
                </div>
              </div>
            ) : rawInput ? (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Original Raw Dispatch:
                </span>
                <p className="border-l-2 border-emerald-500/60 pl-3 py-1 text-xs italic text-slate-300 bg-slate-950/40 rounded-r-lg">
                  &ldquo;{rawInput}&rdquo;
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}
