import {
  HistoryItem,
  HistoryQueryFilter,
  HistoryPagination,
  PaginatedHistoryResult,
} from '@/types/history';

/**
 * Shared utility to filter, sort, and paginate history items.
 * Used by both LocalStorageHistoryService and MemoryHistoryService to guarantee identical behavior.
 */
export function filterAndPaginateHistory(
  allItems: HistoryItem[],
  filter?: HistoryQueryFilter,
  pagination?: HistoryPagination
): PaginatedHistoryResult {
  let list = [...allItems];

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
