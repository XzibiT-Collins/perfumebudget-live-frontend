import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Percent, Calendar, Sparkles, Clock, Trash2, Tag, Play } from 'lucide-react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ConfirmModal } from '../components/ConfirmModal';
import { shopDiscountService } from '../services/shopDiscountService';
import type { ShopWideDiscountResponse } from '../types';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../utils';

export const ShopWideDiscountManagement = () => {
  const [currentDiscount, setCurrentDiscount] = useState<ShopWideDiscountResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [label, setLabel] = useState('');
  const [percentage, setPercentage] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isEndConfirmOpen, setIsEndConfirmOpen] = useState(false);

  const loadCurrentDiscount = async () => {
    setIsLoading(true);
    try {
      const discount = await shopDiscountService.getCurrentShopDiscount();
      setCurrentDiscount(discount);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        // 404 is the expected response when no store-wide sale is active. Treat it as empty state.
        setCurrentDiscount(null);
      } else {
        toast.error(extractErrorMessage(err, 'Failed to retrieve current shop sale campaign'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentDiscount();
  }, []);

  const handleDeactivate = async () => {
    if (!currentDiscount) return;
    setIsDeactivating(true);
    toast.loading('Deactivating campaign...', { id: 'deactivate-campaign' });
    try {
      await shopDiscountService.deactivateShopDiscount(currentDiscount.id);
      toast.success('Shop-wide sale deactivated successfully', { id: 'deactivate-campaign' });
      setCurrentDiscount(null);
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Could not deactivate the sale campaign'), { id: 'deactivate-campaign' });
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const percentVal = parseFloat(percentage);
    
    if (!label.trim()) {
      toast.error('Sale campaign name label is required');
      return;
    }

    if (isNaN(percentVal) || percentVal <= 0 || percentVal > 100) {
      toast.error('Discount percentage must be strictly between 0% and 100%');
      return;
    }

    if (!startAt || !endAt) {
      toast.error('Both start and end dates are required');
      return;
    }

    const start = new Date(startAt);
    const end = new Date(endAt);
    if (end <= start) {
      toast.error('End date must be after the start date');
      return;
    }

    setIsSubmitting(true);
    try {
      // Backend expects timestamps in YYYY-MM-DDTHH:MM:SS format
      const formattedStart = startAt.includes(':00') ? startAt : `${startAt}:00`;
      const formattedEnd = endAt.includes(':00') ? endAt : `${endAt}:00`;

      const response = await shopDiscountService.setShopDiscount({
        label,
        discountPercentage: percentVal,
        startAt: formattedStart,
        endAt: formattedEnd,
      });

      toast.success('Shop-wide sale campaign activated successfully!');
      setCurrentDiscount(response);
      setLabel('');
      setPercentage('');
      setStartAt('');
      setEndAt('');
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to create shop-wide discount campaign'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Shop-wide Sale Campaigns</h1>
        <p className="text-sm text-[#666666] dark:text-zinc-400 mt-1">
          Launch and manage time-bound discount percentages applied store-wide.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Column: Active Sale & New Sale form */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Sale Display */}
          <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-[#F5F5F5] dark:border-zinc-800 relative overflow-hidden">
            
            {/* Background glowing gradient when a sale is active */}
            {currentDiscount?.currentlyActive && (
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-dark/5 dark:bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
            )}

            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2 mb-6 border-b border-[#F5F5F5] dark:border-zinc-800 pb-4">
              <Sparkles className="h-5 w-5 text-accent-dark" />
              Current Campaign
            </h2>

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-16 bg-[#F5F5F5] dark:bg-zinc-800 rounded-2xl" />
                <div className="h-24 bg-[#F5F5F5] dark:bg-zinc-800 rounded-2xl" />
              </div>
            ) : currentDiscount ? (
              <div className="space-y-6">
                
                {/* Sale info card */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-gradient-to-r from-accent/10 to-accent-dark/5 dark:from-zinc-800/40 dark:to-zinc-950/20 rounded-[1.5rem] border border-accent/20 dark:border-zinc-800 gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center text-[#1A1A1A]">
                      <Percent className="h-6 w-6 font-bold" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg dark:text-white leading-tight">{currentDiscount.label}</h3>
                      <p className="text-xs text-[#999999] dark:text-zinc-500 mt-1 uppercase tracking-widest font-bold">Store-wide Sale</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-extrabold text-accent-dark dark:text-accent">{Math.round(currentDiscount.discountPercentage)}% OFF</p>
                  </div>
                </div>

                {/* Campaign Timeline Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl flex items-center gap-3">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    <div>
                      <p className="text-[10px] text-[#999999] uppercase font-bold tracking-widest">Starts At</p>
                      <p className="font-semibold dark:text-white mt-0.5">{new Date(currentDiscount.startAt).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-zinc-400" />
                    <div>
                      <p className="text-[10px] text-[#999999] uppercase font-bold tracking-widest">Ends At</p>
                      <p className="font-semibold dark:text-white mt-0.5">{new Date(currentDiscount.endAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Campaign Status Check */}
                <div className="flex items-center justify-between border-t border-[#F5F5F5] dark:border-zinc-800 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Status:</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      currentDiscount.currentlyActive 
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                        : new Date(currentDiscount.endAt) < new Date()
                        ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                    }`}>
                      {currentDiscount.currentlyActive 
                        ? 'Live Now' 
                        : new Date(currentDiscount.endAt) < new Date()
                        ? 'Expired'
                        : 'Scheduled / Pending'}
                    </span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEndConfirmOpen(true)} 
                    isLoading={isDeactivating} 
                    className="text-red-500 border-red-100 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs px-4 py-2 h-auto flex gap-2 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4" /> End Campaign
                  </Button>
                </div>

              </div>
            ) : (
              <div className="py-10 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[1.5rem] flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-300 dark:text-zinc-700">
                  <Percent className="h-6 w-6" />
                </div>
                <p className="font-bold text-sm dark:text-white">No current shop-wide sale</p>
                <p className="text-zinc-400 text-xs max-w-sm px-6">Every product is sold at its listing price. Configure a store-wide percentage discount campaign in the form below.</p>
              </div>
            )}

          </section>

          {/* Create Campaign Form */}
          <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-[#F5F5F5] dark:border-zinc-800">
            <h2 className="text-lg font-bold dark:text-white flex items-center gap-2 mb-6 border-b border-[#F5F5F5] dark:border-zinc-800 pb-4">
              <Play className="h-4 w-4 text-accent-dark" />
              Configure Store-wide Sale
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Campaign Name / Label"
                  placeholder="e.g. Summer Warm Up, Black Friday Sale"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                />
                <Input
                  label="Discount Percentage (%)"
                  placeholder="e.g. 15 for 15% off everything"
                  type="number"
                  step="0.01"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Campaign Start Date"
                  type="datetime-local"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  required
                />
                <Input
                  label="Campaign End Date"
                  type="datetime-local"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  required
                />
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl flex gap-3 text-xs text-zinc-500 leading-normal border border-dashed border-zinc-100 dark:border-zinc-800">
                <Clock className="h-4 w-4 text-accent-dark shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#1A1A1A] dark:text-white block mb-0.5">Important Rules & Precedence:</span>
                  <span>
                    Setting a new campaign automatically retires any previously active or scheduled store-wide discount.
                    Individual product-specific sales **take precedence** over store-wide percentages. Cart coupons cannot stack with store-wide active sales.
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-accent/5 transition-transform active:scale-[0.98]"
              >
                Launch Sale Campaign
              </Button>

            </form>
          </section>

        </div>

        {/* Right Column: Dynamic Info Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-[#F5F5F5] dark:border-zinc-800 space-y-6">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#999999] flex items-center gap-2 pb-2 border-b border-[#F5F5F5] dark:border-zinc-800">
              <Tag className="h-3.5 w-3.5" /> Campaign Insights
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl">
                <h4 className="font-bold text-xs dark:text-white mb-1">DYNAMIC WINDOWING</h4>
                <p className="text-[11px] text-zinc-500 leading-normal">Campaigns activate and expire automatically matching their start and end dates. No manual activate toggles needed.</p>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl">
                <h4 className="font-bold text-xs dark:text-white mb-1">PRODUCT PRECEDENCE</h4>
                <p className="text-[11px] text-zinc-500 leading-normal">If a product has its own custom discount active, that specific discount overrides the store-wide percentage for that product.</p>
              </div>

              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-2xl">
                <h4 className="font-bold text-xs dark:text-white mb-1">COUPON REJECTION</h4>
                <p className="text-[11px] text-zinc-500 leading-normal">When store-wide discount is active, checkout coupon code logic rejects coupon codes during checkout automatically.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <ConfirmModal
        isOpen={isEndConfirmOpen}
        onClose={() => setIsEndConfirmOpen(false)}
        onConfirm={() => {
          setIsEndConfirmOpen(false);
          handleDeactivate();
        }}
        title="End Campaign"
        message={
          <>
            Are you sure you want to end the <strong>{currentDiscount?.label}</strong> campaign? This will immediately deactivate the store-wide discount for all customers.
          </>
        }
        confirmLabel="Yes, End Campaign"
        cancelLabel="Keep Active"
        isDestructive
        isLoading={isDeactivating}
      />
    </div>
  );
};
