import api from './api';
import type { CustomApiResponse, LedgerSummaryResponse, JournalEntryResponse, IncomeStatementResponse, CashFlowResponse, BalanceSheetResponse, AccountingMetadataResponse } from '../types';

export const accountingService = {
  /**
   * Get metadata enums
   * GET /api/v1/admin/accounting/metadata
   */
  getMetadata: async (): Promise<AccountingMetadataResponse> => {
    const res = await api.get<CustomApiResponse<AccountingMetadataResponse>>('/admin/accounting/metadata');
    return res.data.data;
  },

  /**
   * overall ledger snapshot
   * GET /api/v1/admin/accounting/summary
   */
  getSummary: async (): Promise<LedgerSummaryResponse> => {
    const res = await api.get<CustomApiResponse<LedgerSummaryResponse>>('/admin/accounting/summary');
    return res.data.data;
  },

  /**
   * full audit trail
   * GET /api/v1/admin/accounting/journal-entries?startDate=&endDate=
   */
  getJournalEntries: async (startDate: string, endDate: string): Promise<JournalEntryResponse[]> => {
    const res = await api.get<CustomApiResponse<JournalEntryResponse[]>>('/admin/accounting/journal-entries', {
      params: { startDate, endDate }
    });
    return res.data.data;
  },

  /**
   * trace an order or reference
   * GET /api/v1/admin/accounting/journal-entries/reference?referenceType=ORDER&referenceId=ORD-xxx
   */
  getEntriesByReference: async (referenceType: string, referenceId: string): Promise<JournalEntryResponse[]> => {
    const res = await api.get<CustomApiResponse<JournalEntryResponse[]>>('/admin/accounting/journal-entries/reference', {
      params: { referenceType, referenceId }
    });
    return res.data.data;
  },

  /**
   * all manual entries
   * GET /api/v1/admin/accounting/journal-entries/manual
   */
  getManualEntries: async (): Promise<JournalEntryResponse[]> => {
    const res = await api.get<CustomApiResponse<JournalEntryResponse[]>>('/admin/accounting/journal-entries/manual');
    return res.data.data;
  },

  /**
   * P&L for a period
   * GET /api/v1/admin/accounting/income-statement?startDate=&endDate=
   */
  getIncomeStatement: async (startDate: string, endDate: string): Promise<IncomeStatementResponse> => {
    const res = await api.get<CustomApiResponse<IncomeStatementResponse>>('/admin/accounting/income-statement', {
      params: { startDate, endDate }
    });
    return res.data.data;
  },

  /**
   * daily cash movements
   * GET /api/v1/admin/accounting/cash-flow?startDate=&endDate=
   */
  getCashFlow: async (startDate: string, endDate: string): Promise<CashFlowResponse> => {
    const res = await api.get<CustomApiResponse<CashFlowResponse>>('/admin/accounting/cash-flow', {
      params: { startDate, endDate }
    });
    return res.data.data;
  },

  /**
   * assets vs liabilities
   * GET /api/v1/admin/accounting/balance-sheet
   */
  getBalanceSheet: async (): Promise<BalanceSheetResponse> => {
    const res = await api.get<CustomApiResponse<BalanceSheetResponse>>('/admin/accounting/balance-sheet');
    return res.data.data;
  }
};
