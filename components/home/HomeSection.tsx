'use client';

import React from 'react';
import {
  ArrowRight,
  ShieldAlert,
  Zap,
  CheckCircle2,
  ListOrdered,
  Layers,
  Sparkles,
  Ambulance,
  AlertTriangle,
  Utensils,
  Flame,
  HelpCircle,
  MapPin,
  Clock,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HUMANITARIAN_PRESETS, ScenarioPreset } from '@/lib/examples';

interface HomeSectionProps {
  onNavigateToAnalyze: (preset?: ScenarioPreset) => void;
  onNavigateToHistory: () => void;
}

export function HomeSection({ onNavigateToAnalyze, onNavigateToHistory }: HomeSectionProps) {
  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Ambulance':
        return <Ambulance className="h-5 w-5 text-rose-500" aria-hidden="true" />;
      case 'AlertTriangle':
        return <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden="true" />;
      case 'Utensils':
        return <Utensils className="h-5 w-5 text-emerald-500" aria-hidden="true" />;
      case 'Flame':
        return <Flame className="h-5 w-5 text-orange-500" aria-hidden="true" />;
      default:
        return <ShieldAlert className="h-5 w-5 text-emerald-600" aria-hidden="true" />;
    }
  };

  return (
    <div className="space-y-12 py-2 animate-entrance">
      {/* Hero Section */}
      <section
        aria-labelledby="hero-title"
        className="relative overflow-hidden rounded-[26px] sm:rounded-[32px] border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-white/90 via-emerald-50/20 to-teal-50/30 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-emerald-950/20 p-6 sm:p-10 lg:p-12 shadow-[0_20px_50px_rgba(15,23,42,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl"
      >
        {/* Ambient background glow orb */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-300/15 to-transparent blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Hero Text & CTAs */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Gemini-Powered Humanitarian Intelligence</span>
            </div>

            <h1
              id="hero-title"
              className="text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-[1.12]"
            >
              Turn Messy Crisis Reports into{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                Validated, Actionable Relief
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              During disasters and mutual-aid emergencies, real-world communication is chaotic.
              BridgeAI cuts through panic and noise: transforming unstructured SMS, radio transcripts, and
              social alerts into structured triage summaries, verified facts, resource needs, and prioritized
              operational actions.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Button
                id="cta-analyze-problem"
                size="lg"
                onClick={() => onNavigateToAnalyze()}
                className="font-semibold shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 gap-2 px-6 h-12 rounded-xl text-base"
                aria-label="Analyze a Problem - Open intake analysis tool"
              >
                <span>Analyze a Problem</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={onNavigateToHistory}
                className="gap-2 h-12 px-5 rounded-xl text-sm font-semibold border-slate-200/80 dark:border-slate-800"
                aria-label="View previous analysis history"
              >
                <Layers className="h-4 w-4 text-slate-500" />
                <span>Browse Saved History</span>
              </Button>
            </div>
          </div>

          {/* Right Column: Dynamic Floating Example Cards */}
          <div className="lg:col-span-5 relative hidden sm:block">
            <div className="relative mx-auto w-full max-w-md space-y-4">
              {/* Floating Teaser Card 1 (Top) */}
              <div className="animate-float-subtle rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-4 shadow-[0_12px_30px_-5px_rgba(15,23,42,0.08)] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
                      Critical Triage (10/10)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="h-3 w-3" />
                    Immediate
                  </span>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    St. Jude Clinic: Flood Evacuation Required
                  </h2>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    4 dialysis patients trapped on 2nd floor, generator fuel exhausted in 40 mins.
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[10px]">
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="h-3 w-3 text-emerald-600" />
                    44 Riverside Rd
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                    Rescue Boat Dispatched
                  </span>
                </div>
              </div>

              {/* Floating Teaser Card 2 (Bottom Offset) */}
              <div className="animate-float-delayed sm:translate-x-4 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl p-4 shadow-[0_12px_30px_-5px_rgba(15,23,42,0.08)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                      Infrastructure Alert
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">98% Grounded</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Overpass Collapse & Active Gas Hazard
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>8th Ave & Maple St</span>
                  <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-bold text-amber-700 dark:text-amber-400">
                    Gas Utility Shutoff
                  </span>
                </div>
              </div>

              {/* Luminous Stats Chip */}
              <div className="flex items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 py-1.5 px-4 text-xs font-medium text-emerald-700 dark:text-emerald-300 w-fit mx-auto shadow-2xs backdrop-blur-md">
                <Activity className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                <span>Zero Hallucinations • Humanitarian Factual Grounding</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How BridgeAI Works */}
      <section aria-labelledby="how-it-works-title" className="space-y-6">
        <div className="text-center sm:text-left space-y-1">
          <h2 id="how-it-works-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            How BridgeAI Works
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            A three-step humanitarian intelligence pipeline designed for speed, clarity, and safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="rounded-[24px] border-slate-200/80 dark:border-slate-800/80 p-6 card-hover-lift">
            <CardHeader className="p-0 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500/20 to-teal-400/20 text-sky-600 dark:text-sky-400 mb-3 shadow-2xs">
                <Zap className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                1. Ingest Messy Dispatches
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Raw, unstructured intake from any channel
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <p>
                Accepts frantic citizen alerts, garbled radio dispatches, field notes, and optional photo
                snapshots.
              </p>
              <p>
                Input sanitization strips invisible zero-width overrides and malicious control characters.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-slate-200/80 dark:border-slate-800/80 p-6 card-hover-lift">
            <CardHeader className="p-0 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 text-emerald-600 dark:text-emerald-400 mb-3 shadow-2xs">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                2. Gemini Fact & Triage Extraction
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Zero hallucination, schema-enforced AI
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <p>
                Evaluates life-safety urgency (Critical, High, Medium, Low), maps physical locations,
                estimates affected populations, and flags contact details.
              </p>
              <p>
                Crucially identifies <strong>missing information gaps</strong> that responders must verify.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-slate-200/80 dark:border-slate-800/80 p-6 card-hover-lift">
            <CardHeader className="p-0 pb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500/20 to-purple-400/20 text-violet-600 dark:text-violet-400 mb-3 shadow-2xs">
                <ListOrdered className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
                3. Prioritized Action Dispatch
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Operational tasks for field responders
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 text-xs text-slate-600 dark:text-slate-400 space-y-2 leading-relaxed">
              <p>
                Generates actionable operational checklists with assigned target entities and execution
                statuses.
              </p>
              <p>
                Track actions directly within the interactive workbench and save to local client history.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Example Use Cases Grid */}
      <section aria-labelledby="use-cases-title" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 id="use-cases-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Real-World Crisis Use Cases
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Select any pre-configured scenario to test how BridgeAI extracts intelligence from chaotic
              inputs.
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-semibold px-3 py-1">
            4 Interactive Scenarios
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {HUMANITARIAN_PRESETS.map((preset) => (
            <Card
              key={preset.id}
              className="group rounded-[24px] border-slate-200/80 dark:border-slate-800/80 p-6 card-hover-lift flex flex-col justify-between"
            >
              <CardHeader className="p-0 pb-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 shadow-2xs">
                      {getPresetIcon(preset.iconName)}
                    </div>
                    <Badge urgency={preset.urgencyHint} className="text-[10px] font-bold">
                      {preset.urgencyHint.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 capitalize">
                    {preset.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <CardTitle className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {preset.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {preset.summary}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-4 pt-1">
                <div className="rounded-xl bg-slate-50/80 dark:bg-slate-900/60 p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 border border-slate-200/50 dark:border-slate-800/50">
                  &ldquo;{preset.rawInput}&rdquo;
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigateToAnalyze(preset)}
                  className="w-full text-xs font-semibold gap-1.5 h-10 rounded-xl"
                  aria-label={`Load and analyze scenario: ${preset.title}`}
                >
                  <span>Load & Analyze Scenario</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Humanitarian Safety & Ethics Note */}
      <section
        aria-labelledby="ethics-note-title"
        className="rounded-[24px] border border-amber-500/25 bg-amber-500/5 dark:bg-amber-500/10 p-5 sm:p-6 flex items-start gap-4 shadow-2xs backdrop-blur-md"
      >
        <HelpCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" aria-hidden="true" />
        <div className="space-y-1.5 text-xs">
          <h3 id="ethics-note-title" className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            Humanitarian Safety & Operational Verification Policy
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            BridgeAI provides AI-assisted extraction to support triage coordinators under high-pressure
            conditions. It does not replace human incident command. All AI-generated assessments, locations,
            and resource recommendations must be corroborated by field responders before life-safety
            actions are undertaken.
          </p>
        </div>
      </section>
    </div>
  );
}
