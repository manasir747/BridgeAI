import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryHistoryService } from '@/services/history/memory';
import { LocalStorageHistoryService, STORAGE_KEY } from '@/services/history/local-storage';
import { StructuredAnalysisResult } from '@/types/analysis';

const mockResult: StructuredAnalysisResult = {
  id: 'hist-item-1',
  rawInput: 'Bridge collapsed on route 9. Immediate closure requested.',
  timestamp: '2026-10-23T08:00:00.000Z',
  summary: 'Bridge collapse on Route 9 requires immediate road closure.',
  category: 'infrastructure_damage',
  urgency: {
    level: 'critical',
    score: 10,
    reasoning: 'Active structural failure across highway.',
  },
  extractedDetails: {
    locations: [{ name: 'Route 9' }],
    entities: [],
    contactInfo: [],
    resourceNeeds: [{ category: 'Logistics', item: 'Road barriers', urgency: 'critical' }],
  },
  missingInformation: [],
  verification: {
    status: 'verified',
    confidenceScore: 0.99,
    reasoning: 'Confirmed by highway patrol dispatch.',
  },
  sources: [],
  recommendedActions: [
    {
      id: 'act-1',
      title: 'Close Highway Route 9',
      description: 'Block all incoming lanes.',
      priority: 'critical',
      status: 'pending',
    },
  ],
  metadata: {
    modelVersion: 'gemini-2.5-flash',
    processingTimeMs: 200,
    inputLength: 58,
    sanitized: true,
    createdAt: '2026-10-23T08:00:00.000Z',
  },
};

describe('History Services', () => {
  describe('MemoryHistoryService', () => {
    let service: MemoryHistoryService;

    beforeEach(() => {
      service = new MemoryHistoryService();
    });

    it('saves and retrieves an item by ID', async () => {
      const saved = await service.save(mockResult, {
        notes: 'Handled by Officer Davis',
        tags: ['highway', 'closure'],
      });

      expect(saved.id).toBe(mockResult.id);
      expect(saved.notes).toBe('Handled by Officer Davis');
      expect(saved.tags).toEqual(['highway', 'closure']);

      const retrieved = await service.getById(mockResult.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.result.summary).toBe(mockResult.summary);
    });

    it('filters items by searchTerm, category, and urgency', async () => {
      await service.save(mockResult);

      const secondResult: StructuredAnalysisResult = {
        ...mockResult,
        id: 'hist-item-2',
        rawInput: 'Community center needs food donations for the pantry.',
        summary: 'Community soup kitchen seeking canned beans.',
        category: 'food_water_security',
        urgency: { level: 'low', score: 2, reasoning: 'Routine food drive' },
      };
      await service.save(secondResult);

      // Search by term
      const searchRes = await service.list({ searchTerm: 'bridge' });
      expect(searchRes.items.length).toBe(1);
      expect(searchRes.items[0].id).toBe('hist-item-1');

      // Filter by category
      const catRes = await service.list({ category: 'food_water_security' });
      expect(catRes.items.length).toBe(1);
      expect(catRes.items[0].id).toBe('hist-item-2');

      // Filter by urgency
      const urgRes = await service.list({ urgency: 'critical' });
      expect(urgRes.items.length).toBe(1);
      expect(urgRes.items[0].id).toBe('hist-item-1');
    });

    it('handles pagination correctly', async () => {
      for (let i = 1; i <= 15; i++) {
        await service.save({
          ...mockResult,
          id: `item-${i}`,
          summary: `Summary for item ${i}`,
        });
      }

      const page1 = await service.list(undefined, { page: 1, pageSize: 5 });
      expect(page1.items.length).toBe(5);
      expect(page1.total).toBe(15);
      expect(page1.totalPages).toBe(3);

      const page2 = await service.list(undefined, { page: 2, pageSize: 5 });
      expect(page2.items.length).toBe(5);
      expect(page2.page).toBe(2);
    });

    it('updates annotations and deletes items', async () => {
      await service.save(mockResult);

      const updated = await service.update(mockResult.id, {
        isStarred: true,
        notes: 'Follow-up completed',
      });
      expect(updated?.isStarred).toBe(true);
      expect(updated?.notes).toBe('Follow-up completed');

      const deleted = await service.delete(mockResult.id);
      expect(deleted).toBe(true);

      const notFound = await service.getById(mockResult.id);
      expect(notFound).toBeNull();
    });

    it('exports and imports backup data correctly', async () => {
      await service.save(mockResult);
      const exported = await service.exportData();
      expect(typeof exported).toBe('string');

      const newService = new MemoryHistoryService();
      const importResult = await newService.importData(exported);
      expect(importResult.importedCount).toBe(1);

      const importedItem = await newService.getById(mockResult.id);
      expect(importedItem?.id).toBe(mockResult.id);
    });

    it('returns storage metrics', async () => {
      await service.save(mockResult);
      const metrics = await service.getMetrics();
      expect(metrics.itemCount).toBe(1);
      expect(metrics.estimatedBytes).toBeGreaterThan(0);
      expect(metrics.percentUsed).toBeGreaterThanOrEqual(0);
    });
  });

  describe('LocalStorageHistoryService', () => {
    beforeEach(() => {
      window.localStorage.clear();
    });

    it('persists items to localStorage under STORAGE_KEY', async () => {
      const storageService = new LocalStorageHistoryService();
      await storageService.save(mockResult);

      const raw = window.localStorage.getItem(STORAGE_KEY);
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(parsed.length).toBe(1);
      expect(parsed[0].id).toBe(mockResult.id);

      const fetched = await storageService.getById(mockResult.id);
      expect(fetched?.result.summary).toBe(mockResult.summary);
    });

    it('clears all items from storage', async () => {
      const storageService = new LocalStorageHistoryService();
      await storageService.save(mockResult);
      expect(window.localStorage.getItem(STORAGE_KEY)).not.toBeNull();

      await storageService.clear();
      expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });
});
