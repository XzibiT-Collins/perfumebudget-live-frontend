import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Package, Calendar, CreditCard, User, Printer, CheckCircle, XCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { walkInService } from '../services/walkInService';
import { WalkInOrderResponse, WalkInOrderStatus, WalkInPaymentMethod } from '../types';
import { formatPrice, cn, extractErrorMessage } from '../utils';
import toast from 'react-hot-toast';

export const WalkInOrderDetail = () => {
    const { orderNumber } = useParams<{ orderNumber: string }>();
    const navigate = useNavigate();
    const { hasPermission } = useAuth();
    const canView = hasPermission('WALK_IN_ORDER_VIEW');
    const canMarkPrinted = hasPermission('WALK_IN_ORDER_MARK_RECEIPT_PRINTED');

    const [order, setOrder] = useState<WalkInOrderResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (orderNumber) {
            fetchOrder();
        }
    }, [orderNumber]);

    const fetchOrder = async () => {
        setIsLoading(true);
        try {
            const data = await walkInService.getOrder(orderNumber!);
            setOrder(data);
        } catch (err: any) {
            toast.error('Failed to load walk-in order details');
            navigate('/admin/walk-in');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarkPrinted = async () => {
        if (!order || isUpdating) return;
        setIsUpdating(true);
        try {
            await walkInService.markReceiptPrinted(order.orderNumber);
            setOrder({ ...order, receiptPrinted: true });
            toast.success('Receipt marked as printed');
        } catch (err: any) {
            toast.error(extractErrorMessage(err, 'Failed to update status'));
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePrintReceipt = () => {
        if (!order) return;
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Walk-In Receipt #${order.orderNumber}</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1A1A1A; max-width: 400px; margin: 0 auto; border: 1px solid #eee; }
                    .header { text-align: center; margin-bottom: 20px; }
                    h1 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
                    .sub { font-size: 12px; color: #666; margin-bottom: 20px; }
                    .section { margin-bottom: 20px; }
                    .section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #999; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
                    .row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; }
                    .total-row { font-weight: 700; font-size: 15px; border-top: 1px dashed #1A1A1A; padding-top: 8px; margin-top: 8px; }
                    .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; border-top: 1px solid #eee; padding-top: 15px; }
                    @media print { body { padding: 10px; border: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>PERFUME BUDGET</h1>
                    <div class="sub">IN-STORE PURCHASE</div>
                </div>

                <div class="section">
                    <div class="row"><span>Order #</span><span>${order.orderNumber}</span></div>
                    <div class="row"><span>Date</span><span>${new Date(order.createdAt).toLocaleString()}</span></div>
                    <div class="row"><span>Cashier</span><span>${order.processedBy}</span></div>
                </div>

                <div class="section">
                    <div class="section-title">Customer</div>
                    <div class="row"><span>Name</span><span>${order.customerName || 'Walk-In'}</span></div>
                    ${order.customerPhone ? `<div class="row"><span>Phone</span><span>${order.customerPhone}</span></div>` : ''}
                </div>

                <div class="section">
                    <div class="section-title">Items</div>
                    ${order.items.map(item => `
                        <div class="row"><span>${item.productName} x${item.quantity}</span><span>${item.totalPrice}</span></div>
                    `).join('')}
                </div>

                <div class="section">
                    <div class="row"><span>Subtotal</span><span>${order.subtotal}</span></div>
                    ${parseFloat(order.discountAmount.replace(/[^0-9.]/g, '')) > 0 ? `<div class="row"><span>Discount</span><span>-${order.discountAmount}</span></div>` : ''}
                    <div class="row"><span>Tax</span><span>${order.totalTaxAmount}</span></div>
                    <div class="row total-row"><span>Total</span><span>${order.totalAmount}</span></div>
                    <div class="row"><span>Method</span><span>${order.paymentMethod}</span></div>
                    <div class="row"><span>Paid</span><span>${order.amountPaid}</span></div>
                    ${parseFloat(order.changeGiven.replace(/[^0-9.]/g, '')) > 0 ? `<div class="row"><span>Change</span><span>${order.changeGiven}</span></div>` : ''}
                </div>

                <div class="footer">
                    <p>Thank you for your purchase!</p>
                    <p>Please keep this receipt for your records.</p>
                    <p>${new Date().getFullYear()} Perfume Budget</p>
                </div>
                <script>
                    window.onload = function() { 
                        window.print(); 
                        window.onafterprint = function() { window.close(); };
                    }
                </script>
            </body>
            </html>
        `);
        win.document.close();
        handleMarkPrinted();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!canView) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="h-20 w-20 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500 mb-6">
                    <ShieldAlert className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-serif font-bold dark:text-white mb-2">Access Restricted</h2>
                <p className="text-[#666666] dark:text-zinc-400 max-w-md mx-auto">
                    You do not have permission to view walk-in order details.
                </p>
                <Button variant="outline" className="mt-8" onClick={() => navigate('/admin/walk-in')}>
                    Back to List
                </Button>
            </div>
        );
    }

    if (!order) return null;

    const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
        [WalkInOrderStatus.COMPLETED]: 'success',
        [WalkInOrderStatus.CANCELLED]: 'danger',
        [WalkInOrderStatus.REFUNDED]: 'warning',
    };

    return (
        <div className="space-y-8 pb-12 max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                    onClick={() => navigate('/admin/walk-in')}
                    className="flex items-center gap-2 text-[#666666] hover:text-[#1A1A1A] dark:text-zinc-400 dark:hover:text-white transition-colors self-start"
                >
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">Back to Walk-In Orders</span>
                </button>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {canMarkPrinted && (
                        <button
                            onClick={handlePrintReceipt}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-bold hover:opacity-90 transition-all shadow-lg w-full sm:w-auto shrink-0"
                        >
                            <Printer className="h-4 w-4 shrink-0" />
                            Print & Mark Receipt
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Main Info */}
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-[#F5F5F5] dark:border-zinc-800 shadow-sm relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                            <ShoppingCartIcon size={200} />
                        </div>

                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-bold dark:text-white mb-2">Order #{order.orderNumber}</h2>
                                <div className="flex items-center gap-2 text-sm text-[#999999]">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(order.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                                <Badge variant={statusColors[order.status]}>{order.status}</Badge>
                                {order.receiptPrinted ? (
                                    <div className="flex items-center gap-1.5 text-green-500 text-[10px] font-bold uppercase tracking-widest">
                                        <CheckCircle className="h-3 w-3" />
                                        Receipt Printed
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-amber-500 text-[10px] font-bold uppercase tracking-widest">
                                        <AlertCircle className="h-3 w-3" />
                                        Receipt Pending
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-4 border-b border-[#F5F5F5] dark:border-zinc-800 last:border-0">
                                    <div className="flex gap-4">
                                        <div className="h-16 w-16 bg-[#F5F5F5] dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                                            <Package className="h-6 w-6 text-[#999999]" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold dark:text-white">{item.productName}</h4>
                                            <p className="text-sm text-[#999999]">Qty: {item.quantity} × {item.unitPrice}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold dark:text-white">{item.totalPrice}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-[#F5F5F5] dark:border-zinc-800 space-y-4">
                            <div className="flex justify-between text-[#666666] dark:text-zinc-400">
                                <span>Subtotal</span>
                                <span className="font-bold dark:text-white">{order.subtotal}</span>
                            </div>
                            {parseFloat(order.discountAmount.replace(/[^0-9.]/g, '')) > 0 && (
                                <div className="flex justify-between text-[#666666] dark:text-zinc-400">
                                    <span>Discount</span>
                                    <span className="font-bold text-red-500">-{order.discountAmount}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-[#666666] dark:text-zinc-400">
                                <span>Total Tax</span>
                                <span className="font-bold dark:text-white">{order.totalTaxAmount}</span>
                            </div>
                            <div className="flex justify-between text-xl font-bold dark:text-white pt-2 border-t border-[#F5F5F5] dark:border-zinc-800">
                                <span>Grand Total</span>
                                <span className="text-accent-dark dark:text-accent">
                                    {order.totalAmount}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-80 space-y-8">
                    {/* Customer Info */}
                    <div className="bg-[#FBFBFB] dark:bg-zinc-950 rounded-[2rem] p-8 space-y-8 border border-[#F5F5F5] dark:border-zinc-800 shadow-sm">
                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[#999999]">
                                <User className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Customer</span>
                            </div>
                            <p className="font-bold dark:text-white text-lg">{order.customerName || 'Walk-In Customer'}</p>
                            {order.customerPhone && (
                                <p className="text-sm text-zinc-500 mt-1">{order.customerPhone}</p>
                            )}
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-4">Processed By</p>
                            <p className="text-sm font-medium dark:text-zinc-300">{order.processedBy}</p>
                        </div>

                        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center gap-2 mb-4 text-[#999999]">
                                <CreditCard className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Payment</span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500">Method</span>
                                    <span className="text-xs font-bold dark:text-white">{order.paymentMethod}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs text-zinc-500">Amount Paid</span>
                                    <span className="text-xs font-bold dark:text-white">{order.amountPaid}</span>
                                </div>
                                {parseFloat(order.changeGiven.replace(/[^0-9.]/g, '')) > 0 && (
                                    <div className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                        <span className="text-xs font-bold text-green-700 dark:text-green-400">Change Given</span>
                                        <span className="text-xs font-bold text-green-700 dark:text-green-400">{order.changeGiven}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-accent/5 border border-accent/10">
                        <p className="text-xs text-accent font-bold uppercase tracking-widest mb-2">POS Note</p>
                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                            This order was processed in-store. Stock has been automatically deducted from the inventory.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ShoppingCartIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3H5L5.4 5M5.4 5H21L19 13H7M5.4 5L7 13M7 13L4.707 15.293C4.077 15.923 4.523 17 5.414 17H19M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 17C7.89543 17 7 17.8954 7 19C7 20.1046 7.89543 21 9 21C10.1046 21 11 20.1046 11 19C11 17.8954 10.1046 17 9 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);
