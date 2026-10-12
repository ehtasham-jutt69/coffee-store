import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { IOrder } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const { showToast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminOrders(statusFilter ? { status: statusFilter } : {});
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleStatusChange = async (orderId: string, newOrderStatus: string, newPaymentStatus?: string) => {
    try {
      const payload: any = { orderStatus: newOrderStatus };
      if (newPaymentStatus) payload.paymentStatus = newPaymentStatus;

      const res = await api.updateOrderStatus(orderId, payload);
      if (res.success && res.order) {
        setOrders(prev => prev.map(o => o._id === orderId ? res.order : o));
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(res.order);
        }
        showToast(`Order status updated to "${newOrderStatus}".`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status.', 'error');
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.email?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.lastName?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Roastery Orders & Fulfillment</h1>
        <p className="text-xs text-espresso-400 mt-1">
          Monitor incoming customer shipments, update roasting stage, and trigger fulfillment dispatch.
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or email..."
            className="bg-espresso-950 border border-espresso-700 rounded-lg px-3.5 py-2 text-xs text-white placeholder-espresso-500 min-w-[240px] focus:outline-none focus:border-amber-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-espresso-200 focus:outline-none focus:border-amber-500"
          >
            <option value="">All Statuses ({orders.length})</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing / Roasting</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <span className="text-xs text-espresso-400">
          Showing <strong className="text-amber-400">{filteredOrders.length}</strong> orders
        </span>
      </div>

      {/* Orders Table */}
      <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-espresso-400">Loading fulfillment queue...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-espresso-950/80 border-b border-espresso-800 text-espresso-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Order #</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Placed Date</th>
                  <th className="py-3 px-4 font-semibold">Total Amount</th>
                  <th className="py-3 px-4 font-semibold">Payment</th>
                  <th className="py-3 px-4 font-semibold">Roast Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso-850">
                {filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-espresso-850/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">
                      {o.orderNumber}
                    </td>
                    <td className="py-3 px-4 text-white">
                      <p className="font-semibold">{o.customer?.firstName} {o.customer?.lastName}</p>
                      <p className="text-[10px] text-espresso-400">{o.customer?.email}</p>
                    </td>
                    <td className="py-3 px-4 text-espresso-400">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      ${o.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={o.paymentStatus}
                        onChange={(e) => handleStatusChange(o._id, o.orderStatus, e.target.value)}
                        className={`text-[10px] font-semibold rounded-md px-2 py-1 border bg-espresso-950 ${
                          o.paymentStatus === 'Paid'
                            ? 'text-emerald-300 border-emerald-500/40'
                            : 'text-amber-300 border-amber-500/40'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => handleStatusChange(o._id, e.target.value)}
                        className={`text-[10px] font-semibold rounded-md px-2 py-1 border bg-espresso-950 ${
                          o.orderStatus === 'Delivered' ? 'text-emerald-300 border-emerald-500/40' :
                          o.orderStatus === 'Shipped' ? 'text-sky-300 border-sky-500/40' :
                          o.orderStatus === 'Processing' ? 'text-amber-300 border-amber-500/40' :
                          'text-espresso-300 border-espresso-700'
                        }`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="px-3 py-1 bg-espresso-800 hover:bg-espresso-750 text-white rounded text-[11px] border border-espresso-700"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-espresso-900 border border-espresso-800 rounded-2xl max-w-xl w-full p-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-espresso-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Order Specification</span>
                <h3 className="font-mono text-lg font-bold text-white">#{selectedOrder.orderNumber}</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-espresso-400 hover:text-white text-lg">
                &times;
              </button>
            </div>

            {/* Details */}
            <div className="space-y-4 text-xs">
              <div className="bg-espresso-950 p-3 rounded-xl border border-espresso-800">
                <span className="text-[10px] uppercase text-espresso-400 font-bold block mb-1">Customer & Address</span>
                <p className="font-semibold text-white">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName} ({selectedOrder.customer.email})</p>
                <p className="text-espresso-300 mt-1">
                  {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                </p>
                <p className="text-espresso-400 mt-1">Phone: {selectedOrder.customer.phone}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase text-espresso-400 font-bold block mb-2">Item Manifest</span>
                <div className="divide-y divide-espresso-800 bg-espresso-950 rounded-xl border border-espresso-800">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <img src={item.image || '/images/arab-mol-product.jpg'} alt={item.name} className="w-8 h-8 rounded object-cover" />
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-[10px] text-espresso-400">{item.variant.weight} &bull; {item.variant.grind} &times; {item.quantity}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-white">${item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-espresso-950 p-3 rounded-xl border border-espresso-800 flex justify-between font-bold text-sm">
                <span>Total Charge:</span>
                <span className="text-amber-300 font-serif">${selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-espresso-800 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2 bg-espresso-800 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
