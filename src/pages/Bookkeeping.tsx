import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { bookkeepingService } from '../services/bookkeepingService';
import { accountingService } from '../services/accountingService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Dropdown } from '../components/Dropdown';
import { 
  EntryType, 
  JournalEntryLineType, 
  AccountCategory,
  ManualJournalEntryRequest,
  JournalEntryLineRequest,
  EnumResponse
} from '../types';
import { Plus, Trash2 } from 'lucide-react';

export const Bookkeeping = () => {
  const [description, setDescription] = useState('');
  const [entryType, setEntryType] = useState<EntryType>(EntryType.ADJUSTMENT);
  const [lines, setLines] = useState<JournalEntryLineRequest[]>([
    { accountCategory: AccountCategory.CASH, entryType: JournalEntryLineType.DEBIT, amount: 0, description: '' },
    { accountCategory: AccountCategory.SALES_REVENUE, entryType: JournalEntryLineType.CREDIT, amount: 0, description: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [accountCategoryOptions, setAccountCategoryOptions] = useState<EnumResponse[]>([]);
  const [entryTypeOptions, setEntryTypeOptions] = useState<EnumResponse[]>([]);

  useEffect(() => {
    accountingService.getMetadata()
      .then(meta => {
        setAccountCategoryOptions(meta.accountCategories);
        setEntryTypeOptions(meta.journalEntryTypes);
        if (meta.journalEntryTypes.length > 0) {
          setEntryType(meta.journalEntryTypes[0].value as EntryType);
        }
        if (meta.accountCategories.length > 0) {
          setLines([
            { accountCategory: meta.accountCategories[0].value as AccountCategory, entryType: JournalEntryLineType.DEBIT, amount: 0, description: '' },
            { accountCategory: meta.accountCategories[0].value as AccountCategory, entryType: JournalEntryLineType.CREDIT, amount: 0, description: '' }
          ]);
        }
      })
      .catch(() => {
        toast.error('Failed to load accounting options.');
      });
  }, []);

  const handleAddLine = () => {
    setLines([
      ...lines,
      { accountCategory: (accountCategoryOptions[0]?.value || AccountCategory.MISCELLANEOUS_EXPENSE) as AccountCategory, entryType: JournalEntryLineType.DEBIT, amount: 0, description: '' }
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) {
      toast.error('A journal entry requires at least two lines.');
      return;
    }
    const newLines = [...lines];
    newLines.splice(index, 1);
    setLines(newLines);
  };

  const handleLineChange = (index: number, field: keyof JournalEntryLineRequest, value: any) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setLines(newLines);
  };

  const resetForm = () => {
    setDescription('');
    setEntryType((entryTypeOptions[0]?.value || EntryType.ADJUSTMENT) as EntryType);
    setLines([
      { accountCategory: (accountCategoryOptions[0]?.value || AccountCategory.CASH) as AccountCategory, entryType: JournalEntryLineType.DEBIT, amount: 0, description: '' },
      { accountCategory: (accountCategoryOptions[0]?.value || AccountCategory.SALES_REVENUE) as AccountCategory, entryType: JournalEntryLineType.CREDIT, amount: 0, description: '' }
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error('Please provide a description for the entry.');
      return;
    }
    
    // Validate debits vs credits
    const totalDebits = lines.filter(l => l.entryType === JournalEntryLineType.DEBIT).reduce((sum, l) => sum + l.amount, 0);
    const totalCredits = lines.filter(l => l.entryType === JournalEntryLineType.CREDIT).reduce((sum, l) => sum + l.amount, 0);
    
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      toast.error(`Total debits (${totalDebits}) must equal total credits (${totalCredits}).`);
      return;
    }

    if (totalDebits === 0) {
      toast.error('Entry amount cannot be 0.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: ManualJournalEntryRequest = {
        description,
        type: entryType,
        lines: lines.map(l => ({ ...l, amount: Number(l.amount) }))
      };
      await bookkeepingService.recordManualEntry(payload);
      toast.success('Manual journal entry recorded successfully.');
      resetForm();
    } catch (error: any) {
      toast.error(error?.response?.data?.description || 'Failed to record entry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold dark:text-white">Bookkeeping</h1>
        <p className="text-sm text-zinc-500 mt-1">Record manual journal entries to adjust ledgers.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <Input
              label="Description / Reference"
              placeholder="e.g., Monthly depreciation"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-zinc-400">
                Entry Type
              </label>
              <Dropdown
                value={entryType}
                onChange={(val) => setEntryType(val as EntryType)}
                options={entryTypeOptions.length > 0 ? entryTypeOptions : Object.values(EntryType).map((type) => ({ label: type, value: type }))}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold dark:text-white">Entry Lines</h2>
              <Button type="button" variant="outline" onClick={handleAddLine} className="h-9 gap-2">
                <Plus className="h-4 w-4" /> Add Line
              </Button>
            </div>

            <div className="space-y-4">
              {lines.map((line, index) => (
                <div key={index} className="flex gap-4 items-start bg-[#F9F9F9] dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 items-start">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-zinc-400">Account</label>
                      <Dropdown
                        value={line.accountCategory}
                        onChange={(val) => handleLineChange(index, 'accountCategory', val as AccountCategory)}
                        options={accountCategoryOptions.length > 0 ? accountCategoryOptions : Object.values(AccountCategory).map((cat) => ({ label: cat, value: cat }))}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5 min-w-0">
                      <label className="text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-zinc-400">D/C</label>
                      <Dropdown
                        value={line.entryType}
                        onChange={(val) => handleLineChange(index, 'entryType', val as JournalEntryLineType)}
                        options={[
                          { label: 'Debit', value: JournalEntryLineType.DEBIT },
                          { label: 'Credit', value: JournalEntryLineType.CREDIT }
                        ]}
                      />
                    </div>

                    <Input
                      label="Amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.amount === 0 ? '' : line.amount.toString()}
                      onChange={(e) => handleLineChange(index, 'amount', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      required
                    />

                    <Input
                      label="Line Description"
                      type="text"
                      value={line.description || ''}
                      onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                      placeholder="Optional note"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveLine(index)}
                    className="p-2 mt-6 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-4">
              <div className="flex items-center gap-8 bg-zinc-50 dark:bg-zinc-950 px-6 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div className="text-right">
                  <p className="text-xs text-zinc-500 font-medium">Total Debits</p>
                  <p className="text-lg font-bold text-accent-dark">
                    {lines.filter(l => l.entryType === JournalEntryLineType.DEBIT).reduce((s, l) => s + l.amount, 0).toFixed(2)}
                  </p>
                </div>
                <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800"></div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500 font-medium">Total Credits</p>
                  <p className="text-lg font-bold text-accent-dark">
                    {lines.filter(l => l.entryType === JournalEntryLineType.CREDIT).reduce((s, l) => s + l.amount, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Record Entry
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
