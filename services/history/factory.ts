import { IHistoryService } from '@/types/history';
import { LocalStorageHistoryService } from './local-storage';
import { MemoryHistoryService } from './memory';

let singletonService: IHistoryService | null = null;

/**
 * Returns a singleton instance of the appropriate history service.
 * In browser environments, returns LocalStorageHistoryService.
 * In SSR / Node / test environments, returns MemoryHistoryService.
 */
export function getHistoryService(): IHistoryService {
  if (singletonService) {
    return singletonService;
  }

  if (typeof window !== 'undefined') {
    singletonService = new LocalStorageHistoryService();
  } else {
    singletonService = new MemoryHistoryService();
  }

  return singletonService;
}

/**
 * Resets the singleton instance (useful in unit testing).
 */
export function resetHistoryServiceForTesting(): void {
  singletonService = null;
}
