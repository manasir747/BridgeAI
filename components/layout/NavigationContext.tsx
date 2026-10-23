'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppTab } from './Header';
import { StructuredAnalysisResult } from '@/types/analysis';
import { ScenarioPreset } from '@/lib/examples';
import { getHistoryService } from '@/services/history/factory';

interface NavigationContextType {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  activeResult: StructuredAnalysisResult | null;
  setActiveResult: (result: StructuredAnalysisResult | null) => void;
  selectedPreset: ScenarioPreset | null;
  setSelectedPreset: (preset: ScenarioPreset | null) => void;
  historyCount: number;
  refreshHistoryCount: () => Promise<void>;
  navigateToAnalyze: (preset?: ScenarioPreset) => void;
  navigateToResults: (result: StructuredAnalysisResult) => void;
  navigateToHistory: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [activeResult, setActiveResult] = useState<StructuredAnalysisResult | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ScenarioPreset | null>(null);
  const [historyCount, setHistoryCount] = useState<number>(0);

  const refreshHistoryCount = async () => {
    try {
      const historyService = getHistoryService();
      const metrics = await historyService.getMetrics();
      setHistoryCount(metrics.itemCount);
    } catch {
      // Best-effort
    }
  };

  useEffect(() => {
    let ignore = false;
    getHistoryService()
      .getMetrics()
      .then((metrics) => {
        if (!ignore) {
          setHistoryCount(metrics.itemCount);
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [activeResult]);

  const navigateToAnalyze = (preset?: ScenarioPreset) => {
    if (preset) {
      setSelectedPreset(preset);
    }
    setActiveTab('analyze');
  };

  const navigateToResults = (result: StructuredAnalysisResult) => {
    setActiveResult(result);
    setActiveTab('results');
    refreshHistoryCount();
  };

  const navigateToHistory = () => {
    setActiveTab('history');
  };

  return (
    <NavigationContext.Provider
      value={{
        activeTab,
        setActiveTab,
        activeResult,
        setActiveResult,
        selectedPreset,
        setSelectedPreset,
        historyCount,
        refreshHistoryCount,
        navigateToAnalyze,
        navigateToResults,
        navigateToHistory,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}
