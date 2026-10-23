import {
  IHistoryService,
  HistoryItem,
  HistoryQueryFilter,
  HistoryPagination,
  PaginatedHistoryResult,
  StorageMetrics,
} from '@/types/history';
import { StructuredAnalysisResult } from '@/types/analysis';

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
    let list = Array.from(this.items.values());

    // Sort descending by savedAt
    list.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

    if (filter) {
      if (filter.searchTerm) {
        const query = filter.searchTerm.toLowerCase();
        list = list.filter(
          (item) =>
            item.result.summary.toLowerCase().includes(query) ||
            item.result.rawInput.toLowerCase().includes(query) ||
            item.notes?.toLowerCase().includes(query) ||
            item.result.extractedDetails.locations.some((loc) =>
              loc.name.toLowerCase().includes(query)
            )
        );
      }

      if (filter.category) {
        list = list.filter((item) => item.result.category === filter.category);
      }

      if (filter.urgency) {
        list = list.filter((item) => item.result.urgency.level === filter.urgency);
      }

      if (typeof filter.isStarred === 'boolean') {
        list = list.filter((item) => !!item.isStarred === filter.isStarred);
      }

      if (typeof filter.isArchived === 'boolean') {
        list = list.filter((item) => !!item.isArchived === filter.isArchived);
      }

      if (filter.startDate) {
        const start = new Date(filter.startDate).getTime();
        list = list.filter((item) => new Date(item.savedAt).getTime() >= start);
      }

      if (filter.endDate) {
        const end = new Date(filter.endDate).getTime();
        list = list.filter((item) => new Date(item.savedAt).getTime() <= end);
      }
    }

    const total = list.length;
    const page = pagination?.page && pagination.page > 0 ? pagination.page : 1;
    const pageSize = pagination?.pageSize && pagination.pageSize > 0 ? pagination.pageSize : 10;
    const totalPages = Math.ceil(total / pageSize) || 1;

    const startIndex = (page - 1) * pageSize;
    const items = list.slice(startIndex, startIndex + pageSize);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages,
    };
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
