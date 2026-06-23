import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Box, Plus, History, List, Settings2, Tag, Percent, Calendar, Warehouse, ArrowLeftRight, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { Dropdown } from '../components/Dropdown';
import { Modal } from '../components/Modal';
import { ConfirmModal } from '../components/ConfirmModal';
import { TransferForm } from '../components/TransferForm';
import { productService } from '../services/productService';
import inventoryService from '../services/inventoryService';
import locationInventoryService from '../services/locationInventoryService';
import type {
  ProductDetails,
  ConversionResponse,
  ProductVariantSummaryResponse,
  InventorySummaryResponse,
  InventoryMovementResponse,
  InventoryReceiptRequest,
  InventoryAdjustmentRequest,
  StockByLocationResponse,
  StockTransferResponse,
  StorageLocationResponse
} from '../types';
import toast from 'react-hot-toast';

export const AdminProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Conversion State
  const [isConversionModalOpen, setIsConversionModalOpen] = useState(false);
  const [conversionTab, setConversionTab] = useState<'FORWARD' | 'REVERSE'>('FORWARD');
  const [conversionQuantity, setConversionQuantity] = useState('');
  const [targetProductId, setTargetProductId] = useState('');
  const [targetVariants, setTargetVariants] = useState<ProductVariantSummaryResponse[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSummary, setConversionSummary] = useState<ConversionResponse | null>(null);

  // Inventory State
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const [inventorySummary, setInventorySummary] = useState<InventorySummaryResponse | null>(null);
  const [inventoryHistory, setInventoryHistory] = useState<InventoryMovementResponse[]>([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);

  // Stock-by-location state
  const [stockByLocation, setStockByLocation] = useState<StockByLocationResponse | null>(null);
  const [isStockByLocationLoading, setIsStockByLocationLoading] = useState(false);
  const [activeLocations, setActiveLocations] = useState<StorageLocationResponse[]>([]);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isTransferHistoryOpen, setIsTransferHistoryOpen] = useState(false);
  const [transferHistory, setTransferHistory] = useState<StockTransferResponse[]>([]);
  const [isTransferHistoryLoading, setIsTransferHistoryLoading] = useState(false);

  // Form states
  const [receiptForm, setReceiptForm] = useState<Partial<InventoryReceiptRequest>>({
    quantity: 1,
    reference: '',
    note: '',
  });

  const [adjustmentForm, setAdjustmentForm] = useState<Partial<InventoryAdjustmentRequest>>({
    direction: 'INCREASE',
    quantity: 1,
    reason: '',
    reference: '',
    note: '',
  });

  // Discount states
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isConfirmClearDiscountOpen, setIsConfirmClearDiscountOpen] = useState(false);
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FLAT'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState('');
  const [discountStart, setDiscountStart] = useState('');
  const [discountEnd, setDiscountEnd] = useState('');
  const [isSettingDiscount, setIsSettingDiscount] = useState(false);
  const [isClearingDiscount, setIsClearingDiscount] = useState(false);

  const loadProduct = () => {
    if (!productId) return;
    setIsLoading(true);
    productService
      .getById(Number(productId))
      .then(setProduct)
      .catch(() => {
        toast.error('Product not found');
        navigate('/admin/products', { replace: true });
      })
      .finally(() => setIsLoading(false));
  };

  const loadInventorySummary = async () => {
    if (!product) return;
    setIsInventoryLoading(true);
    try {
      const res = await inventoryService.getInventorySummary(product.productId);
      setInventorySummary(res.data);
    } catch (err) {
      toast.error('Failed to load inventory summary');
    } finally {
      setIsInventoryLoading(false);
    }
  };

  const loadInventoryHistory = async () => {
    if (!product) return;
    setIsInventoryLoading(true);
    try {
      const res = await inventoryService.getInventoryHistory(product.productId);
      setInventoryHistory(res.data);
    } catch (err) {
      toast.error('Failed to load inventory history');
    } finally {
      setIsInventoryLoading(false);
    }
  };

  const loadStockByLocation = async () => {
    if (!productId) return;
    setIsStockByLocationLoading(true);
    try {
      const res = await locationInventoryService.getStockByLocation(Number(productId));
      setStockByLocation(res);
    } catch (err) {
      toast.error('Failed to load stock by location');
    } finally {
      setIsStockByLocationLoading(false);
    }
  };

  const loadTransferHistory = async () => {
    if (!productId) return;
    setIsTransferHistoryLoading(true);
    try {
      const res = await locationInventoryService.listTransfers({ productId: Number(productId), page: 0, size: 50 });
      setTransferHistory(res.content);
    } catch (err) {
      toast.error('Failed to load transfer history');
    } finally {
      setIsTransferHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
    loadStockByLocation();
    locationInventoryService
      .getLocations()
      .then((locs) => setActiveLocations(locs.filter((l) => l.active)))
      .catch(() => {});
  }, [productId]);

  useEffect(() => {
    if (isTransferHistoryOpen) loadTransferHistory();
  }, [isTransferHistoryOpen]);

  useEffect(() => {
    if (isSummaryModalOpen) loadInventorySummary();
  }, [isSummaryModalOpen]);

  useEffect(() => {
    if (isHistoryModalOpen) loadInventoryHistory();
  }, [isHistoryModalOpen]);

  useEffect(() => {
    if (isConversionModalOpen && conversionTab === 'REVERSE' && targetVariants.length === 0 && product) {
      productService.getReverseConversionTargetVariants(product.productId).then(setTargetVariants).catch(() => {});
    }
  }, [isConversionModalOpen, conversionTab, product]);

  const handleReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setIsConverting(true);
    try {
      await inventoryService.receiveStock({
        ...receiptForm as InventoryReceiptRequest,
        productId: product.productId,
      });
      toast.success('Stock received successfully');
      setIsReceiptModalOpen(false);
      loadProduct();
      setReceiptForm({ quantity: 1, reference: '', note: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.description || 'Failed to receive stock');
    } finally {
      setIsConverting(false);
    }
  };

  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setIsConverting(true);
    try {
      await inventoryService.adjustInventory({
        ...adjustmentForm as InventoryAdjustmentRequest,
        productId: product.productId,
      });
      toast.success('Inventory adjusted successfully');
      setIsAdjustmentModalOpen(false);
      loadProduct();
      setAdjustmentForm({ direction: 'INCREASE', quantity: 1, reason: '', reference: '', note: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.description || 'Failed to adjust inventory');
    } finally {
      setIsConverting(false);
    }
  };

  const handleConversion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setIsConverting(true);
    setConversionSummary(null);

    try {
      if (conversionTab === 'FORWARD') {
        const res = await productService.forwardConversion({ 
          sourceProductId: product.productId, 
          quantity: Number(conversionQuantity) 
        });
        setConversionSummary(res);
        toast.success('Forward conversion completed successfully');
      } else {
        const res = await productService.reverseConversion({
          sourceProductId: product.productId,
          targetProductId: Number(targetProductId),
          quantity: Number(conversionQuantity)
        });
        setConversionSummary(res);
        toast.success('Reverse conversion completed successfully');
      }
      loadProduct();
    } catch (err: any) {
      toast.error(err?.response?.data?.description || 'Conversion failed. Please check rules.');
    } finally {
      setIsConverting(false);
    }
  };

  const handleClearDiscount = async () => {
    if (!product) return;
    setIsClearingDiscount(true);
    toast.loading('Clearing discount...', { id: 'clear-discount' });
    try {
      await productService.clearDiscount(product.productId);
      toast.success('Discount cleared successfully', { id: 'clear-discount' });
      setIsConfirmClearDiscountOpen(false);
      loadProduct();
    } catch (err: any) {
      toast.error(err?.response?.data?.description || 'Failed to clear discount', { id: 'clear-discount' });
    } finally {
      setIsClearingDiscount(false);
    }
  };

  const handleSetDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      toast.error('Discount value must be greater than 0');
      return;
    }

    if (discountType === 'PERCENTAGE' && val > 100) {
      toast.error('Percentage discount value cannot exceed 100%');
      return;
    }

    const baseSellingPrice = parseFloat(product.sellingPrice.replace(/[^0-9.]/g, ''));
    if (discountType === 'FLAT' && val >= baseSellingPrice) {
      toast.error(`Flat discount cannot exceed or equal the selling price (${product.sellingPrice})`);
      return;
    }

    if (!discountStart || !discountEnd) {
      toast.error('Start and end date are required');
      return;
    }

    const start = new Date(discountStart);
    const end = new Date(discountEnd);
    if (end <= start) {
      toast.error('End date must be after the start date');
      return;
    }

    setIsSettingDiscount(true);
    try {
      const formattedStart = discountStart.includes(':00') ? discountStart : `${discountStart}:00`;
      const formattedEnd = discountEnd.includes(':00') ? discountEnd : `${discountEnd}:00`;

      await productService.setDiscount(product.productId, {
        discountType,
        discountValue: val,
        startAt: formattedStart,
        endAt: formattedEnd,
      });

      toast.success('Discount applied successfully');
      setIsDiscountModalOpen(false);
      setDiscountValue('');
      setDiscountStart('');
      setDiscountEnd('');
      loadProduct();
    } catch (err: any) {
      toast.error(err?.response?.data?.description || 'Failed to apply discount');
    } finally {
      setIsSettingDiscount(false);
    }
  };

  const renderReceiptModal = () => (
    <Modal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} title="Receive Stock">
      <form onSubmit={handleReceipt} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Quantity" 
            type="number" 
            min="1" 
            value={receiptForm.quantity} 
            onChange={(e) => setReceiptForm({ ...receiptForm, quantity: Number(e.target.value) })} 
            required 
          />
          <Input 
            label="Reference" 
            value={receiptForm.reference} 
            onChange={(e) => setReceiptForm({ ...receiptForm, reference: e.target.value })} 
            required 
            placeholder="PO-123, Invoice #..."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Unit Cost" 
            type="number" 
            step="0.01" 
            value={receiptForm.unitCost || ''} 
            onChange={(e) => setReceiptForm({ ...receiptForm, unitCost: Number(e.target.value) })} 
            required 
          />
          <Input 
            label="Unit Selling Price" 
            type="number" 
            step="0.01" 
            value={receiptForm.unitSellingPrice || ''} 
            onChange={(e) => setReceiptForm({ ...receiptForm, unitSellingPrice: Number(e.target.value) })} 
            required 
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Note</label>
          <textarea
            className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-zinc-800 dark:text-white rounded-xl text-sm border-none focus:ring-1 focus:ring-accent min-h-[80px] outline-none custom-scrollbar"
            value={receiptForm.note}
            onChange={(e) => setReceiptForm({ ...receiptForm, note: e.target.value })}
          />
        </div>
        <Button type="submit" isLoading={isConverting} className="w-full h-12 rounded-2xl">
          Complete Receipt
        </Button>
      </form>
    </Modal>
  );

  const renderAdjustmentModal = () => (
    <Modal isOpen={isAdjustmentModalOpen} onClose={() => setIsAdjustmentModalOpen(false)} title="Adjust Stock">
      <form onSubmit={handleAdjustment} className="space-y-4">
        <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl mb-4">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${adjustmentForm.direction === 'INCREASE' ? 'bg-white dark:bg-zinc-700 shadow text-accent-dark' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            onClick={() => setAdjustmentForm({ ...adjustmentForm, direction: 'INCREASE' })}
          >
            Increase (+)
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${adjustmentForm.direction === 'DECREASE' ? 'bg-white dark:bg-zinc-700 shadow text-accent-dark' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
            onClick={() => setAdjustmentForm({ ...adjustmentForm, direction: 'DECREASE' })}
          >
            Decrease (-)
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Quantity" 
            type="number" 
            min="1" 
            value={adjustmentForm.quantity} 
            onChange={(e) => setAdjustmentForm({ ...adjustmentForm, quantity: Number(e.target.value) })} 
            required 
          />
          <Input 
            label="Reason" 
            value={adjustmentForm.reason} 
            onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })} 
            required 
            placeholder="Damaged, Found, etc."
          />
        </div>

        {adjustmentForm.direction === 'INCREASE' && (
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Unit Cost" 
              type="number" 
              step="0.01" 
              value={adjustmentForm.unitCost || ''} 
              onChange={(e) => setAdjustmentForm({ ...adjustmentForm, unitCost: Number(e.target.value) })} 
              required 
            />
            <Input 
              label="Unit Selling Price" 
              type="number" 
              step="0.01" 
              value={adjustmentForm.unitSellingPrice || ''} 
              onChange={(e) => setAdjustmentForm({ ...adjustmentForm, unitSellingPrice: Number(e.target.value) })} 
              required 
            />
          </div>
        )}

        <Input 
          label="Reference (Optional)" 
          value={adjustmentForm.reference} 
          onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reference: e.target.value })} 
        />

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Note</label>
          <textarea
            className="w-full px-4 py-3 bg-[#F5F5F5] dark:bg-zinc-800 dark:text-white rounded-xl text-sm border-none focus:ring-1 focus:ring-accent min-h-[80px] outline-none custom-scrollbar"
            value={adjustmentForm.note}
            onChange={(e) => setAdjustmentForm({ ...adjustmentForm, note: e.target.value })}
          />
        </div>

        <Button type="submit" isLoading={isConverting} className="w-full h-12 rounded-2xl">
          Apply Adjustment
        </Button>
      </form>
    </Modal>
  );

  const renderSummaryModal = () => (
    <Modal isOpen={isSummaryModalOpen} onClose={() => setIsSummaryModalOpen(false)} title="Inventory Summary" size="lg">
      {isInventoryLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : inventorySummary ? (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Total Stock</p>
              <p className="text-xl font-bold dark:text-white">{inventorySummary.stockQuantity}</p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Active Cost</p>
              <p className="text-xl font-bold text-accent-dark">{inventorySummary.activeCostPrice}</p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Active Price</p>
              <p className="text-xl font-bold text-accent-dark">{inventorySummary.activeSellingPrice}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#999999] mb-3">Inventory Layers (FIFO)</h4>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="text-xs font-bold uppercase tracking-widest text-[#999999] border-b border-zinc-100 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3">Received</th>
                    <th className="px-4 py-3">Remaining</th>
                    <th className="px-4 py-3">Cost</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {inventorySummary.layers.map((layer) => (
                    <tr key={layer.layerId} className="dark:text-zinc-300">
                      <td className="px-4 py-3">{layer.receivedQuantity}</td>
                      <td className="px-4 py-3 font-bold">{layer.remainingQuantity}</td>
                      <td className="px-4 py-3">{layer.unitCost}</td>
                      <td className="px-4 py-3">{layer.unitSellingPrice}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded mr-1">
                          {layer.sourceType}
                        </span>
                        {layer.sourceReference}
                      </td>
                      <td className="px-4 py-3">{new Date(layer.receivedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {inventorySummary.layers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No active inventory layers</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  );

  const renderHistoryModal = () => (
    <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Inventory History" size="lg">
      {isInventoryLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : (
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="text-xs font-bold uppercase tracking-widest text-[#999999] border-b border-zinc-100 dark:border-zinc-800">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Cost</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Ref</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {inventoryHistory.map((move) => (
                <tr key={move.movementId} className="dark:text-zinc-300">
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      move.movementType === 'RECEIPT' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      move.movementType === 'SALE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {move.movementType}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold">{move.quantity > 0 ? `+${move.quantity}` : move.quantity}</td>
                  <td className="px-4 py-3">{move.unitCost}</td>
                  <td className="px-4 py-3">{move.unitSellingPrice}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-bold">{move.referenceType}</p>
                    <p className="text-[10px] opacity-70">{move.referenceId}</p>
                  </td>
                  <td className="px-4 py-3">{new Date(move.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {inventoryHistory.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No inventory movements recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </Modal>
  );

  const renderConversionModal = () => (
    <Modal isOpen={isConversionModalOpen} onClose={() => { setIsConversionModalOpen(false); setConversionSummary(null); }} title="Stock Conversion">
      {conversionSummary ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-xl">
            <h3 className="font-bold mb-2">Conversion Successful</h3>
            <p className="text-sm">From: <strong>{conversionSummary.fromProductName}</strong></p>
            <p className="text-sm">To: <strong>{conversionSummary.toProductName}</strong></p>
            <p className="text-sm">Quantity Used: <strong>{conversionSummary.fromQuantity}</strong></p>
            <p className="text-sm">Quantity Added: <strong>{conversionSummary.toQuantity}</strong></p>
            <p className="text-sm">Variance: <strong>{conversionSummary.varianceAmount}</strong></p>
            <p className="text-sm font-bold mt-2">Valuation derived from FIFO layers.</p>
          </div>
          <Button onClick={() => setConversionSummary(null)} className="w-full h-12 rounded-2xl">
            Do Another Conversion
          </Button>
        </div>
      ) : (
        <form onSubmit={handleConversion} className="space-y-6">
          <div className="flex bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl">
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${conversionTab === 'FORWARD' ? 'bg-white dark:bg-zinc-700 shadow text-accent-dark' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              onClick={() => { setConversionTab('FORWARD'); setConversionSummary(null); }}
            >
              Forward (Bulk to Base)
            </button>
            <button
              type="button"
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${conversionTab === 'REVERSE' ? 'bg-white dark:bg-zinc-700 shadow text-accent-dark' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
              onClick={() => { setConversionTab('REVERSE'); setConversionSummary(null); }}
            >
              Reverse (Base to Bulk)
            </button>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-xl space-y-4 border border-gray-100 dark:border-zinc-700">
            {conversionTab === 'REVERSE' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">
                  Target Variant SKU
                </label>
                <Dropdown
                  value={targetProductId}
                  onChange={(val) => setTargetProductId(val)}
                  options={[
                    { label: 'Select Target Variant...', value: '' },
                    ...targetVariants.map((v) => ({
                      label: `${v.variantName} (${v.variantSku})`,
                      value: String(v.variantId)
                    }))
                  ]}
                />
                <p className="text-xs text-gray-500 mt-2">Target must be a variant in the same family as this base unit.</p>
              </div>
            )}
            
            <Input 
              label={conversionTab === 'FORWARD' ? "Source Quantity to Convert (Bulk)" : "Source Quantity to Convert (Base EA)"}
              type="number" 
              value={conversionQuantity}
              onChange={(e) => setConversionQuantity(e.target.value)} 
              required 
              min="1"
            />
            <p className="text-[10px] text-zinc-500 italic mt-1 text-center">
              Note: Conversion cost is derived from FIFO layers. Mixed-cost source stock may affect resulting variant cost.
            </p>
          </div>

          <Button type="submit" isLoading={isConverting} className="w-full h-12 rounded-2xl">
            Execute Conversion
          </Button>
        </form>
      )}
    </Modal>
  );

  const renderDiscountModal = () => (
    <Modal isOpen={isDiscountModalOpen} onClose={() => setIsDiscountModalOpen(false)} title="Set Sale Discount">
      <form onSubmit={handleSetDiscount} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Discount Type</label>
          <Dropdown
            value={discountType}
            onChange={(val) => {
              setDiscountType(val as 'PERCENTAGE' | 'FLAT');
              setDiscountValue('');
            }}
            options={[
              { label: 'Percentage (%)', value: 'PERCENTAGE' },
              { label: 'Flat Amount', value: 'FLAT' },
            ]}
          />
        </div>

        <Input 
          label={discountType === 'PERCENTAGE' ? "Discount Percentage (e.g. 15 for 15%)" : `Flat Discount Amount (${product?.sellingPrice?.split(' ')[0] ?? ''})`}
          type="number" 
          step="0.01" 
          value={discountValue} 
          onChange={(e) => setDiscountValue(e.target.value)} 
          required 
          placeholder={discountType === 'PERCENTAGE' ? "e.g. 15" : "e.g. 40"}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Start Date" 
            type="datetime-local" 
            value={discountStart} 
            onChange={(e) => setDiscountStart(e.target.value)} 
            required 
          />
          <Input 
            label="End Date" 
            type="datetime-local" 
            value={discountEnd} 
            onChange={(e) => setDiscountEnd(e.target.value)} 
            required 
          />
        </div>

        <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl flex gap-2.5 items-start text-[11px] text-zinc-500 leading-normal">
          <Calendar className="h-4 w-4 shrink-0 text-accent-dark" />
          <span>The discount will apply dynamically. When active, it wins over shop-wide sales. Coupons cannot stack with this sale.</span>
        </div>

        <Button type="submit" isLoading={isSettingDiscount} className="w-full h-12 rounded-2xl">
          Apply Discount
        </Button>
      </form>
    </Modal>
  );

  const renderTransferModal = () => (
    <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Record Stock Transfer">
      {product && (
        <TransferForm
          fixedProduct={{ productId: product.productId, productName: product.productName }}
          locations={activeLocations}
          onSuccess={() => {
            setIsTransferModalOpen(false);
            loadProduct();
            loadStockByLocation();
          }}
        />
      )}
    </Modal>
  );

  const renderTransferHistoryModal = () => (
    <Modal
      isOpen={isTransferHistoryOpen}
      onClose={() => setIsTransferHistoryOpen(false)}
      title="Transfer History"
      size="lg"
    >
      {isTransferHistoryLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm">
              <thead className="text-xs font-bold uppercase tracking-widest text-[#999999] border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Movement</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">By</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {transferHistory.map((t) => (
                  <tr key={t.id} className={t.movedByName === 'System' ? 'text-zinc-400' : 'dark:text-zinc-300'}>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5">
                        {t.fromLocationName || <span className="italic text-zinc-400">Outside</span>}
                        <ArrowRight className="h-3 w-3 text-zinc-400 shrink-0" />
                        {t.toLocationName || <span className="italic text-zinc-400">Sold / Out</span>}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold">{t.quantity}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          t.transferType === 'TRANSFER'
                            ? 'bg-accent text-[#1A1A1A]'
                            : t.transferType === 'RECEIPT'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : t.transferType === 'SALE_DEDUCTION'
                            ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {t.transferType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{t.movedByName}</td>
                    <td className="px-4 py-3 text-xs">{new Date(t.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
                {transferHistory.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                      No transfers recorded for this product
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="text-center">
            <Link
              to={`/admin/inventory/transfers`}
              className="text-xs font-bold text-accent-dark hover:text-accent uppercase tracking-widest"
            >
              View all transfers →
            </Link>
          </div>
        </div>
      )}
    </Modal>
  );

  if (isLoading) {
    return (
      <div className="p-8 animate-pulse">
        <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4 mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 border border-zinc-200 dark:border-zinc-800 rounded-3xl h-96"></div>
          <div className="lg:col-span-2 space-y-4">
             <div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
             <div className="h-40 bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4">
        <Link
          to="/admin/products"
          className="p-2 -ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-[#666666] dark:text-zinc-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">Product Details</h1>
          <p className="text-sm text-[#666666] dark:text-zinc-400 mt-1">Manage product catalog and inventory</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image and Status */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-sm border border-black/5 dark:border-white/5 h-full flex flex-col min-h-0">
            <div className="relative flex-1 mb-6 min-h-[300px] lg:min-h-0">
              <div className="absolute inset-0 rounded-2xl overflow-hidden bg-[#F5F5F5] dark:bg-zinc-800">
                {product.productImageUrl ? (
                  <img
                    src={product.productImageUrl}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <Box className="h-12 w-12 opacity-50" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Status</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={product.isActive ? "success" : "default"}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant={product.isEnlisted ? "info" : "warning"}>
                    {product.isEnlisted ? 'Enlisted' : 'Unenlisted'}
                  </Badge>
                  {product.isFeatured && <Badge variant="info">Featured</Badge>}
                  {product.isOutOfStock && <Badge variant="danger">Out of Stock</Badge>}
                  {product.onSale && <Badge variant="success">Sale</Badge>}
                </div>
              </div>
              
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Category</p>
                <p className="text-sm font-medium dark:text-white">{product.category?.categoryName || '—'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details and admin Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-black/5 dark:border-white/5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold dark:text-white mb-2">{product.productName}</h2>
                <p className="text-[#666666] dark:text-zinc-400">{product.productShortDescription}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Active Selling Price</p>
                <p className="text-2xl font-bold text-accent-dark">{product.sellingPrice}</p>
                {product.onSale && (
                  <div className="flex flex-col items-end mt-1">
                    <p className="text-xs text-zinc-400 line-through">Original: {product.originalPrice}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded w-fit mt-0.5">
                      {Math.round(product.discountPercentage)}% OFF
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
              <p className="text-sm leading-relaxed text-[#666666] dark:text-zinc-400 whitespace-pre-wrap flex-1">
                {product.productDescription}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">SKU</p>
                <p className="text-sm font-semibold dark:text-white">{product.stockKeepingUnit || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Current Stock</p>
                <p className="text-sm font-semibold dark:text-white">{product.stockQuantity}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Low Threshold</p>
                <p className="text-sm font-semibold dark:text-white">{product.lowStockThreshold}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Active Cost</p>
                <p className="text-sm font-semibold dark:text-white">{product.costPrice}</p>
              </div>
            </div>
          </div>

          {/* Inventory Management Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold dark:text-white">Inventory & Stock</h3>
                <p className="text-sm text-[#666666] dark:text-zinc-400 mt-1">Receive new stock, adjust levels, and view FIFO history</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsSummaryModalOpen(true)} className="rounded-xl px-4 py-2 text-xs h-auto flex gap-2">
                  <List className="h-4 w-4" /> Summary
                </Button>
                <Button variant="outline" onClick={() => setIsHistoryModalOpen(true)} className="rounded-xl px-4 py-2 text-xs h-auto flex gap-2">
                  <History className="h-4 w-4" /> History
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button 
                onClick={() => setIsReceiptModalOpen(true)}
                className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-accent transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                  <Plus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold dark:text-white">Receive Stock</p>
                  <p className="text-xs text-[#666666] dark:text-zinc-400">Add new inventory with cost & price</p>
                </div>
              </button>

              <button 
                onClick={() => setIsAdjustmentModalOpen(true)}
                className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-accent transition-colors text-left"
              >
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                  <Settings2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold dark:text-white">Adjust Stock</p>
                  <p className="text-xs text-[#666666] dark:text-zinc-400">Correct inventory levels or log damage</p>
                </div>
              </button>
            </div>

            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
               <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold dark:text-white">Stock Conversion</h4>
                  <Button onClick={() => setIsConversionModalOpen(true)} className="rounded-xl px-4 py-2 text-xs h-auto">
                    Execute Conversion
                  </Button>
               </div>
               <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                 <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Total Sold</p>
                    <p className="text-lg font-bold dark:text-white">{product.soldCount}</p>
                 </div>
                 {product.familyCode && (
                   <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Family Code</p>
                      <p className="text-lg font-bold dark:text-white">{product.familyCode}</p>
                   </div>
                 )}
                 {product.conversionFactor && (
                   <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Conversion Factor</p>
                      <p className="text-lg font-bold dark:text-white">x{product.conversionFactor}</p>
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Stock by Location Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold dark:text-white">Stock by Location</h3>
                  {stockByLocation && !stockByLocation.balancesMatchGlobal && (
                    <span title="Resolvable by an adjustment or a corrective transfer.">
                      <Badge variant="warning">Ledger out of sync</Badge>
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#666666] dark:text-zinc-400 mt-1">Where this product physically sits</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsTransferHistoryOpen(true)}
                  className="rounded-xl px-4 py-2 text-xs h-auto flex gap-2"
                >
                  <History className="h-4 w-4" /> Transfer History
                </Button>
                <Button
                  onClick={() => setIsTransferModalOpen(true)}
                  className="rounded-xl px-4 py-2 text-xs h-auto flex gap-2"
                >
                  <ArrowLeftRight className="h-4 w-4" /> Record Transfer
                </Button>
              </div>
            </div>

            {isStockByLocationLoading ? (
              <div className="h-32 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            ) : stockByLocation ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {stockByLocation.locations.length === 0 && (
                    <div className="sm:col-span-2 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-sm text-zinc-500">
                      No location balances recorded yet for this product.
                    </div>
                  )}
                  {stockByLocation.locations.map((loc) => (
                    <div
                      key={loc.locationId}
                      className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-accent/15 flex items-center justify-center text-accent-dark">
                          <Warehouse className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold dark:text-white">{loc.locationName}</p>
                          <p className="text-[10px] uppercase tracking-widest text-[#999999]">
                            {loc.locationType === 'SHOP_FLOOR' ? 'Shop Floor' : 'Store Room'}
                          </p>
                        </div>
                      </div>
                      {loc.quantityOnHand < 0 ? (
                        <div className="flex items-center gap-1.5 text-red-500">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm font-bold">{loc.quantityOnHand}</span>
                          <span className="text-[10px] font-medium">(needs transfer record)</span>
                        </div>
                      ) : (
                        <span className="text-xl font-bold dark:text-white">{loc.quantityOnHand}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                  <span className="text-[#666666] dark:text-zinc-400">
                    Sellable stock: <strong className="dark:text-white">{stockByLocation.globalStockQuantity}</strong>
                  </span>
                  <span className="text-[#666666] dark:text-zinc-400">
                    Reserved (unpaid carts):{' '}
                    <strong className="dark:text-white">{stockByLocation.outstandingReservedQuantity}</strong>
                  </span>
                </div>

                {stockByLocation.outstandingReservedQuantity > 0 && (
                  <p className="flex items-start gap-1.5 text-[11px] text-[#999999] leading-relaxed">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                    Reserved units are held for in-progress e-commerce carts and are automatically released back
                    to stock if payment fails or is not completed.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-sm text-zinc-500">
                Location data unavailable.
              </div>
            )}
          </div>

          {/* Discount Management Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-black/5 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold dark:text-white">Product Discount</h3>
                <p className="text-sm text-[#666666] dark:text-zinc-400 mt-1">
                  {product.onSale 
                    ? 'Active product-specific discount is applied' 
                    : 'Configure temporary product-specific discounts'}
                </p>
              </div>
              <div className="flex gap-2">
                {product.onSale && (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsConfirmClearDiscountOpen(true)} 
                    className="rounded-xl px-4 py-2 text-xs h-auto text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    Clear Discount
                  </Button>
                )}
                <Button 
                  onClick={() => setIsDiscountModalOpen(true)} 
                  className="rounded-xl px-4 py-2 text-xs h-auto"
                >
                  {product.onSale ? 'Change Discount' : 'Set Discount'}
                </Button>
              </div>
            </div>

            {product.onSale ? (
              <div className="p-5 bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/20 rounded-2xl space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Discount Value</p>
                    <p className="text-lg font-bold dark:text-white">
                      {product.discountPercentage ? `${Math.round(product.discountPercentage)}% OFF` : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">Original Price</p>
                    <p className="text-lg font-bold dark:text-white line-through text-zinc-400">{product.originalPrice}</p>
                  </div>
                </div>
                {product.discountEndsAt && (
                  <div className="pt-3 border-t border-emerald-100 dark:border-emerald-950/20 flex items-center gap-2 text-xs text-[#c084fc] dark:text-purple-400 font-bold uppercase tracking-wider">
                    <Calendar className="h-4 w-4 shrink-0" />
                    Sale Ends: {new Date(product.discountEndsAt).toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                  <Tag className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold dark:text-white">No active discount</p>
                  <p className="text-xs text-[#666666] dark:text-zinc-400">Apply a promotional time-framed PERCENTAGE or FLAT discount to this product.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {renderReceiptModal()}
      {renderAdjustmentModal()}
      {renderSummaryModal()}
      {renderHistoryModal()}
      {renderConversionModal()}
      {renderDiscountModal()}
      {renderTransferModal()}
      {renderTransferHistoryModal()}
      <ConfirmModal
        isOpen={isConfirmClearDiscountOpen}
        onClose={() => setIsConfirmClearDiscountOpen(false)}
        onConfirm={handleClearDiscount}
        title="Clear Discount"
        message={<>Are you sure you want to clear the active discount for <strong>{product.productName}</strong>?</>}
        confirmLabel="Clear Discount"
        isLoading={isClearingDiscount}
      />
    </motion.div>
  );
};
