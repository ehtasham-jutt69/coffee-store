import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { api } from '../services/api';
import { IOrder } from '../types';

export const OrderConfirmation: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const [order, setOrder] = useState<IOrder | null>(
    (location.state as any)?.order || null
  );
  const [loading, setLoading] = useState<boolean>(!order);

  useEffect(() => {
    if (!order && orderNumber) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const res = await api.getOrderByNumber(orderNumber);
          if (res.success && res.order) {
            setOrder(res.order);
          }
        } catch (err) {
          console.error('Error fetching order confirmation:', err);
        } finally {
          setLoading(false);
        }
      };

      fetchOrder();
    }
  }, [orderNumber, order]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-espresso-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-600/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-amber-300 text-xs">Retrieving order confirmation details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] bg-espresso-950 flex flex-col items-center justify-center px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-white mb-2">Order Not Found</h2>
        <p className="text-xs text-espresso-400 mb-6">We could not locate this order reference in our roastery records.</p>
        <Link to="/" className="px-6 py-2.5 bg-amber-600 text-white rounded-lg text-xs font-semibold">
          Return to Roastery Home
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header Card */}
        <div className="bg-espresso-900/60 border border-espresso-800 rounded-3xl p-8 sm:p-12 text-center mb-8 shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-5">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Roastery Confirmed</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1 mb-2">
            Thank You For Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-espresso-300 max-w-lg mx-auto mb-6 font-light">
            We have received your coffee order and scheduled your beans for our next morning micro-roast batch.
          </p>

          <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-espresso-950/80 border border-espresso-800 px-6 py-3 rounded-2xl">
            <div>
              <span className="text-[11px] text-espresso-400 block">Order Number</span>
              <span className="font-mono text-sm sm:text-base font-bold text-amber-300">{order.orderNumber}</span>
            </div>
            <div className="h-6 w-px bg-espresso-800 hidden sm:block" />
            <div>
              <span className="text-[11px] text-espresso-400 block">Tracking Reference</span>
              <span className="font-mono text-sm sm:text-base font-bold text-white">{order.trackingNumber || 'KVH-TRK-PENDING'}</span>
            </div>
            <div className="h-6 w-px bg-espresso-800 hidden sm:block" />
            <div>
              <span className="text-[11px] text-espresso-400 block">Estimated Arrival</span>
              <span className="text-sm sm:text-base font-bold text-emerald-400">3-5 Business Days</span>
            </div>
          </div>
        </div>

        {/* ORDER PROGRESS TIMELINE */}
        <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl p-6 sm:p-8 mb-8">
          <h3 className="font-serif text-base font-bold text-white mb-6">Roasting & Fulfillment Sequence</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
            <div className="flex items-center sm:flex-col sm:items-center text-left sm:text-center gap-3 sm:gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                &check;
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Order Placed</p>
                <p className="text-[10px] text-espresso-400">Payment Verified</p>
              </div>
            </div>

            <div className="flex items-center sm:flex-col sm:items-center text-left sm:text-center gap-3 sm:gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 flex items-center justify-center text-xs font-bold shrink-0 animate-pulse">
                2
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-300">Small-Batch Roast</p>
                <p className="text-[10px] text-espresso-400">Drum roast scheduled</p>
              </div>
            </div>

            <div className="flex items-center sm:flex-col sm:items-center text-left sm:text-center gap-3 sm:gap-2">
              <div className="w-8 h-8 rounded-full bg-espresso-800 text-espresso-400 flex items-center justify-center text-xs font-bold shrink-0">
                3
              </div>
              <div>
                <p className="text-xs font-semibold text-espresso-300">Degassing & Packing</p>
                <p className="text-[10px] text-espresso-400">Nitrogen flushed seal</p>
              </div>
            </div>

            <div className="flex items-center sm:flex-col sm:items-center text-left sm:text-center gap-3 sm:gap-2">
              <div className="w-8 h-8 rounded-full bg-espresso-800 text-espresso-400 flex items-center justify-center text-xs font-bold shrink-0">
                4
              </div>
              <div>
                <p className="text-xs font-semibold text-espresso-300">Dispatched</p>
                <p className="text-[10px] text-espresso-400">Courier handed over</p>
              </div>
            </div>
          </div>
        </div>

        {/* ORDER DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Shipping Address */}
          <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl p-6">
            <h3 className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-3">
              Shipping Destination
            </h3>
            <p className="text-sm font-semibold text-white">{order.shippingAddress.fullName}</p>
            <p className="text-xs text-espresso-300 mt-1 leading-relaxed">
              {order.shippingAddress.street}
              {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.country}
            </p>
            <p className="text-xs text-espresso-400 mt-2">{order.customer.email}</p>
          </div>

          {/* Payment Details */}
          <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl p-6">
            <h3 className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-3">
              Payment & Method
            </h3>
            <div className="space-y-1.5 text-xs text-espresso-300">
              <p><strong className="text-white">Method:</strong> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card (Processed)'}</p>
              <p><strong className="text-white">Status:</strong> <span className="text-emerald-400 font-semibold">{order.paymentStatus}</span></p>
              <p><strong className="text-white">Shipping:</strong> {order.shippingMethod?.name || 'Carbon-Neutral Ground'}</p>
            </div>
          </div>
        </div>

        {/* ITEMS LIST */}
        <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl p-6 sm:p-8 mb-8">
          <h3 className="font-serif text-lg font-bold text-white mb-4">Roast Items Ordered</h3>
          <div className="divide-y divide-espresso-800">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-4 first:pt-0 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image || '/images/arab-mol-product.jpg'}
                    alt={item.name}
                    className="w-16 h-16 rounded-lg object-cover bg-espresso-950 border border-espresso-800 shrink-0"
                  />
                  <div>
                    <p className="font-serif text-sm font-bold text-white">{item.name}</p>
                    <p className="text-xs text-espresso-400">
                      {item.variant.weight} &bull; {item.variant.grind} &bull; Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-sm font-bold text-white">
                  ${item.totalPrice.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Financial Breakdown */}
          <div className="border-t border-espresso-800 pt-4 mt-4 space-y-2 text-xs">
            <div className="flex justify-between text-espresso-300">
              <span>Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount Applied</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-espresso-300">
              <span>Shipping</span>
              <span>{order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-espresso-300">
              <span>Sales Tax</span>
              <span>${order.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-espresso-800/80 font-bold">
              <span className="text-white text-sm">Total Paid</span>
              <span className="font-serif text-xl text-amber-300">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/shop"
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            Continue Browsing Roastery
          </Link>
          <Link
            to="/account/orders"
            className="px-6 py-3 bg-espresso-900 hover:bg-espresso-850 border border-espresso-700 text-espresso-200 hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            View In Customer Account Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
