import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { IProduct, IProductVariant, IReview } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { RatingStars } from '../components/common/RatingStars';
import { ProductCard } from '../components/common/ProductCard';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();

  const [product, setProduct] = useState<IProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<IProduct[]>([]);
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Variant selection
  const [selectedWeight, setSelectedWeight] = useState<string>('250g');
  const [selectedGrind, setSelectedGrind] = useState<string>('Whole Bean');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'brewing' | 'reviews'>('details');

  // Review Form
  const [reviewName, setReviewName] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const res = await api.getProductBySlug(slug);
        if (res.success && res.product) {
          setProduct(res.product);
          // Set initial variant if exists
          if (res.product.variants && res.product.variants.length > 0) {
            setSelectedWeight(res.product.variants[0].weight);
            setSelectedGrind(res.product.variants[0].grind);
          }

          // Fetch reviews and related products
          const [revRes, relRes] = await Promise.all([
            api.getProductReviews(res.product._id),
            api.getProducts({ category: res.product.category, limit: 4 })
          ]);

          if (revRes.success && revRes.reviews) {
            setReviews(revRes.reviews);
          }
          if (relRes.success && relRes.products) {
            setRelatedProducts(relRes.products.filter(p => p._id !== res.product._id).slice(0, 4));
          }
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-espresso-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-amber-600/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-amber-300 text-sm">Cupping fresh roast details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-espresso-950 flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-serif text-3xl font-bold text-white mb-2">Coffee Offering Not Found</h2>
        <p className="text-sm text-espresso-300 mb-6">The roast you are searching for might be out of season or retired.</p>
        <Link to="/shop" className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold">
          Return to Catalog
        </Link>
      </div>
    );
  }

  // Find currently active variant matching weight & grind
  const activeVariant: IProductVariant = product.variants?.find(
    v => v.weight === selectedWeight && v.grind === selectedGrind
  ) || product.variants?.[0] || {
    id: `${product.sku}-default`,
    weight: selectedWeight,
    grind: selectedGrind,
    price: product.price,
    salePrice: product.salePrice,
    sku: product.sku,
    stock: product.inventory
  };

  const currentPrice = activeVariant.salePrice || activeVariant.price || product.price;
  const originalPrice = activeVariant.salePrice ? activeVariant.price : product.salePrice ? product.price : null;
  const isAvailable = activeVariant.stock > 0;
  const isSaved = isInWishlist(product._id);

  // Available options
  const uniqueWeights = Array.from(new Set(product.variants?.map(v => v.weight) || ['250g', '500g', '1kg']));
  const uniqueGrinds = Array.from(new Set(product.variants?.map(v => v.grind) || ['Whole Bean', 'Espresso', 'Pour Over', 'French Press']));

  const handleAddToCart = () => {
    if (!isAvailable) {
      showToast('This variant is currently out of stock.', 'error');
      return;
    }
    addItem(product, activeVariant, quantity);
  };

  const handleBuyNow = () => {
    if (!isAvailable) return;
    addItem(product, activeVariant, quantity);
    navigate('/checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewTitle || !reviewComment) {
      showToast('Please fill out all review fields.', 'error');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await api.createReview({
        productId: product._id,
        customerName: reviewName,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });

      if (res.success && res.review) {
        setReviews([res.review, ...reviews]);
        showToast('Review submitted successfully! Thank you for your feedback.');
        setReviewName('');
        setReviewTitle('');
        setReviewComment('');
      }
    } catch (err: any) {
      showToast(err.message || 'Could not submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-xs text-espresso-400 flex items-center gap-2 mb-8">
          <Link to="/" className="hover:text-amber-400">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-amber-400">Shop</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-amber-400">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-espresso-200 truncate">{product.name}</span>
        </nav>

        {/* TOP HERO DETAILS: 2 COLUMNS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
          {/* LEFT: GALLERY */}
          <div>
            {/* Main Stage */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-espresso-900 border border-espresso-800 shadow-2xl mb-4 group">
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {product.badge && (
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold uppercase bg-amber-600 text-white shadow-md">
                  {product.badge}
                </span>
              )}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-colors ${
                  isSaved
                    ? 'bg-amber-600 text-white'
                    : 'bg-espresso-900/80 text-espresso-300 hover:text-white border border-espresso-700'
                }`}
                title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      activeImageIndex === idx
                        ? 'border-amber-500 scale-95 shadow-md'
                        : 'border-espresso-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: SPECIFICATIONS & CHECKOUT ACTIONS */}
          <div className="flex flex-col">
            {/* Origin & Category Tag */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                {product.category}
              </span>
              {product.origin && <span className="text-espresso-600">&bull;</span>}
              {product.origin && (
                <span className="text-xs text-espresso-300">
                  {product.origin} {product.elevation && `(${product.elevation})`}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating & SCA Score */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1.5">
                <RatingStars rating={product.rating} size="sm" />
                <span className="text-xs text-espresso-300 font-medium">({product.rating.toFixed(1)})</span>
              </div>
              <span className="text-espresso-600">&bull;</span>
              <a href="#reviews" onClick={() => setActiveTab('reviews')} className="text-xs text-amber-400 hover:underline">
                {product.reviewCount || reviews.length} cupping reviews
              </a>
              <span className="text-espresso-600">&bull;</span>
              <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full font-medium">
                SCA 88.5 pt
              </span>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 mb-6 p-4 rounded-xl bg-espresso-900/60 border border-espresso-800/80">
              <span className="font-serif text-3xl font-bold text-white">
                ${currentPrice.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-base text-espresso-400 line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-xs text-espresso-400">
                / {selectedWeight} &bull; Tax included
              </span>
            </div>

            {/* Short Description */}
            <p className="text-xs sm:text-sm text-espresso-200/90 leading-relaxed mb-6 font-light">
              {product.shortDescription}
            </p>

            {/* Roast Profile Bar */}
            {product.roastLevel && (
              <div className="mb-6 p-4 rounded-xl bg-espresso-900/40 border border-espresso-800/60">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="text-espresso-400 uppercase tracking-wider font-semibold">Roast Level:</span>
                  <span className="text-amber-300 font-semibold">{product.roastLevel}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 h-2 w-full">
                  {['Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark'].map((level, i) => {
                    const levels = ['Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark'];
                    const currentIdx = levels.indexOf(product.roastLevel || 'Medium');
                    const isActive = i <= currentIdx;
                    return (
                      <div
                        key={level}
                        className={`rounded-full transition-all ${
                          isActive ? 'bg-amber-500' : 'bg-espresso-800'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tasting Notes Chips */}
            {product.tastingNotes && product.tastingNotes.length > 0 && (
              <div className="mb-6">
                <span className="text-xs uppercase tracking-wider text-espresso-400 font-semibold block mb-2">
                  Cupping Notes:
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.tastingNotes.map((note, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-full font-medium"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* VARIANT CHOOSER: WEIGHT */}
            <div className="mb-5">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-semibold text-espresso-300 uppercase tracking-wider">Bag Size</span>
                <span className="text-espresso-400">Selected: {selectedWeight}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {uniqueWeights.map((w) => (
                  <button
                    key={w}
                    onClick={() => setSelectedWeight(w)}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                      selectedWeight === w
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-espresso-900 border-espresso-800 text-espresso-300 hover:border-espresso-700'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* VARIANT CHOOSER: GRIND */}
            <div className="mb-6">
              <div className="flex justify-between text-xs mb-2">
                <span className="font-semibold text-espresso-300 uppercase tracking-wider">Grind Specification</span>
                <span className="text-espresso-400">Selected: {selectedGrind}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {uniqueGrinds.map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGrind(g)}
                    className={`py-2 px-2.5 rounded-lg text-[11px] font-semibold border transition-all text-center truncate ${
                      selectedGrind === g
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-espresso-900 border-espresso-800 text-espresso-300 hover:border-espresso-700'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* STOCK INDICATOR & QUANTITY */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-espresso-300 uppercase tracking-wider">Qty:</span>
                <div className="flex items-center border border-espresso-700 rounded-lg bg-espresso-900">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-3 py-1.5 text-espresso-300 hover:text-white disabled:opacity-30 text-sm"
                  >
                    -
                  </button>
                  <span className="px-3 py-1.5 text-xs font-semibold text-white min-w-[28px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(activeVariant.stock, quantity + 1))}
                    disabled={quantity >= activeVariant.stock}
                    className="px-3 py-1.5 text-espresso-300 hover:text-white disabled:opacity-30 text-sm"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Stock Status Pill */}
              <div className="text-right">
                {isAvailable ? (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    In Stock ({activeVariant.stock} units remaining)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    Currently Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* ACTIONS: ADD TO CART & BUY NOW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={!isAvailable}
                className="w-full py-4 bg-espresso-800 hover:bg-espresso-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl border border-espresso-700 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add To Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={!isAvailable}
                className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2"
              >
                Instant Checkout
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {/* TRUST BADGES */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-espresso-800/80 text-center text-[11px] text-espresso-400">
              <div className="flex flex-col items-center gap-1">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Roasted to order</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Degassing valve seal</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Free shipping &gt; $50</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS SECTION: DETAILS / BREWING GUIDE / REVIEWS */}
        <div id="reviews" className="mb-20">
          <div className="flex border-b border-espresso-800 mb-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-3 px-6 font-semibold text-xs tracking-wider uppercase border-b-2 transition-all ${
                activeTab === 'details'
                  ? 'border-amber-500 text-amber-300'
                  : 'border-transparent text-espresso-400 hover:text-white'
              }`}
            >
              Origin & Sourcing Story
            </button>
            <button
              onClick={() => setActiveTab('brewing')}
              className={`py-3 px-6 font-semibold text-xs tracking-wider uppercase border-b-2 transition-all ${
                activeTab === 'brewing'
                  ? 'border-amber-500 text-amber-300'
                  : 'border-transparent text-espresso-400 hover:text-white'
              }`}
            >
              Brewing Parameters
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-3 px-6 font-semibold text-xs tracking-wider uppercase border-b-2 transition-all ${
                activeTab === 'reviews'
                  ? 'border-amber-500 text-amber-300'
                  : 'border-transparent text-espresso-400 hover:text-white'
              }`}
            >
              Cupping Reviews ({reviews.length})
            </button>
          </div>

          {/* TAB 1: STORY & DETAILS */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-espresso-900/40 p-8 rounded-2xl border border-espresso-800">
              <div>
                <h3 className="font-serif text-xl font-bold text-white mb-4">The Roaster's Perspective</h3>
                <p className="text-xs sm:text-sm text-espresso-200 leading-relaxed font-light mb-4">
                  {product.description}
                </p>
                <p className="text-xs sm:text-sm text-espresso-300 leading-relaxed font-light">
                  Each bean lot undergoes visual density inspection, moisture content measurement, and calibrated drum roast profiles before entering our sealed nitrogen-flushed packages.
                </p>
              </div>

              <div>
                <h3 className="font-serif text-xl font-bold text-white mb-4">Terroir Profile</h3>
                <dl className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-espresso-950/60 p-3 rounded-lg border border-espresso-800">
                    <dt className="text-espresso-400 uppercase tracking-wider text-[10px]">Origin Country</dt>
                    <dd className="font-semibold text-white mt-1">{product.origin || 'Selected Micro-Lots'}</dd>
                  </div>
                  <div className="bg-espresso-950/60 p-3 rounded-lg border border-espresso-800">
                    <dt className="text-espresso-400 uppercase tracking-wider text-[10px]">Elevation</dt>
                    <dd className="font-semibold text-white mt-1">{product.elevation || '1,750 - 2,100 MASL'}</dd>
                  </div>
                  <div className="bg-espresso-950/60 p-3 rounded-lg border border-espresso-800">
                    <dt className="text-espresso-400 uppercase tracking-wider text-[10px]">Processing Method</dt>
                    <dd className="font-semibold text-white mt-1">{product.processingMethod || 'Fully Washed & Sun Dried'}</dd>
                  </div>
                  <div className="bg-espresso-950/60 p-3 rounded-lg border border-espresso-800">
                    <dt className="text-espresso-400 uppercase tracking-wider text-[10px]">Coffee Specie</dt>
                    <dd className="font-semibold text-white mt-1">100% Specialty Arabica</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* TAB 2: BREWING RECIPES */}
          {activeTab === 'brewing' && (
            <div className="bg-espresso-900/40 p-8 rounded-2xl border border-espresso-800">
              <h3 className="font-serif text-xl font-bold text-white mb-6">Barista Extraction Dial-In</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-espresso-950 p-5 rounded-xl border border-espresso-800">
                  <span className="text-amber-400 font-serif text-lg font-bold block mb-2">Pour Over (V60 / Kalita)</span>
                  <ul className="text-xs space-y-2 text-espresso-300">
                    <li><strong className="text-white">Ratio:</strong> 1:16 (15g coffee / 240g water)</li>
                    <li><strong className="text-white">Water Temp:</strong> 93°C (200°F)</li>
                    <li><strong className="text-white">Grind:</strong> Medium-Fine (table salt)</li>
                    <li><strong className="text-white">Bloom:</strong> 45g water for 45s</li>
                    <li><strong className="text-white">Total Drawdown:</strong> 2:45 - 3:00 min</li>
                  </ul>
                </div>

                <div className="bg-espresso-950 p-5 rounded-xl border border-espresso-800">
                  <span className="text-amber-400 font-serif text-lg font-bold block mb-2">Espresso (9-Bar)</span>
                  <ul className="text-xs space-y-2 text-espresso-300">
                    <li><strong className="text-white">Dose:</strong> 18.5g dry</li>
                    <li><strong className="text-white">Yield:</strong> 38g liquid espresso</li>
                    <li><strong className="text-white">Extraction Time:</strong> 27 - 30 seconds</li>
                    <li><strong className="text-white">Water Temp:</strong> 93.5°C</li>
                    <li><strong className="text-white">Body:</strong> Rich, viscous crema</li>
                  </ul>
                </div>

                <div className="bg-espresso-950 p-5 rounded-xl border border-espresso-800">
                  <span className="text-amber-400 font-serif text-lg font-bold block mb-2">French Press / Immersion</span>
                  <ul className="text-xs space-y-2 text-espresso-300">
                    <li><strong className="text-white">Ratio:</strong> 1:15 (30g coffee / 450g water)</li>
                    <li><strong className="text-white">Grind:</strong> Coarse kosher salt</li>
                    <li><strong className="text-white">Steep Time:</strong> 4:00 min, break crust</li>
                    <li><strong className="text-white">Clarify:</strong> Scoop foam, plunge lightly</li>
                    <li><strong className="text-white">Profile:</strong> Heavy mouthfeel, chocolate finish</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS & WRITE A REVIEW */}
          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* REVIEWS LIST */}
              <div className="lg:col-span-2 space-y-4">
                {reviews.length === 0 ? (
                  <div className="p-8 bg-espresso-900/40 rounded-xl border border-espresso-800 text-center">
                    <p className="text-sm text-espresso-300 mb-2">No reviews recorded yet for this roast.</p>
                    <p className="text-xs text-espresso-400">Be the first home barista to share your extraction notes!</p>
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div key={rev._id} className="bg-espresso-900/40 p-6 rounded-xl border border-espresso-800">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <RatingStars rating={rev.rating} size="sm" />
                          <h4 className="font-serif text-base font-bold text-white mt-1">{rev.title}</h4>
                        </div>
                        <span className="text-[11px] text-espresso-400">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-espresso-300 leading-relaxed font-light mb-3">
                        {rev.comment}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-amber-400">
                        <span className="font-semibold text-white">{rev.customerName}</span>
                        {rev.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            &bull; Verified Roast Purchaser
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* WRITE A REVIEW FORM */}
              <div className="bg-espresso-900/60 p-6 rounded-2xl border border-espresso-800 h-fit">
                <h4 className="font-serif text-lg font-bold text-white mb-2">Submit Your Review</h4>
                <p className="text-xs text-espresso-400 mb-5">Share your brew recipe and aroma observations.</p>

                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="text-xs text-espresso-300 block mb-1 font-semibold">Your Name</label>
                    <input
                      type="text"
                      required
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      placeholder="e.g. Liam Parker"
                      className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-espresso-300 block mb-1 font-semibold">Overall Rating</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-espresso-100 focus:outline-none focus:border-amber-500"
                    >
                      <option value={5}>5 Stars - Outstanding Cup</option>
                      <option value={4}>4 Stars - Great Specialty Roast</option>
                      <option value={3}>3 Stars - Average Brew</option>
                      <option value={2}>2 Stars - Subpar Notes</option>
                      <option value={1}>1 Star - Flawed Extraction</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-espresso-300 block mb-1 font-semibold">Headline</label>
                    <input
                      type="text"
                      required
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Crisp floral notes on Chemex"
                      className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-espresso-300 block mb-1 font-semibold">Review Commentary</label>
                    <textarea
                      required
                      rows={3}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Detail your brewing method, water ratio, and cup feedback..."
                      className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-xs rounded-lg transition-all"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Roast Review'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* RELATED ROASTS */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-espresso-800 pt-16">
            <div className="flex justify-between items-end mb-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                  Complementary Profiles
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">
                  You Might Also Enjoy
                </h3>
              </div>
              <Link to="/shop" className="text-xs text-amber-400 hover:underline">
                View Full Roastery &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
