import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { IProduct, ICategory } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { ProductCardSkeleton } from '../components/common/SkeletonLoader';
import { RatingStars } from '../components/common/RatingStars';

export const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<IProduct[]>([]);
  const [bestSellers, setBestSellers] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<IProduct | null>(null);
  const [activeTab, setActiveTab] = useState<'featured' | 'bestsellers'>('featured');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [featRes, bestRes, catRes] = await Promise.all([
          api.getFeaturedProducts(),
          api.getProducts({ bestSeller: true, limit: 4 }),
          api.getCategories()
        ]);

        if (featRes.success && featRes.products) {
          setFeaturedProducts(featRes.products.slice(0, 4));
        }
        if (bestRes.success && bestRes.products) {
          setBestSellers(bestRes.products.slice(0, 4));
        }
        if (catRes.success && catRes.categories) {
          setCategories(catRes.categories);
        }
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background image overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/coffee-splash-pour.jpg"
            alt="Artisanal pour over coffee extraction"
            className="w-full h-full object-cover object-center filter brightness-[0.32] scale-105 transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-espresso-950/90 via-espresso-950/40 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-2xl">
            {/* Roast badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs tracking-widest font-semibold uppercase mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              Small-Batch Single Origin & Artisanal Blends
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6">
              Crafted with Precision. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
                Roasted to Perfection.
              </span>
            </h1>

            <p className="text-lg text-espresso-200/90 font-light leading-relaxed mb-8 max-w-xl">
              Ethically sourced direct from high-altitude micro-lots around the globe. Freshly roasted in micro-batches and shipped within 48 hours of your order.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/shop"
                className="px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm tracking-wide rounded-lg transition-all shadow-lg shadow-amber-900/30 hover:shadow-amber-600/30 transform hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                Explore Roasts
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                to="/guide"
                className="px-8 py-4 bg-espresso-900/80 hover:bg-espresso-800 text-espresso-200 hover:text-white font-medium text-sm tracking-wide rounded-lg border border-espresso-700/80 backdrop-blur-sm transition-all"
              >
                Interactive Brew Guide
              </Link>
            </div>

            {/* Micro stats banner */}
            <div className="grid grid-cols-3 gap-6 pt-12 mt-12 border-t border-espresso-800/80">
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-300">100%</p>
                <p className="text-xs text-espresso-400 uppercase tracking-wider mt-1">Specialty Grade Arabica</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-300">48h</p>
                <p className="text-xs text-espresso-400 uppercase tracking-wider mt-1">Peak Freshness Ship</p>
              </div>
              <div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-amber-300">88+</p>
                <p className="text-xs text-espresso-400 uppercase tracking-wider mt-1">Avg. SCA Cupping Score</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PILLARS OF EXCELLENCE */}
      <section className="py-16 bg-espresso-900/60 border-y border-espresso-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Direct-Trade Sourcing</h3>
                <p className="text-xs text-espresso-300 leading-relaxed">
                  We purchase directly from farm co-ops in Yirgacheffe, Huila, Antigua, and Mount Kenya, paying above fair trade floors.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Cast Iron Drum Roasting</h3>
                <p className="text-xs text-espresso-300 leading-relaxed">
                  Roasted manually on vintage Diedrich and Probat roasters to preserve complex terroir notes and sweetness.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Peak Degassing Window</h3>
                <p className="text-xs text-espresso-300 leading-relaxed">
                  Every bag arrives exactly within its prime flavor extraction peak (5 to 28 days post roast date).
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">Complimentary Shipping</h3>
                <p className="text-xs text-espresso-300 leading-relaxed">
                  Enjoy complimentary express domestic shipping on every order over $50 with carbon-neutral transit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SHOP BY ROAST CATEGORY */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Curated Selections</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">Explore By Category</h2>
          </div>
          <Link
            to="/collections"
            className="mt-4 sm:mt-0 text-sm font-medium text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 group"
          >
            View all categories
            <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((category) => (
            <Link
              key={category._id}
              to={`/shop?category=${category.slug}`}
              className="group relative h-72 rounded-2xl overflow-hidden border border-espresso-800/80 bg-espresso-900 shadow-lg hover:border-amber-600/50 transition-all duration-300"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 filter brightness-[0.45] group-hover:brightness-[0.35]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/40 to-transparent" />
              
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <span className="text-xs text-amber-400 font-medium tracking-wider uppercase mb-1">
                  {category.itemCount} Specialty Offerings
                </span>
                <h3 className="font-serif text-2xl font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
                  {category.name}
                </h3>
                <p className="text-xs text-espresso-200/80 line-clamp-2 leading-relaxed">
                  {category.description}
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:text-amber-300">
                  Shop Collection &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS / BEST SELLERS TOGGLE */}
      <section className="py-20 bg-espresso-900/40 border-y border-espresso-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Specialty Cupping</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">Our Roaster's Picks</h2>
            </div>

            {/* Tabs */}
            <div className="mt-6 sm:mt-0 inline-flex p-1 bg-espresso-900 border border-espresso-800 rounded-lg">
              <button
                onClick={() => setActiveTab('featured')}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'featured'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-espresso-300 hover:text-white'
                }`}
              >
                Featured Micro-Lots
              </button>
              <button
                onClick={() => setActiveTab('bestsellers')}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'bestsellers'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-espresso-300 hover:text-white'
                }`}
              >
                Customer Favorites
              </button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {(activeTab === 'featured' ? featuredProducts : bestSellers).map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onQuickView={setSelectedQuickViewProduct}
                />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-espresso-800 hover:bg-espresso-700 text-espresso-100 hover:text-white rounded-lg text-sm font-semibold border border-espresso-700 transition-all shadow-md hover:shadow-lg"
            >
              Browse Complete Catalog ({22} Coffees)
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. STORY & ROASTER CRAFT */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-espresso-800 shadow-2xl">
              <img
                src="/images/roasting-cooling-tray.jpg"
                alt="Cooling tray with freshly roasted specialty coffee beans"
                className="w-full h-[460px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/80 via-transparent to-transparent" />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-4 sm:right-6 bg-espresso-900 border border-amber-500/30 p-5 rounded-2xl shadow-2xl max-w-xs backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-600/20 text-amber-400 flex items-center justify-center font-serif text-lg font-bold">
                  K
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold">Master Cupper Note</p>
                  <p className="text-xs text-espresso-200 mt-0.5">
                    "Every harvest is dialed in curve-by-curve until acidity and sugar caramelize in harmony."
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Our Philosophy</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-2 mb-6 leading-tight">
              Honoring The Seed, <br />
              Mastering The Flame.
            </h2>
            <p className="text-espresso-300 text-sm sm:text-base leading-relaxed mb-6 font-light">
              Kavah & Co. was founded on a simple conviction: coffee should taste like its origin. From the volcanic soils of Guji, Ethiopia to the cloud forests of Tarrazú, Costa Rica, our green coffee buyer travels origin farms every harvest season.
            </p>
            <p className="text-espresso-300 text-sm sm:text-base leading-relaxed mb-8 font-light">
              We never mask exceptional beans with over-roasting. Each micro-batch is monitored with infrared bean temperature probes to pinpoint the exact second the first crack finishes and optimal cellular caramelization takes place.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-espresso-800/80 mb-8">
              <div>
                <p className="font-serif text-lg font-bold text-white">Direct Sourcing</p>
                <p className="text-xs text-espresso-400 mt-1">Paid 3.2x above Fair Trade standard directly to farming families.</p>
              </div>
              <div>
                <p className="font-serif text-lg font-bold text-white">Hand-Sorted</p>
                <p className="text-xs text-espresso-400 mt-1">Defect-free green bean sorting before and after drum roasting.</p>
              </div>
            </div>

            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 group"
            >
              Read The Full Kavah Story
              <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 6. COFFEE SUBSCRIPTION BANNER */}
      <section className="py-16 bg-gradient-to-r from-espresso-900 via-espresso-850 to-espresso-900 border-y border-espresso-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-espresso-950/80 border border-amber-600/30 p-8 sm:p-12 overflow-hidden shadow-2xl">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden lg:block">
              <img
                src="/images/floating-beans.jpg"
                alt="Floating roasted coffee beans"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-semibold tracking-wider uppercase mb-4">
                The Roaster's Club
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                Never Run Out Of Exceptional Coffee.
              </h2>
              <p className="text-espresso-300 text-sm sm:text-base leading-relaxed mb-6">
                Receive curated seasonal micro-lots delivered on your schedule (every 1, 2, or 4 weeks). Save 15% on every bag, unlock free shipping, and receive exclusive access to ultra-limited competition coffees.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/shop?category=subscriptions"
                  className="px-6 py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-amber-900/40 transition-all"
                >
                  Configure Your Subscription
                </Link>
                <div className="text-xs text-espresso-400 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Pause, adjust, or cancel anytime with zero commitments
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CUSTOMER PRAISE & REVIEWS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Community Verified</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">What Coffee Enthusiasts Say</h2>
          <p className="text-espresso-300 text-sm mt-3">
            Over 1,200 five-star ratings from home baristas, cafes, and coffee lovers worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-espresso-900/60 border border-espresso-800 p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 mb-4">
                <RatingStars rating={5} size="sm" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                "The Yirgacheffe notes are mesmerizing"
              </h3>
              <p className="text-espresso-300 text-xs sm:text-sm leading-relaxed font-light">
                "I brew with a Fellow Ode grinder and V60. The jasmine aroma when blooming this coffee fills the entire kitchen. Kavah roast dates are always crisp and honest."
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-espresso-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-700/30 text-amber-400 flex items-center justify-center font-semibold text-xs">
                MR
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Marcus Romero</p>
                <p className="text-[11px] text-amber-400">Verified Buyer &bull; Seattle, WA</p>
              </div>
            </div>
          </div>

          <div className="bg-espresso-900/60 border border-espresso-800 p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 mb-4">
                <RatingStars rating={5} size="sm" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                "Dark Roast without the burnt bitterness"
              </h3>
              <p className="text-espresso-300 text-xs sm:text-sm leading-relaxed font-light">
                "Most roasters incinerate dark roast beans. Kavah's French Roast and Velvet Obsidian extract rich dark baker's cocoa with thick golden crema on my La Marzocco."
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-espresso-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-700/30 text-amber-400 flex items-center justify-center font-semibold text-xs">
                SL
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Sophia Laurent</p>
                <p className="text-[11px] text-amber-400">Verified Buyer &bull; Austin, TX</p>
              </div>
            </div>
          </div>

          <div className="bg-espresso-900/60 border border-espresso-800 p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 mb-4">
                <RatingStars rating={5} size="sm" />
              </div>
              <h3 className="font-serif text-lg font-bold text-white mb-2">
                "Flawless packaging and speed"
              </h3>
              <p className="text-espresso-300 text-xs sm:text-sm leading-relaxed font-light">
                "Ordered on Monday morning, roasted on Monday afternoon, arrived at my door Wednesday. The nitrogen-flushed zipper bags keep beans fresh for weeks."
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-espresso-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-700/30 text-amber-400 flex items-center justify-center font-semibold text-xs">
                DK
              </div>
              <div>
                <p className="text-xs font-semibold text-white">David Kim</p>
                <p className="text-[11px] text-amber-400">Verified Buyer &bull; Denver, CO</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. LIFESTYLE INSTAGRAM / ROASTERY SNAPSHOTS */}
      <section className="py-16 bg-espresso-900/40 border-t border-espresso-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Behind The Scenes</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1">@KavahCoffeeRoasters</h2>
          <p className="text-xs text-espresso-400 mt-1">Tag #KavahBrew to be featured in our monthly roastery cupping showcase.</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="relative aspect-square rounded-xl overflow-hidden group border border-espresso-800">
              <img
                src="/images/espresso-extraction.jpg"
                alt="Bottomless portafilter espresso shot extraction"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-espresso-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-semibold px-3 py-1 bg-espresso-900/80 rounded-full border border-espresso-700">
                  9-bar Extraction
                </span>
              </div>
            </div>

            <div className="relative aspect-square rounded-xl overflow-hidden group border border-espresso-800">
              <img
                src="/images/barista-latte-heart.jpg"
                alt="Barista pouring delicate latte art heart"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-espresso-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-semibold px-3 py-1 bg-espresso-900/80 rounded-full border border-espresso-700">
                  Micro-foam Latte Art
                </span>
              </div>
            </div>

            <div className="relative aspect-square rounded-xl overflow-hidden group border border-espresso-800">
              <img
                src="/images/coffee-drying-beds.jpg"
                alt="Raised African drying beds at high-altitude washing station"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-espresso-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-semibold px-3 py-1 bg-espresso-900/80 rounded-full border border-espresso-700">
                  Raised Drying Beds
                </span>
              </div>
            </div>

            <div className="relative aspect-square rounded-xl overflow-hidden group border border-espresso-800">
              <img
                src="/images/cappuccino-latte-art.jpg"
                alt="Artisanal cappuccino cup with velvet crema"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-espresso-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-semibold px-3 py-1 bg-espresso-900/80 rounded-full border border-espresso-700">
                  Morning Ritual
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK VIEW MODAL */}
      <QuickViewModal
        product={selectedQuickViewProduct}
        isOpen={!!selectedQuickViewProduct}
        onClose={() => setSelectedQuickViewProduct(null)}
      />
    </div>
  );
};
