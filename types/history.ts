import { StructuredAnalysisResult, AnalysisCategory, UrgencyLevel } from './analysis';

/**
 * Metadata and user annotations for an analysis item stored in history.
 */
export interface HistoryItem {
  id: string;
  result: StructuredAnalysisResult;
  savedAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
  isArchived?: boolean;
  isStarred?: boolean;
}

/**
 * Query filters for searching and filtering historical intake items.
 */
export interface HistoryQueryFilter {
  searchTerm?: string;
  category?: AnalysisCategory;
  urgency?: UrgencyLevel;
  isStarred?: boolean;
  isArchived?: boolean;
  startDate?: string;
  endDate?: string;
}

/**
 * Pagination parameters.
 */
export interface HistoryPagination {
  page: number;
  pageSize: number;
}

/**
 * Paginated list result.
 */
export interface PaginatedHistoryResult {
  items: HistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Storage metrics for monitoring localStorage quota.
 */
export interface StorageMetrics {
  itemCount: number;
  estimatedBytes: number;
  maxEstimatedBytes: number;
  percentUsed: number;
}

/**
 * Unified interface for history storage.
 * Designed so that LocalStorage, IndexedDB, or future PostgreSQL/Supabase implementations
 * adhere strictly to the same contract.
 */
export interface IHistoryService {
  /**
   * Save a newly analyzed item or update existing.
   */
  save(result: StructuredAnalysisResult, options?: { notes?: string; tags?: string[] }): Promise<HistoryItem>;

  /**
   * Retrieve a single history entry by its unique ID.
   */
  getById(id: string): Promise<HistoryItem | null>;

  /**
   * List history entries with optional filtering and pagination.
   */
  list(filter?: HistoryQueryFilter, pagination?: HistoryPagination): Promise<PaginatedHistoryResult>;

  /**
   * Update annotations (notes, tags, starred, archived) on a history item.
   */
  update(
    id: string,
    updates: Partial<Pick<HistoryItem, 'notes' | 'tags' | 'isStarred' | 'isArchived'>>
  ): Promise<HistoryItem | null>;

  /**
   * Delete a single history item by ID.
   */
  delete(id: string): Promise<boolean>;

  /**
   * Purge all items from storage.
   */
  clear(): Promise<void>;

  /**
   * Retrieve current storage quota usage.
   */
  getMetrics(): Promise<StorageMetrics>;

  /**
   * Export all items as a JSON string (for user backup/data sovereignty).
   */
  exportData(): Promise<string>;

  /**
   * Import items from a previously exported JSON backup.
   */
  importData(jsonContent: string): Promise<{ importedCount: number; skippedCount: number }>;
}
