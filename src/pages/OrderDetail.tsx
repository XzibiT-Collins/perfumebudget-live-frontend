import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Calendar, CreditCard, Truck, User, MapPin, Printer } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { orderService } from '../services/orderService';
import { OrderResponse, DeliveryStatus, PaymentStatus } from '../types';
import { formatPrice, cn, extractErrorMessage } from '../utils';
import toast from 'react-hot-toast';
import { Dropdown } from '../components/Dropdown';

export const OrderDetail = () => {
    const { orderNumber } = useParams<{ orderNumber: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<OrderResponse | null>(null);
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
            const data = await orderService.getOrder(orderNumber!);
            setOrder(data);
        } catch (err: any) {
            toast.error('Failed to load order details');
            navigate('/admin/orders');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: DeliveryStatus) => {
        if (!order || isUpdating) return;

        setIsUpdating(true);
        try {
            await orderService.updateStatus(order.orderNumber, newStatus);
            setOrder({ ...order, deliveryStatus: newStatus });
            toast.success(`Order status updated to ${newStatus}`);
        } catch (err: any) {
            toast.error(extractErrorMessage(err, 'Failed to update status'));
        } finally {
            setIsUpdating(false);
        }
    };

    const handlePrintReceipt = () => {
        if (!order) return;
        const d = order.deliveryDetail;
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt #${order.orderNumber}</title>
                <style>
                    * { box-sizing: border-box; margin: 0; padding: 0; }
                    body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #1A1A1A; max-width: 600px; margin: 0 auto; }
                    h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
                    .sub { font-size: 13px; color: #666; margin-bottom: 28px; }
                    .section { margin-bottom: 24px; }
                    .section-title { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #999; margin-bottom: 10px; }
                    .row { display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
                    .row:last-child { border-bottom: none; }
                    .total-row { font-weight: 700; font-size: 15px; border-top: 2px solid #1A1A1A; padding-top: 10px; margin-top: 6px; }
                    address { font-style: normal; font-size: 13px; line-height: 1.8; color: #444; }
                    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #999; }
                    @media print { body { padding: 20px; } }
                </style>
            </head>
            <body>
                <h1>PERFUME BUDGET</h1>
                <div class="sub">Order Receipt · ${new Date(order.orderDate).toLocaleString()}</div>

                <div class="section">
                    <div class="section-title">Order Info</div>
                    <div class="row"><span>Order #</span><span>${order.orderNumber}</span></div>
                    <div class="row"><span>Payment</span><span>${order.paymentStatus}</span></div>
                    <div class="row"><span>Delivery</span><span>${order.deliveryStatus.replace(/_/g, ' ')}</span></div>
                </div>

                ${d ? `
                <div class="section">
                    <div class="section-title">Delivery Address</div>
                    <address>
                        <strong>${d.recipientName}</strong><br/>
                        ${d.addressLine1}${d.addressLine2 ? ', ' + d.addressLine2 : ''}<br/>
                        ${d.city}, ${d.region}<br/>
                        ${d.landmark ? 'Near: ' + d.landmark + '<br/>' : ''}
                        ${d.phoneNumber}${d.alternatePhoneNumber ? ' / ' + d.alternatePhoneNumber : ''}
                    </address>
                </div>` : ''}

                <div class="section">
                    <div class="section-title">Items</div>
                    ${order.lineItems.map(item => `
                        <div class="row"><span>${item.productName} &times; ${item.quantity}</span><span>${item.totalPrice}</span></div>
                    `).join('')}
                </div>

                    <div class="section">
                    <div class="section-title">Summary</div>
                    <div class="row"><span>Subtotal</span><span>${order.subtotal}</span></div>
                    ${parseFloat(order.discountAmount.replace(/[^0-9.]/g, '')) > 0 ? `<div class="row"><span>Discount</span><span>-${order.discountAmount}</span></div>` : ''}
                    ${order.taxes ? order.taxes.orderTaxes.map(t => `<div class="row"><span>${t.taxName} (${t.taxRate}%)</span><span>GHS ${t.taxAmount.toFixed(2)}</span></div>`).join('') : ''}
                    ${order.taxes ? `<div class="row"><span>Total Tax</span><span>${order.taxes.totalTaxAmount}</span></div>` : ''}
                    <div class="row total-row"><span>Grand Total</span><span>${order.taxes ? order.taxes.totalAmountAfterTax : order.totalAmount}</span></div>
                </div>

                <div class="footer">Thank you for shopping with PerfumeBudget &mdash; ${new Date().getFullYear()}</div>
                <script>window.onload = function() { window.print(); }<\/script>
            </body>
            </html>
        `);
        win.document.close();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-8 w-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!order) return null;

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

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <button
                    onClick={() => navigate('/admin/orders')}
                    className="flex items-center gap-2 text-[#666666] hover:text-[#1A1A1A] dark:text-zinc-400 dark:hover:text-white transition-colors self-start"
                >
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">Back to Orders</span>
                </button>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <div className="w-full sm:w-52 shrink-0">
                        <Dropdown
                            value={order.deliveryStatus}
                            onChange={(val) => handleStatusUpdate(val as DeliveryStatus)}
                            options={Object.values(DeliveryStatus).map((s) => ({ label: s.replace(/_/g, ' '), value: s }))}
                        />
                    </div>
                    <button
                        onClick={handlePrintReceipt}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#E5E5E5] dark:border-zinc-700 text-sm font-semibold text-[#666666] dark:text-zinc-300 hover:bg-[#F5F5F5] dark:hover:bg-zinc-800 transition-colors w-full sm:w-auto shrink-0"
                    >
                        <Printer className="h-4 w-4 shrink-0" />
                        Print Receipt
                    </button>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1 space-y-8">
                    {/* Order Info Card */}
                    <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-[#F5F5F5] dark:border-zinc-800 shadow-sm">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-bold dark:text-white mb-2">Order #{order.orderNumber}</h2>
                                <div className="flex items-center gap-2 text-sm text-[#999999]">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(order.orderDate).toLocaleString()}
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">Payment</span>
                                    <Badge variant={statusColors[order.paymentStatus]}>{order.paymentStatus}</Badge>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">Delivery</span>
                                    <Badge variant={statusColors[order.deliveryStatus]}>{order.deliveryStatus.replace(/_/g, ' ')}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {order.lineItems.map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-4 border-b border-[#F5F5F5] dark:border-zinc-800 last:border-0">
                                    <div className="flex gap-4">
                                        <div className="h-16 w-16 bg-[#F5F5F5] dark:bg-zinc-800 rounded-xl flex items-center justify-center">
                                            <Package className="h-6 w-6 text-[#999999]" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold dark:text-white">{item.productName}</h4>
                                            <p className="text-sm text-[#999999]">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold dark:text-white">{formatPrice(item.totalPrice)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-[#F5F5F5] dark:border-zinc-800 space-y-4">
                            <div className="flex justify-between text-[#666666] dark:text-zinc-400">
                                <span>Subtotal</span>
                                <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            {parseFloat(order.discountAmount.replace(/[^0-9.]/g, '')) > 0 && (
                                <div className="flex justify-between text-[#666666] dark:text-zinc-400">
                                    <span>Discount</span>
                                    <span className="text-red-500">-{formatPrice(order.discountAmount)}</span>
                                </div>
                            )}
                            {order.taxes && order.taxes.orderTaxes.map((tax) => (
                                <div key={tax.id} className="flex justify-between text-[#666666] dark:text-zinc-400">
                                    <span>{tax.taxName} ({tax.taxRate}%)</span>
                                    <span>GHS {tax.taxAmount.toFixed(2)}</span>
                                </div>
                            ))}
                            {order.taxes && (
                                <div className="flex justify-between text-[#666666] dark:text-zinc-400 border-t border-dashed border-[#E5E5E5] dark:border-zinc-700 pt-2">
                                    <span>Total Tax</span>
                                    <span>{order.taxes.totalTaxAmount}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold dark:text-white pt-2 border-t border-[#F5F5F5] dark:border-zinc-800">
                                <span>Grand Total</span>
                                <span className="text-accent-dark dark:text-accent">
                                    {order.taxes ? order.taxes.totalAmountAfterTax : formatPrice(order.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full lg:w-80 space-y-8">
                    {/* Customer & Payment Info */}
                    <div className="bg-[#FBFBFB] dark:bg-zinc-950 rounded-[2rem] p-8 space-y-8 border border-[#F5F5F5] dark:border-zinc-800">
                        {/* Delivery Address */}
                        {order.deliveryDetail && (
                            <div>
                                <div className="flex items-center gap-2 mb-4 text-[#999999]">
                                    <MapPin className="h-4 w-4" />
                                    <span className="text-xs font-bold uppercase tracking-widest">Delivery Address</span>
                                </div>
                                <p className="font-bold dark:text-white text-sm">{order.deliveryDetail.recipientName}</p>
                                <p className="text-sm text-[#666666] dark:text-zinc-400 mt-1 leading-relaxed">
                                    {order.deliveryDetail.addressLine1}
                                    {order.deliveryDetail.addressLine2 ? `, ${order.deliveryDetail.addressLine2}` : ''}, {order.deliveryDetail.city}, {order.deliveryDetail.region}
                                </p>
                                {order.deliveryDetail.landmark && (
                                    <p className="text-xs text-[#999999] dark:text-zinc-500 mt-0.5">Near: {order.deliveryDetail.landmark}</p>
                                )}
                                <p className="text-xs text-[#999999] dark:text-zinc-500 mt-0.5">
                                    {order.deliveryDetail.phoneNumber}
                                    {order.deliveryDetail.alternatePhoneNumber && ` / ${order.deliveryDetail.alternatePhoneNumber}`}
                                </p>
                            </div>
                        )}

                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[#999999]">
                                <User className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Customer</span>
                            </div>
                            <p className="font-bold dark:text-white">Order Retrieval Only</p>
                            <p className="text-sm text-[#666666] dark:text-zinc-400">Details not in response</p>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[#999999]">
                                <CreditCard className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Payment</span>
                            </div>
                            <Badge variant={statusColors[order.paymentStatus]}>{order.paymentStatus}</Badge>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-4 text-[#999999]">
                                <Truck className="h-4 w-4" />
                                <span className="text-xs font-bold uppercase tracking-widest">Delivery</span>
                            </div>
                            <Badge variant={statusColors[order.deliveryStatus]}>{order.deliveryStatus}</Badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
