import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { IOrder } from '../../types';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.getMyOrders();
        if (res.success && res.orders) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl p-6 sm:p-8">
      <h2 className="font-serif text-2xl font-bold text-white mb-2">My Roastery Orders</h2>
      <p className="text-xs text-espresso-400 mb-6">
        Review past roast shipments, tracking numbers, and receipt summaries.
      </p>

      {loading ? (
        <div className="py-12 text-center text-xs text-espresso-400">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xs text-espresso-300 mb-4">You have no order history yet.</p>
          <Link to="/shop" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold">
            Order Fresh Beans Today
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-espresso-800">
          {orders.map((order) => (
            <div key={order._id} className="py-5 first:pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-amber-300">{order.orderNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      order.orderStatus === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      order.orderStatus === 'Shipped' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30' :
                      order.orderStatus === 'Processing' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-espresso-800 text-espresso-300'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-espresso-400 mt-1">
                    Ordered on {new Date(order.createdAt).toLocaleDateString()} &bull; Total: <strong className="text-white">${order.total.toFixed(2)}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/account/orders/${order.orderNumber}`}
                    className="px-4 py-2 bg-espresso-800 hover:bg-espresso-750 text-white text-xs font-semibold rounded-lg border border-espresso-700 transition-colors"
                  >
                    View Details & Tracking
                  </Link>
                </div>
              </div>

              {/* Items preview preview thumbnails */}
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-espresso-950 px-3 py-1.5 rounded-lg border border-espresso-800 shrink-0">
                    <img
                      src={item.image || '/images/arab-mol-product.jpg'}
                      alt={item.name}
                      className="w-7 h-7 rounded object-cover"
                    />
                    <span className="text-[11px] text-espresso-200">{item.name} ({item.variant.weight}) &times; {item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
