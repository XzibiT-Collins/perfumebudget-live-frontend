import api from './api';
import type { ManualJournalEntryRequest } from '../types';

export const bookkeepingService = {
  /**
   * Record a manual journal entry
   * POST /api/v1/admin/bookkeeping/manual-entry
   */
  recordManualEntry: async (data: ManualJournalEntryRequest): Promise<void> => {
    await api.post('/admin/bookkeeping/manual-entry', data);
  }
};
