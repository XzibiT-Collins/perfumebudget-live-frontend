import React, { useState, useEffect } from 'react';
import { AdminTable } from '../components/AdminTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Checkbox } from '../components/Checkbox';
import { taxService } from '../services/taxService';
import type { TaxResponse, TaxRequest } from '../types';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../utils';

const emptyForm: TaxRequest = {
  name: '',
  code: '',
  rate: 0,
  applyOrder: 1,
  isActive: true,
  isCompound: false,
};

export const TaxManagement = () => {
  const [taxes, setTaxes] = useState<TaxResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create / Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState<TaxResponse | null>(null);
  const [formData, setFormData] = useState<TaxRequest>(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirm
  const [deletingTax, setDeletingTax] = useState<TaxResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadTaxes();
  }, []);

  const loadTaxes = () => {
    setIsLoading(true);
    taxService
      .getAll()
      .then(setTaxes)
      .catch(() => toast.error('Failed to load taxes'))
      .finally(() => setIsLoading(false));
  };

  const setField = <K extends keyof TaxRequest>(key: K, value: TaxRequest[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const openCreate = () => {
    setEditingTax(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (tax: TaxResponse) => {
    setEditingTax(tax);
    setFormData({
      name: tax.name,
      code: tax.code,
      rate: tax.rate,
      applyOrder: tax.applyOrder,
      isActive: tax.isActive,
      isCompound: tax.isCompound,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: TaxRequest = {
        ...formData,
        rate: Number(formData.rate),
        applyOrder: Number(formData.applyOrder),
      };

      if (editingTax) {
        const updated = await taxService.update(editingTax.id, payload);
        setTaxes((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        toast.success('Tax updated');
      } else {
        const created = await taxService.create(payload);
        setTaxes((prev) => [created, ...prev]);
        toast.success('Tax created');
      }

      setIsModalOpen(false);
      setFormData(emptyForm);
      setEditingTax(null);
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to save tax'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTax) return;
    setIsDeleting(true);
    try {
      await taxService.delete(deletingTax.id);
      setTaxes((prev) => prev.filter((t) => t.id !== deletingTax.id));
      toast.success('Tax deleted');
      setDeletingTax(null);
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to delete tax'));
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Name',
      accessor: (t: TaxResponse) => (
        <span className="font-semibold dark:text-white">{t.name}</span>
      ),
    },
    {
      header: 'Code',
      accessor: (t: TaxResponse) => (
        <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg">
          {t.code}
        </span>
      ),
    },
    {
      header: 'Rate (%)',
      accessor: (t: TaxResponse) => (
        <span className="font-semibold dark:text-white">{t.rate}%</span>
      ),
    },
    {
      header: 'Order',
      accessor: (t: TaxResponse) => t.applyOrder,
    },
    {
      header: 'Compound',
      accessor: (t: TaxResponse) => (
        <Badge variant={t.isCompound ? 'info' : 'default'}>
          {t.isCompound ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: (t: TaxResponse) => (
        <Badge variant={t.isActive ? 'success' : 'default'}>
          {t.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const filteredTaxes = searchQuery.trim()
    ? taxes.filter(
        (t) =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : taxes;

  return (
    <>
      <AdminTable
        title="Taxes"
        data={filteredTaxes}
        columns={columns}
        onAdd={openCreate}
        onEdit={(t) => openEdit(t as TaxResponse)}
        onDelete={(t) => setDeletingTax(t as TaxResponse)}
        isLoading={isLoading}
        searchPlaceholder="Search by name or code…"
        onSearch={(q) => setSearchQuery(q)}
      />

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTax(null);
        }}
        title={editingTax ? 'Edit Tax' : 'Create Tax'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tax Name"
              placeholder="e.g. VAT"
              value={formData.name}
              onChange={(e) => setField('name', e.target.value)}
              required
            />
            <Input
              label="Tax Code"
              placeholder="e.g. VAT_15"
              value={formData.code}
              onChange={(e) => setField('code', e.target.value.toUpperCase())}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Rate (%)"
              type="number"
              step="0.001"
              min="0"
              placeholder="e.g. 15"
              value={formData.rate.toString()}
              onChange={(e) => setField('rate', parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label="Apply Order"
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={formData.applyOrder.toString()}
              onChange={(e) => setField('applyOrder', parseInt(e.target.value, 10) || 1)}
              required
            />
          </div>

          <div className="flex items-center gap-6 pt-1">
            <Checkbox
              checked={formData.isActive ?? true}
              onChange={(v) => setField('isActive', v)}
              label="Active"
            />
            <Checkbox
              checked={formData.isCompound ?? false}
              onChange={(v) => setField('isCompound', v)}
              label="Compound (applied on top of other taxes)"
            />
          </div>

          <Button type="submit" className="w-full h-12 rounded-2xl" isLoading={isSaving}>
            {editingTax ? 'Update Tax' : 'Create Tax'}
          </Button>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deletingTax}
        onClose={() => setDeletingTax(null)}
        onConfirm={handleDelete}
        title="Delete Tax"
        message={
          deletingTax
            ? `Are you sure you want to delete "${deletingTax.name}" (${deletingTax.code})? This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        isLoading={isDeleting}
        isDestructive={true}
      />
    </>
  );
};
