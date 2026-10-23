import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';

export function Header() {
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
        className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80"
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500/20"
              aria-hidden="true"
            >
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-foreground">
                  BridgeAI
                </span>
                <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Foundation
                </span>
              </div>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Gemini-Powered Societal Intelligence & Action Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground"
              aria-label="System status: Operational"
            >
              <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
              <span>Core Ready</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
