import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ResultsSection } from '@/components/results/ResultsSection';
import { StructuredAnalysisResult } from '@/types/analysis';

const sampleResult: StructuredAnalysisResult = {
  id: 'res-test-1',
  rawInput: 'Floodwaters rising near community clinic. 4 trapped patients.',
  timestamp: '2026-10-23T10:00:00.000Z',
  summary: 'Floodwaters threatening 4 trapped patients at community clinic.',
  category: 'healthcare_access',
  urgency: {
    level: 'critical',
    score: 10,
    reasoning: 'Imminent threat of hypothermia and drowning.',
  },
  extractedDetails: {
    locations: [{ name: 'Community Clinic' }],
    entities: [{ name: 'Clinic Staff', type: 'person' }],
    affectedPopulation: { countEstimate: 4 },
    contactInfo: [{ type: 'phone', value: '555-0199' }],
    resourceNeeds: [{ category: 'Evacuation', item: 'Rescue boat', urgency: 'critical' }],
  },
  missingInformation: [
    { field: 'Water Depth', description: 'Approach depth for boat', criticality: 'high' },
  ],
  verification: {
    status: 'needs_followup',
    confidenceScore: 0.9,
    reasoning: 'Direct report requiring confirmation',
  },
  sources: [],
  recommendedActions: [
    {
      id: 'act-1',
      title: 'Deploy rescue boat',
      description: 'Send maritime unit to clinic',
      priority: 'critical',
      targetEntity: 'Water Rescue Squad',
      status: 'pending',
    },
    {
      id: 'act-2',
      title: 'Alert regional hospital',
      description: 'Prepare 4 triage beds',
      priority: 'high',
      targetEntity: 'County Hospital',
      status: 'pending',
    },
  ],
  metadata: {
    modelVersion: 'gemini-2.5-flash',
    processingTimeMs: 400,
    inputLength: 62,
    sanitized: true,
    createdAt: '2026-10-23T10:00:00.000Z',
  },
};

describe('ResultsSection Component', () => {
  it('renders empty state when result is null', () => {
    render(
      <ResultsSection
        result={null}
        onUpdateResult={vi.fn()}
        onNavigateToAnalyze={vi.fn()}
        onNavigateToHistory={vi.fn()}
      />
    );

    expect(screen.getByText('No Active Analysis Selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze a Problem/i })).toBeInTheDocument();
  });

  it('renders analysis summary, category, and operational grounding notice', () => {
    render(
      <ResultsSection
        result={sampleResult}
        onUpdateResult={vi.fn()}
        onNavigateToAnalyze={vi.fn()}
        onNavigateToHistory={vi.fn()}
      />
    );

    expect(
      screen.getByText('Floodwaters threatening 4 trapped patients at community clinic.')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Humanitarian Operational Grounding Notice/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/AI claims, headcounts, and suggested coordinates are/i)
    ).toBeInTheDocument();
  });

  it('renders My Actions tracker and toggles action status on click', () => {
    const handleUpdate = vi.fn();
    render(
      <ResultsSection
        result={sampleResult}
        onUpdateResult={handleUpdate}
        onNavigateToAnalyze={vi.fn()}
        onNavigateToHistory={vi.fn()}
      />
    );

    expect(screen.getByText(/0 of 2 tasks marked completed/i)).toBeInTheDocument();

    const toggleBtn = screen.getByLabelText(/Toggle action status for Deploy rescue boat/i);
    expect(toggleBtn).toHaveTextContent('pending');

    fireEvent.click(toggleBtn);

    expect(handleUpdate).toHaveBeenCalled();
    const updated = handleUpdate.mock.calls[0][0];
    expect(updated.recommendedActions[0].status).toBe('in_progress');
  });

  it('allows editing and saving dispatcher field notes', async () => {
    render(
      <ResultsSection
        result={sampleResult}
        onUpdateResult={vi.fn()}
        onNavigateToAnalyze={vi.fn()}
        onNavigateToHistory={vi.fn()}
      />
    );

    const editBtn = screen.getByRole('button', { name: /Edit Notes/i });
    fireEvent.click(editBtn);

    const notesInput = screen.getByPlaceholderText(/e.g. Unit 4 en route/i);
    fireEvent.change(notesInput, { target: { value: 'Boat unit ETA 15 minutes.' } });

    const saveBtn = screen.getByRole('button', { name: /Save Annotations/i });
    fireEvent.click(saveBtn);

    await screen.findByText(/Boat unit ETA 15 minutes./i);
    await screen.findByText(/Annotations saved to history!/i);
  });

  it('copies summary text to clipboard when clicking Copy Summary', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <ResultsSection
        result={sampleResult}
        onUpdateResult={vi.fn()}
        onNavigateToAnalyze={vi.fn()}
        onNavigateToHistory={vi.fn()}
      />
    );

    const copyBtn = screen.getByLabelText(/Copy executive summary to clipboard/i);
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalled();
    expect(writeTextMock.mock.calls[0][0]).toContain('Floodwaters threatening 4 trapped patients');
    await screen.findByText('Copied!');
  });
});
