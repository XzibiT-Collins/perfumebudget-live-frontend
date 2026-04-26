import React, { useState, useEffect } from 'react';
import {
  Users,
  User,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Plus,
  ArrowRight,
  Percent,
  Calendar,
  TrendingUp,
  Package,
  Activity,
  Upload,
  Box
} from 'lucide-react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { formatPrice, cn } from '../utils';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import { adminMetricService } from '../services/adminMetricService';
import { OrderListResponse, DeliveryStatus, PaymentStatus, DashboardMetrics } from '../types';
import toast from 'react-hot-toast';

interface KPICard {
  label: string;
  value: string;
  trend?: string;
  isUp?: boolean;
  icon: any;
  color: string;
  breakdown?: string | { delivered: number; pending: number; cancelled: number } | null;
  hint?: string;
}

const revenueData = [
  { date: 'Feb 18', revenue: 4000, prevRevenue: 3200 },
  { date: 'Feb 19', revenue: 3000, prevRevenue: 3500 },
  { date: 'Feb 20', revenue: 5000, prevRevenue: 4100 },
  { date: 'Feb 21', revenue: 2780, prevRevenue: 3000 },
  { date: 'Feb 22', revenue: 1890, prevRevenue: 2100 },
  { date: 'Feb 23', revenue: 2390, prevRevenue: 2800 },
  { date: 'Feb 24', revenue: 3490, prevRevenue: 3100 },
];

const topProducts = [
  { name: 'Rosa Damascena No. 1', sold: 450, revenue: 22500, share: '18%', image: 'https://picsum.photos/seed/perfume1/100/100' },
  { name: 'Nuit de Musc', sold: 320, revenue: 19200, share: '15%', image: 'https://picsum.photos/seed/perfume2/100/100' },
  { name: 'Ciel de Vanille', sold: 280, revenue: 14000, share: '11%', image: 'https://picsum.photos/seed/perfume3/100/100' },
  { name: 'Brume Océanique', sold: 210, revenue: 10500, share: '8%', image: 'https://picsum.photos/seed/perfume4/100/100' },
];

const recentOrders = [
  { id: 'ORD-7421', customer: 'Sarah Jenkins', amount: 450.00, status: 'PAID', date: 'Today, 2:30 PM', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: 'ORD-7420', customer: 'Michael Chen', amount: 129.00, status: 'PENDING', date: 'Today, 1:15 PM', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: 'ORD-7419', customer: 'Emma Wilson', amount: 89.00, status: 'FAILED', date: 'Yesterday', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: 'ORD-7418', customer: 'David Miller', amount: 210.00, status: 'CANCELLED', date: 'Yesterday', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: 'ORD-7417', customer: 'Olivia Brown', amount: 155.00, status: 'PAID', date: 'Feb 22', avatar: 'https://i.pravatar.cc/150?u=5' },
];

export const AdminDashboard = () => {
  const [recentOrders, setRecentOrders] = useState<OrderListResponse[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMetricsLoading, setIsMetricsLoading] = useState(true);

  useEffect(() => {
    fetchRecentOrders();
    fetchDashboardMetrics();
  }, []);

  const fetchDashboardMetrics = async () => {
    setIsMetricsLoading(true);
    try {
      const data = await adminMetricService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to fetch dashboard metrics', err);
      toast.error('Could not load dashboard metrics');
    } finally {
      setIsMetricsLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const data = await orderService.getAllOrders(0, 10);
      setRecentOrders(data.content);
    } catch (err) {
      console.error('Failed to fetch dashboard orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    [DeliveryStatus.DELIVERED]: 'success',
    [PaymentStatus.COMPLETED]: 'success',
    [DeliveryStatus.PENDING]: 'warning',
    [PaymentStatus.INITIATED]: 'warning',
    [DeliveryStatus.PACKING]: 'info',
    [DeliveryStatus.OUT_FOR_DELIVERY]: 'info',
    [DeliveryStatus.CANCELLED]: 'danger',
    [PaymentStatus.FAILED]: 'danger',
  };
  const kpis: KPICard[] = [
    { label: 'Total Revenue', value: metrics?.totalRevenue || 'GHS 0.00', trend: '0%', isUp: true, icon: DollarSign, color: 'emerald' },
    { label: 'Total Orders', value: metrics?.orderCountMetric.totalOrders.toString() || '0', breakdown: metrics ? { delivered: metrics.orderCountMetric.totalDeliveredOrders, pending: metrics.orderCountMetric.totalPendingOrders, cancelled: metrics.orderCountMetric.totalCancelledOrders } : null, icon: ShoppingBag, color: 'blue' },
    { label: 'Total Customers', value: metrics?.totalCustomers.toString() || '0', trend: '0%', isUp: true, icon: Users, color: 'indigo' },
    { label: 'Total Products', value: metrics?.totalProducts.toString() || '0', trend: '0%', isUp: true, icon: Package, color: 'amber' },
    { label: 'Total Site Visits', value: metrics?.totalSiteVisits.toString() || '0', trend: '0%', isUp: true, icon: Eye, color: 'violet' },
    { label: 'Conversion Rate', value: '0.00%', hint: 'Orders / Visits', icon: Percent, color: 'rose' },
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Executive Overview</h1>
          <p className="text-sm text-zinc-500 mt-1">Performance metrics and key indicators.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* KPI Cards */}
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300 group"
          >
            {isMetricsLoading && kpi.label !== 'Conversion Rate' ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 w-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />
                <div className="h-8 w-24 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
                <div className="h-4 w-16 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-4">
                  <div className={cn(
                    "p-3 rounded-2xl transition-colors",
                    kpi.color === 'emerald' && "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20",
                    kpi.color === 'blue' && "bg-blue-50 dark:bg-blue-500/10 text-blue-600 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20",
                    kpi.color === 'indigo' && "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20",
                    kpi.color === 'rose' && "bg-rose-50 dark:bg-rose-500/10 text-rose-600 group-hover:bg-rose-100 dark:group-hover:bg-rose-500/20",
                    kpi.color === 'amber' && "bg-amber-50 dark:bg-amber-500/10 text-amber-600 group-hover:bg-amber-100 dark:group-hover:bg-amber-500/20",
                    kpi.color === 'violet' && "bg-violet-50 dark:bg-violet-500/10 text-violet-600 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20",
                  )}>
                    <kpi.icon className="h-6 w-6" />
                  </div>
                  {kpi.trend && (
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                      kpi.isUp ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-red-50 text-red-600 dark:bg-red-500/10"
                    )}>
                      {kpi.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                      {kpi.trend}
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">{kpi.value}</h3>
                  <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{kpi.label}</p>
                </div>
                {kpi.breakdown && typeof kpi.breakdown === 'string' && <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500 font-medium pt-4 border-t border-zinc-100 dark:border-zinc-800">{kpi.breakdown}</p>}
                {kpi.breakdown && typeof kpi.breakdown === 'object' && (
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Delivered</p>
                      <p className="text-xs font-bold text-emerald-500">{(kpi.breakdown as any).delivered}</p>
                    </div>
                    <div className="text-center border-x border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Pending</p>
                      <p className="text-xs font-bold text-amber-500">{(kpi.breakdown as any).pending}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mb-1">Cancelled</p>
                      <p className="text-xs font-bold text-rose-500">{(kpi.breakdown as any).cancelled}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        ))}

        {/* Revenue Chart - Spans 2 columns on large screens */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 lg:col-span-2 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                Financial Performance
              </h2>
            </div>
          </div>
          <div className="h-[350px] w-full">
            {!metrics?.dailyRevenueMetric || metrics.dailyRevenueMetric.length === 0 ? (
              <EmptyState icon={<Activity className="w-8 h-8 text-zinc-400" />} title="No Financial Data" description="Revenue metrics will be generated once transactions occur." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.dailyRevenueMetric || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD1DC" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FFD1DC" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" strokeOpacity={0.5} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#999999' }}
                    dy={10}
                    tickFormatter={(val) => {
                      if (!val) return '';
                      const date = new Date(val);
                      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#999999' }}
                    tickFormatter={(val) => `GH₵${val}`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`GH₵${value}`, 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    contentStyle={{
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      backgroundColor: '#18181b',
                      color: '#FFF'
                    }}
                    itemStyle={{ color: '#FFF' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FFD1DC"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Top Products - Vertical List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
        >
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Leading Compositions
          </h2>
          <div className="space-y-6">
            {isMetricsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 rounded" />
                    <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded" />
                  </div>
                </div>
              ))
            ) : !metrics?.top5Compositions || metrics.top5Compositions.length === 0 ? (
              <EmptyState icon={<TrendingUp className="w-8 h-8 text-emerald-500/50" />} title="No Compositions Data" description="Your trending products will show up here." />
            ) : (
              metrics?.top5Compositions.map((product, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {product.productImage ? (
                      <img src={product.productImage} alt={product.productName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Box className="h-5 w-5 opacity-50 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{product.productName}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{product.totalSold} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{formatPrice(product.totalRevenue)}</p>
                    <p className="text-xs text-emerald-500 font-medium">Top {i + 1}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Button variant="ghost" className="w-full mt-6 text-xs" size="sm">
            View All Products
          </Button>
        </motion.div>

        {/* Recent Orders - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 lg:col-span-3 bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                Recent Transactions
              </h2>
            </div>
            <Link to="/admin/orders">
              <Button variant="outline" size="sm" className="rounded-xl">
                View All Orders
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[300px] pr-2 pb-2 custom-scrollbar">
            <table className="w-full text-left border-collapse relative">
              <thead className="sticky top-0 bg-white dark:bg-zinc-900 z-10">
                <tr className="text-xs font-bold uppercase tracking-widest text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="pb-4 pl-4">Order ID</th>
                  <th className="pb-4">Customer</th>
                  <th className="pb-4">Date</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8"><EmptyState icon={<Calendar className="w-8 h-8 text-zinc-400" />} title="Loading orders..." /></td>
                  </tr>
                ) : !recentOrders || recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8"><EmptyState icon={<Package className="w-8 h-8 text-blue-500/50" />} title="No Recent Orders" description="Come back later to see recent transactions made." /></td>
                  </tr>
                ) : recentOrders.map((order, i) => (
                  <tr key={i} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="py-4 pl-4 text-sm font-bold text-zinc-900 dark:text-white">{order.orderNumber}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                          <User className="h-4 w-4 text-zinc-400" />
                        </div>
                        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Customer</span>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-zinc-500 dark:text-zinc-400">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-sm font-bold text-zinc-900 dark:text-white">{formatPrice(order.totalAmount)}</td>
                    <td className="py-4">
                      <div className="flex gap-2">
                        <Badge variant={statusColors[order.paymentStatus] || 'info'}>
                          {order.paymentStatus}
                        </Badge>
                        <Badge variant={statusColors[order.deliveryStatus] || 'info'}>
                          {order.deliveryStatus}
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <Link to={`/admin/orders/${order.orderNumber}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <ArrowRight className="h-4 w-4 text-zinc-400" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
