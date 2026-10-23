import {
  IHistoryService,
  HistoryItem,
  HistoryQueryFilter,
  HistoryPagination,
  PaginatedHistoryResult,
  StorageMetrics,
} from '@/types/history';
import { StructuredAnalysisResult } from '@/types/analysis';
import { filterAndPaginateHistory } from './helpers';

/**
 * In-memory implementation of IHistoryService.
 * Used for SSR environments, headless testing, and environments where localStorage is unavailable.
 */
export class MemoryHistoryService implements IHistoryService {
  private items: Map<string, HistoryItem> = new Map();

  async save(
    result: StructuredAnalysisResult,
    options?: { notes?: string; tags?: string[] }
  ): Promise<HistoryItem> {
    const existing = this.items.get(result.id);
    const now = new Date().toISOString();

    const item: HistoryItem = {
      id: result.id,
      result,
      savedAt: existing ? existing.savedAt : now,
      updatedAt: now,
      notes: options?.notes ?? existing?.notes,
      tags: options?.tags ?? existing?.tags ?? [],
      isArchived: existing?.isArchived ?? false,
      isStarred: existing?.isStarred ?? false,
    };

    this.items.set(item.id, item);
    return item;
  }

  async getById(id: string): Promise<HistoryItem | null> {
    return this.items.get(id) || null;
  }

  async list(
    filter?: HistoryQueryFilter,
    pagination?: HistoryPagination
  ): Promise<PaginatedHistoryResult> {
    return filterAndPaginateHistory(Array.from(this.items.values()), filter, pagination);
  }

  async update(
    id: string,
    updates: Partial<Pick<HistoryItem, 'notes' | 'tags' | 'isStarred' | 'isArchived'>>
  ): Promise<HistoryItem | null> {
    const item = this.items.get(id);
    if (!item) return null;

    const updated: HistoryItem = {
      ...item,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.items.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.items.delete(id);
  }

  async clear(): Promise<void> {
    this.items.clear();
  }

  async getMetrics(): Promise<StorageMetrics> {
    const list = Array.from(this.items.values());
    const json = JSON.stringify(list);
    const estimatedBytes = new Blob([json]).size;
    const maxEstimatedBytes = 5 * 1024 * 1024; // 5MB simulated

    return {
      itemCount: list.length,
      estimatedBytes,
      maxEstimatedBytes,
      percentUsed: Math.min(100, Math.round((estimatedBytes / maxEstimatedBytes) * 100)),
    };
  }

  async exportData(): Promise<string> {
    return JSON.stringify(Array.from(this.items.values()), null, 2);
  }

  async importData(jsonContent: string): Promise<{ importedCount: number; skippedCount: number }> {
    try {
      const parsed = JSON.parse(jsonContent);
      if (!Array.isArray(parsed)) {
        throw new Error('Import data must be a JSON array of HistoryItems');
      }

      let importedCount = 0;
      let skippedCount = 0;

      for (const item of parsed) {
        if (item && item.id && item.result && item.savedAt) {
          this.items.set(item.id, item as HistoryItem);
          importedCount++;
        } else {
          skippedCount++;
        }
      }

      return { importedCount, skippedCount };
    } catch (err) {
      throw new Error(`Failed to parse import data: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
