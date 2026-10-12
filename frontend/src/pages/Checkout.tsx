import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { IAddress } from '../types';

export const Checkout: React.FC = () => {
  const { items, subtotal, discountAmount, coupon, shippingFee, tax, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Contact State
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  // Shipping Address State
  const [street, setStreet] = useState<string>('');
  const [apartment, setApartment] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [state, setState] = useState<string>('WA');
  const [postalCode, setPostalCode] = useState<string>('');
  const [country, setCountry] = useState<string>('United States');

  // Shipping Method
  const [shippingMethodType, setShippingMethodType] = useState<'standard' | 'express'>('standard');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'cod' | 'test_payment'>('credit_card');
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('123');
  const [cardHolder, setCardHolder] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto-populate from logged-in user
  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
      setCardHolder(`${user.firstName} ${user.lastName}`);

      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
        setStreet(defaultAddr.street || '');
        setApartment(defaultAddr.apartment || '');
        setCity(defaultAddr.city || '');
        setState(defaultAddr.state || 'WA');
        setPostalCode(defaultAddr.postalCode || '');
        setCountry(defaultAddr.country || 'United States');
      }
    }
  }, [user]);

  // If cart is empty, redirect back to cart
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  // Shipping cost calculation
  const calculatedShippingFee = shippingMethodType === 'express'
    ? 14.00
    : shippingFee; // Standard is either $0 or $6.50 based on CartContext

  const finalTotal = Number((subtotal - discountAmount + calculatedShippingFee + tax).toFixed(2));

  const handleApplySavedAddress = (addr: IAddress) => {
    setStreet(addr.street);
    setApartment(addr.apartment || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country);
    showToast('Loaded saved delivery address.');
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !firstName || !lastName || !street || !city || !postalCode) {
      showToast('Please complete all required shipping fields.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        customer: {
          firstName,
          lastName,
          email,
          phone: phone || '+1 (555) 019-2831'
        },
        items: items.map(item => ({
          product: item.product._id,
          name: item.product.name,
          image: item.product.images[0],
          variant: {
            weight: item.variant.weight,
            grind: item.variant.grind,
            sku: item.variant.sku
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        })),
        shippingAddress: {
          fullName: `${firstName} ${lastName}`,
          phone: phone || '+1 (555) 019-2831',
          street,
          apartment,
          city,
          state,
          postalCode,
          country
        },
        billingAddress: {
          fullName: `${firstName} ${lastName}`,
          phone: phone || '+1 (555) 019-2831',
          street,
          apartment,
          city,
          state,
          postalCode,
          country
        },
        shippingMethod: {
          name: shippingMethodType === 'express' ? 'Express Courier (1-2 Days)' : 'Standard Carbon-Neutral Ground',
          price: calculatedShippingFee,
          estimatedDays: shippingMethodType === 'express' ? '1-2 Days' : '3-5 Days'
        },
        subtotal,
        discount: discountAmount,
        couponCode: coupon?.code,
        shippingFee: calculatedShippingFee,
        tax,
        total: finalTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid'
      };

      const res = await api.createOrder(orderPayload);

      if (res.success && res.order) {
        clearCart();
        showToast('Order confirmed! Fresh roasting sequence initiated.');
        navigate(`/order-confirmation/${res.order.orderNumber}`, { state: { order: res.order } });
      } else {
        throw new Error(res.message || 'Failed to complete order');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <nav className="text-xs text-espresso-400 flex items-center gap-2 mb-8">
          <Link to="/cart" className="hover:text-amber-400">&larr; Return to Cart</Link>
          <span>/</span>
          <span className="text-espresso-200">Secure Roastery Checkout</span>
        </nav>

        <h1 className="font-serif text-3xl font-bold text-white mb-2">
          Express Checkout
        </h1>
        <p className="text-xs sm:text-sm text-espresso-400 mb-10">
          Enter your delivery destination and select payment method.
        </p>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT: CHECKOUT FORM (7 COLS) */}
            <div className="lg:col-span-7 space-y-8">
              {/* SECTION 1: CONTACT */}
              <div className="bg-espresso-900/40 border border-espresso-800 p-6 sm:p-8 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-sans">
                      1
                    </span>
                    Customer Contact
                  </h2>
                  {!isAuthenticated && (
                    <span className="text-xs text-espresso-400">
                      Already have an account? <Link to="/login" className="text-amber-400 hover:underline">Log in</Link>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-espresso-300 block mb-1 font-semibold">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. coffee.enthusiast@example.com"
                      className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-espresso-400 mt-1 block">We'll send order tracking and roasting updates here.</span>
                  </div>
                  <div>
                    <label className="text-xs text-espresso-300 block mb-1 font-semibold">First Name *</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Marcus"
                      className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-espresso-300 block mb-1 font-semibold">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. Romero"
                      className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-espresso-300 block mb-1 font-semibold">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: SHIPPING ADDRESS */}
              <div className="bg-espresso-900/40 border border-espresso-800 p-6 sm:p-8 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-sans">
                      2
                    </span>
                    Shipping Destination
                  </h2>
                </div>

                {/* Saved addresses selector */}
                {user?.addresses && user.addresses.length > 0 && (
                  <div className="mb-4 p-3 bg-espresso-950 rounded-xl border border-espresso-800">
                    <span className="text-[11px] text-espresso-400 block mb-2 font-semibold">Use Saved Address:</span>
                    <div className="flex flex-wrap gap-2">
                      {user.addresses.map((addr, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplySavedAddress(addr)}
                          className="px-2.5 py-1 text-xs rounded bg-espresso-850 hover:bg-espresso-800 border border-espresso-700 text-amber-300 transition-colors"
                        >
                          {addr.street}, {addr.city}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs text-espresso-300 block mb-1 font-semibold">Street Address *</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="e.g. 742 Evergreen Terrace"
                      className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-espresso-300 block mb-1 font-semibold">Apartment, Suite, Unit (optional)</label>
                    <input
                      type="text"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                      placeholder="e.g. Apt 4B"
                      className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-espresso-300 block mb-1 font-semibold">City *</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Seattle"
                      className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-espresso-300 block mb-1 font-semibold">State / Province</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="WA"
                        className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-espresso-300 block mb-1 font-semibold">Postal Code *</label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="98101"
                        className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-espresso-300 block mb-1 font-semibold">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-espresso-950 border border-espresso-700 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 3: DELIVERY METHOD */}
              <div className="bg-espresso-900/40 border border-espresso-800 p-6 sm:p-8 rounded-2xl">
                <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-sans">
                    3
                  </span>
                  Shipping Service
                </h2>

                <div className="space-y-3">
                  <label
                    onClick={() => setShippingMethodType('standard')}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      shippingMethodType === 'standard'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-espresso-800 bg-espresso-950/60 hover:border-espresso-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethodType === 'standard'}
                        onChange={() => setShippingMethodType('standard')}
                        className="accent-amber-500"
                      />
                      <div>
                        <p className="text-xs font-semibold text-white">Standard Carbon-Neutral Ground</p>
                        <p className="text-[11px] text-espresso-400">Roasted fresh, delivers in 3-5 business days</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-300">
                      {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                    </span>
                  </label>

                  <label
                    onClick={() => setShippingMethodType('express')}
                    className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      shippingMethodType === 'express'
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-espresso-800 bg-espresso-950/60 hover:border-espresso-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingMethodType === 'express'}
                        onChange={() => setShippingMethodType('express')}
                        className="accent-amber-500"
                      />
                      <div>
                        <p className="text-xs font-semibold text-white">Express Courier (Priority Air)</p>
                        <p className="text-[11px] text-espresso-400">Next-day air ship post roast, delivers in 1-2 business days</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-300">$14.00</span>
                  </label>
                </div>
              </div>

              {/* SECTION 4: PAYMENT */}
              <div className="bg-espresso-900/40 border border-espresso-800 p-6 sm:p-8 rounded-2xl">
                <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-sans">
                    4
                  </span>
                  Payment Method
                </h2>

                {/* Tabs */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                        : 'bg-espresso-950 border-espresso-800 text-espresso-400'
                    }`}
                  >
                    Credit Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('test_payment')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      paymentMethod === 'test_payment'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                        : 'bg-espresso-950 border-espresso-800 text-espresso-400'
                    }`}
                  >
                    1-Click Test Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                        : 'bg-espresso-950 border-espresso-800 text-espresso-400'
                    }`}
                  >
                    Cash on Delivery
                  </button>
                </div>

                {/* Credit Card inputs */}
                {paymentMethod === 'credit_card' && (
                  <div className="space-y-4 p-4 bg-espresso-950/80 rounded-xl border border-espresso-800">
                    <div>
                      <label className="text-xs text-espresso-300 block mb-1 font-semibold">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 4242 4242 4242"
                        className="w-full bg-espresso-900 border border-espresso-700 rounded-lg px-3.5 py-2.5 text-xs text-white font-mono placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-espresso-300 block mb-1 font-semibold">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="Marcus Romero"
                        className="w-full bg-espresso-900 border border-espresso-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-espresso-300 block mb-1 font-semibold">Expires (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="12/28"
                          className="w-full bg-espresso-900 border border-espresso-700 rounded-lg px-3.5 py-2.5 text-xs text-white font-mono placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-espresso-300 block mb-1 font-semibold">CVC</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          placeholder="123"
                          className="w-full bg-espresso-900 border border-espresso-700 rounded-lg px-3.5 py-2.5 text-xs text-white font-mono placeholder-espresso-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'test_payment' && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 leading-relaxed">
                    Test Mode: Simulated one-click payment processing enabled. No real charges will be made.
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="p-4 bg-espresso-950 rounded-xl border border-espresso-800 text-xs text-espresso-300 leading-relaxed">
                    Pay with cash or card upon delivery package arrival or at roastery counter pickup.
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: ORDER SUMMARY (5 COLS) */}
            <div className="lg:col-span-5">
              <div className="bg-espresso-900/60 border border-espresso-800 rounded-2xl p-6 sm:p-8 sticky top-24">
                <h3 className="font-serif text-lg font-bold text-white mb-4">
                  Order Breakdown ({items.length} items)
                </h3>

                {/* Items scroll */}
                <div className="max-h-60 overflow-y-auto space-y-3 mb-6 pr-1 divide-y divide-espresso-800/60">
                  {items.map((item) => (
                    <div key={`${item.product._id}-${item.variant.id}`} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-lg object-cover bg-espresso-950 border border-espresso-800 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-white line-clamp-1">{item.product.name}</p>
                          <p className="text-[11px] text-espresso-400">
                            {item.variant.weight} &bull; {item.variant.grind} &times; {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-semibold text-white">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Breakdown totals */}
                <div className="space-y-2.5 text-xs py-4 border-y border-espresso-800">
                  <div className="flex justify-between text-espresso-300">
                    <span>Subtotal</span>
                    <span className="text-white">${subtotal.toFixed(2)}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Promo Discount ({coupon?.code})</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-espresso-300">
                    <span>Shipping Method</span>
                    <span>
                      {calculatedShippingFee === 0 ? (
                        <span className="text-emerald-400 font-semibold">FREE</span>
                      ) : (
                        `$${calculatedShippingFee.toFixed(2)}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-espresso-300">
                    <span>Estimated Sales Tax</span>
                    <span className="text-white">${tax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline my-6">
                  <div>
                    <span className="font-serif text-lg font-bold text-white">Total Amount</span>
                    <p className="text-[10px] text-espresso-400">Includes all taxes and handling</p>
                  </div>
                  <span className="font-serif text-2xl font-bold text-amber-300">
                    ${finalTotal.toFixed(2)}
                  </span>
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-amber-900/40 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Roasting & Finalizing Order...
                    </>
                  ) : (
                    <>
                      Place Order &bull; ${finalTotal.toFixed(2)}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  )}
                </button>

                <p className="text-[10px] text-center text-espresso-500 mt-4">
                  By clicking Place Order, you confirm acceptance of our terms of sale and freshness guarantee.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
