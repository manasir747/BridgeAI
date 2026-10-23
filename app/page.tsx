'use client';

import React from 'react';
import { useNavigation } from '@/components/layout/NavigationContext';
import { HomeSection } from '@/components/home/HomeSection';
import { AnalyzeSection } from '@/components/analyze/AnalyzeSection';
import { ResultsSection } from '@/components/results/ResultsSection';
import { HistorySection } from '@/components/history/HistorySection';

export default function AppHome() {
  const {
    activeTab,
    activeResult,
    setActiveResult,
    selectedPreset,
    setSelectedPreset,
    navigateToAnalyze,
    navigateToResults,
    navigateToHistory,
  } = useNavigation();

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      {/* Tab Panels */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`nav-tab-${activeTab}`}
      >
        {activeTab === 'home' && (
          <HomeSection
            onNavigateToAnalyze={navigateToAnalyze}
            onNavigateToHistory={navigateToHistory}
          />
        )}

        {activeTab === 'analyze' && (
          <AnalyzeSection
            initialPreset={selectedPreset}
            onAnalysisSuccess={navigateToResults}
            onClearPreset={() => setSelectedPreset(null)}
          />
        )}

        {activeTab === 'results' && (
          <ResultsSection
            result={activeResult}
            onUpdateResult={setActiveResult}
            onNavigateToAnalyze={() => navigateToAnalyze()}
            onNavigateToHistory={navigateToHistory}
          />
        )}

        {activeTab === 'history' && (
          <HistorySection
            onSelectResult={navigateToResults}
            onNavigateToAnalyze={navigateToAnalyze}
          />
        )}
      </div>
    </div>
  );
}
