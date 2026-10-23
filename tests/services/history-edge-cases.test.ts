import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageHistoryService, STORAGE_KEY } from '@/services/history/local-storage';
import { filterAndPaginateHistory } from '@/services/history/helpers';
import { HistoryItem } from '@/types/history';
import { StructuredAnalysisResult } from '@/types/analysis';

const createMockItem = (id: string, overrides?: Partial<StructuredAnalysisResult>): HistoryItem => ({
  id,
  result: {
    id,
    rawInput: `Raw input for incident ${id}`,
    timestamp: '2026-10-23T10:00:00.000Z',
    summary: `Summary for incident ${id}`,
    category: 'emergency_relief',
    urgency: { level: 'medium', score: 5, reasoning: 'Standard response' },
    extractedDetails: {
      locations: [{ name: 'District Hospital' }],
      entities: [],
      contactInfo: [],
      resourceNeeds: [],
    },
    missingInformation: [],
    verification: { status: 'verified', confidenceScore: 0.9, reasoning: 'Verified by dispatch' },
    sources: [],
    recommendedActions: [],
    metadata: {
      modelVersion: 'gemini-2.5-flash',
      processingTimeMs: 100,
      inputLength: 30,
      sanitized: true,
      createdAt: '2026-10-23T10:00:00.000Z',
    },
    ...overrides,
  },
  savedAt: '2026-10-23T10:00:00.000Z',
  updatedAt: '2026-10-23T10:00:00.000Z',
  tags: [],
  isArchived: false,
  isStarred: false,
});

describe('History Services Edge Cases & Recovery', () => {
  describe('Corrupted Storage Recovery', () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    it('gracefully handles corrupted/non-JSON content in localStorage', async () => {
      window.localStorage.setItem(STORAGE_KEY, '{invalid-malformed-json---');

      const service = new LocalStorageHistoryService();
      const list = await service.list();

      // Should return an empty list rather than throwing uncaught JSON parse error
      expect(list.items).toEqual([]);
      expect(list.total).toBe(0);
    });

    it('returns null when querying a non-existent ID', async () => {
      const service = new LocalStorageHistoryService();
      const item = await service.getById('non-existent-uuid-999');
      expect(item).toBeNull();
    });

    it('handles import of empty or malformed backup JSON cleanly', async () => {
      const service = new LocalStorageHistoryService();

      const emptyImport = await service.importData('[]');
      expect(emptyImport.importedCount).toBe(0);
      expect(emptyImport.skippedCount).toBe(0);

      // Malformed non-JSON throws error
      await expect(service.importData('not-a-json')).rejects.toThrow();

      // Array with invalid items increments skippedCount
      const mixedImport = await service.importData(JSON.stringify([{ invalid: 'item' }]));
      expect(mixedImport.importedCount).toBe(0);
      expect(mixedImport.skippedCount).toBe(1);
    });
  });

  describe('filterAndPaginateHistory Helper Logic', () => {
    const items: HistoryItem[] = [
      {
        ...createMockItem('item-1'),
        savedAt: '2026-10-21T08:00:00.000Z',
        isStarred: true,
        notes: 'Priority dispatch for river crossing',
      },
      {
        ...createMockItem('item-2', {
          category: 'healthcare_access',
          urgency: { level: 'critical', score: 10, reasoning: 'Oxygen shortage' },
          extractedDetails: {
            locations: [{ name: 'St. Jude Clinic' }],
            entities: [],
            contactInfo: [],
            resourceNeeds: [],
          },
        }),
        savedAt: '2026-10-22T12:00:00.000Z',
        isArchived: true,
      },
      {
        ...createMockItem('item-3', {
          category: 'food_water_security',
          urgency: { level: 'low', score: 2, reasoning: 'Surplus distribution' },
        }),
        savedAt: '2026-10-23T15:00:00.000Z',
      },
    ];

    it('filters by date range (startDate and endDate)', () => {
      const startDateResult = filterAndPaginateHistory(items, {
        startDate: '2026-10-22T00:00:00.000Z',
      });
      // Should include item-2 and item-3
      expect(startDateResult.items.map((i) => i.id)).toEqual(['item-3', 'item-2']);

      const endDateResult = filterAndPaginateHistory(items, {
        endDate: '2026-10-22T00:00:00.000Z',
      });
      // Should only include item-1
      expect(endDateResult.items.map((i) => i.id)).toEqual(['item-1']);
    });

    it('searches across notes and location names case-insensitively', () => {
      // Search in notes
      const noteSearch = filterAndPaginateHistory(items, { searchTerm: 'river crossing' });
      expect(noteSearch.items.length).toBe(1);
      expect(noteSearch.items[0].id).toBe('item-1');

      // Search in extracted location name
      const locSearch = filterAndPaginateHistory(items, { searchTerm: 'st. jude' });
      expect(locSearch.items.length).toBe(1);
      expect(locSearch.items[0].id).toBe('item-2');
    });

    it('filters accurately by starred and archived flags', () => {
      const starredOnly = filterAndPaginateHistory(items, { isStarred: true });
      expect(starredOnly.items.length).toBe(1);
      expect(starredOnly.items[0].id).toBe('item-1');

      const archivedOnly = filterAndPaginateHistory(items, { isArchived: true });
      expect(archivedOnly.items.length).toBe(1);
      expect(archivedOnly.items[0].id).toBe('item-2');
    });

    it('handles boundary pagination parameters safely (page <= 0, pageSize <= 0, page > totalPages)', () => {
      // Invalid/zero page falls back to page 1
      const zeroPage = filterAndPaginateHistory(items, undefined, { page: 0, pageSize: 0 });
      expect(zeroPage.page).toBe(1);
      expect(zeroPage.pageSize).toBe(10);
      expect(zeroPage.items.length).toBe(3);

      // Page exceeding totalPages returns empty items slice with correct totalPages
      const pastEnd = filterAndPaginateHistory(items, undefined, { page: 10, pageSize: 2 });
      expect(pastEnd.items).toEqual([]);
      expect(pastEnd.page).toBe(10);
      expect(pastEnd.totalPages).toBe(2);
    });
  });
});
