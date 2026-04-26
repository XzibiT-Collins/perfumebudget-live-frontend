import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { accountingService } from '../services/accountingService';
import { 
  LedgerSummaryResponse, 
  IncomeStatementResponse, 
  BalanceSheetResponse, 
  CashFlowResponse,
  JournalEntryResponse
} from '../types';
import { AdminTable } from '../components/AdminTable';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Dropdown } from '../components/Dropdown';
import { DollarSign, TrendingDown, TrendingUp, Briefcase } from 'lucide-react';
import { formatPrice } from '../utils';

// Format helper
const fmt = (val: number | undefined) => formatPrice(val || 0);

export const Accounting = () => {
  const [activeTab, setActiveTab] = useState<'summary' | 'journal' | 'income' | 'balance' | 'cashflow'>('summary');
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  // States for different endpoints
  const [summary, setSummary] = useState<LedgerSummaryResponse | null>(null);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatementResponse | null>(null);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetResponse | null>(null);
  const [cashFlow, setCashFlow] = useState<CashFlowResponse | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntryResponse[]>([]);

  // Sub-tabs for Journal
  const [journalType, setJournalType] = useState<'all' | 'manual' | 'reference'>('all');
  const [referenceType, setReferenceType] = useState('ORDER');
  const [referenceId, setReferenceId] = useState('');

  // Fetch logic based on active tab
  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'summary') {
        const data = await accountingService.getSummary();
        setSummary(data);
      } else if (activeTab === 'income') {
        const data = await accountingService.getIncomeStatement(startDate, endDate);
        setIncomeStatement(data);
      } else if (activeTab === 'balance') {
        const data = await accountingService.getBalanceSheet();
        setBalanceSheet(data);
      } else if (activeTab === 'cashflow') {
        const data = await accountingService.getCashFlow(startDate, endDate);
        setCashFlow(data);
      } else if (activeTab === 'journal') {
        if (journalType === 'all') {
          const data = await accountingService.getJournalEntries(startDate, endDate);
          setJournalEntries(data);
        } else if (journalType === 'manual') {
          const data = await accountingService.getManualEntries();
          setJournalEntries(data);
        } else if (journalType === 'reference' && referenceId) {
          const data = await accountingService.getEntriesByReference(referenceType, referenceId);
          setJournalEntries(data);
        }
      }
    } catch (error: any) {
      toast.error('Failed to load accounting data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, journalType]);

  const MetricCard = ({ title, value, icon: Icon, isPositive }: any) => (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-zinc-500 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${isPositive === true ? 'text-green-500' : isPositive === false ? 'text-red-500' : 'text-zinc-900 dark:text-white'}`}>
          {value}
        </p>
      </div>
      <div className="h-12 w-12 rounded-full bg-[#F5F5F5] dark:bg-zinc-800 flex items-center justify-center">
        <Icon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
      </div>
    </div>
  );

  const renderSummary = () => {
    if (!summary) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          <MetricCard title="Total Revenue" value={fmt(summary.totalRevenue)} icon={TrendingUp} isPositive={true} />
          <MetricCard title="Total Expenses" value={fmt(summary.totalExpenses)} icon={TrendingDown} isPositive={false} />
          <MetricCard title="Net Profit" value={fmt(summary.netProfit)} icon={DollarSign} isPositive={(summary.netProfit || 0) >= 0} />
          <MetricCard title="Total Assets" value={fmt(summary.totalAssets)} icon={Briefcase} />
          <MetricCard title="Total Liabilities" value={fmt(summary.totalLiabilities)} icon={Briefcase} isPositive={false} />
          <MetricCard title="Cash Balance" value={fmt(summary.cashBalance)} icon={DollarSign} />
        </div>
      </div>
    );
  };

  const renderIncomeStatement = () => {
    if (!incomeStatement) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <MetricCard title="Gross Profit" value={fmt(incomeStatement.grossProfit)} icon={TrendingUp} />
          <MetricCard title="Net Profit" value={fmt(incomeStatement.netProfit)} icon={DollarSign} isPositive={(incomeStatement.netProfit || 0) >= 0} />
          <MetricCard title="Total Revenue" value={fmt(incomeStatement.totalRevenue)} icon={TrendingUp} isPositive={true} />
          <MetricCard title="Total Expenses" value={fmt(incomeStatement.totalExpenses)} icon={TrendingDown} isPositive={false} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold dark:text-white mb-4">Revenue Accounts</h3>
            <div className="space-y-3">
              {incomeStatement.revenueAccounts?.map(acc => (
                <div key={acc.accountCode} className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <span className="text-sm dark:text-zinc-300">{acc.accountName}</span>
                  <span className="text-sm font-semibold dark:text-white">{fmt(acc.balance)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold dark:text-white mb-4">Expense Accounts</h3>
            <div className="space-y-3">
              {incomeStatement.expenseAccounts?.map(acc => (
                <div key={acc.accountCode} className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <span className="text-sm dark:text-zinc-300">{acc.accountName}</span>
                  <span className="text-sm font-semibold dark:text-white">{fmt(acc.balance)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBalanceSheet = () => {
    if (!balanceSheet) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          <MetricCard title="Total Assets" value={fmt(balanceSheet.totalAssets)} icon={Briefcase} />
          <MetricCard title="Total Liabilities" value={fmt(balanceSheet.totalLiabilities)} icon={Briefcase} />
          <MetricCard title="Total Equity" value={fmt(balanceSheet.totalEquity)} icon={Briefcase} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {['Assets', 'Liabilities', 'Equity'].map((type, idx) => {
            const accounts = idx === 0 ? balanceSheet.assetAccounts : idx === 1 ? balanceSheet.liabilityAccounts : balanceSheet.equityAccounts;
            return (
              <div key={type} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <h3 className="text-lg font-bold dark:text-white mb-4">{type}</h3>
                <div className="space-y-3">
                  {accounts?.map(acc => (
                    <div key={acc.accountCode} className="flex justify-between border-b border-zinc-100 dark:border-zinc-800 pb-2">
                      <span className="text-sm dark:text-zinc-300">{acc.accountName}</span>
                      <span className="text-sm font-semibold dark:text-white">{fmt(acc.balance)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCashFlow = () => {
    if (!cashFlow) return null;
    const columns = [
      { header: 'Date', accessor: (row: any) => new Date(row.date).toLocaleDateString() },
      { header: 'Inflow', accessor: (row: any) => <span className="text-green-500">{fmt(row.inflow)}</span> },
      { header: 'Outflow', accessor: (row: any) => <span className="text-red-500">{fmt(row.outflow)}</span> },
      { header: 'Net', accessor: (row: any) => <span className="font-bold">{fmt(row.net)}</span> },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          <MetricCard title="Total Inflows" value={fmt(cashFlow.totalInflows)} icon={TrendingUp} isPositive={true} />
          <MetricCard title="Total Outflows" value={fmt(cashFlow.totalOutflows)} icon={TrendingDown} isPositive={false} />
          <MetricCard title="Net Cash Flow" value={fmt(cashFlow.netCashFlow)} icon={DollarSign} isPositive={(cashFlow.netCashFlow || 0) >= 0} />
        </div>
        <AdminTable
          title="Daily Cash Flows"
          data={cashFlow.dailyCashFlows || []}
          columns={columns}
          isLoading={false}
        />
      </div>
    );
  };

  const renderJournalEntries = () => {
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          {['all', 'manual', 'reference'].map((type) => (
            <button
              key={type}
              onClick={() => setJournalType(type as any)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${journalType === type ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
        
        {journalType === 'reference' && (
          <div className="flex items-end gap-4 bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl">
            <div className="flex flex-col gap-1.5 w-48">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-zinc-400">Ref Type</label>
              <Dropdown
                value={referenceType}
                onChange={(val) => setReferenceType(val)}
                options={[
                  { label: 'ORDER', value: 'ORDER' },
                  { label: 'PAYMENT', value: 'PAYMENT' },
                  { label: 'REFUND', value: 'REFUND' }
                ]}
              />
            </div>
            <Input
              label="Reference ID"
              placeholder="e.g. ORD-123"
              value={referenceId}
              onChange={(e) => setReferenceId(e.target.value)}
            />
            <Button onClick={fetchData} className="h-11 w-32">Search</Button>
          </div>
        )}

        <div className="grid gap-4">
          {journalEntries.map((entry) => (
            <div key={entry.entryNumber} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h4 className="font-bold dark:text-white text-lg">{entry.entryNumber} • {entry.type}</h4>
                  <p className="text-sm text-zinc-500">{entry.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-zinc-500">{new Date(entry.transactionDate || '').toLocaleString()}</p>
                  {entry.referenceId && <p className="text-sm font-medium dark:text-zinc-300">Ref: {entry.referenceType} {entry.referenceId}</p>}
                </div>
              </div>
              
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-500">
                    <th className="pb-2 font-medium">Account</th>
                    <th className="pb-2 font-medium">Description</th>
                    <th className="pb-2 font-medium text-right">Debit</th>
                    <th className="pb-2 font-medium text-right">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {entry.lines?.map((line, idx) => (
                    <tr key={idx}>
                      <td className="py-2 dark:text-zinc-300 font-medium">{line.accountName}</td>
                      <td className="py-2 text-zinc-500">{line.description}</td>
                      <td className="py-2 text-right font-medium dark:text-white">{line.entryType === 'DEBIT' ? fmt(line.amount) : ''}</td>
                      <td className="py-2 text-right font-medium dark:text-white">{line.entryType === 'CREDIT' ? fmt(line.amount) : ''}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={2} className="py-2 text-right font-bold dark:text-white">Total</td>
                    <td className="py-2 text-right font-bold text-accent-dark">
                      {fmt(entry.lines?.filter(l => l.entryType === 'DEBIT').reduce((s, l) => s + (l.amount || 0), 0))}
                    </td>
                    <td className="py-2 text-right font-bold text-accent-dark">
                        {fmt(entry.lines?.filter(l => l.entryType === 'CREDIT').reduce((s, l) => s + (l.amount || 0), 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ))}
          {journalEntries.length === 0 && !isLoading && (
            <div className="text-center py-12 text-zinc-500 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              No journal entries found.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Accounting</h1>
          <p className="text-sm text-zinc-500 mt-1">Real-time ledger and financial statements.</p>
        </div>

        {/* Date Filter available for income, cashflow, and journal(all) tabs */}
        {['income', 'cashflow', 'journal'].includes(activeTab) && !(activeTab === 'journal' && journalType !== 'all') && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 bg-white dark:bg-zinc-900 p-3 sm:p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full md:w-auto">
            <div className="flex gap-3 w-full">
              <Input label="Start Date" type="date" value={startDate} min={new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T')[0]} max={endDate || new Date().toISOString().split('T')[0]} onChange={(e) => setStartDate(e.target.value)} containerClassName="flex-1" />
              <Input label="End Date" type="date" value={endDate} min={startDate || new Date(new Date().setFullYear(new Date().getFullYear() - 5)).toISOString().split('T')[0]} max={new Date().toISOString().split('T')[0]} onChange={(e) => setEndDate(e.target.value)} containerClassName="flex-1" />
            </div>
            <Button onClick={fetchData} className="w-full sm:w-24 h-11 shrink-0 mt-1 sm:mt-0">Filter</Button>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'summary', label: 'Summary' },
          { id: 'income', label: 'Income Statement' },
          { id: 'balance', label: 'Balance Sheet' },
          { id: 'cashflow', label: 'Cash Flow' },
          { id: 'journal', label: 'Journal Entries' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          {activeTab === 'summary' && renderSummary()}
          {activeTab === 'income' && renderIncomeStatement()}
          {activeTab === 'balance' && renderBalanceSheet()}
          {activeTab === 'cashflow' && renderCashFlow()}
          {activeTab === 'journal' && renderJournalEntries()}
        </div>
      )}
    </div>
  );
};
