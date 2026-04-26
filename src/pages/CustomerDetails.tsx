import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminMetricService } from '../services/adminMetricService';
import { CustomerFullDetailsResponse, OrderListResponse } from '../types';
import { AdminTable } from '../components/AdminTable';
import { Badge } from '../components/Badge';
import { formatPrice } from '../utils';
import { Calendar, Mail, User, MapPin, Package, ArrowLeft } from 'lucide-react';

export const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerFullDetailsResponse | null>(null);
  const [orders, setOrders] = useState<OrderListResponse[]>([]);
  
  const [isCustomerLoading, setIsCustomerLoading] = useState(true);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  
  const pageSize = 5;
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    if (id) {
      fetchCustomerDetails(Number(id));
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchCustomerOrders(Number(id), currentPage);
    }
  }, [id, currentPage]);

  const fetchCustomerDetails = async (userId: number) => {
    setIsCustomerLoading(true);
    try {
      const data = await adminMetricService.getCustomerDetails(userId);
      setCustomer(data);
    } catch (err) {
      toast.error('Failed to load customer details');
    } finally {
      setIsCustomerLoading(false);
    }
  };

  const fetchCustomerOrders = async (userId: number, page: number) => {
    setIsOrdersLoading(true);
    try {
      const data = await adminMetricService.getCustomerOrders(userId, page, pageSize);
      setOrders(data.content);
      setTotalElements(data.totalElements);
    } catch (err) {
      toast.error('Failed to load customer orders');
    } finally {
      setIsOrdersLoading(false);
    }
  };

  if (isCustomerLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold dark:text-white">Customer not found</h2>
        <button onClick={() => navigate('/admin/customers')} className="mt-4 text-accent hover:underline">
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/customers')}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="h-5 w-5 dark:text-white" />
        </button>
        <div>
          <h1 className="text-3xl font-serif font-bold mb-1 dark:text-white">Customer Profile</h1>
          <p className="text-[#666666] dark:text-zinc-400">View detailed metrics and order history.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 col-span-2">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-accent/10 flex items-center justify-center">
              <User className="h-7 w-7 text-accent-dark" />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white">{customer.fullName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-zinc-400" />
                <span className="text-sm text-zinc-500">{customer.email}</span>
              </div>
            </div>
          </div>
          <div>
            <Badge variant={customer.isActive ? 'success' : 'default'}>
              {customer.isActive ? 'Active User' : 'Inactive User'}
            </Badge>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-zinc-400" />
            <p className="text-sm font-medium text-zinc-500">Date Joined</p>
          </div>
          <p className="text-xl font-bold dark:text-white">
            {new Date(customer.dateJoined).toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-4 w-4 text-zinc-400" />
            <p className="text-sm font-medium text-zinc-500">Total Spent</p>
          </div>
          <p className="text-xl font-bold dark:text-white">
            {formatPrice(customer.totalSpent)}
          </p>
        </div>
      </div>

      {customer.addresses && customer.addresses.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 dark:text-white">Saved Addresses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customer.addresses.map((addr) => (
              <div key={addr.id} className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-accent-dark" />
                  <span className="font-semibold text-sm dark:text-white">{addr.label}</span>
                  {addr.isDefault && <Badge variant="success" className="ml-auto text-[10px]">Default</Badge>}
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{addr.recipientName}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{addr.addressLine1}</p>
                {addr.addressLine2 && <p className="text-sm text-zinc-600 dark:text-zinc-400">{addr.addressLine2}</p>}
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{addr.city}, {addr.region}</p>
                <p className="text-sm text-zinc-500 mt-2">{addr.phoneNumber}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <AdminTable
        title="Order History"
        columns={[
          {
            header: 'Order #', accessor: (row: OrderListResponse) => (
              <span className="font-bold dark:text-white cursor-pointer hover:underline" onClick={() => navigate(`/admin/orders/${row.orderNumber}`)}>
                {row.orderNumber}
              </span>
            )
          },
          { header: 'Date', accessor: (row) => new Date(row.orderDate).toLocaleDateString() },
          { header: 'Amount', accessor: (row) => formatPrice(row.totalAmount) },
          {
            header: 'Payment', accessor: (row) => (
              <Badge variant={row.paymentStatus === 'COMPLETED' ? 'success' : 'warning'}>
                {row.paymentStatus}
              </Badge>
            )
          },
          {
            header: 'Delivery', accessor: (row) => (
              <Badge variant={
                row.deliveryStatus === 'DELIVERED' ? 'success' :
                row.deliveryStatus === 'CANCELLED' ? 'danger' :
                row.deliveryStatus === 'PENDING' ? 'warning' : 'info'
              }>
                {row.deliveryStatus.replace(/_/g, ' ')}
              </Badge>
            )
          }
        ]}
        data={orders}
        isLoading={isOrdersLoading}
        currentPage={currentPage + 1}
        totalPages={Math.ceil(totalElements / pageSize)}
        onPageChange={(page) => setCurrentPage(page - 1)}
        itemsPerPage={pageSize}
      />
    </div>
  );
};
