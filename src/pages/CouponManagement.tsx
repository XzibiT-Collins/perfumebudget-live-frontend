import React, { useState, useEffect } from 'react';
import { AdminTable } from '../components/AdminTable';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { couponService } from '../services/couponService';
import type { CouponListResponse, CouponDiscountType } from '../types';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../utils';
import { Dropdown } from '../components/Dropdown';
import { Checkbox } from '../components/Checkbox';

const emptyForm = {
  couponCode: '',
  discountType: 'PERCENTAGE' as CouponDiscountType,
  discountValue: '',
  maximumDiscountAmount: '',
  minimumCartAmountForDiscount: '',
  usageLimit: '',
  isActive: true,
  startDate: '',
  expirationDate: '',
};

export const CouponManagement = () => {
  const [coupons, setCoupons] = useState<CouponListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    couponService.getAll()
      .then((res) => setCoupons(res.content))
      .catch(() => toast.error('Failed to load coupons'))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const code = formData.couponCode.trim();
      const created = await couponService.create({
        couponCode: code || undefined,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        maximumDiscountAmount: parseFloat(formData.maximumDiscountAmount),
        minimumCartAmountForDiscount: parseFloat(formData.minimumCartAmountForDiscount),
        usageLimit: parseInt(formData.usageLimit, 10),
        isActive: formData.isActive,
        startDate: formData.startDate,
        expirationDate: formData.expirationDate,
      });
      // Add new coupon to list (simplified from CouponDetailResponse → CouponListResponse shape)
      setCoupons((prev) => [
        {
          couponId: created.couponId,
          couponCode: created.couponCode,
          isActive: created.isActive,
          discountType: created.discountType,
          usageLimit: created.usageLimit,
          usageCount: created.usageCount,
        },
        ...prev,
      ]);
      toast.success('Coupon created');
      setIsModalOpen(false);
      setFormData(emptyForm);
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to create coupon'));
    } finally {
      setIsSaving(false);
    }
  };

  const setField = (key: keyof typeof emptyForm, value: any) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const columns = [
    {
      header: 'Code',
      accessor: (c: CouponListResponse) => (
        <span className="font-mono font-bold dark:text-white">{c.couponCode}</span>
      ),
    },
    { header: 'Type', accessor: (c: CouponListResponse) => c.discountType },
    {
      header: 'Usage',
      accessor: (c: CouponListResponse) => `${c.usageCount} / ${c.usageLimit}`,
    },
    {
      header: 'Status',
      accessor: (c: CouponListResponse) => (
        <Badge variant={c.isActive ? 'success' : 'default'}>
          {c.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <AdminTable
        title="Coupons"
        data={coupons}
        columns={columns}
        onAdd={() => setIsModalOpen(true)}
        onEdit={() => toast.error('Edit not supported by API')}
        onDelete={() => toast.error('Delete not supported by API')}
        isLoading={isLoading}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Coupon">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Coupon Code (leave blank to auto-generate)"
            placeholder="e.g. SUMMER50"
            value={formData.couponCode}
            onChange={(e) => setField('couponCode', e.target.value.toUpperCase())}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">
                Discount Type
              </label>
              <Dropdown
                value={formData.discountType}
                onChange={(val) => setField('discountType', val as CouponDiscountType)}
                options={[
                  { label: 'Percentage (%)', value: 'PERCENTAGE' },
                  { label: 'Flat Amount', value: 'FLAT' },
                ]}
              />
            </div>
            <Input
              label="Discount Value"
              type="number"
              step="0.01"
              placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '5.00'}
              value={formData.discountValue}
              onChange={(e) => setField('discountValue', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Discount Amount"
              type="number"
              step="0.01"
              value={formData.maximumDiscountAmount}
              onChange={(e) => setField('maximumDiscountAmount', e.target.value)}
              required
            />
            <Input
              label="Min Cart Amount"
              type="number"
              step="0.01"
              value={formData.minimumCartAmountForDiscount}
              onChange={(e) => setField('minimumCartAmountForDiscount', e.target.value)}
              required
            />
          </div>

          <Input
            label="Usage Limit"
            type="number"
            value={formData.usageLimit}
            onChange={(e) => setField('usageLimit', e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setField('startDate', e.target.value)}
              required
            />
            <Input
              label="Expiration Date"
              type="date"
              value={formData.expirationDate}
              onChange={(e) => setField('expirationDate', e.target.value)}
              required
            />
          </div>

          <Checkbox
            checked={formData.isActive}
            onChange={(v) => setField('isActive', v)}
            label="Active immediately"
          />

          <Button type="submit" className="w-full h-12 rounded-2xl" isLoading={isSaving}>
            Create Coupon
          </Button>
        </form>
      </Modal>
    </>
  );
};
