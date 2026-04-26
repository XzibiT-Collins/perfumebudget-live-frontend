import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Box, Plus, History, List, Settings2 } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Input } from '../components/Input';
import { Dropdown } from '../components/Dropdown';
import { Modal } from '../components/Modal';
import { productService } from '../services/productService';
import inventoryService from '../services/inventoryService';
import type { 
  ProductDetails, 
  ConversionResponse, 
  ProductVariantSummaryResponse,
  InventorySummaryResponse,
  InventoryMovementResponse,
  InventoryReceiptRequest,
  InventoryAdjustmentRequest
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

  useEffect(() => {
    loadProduct();
  }, [productId]);

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
        </div>
      </div>
      
      {renderReceiptModal()}
      {renderAdjustmentModal()}
      {renderSummaryModal()}
      {renderHistoryModal()}
      {renderConversionModal()}
    </motion.div>
  );
};
