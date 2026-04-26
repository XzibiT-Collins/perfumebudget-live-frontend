import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, MapPin, Check } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { deliveryDetailService } from '../services/deliveryDetailService';
import { cartService } from '../services/cartService';
import { taxService } from '../services/taxService';
import { useCart } from '../contexts/CartContext';
import type { DeliveryDetailResponse, DeliveryDetailRequest, AddressLabel, TaxCalculationResult } from '../types';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../utils';
import { Dropdown } from '../components/Dropdown';
import { Checkbox } from '../components/Checkbox';
import { AddressAutocomplete } from '../components/AddressAutocomplete';

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
  isDefault: false,
};

export const Checkout = () => {
  const navigate = useNavigate();
  const { totalPrice, refreshCart } = useCart();

  const [addresses, setAddresses] = useState<DeliveryDetailResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [formData, setFormData] = useState<DeliveryDetailRequest>(emptyAddress);
  const [taxResult, setTaxResult] = useState<TaxCalculationResult | null>(null);
  const [isTaxLoading, setIsTaxLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  useEffect(() => {
    deliveryDetailService.getMyAddresses().then((data) => {
      setAddresses(data);
      const def = data.find((a) => a.isDefault);
      if (def) setSelectedAddressId(def.id);
      else if (data.length > 0) setSelectedAddressId(data[0].id);
    }).catch(() => { }).finally(() => setIsAddressLoading(false));
  }, []);

  // Fetch tax breakdown whenever subtotal changes or coupon reaches valid state
  useEffect(() => {
    if (!totalPrice) return;
    const subtotal = parseFloat(totalPrice.replace(/[^0-9.]/g, ''));
    if (isNaN(subtotal) || subtotal <= 0) return;

    // Trigger logic: 
    // 1. If empty, calculate normal tax.
    // 2. If exactly 8, calculate tax + discount.
    // 3. Otherwise (1-7 or >8), show validation error and SKIP API.
    
    if (couponCode.length > 0 && couponCode.length !== 8) {
      setCouponError('Coupon must be 8 characters');
      // We don't clear taxResult immediately to avoid flickering, 
      // but we skip the API call.
      return;
    }

    const effectiveCouponInput = couponCode.length === 8 ? couponCode : undefined;

    setIsTaxLoading(true);
    taxService.calculateTax(subtotal, effectiveCouponInput)
      .then((res) => {
        setTaxResult(res);
        setCouponError(null);
      })
      .catch((err) => {
        setTaxResult(null);
        if (effectiveCouponInput) {
          setCouponError(extractErrorMessage(err, 'Invalid or expired coupon'));
        } else {
          setCouponError(null);
        }
      })
      .finally(() => setIsTaxLoading(false));
  }, [totalPrice, couponCode]);

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const added = await deliveryDetailService.addAddress(formData);
      setAddresses((prev) => [...prev, added]);
      setSelectedAddressId(added.id);
      setIsModalOpen(false);
      setFormData(emptyAddress);
      toast.success('Address added');
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to add address'));
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }
    setIsCheckingOut(true);
    try {
      const paystack = await cartService.checkout(couponCode || undefined);
      // Redirect to Paystack
      window.location.href = paystack.data.authorization_url;
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Checkout failed. Please try again.'));
    } finally {
      setIsCheckingOut(false);
    }
  };

  const field = (key: keyof DeliveryDetailRequest, label: string, placeholder = '', required = false) => (
    <Input
      label={label}
      placeholder={placeholder}
      value={(formData[key] as string) || ''}
      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
      required={required}
    />
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-serif font-bold dark:text-white mb-10">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Delivery Address */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="font-bold text-lg dark:text-white mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Delivery Address
            </h2>

            {isAddressLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse h-24 bg-[#F5F5F5] dark:bg-zinc-800 rounded-2xl" />
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <p className="text-[#666666] dark:text-zinc-400 text-sm mb-4">
                No addresses saved. Add one below.
              </p>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <motion.button
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-colors ${selectedAddressId === addr.id
                      ? 'border-[#1A1A1A] dark:border-white bg-[#F5F5F5] dark:bg-zinc-800'
                      : 'border-[#F5F5F5] dark:border-zinc-800 bg-white dark:bg-zinc-900'
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-sm dark:text-white">{addr.recipientName}</p>
                        <p className="text-xs text-[#666666] dark:text-zinc-400 mt-1">
                          {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                        </p>
                        <p className="text-xs text-[#666666] dark:text-zinc-400">
                          {addr.city}, {addr.region}
                        </p>
                        <p className="text-xs text-[#999999] dark:text-zinc-500 mt-1">{addr.phoneNumber}</p>
                      </div>
                      {selectedAddressId === addr.id && (
                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                      )}
                    </div>
                    {addr.isDefault && (
                      <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider text-[#999999] bg-[#F5F5F5] dark:bg-zinc-700 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            )}

            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-3 flex items-center gap-2 text-sm font-bold text-[#666666] dark:text-zinc-400 hover:text-[#1A1A1A] dark:hover:text-white transition-colors"
            >
              <Plus className="h-4 w-4" /> Add new address
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 card-shadow h-fit space-y-4">
          <h2 className="font-bold text-lg dark:text-white">Order Summary</h2>

          <div className="text-sm space-y-2 text-[#666666] dark:text-zinc-400">
            {/* Subtotal */}
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{totalPrice}</span>
            </div>

            {/* Tax breakdown */}
            {isTaxLoading ? (
              <div className="space-y-2 py-1">
                {[1, 2].map((i) => (
                  <div key={i} className="animate-pulse flex justify-between">
                    <div className="h-3 w-24 bg-[#F5F5F5] dark:bg-zinc-800 rounded" />
                    <div className="h-3 w-12 bg-[#F5F5F5] dark:bg-zinc-800 rounded" />
                  </div>
                ))}
              </div>
            ) : taxResult && taxResult.orderTaxes.length > 0 ? (
              <>
                {taxResult.orderTaxes.map((tax) => (
                  <div key={tax.id} className="flex justify-between">
                    <span>{tax.taxName} ({tax.taxRate}%)</span>
                    <span>GHS {Number(tax.taxAmount).toFixed(2)}</span>
                  </div>
                ))}
                {taxResult.discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>- GHS {Number(taxResult.discount).toFixed(2)}</span>
                  </div>
                )}
              </>
            ) : null}

            <div className="h-px bg-[#F5F5F5] dark:bg-zinc-800" />

            {/* Grand Total */}
            <div className="flex justify-between font-bold text-base dark:text-white">
              <span>Total</span>
              <span>
                {taxResult
                  ? taxResult.totalAmountAfterTax
                  : `GHS ${totalPrice}`}
              </span>
            </div>
          </div>

          {/* Coupon */}
          <div className="pt-2">
            <Input
              placeholder="Enter 8-digit coupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              error={couponError || undefined}
              maxLength={8}
              className="bg-[#F5F5F5] dark:bg-zinc-800 border-none h-11"
            />
          </div>

          <Button
            className="w-full h-12 rounded-2xl"
            onClick={handleCheckout}
            isLoading={isCheckingOut}
            disabled={!selectedAddressId || !!couponError || (couponCode.length > 0 && couponCode.length !== 8)}
          >
            Pay with Paystack
          </Button>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Delivery Address">
        <form onSubmit={handleAddAddress} className="space-y-4">
          {field('recipientName', 'Recipient Name', 'John Doe', true)}
          <div className="grid grid-cols-2 gap-4">
            {field('phoneNumber', 'Phone Number', '+233 ...', true)}
            {field('alternatePhoneNumber', 'Alt. Phone (optional)', '+233 ...')}
          </div>
          <AddressAutocomplete
            label="Address Line 1"
            defaultValue={formData.addressLine1}
            onAddressSelect={(address) => {
              setFormData({
                ...formData,
                addressLine1: address.addressLine1,
                city: address.city,
                region: address.region,
              });
            }}
            required
          />
          {field('addressLine2', 'Address Line 2 (optional)', 'Apt, Suite, etc.')}
          <div className="grid grid-cols-2 gap-4">
            {field('city', 'City', 'Accra', true)}
            {field('region', 'Region', 'Greater Accra', true)}
          </div>
          {field('landmark', 'Landmark', 'Near the mall', true)}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">Label</label>
            <Dropdown
              value={formData.label as string}
              onChange={(val) => setFormData({ ...formData, label: val as AddressLabel })}
              options={[
                { label: 'Home', value: 'HOME' },
                { label: 'Work', value: 'WORK' },
                { label: 'Office', value: 'OFFICE' },
              ]}
            />
          </div>
          <Checkbox
            checked={formData.isDefault}
            onChange={(v) => setFormData({ ...formData, isDefault: v })}
            label="Set as default address"
          />
          <Button type="submit" className="w-full h-12 rounded-2xl">Save Address</Button>
        </form>
      </Modal>
    </div>
  );
};
