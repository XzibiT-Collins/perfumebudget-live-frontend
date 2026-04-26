import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Package } from 'lucide-react';
import { Badge } from '../components/Badge';
import { Pagination } from '../components/Pagination';
import { Modal } from '../components/Modal';
import { orderService } from '../services/orderService';
import type { OrderListResponse, OrderResponse, DeliveryStatus, PaymentStatus } from '../types';
import toast from 'react-hot-toast';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
  // Delivery
  PENDING: 'warning',
  PACKING: 'info',
  OUT_FOR_DELIVERY: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  // Payment
  INITIATED: 'warning',
  COMPLETED: 'success',
  FAILED: 'danger',
};

export const OrderHistory = () => {
  const [orders, setOrders] = useState<OrderListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    orderService.getMyOrders(currentPage - 1, 10).then((res) => {
      setOrders(res.content);
      setTotalPages(res.totalPages);
    }).catch(() => { }).finally(() => setIsLoading(false));
  }, [currentPage]);

  const viewDetail = async (orderNumber: string) => {
    try {
      const order = await orderService.getOrder(orderNumber);
      setSelectedOrder(order);
      setIsModalOpen(true);
    } catch { toast.error('Could not load order'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold dark:text-white mb-10">Order History</h1>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-[#F5F5F5] dark:bg-zinc-800 rounded-2xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Package className="h-12 w-12 text-[#CCCCCC] mb-4" />
          <p className="text-[#666666] dark:text-zinc-400">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <motion.div
              key={order.orderId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-5 card-shadow flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-sm dark:text-white">#{order.orderNumber}</p>
                <p className="text-xs text-[#999999] dark:text-zinc-400 mt-0.5">
                  {new Date(order.orderDate).toLocaleDateString()}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={STATUS_VARIANT[order.deliveryStatus] as any}>
                    {order.deliveryStatus.replace(/_/g, ' ')}
                  </Badge>
                  <Badge variant={STATUS_VARIANT[order.paymentStatus] as any}>
                    {order.paymentStatus}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold dark:text-white">{order.totalAmount}</p>
                <button
                  onClick={() => viewDetail(order.orderNumber)}
                  className="text-xs font-bold text-[#666666] dark:text-zinc-400 hover:text-[#1A1A1A] dark:hover:text-white mt-2 transition-colors"
                >
                  View Details →
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Order #${selectedOrder.orderNumber}`}>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant={STATUS_VARIANT[selectedOrder.deliveryStatus] as any}>
                {selectedOrder.deliveryStatus.replace(/_/g, ' ')}
              </Badge>
              <Badge variant={STATUS_VARIANT[selectedOrder.paymentStatus] as any}>
                {selectedOrder.paymentStatus}
              </Badge>
            </div>
            <div className="space-y-2">
              {selectedOrder.lineItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm dark:text-white">
                  <span>{item.productName} × {item.quantity}</span>
                  <span>{item.totalPrice}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-[#F5F5F5] dark:bg-zinc-800" />
            <div className="flex justify-between font-bold dark:text-white">
              <span>Total</span>
              <span>{selectedOrder.totalAmount}</span>
            </div>
            {selectedOrder.discountAmount && parseFloat(selectedOrder.discountAmount) > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount Applied</span>
                <span>-{selectedOrder.discountAmount}</span>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
