import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AnalysisResultCard } from '@/components/analysis/AnalysisResultCard';
import { StructuredAnalysisResult } from '@/types/analysis';

const testResult: StructuredAnalysisResult = {
  id: 'card-test-1',
  rawInput: 'Dam overflow warning near Pine Valley. 150 families at risk of flooding.',
  timestamp: '2026-10-23T11:00:00.000Z',
  summary: 'Pine Valley Dam overflow imminent, threatening 150 households downstream.',
  category: 'infrastructure_damage',
  urgency: {
    level: 'critical',
    score: 10,
    reasoning: 'Breach expected within 1 hour based on reservoir sensor spike.',
  },
  extractedDetails: {
    locations: [{ name: 'Pine Valley Dam', address: 'Pine Valley Creek Basin' }],
    entities: [{ name: 'Dam Operators', type: 'organization' }],
    affectedPopulation: {
      countEstimate: 150,
      description: 'Downstream households along Pine Creek',
    },
    contactInfo: [{ type: 'radio', value: 'Channel 9' }],
    resourceNeeds: [{ category: 'Rescue', item: 'Zodiac inflatable boats', urgency: 'critical' }],
  },
  missingInformation: [
    {
      field: 'Evacuation Route Status',
      description: 'Is Pine Valley Bridge passable for vehicles?',
      criticality: 'critical',
    },
  ],
  verification: {
    status: 'verified',
    confidenceScore: 0.98,
    reasoning: 'Telemetry confirmed by Regional Water Authority.',
  },
  sources: [],
  recommendedActions: [
    {
      id: 'act-101',
      title: 'Sound Sirens in Pine Valley',
      description: 'Activate civil defense alert sirens for immediate evacuation.',
      priority: 'critical',
      targetEntity: 'Emergency Operations Center',
      status: 'pending',
    },
  ],
  metadata: {
    modelVersion: 'gemini-2.5-flash',
    processingTimeMs: 310,
    inputLength: 72,
    sanitized: true,
    createdAt: '2026-10-23T11:00:00.000Z',
  },
};

describe('AnalysisResultCard Component', () => {
  it('renders the summary heading and category', () => {
    render(<AnalysisResultCard result={testResult} />);

    expect(
      screen.getByText('Pine Valley Dam overflow imminent, threatening 150 households downstream.')
    ).toBeInTheDocument();
    expect(screen.getByText('INFRASTRUCTURE DAMAGE')).toBeInTheDocument();
  });

  it('renders the urgency badge with level and score', () => {
    render(<AnalysisResultCard result={testResult} />);

    const urgencyBadge = screen.getByLabelText('Urgency level: critical');
    expect(urgencyBadge).toBeInTheDocument();
    expect(urgencyBadge).toHaveTextContent('URGENCY: CRITICAL (10/10)');
  });

  it('renders extracted locations, population, and resource needs', () => {
    render(<AnalysisResultCard result={testResult} />);

    expect(screen.getByText('Pine Valley Dam')).toBeInTheDocument();
    expect(screen.getByText(/~150 people/i)).toBeInTheDocument();
    expect(screen.getByText(/Zodiac inflatable boats/i)).toBeInTheDocument();
  });

  it('renders missing information section with field and criticality', () => {
    render(<AnalysisResultCard result={testResult} />);

    expect(screen.getByText('Evacuation Route Status:')).toBeInTheDocument();
    expect(
      screen.getByText(/Is Pine Valley Bridge passable for vehicles\?/i)
    ).toBeInTheDocument();
  });

  it('renders recommended operational actions with target entity', () => {
    render(<AnalysisResultCard result={testResult} />);

    expect(screen.getByText(/Sound Sirens in Pine Valley/i)).toBeInTheDocument();
    expect(screen.getByText('Target: Emergency Operations Center')).toBeInTheDocument();
  });

  it('has accessible article landmark and aria-label', () => {
    render(<AnalysisResultCard result={testResult} />);

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute(
      'aria-label',
      `Analysis result: ${testResult.summary}`
    );
  });
});
