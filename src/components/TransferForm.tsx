import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Dropdown } from './Dropdown';
import { ProductPicker } from './ProductPicker';
import locationInventoryService from '../services/locationInventoryService';
import type {
  ProductListing,
  StockByLocationResponse,
  StockTransferResponse,
  StorageLocationResponse,
} from '../types';
import { extractErrorMessage } from '../utils';
import toast from 'react-hot-toast';

interface TransferFormProps {
  /** Pre-selected product. When set, the product picker is hidden. */
  fixedProduct?: { productId: number; productName: string };
  /** Active storage locations to choose from. */
  locations: StorageLocationResponse[];
  /** Called after a transfer is recorded successfully. */
  onSuccess?: (transfer: StockTransferResponse) => void;
}

export const TransferForm = ({ fixedProduct, locations, onSuccess }: TransferFormProps) => {
  const [picked, setPicked] = useState<ProductListing | null>(null);
  const [stock, setStock] = useState<StockByLocationResponse | null>(null);
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const productId = fixedProduct ? fixedProduct.productId : picked?.productId ?? null;
  const productName = fixedProduct ? fixedProduct.productName : picked?.productName ?? '';

  // Load stock-by-location whenever the active product changes (for on-hand hints).
  useEffect(() => {
    if (productId == null) {
      setStock(null);
      return;
    }
    let cancelled = false;
    locationInventoryService
      .getStockByLocation(productId)
      .then((res) => {
        if (!cancelled) setStock(res);
      })
      .catch(() => {
        if (!cancelled) setStock(null);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const onHandAt = (locId: string): number | null => {
    if (!stock || !locId) return null;
    const entry = stock.locations.find((l) => String(l.locationId) === locId);
    return entry ? entry.quantityOnHand : 0;
  };

  const locationOptions = [
    { label: 'Select location...', value: '' },
    ...locations.map((l) => ({ label: l.name, value: String(l.id) })),
  ];

  const reset = () => {
    setQuantity('');
    setNote('');
    setFromId('');
    setToId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (productId == null) {
      toast.error('Select a product to transfer');
      return;
    }
    if (!fromId || !toId) {
      toast.error('Choose both a source and a destination location');
      return;
    }
    if (fromId === toId) {
      toast.error('Source and destination locations must differ.');
      return;
    }
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      toast.error('Quantity must be a whole number of at least 1');
      return;
    }

    setIsSubmitting(true);
    try {
      const transfer = await locationInventoryService.createTransfer({
        productId,
        fromLocationId: Number(fromId),
        toLocationId: Number(toId),
        quantity: qty,
        note: note.trim() || undefined,
      });
      toast.success('Stock transfer recorded');
      reset();
      // refresh on-hand hints
      locationInventoryService.getStockByLocation(productId).then(setStock).catch(() => {});
      onSuccess?.(transfer);
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Failed to record transfer'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const sourceOnHand = onHandAt(fromId);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {!fixedProduct && (
        <ProductPicker selected={picked} onSelect={setPicked} label="Product" />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:items-end">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-zinc-400 mb-1.5">
            From
          </label>
          <Dropdown value={fromId} onChange={setFromId} options={locationOptions} />
        </div>
        <div className="hidden sm:flex items-center justify-center pb-2.5 text-[#999999]">
          <ArrowRight className="h-5 w-5" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-zinc-400 mb-1.5">
            To
          </label>
          <Dropdown value={toId} onChange={setToId} options={locationOptions} />
        </div>
      </div>

      <div>
        <Input
          label="Quantity"
          type="number"
          min="1"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          max={sourceOnHand != null && sourceOnHand > 0 ? sourceOnHand : undefined}
          required
        />
        {fromId && sourceOnHand != null && (
          <p
            className={`text-[11px] mt-1.5 ${
              sourceOnHand < 0 ? 'text-red-500 font-semibold' : 'text-[#999999]'
            }`}
          >
            On hand at source: {sourceOnHand < 0 ? `${sourceOnHand} (needs transfer record)` : sourceOnHand}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#666666] dark:text-zinc-400 mb-2">
          Note (optional)
        </label>
        <textarea
          className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-zinc-800 dark:text-white rounded-xl text-sm border-none focus:ring-1 focus:ring-accent min-h-[72px] outline-none custom-scrollbar"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Restocking floor before weekend"
        />
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full h-12 rounded-2xl">
        Record Transfer{productName ? ` — ${productName}` : ''}
      </Button>
    </form>
  );
};
