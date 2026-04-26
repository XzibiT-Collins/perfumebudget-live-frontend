import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminTable } from '../components/AdminTable';
import { Badge } from '../components/Badge';
import { Dropdown, DropdownOption } from '../components/Dropdown';
import { formatPrice } from '../utils';
import { orderService } from '../services/orderService';
import { OrderListResponse, DeliveryStatus, PaymentStatus } from '../types';
import toast from 'react-hot-toast';

export const OrderManagement = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [deliveryStatus, setDeliveryStatus] = useState<string>('');

  useEffect(() => {
    fetchOrders();
  }, [page, paymentStatus, deliveryStatus]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getAllOrders(page, 10, paymentStatus, deliveryStatus);
      setOrders(data.content);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      toast.error('Failed to load orders');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    // Shared and specific statuses
    [DeliveryStatus.DELIVERED]: 'success',
    [PaymentStatus.COMPLETED]: 'success',
    [DeliveryStatus.PENDING]: 'warning', // PaymentStatus.PENDING is also 'PENDING'
    [PaymentStatus.INITIATED]: 'warning',
    [DeliveryStatus.PACKING]: 'info',
    [DeliveryStatus.OUT_FOR_DELIVERY]: 'info',
    [DeliveryStatus.CANCELLED]: 'danger', // PaymentStatus.CANCELLED is also 'CANCELLED'
    [PaymentStatus.FAILED]: 'danger',
  };

  const columns = [
    {
      header: 'Order #',
      accessor: (o: OrderListResponse) => o.orderNumber
    },
    {
      header: 'Date',
      accessor: (o: OrderListResponse) => new Date(o.orderDate).toLocaleDateString()
    },
    {
      header: 'Amount',
      accessor: (o: OrderListResponse) => formatPrice(o.totalAmount)
    },
    {
      header: 'Payment',
      accessor: (o: OrderListResponse) => (
        <Badge variant={statusColors[o.paymentStatus] || 'info'}>
          {o.paymentStatus}
        </Badge>
      )
    },
    {
      header: 'Delivery',
      accessor: (o: OrderListResponse) => (
        <Badge variant={statusColors[o.deliveryStatus] || 'info'}>
          {o.deliveryStatus}
        </Badge>
      )
    },
  ];

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    // Check if it's an order number (assuming it starts with GS- or is numeric, etc.)
    // For now, just try to fetch it
    toast.loading('Searching for order...', { id: 'search-order' });
    try {
      const order = await orderService.getOrder(query.trim());
      toast.success('Order found', { id: 'search-order' });
      navigate(`/admin/orders/${order.orderNumber}`);
    } catch (err: any) {
      toast.error('Order not found', { id: 'search-order' });
    }
  };

  return (
    <AdminTable
      title="Orders"
      data={orders}
      columns={columns}
      filterNodes={
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="w-full sm:w-44">
            <Dropdown
              value={paymentStatus}
              onChange={(val) => { setPaymentStatus(val); setPage(0); }}
              options={[
                { label: 'All Payments', value: '' },
                ...Object.values(PaymentStatus).map(s => ({ label: s, value: s }))
              ]}
              placeholder="All Payments"
            />
          </div>
          <div className="w-full sm:w-44">
            <Dropdown
              value={deliveryStatus}
              onChange={(val) => { setDeliveryStatus(val); setPage(0); }}
              options={[
                { label: 'All Deliveries', value: '' },
                ...Object.values(DeliveryStatus).map(s => ({ label: s, value: s }))
              ]}
              placeholder="All Deliveries"
            />
          </div>
        </div>
      }
      onEdit={(o) => navigate(`/admin/orders/${o.orderNumber}`)}
      isLoading={isLoading}
      currentPage={page + 1}
      totalPages={totalPages}
      onPageChange={(p) => setPage(p - 1)}
      onSearch={handleSearch}
      searchPlaceholder="Search order number..."
      itemsPerPage={10}
    />
  );
};
