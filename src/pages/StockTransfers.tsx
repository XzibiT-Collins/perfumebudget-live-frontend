import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, ArrowLeftRight } from 'lucide-react';
import { AdminTable } from '../components/AdminTable';
import { Badge } from '../components/Badge';
import { Dropdown } from '../components/Dropdown';
import { ProductPicker } from '../components/ProductPicker';
import { TransferForm } from '../components/TransferForm';
import locationInventoryService from '../services/locationInventoryService';
import type {
  ProductListing,
  StockTransferResponse,
  StockTransferType,
  StorageLocationResponse,
} from '../types';
import { extractErrorMessage } from '../utils';
import toast from 'react-hot-toast';

const PAGE_SIZE = 20;

const TYPE_VARIANT: Record<StockTransferType, 'secondary' | 'success' | 'default' | 'warning'> = {
  TRANSFER: 'secondary',
  RECEIPT: 'success',
  SALE_DEDUCTION: 'default',
  ADJUSTMENT: 'warning',
};

const TYPE_LABEL: Record<StockTransferType, string> = {
  TRANSFER: 'Transfer',
  RECEIPT: 'Receipt',
  SALE_DEDUCTION: 'Sale',
  ADJUSTMENT: 'Adjustment',
};

export const StockTransfers = () => {
  const [locations, setLocations] = useState<StorageLocationResponse[]>([]);

  const [rows, setRows] = useState<StockTransferResponse[]>([]);
  const [page, setPage] = useState(0); // 0-indexed
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingLog, setIsLoadingLog] = useState(true);

  const [filterLocationId, setFilterLocationId] = useState('');
  const [filterProduct, setFilterProduct] = useState<ProductListing | null>(null);

  const activeLocations = locations.filter((l) => l.active);

  useEffect(() => {
    locationInventoryService
      .getLocations()
      .then(setLocations)
      .catch((err) => toast.error(extractErrorMessage(err, 'Failed to load locations')));
  }, []);

  const loadLog = useCallback(() => {
    setIsLoadingLog(true);
    locationInventoryService
      .listTransfers({
        page,
        size: PAGE_SIZE,
        locationId: filterLocationId ? Number(filterLocationId) : undefined,
        productId: filterProduct ? filterProduct.productId : undefined,
      })
      .then((res) => {
        setRows(res.content);
        setTotalPages(Math.max(1, res.totalPages));
      })
      .catch((err) => toast.error(extractErrorMessage(err, 'Failed to load transfer history')))
      .finally(() => setIsLoadingLog(false));
  }, [page, filterLocationId, filterProduct]);

  useEffect(() => {
    loadLog();
  }, [loadLog]);

  // Reset to first page when filters change.
  useEffect(() => {
    setPage(0);
  }, [filterLocationId, filterProduct]);

  const locationFilterOptions = [
    { label: 'All locations', value: '' },
    ...locations.map((l) => ({ label: l.name, value: String(l.id) })),
  ];

  const endpointLabel = (id: number | null, name: string | null, fallback: string) =>
    name ? name : <span className="italic text-zinc-400">{fallback}</span>;

  const columns = [
    {
      header: 'Date',
      accessor: (t: StockTransferResponse) => (
        <span className="text-xs">{new Date(t.createdAt).toLocaleString()}</span>
      ),
    },
    {
      header: 'Product',
      accessor: (t: StockTransferResponse) => (
        <span className="font-semibold text-[#1A1A1A] dark:text-white">{t.productName}</span>
      ),
    },
    {
      header: 'Movement',
      accessor: (t: StockTransferResponse) => (
        <span className="flex items-center gap-1.5 text-xs">
          {endpointLabel(t.fromLocationId, t.fromLocationName, 'Outside')}
          <ArrowRight className="h-3 w-3 text-zinc-400 shrink-0" />
          {endpointLabel(t.toLocationId, t.toLocationName, 'Sold / Out')}
        </span>
      ),
    },
    {
      header: 'Qty',
      accessor: (t: StockTransferResponse) => <span className="font-bold">{t.quantity}</span>,
    },
    {
      header: 'Type',
      accessor: (t: StockTransferResponse) => (
        <Badge variant={TYPE_VARIANT[t.transferType] ?? 'default'}>{TYPE_LABEL[t.transferType] ?? t.transferType}</Badge>
      ),
    },
    {
      header: 'By',
      accessor: (t: StockTransferResponse) =>
        t.movedByName === 'System' ? (
          <span className="text-xs italic text-zinc-400">System</span>
        ) : (
          <span className="text-xs font-medium dark:text-zinc-300">{t.movedByName}</span>
        ),
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-accent/20 flex items-center justify-center text-accent-dark">
          <ArrowLeftRight className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] dark:text-white">Stock Transfers</h1>
          <p className="text-sm text-[#666666] dark:text-zinc-400 mt-0.5">
            Record physical moves of stock between locations and review the transfer log.
          </p>
        </div>
      </div>

      {/* Record transfer */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 shadow-sm border border-black/5 dark:border-white/5">
        <h2 className="text-lg font-bold dark:text-white mb-6">Record a Transfer</h2>
        <div className="max-w-2xl">
          <TransferForm locations={activeLocations} onSuccess={() => loadLog()} />
        </div>
      </div>

      {/* Transfer log */}
      <AdminTable
        title="Transfer History"
        data={rows}
        columns={columns}
        isLoading={isLoadingLog}
        currentPage={page + 1}
        totalPages={totalPages}
        onPageChange={(p) => setPage(p - 1)}
        itemsPerPage={PAGE_SIZE}
        filterNodes={
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-56">
              <ProductPicker
                selected={filterProduct}
                onSelect={setFilterProduct}
                placeholder="Filter by product..."
              />
            </div>
            <div className="w-full sm:w-44">
              <Dropdown value={filterLocationId} onChange={setFilterLocationId} options={locationFilterOptions} />
            </div>
          </div>
        }
      />
    </motion.div>
  );
};
