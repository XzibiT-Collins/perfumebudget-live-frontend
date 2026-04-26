import React, { useState, useEffect } from 'react';
import { AdminTable } from '../components/AdminTable';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { categoryService } from '../services/categoryService';
import type { CategoryResponse } from '../types';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../utils';

export const CategoryManagement = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ categoryName: '', description: '' });
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    categoryService.getAll()
      .then(setCategories)
      .catch(() => toast.error('Failed to load categories'))
      .finally(() => setIsLoading(false));
  }, []);

  const openModal = (category?: CategoryResponse) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ categoryName: category.categoryName, description: category.description });
    } else {
      setEditingCategory(null);
      setFormData({ categoryName: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingCategory) {
        const updated = await categoryService.update(editingCategory.categoryId, formData);
        setCategories((prev) => prev.map((c) => (c.categoryId === updated.categoryId ? updated : c)));
        toast.success('Category updated');
      } else {
        const created = await categoryService.create(formData);
        setCategories((prev) => [...prev, created]);
        toast.success('Category created');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to save category'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (category: CategoryResponse) => {
    setCategoryToDelete(category);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    try {
      await categoryService.delete(categoryToDelete.categoryId);
      setCategories((prev) => prev.filter((c) => c.categoryId !== categoryToDelete.categoryId));
      toast.success('Category deleted');
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to delete category'));
    } finally {
      setIsDeleting(false);
      setCategoryToDelete(null);
    }
  };

  const columns = [
    { header: 'Name', accessor: (c: CategoryResponse) => c.categoryName },
    { header: 'Slug', accessor: (c: CategoryResponse) => c.slug },
    { header: 'Description', accessor: (c: CategoryResponse) => c.description || '—' },
  ];

  return (
    <>
      <AdminTable
        title="Categories"
        data={categories}
        columns={columns}
        onAdd={() => openModal()}
        onEdit={(c) => openModal(c)}
        onDelete={handleDeleteClick}
        isLoading={isLoading}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Category Name"
            value={formData.categoryName}
            onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
            required
          />
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">
              Description
            </label>
            <textarea
              className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-zinc-800 dark:text-white rounded-xl text-sm border-none focus:ring-1 focus:ring-accent min-h-[100px] outline-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <Button type="submit" className="w-full h-12 rounded-2xl" isLoading={isSaving}>
            {editingCategory ? 'Save Changes' : 'Create Category'}
          </Button>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={
          <>
            Are you sure you want to delete the category <strong>{categoryToDelete?.categoryName}</strong>? This action cannot be undone.
          </>
        }
        confirmLabel="Delete Category"
        isLoading={isDeleting}
      />
    </>
  );
};
