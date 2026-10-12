import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { IReview } from '../../types';
import { useToast } from '../../context/ToastContext';
import { RatingStars } from '../../components/common/RatingStars';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminReviews();
      if (res.success && res.reviews) {
        setReviews(res.reviews);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApprove = async (id: string, currentApproved: boolean) => {
    try {
      const res = await api.updateReview(id, { approved: !currentApproved });
      if (res.success && res.review) {
        setReviews(prev => prev.map(r => r._id === id ? res.review : r));
        showToast(`Review ${!currentApproved ? 'approved' : 'unapproved'}.`);
      }
    } catch (err: any) {
      showToast(err.message || 'Could not update review.', 'error');
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('Delete this review permanently?')) return;
    try {
      const res = await api.deleteReview(id);
      if (res.success) {
        setReviews(prev => prev.filter(r => r._id !== id));
        showToast('Review removed from roastery records.');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete review.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Cupping Feedback & Moderation</h1>
        <p className="text-xs text-espresso-400 mt-1">Review community feedback, customer brew recipes, and ratings.</p>
      </div>

      <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-xs text-espresso-400">Loading reviews...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-espresso-950/80 border-b border-espresso-800 text-espresso-400">
                <tr>
                  <th className="py-3 px-4 font-semibold">Reviewer</th>
                  <th className="py-3 px-4 font-semibold">Rating</th>
                  <th className="py-3 px-4 font-semibold">Commentary</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-espresso-850">
                {reviews.map((r) => (
                  <tr key={r._id} className="hover:bg-espresso-850/30 transition-colors">
                    <td className="py-3 px-4 text-white">
                      <p className="font-semibold">{r.customerName}</p>
                      {r.verifiedPurchase && (
                        <span className="text-[10px] text-emerald-400">Verified Buyer</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <RatingStars rating={r.rating} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-espresso-300 max-w-md">
                      <p className="font-semibold text-white mb-0.5">{r.title}</p>
                      <p className="text-[11px] line-clamp-2">{r.comment}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.approved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {r.approved ? 'Approved' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleApprove(r._id, r.approved)}
                          className="px-2.5 py-1 text-[11px] rounded bg-espresso-800 hover:bg-espresso-750 text-white border border-espresso-700"
                        >
                          {r.approved ? 'Reject' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleDeleteReview(r._id)}
                          className="px-2.5 py-1 text-[11px] rounded text-rose-400 hover:bg-rose-500/10"
                        >
                          Delete
                        </button>
                      </div>
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
