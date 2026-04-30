import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, MapPin, User, Plus, Edit, Trash2, Check, Star } from 'lucide-react';
import React from 'react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import { deliveryDetailService } from '../services/deliveryDetailService';
import { orderService } from '../services/orderService';
import { Dropdown } from '../components/Dropdown';
import { Checkbox } from '../components/Checkbox';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import type {
  DeliveryDetailResponse,
  DeliveryDetailRequest,
  OrderListResponse,
  OrderResponse,
  AddressLabel,
  DeliveryStatus,
  PaymentStatus,
} from '../types';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../utils';

type Tab = 'profile' | 'addresses' | 'orders' | 'history';

const emptyAddress: DeliveryDetailRequest = {
  recipientName: '',
  phoneNumber: '',
  alternatePhoneNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  region: '',
  landmark: '',
  label: 'HOME' as AddressLabel,
  isDefault: true,
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'warning',
  PACKING: 'info',
  OUT_FOR_DELIVERY: 'info',
  DELIVERED: 'success',
  CANCELLED: 'danger',
  INITIATED: 'warning',
  COMPLETED: 'success',
  FAILED: 'danger',
  PAID: 'success',
};

export const CustomerProfile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Addresses
  const [addresses, setAddresses] = useState<DeliveryDetailResponse[]>([]);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<DeliveryDetailResponse | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingAddress, setEditingAddress] = useState<DeliveryDetailResponse | null>(null);
  const [addressForm, setAddressForm] = useState<DeliveryDetailRequest>(emptyAddress);

  // Orders
  const [currentOrders, setCurrentOrders] = useState<OrderListResponse[]>([]);
  const [pastOrders, setPastOrders] = useState<OrderListResponse[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'addresses' || activeTab === 'orders' || activeTab === 'history') {
      if (activeTab !== 'orders' && activeTab !== 'history') {
        loadAddresses();
      }
      if (activeTab === 'orders' || activeTab === 'history') {
        loadOrders();
      }
    }
  }, [activeTab]);

  const loadAddresses = async () => {
    setIsAddressLoading(true);
    try {
      setAddresses(await deliveryDetailService.getMyAddresses());
    } finally { setIsAddressLoading(false); }
  };

  const loadOrders = async () => {
    setIsOrdersLoading(true);
    try {
      const res = await orderService.getMyOrders(0, 50);
      const terminal = ['DELIVERED', 'CANCELLED'];
      setCurrentOrders(res.content.filter((o) => !terminal.includes(o.deliveryStatus)));
      setPastOrders(res.content.filter((o) => terminal.includes(o.deliveryStatus)));
    } finally { setIsOrdersLoading(false); }
  };

  const openOrderDetail = async (orderNumber: string) => {
    try {
      const order = await orderService.getOrder(orderNumber);
      setSelectedOrder(order);
      setIsOrderModalOpen(true);
    } catch { toast.error('Could not load order details'); }
  };

  // Address modal helpers
  const openAddModal = () => {
    setEditingAddress(null);
    setAddressForm({ ...emptyAddress, recipientName: user?.fullName || '' });
    setIsAddressModalOpen(true);
  };

  const openEditModal = (addr: DeliveryDetailResponse) => {
    setEditingAddress(addr);
    setAddressForm({
      recipientName: addr.recipientName,
      phoneNumber: addr.phoneNumber,
      alternatePhoneNumber: addr.alternatePhoneNumber,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      region: addr.region,
      landmark: addr.landmark,
      label: addr.label,
      isDefault: addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        const updated = await deliveryDetailService.updateAddress(editingAddress.id, addressForm);
        setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        toast.success('Address updated');
      } else {
        const added = await deliveryDetailService.addAddress(addressForm);
        setAddresses((prev) => [...prev, added]);
        toast.success('Address added');
      }
      setIsAddressModalOpen(false);
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to save address'));
    }
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;
    setIsDeleting(true);
    try {
      await deliveryDetailService.deleteAddress(addressToDelete.id);
      setAddresses((prev) => prev.filter((a) => a.id !== addressToDelete.id));
      toast.success('Address removed');
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to delete address'));
    } finally {
      setIsDeleting(false);
      setAddressToDelete(null);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await deliveryDetailService.setDefault(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id }))
      );
      toast.success('Default address updated');
    } catch { toast.error('Failed to set default'); }
  };

  const field = (key: keyof DeliveryDetailRequest, label: string, ph = '', req = false) => (
    <Input
      label={label}
      placeholder={ph}
      value={(addressForm[key] as string) || ''}
      onChange={(e) => setAddressForm({ ...addressForm, [key]: e.target.value })}
      required={req}
    />
  );

  const TABS: { id: Tab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'orders', label: 'Current Orders', icon: Package },
    { id: 'history', label: 'Order History', icon: Package },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold dark:text-white mb-8">My Account</h1>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

        {/* ── Mobile: single-row pill tab bar ── */}
        <div className="lg:hidden">
          <div className="flex items-center gap-1.5 bg-[#F5F5F5] dark:bg-zinc-800/60 rounded-2xl p-1 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-zinc-900 text-[#1A1A1A] dark:text-white shadow-sm'
                    : 'text-[#999999] dark:text-zinc-500 hover:text-[#1A1A1A] dark:hover:text-zinc-300'
                }`}
              >
                <tab.icon className={`h-4 w-4 shrink-0 ${activeTab === tab.id ? 'text-accent-dark' : ''}`} />
                <span className="truncate w-full text-center leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Desktop: vertical sidebar ── */}
        <aside className="hidden lg:block w-56 shrink-0">
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-accent-dark text-[#1A1A1A] dark:bg-accent-dark dark:text-[#1A1A1A]'
                    : 'text-[#666666] dark:text-zinc-400 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">

            {/* Profile */}
            {activeTab === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-6 card-shadow">
                <h2 className="font-bold text-lg dark:text-white mb-6">Personal Information</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Full Name</p>
                    <p className="font-semibold dark:text-white">{user?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Email</p>
                    <p className="font-semibold dark:text-white">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">Role</p>
                    <p className="font-semibold dark:text-white">{user?.role}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Addresses */}
            {activeTab === 'addresses' && (
              <motion.div key="addresses" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-bold text-lg dark:text-white">Delivery Addresses</h2>
                  <Button onClick={openAddModal} size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add Address
                  </Button>
                </div>
                {isAddressLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2].map((i) => <div key={i} className="h-24 bg-[#F5F5F5] dark:bg-zinc-800 rounded-2xl" />)}
                  </div>
                ) : addresses.length === 0 ? (
                  <p className="text-[#666666] dark:text-zinc-400 text-sm">No addresses saved yet.</p>
                ) : (
                  addresses.map((addr) => (
                    <div key={addr.id} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 card-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-sm dark:text-white">{addr.recipientName}</p>
                            {addr.isDefault && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#999999] bg-[#F5F5F5] dark:bg-zinc-700 px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#666666] dark:text-zinc-400">
                            {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.region}
                          </p>
                          <p className="text-xs text-[#999999] dark:text-zinc-500 mt-0.5">{addr.phoneNumber}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!addr.isDefault && (
                            <button onClick={() => handleSetDefault(addr.id)} title="Set as default"
                              className="text-[#CCCCCC] hover:text-green-500 transition-colors">
                              <Star className="h-4 w-4" />
                            </button>
                          )}
                          <button onClick={() => openEditModal(addr)}
                            className="text-[#CCCCCC] hover:text-[#666666] dark:hover:text-zinc-200 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button onClick={() => setAddressToDelete(addr)}
                            className="text-[#CCCCCC] hover:text-red-400 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* Current Orders */}
            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <h2 className="font-bold text-lg dark:text-white">Current Orders</h2>
                {isOrdersLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2].map((i) => <div key={i} className="h-20 bg-[#F5F5F5] dark:bg-zinc-800 rounded-2xl" />)}
                  </div>
                ) : currentOrders.length === 0 ? (
                  <p className="text-[#666666] dark:text-zinc-400 text-sm">No active orders.</p>
                ) : (
                  currentOrders.map((order) => (
                    <div key={order.orderId} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 card-shadow flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm dark:text-white">#{order.orderNumber}</p>
                        <p className="text-xs text-[#999999] dark:text-zinc-400 mt-0.5">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                        <div className="flex flex-col gap-1.5 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#999999] w-14">Delivery</span>
                            <Badge variant={STATUS_COLORS[order.deliveryStatus] as any}>
                              {order.deliveryStatus.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#999999] w-14">Payment</span>
                            <Badge variant={STATUS_COLORS[order.paymentStatus] as any}>
                              {order.paymentStatus}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold dark:text-white">{order.totalAmount}</p>
                        <button onClick={() => openOrderDetail(order.orderNumber)}
                          className="text-xs font-bold text-[#666666] dark:text-zinc-400 hover:text-[#1A1A1A] dark:hover:text-white mt-2 transition-colors">
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {/* Order History */}
            {activeTab === 'history' && (
              <motion.div key="history" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4">
                <h2 className="font-bold text-lg dark:text-white">Order History</h2>
                {isOrdersLoading ? (
                  <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-[#F5F5F5] dark:bg-zinc-800 rounded-2xl" />)}
                  </div>
                ) : pastOrders.length === 0 ? (
                  <p className="text-[#666666] dark:text-zinc-400 text-sm">No past orders yet.</p>
                ) : (
                  pastOrders.map((order) => (
                    <div key={order.orderId} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 card-shadow flex items-center justify-between">
                      <div>
                        <p className="font-bold text-sm dark:text-white">#{order.orderNumber}</p>
                        <p className="text-xs text-[#999999] dark:text-zinc-400 mt-0.5">
                          {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                        <div className="flex flex-col gap-1.5 mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#999999] w-14">Delivery</span>
                            <Badge variant={STATUS_COLORS[order.deliveryStatus] as any}>
                              {order.deliveryStatus.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold dark:text-white">{order.totalAmount}</p>
                        <button onClick={() => openOrderDetail(order.orderNumber)}
                          className="text-xs font-bold text-[#666666] dark:text-zinc-400 hover:text-[#1A1A1A] dark:hover:text-white mt-2 transition-colors">
                          View Details →
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Address Modal */}
      <Modal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)}
        title={editingAddress ? 'Edit Address' : 'Add Address'}>
        <form onSubmit={handleAddressSubmit} className="space-y-4">
          {field('recipientName', 'Recipient Name', 'John Doe', true)}
          <div className="grid grid-cols-2 gap-4">
            {field('phoneNumber', 'Phone Number', '+233 ...', true)}
            {field('alternatePhoneNumber', 'Alt. Phone', '+233 ...')}
          </div>
          <AddressAutocomplete
            label="Address Line 1"
            defaultValue={addressForm.addressLine1}
            onAddressSelect={(address) => {
              setAddressForm({
                ...addressForm,
                addressLine1: address.addressLine1,
                city: address.city,
                region: address.region,
              });
            }}
            required
          />
          {field('addressLine2', 'Address Line 2 (optional)', 'Apt, Suite...')}
          <div className="grid grid-cols-2 gap-4">
            {field('city', 'City', 'Accra', true)}
            {field('region', 'Region', 'Greater Accra', true)}
          </div>
          {field('landmark', 'Landmark', 'Near the mall', true)}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Label</label>
            <Dropdown
              value={addressForm.label as string}
              onChange={(val) => setAddressForm({ ...addressForm, label: val as AddressLabel })}
              options={[
                { label: 'Home', value: 'HOME' },
                { label: 'Work', value: 'WORK' },
                { label: 'Office', value: 'OFFICE' },
              ]}
            />
          </div>
          <Checkbox
            checked={addressForm.isDefault}
            onChange={(v) => setAddressForm({ ...addressForm, isDefault: v })}
            label="Set as default address"
          />
          <Button type="submit" className="w-full h-12 rounded-2xl">
            {editingAddress ? 'Save Changes' : 'Add Address'}
          </Button>
        </form>
      </Modal>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)}
          title={`Order #${selectedOrder.orderNumber}`}>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">Delivery</span>
                <Badge variant={STATUS_COLORS[selectedOrder.deliveryStatus] as any}>
                  {selectedOrder.deliveryStatus.replace(/_/g, ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">Payment</span>
                <Badge variant={STATUS_COLORS[selectedOrder.paymentStatus] as any}>
                  {selectedOrder.paymentStatus}
                </Badge>
              </div>
            </div>

            {/* Delivery Address */}
            {selectedOrder.deliveryDetail && (
              <div className="bg-[#F5F5F5] dark:bg-zinc-800 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-3 text-[#999999]">
                  <MapPin className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Delivery Address</span>
                </div>
                <p className="font-bold text-sm dark:text-white">{selectedOrder.deliveryDetail.recipientName}</p>
                <p className="text-xs text-[#666666] dark:text-zinc-400 mt-1 leading-relaxed">
                  {selectedOrder.deliveryDetail.addressLine1}
                  {selectedOrder.deliveryDetail.addressLine2 ? `, ${selectedOrder.deliveryDetail.addressLine2}` : ''}, {selectedOrder.deliveryDetail.city}, {selectedOrder.deliveryDetail.region}
                </p>
                {selectedOrder.deliveryDetail.landmark && (
                  <p className="text-xs text-[#999999] dark:text-zinc-500 mt-0.5">Near: {selectedOrder.deliveryDetail.landmark}</p>
                )}
                <p className="text-xs text-[#999999] dark:text-zinc-500 mt-0.5">
                  {selectedOrder.deliveryDetail.phoneNumber}
                  {selectedOrder.deliveryDetail.alternatePhoneNumber && ` / ${selectedOrder.deliveryDetail.alternatePhoneNumber}`}
                </p>
              </div>
            )}
            <div className="space-y-2">
              {selectedOrder.lineItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm dark:text-white">
                  <span>{item.productName} × {item.quantity}</span>
                  <span>{item.totalPrice}</span>
                </div>
              ))}
            </div>
            <div className="h-px bg-[#F5F5F5] dark:bg-zinc-800" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-[#666666] dark:text-zinc-400">
                <span>Subtotal</span>
                <span>{selectedOrder.subtotal}</span>
              </div>
              {selectedOrder.discountAmount && parseFloat(selectedOrder.discountAmount.replace(/[^0-9.]/g, '')) > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{selectedOrder.discountAmount}</span>
                </div>
              )}
              {selectedOrder.taxes && selectedOrder.taxes.orderTaxes.map((tax) => (
                <div key={tax.id} className="flex justify-between text-sm text-[#666666] dark:text-zinc-400">
                  <span>{tax.taxName} ({tax.taxRate}%)</span>
                  <span>GHS {tax.taxAmount.toFixed(2)}</span>
                </div>
              ))}
              {selectedOrder.taxes && (
                <div className="flex justify-between text-sm text-[#666666] dark:text-zinc-400 border-t border-dashed border-[#E5E5E5] dark:border-zinc-700 pt-2">
                  <span>Total Tax</span>
                  <span>{selectedOrder.taxes.totalTaxAmount}</span>
                </div>
              )}
              <div className="flex justify-between font-bold dark:text-white border-t border-[#F5F5F5] dark:border-zinc-800 pt-2">
                <span>Grand Total</span>
                <span>{selectedOrder.taxes ? selectedOrder.taxes.totalAmountAfterTax : selectedOrder.totalAmount}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Address Confirmation */}
      <ConfirmModal
        isOpen={!!addressToDelete}
        onClose={() => setAddressToDelete(null)}
        onConfirm={handleDeleteAddress}
        title="Remove Address"
        message={
          addressToDelete
            ? <>Are you sure you want to remove the address for <strong>{addressToDelete.recipientName}</strong> at <em>{addressToDelete.addressLine1}, {addressToDelete.city}</em>? This action cannot be undone.</>
            : ''
        }
        confirmLabel="Remove Address"
        isLoading={isDeleting}
      />
    </div>
  );
};
