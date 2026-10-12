import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { IOrder } from '../../types';

export const AccountDashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.getMyOrders();
        if (res.success && res.orders) {
          setRecentOrders(res.orders.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load my orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const defaultAddress = user?.addresses?.find(a => a.isDefault) || user?.addresses?.[0];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-espresso-900/40 border border-espresso-800 p-5 rounded-2xl">
          <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold block">Member Status</span>
          <p className="font-serif text-2xl font-bold text-white mt-1">Roaster Gold</p>
          <p className="text-[11px] text-espresso-400 mt-1">Complimentary domestic express eligible</p>
        </div>

        <div className="bg-espresso-900/40 border border-espresso-800 p-5 rounded-2xl">
          <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold block">Total Orders</span>
          <p className="font-serif text-2xl font-bold text-white mt-1">{recentOrders.length}</p>
          <Link to="/account/orders" className="text-[11px] text-amber-400 hover:underline mt-1 block">
            View order history &rarr;
          </Link>
        </div>

        <div className="bg-espresso-900/40 border border-espresso-800 p-5 rounded-2xl">
          <span className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold block">Saved Addresses</span>
          <p className="font-serif text-2xl font-bold text-white mt-1">{user?.addresses?.length || 0}</p>
          <Link to="/account/addresses" className="text-[11px] text-amber-400 hover:underline mt-1 block">
            Manage destinations &rarr;
          </Link>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-serif text-lg font-bold text-white">Recent Orders</h2>
          <Link to="/account/orders" className="text-xs text-amber-400 hover:underline">
            See all orders &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-espresso-400">Loading orders...</div>
        ) : recentOrders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-espresso-400 mb-4">You have not placed any coffee orders yet.</p>
            <Link to="/shop" className="px-4 py-2 bg-amber-600 text-white rounded-lg text-xs font-semibold">
              Browse Roastery Catalog
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-espresso-800">
            {recentOrders.map((order) => (
              <div key={order._id} className="py-4 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-amber-300">{order.orderNumber}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      order.orderStatus === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300' :
                      order.orderStatus === 'Shipped' ? 'bg-sky-500/20 text-sky-300' :
                      order.orderStatus === 'Processing' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-espresso-800 text-espresso-300'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-espresso-400 mt-1">
                    {new Date(order.createdAt).toLocaleDateString()} &bull; {order.items.length} items &bull; ${order.total.toFixed(2)}
                  </p>
                </div>

                <Link
                  to={`/account/orders/${order.orderNumber}`}
                  className="px-4 py-2 bg-espresso-800 hover:bg-espresso-750 text-white text-xs font-semibold rounded-lg border border-espresso-700 self-start sm:self-auto"
                >
                  View Order
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Default Shipping Address Snapshot */}
      <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-serif text-lg font-bold text-white">Default Shipping Destination</h2>
          <Link to="/account/addresses" className="text-xs text-amber-400 hover:underline">
            Edit &rarr;
          </Link>
        </div>

        {defaultAddress ? (
          <div className="text-xs text-espresso-300 space-y-1">
            <p className="font-semibold text-white">{defaultAddress.fullName}</p>
            <p>{defaultAddress.street} {defaultAddress.apartment && `, ${defaultAddress.apartment}`}</p>
            <p>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}</p>
            <p>{defaultAddress.country}</p>
            <p className="text-espresso-400 mt-1">Phone: {defaultAddress.phone}</p>
          </div>
        ) : (
          <p className="text-xs text-espresso-400">No default shipping address on file.</p>
        )}
      </div>
    </div>
  );
};
