import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { HomeSection } from '@/components/home/HomeSection';
import { HUMANITARIAN_PRESETS } from '@/lib/examples';

describe('HomeSection Component', () => {
  it('renders hero title and value proposition', () => {
    render(
      <HomeSection onNavigateToAnalyze={vi.fn()} onNavigateToHistory={vi.fn()} />
    );

    expect(
      screen.getByRole('heading', {
        name: /Turn Messy Crisis Reports into Validated, Actionable Relief/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Gemini-Powered Humanitarian Intelligence/i)
    ).toBeInTheDocument();
  });

  it('triggers onNavigateToAnalyze when clicking "Analyze a Problem" CTA', () => {
    const handleAnalyze = vi.fn();
    render(
      <HomeSection onNavigateToAnalyze={handleAnalyze} onNavigateToHistory={vi.fn()} />
    );

    const ctaButton = screen.getByRole('button', { name: /Analyze a Problem/i });
    fireEvent.click(ctaButton);

    expect(handleAnalyze).toHaveBeenCalledTimes(1);
    expect(handleAnalyze).toHaveBeenCalledWith();
  });

  it('triggers onNavigateToHistory when clicking browse history button', () => {
    const handleHistory = vi.fn();
    render(
      <HomeSection onNavigateToAnalyze={vi.fn()} onNavigateToHistory={handleHistory} />
    );

    const historyButton = screen.getByRole('button', { name: /View previous analysis history/i });
    fireEvent.click(historyButton);

    expect(handleHistory).toHaveBeenCalledTimes(1);
  });

  it('renders 3-step pipeline overview', () => {
    render(
      <HomeSection onNavigateToAnalyze={vi.fn()} onNavigateToHistory={vi.fn()} />
    );

    expect(screen.getByText(/1. Ingest Messy Dispatches/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Gemini Fact & Triage Extraction/i)).toBeInTheDocument();
    expect(screen.getByText(/3. Prioritized Action Dispatch/i)).toBeInTheDocument();
  });

  it('renders real-world crisis presets with load action', () => {
    const handleAnalyze = vi.fn();
    render(
      <HomeSection onNavigateToAnalyze={handleAnalyze} onNavigateToHistory={vi.fn()} />
    );

    const firstPreset = HUMANITARIAN_PRESETS[0];
    expect(screen.getByText(firstPreset.title)).toBeInTheDocument();

    const loadButton = screen.getByLabelText(`Load and analyze scenario: ${firstPreset.title}`);
    fireEvent.click(loadButton);

    expect(handleAnalyze).toHaveBeenCalledWith(firstPreset);
  });

  it('displays humanitarian safety and operational verification notice', () => {
    render(
      <HomeSection onNavigateToAnalyze={vi.fn()} onNavigateToHistory={vi.fn()} />
    );

    expect(
      screen.getByText(/Humanitarian Safety & Operational Verification Policy/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/All AI-generated assessments, locations, and resource recommendations must be corroborated/i)
    ).toBeInTheDocument();
  });

  it('renders societal impact and humanitarian purpose section with 3 core pillars', () => {
    render(
      <HomeSection onNavigateToAnalyze={vi.fn()} onNavigateToHistory={vi.fn()} />
    );

    expect(
      screen.getByRole('heading', { name: /Societal Impact & Mission/i })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Humanitarian Purpose & Societal Impact/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The Problem: Crisis Information Overload/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/BridgeAI's Contribution: Crisis Intelligence/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Intended Beneficiaries: Responders & Communities/i)
    ).toBeInTheDocument();
  });
});
