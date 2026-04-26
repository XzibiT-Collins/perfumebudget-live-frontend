import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminTable } from '../components/AdminTable';
import { Badge } from '../components/Badge';
import { formatPrice } from '../utils';
import { adminMetricService } from '../services/adminMetricService';
import { CustomerDataResponse } from '../types';
import toast from 'react-hot-toast';

export const CustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerDataResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchCustomers(currentPage);
  }, [currentPage]);

  const fetchCustomers = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await adminMetricService.getCustomerMetrics(page, pageSize);
      setCustomers(data.content);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error('Failed to fetch customers', err);
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* <div>
        <h1 className="text-3xl font-serif font-bold mb-2">Customer Management</h1>
        <p className="text-[#666666]">View and manage your store's registered customers.</p>
      </div> */}

      <AdminTable
        title="Customers"
        columns={[
          {
            header: 'Customer', accessor: (row: CustomerDataResponse) => (
              <div 
                className="cursor-pointer hover:underline"
                onClick={() => navigate(`/admin/customers/${row.id}`)}
              >
                <p className="font-bold dark:text-white">{row.fullName}</p>
                <p className="text-xs text-[#999999]">{row.email}</p>
              </div>
            )
          },
          { header: 'Orders', accessor: 'orderCount' },
          { header: 'Total Spent', accessor: (row: CustomerDataResponse) => formatPrice(row.totalSpent) },
          {
            header: 'Status', accessor: (row: CustomerDataResponse) => (
              <Badge variant={row.isActive ? 'success' : 'default'}>
                {row.isActive ? 'Active' : 'Inactive'}
              </Badge>
            )
          },
          { header: 'Joined', accessor: (row: CustomerDataResponse) => new Date(row.dateJoined).toLocaleDateString() },
        ]}
        data={customers}
        isLoading={isLoading}
        currentPage={currentPage + 1}
        totalPages={Math.ceil(totalElements / pageSize)}
        onPageChange={(page) => setCurrentPage(page - 1)}
        itemsPerPage={pageSize}
      />
    </div>
  );
};
