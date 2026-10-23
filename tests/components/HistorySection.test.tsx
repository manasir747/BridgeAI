import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HistorySection } from '@/components/history/HistorySection';
import { getHistoryService } from '@/services/history/factory';
import { StructuredAnalysisResult } from '@/types/analysis';

const sampleResultA: StructuredAnalysisResult = {
  id: 'hist-item-a',
  rawInput: 'Wildfire encroaching upon residential zone near Ridge Road.',
  timestamp: '2026-10-23T08:00:00.000Z',
  summary: 'Wildfire threat on Ridge Road.',
  category: 'emergency_relief',
  urgency: { level: 'critical', score: 10, reasoning: 'Active fire front' },
  extractedDetails: { locations: [{ name: 'Ridge Road' }], entities: [], contactInfo: [], resourceNeeds: [] },
  missingInformation: [],
  verification: { status: 'verified', confidenceScore: 0.98, reasoning: 'Direct observation' },
  sources: [],
  recommendedActions: [{ id: 'act-a1', title: 'Evacuate Ridge Rd', description: 'Immediate evacuation', priority: 'critical', status: 'pending' }],
  metadata: { modelVersion: 'gemini-2.5-flash', processingTimeMs: 300, inputLength: 50, sanitized: true, createdAt: '2026-10-23T08:00:00.000Z' },
};

const sampleResultB: StructuredAnalysisResult = {
  id: 'hist-item-b',
  rawInput: 'Hospital generator low on fuel at St. Jude Clinic.',
  timestamp: '2026-10-23T09:00:00.000Z',
  summary: 'Hospital generator fuel depletion.',
  category: 'healthcare_access',
  urgency: { level: 'high', score: 8, reasoning: 'Fuel exhaustion imminent' },
  extractedDetails: { locations: [{ name: 'St. Jude' }], entities: [], contactInfo: [], resourceNeeds: [] },
  missingInformation: [],
  verification: { status: 'verified', confidenceScore: 0.92, reasoning: 'Nurse report' },
  sources: [],
  recommendedActions: [{ id: 'act-b1', title: 'Deliver fuel', description: 'Bring diesel cans', priority: 'high', status: 'pending' }],
  metadata: { modelVersion: 'gemini-2.5-flash', processingTimeMs: 250, inputLength: 45, sanitized: true, createdAt: '2026-10-23T09:00:00.000Z' },
};

describe('HistorySection Component', () => {
  beforeEach(async () => {
    const historyService = getHistoryService();
    await historyService.clear();
  });

  it('renders empty state when history contains no analyses', async () => {
    render(<HistorySection onSelectResult={vi.fn()} onNavigateToAnalyze={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('No Saved Analyses Yet')).toBeInTheDocument();
    });
  });

  it('renders saved history items in list', async () => {
    const historyService = getHistoryService();
    await historyService.save(sampleResultA);
    await historyService.save(sampleResultB);

    render(<HistorySection onSelectResult={vi.fn()} onNavigateToAnalyze={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Wildfire threat on Ridge Road.')).toBeInTheDocument();
      expect(screen.getByText('Hospital generator fuel depletion.')).toBeInTheDocument();
    });
  });

  it('filters items by search term', async () => {
    const historyService = getHistoryService();
    await historyService.save(sampleResultA);
    await historyService.save(sampleResultB);

    render(<HistorySection onSelectResult={vi.fn()} onNavigateToAnalyze={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Wildfire threat on Ridge Road.')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search summaries, locations, notes/i);
    fireEvent.change(searchInput, { target: { value: 'Ridge' } });

    await waitFor(() => {
      expect(screen.getByText('Wildfire threat on Ridge Road.')).toBeInTheDocument();
      expect(screen.queryByText('Hospital generator fuel depletion.')).not.toBeInTheDocument();
    });
  });

  it('invokes onSelectResult when clicking "Open Dossier"', async () => {
    const handleSelect = vi.fn();
    const historyService = getHistoryService();
    await historyService.save(sampleResultA);

    render(<HistorySection onSelectResult={handleSelect} onNavigateToAnalyze={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Wildfire threat on Ridge Road.')).toBeInTheDocument();
    });

    const openBtn = screen.getByLabelText(/Open detailed result for Wildfire threat on Ridge Road/i);
    fireEvent.click(openBtn);

    expect(handleSelect).toHaveBeenCalledWith(sampleResultA);
  });

  it('deletes an item when clicking the trash button', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const historyService = getHistoryService();
    await historyService.save(sampleResultA);

    render(<HistorySection onSelectResult={vi.fn()} onNavigateToAnalyze={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText('Wildfire threat on Ridge Road.')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByLabelText(/Delete this analysis record/i);
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('Wildfire threat on Ridge Road.')).not.toBeInTheDocument();
    });
  });
});
