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
} from 'lucide-react';
import { ActionStatus, StructuredAnalysisResult } from '@/types/analysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  } = result;

  const formattedCategory = category.replace(/_/g, ' ').toUpperCase();

  return (
    <article
      aria-label={`Analysis result: ${summary}`}
      className={className}
    >
      <Card className="rounded-[26px] border-slate-200/80 dark:border-slate-800/80 p-5 sm:p-7 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <CardHeader className="p-0 space-y-4 pb-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono text-[11px] tracking-wide font-semibold">
                {formattedCategory}
              </Badge>
              <Badge urgency={urgency.level} aria-label={`Urgency level: ${urgency.level}`}>
                URGENCY: {urgency.level.toUpperCase()} ({urgency.score}/10)
              </Badge>
              <span
                className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                aria-label={`Verification status: ${verification.status}`}
              >
                {verification.status === 'verified' ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
                ) : (
                  <HelpCircle className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                )}
                <span className="capitalize">{verification.status.replace(/_/g, ' ')}</span> (
                {Math.round(verification.confidenceScore * 100)}% conf)
              </span>
            </div>

            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden="true" />
              {formatDate(timestamp)}
            </span>
          </div>

          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-foreground">
              {summary}
            </CardTitle>
            <CardDescription className="mt-1 text-xs text-muted-foreground">
              Reasoning: {urgency.reasoning}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0 space-y-6 pt-0">
          {/* Extracted Key Details */}
          <section aria-labelledby={`extracted-details-title-${result.id}`} className="space-y-2.5">
            <h4
              id={`extracted-details-title-${result.id}`}
              className="text-xs font-bold uppercase tracking-wider text-slate-500"
            >
              Extracted Operational Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {extractedDetails.locations.length > 0 && (
                <div className="flex items-start gap-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 p-3.5 border border-slate-200/50 dark:border-slate-800/50">
                  <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-xs block text-slate-900 dark:text-slate-100">Locations:</span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">
                      {extractedDetails.locations.map((l) => l.name).join(', ')}
                    </span>
                  </div>
                </div>
              )}

              {extractedDetails.affectedPopulation && (
                <div className="flex items-start gap-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 p-3.5 border border-slate-200/50 dark:border-slate-800/50">
                  <Users className="h-4 w-4 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-xs block text-slate-900 dark:text-slate-100">
                      Affected Population:
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">
                      {extractedDetails.affectedPopulation.countEstimate
                        ? `~${extractedDetails.affectedPopulation.countEstimate} people. `
                        : ''}
                      {extractedDetails.affectedPopulation.description || 'Estimated cohorts'}
                    </span>
                  </div>
                </div>
              )}

              {extractedDetails.contactInfo.length > 0 && (
                <div className="flex items-start gap-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 p-3.5 border border-slate-200/50 dark:border-slate-800/50">
                  <Phone className="h-4 w-4 text-violet-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-xs block text-slate-900 dark:text-slate-100">Contact Info:</span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">
                      {extractedDetails.contactInfo.map((c) => `${c.type}: ${c.value}`).join(' | ')}
                    </span>
                  </div>
                </div>
              )}

              {extractedDetails.resourceNeeds.length > 0 && (
                <div className="flex items-start gap-2.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 p-3.5 border border-slate-200/50 dark:border-slate-800/50">
                  <Package className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-xs block text-slate-900 dark:text-slate-100">Resource Needs:</span>
                    <span className="text-slate-600 dark:text-slate-400 text-xs">
                      {extractedDetails.resourceNeeds
                        .map((r) => `${r.item}${r.quantity ? ` (${r.quantity})` : ''}`)
                        .join(', ')}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Missing Information Callout */}
          {missingInformation.length > 0 && (
            <section
              aria-labelledby={`missing-info-title-${result.id}`}
              className="rounded-2xl border border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileQuestion className="h-4 w-4 text-amber-600" aria-hidden="true" />
                <h4
                  id={`missing-info-title-${result.id}`}
                  className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300"
                >
                  Critical Information Gaps (Follow-up Required)
                </h4>
              </div>
              <ul className="space-y-1.5 pl-6 list-disc text-xs text-slate-600 dark:text-slate-300" role="list">
                {missingInformation.map((info, idx) => (
                  <li key={idx}>
                    <strong className="text-slate-900 dark:text-slate-100">{info.field}:</strong> {info.description}
                    <span className="ml-1 text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                      [{info.criticality}]
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Recommended Operational Actions */}
          {recommendedActions.length > 0 && (
            <section aria-labelledby={`actions-title-${result.id}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightCircle className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  <h4
                    id={`actions-title-${result.id}`}
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    Recommended Actionable Next Steps
                  </h4>
                </div>
                {isActionInteractive && (
                  <span className="text-[11px] text-muted-foreground">
                    Click status to cycle state (Pending → In Progress → Completed)
                  </span>
                )}
              </div>
              <ol className="space-y-2 text-xs" role="list">
                {recommendedActions.map((action, idx) => {
                  const isCompleted = action.status === 'completed';
                  const isInProgress = action.status === 'in_progress';

                  return (
                    <li
                      key={action.id || idx}
                      className={`flex items-start justify-between gap-3 rounded-lg border p-3 transition-colors ${
                        isCompleted
                          ? 'border-emerald-500/40 bg-emerald-500/5 opacity-80'
                          : isInProgress
                          ? 'border-sky-500/40 bg-sky-500/5'
                          : 'border-border/60 bg-card shadow-2xs'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-foreground flex items-center gap-2">
                          <span className={isCompleted ? 'line-through text-muted-foreground' : ''}>
                            {idx + 1}. {action.title}
                          </span>
                          {action.targetEntity && (
                            <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground">
                              Target: {action.targetEntity}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs ${
                            isCompleted ? 'line-through text-muted-foreground/80' : 'text-muted-foreground'
                          }`}
                        >
                          {action.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isActionInteractive && onActionToggle && (
                          <button
                            type="button"
                            onClick={() => onActionToggle(action.id, action.status)}
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase transition-colors cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              isCompleted
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : isInProgress
                                ? 'bg-sky-600 text-white border-sky-600'
                                : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                            }`}
                            aria-label={`Toggle action status for ${action.title}. Current status: ${action.status}`}
                          >
                            {action.status.replace(/_/g, ' ')}
                          </button>
                        )}
                        <Badge urgency={action.priority} className="text-[10px]">
                          {action.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </CardContent>
      </Card>
    </article>
  );
}
