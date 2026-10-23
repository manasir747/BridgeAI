import {
  IHistoryService,
  HistoryItem,
  HistoryQueryFilter,
  HistoryPagination,
  PaginatedHistoryResult,
  StorageMetrics,
} from '@/types/history';
import { StructuredAnalysisResult } from '@/types/analysis';
import { MemoryHistoryService } from './memory';
import { filterAndPaginateHistory } from './helpers';

export const STORAGE_KEY = 'bridgeai_history_v1';
export const ESTIMATED_LOCALSTORAGE_MAX_BYTES = 5 * 1024 * 1024; // 5 MB standard

/**
 * Checks if browser localStorage is available and writable.
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }
  try {
    const testKey = '__bridgeai_storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Robust LocalStorage implementation of IHistoryService with memory fallback,
 * quota protection, and data migration friendliness.
 */
export class LocalStorageHistoryService implements IHistoryService {
  private fallbackMemory: MemoryHistoryService | null = null;

  constructor() {
    if (!isLocalStorageAvailable()) {
      this.fallbackMemory = new MemoryHistoryService();
    }
  }

  private getItemsMap(): Map<string, HistoryItem> {
    if (this.fallbackMemory) {
      // Memory fallback mode
      return new Map();
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Map();
      const parsed = JSON.parse(raw) as HistoryItem[];
      return new Map(parsed.map((item) => [item.id, item]));
    } catch {
      return new Map();
    }
  }

  private saveItemsMap(itemsMap: Map<string, HistoryItem>): void {
    if (this.fallbackMemory) return;

    const items = Array.from(itemsMap.values());
    const json = JSON.stringify(items);

    try {
      window.localStorage.setItem(STORAGE_KEY, json);
    } catch (err: unknown) {
      // Handle QuotaExceededError
      const isQuotaError =
        err instanceof DOMException &&
        (err.code === 22 ||
          err.code === 1014 ||
          err.name === 'QuotaExceededError' ||
          err.name === 'NS_ERROR_DOM_QUOTA_REACHED');

      if (isQuotaError) {
        // Attempt eviction: remove oldest unstarred archived items
        const nonEssential = items
          .filter((i) => i.isArchived && !i.isStarred)
          .sort((a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime());

        if (nonEssential.length > 0) {
          itemsMap.delete(nonEssential[0].id);
          try {
            window.localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(Array.from(itemsMap.values()))
            );
            return;
          } catch {
            // If still failing, throw clear error
          }
        }

        throw new Error(
          'Local storage quota exceeded. Please export or clear older records in BridgeAI history.'
        );
      }
      throw err;
    }
  }

  async save(
    result: StructuredAnalysisResult,
    options?: { notes?: string; tags?: string[] }
  ): Promise<HistoryItem> {
    if (this.fallbackMemory) {
      return this.fallbackMemory.save(result, options);
    }

    const itemsMap = this.getItemsMap();
    const existing = itemsMap.get(result.id);
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

    itemsMap.set(item.id, item);
    this.saveItemsMap(itemsMap);
    return item;
  }

  async getById(id: string): Promise<HistoryItem | null> {
    if (this.fallbackMemory) {
      return this.fallbackMemory.getById(id);
    }
    const itemsMap = this.getItemsMap();
    return itemsMap.get(id) || null;
  }

  async list(
    filter?: HistoryQueryFilter,
    pagination?: HistoryPagination
  ): Promise<PaginatedHistoryResult> {
    if (this.fallbackMemory) {
      return this.fallbackMemory.list(filter, pagination);
    }

    const itemsMap = this.getItemsMap();
    return filterAndPaginateHistory(Array.from(itemsMap.values()), filter, pagination);
  }

  async update(
    id: string,
    updates: Partial<Pick<HistoryItem, 'notes' | 'tags' | 'isStarred' | 'isArchived'>>
  ): Promise<HistoryItem | null> {
    if (this.fallbackMemory) {
      return this.fallbackMemory.update(id, updates);
    }

    const itemsMap = this.getItemsMap();
    const item = itemsMap.get(id);
    if (!item) return null;

    const updated: HistoryItem = {
      ...item,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    itemsMap.set(id, updated);
    this.saveItemsMap(itemsMap);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    if (this.fallbackMemory) {
      return this.fallbackMemory.delete(id);
    }

    const itemsMap = this.getItemsMap();
    const existed = itemsMap.delete(id);
    if (existed) {
      this.saveItemsMap(itemsMap);
    }
    return existed;
  }

  async clear(): Promise<void> {
    if (this.fallbackMemory) {
      return this.fallbackMemory.clear();
    }
    window.localStorage.removeItem(STORAGE_KEY);
  }

  async getMetrics(): Promise<StorageMetrics> {
    if (this.fallbackMemory) {
      return this.fallbackMemory.getMetrics();
    }

    const raw = window.localStorage.getItem(STORAGE_KEY) || '[]';
    const itemsMap = this.getItemsMap();
    const estimatedBytes = new Blob([raw]).size;

    return {
      itemCount: itemsMap.size,
      estimatedBytes,
      maxEstimatedBytes: ESTIMATED_LOCALSTORAGE_MAX_BYTES,
      percentUsed: Math.min(
        100,
        Math.round((estimatedBytes / ESTIMATED_LOCALSTORAGE_MAX_BYTES) * 100)
      ),
    };
  }

  async exportData(): Promise<string> {
    if (this.fallbackMemory) {
      return this.fallbackMemory.exportData();
    }
    const raw = window.localStorage.getItem(STORAGE_KEY) || '[]';
    return JSON.stringify(JSON.parse(raw), null, 2);
  }

  async importData(
    jsonContent: string
  ): Promise<{ importedCount: number; skippedCount: number }> {
    if (this.fallbackMemory) {
      return this.fallbackMemory.importData(jsonContent);
    }

    try {
      const parsed = JSON.parse(jsonContent);
      if (!Array.isArray(parsed)) {
        throw new Error('Import data must be a JSON array of HistoryItems');
      }

      const itemsMap = this.getItemsMap();
      let importedCount = 0;
      let skippedCount = 0;

      for (const item of parsed) {
        if (item && item.id && item.result && item.savedAt) {
          itemsMap.set(item.id, item as HistoryItem);
          importedCount++;
        } else {
          skippedCount++;
        }
      }

      this.saveItemsMap(itemsMap);
      return { importedCount, skippedCount };
    } catch (err) {
      throw new Error(
        `Failed to parse import data: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
}
