import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/common/ProductCard';

export const Wishlist: React.FC = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleAddAllToCart = () => {
    wishlist.forEach((product) => {
      addItem(product);
    });
  };

  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <nav className="text-xs text-espresso-400 flex items-center gap-2 mb-3">
              <Link to="/" className="hover:text-amber-400">Home</Link>
              <span>/</span>
              <span className="text-espresso-200">Saved Roasts</span>
            </nav>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              My Saved Coffee Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-espresso-400 mt-1">
              Your curated favorites, seasonal micro-lots, and future roast considerations.
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={handleAddAllToCart}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all self-start sm:self-auto"
            >
              Add All ({wishlist.length}) To Cart
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-espresso-900/40 border border-espresso-800 rounded-3xl p-12 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-bold text-white mb-2">
              Your Wishlist Is Empty
            </h2>
            <p className="text-xs text-espresso-300 font-light mb-6">
              Browse our single-origin harvests and artisanal blends, click the heart icon on any coffee bag, and keep track of roasts to try next.
            </p>
            <Link
              to="/shop"
              className="inline-flex px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold"
            >
              Discover Specialty Roasts
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div key={product._id} className="relative group">
                <ProductCard product={product} />
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="mt-2 w-full py-1.5 text-[11px] text-espresso-400 hover:text-rose-400 bg-espresso-900/60 rounded-lg border border-espresso-800 transition-colors"
                >
                  Remove from Wishlist
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
