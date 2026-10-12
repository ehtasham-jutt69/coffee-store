import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ICoupon } from '../../types';
import { useToast } from '../../context/ToastContext';

export const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<ICoupon[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const { showToast } = useToast();

  // Form Fields
  const [code, setCode] = useState<string>('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'free_shipping'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [minimumOrder, setMinimumOrder] = useState<number>(30);
  const [description, setDescription] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminCoupons();
      if (res.success && res.coupons) {
        setCoupons(res.coupons);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.createCoupon({
        code: code.toUpperCase().trim(),
        discountType,
        discountValue: Number(discountValue),
        minimumOrder: Number(minimumOrder),
        description: description || `${discountValue}% off specialty coffee beans`,
        isActive: true,
        maxUses: 500,
        expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      });

      if (res.success && res.coupon) {
        setCoupons([res.coupon, ...coupons]);
        setIsAdding(false);
        setCode('');
        setDescription('');
        showToast(`Coupon "${res.coupon.code}" created successfully.`);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to create coupon.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await api.updateCoupon(id, { isActive: !currentStatus });
      if (res.success && res.coupon) {
        setCoupons(prev => prev.map(c => c._id === id ? res.coupon : c));
        showToast(`Coupon ${!currentStatus ? 'activated' : 'deactivated'}.`);
      }
    } catch (err: any) {
      showToast(err.message || 'Could not update coupon status.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Promotional Roastery Vouchers</h1>
          <p className="text-xs text-espresso-400 mt-1">Configure promotional discount codes and free shipping incentives.</p>
        </div>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all self-start sm:self-auto flex items-center gap-1.5"
          >
            + New Promo Code
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleCreateCoupon} className="p-6 bg-espresso-900/60 border border-espresso-800 rounded-2xl space-y-4 max-w-xl">
          <h3 className="font-serif text-base font-bold text-white mb-2">Create New Voucher</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">Coupon Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. HARVEST15"
                className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">Discount Type</label>
              <select
                value={discountType}
                onChange={(e: any) => setDiscountType(e.target.value)}
                className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Dollar ($)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">Discount Value</label>
              <input
                type="number"
                min="1"
                required
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">Minimum Spend ($)</label>
              <input
                type="number"
                min="0"
                required
                value={minimumOrder}
                onChange={(e) => setMinimumOrder(Number(e.target.value))}
                className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs text-espresso-300 block mb-1 font-semibold">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 15% off seasonal harvest selections"
                className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold"
            >
              {saving ? 'Creating...' : 'Create Coupon'}
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-xs text-espresso-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table */}
      <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-espresso-400">Loading coupons...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-espresso-950/80 border-b border-espresso-800 text-espresso-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Voucher Code</th>
                  <th className="py-3 px-4 font-semibold">Type & Value</th>
                  <th className="py-3 px-4 font-semibold">Min Spend</th>
                  <th className="py-3 px-4 font-semibold">Redemptions</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso-850">
                {coupons.map((c) => (
                  <tr key={c._id} className="hover:bg-espresso-850/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-300">
                      {c.code}
                      <span className="block text-[10px] text-espresso-400 font-sans font-normal mt-0.5">{c.description}</span>
                    </td>
                    <td className="py-3 px-4 text-white">
                      {c.discountType === 'percentage' && `${c.discountValue}% Off`}
                      {c.discountType === 'fixed' && `$${c.discountValue} Off`}
                      {c.discountType === 'free_shipping' && 'Free Domestic Shipping'}
                    </td>
                    <td className="py-3 px-4 text-espresso-300">${c.minimumOrder || 0}</td>
                    <td className="py-3 px-4 text-espresso-400 font-mono">{c.usedCount} uses</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}>
                        {c.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {c._id && (
                        <button
                          onClick={() => handleToggleStatus(c._id!, c.isActive)}
                          className="px-2.5 py-1 text-xs rounded bg-espresso-800 hover:bg-espresso-750 text-espresso-200 border border-espresso-700"
                        >
                          {c.isActive ? 'Disable' : 'Enable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
