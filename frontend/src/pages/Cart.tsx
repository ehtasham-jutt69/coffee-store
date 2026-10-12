import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export const Cart: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    subtotal,
    discountAmount,
    shippingFee,
    tax,
    total,
    freeShippingRemaining
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [applyingCoupon, setApplyingCoupon] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setApplyingCoupon(true);
    await applyCoupon(couponCodeInput.trim().toUpperCase());
    setCouponCodeInput('');
    setApplyingCoupon(false);
  };

  if (items.length === 0) {
    return (
      <div className="bg-espresso-950 text-espresso-100 min-h-[75vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center bg-espresso-900/40 border border-espresso-800 p-8 sm:p-12 rounded-3xl">
          <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-6">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
            Your Coffee Cart Is Empty
          </h2>
          <p className="text-xs sm:text-sm text-espresso-300 mb-8 font-light leading-relaxed">
            You haven't added any fresh specialty roasts to your order yet. Explore our single origin lots or signature blends.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-amber-900/30"
          >
            Explore Roasts Catalog
          </Link>
        </div>
      </div>
    );
  }

  const freeShippingThreshold = 50.00;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-2">
          Your Roastery Order
        </h1>
        <p className="text-xs sm:text-sm text-espresso-400 mb-8">
          Review your chosen bag sizes, grind profiles, and apply promotional discounts.
        </p>

        {/* Free Shipping Progress Meter */}
        <div className="bg-espresso-900/60 border border-espresso-800/80 rounded-2xl p-4 sm:p-5 mb-8">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="font-medium text-espresso-200">
              {freeShippingRemaining === 0 ? (
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Unlocked Free Standard Domestic Shipping!
                </span>
              ) : (
                <span>
                  Add <strong className="text-amber-400 font-semibold">${freeShippingRemaining.toFixed(2)}</strong> more to unlock <strong>Free Shipping</strong>!
                </span>
              )}
            </span>
            <span className="text-espresso-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-espresso-950 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                freeShippingRemaining === 0 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ITEMS LIST (2 COLUMNS) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-espresso-900/40 border border-espresso-800 rounded-2xl divide-y divide-espresso-800/80 overflow-hidden">
              {items.map((item) => (
                <div
                  key={`${item.product._id}-${item.variant.id}`}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Thumbnail & Meta */}
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-espresso-800 shrink-0 bg-espresso-950"
                    />
                    <div>
                      <Link
                        to={`/product/${item.product.slug}`}
                        className="font-serif text-base sm:text-lg font-bold text-white hover:text-amber-400 transition-colors line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-espresso-400">
                        <span className="px-2 py-0.5 rounded bg-espresso-800/90 text-amber-300 font-medium">
                          {item.variant.weight}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-espresso-800/90 text-espresso-300 font-medium">
                          {item.variant.grind}
                        </span>
                      </div>
                      <p className="text-xs text-espresso-400 mt-2 font-mono">
                        ${item.unitPrice.toFixed(2)} each
                      </p>
                    </div>
                  </div>

                  {/* Quantity & Price & Remove */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-espresso-800/60">
                    {/* Stepper */}
                    <div className="flex items-center border border-espresso-700 rounded-lg bg-espresso-950">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.variant.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-espresso-400 hover:text-white text-xs font-semibold"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-1 text-xs font-semibold text-white min-w-[28px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.variant.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-espresso-400 hover:text-white text-xs font-semibold"
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal */}
                    <span className="font-serif text-base sm:text-lg font-bold text-white min-w-[70px] text-right">
                      ${item.totalPrice.toFixed(2)}
                    </span>

                    {/* Remove icon */}
                    <button
                      onClick={() => removeItem(item.product._id, item.variant.id)}
                      className="p-1.5 text-espresso-400 hover:text-rose-400 transition-colors"
                      title="Remove roast"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link to="/shop" className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
                &larr; Continue Exploring Coffees
              </Link>
              <button
                onClick={clearCart}
                className="text-xs text-espresso-400 hover:text-rose-400 transition-colors"
              >
                Clear Entire Cart
              </button>
            </div>
          </div>

          {/* ORDER SUMMARY (1 COLUMN) */}
          <div className="space-y-6">
            <div className="bg-espresso-900/60 border border-espresso-800 rounded-2xl p-6 sm:p-8">
              <h3 className="font-serif text-xl font-bold text-white mb-6">
                Order Summary
              </h3>

              {/* Promo Code Input */}
              <div className="mb-6 pb-6 border-b border-espresso-800">
                {coupon ? (
                  <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-amber-300 font-mono">{coupon.code}</span>
                        <span className="text-[10px] bg-amber-500/20 text-amber-200 px-1.5 py-0.5 rounded">Applied</span>
                      </div>
                      <p className="text-[11px] text-espresso-300 mt-0.5">{coupon.description}</p>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-400 hover:text-rose-300 ml-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value)}
                        placeholder="Promo code (e.g. WELCOME10)"
                        className="flex-1 bg-espresso-950 border border-espresso-700 rounded-lg px-3 py-2 text-xs text-white uppercase placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                      />
                      <button
                        type="submit"
                        disabled={applyingCoupon || !couponCodeInput}
                        className="px-4 py-2 bg-espresso-800 hover:bg-espresso-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold border border-espresso-700 transition-all"
                      >
                        {applyingCoupon ? '...' : 'Apply'}
                      </button>
                    </form>
                    <p className="text-[11px] text-espresso-400 mt-2">
                      Try: <button onClick={() => setCouponCodeInput('WELCOME10')} className="text-amber-400 hover:underline">WELCOME10</button> or <button onClick={() => setCouponCodeInput('FREESHIP')} className="text-amber-400 hover:underline">FREESHIP</button>
                    </p>
                  </div>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-3 text-xs mb-6 pb-6 border-b border-espresso-800">
                <div className="flex justify-between text-espresso-300">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-espresso-300">
                  <span>Estimated Shipping</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-400 font-semibold">FREE</span>
                    ) : (
                      `$${shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-espresso-300">
                  <span>Estimated Tax (7.5%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline mb-6">
                <div>
                  <span className="font-serif text-lg font-bold text-white">Estimated Total</span>
                  <p className="text-[10px] text-espresso-400 mt-0.5">USD currency</p>
                </div>
                <span className="font-serif text-2xl font-bold text-amber-300">
                  ${total.toFixed(2)}
                </span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-900/40 transition-all flex items-center justify-center gap-2"
              >
                Proceed To Checkout
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-espresso-400 text-center">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
