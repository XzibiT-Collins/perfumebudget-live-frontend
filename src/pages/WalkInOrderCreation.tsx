import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Dropdown } from '../components/Dropdown';
import { walkInService } from '../services/walkInService';
import { productService } from '../services/productService';
import { taxService } from '../services/taxService';
import {
  WalkInOrderRequest,
  WalkInPaymentMethod,
  ProductListing,
  CustomerSearchResponse,
  WalkInCustomerRequest,
  WalkInDiscountType,
  TaxCalculationResult,
} from '../types';
import { formatPrice, parsePrice, extractErrorMessage } from '../utils';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Trash2, Plus, Minus, Search, User, ShoppingCart, CreditCard, Package, X, Tag, Loader2, ShieldAlert } from 'lucide-react';

interface CartItem extends ProductListing {
  quantity: number;
}

type CustomerMode = 'ANONYMOUS' | 'REGISTERED' | 'WALK_IN';

export const WalkInOrderCreation = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('WALK_IN_ORDER_CREATE');
  const canSearchCustomers = hasPermission('CUSTOMER_SEARCH');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerMode, setCustomerMode] = useState<CustomerMode>('ANONYMOUS');
  const [registeredCustomer, setRegisteredCustomer] = useState<CustomerSearchResponse | null>(null);
  const [walkInCustomer, setWalkInCustomer] = useState<WalkInCustomerRequest>({ name: '', phone: '', email: '' });
  
  const [paymentMethod, setPaymentMethod] = useState<WalkInPaymentMethod>(WalkInPaymentMethod.CASH);
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [splitCashAmount, setSplitCashAmount] = useState<string>('');
  const [splitMobileAmount, setSplitMobileAmount] = useState<string>('');
  
  const [discountType, setDiscountType] = useState<WalkInDiscountType | ''>('');
  const [discountValue, setDiscountValue] = useState<string>('');
  
  const [taxData, setTaxData] = useState<TaxCalculationResult | null>(null);
  const [isCalculatingTax, setIsCalculatingTax] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline Product Search
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const debouncedProductSearch = useDebounce(productSearchQuery, 400);
  const [searchResults, setSearchResults] = useState<ProductListing[]>([]);
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Customer Search
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const debouncedCustomerSearch = useDebounce(customerSearchQuery, 400);
  const [customerSearchResults, setCustomerSearchResults] = useState<CustomerSearchResponse[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);

  // --- Calculations ---
  const subtotal = cart.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
  
  const calculatedDiscount = () => {
    const val = Number(discountValue) || 0;
    if (discountType === WalkInDiscountType.PERCENTAGE) {
      return (subtotal * val) / 100;
    } else if (discountType === WalkInDiscountType.FLAT) {
      return val;
    }
    return 0;
  };

  const discountAmount = calculatedDiscount();
  const netAmount = Math.max(0, subtotal - discountAmount);

  // Dynamic Tax Calculation Effect
  useEffect(() => {
    if (cart.length === 0) {
      setTaxData(null);
      return;
    }

    const fetchTax = async () => {
      setIsCalculatingTax(true);
      try {
        const data = await taxService.calculateTax(netAmount);
        setTaxData(data);
      } catch (err) {
        console.error('Tax calculation failed', err);
      } finally {
        setIsCalculatingTax(false);
      }
    };

    const timer = setTimeout(fetchTax, 300);
    return () => clearTimeout(timer);
  }, [netAmount, cart.length]);

  const total = taxData ? parsePrice(taxData.totalAmountAfterTax) : netAmount;

  const changeGiven = paymentMethod === WalkInPaymentMethod.CASH 
    ? Math.max(0, Number(amountPaid) - total) 
    : 0;

  // --- Handlers ---
  const addToCart = (product: ProductListing) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.productName} added`);
    setProductSearchQuery('');
    setShowResults(false);
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  useEffect(() => {
    if (debouncedProductSearch.trim()) {
      setIsSearchingProducts(true);
      productService.adminSearch({ searchTerm: debouncedProductSearch, page: 0, size: 8 })
        .then((res) => {
          setSearchResults(res.content);
          setShowResults(true);
        })
        .finally(() => setIsSearchingProducts(false));
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedProductSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debouncedCustomerSearch.trim() && customerMode === 'REGISTERED') {
      setIsSearchingCustomers(true);
      walkInService.searchCustomers(debouncedCustomerSearch)
        .then((res) => setCustomerSearchResults(res))
        .finally(() => setIsSearchingCustomers(false));
    } else {
      setCustomerSearchResults([]);
    }
  }, [debouncedCustomerSearch, customerMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (paymentMethod === WalkInPaymentMethod.SPLIT) {
       const totalSplit = Number(splitCashAmount) + Number(splitMobileAmount);
       if (Math.abs(totalSplit - total) > 0.01) {
          toast.error(`Split amounts (${totalSplit.toFixed(2)}) must equal total (${total.toFixed(2)})`);
          return;
       }
    }

    setIsSubmitting(true);
    try {
      const request: WalkInOrderRequest = {
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        paymentMethod,
        amountPaid: Number(amountPaid),
        discountType: discountType || undefined,
        discountValue: discountType ? Number(discountValue) : undefined,
        registeredUserId: customerMode === 'REGISTERED' ? registeredCustomer?.id : undefined,
        walkInCustomer: customerMode === 'WALK_IN' ? walkInCustomer : undefined,
        splitCashAmount: paymentMethod === WalkInPaymentMethod.SPLIT ? Number(splitCashAmount) : undefined,
        splitMobileAmount: paymentMethod === WalkInPaymentMethod.SPLIT ? Number(splitMobileAmount) : undefined,
      };

      const response = await walkInService.placeOrder(request);
      toast.success('Order placed successfully');
      navigate(`/admin/walk-in/${response.orderNumber}`);
    } catch (err: any) {
      toast.error(extractErrorMessage(err, 'Failed to place order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {!canCreate && (
        <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl flex items-center gap-4">
           <div className="h-12 w-12 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
              <ShieldAlert className="h-6 w-6" />
           </div>
           <div>
              <p className="font-bold text-red-900 dark:text-red-400">Creation Restricted</p>
              <p className="text-sm text-red-700 dark:text-red-500/80">You have view-only access. Your account does not have permission to process new sales.</p>
           </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold dark:text-white">New Walk-In Order</h1>
        <Button variant="outline" onClick={() => navigate('/admin/walk-in')}>
          Cancel
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order items */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Product Search & List */}
          <section className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-[#F5F5F5] dark:border-zinc-800">
            <div className="mb-6">
              <h2 className="text-lg font-bold dark:text-white flex items-center gap-2 mb-4">
                <ShoppingCart className="h-5 w-5 text-accent" />
                Add Items
              </h2>
              
              <div className="relative" ref={searchRef}>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search products by name or SKU..."
                    className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-2xl outline-none focus:ring-1 focus:ring-accent dark:text-white border-none text-sm transition-all"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    onFocus={() => productSearchQuery && setShowResults(true)}
                  />
                  {isSearchingProducts && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                  {productSearchQuery && (
                    <button 
                      onClick={() => { setProductSearchQuery(''); setShowResults(false); }}
                      className="absolute right-10 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showResults && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-[#F5F5F5] dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                    <div className="max-h-80 overflow-y-auto">
                      {searchResults.map((p) => (
                        <div key={p.productId} className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors border-b border-[#F5F5F5] dark:border-zinc-800 last:border-0">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                                {p.productImageUrl ? (
                                   <img src={p.productImageUrl} className="w-full h-full object-cover" />
                                ) : (
                                   <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                      <Package className="h-5 w-5" />
                                   </div>
                                )}
                             </div>
                             <div>
                                <p className="font-bold text-sm dark:text-white">{p.productName}</p>
                                <p className="text-xs text-zinc-500">{p.price} • Stock: {p.stockQuantity}</p>
                             </div>
                          </div>
                          <Button size="sm" onClick={() => addToCart(p)} className="h-8 px-4 text-xs">
                            Add Item
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showResults && productSearchQuery && searchResults.length === 0 && !isSearchingProducts && (
                  <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-zinc-900 border border-[#F5F5F5] dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-8 text-center">
                    <p className="text-zinc-400 text-sm">No products found matching your search.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Cart List */}
            <div className="space-y-4">
              {cart.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-[1.5rem] flex flex-col items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-300">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <p className="text-zinc-400 text-sm">Scan products or use search to add items.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F5F5F5] dark:divide-zinc-800">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                       <div className="flex items-center gap-4 w-full sm:w-auto flex-1 min-w-0">
                           <div className="h-16 w-16 rounded-xl bg-zinc-50 dark:bg-zinc-800 overflow-hidden flex-shrink-0 border border-[#F5F5F5] dark:border-zinc-800">
                              {item.productImageUrl ? (
                                 <img src={item.productImageUrl} className="w-full h-full object-cover" />
                              ) : (
                                 <div className="w-full h-full flex items-center justify-center text-[#999999]">
                                    <Package className="h-6 w-6" />
                                 </div>
                              )}
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm truncate dark:text-white">{item.productName}</p>
                              <p className="text-xs text-[#999999]">{item.price} each</p>
                           </div>
                       </div>
                       <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                           <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800 p-1.5 rounded-xl shrink-0">
                              <button 
                                onClick={() => updateQuantity(item.productId, -1)} 
                                className="h-8 w-8 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-zinc-500 transition-colors"
                              >
                                 <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center font-bold text-sm dark:text-white">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.productId, 1)} 
                                className="h-8 w-8 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-zinc-500 transition-colors"
                              >
                                 <Plus className="h-3.5 w-3.5" />
                              </button>
                           </div>
                           <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                               <div className="text-right min-w-[70px] sm:w-28">
                                  <p className="font-bold dark:text-white">{formatPrice(parsePrice(item.price) * item.quantity)}</p>
                               </div>
                               <button 
                                 onClick={() => removeFromCart(item.productId)} 
                                 className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                               >
                                  <Trash2 className="h-5 w-5" />
                               </button>
                           </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Transaction Sidebar */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-sm border border-[#F5F5F5] dark:border-zinc-800 sticky top-24">
              
              {/* Customer Selection */}
              <div className="mb-8 p-6 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-[#F5F5F5] dark:border-zinc-800">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-4 flex items-center gap-2">
                    <User className="h-3.5 w-3.5" />
                    Customer Info
                 </h3>
                 
                 <div className="space-y-4">
                    <Dropdown
                       value={customerMode}
                       onChange={(val) => {
                          setCustomerMode(val as CustomerMode);
                          setRegisteredCustomer(null);
                          setCustomerSearchQuery('');
                       }}
                       options={[
                          { label: 'Anonymous Guest', value: 'ANONYMOUS' },
                          ...(canSearchCustomers ? [{ label: 'Existing Customer', value: 'REGISTERED' as CustomerMode }] : []),
                          { label: 'New Walk-In', value: 'WALK_IN' },
                       ]}
                    />

                    {customerMode === 'REGISTERED' && canSearchCustomers && (
                       <div className="space-y-3">
                          {!registeredCustomer ? (
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                                <input
                                   type="text"
                                   placeholder="Search customers..."
                                   className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-zinc-900 border border-[#F5F5F5] dark:border-zinc-800 rounded-xl outline-none focus:ring-1 focus:ring-accent dark:text-white text-xs"
                                   value={customerSearchQuery}
                                   onChange={(e) => setCustomerSearchQuery(e.target.value)}
                                />
                                {customerSearchResults.length > 0 && (
                                   <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-[#F5F5F5] dark:border-zinc-800 rounded-xl shadow-2xl z-[60] max-h-40 overflow-y-auto">
                                      {customerSearchResults.map(c => (
                                         <button
                                            key={c.id}
                                            onClick={() => { setRegisteredCustomer(c); setCustomerSearchResults([]); }}
                                            className="w-full px-3 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 text-[10px] border-b border-[#F5F5F5] dark:border-zinc-800 last:border-0"
                                         >
                                            <p className="font-bold dark:text-white">{c.fullName}</p>
                                            <p className="text-zinc-500">{c.phone || c.email}</p>
                                         </button>
                                      ))}
                                   </div>
                                )}
                             </div>
                          ) : (
                             <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-accent/20 rounded-xl">
                                <div className="min-w-0">
                                   <p className="font-bold text-[10px] dark:text-white truncate">{registeredCustomer.fullName}</p>
                                   <p className="text-[9px] text-[#999999] truncate">{registeredCustomer.email}</p>
                                </div>
                                <button onClick={() => setRegisteredCustomer(null)} className="text-[9px] font-bold text-accent uppercase tracking-widest">Change</button>
                             </div>
                          )}
                       </div>
                    )}

                    {customerMode === 'WALK_IN' && (
                       <div className="space-y-3">
                          <Input 
                             label="Name" 
                             className="h-10 text-xs"
                             value={walkInCustomer.name || ''} 
                             onChange={(e) => setWalkInCustomer({...walkInCustomer, name: e.target.value})} 
                             required
                          />
                          <Input 
                             label="Phone" 
                             className="h-10 text-xs"
                             value={walkInCustomer.phone || ''} 
                             onChange={(e) => setWalkInCustomer({...walkInCustomer, phone: e.target.value})} 
                             required
                          />
                       </div>
                    )}
                 </div>
              </div>

              <div className="flex justify-between items-center mb-8 border-b border-[#F5F5F5] dark:border-zinc-800 pb-4">
                <h2 className="text-lg font-bold dark:text-white">Transaction Summary</h2>
                {isCalculatingTax && <Loader2 className="h-4 w-4 text-accent animate-spin" />}
              </div>
              
              <div className="space-y-4 mb-8">
                 <div className="flex justify-between text-sm text-[#666666] dark:text-zinc-400">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-bold dark:text-white">{formatPrice(subtotal)}</span>
                 </div>
                 <div className="flex justify-between text-sm text-[#666666] dark:text-zinc-400">
                    <span className="font-medium">Discount</span>
                    <span className="font-bold text-green-500">- {formatPrice(discountAmount)}</span>
                 </div>
                 <div className="flex justify-between text-sm text-[#666666] dark:text-zinc-400">
                    <span className="font-medium">Total Tax</span>
                    <span className="font-bold dark:text-white">
                      {taxData ? taxData.totalTaxAmount : formatPrice(0)}
                    </span>
                 </div>
                 <div className="h-px bg-[#F5F5F5] dark:bg-zinc-800 my-4" />
                 <div className="flex justify-between text-2xl font-bold dark:text-white">
                    <span>Grand Total</span>
                    <span className="text-accent-dark dark:text-accent">
                      {taxData ? taxData.totalAmountAfterTax : formatPrice(total)}
                    </span>
                 </div>
              </div>

              {/* Discount Selection */}
              <div className="mb-6 p-6 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-[#F5F5F5] dark:border-zinc-800">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-4 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5" />
                    Apply Discount
                 </h3>
                 <div className="space-y-4">
                    <Dropdown
                       value={discountType}
                       onChange={(val) => {
                          setDiscountType(val as WalkInDiscountType | '');
                          if (!val) setDiscountValue('');
                       }}
                       options={[
                          { label: 'No Discount', value: '' },
                          { label: 'Percentage (%)', value: WalkInDiscountType.PERCENTAGE },
                          { label: 'Flat Amount', value: WalkInDiscountType.FLAT },
                       ]}
                    />
                    {discountType && (
                       <Input 
                          label={discountType === WalkInDiscountType.PERCENTAGE ? "Discount Percentage" : "Discount Amount"}
                          type="number"
                          step="0.01"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          className="h-10 text-xs"
                          placeholder={discountType === WalkInDiscountType.PERCENTAGE ? "e.g. 10" : "e.g. 50.00"}
                       />
                    )}
                 </div>
              </div>

              {/* Payment Section */}
              <div className="mb-8 p-6 bg-zinc-50 dark:bg-zinc-950/50 rounded-2xl border border-[#F5F5F5] dark:border-zinc-800">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-4 flex items-center gap-2">
                    <CreditCard className="h-3.5 w-3.5" />
                    Payment Method
                 </h3>
                 
                 <div className="space-y-4">
                    <Dropdown
                       value={paymentMethod}
                       onChange={(val) => setPaymentMethod(val as WalkInPaymentMethod)}
                       options={Object.values(WalkInPaymentMethod).map(m => ({
                          label: m.replace('_', ' '),
                          value: m
                       }))}
                    />

                    {paymentMethod !== WalkInPaymentMethod.SPLIT ? (
                       <Input 
                          label="Amount Paid" 
                          type="number" 
                          step="0.01" 
                          value={amountPaid} 
                          onChange={(e) => setAmountPaid(e.target.value)} 
                          required
                       />
                    ) : (
                      <div className="space-y-4 pt-2 border-t border-[#F5F5F5] dark:border-zinc-800">
                          <Input 
                             label="Split: Cash" 
                             type="number" 
                             step="0.01" 
                             value={splitCashAmount} 
                             onChange={(e) => {
                                setSplitCashAmount(e.target.value);
                                setAmountPaid(String(Number(e.target.value) + Number(splitMobileAmount)));
                             }} 
                             required
                          />
                          <Input 
                             label="Split: Mobile" 
                             type="number" 
                             step="0.01" 
                             value={splitMobileAmount} 
                             onChange={(e) => {
                                setSplitMobileAmount(e.target.value);
                                setAmountPaid(String(Number(splitCashAmount) + Number(e.target.value)));
                             }} 
                             required
                          />
                      </div>
                    )}
                 </div>
              </div>

              {paymentMethod === WalkInPaymentMethod.CASH && Number(amountPaid) > total && (
                 <div className="p-5 bg-green-50 dark:bg-green-900/20 rounded-2xl mb-8 border border-green-100 dark:border-green-900/30">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-widest">Change Due</span>
                       <span className="text-xl font-bold text-green-700 dark:text-green-400">{formatPrice(changeGiven)}</span>
                    </div>
                 </div>
              )}

              <Button 
                 className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-accent/10 transition-transform active:scale-[0.98]" 
                 onClick={handleSubmit} 
                 isLoading={isSubmitting || isCalculatingTax}
                 disabled={cart.length === 0 || !canCreate}
              >
                 {canCreate ? 'Complete Purchase' : 'Creation Disabled'}
              </Button>
              
              <p className="mt-6 text-[10px] text-center text-[#999999] dark:text-zinc-500 font-bold uppercase tracking-widest">
                Action will deduct stock & record sale
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
