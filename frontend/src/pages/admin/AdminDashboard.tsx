import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.getAdminStats();
        if (res.success && res.stats) {
          setStats(res.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-600/30 border-t-amber-500 rounded-full animate-spin mb-3" />
        <p className="text-xs text-espresso-400">Loading roastery telemetry and metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Roastery Command Center</h1>
        <p className="text-xs text-espresso-400 mt-1">Real-time specialty inventory, fulfillment telemetry, and store metrics.</p>
      </div>

      {/* METRIC TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-espresso-900/60 border border-espresso-800 p-5 rounded-2xl">
          <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">Total Gross Sales</span>
          <p className="font-serif text-3xl font-bold text-white mt-2">${(stats?.totalRevenue || 0).toFixed(2)}</p>
          <p className="text-[11px] text-emerald-400 mt-1">&uarr; 18.4% vs previous cycle</p>
        </div>

        <div className="bg-espresso-900/60 border border-espresso-800 p-5 rounded-2xl">
          <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">Processed Orders</span>
          <p className="font-serif text-3xl font-bold text-white mt-2">{stats?.totalOrders || 0}</p>
          <p className="text-[11px] text-espresso-400 mt-1">Across all shipping zones</p>
        </div>

        <div className="bg-espresso-900/60 border border-espresso-800 p-5 rounded-2xl">
          <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">Active Coffees</span>
          <p className="font-serif text-3xl font-bold text-white mt-2">{stats?.totalProducts || 0}</p>
          <p className="text-[11px] text-espresso-400 mt-1">Single origin & blends</p>
        </div>

        <div className="bg-espresso-900/60 border border-espresso-800 p-5 rounded-2xl">
          <span className="text-[11px] uppercase font-bold text-amber-400 tracking-wider">Registered Patrons</span>
          <p className="font-serif text-3xl font-bold text-white mt-2">{stats?.totalCustomers || 0}</p>
          <p className="text-[11px] text-amber-300 mt-1">Club coffee subscribers</p>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-serif text-lg font-bold text-white">Recent Customer Shipments</h2>
          <Link to="/admin/orders" className="text-xs text-amber-400 hover:underline">
            Manage All Orders &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-espresso-800 text-espresso-400">
                <th className="pb-3 font-semibold">Order #</th>
                <th className="pb-3 font-semibold">Customer</th>
                <th className="pb-3 font-semibold">Items</th>
                <th className="pb-3 font-semibold">Total</th>
                <th className="pb-3 font-semibold">Payment</th>
                <th className="pb-3 font-semibold">Fulfillment</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-espresso-850">
              {stats?.recentOrders?.map((order: any) => (
                <tr key={order._id} className="hover:bg-espresso-850/40 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-amber-300">{order.orderNumber}</td>
                  <td className="py-3.5 text-white font-medium">
                    {order.customer?.firstName} {order.customer?.lastName}<br />
                    <span className="text-[11px] text-espresso-400">{order.customer?.email}</span>
                  </td>
                  <td className="py-3.5 text-espresso-300">{order.items?.length} roasts</td>
                  <td className="py-3.5 font-mono font-semibold text-white">${order.total?.toFixed(2)}</td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      order.paymentStatus === 'Paid' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      order.orderStatus === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300' :
                      order.orderStatus === 'Shipped' ? 'bg-sky-500/20 text-sky-300' :
                      order.orderStatus === 'Processing' ? 'bg-amber-500/20 text-amber-300' :
                      'bg-espresso-800 text-espresso-300'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <Link
                      to="/admin/orders"
                      className="px-2.5 py-1 bg-espresso-800 hover:bg-espresso-750 text-white rounded text-[11px] border border-espresso-700"
                    >
                      Update
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK ROASTERY ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          to="/admin/products"
          className="bg-espresso-900/40 border border-espresso-800 hover:border-amber-500/40 p-5 rounded-2xl transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="font-serif text-base font-bold text-white group-hover:text-amber-300">Catalog Manager</h3>
          <p className="text-xs text-espresso-400 mt-1">Adjust pricing, bag weight variants, cupping notes, and roast stock.</p>
        </Link>

        <Link
          to="/admin/coupons"
          className="bg-espresso-900/40 border border-espresso-800 hover:border-amber-500/40 p-5 rounded-2xl transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3 className="font-serif text-base font-bold text-white group-hover:text-amber-300">Promotions & Codes</h3>
          <p className="text-xs text-espresso-400 mt-1">Configure percentage discounts, fixed reductions, and free shipping vouchers.</p>
        </Link>

        <Link
          to="/admin/reviews"
          className="bg-espresso-900/40 border border-espresso-800 hover:border-amber-500/40 p-5 rounded-2xl transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <h3 className="font-serif text-base font-bold text-white group-hover:text-amber-300">Review Moderation</h3>
          <p className="text-xs text-espresso-400 mt-1">Review incoming brew ratings and public tasting commentary.</p>
        </Link>
      </div>
    </div>
  );
};
