'use client';

import React from 'react';
import { ShieldCheck, Home, Sparkles, FileText, Layers } from 'lucide-react';

import { useNavigation } from './NavigationContext';

export type AppTab = 'home' | 'analyze' | 'results' | 'history';

export interface HeaderProps {
  activeTab?: AppTab;
  onTabChange?: (tab: AppTab) => void;
  hasActiveResult?: boolean;
  historyCount?: number;
}

export function Header({
  activeTab = 'home',
  onTabChange,
  hasActiveResult = false,
  historyCount,
}: HeaderProps) {
  let navContext: ReturnType<typeof useNavigation> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navContext = useNavigation();
  } catch {
    // Fallback when rendered outside NavigationProvider
  }

  const currentTab = onTabChange ? activeTab : (navContext?.activeTab ?? activeTab);
  const handleTabChange = onTabChange || navContext?.setActiveTab;
  const isResultActive = hasActiveResult || !!navContext?.activeResult;
  const count = typeof historyCount === 'number' ? historyCount : navContext?.historyCount;

  const tabs: { id: AppTab; label: string; icon: React.ReactNode; indicator?: string }[] = [
    { id: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
    { id: 'analyze', label: 'Analyze', icon: <Sparkles className="h-4 w-4" /> },
    {
      id: 'results',
      label: 'Results & My Actions',
      icon: <FileText className="h-4 w-4" />,
      indicator: isResultActive ? 'Active' : undefined,
    },
    {
      id: 'history',
      label: 'History',
      icon: <Layers className="h-4 w-4" />,
      indicator: typeof count === 'number' && count > 0 ? String(count) : undefined,
    },
  ];

  return (
    <>
      {/* Keyboard accessible skip-to-content navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <header
        role="banner"
        className="sticky top-3 z-50 w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 transition-all duration-300"
      >
        <div className="rounded-full shadow-md px-3 sm:px-4 py-2 flex items-center justify-between gap-2 border border-slate-800 bg-slate-900/90 backdrop-blur-xl">
          {/* Logo & Branding */}
          <div
            className="flex items-center gap-2.5 cursor-pointer rounded-full py-1 px-2 hover:bg-slate-800/80 transition-colors"
            onClick={() => handleTabChange?.('home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTabChange?.('home');
              }
            }}
            aria-label="BridgeAI Home"
          >
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm shadow-emerald-500/20 shrink-0"
              aria-hidden="true"
            >
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-100">
                  BridgeAI
                </span>
                <span className="rounded-full bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.2 text-[9px] font-bold text-emerald-400">
                  Engine
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Accessible Tablist) */}
          {handleTabChange && (
            <nav
              role="tablist"
              aria-label="Main Application Sections"
              className="hidden md:flex items-center gap-1 rounded-full bg-slate-950/80 p-1 text-xs border border-slate-800"
            >
              {tabs.map((tab) => {
                const isActive = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    id={`nav-tab-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls={`panel-${tab.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => handleTabChange(tab.id)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.indicator && (
                      <span
                        className={`ml-1 rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                        }`}
                      >
                        {tab.indicator}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 shadow-xs"
              aria-label="System status: Core Ready"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">Core Ready</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        {handleTabChange && (
          <nav
            role="tablist"
            aria-label="Mobile Navigation"
            className="flex md:hidden mt-2 mx-auto max-w-sm rounded-full p-1 justify-around text-xs border border-slate-800 bg-slate-900/90 shadow-md backdrop-blur-xl"
          >
            {tabs.map((tab) => {
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`mobile-tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-1 py-1 px-3 rounded-full font-medium text-[11px] transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.id === 'results' ? 'Results' : tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </header>
    </>
  );
}
