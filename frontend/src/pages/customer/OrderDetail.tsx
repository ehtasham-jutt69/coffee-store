import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { IOrder } from '../../types';

export const OrderDetail: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!orderNumber) return;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.getOrderByNumber(orderNumber);
        if (res.success && res.order) {
          setOrder(res.order);
        }
      } catch (err) {
        console.error('Error fetching order detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-espresso-400">Loading order specification...</div>;
  }

  if (!order) {
    return (
      <div className="p-8 text-center">
        <p className="text-xs text-espresso-400 mb-4">Order record could not be retrieved.</p>
        <Link to="/account/orders" className="text-amber-400 text-xs hover:underline">
          &larr; Back to my orders
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-espresso-800">
        <div>
          <Link to="/account/orders" className="text-xs text-amber-400 hover:underline mb-2 block">
            &larr; Back to Order History
          </Link>
          <div className="flex items-center gap-3">
            <h2 className="font-mono text-xl font-bold text-white">Order #{order.orderNumber}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              order.orderStatus === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300' :
              order.orderStatus === 'Shipped' ? 'bg-sky-500/20 text-sky-300' :
              order.orderStatus === 'Processing' ? 'bg-amber-500/20 text-amber-300' :
              'bg-espresso-800 text-espresso-300'
            }`}>
              {order.orderStatus}
            </span>
          </div>
          <p className="text-xs text-espresso-400 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-espresso-400 block">Courier Tracking:</span>
          <span className="font-mono text-xs font-bold text-amber-300">{order.trackingNumber || 'Pending Roastery Hand-off'}</span>
        </div>
      </div>

      {/* Grid of Addresses and Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-espresso-950 p-4 rounded-xl border border-espresso-800">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-2">Shipping Destination</span>
          <p className="text-xs font-semibold text-white">{order.shippingAddress.fullName}</p>
          <p className="text-xs text-espresso-300 mt-1">
            {order.shippingAddress.street}
            {order.shippingAddress.apartment && `, ${order.shippingAddress.apartment}`}<br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
            {order.shippingAddress.country}
          </p>
        </div>

        <div className="bg-espresso-950 p-4 rounded-xl border border-espresso-800">
          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-2">Payment & Shipping</span>
          <p className="text-xs text-espresso-300">
            <strong className="text-white">Payment:</strong> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit Card'} ({order.paymentStatus})
          </p>
          <p className="text-xs text-espresso-300 mt-1">
            <strong className="text-white">Delivery Method:</strong> {order.shippingMethod?.name || 'Standard Ground'}
          </p>
        </div>
      </div>

      {/* Item List */}
      <div>
        <h3 className="font-serif text-base font-bold text-white mb-3">Items In This Shipment</h3>
        <div className="bg-espresso-950 rounded-xl border border-espresso-800 divide-y divide-espresso-850 overflow-hidden">
          {order.items.map((item, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.image || '/images/arab-mol-product.jpg'}
                  alt={item.name}
                  className="w-12 h-12 rounded-lg object-cover bg-espresso-900 border border-espresso-800"
                />
                <div>
                  <p className="text-xs font-semibold text-white">{item.name}</p>
                  <p className="text-[11px] text-espresso-400">
                    {item.variant.weight} &bull; {item.variant.grind} &times; {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-mono text-xs font-bold text-white">
                ${item.totalPrice.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Financials */}
      <div className="bg-espresso-950 p-4 rounded-xl border border-espresso-800 space-y-2 text-xs">
        <div className="flex justify-between text-espresso-300">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-emerald-400">
            <span>Coupon Discount ({order.couponCode})</span>
            <span>-${order.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-espresso-300">
          <span>Shipping Fee</span>
          <span>{order.shippingFee === 0 ? 'FREE' : `$${order.shippingFee.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between text-espresso-300">
          <span>Sales Tax</span>
          <span>${order.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-baseline pt-2 border-t border-espresso-800 font-bold">
          <span className="text-white">Total</span>
          <span className="font-serif text-base text-amber-300">${order.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
