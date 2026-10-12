import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Check } from 'lucide-react';
import { IProduct } from '../../types';
import { RatingStars } from './RatingStars';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface ProductCardProps {
  product: IProduct;
  onQuickView?: (product: IProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addedAnim, setAddedAnim] = useState(false);

  const isFavorited = isInWishlist(product._id);
  const isOutOfStock = product.inventory <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem(product);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-coffee-100/80 shadow-sm hover:shadow-xl hover:border-coffee-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-coffee-50 overflow-hidden">
        <Link to={`/coffee/${product.slug}`} className="block w-full h-full">
          <img
            src={product.images[0] || '/images/coffee.jpg'}
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-coffee-950 text-white shadow-sm">
              {product.badge}
            </span>
          )}
          {product.salePrice && product.salePrice < product.price && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-sm">
              Save ${(product.price - product.salePrice).toFixed(2)}
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-white">
              Sold Out
            </span>
          )}
        </div>

        {/* Action Buttons Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md ${
              isFavorited
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 text-coffee-800 hover:bg-white hover:text-rose-500 backdrop-blur-sm'
            }`}
            aria-label={isFavorited ? 'Remove from wishlist' : 'Save to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
          </button>

          {/* Quick View Button */}
          {onQuickView && (
            <button
              onClick={handleQuickViewClick}
              className="w-8 h-8 rounded-full bg-white/90 text-coffee-800 hover:bg-white hover:text-coffee-950 flex items-center justify-center transition-all duration-200 shadow-md backdrop-blur-sm opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
              aria-label="Quick view"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Roast Pill Tag */}
        {product.roastLevel && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/95 text-coffee-900 border border-coffee-200 backdrop-blur-sm">
              {product.roastLevel} Roast
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Origin / Subtitle */}
        <div className="flex items-center justify-between text-xs text-coffee-500 mb-1">
          <span className="font-medium truncate">{product.origin || product.coffeeType}</span>
          {product.elevation && <span className="text-[11px] text-coffee-400">{product.elevation}</span>}
        </div>

        {/* Title */}
        <Link to={`/coffee/${product.slug}`} className="group/title block mb-2">
          <h3 className="font-serif font-bold text-base sm:text-lg text-coffee-950 group-hover/title:text-roast-bronze transition-colors line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Tasting Notes */}
        {product.tastingNotes && product.tastingNotes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.tastingNotes.slice(0, 3).map((note, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 bg-coffee-100/70 text-coffee-800 rounded-md"
              >
                {note}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-4">
          <RatingStars rating={product.rating} size="sm" />
          <span className="text-[11px] text-coffee-500 font-medium">({product.reviewCount})</span>
        </div>

        {/* Price & Add to Cart Action Footer */}
        <div className="mt-auto pt-3 border-t border-coffee-100 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            {product.salePrice ? (
              <>
                <span className="font-serif font-bold text-base sm:text-lg text-coffee-950">
                  ${product.salePrice.toFixed(2)}
                </span>
                <span className="text-xs text-coffee-400 line-through">
                  ${product.price.toFixed(2)}
                </span>
              </>
            ) : (
              <span className="font-serif font-bold text-base sm:text-lg text-coffee-950">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-coffee-200 text-coffee-400 cursor-not-allowed'
                : addedAnim
                ? 'bg-emerald-700 text-white'
                : 'bg-coffee-950 text-white hover:bg-coffee-800 active:scale-95'
            }`}
          >
            {addedAnim ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-roast-gold" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
