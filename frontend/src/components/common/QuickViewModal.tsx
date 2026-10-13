import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingBag, Heart, Check, ArrowRight } from 'lucide-react';
import { IProduct, IProductVariant } from '../../types';
import { RatingStars } from './RatingStars';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

interface QuickViewModalProps {
  product: IProduct | null;
  onClose: () => void;
  isOpen?: boolean;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose, isOpen }) => {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedWeight, setSelectedWeight] = useState<string>('');
  const [selectedGrind, setSelectedGrind] = useState<string>('Whole Bean');
  const [quantity, setQuantity] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setSelectedWeight(product.variants?.[0]?.weight || '250g (8.8oz)');
      setSelectedGrind('Whole Bean');
      setQuantity(1);
      setAdded(false);
    }
  }, [product]);

  if (!product || isOpen === false) return null;

  const isFavorited = isInWishlist(product._id);
  const isOutOfStock = product.inventory <= 0;

  // Find active variant based on selected weight
  const activeVariant: IProductVariant = product.variants?.find(
    v => v.weight === selectedWeight && v.grind === selectedGrind
  ) || product.variants?.find(v => v.weight === selectedWeight) || product.variants?.[0] || {
    id: `${product.sku || 'KAV'}-default`,
    weight: selectedWeight || '250g',
    grind: selectedGrind || 'Whole Bean',
    price: product.price || 0,
    salePrice: product.salePrice || undefined,
    sku: product.sku || 'KAV-DEF',
    stock: product.inventory !== undefined ? product.inventory : 99
  };

  const currentPrice = activeVariant.salePrice || activeVariant.price || product.salePrice || product.price;

  // Unique weights available
  const availableWeights = product.variants?.length
    ? Array.from(new Set(product.variants.map(v => v.weight)))
    : ['250g (8.8oz)', '500g (1.1lb)', '1kg (2.2lb)'];
  const grinds = ['Whole Bean', 'Filter / Drip', 'Espresso', 'French Press'];

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    const variantToUse: IProductVariant = {
      ...activeVariant,
      grind: selectedGrind
    };
    addItem(product, variantToUse, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-coffee-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border border-coffee-100 z-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 text-coffee-800 hover:text-coffee-950 flex items-center justify-center shadow-md backdrop-blur-sm transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image */}
          <div className="relative aspect-square md:aspect-auto bg-coffee-50 p-6 flex items-center justify-center">
            <img
              src={product.images[0] || '/images/coffee.jpg'}
              alt={product.name}
              className="max-h-80 w-auto object-contain rounded-2xl shadow-sm"
            />
            {product.badge && (
              <span className="absolute top-6 left-6 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-coffee-950 text-white shadow-sm">
                {product.badge}
              </span>
            )}
          </div>

          {/* Details & Selectors */}
          <div className="p-6 sm:p-8 flex flex-col max-h-[85vh] overflow-y-auto">
            <div className="mb-1 text-xs uppercase tracking-wider text-coffee-500 font-semibold">
              {product.origin || product.category}
            </div>

            <h2 className="font-serif text-2xl font-bold text-coffee-950 leading-tight mb-2">
              {product.name}
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <RatingStars rating={product.rating} size="sm" />
              <span className="text-xs text-coffee-500 font-medium">({product.reviewCount} reviews)</span>
              {product.roastLevel && (
                <span className="text-xs px-2 py-0.5 bg-coffee-100 text-coffee-800 rounded font-semibold ml-auto">
                  {product.roastLevel} Roast
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-serif text-2xl font-bold text-coffee-950">
                ${currentPrice.toFixed(2)}
              </span>
              {activeVariant.salePrice && (
                <span className="text-sm text-coffee-400 line-through">
                  ${activeVariant.price.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-sm text-coffee-600 line-clamp-2 leading-relaxed mb-5">
              {product.shortDescription || product.description}
            </p>

            {/* Weight Options */}
            {availableWeights.length > 0 && product.category !== 'equipment' && (
              <div className="mb-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-coffee-700 mb-2">
                  Bag Size: <span className="font-medium text-coffee-900">{selectedWeight}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableWeights.map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setSelectedWeight(w)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                        selectedWeight === w
                          ? 'bg-coffee-950 text-white border-coffee-950 shadow-sm'
                          : 'bg-white text-coffee-800 border-coffee-200 hover:border-coffee-400'
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Grind Options */}
            {product.category !== 'equipment' && (
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-coffee-700 mb-2">
                  Grind Selection: <span className="font-medium text-coffee-900">{selectedGrind}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {grinds.map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setSelectedGrind(g)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-xl border text-center transition-all ${
                        selectedGrind === g
                          ? 'bg-roast-bronze/15 border-roast-bronze text-coffee-950 font-bold'
                          : 'bg-white text-coffee-700 border-coffee-200 hover:border-coffee-300'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Add to Cart */}
            <div className="mt-auto space-y-3 pt-3 border-t border-coffee-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-coffee-200 rounded-xl overflow-hidden bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-coffee-700 hover:bg-coffee-50 font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-bold text-coffee-950 min-w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-coffee-700 hover:bg-coffee-50 font-bold text-sm"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm ${
                    isOutOfStock
                      ? 'bg-coffee-200 text-coffee-400 cursor-not-allowed'
                      : added
                      ? 'bg-emerald-700 text-white'
                      : 'bg-coffee-950 text-white hover:bg-coffee-800'
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-roast-gold" />
                      <span>Add to Bag • ${(currentPrice * quantity).toFixed(2)}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => toggleWishlist(product)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    isFavorited
                      ? 'bg-rose-50 border-rose-300 text-rose-600'
                      : 'border-coffee-200 text-coffee-700 hover:text-rose-500 hover:border-rose-300'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
                </button>
              </div>

              <Link
                to={`/coffee/${product.slug}`}
                onClick={onClose}
                className="flex items-center justify-center gap-1.5 text-xs font-semibold text-coffee-700 hover:text-roast-bronze pt-1"
              >
                <span>View Full Roast Details, Cupping Notes & Origin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
