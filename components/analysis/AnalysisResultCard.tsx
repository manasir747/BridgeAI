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
import { StructuredAnalysisResult } from '@/types/analysis';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

export interface AnalysisResultCardProps {
  result: StructuredAnalysisResult;
  className?: string;
}

export function AnalysisResultCard({ result, className }: AnalysisResultCardProps) {
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
      <Card className="border-border/80 shadow-md">
        <CardHeader className="space-y-3 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="font-mono text-[11px] tracking-wide">
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

        <CardContent className="space-y-5 pt-0">
          {/* Extracted Key Details */}
          <section aria-labelledby={`extracted-details-title-${result.id}`} className="space-y-2">
            <h4
              id={`extracted-details-title-${result.id}`}
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Extracted Operational Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {extractedDetails.locations.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5">
                  <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-xs block text-foreground">Locations:</span>
                    <span className="text-muted-foreground text-xs">
                      {extractedDetails.locations.map((l) => l.name).join(', ')}
                    </span>
                  </div>
                </div>
              )}

              {extractedDetails.affectedPopulation && (
                <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5">
                  <Users className="h-4 w-4 text-sky-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-xs block text-foreground">
                      Affected Population:
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {extractedDetails.affectedPopulation.countEstimate
                        ? `~${extractedDetails.affectedPopulation.countEstimate} people. `
                        : ''}
                      {extractedDetails.affectedPopulation.description || 'Estimated cohorts'}
                    </span>
                  </div>
                </div>
              )}

              {extractedDetails.contactInfo.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5">
                  <Phone className="h-4 w-4 text-violet-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-xs block text-foreground">Contact Info:</span>
                    <span className="text-muted-foreground text-xs">
                      {extractedDetails.contactInfo.map((c) => `${c.type}: ${c.value}`).join(' | ')}
                    </span>
                  </div>
                </div>
              )}

              {extractedDetails.resourceNeeds.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-muted/40 p-2.5">
                  <Package className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <span className="font-semibold text-xs block text-foreground">Resource Needs:</span>
                    <span className="text-muted-foreground text-xs">
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
              className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <FileQuestion className="h-4 w-4 text-amber-600" aria-hidden="true" />
                <h4
                  id={`missing-info-title-${result.id}`}
                  className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400"
                >
                  Critical Information Gaps (Follow-up Required)
                </h4>
              </div>
              <ul className="space-y-1 pl-6 list-disc text-xs text-muted-foreground" role="list">
                {missingInformation.map((info, idx) => (
                  <li key={idx}>
                    <strong className="text-foreground">{info.field}:</strong> {info.description}
                    <span className="ml-1 text-[10px] uppercase font-bold text-amber-600">
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
              <div className="flex items-center gap-2">
                <ArrowRightCircle className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <h4
                  id={`actions-title-${result.id}`}
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Recommended Actionable Next Steps
                </h4>
              </div>
              <ol className="space-y-2 text-xs" role="list">
                {recommendedActions.map((action, idx) => (
                  <li
                    key={action.id || idx}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border/60 bg-card p-3 shadow-2xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <span>{idx + 1}. {action.title}</span>
                        {action.targetEntity && (
                          <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground">
                            Target: {action.targetEntity}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">{action.description}</p>
                    </div>
                    <Badge urgency={action.priority} className="shrink-0 text-[10px]">
                      {action.priority.toUpperCase()}
                    </Badge>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </CardContent>
      </Card>
    </article>
  );
}
