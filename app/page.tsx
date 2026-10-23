import React from 'react';
import {
  ShieldAlert,
  Cpu,
  Layers,
  Database,
  CheckCircle,
  FileCode2,
  Terminal,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnalysisResultCard } from '@/components/analysis/AnalysisResultCard';
import { StructuredAnalysisResult } from '@/types/analysis';

const SAMPLE_FOUNDATION_RESULT: StructuredAnalysisResult = {
  id: 'foundation-preview-001',
  rawInput:
    'URGENT: Flood waters reaching 2nd floor of St. Jude Community Health Clinic on 44 Riverside Rd. 4 elderly dialysis patients trapped without backup power, generator fuel exhausted in 40 mins. Oxygen running low. Cell battery 12%, call Nurse Sarah at 555-0199 or radio VHF-16. Need immediate high-clearance boat evacuation!',
  timestamp: new Date().toISOString(),
  summary:
    'Critical flood evacuation needed for 4 dialysis patients trapped without backup power at St. Jude Clinic with imminent oxygen and battery failure.',
  category: 'healthcare_access',
  urgency: {
    level: 'critical',
    score: 10,
    reasoning:
      'Imminent threat to life within 40 minutes due to exhaustion of backup generator fuel for oxygen & dialysis equipment amidst rising floodwaters.',
  },
  extractedDetails: {
    locations: [
      {
        name: 'St. Jude Community Health Clinic',
        address: '44 Riverside Rd',
        context: '2nd floor trapped location',
      },
    ],
    entities: [
      {
        name: 'Nurse Sarah',
        type: 'person',
        role: 'On-site reporting nurse',
      },
      {
        name: 'Dialysis Patients',
        type: 'group',
        role: 'Trapped patients in immediate danger',
      },
    ],
    affectedPopulation: {
      countEstimate: 4,
      description: 'Elderly dialysis patients dependent on powered medical equipment',
      vulnerableGroups: ['Elderly', 'Dialysis-dependent', 'Mobility-impaired'],
    },
    temporalInfo: {
      incidentTime: 'Immediate',
      duration: 'Generator cutoff within 40 minutes',
    },
    contactInfo: [
      { type: 'phone', value: '555-0199', name: 'Nurse Sarah' },
      { type: 'radio', value: 'VHF-16', name: 'Emergency dispatch' },
    ],
    resourceNeeds: [
      { category: 'Evacuation', item: 'High-clearance rescue boat', urgency: 'critical' },
      { category: 'Medical Supplies', item: 'Portable oxygen concentrators / tanks', urgency: 'critical' },
      { category: 'Power', item: 'Diesel fuel / backup generator', urgency: 'critical' },
    ],
  },
  missingInformation: [
    {
      field: 'Access Route Water Depth',
      description: 'Current water depth surrounding 44 Riverside Rd for approach navigation.',
      criticality: 'high',
    },
    {
      field: 'Stretcher Compatibility',
      description: 'Whether patients can be moved seated or require flat backboards.',
      criticality: 'medium',
    },
  ],
  verification: {
    status: 'needs_followup',
    confidenceScore: 0.94,
    reasoning:
      'High internal consistency with specific verifiable address, named staff member, dual communications channels, and coherent physical timeline.',
  },
  sources: [
    {
      quote: 'Flood waters reaching 2nd floor of St. Jude Community Health Clinic on 44 Riverside Rd',
      relevance: 'Location & hazard confirmation',
      confidence: 0.98,
    },
    {
      quote: 'generator fuel exhausted in 40 mins. Oxygen running low.',
      relevance: 'Urgency timeline justification',
      confidence: 0.99,
    },
  ],
  recommendedActions: [
    {
      id: 'act-001',
      title: 'Dispatch High-Water Rescue Boat Unit',
      description: 'Route closest maritime or high-clearance flood rescue boat to 44 Riverside Rd.',
      priority: 'critical',
      targetEntity: 'County Emergency Management / Search & Rescue',
      status: 'pending',
    },
    {
      id: 'act-002',
      title: 'Coordinate Receiving Emergency Hospital Beds',
      description: 'Alert regional hospital for 4 incoming urgent dialysis/oxygen admissions.',
      priority: 'critical',
      targetEntity: 'Regional Hospital Coordination Center',
      status: 'pending',
    },
    {
      id: 'act-003',
      title: 'Open VHF-16 Comms Channel Check',
      description: 'Establish radio link with Nurse Sarah before phone battery depletes.',
      priority: 'high',
      targetEntity: 'Dispatch Comms Officer',
      status: 'pending',
    },
  ],
  metadata: {
    modelVersion: 'gemini-2.5-flash',
    processingTimeMs: 842,
    inputLength: 284,
    sanitized: true,
    createdAt: new Date().toISOString(),
  },
};

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Section */}
      <section className="space-y-4 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle className="h-3.5 w-3.5" />
          <span>Phase 1 Foundation Verified</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          From Messy Crisis Reports to Validated Action
        </h1>
        <p className="max-w-3xl text-base sm:text-lg text-muted-foreground">
          BridgeAI is a humanitarian intelligence engine powered by Google Gemini. It transforms chaotic,
          informal real-world inputs (citizen dispatches, disaster requests, mutual aid appeals) into structured,
          validated, and operationally actionable intelligence.
        </p>
      </section>

      {/* Foundation Pillars Overview */}
      <section aria-labelledby="foundation-pillars-title">
        <h2 id="foundation-pillars-title" className="sr-only">
          Foundation Pillars
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Cpu className="h-5 w-5" aria-hidden="true" />
                <CardTitle className="text-base font-semibold">Gemini Service</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <p>Strict server-only execution via `@google/genai`.</p>
              <p>Zero client-side API key exposure. Safe secret masking.</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                <FileCode2 className="h-5 w-5" aria-hidden="true" />
                <CardTitle className="text-base font-semibold">Strict Contracts</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <p>Dual-layer TypeScript interfaces & Zod schemas.</p>
              <p>Triage urgency, extracted details, gaps & actions.</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
                <Database className="h-5 w-5" aria-hidden="true" />
                <CardTitle className="text-base font-semibold">Storage Ready</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <p>Decoupled `IHistoryService` architecture.</p>
              <p>LocalStorage with quota protection & memory fallback.</p>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                <CardTitle className="text-base font-semibold">Verified Quality</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-muted-foreground">
              <p>Vitest, React Testing Library, ESLint, Strict TS.</p>
              <p>Sensible input boundaries & sanitization.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contract Verification Demonstration */}
      <section aria-labelledby="contract-demo-title" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h2 id="contract-demo-title" className="text-xl font-bold tracking-tight text-foreground">
              Contract & Component Verification
            </h2>
            <p className="text-xs text-muted-foreground">
              Visualizing the canonical StructuredAnalysisResult contract rendered through accessible UI components.
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            Schema Compliant (Zod + TypeScript)
          </Badge>
        </div>

        {/* Unstructured Raw Input vs Structured Output Preview */}
        <div className="space-y-4">
          <Card className="bg-muted/30 border-dashed border-border/80">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  <CardTitle className="text-xs uppercase font-mono tracking-wider text-muted-foreground">
                    Sample Messy Real-World Input
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  284 chars
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <blockquote className="rounded-md bg-background p-3 font-mono text-xs text-foreground/90 border border-border/50">
                &ldquo;{SAMPLE_FOUNDATION_RESULT.rawInput}&rdquo;
              </blockquote>
            </CardContent>
          </Card>

          <AnalysisResultCard result={SAMPLE_FOUNDATION_RESULT} />
        </div>
      </section>

      {/* Architecture & Verification Scripts Guide */}
      <section aria-labelledby="scripts-guide-title">
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              <CardTitle id="scripts-guide-title" className="text-base font-semibold">
                Foundation Verification Commands
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Every check is pre-configured and automated in Phase 1:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div className="rounded-md bg-muted/60 p-2.5">
                <div className="font-bold text-foreground">npm run test</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Vitest test suite</div>
              </div>
              <div className="rounded-md bg-muted/60 p-2.5">
                <div className="font-bold text-foreground">npm run typecheck</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Strict TS check</div>
              </div>
              <div className="rounded-md bg-muted/60 p-2.5">
                <div className="font-bold text-foreground">npm run lint</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">ESLint verification</div>
              </div>
              <div className="rounded-md bg-muted/60 p-2.5">
                <div className="font-bold text-foreground">npm run build</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">Next.js production build</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
