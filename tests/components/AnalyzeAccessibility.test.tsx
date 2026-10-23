import React, { useEffect } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnalyzeSection } from '@/components/analyze/AnalyzeSection';
import { LanguageProvider, useLanguage } from '@/lib/i18n/LanguageContext';
import { SupportedLanguage } from '@/types/i18n';

function LanguageSelectorHelper({ lang }: { lang: SupportedLanguage }) {
  const { setLanguage } = useLanguage();
  useEffect(() => {
    setLanguage(lang);
  }, [lang, setLanguage]);
  return null;
}

describe('AnalyzeSection Accessibility & Language Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders with Hindi translations when switched to Hindi', async () => {
    render(
      <LanguageProvider>
        <LanguageSelectorHelper lang="hi" />
        <AnalyzeSection onAnalysisSuccess={vi.fn()} />
      </LanguageProvider>
    );

    expect(await screen.findByRole('heading', { name: /संकट संदेश का विश्लेषण करें/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /जेमिनी ट्राइएज विश्लेषण के लिए फील्ड रिपोर्ट सबमिट करें/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/इनटेक एवं ट्राइएज वर्कस्पेस/i)).toBeInTheDocument();
  });

  it('renders with Marathi translations when switched to Marathi', async () => {
    render(
      <LanguageProvider>
        <LanguageSelectorHelper lang="mr" />
        <AnalyzeSection onAnalysisSuccess={vi.fn()} />
      </LanguageProvider>
    );

    expect(await screen.findByRole('heading', { name: /संकट संदेशाचे विश्लेषण करा/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /जेमिनी ट्रायज विश्लेषणासाठी क्षेत्रीय अहवाल सादर करा/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/इनटेक आणि ट्रायज वर्कस्पेस/i)).toBeInTheDocument();
  });

  it('updates live character counter accurately and supports reset', () => {
    render(<AnalyzeSection onAnalysisSuccess={vi.fn()} />);

    const textarea = screen.getByPlaceholderText(/Example: Emergency at St. Jude Clinic/i) as HTMLTextAreaElement;
    const liveRegion = document.querySelector('[aria-live="polite"]');
    expect(liveRegion).toHaveTextContent('0 / 10000 chars');

    // Type input
    fireEvent.change(textarea, { target: { value: 'Disaster warning for district five.' } });
    expect(textarea.value).toBe('Disaster warning for district five.');
    expect(liveRegion).toHaveTextContent('35 / 10000 chars');

    // Trigger clear/reset
    const resetButton = screen.getByRole('button', { name: /Clear all inputs and reset form/i });
    expect(resetButton).not.toBeDisabled();
    fireEvent.click(resetButton);

    expect(textarea.value).toBe('');
    expect(liveRegion).toHaveTextContent('0 / 10000 chars');
  });

  it('renders voice dictation trigger and toggles advanced settings drawer', () => {
    render(<AnalyzeSection onAnalysisSuccess={vi.fn()} />);

    // Voice dictation mic button presence
    const micButton = screen.getByRole('button', { name: /Start voice dictation in English/i });
    expect(micButton).toBeInTheDocument();

    // Toggle advanced triage options
    const advancedToggle = screen.getByRole('button', { name: /Advanced Triage & Urgency Calibration/i });
    expect(screen.queryByText(/Prioritized Urgency Calibration:/i)).not.toBeInTheDocument();

    fireEvent.click(advancedToggle);
    expect(screen.getByText(/Prioritized Urgency Calibration:/i)).toBeInTheDocument();
  });

  it('has proper accessible ARIA labeling on category radio options', () => {
    render(<AnalyzeSection onAnalysisSuccess={vi.fn()} />);

    const categoryRadios = screen.getAllByRole('radio');
    expect(categoryRadios.length).toBeGreaterThan(0);

    // Auto-detect is checked by default
    expect(categoryRadios[0]).toHaveAttribute('aria-checked', 'true');

    // Click on another category radio
    fireEvent.click(categoryRadios[1]);
    expect(categoryRadios[1]).toHaveAttribute('aria-checked', 'true');
    expect(categoryRadios[0]).toHaveAttribute('aria-checked', 'false');
  });
});
