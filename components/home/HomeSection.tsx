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
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { formatTemplate } from '@/lib/i18n';

interface HomeSectionProps {
  onNavigateToAnalyze: (preset?: ScenarioPreset) => void;
  onNavigateToHistory: () => void;
}

export function HomeSection({ onNavigateToAnalyze, onNavigateToHistory }: HomeSectionProps) {
  const { t } = useLanguage();

  const getPresetIcon = (iconName: string) => {
    switch (iconName) {
      case 'Ambulance':
        return <Ambulance className="h-4 w-4 text-rose-400" aria-hidden="true" />;
      case 'AlertTriangle':
        return <AlertTriangle className="h-4 w-4 text-amber-400" aria-hidden="true" />;
      case 'Utensils':
        return <Utensils className="h-4 w-4 text-emerald-400" aria-hidden="true" />;
      case 'Flame':
        return <Flame className="h-4 w-4 text-orange-400" aria-hidden="true" />;
      default:
        return <ShieldAlert className="h-4 w-4 text-emerald-400" aria-hidden="true" />;
    }
  };

  return (
    <div className="w-full space-y-8 py-2 animate-entrance">
      {/* Hero Section */}
      <section
        aria-labelledby="hero-title"
        className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-10 shadow-md backdrop-blur-xl"
      >
        {/* Ambient background glow orb */}
        <div
          className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Hero Text & CTAs */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-0.5 text-xs font-semibold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>{t.home.badge}</span>
            </div>

            <h1
              id="hero-title"
              className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight text-slate-100 leading-[1.18]"
            >
              {t.home.heroTitlePre}{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                {t.home.heroTitleHighlight}
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              {t.home.heroDesc}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                id="cta-analyze-problem"
                size="lg"
                onClick={() => onNavigateToAnalyze()}
                className="font-bold shadow-md shadow-emerald-600/25 hover:shadow-lg hover:shadow-emerald-600/35 gap-2 px-5 h-11 rounded-xl text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white cursor-pointer"
                aria-label={t.home.ctaAnalyzeAria}
              >
                <span>{t.home.ctaAnalyze}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={onNavigateToHistory}
                className="gap-2 h-11 px-4 rounded-xl text-sm font-semibold border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 cursor-pointer"
                aria-label={t.home.ctaHistoryAria}
              >
                <Layers className="h-4 w-4 text-slate-400" />
                <span>{t.home.ctaHistory}</span>
              </Button>
            </div>
          </div>

          {/* Right Column: Dynamic Floating Example Cards */}
          <div className="lg:col-span-5 relative hidden sm:block">
            <div className="relative w-full space-y-3.5">
              {/* Floating Teaser Card 1 (Top) */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-sm space-y-2 card-hover-lift">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wide">
                      {t.home.teaser1Urgency}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {t.home.teaser1Time}
                  </span>
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-100">
                    {t.home.teaser1Title}
                  </h2>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {t.home.teaser1Desc}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-850 text-[10px]">
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="h-3 w-3 text-emerald-400" />
                    44 Riverside Rd
                  </span>
                  <span className="rounded-full bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 font-bold text-emerald-300">
                    {t.home.teaser1Dispatched}
                  </span>
                </div>
              </div>

              {/* Floating Teaser Card 2 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-sm space-y-2 card-hover-lift">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                      {t.home.teaser2Urgency}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold font-mono">{t.home.teaser2Grounded}</span>
                </div>
                <p className="text-xs font-semibold text-slate-200">
                  {t.home.teaser2Title}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>{t.home.teaser2Location}</span>
                  <span className="rounded-full bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 font-bold text-amber-300">
                    {t.home.teaser2Action}
                  </span>
                </div>
              </div>

              {/* Luminous Stats Chip */}
              <div className="flex items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/30 py-1 px-3 text-xs font-medium text-emerald-300 w-fit mx-auto">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span>{t.home.zeroHallucinations}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How BridgeAI Works */}
      <section aria-labelledby="how-it-works-title" className="space-y-4">
        <div className="text-center sm:text-left space-y-1">
          <h2 id="how-it-works-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            {t.home.howTitle}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {t.home.howSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="rounded-2xl border-slate-800 bg-slate-900/85 p-5 card-hover-lift">
            <CardHeader className="p-0 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-400 mb-2">
                <Zap className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle className="text-base font-bold text-slate-100">
                {t.home.step1Title}
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                {t.home.step1Subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p>
                {t.home.step1Desc1}
              </p>
              <p className="text-slate-400">
                {t.home.step1Desc2}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-800 bg-slate-900/85 p-5 card-hover-lift">
            <CardHeader className="p-0 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 mb-2">
                <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle className="text-base font-bold text-slate-100">
                {t.home.step2Title}
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                {t.home.step2Subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p>
                {t.home.step2Desc1}
              </p>
              <p className="text-slate-400">
                {t.home.step2Desc2}
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-slate-800 bg-slate-900/85 p-5 card-hover-lift">
            <CardHeader className="p-0 pb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-950/40 border border-violet-500/30 text-violet-400 mb-2">
                <ListOrdered className="h-5 w-5" aria-hidden="true" />
              </div>
              <CardTitle className="text-base font-bold text-slate-100">
                {t.home.step3Title}
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                {t.home.step3Subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <p>
                {t.home.step3Desc1}
              </p>
              <p className="text-slate-400">
                {t.home.step3Desc2}
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Example Use Cases Grid */}
      <section aria-labelledby="use-cases-title" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 id="use-cases-title" className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              {t.home.useCasesTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              {t.home.useCasesSubtitle}
            </p>
          </div>
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-slate-700 bg-slate-800 text-slate-200">
            {t.home.interactiveScenarios}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HUMANITARIAN_PRESETS.map((preset) => (
            <Card
              key={preset.id}
              className="group rounded-2xl border-slate-800 bg-slate-900/85 p-5 card-hover-lift flex flex-col justify-between"
            >
              <CardHeader className="p-0 pb-3 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-800">
                      {getPresetIcon(preset.iconName)}
                    </div>
                    <Badge urgency={preset.urgencyHint} className="text-[10px] font-bold uppercase">
                      {t.urgency[preset.urgencyHint] || preset.urgencyHint}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-400 capitalize">
                    {t.categories[preset.category as keyof typeof t.categories] || preset.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                  {preset.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-300 leading-relaxed">
                  {preset.summary}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0 space-y-3 pt-1">
                <div className="rounded-xl bg-slate-950/60 p-2.5 text-xs text-slate-400 line-clamp-2 border border-slate-800/60">
                  &ldquo;{preset.rawInput}&rdquo;
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigateToAnalyze(preset)}
                  className="w-full text-xs font-semibold gap-1.5 h-9 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-750"
                  aria-label={formatTemplate(t.home.loadScenarioAria, { title: preset.title })}
                >
                  <span>{t.home.loadScenario}</span>
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
        className="rounded-2xl border border-amber-500/25 bg-amber-950/15 p-4 sm:p-5 flex items-start gap-3.5 shadow-xs backdrop-blur-md"
      >
        <HelpCircle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" aria-hidden="true" />
        <div className="space-y-1 text-xs">
          <h3 id="ethics-note-title" className="font-bold text-slate-100 text-sm">
            {t.home.ethicsTitle}
          </h3>
          <p className="text-slate-300 leading-relaxed">
            {t.home.ethicsDesc}
          </p>
        </div>
      </section>
    </div>
  );
}
