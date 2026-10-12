import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { IProduct, ICategory } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { QuickViewModal } from '../components/common/QuickViewModal';
import { ProductCardSkeleton } from '../components/common/SkeletonLoader';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<IProduct[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<IProduct | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  // Filters state from URL or defaults
  const currentCategory = searchParams.get('category') || '';
  const currentRoast = searchParams.get('roast') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'featured';
  const currentOrigin = searchParams.get('origin') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const maxPrice = Number(searchParams.get('maxPrice')) || 50;

  // Fetch products and categories
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const params: any = { limit: 100 };
        if (currentCategory) params.category = currentCategory;
        if (currentRoast) params.roastLevel = currentRoast;
        if (currentSearch) params.search = currentSearch;
        if (currentOrigin) params.origin = currentOrigin;

        const [prodRes, catRes] = await Promise.all([
          api.getProducts(params),
          api.getCategories()
        ]);

        if (prodRes.success && prodRes.products) {
          setProducts(prodRes.products);
        }
        if (catRes.success && catRes.categories) {
          setCategories(catRes.categories);
        }
      } catch (err) {
        console.error('Failed to load shop catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [currentCategory, currentRoast, currentSearch, currentOrigin]);

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // In Stock filter
    if (inStockOnly) {
      result = result.filter(p => p.inventory > 0);
    }

    // Price filter
    result = result.filter(p => p.price <= maxPrice);

    // Sorting
    if (currentSort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (currentSort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // featured: best sellers and featured first
      result.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      });
    }

    return result;
  }, [products, inStockOnly, maxPrice, currentSort]);

  // Update query params helper
  const updateFilter = (key: string, value: string | null) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === '') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const roastOptions = ['Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark'];
  const originOptions = ['Ethiopia', 'Colombia', 'Guatemala', 'Sumatra', 'Kenya', 'Costa Rica', 'Honduras', 'Brazil'];

  const hasActiveFilters = Boolean(currentCategory || currentRoast || currentSearch || currentOrigin || inStockOnly || maxPrice < 50);

  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <nav className="text-xs text-espresso-400 flex items-center gap-2 mb-3">
            <a href="/" className="hover:text-amber-400">Home</a>
            <span>/</span>
            <span className="text-espresso-200">Catalog & Specialty Roasts</span>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Specialty Coffee Offerings
              </h1>
              <p className="text-xs sm:text-sm text-espresso-300 mt-1 max-w-xl">
                Carefully selected micro-lots roasted fresh to order. Choose your preferred grind profile and bag size.
              </p>
            </div>
            <div className="text-xs text-espresso-400">
              Showing <span className="font-semibold text-amber-400">{filteredProducts.length}</span> of {products.length} roasts
            </div>
          </div>
        </div>

        {/* Search & Toolbar Bar */}
        <div className="bg-espresso-900/70 border border-espresso-800 rounded-xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              value={currentSearch}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search by notes (e.g. Jasmine, Chocolate, Caramel)..."
              className="w-full bg-espresso-950/80 border border-espresso-700/80 rounded-lg px-4 py-2.5 pl-10 text-xs sm:text-sm text-espresso-100 placeholder-espresso-500 focus:outline-none focus:border-amber-500"
            />
            <svg
              className="w-4 h-4 text-espresso-400 absolute left-3.5 top-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {currentSearch && (
              <button
                onClick={() => updateFilter('search', null)}
                className="absolute right-3 top-3 text-espresso-400 hover:text-espresso-200 text-xs"
              >
                &times;
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Trigger */}
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden px-3.5 py-2.5 bg-espresso-800 border border-espresso-700 text-xs font-semibold rounded-lg flex items-center gap-2 text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filters
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-amber-500" />}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-espresso-400 hidden sm:inline">Sort By:</label>
              <select
                value={currentSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="bg-espresso-950 border border-espresso-700/80 rounded-lg px-3 py-2 text-xs text-espresso-200 focus:outline-none focus:border-amber-500"
              >
                <option value="featured">Featured & Curated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated (★)</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex items-center bg-espresso-950 border border-espresso-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-amber-600 text-white' : 'text-espresso-400 hover:text-white'}`}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-amber-600 text-white' : 'text-espresso-400 hover:text-white'}`}
                title="List View"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs text-espresso-400 font-medium">Active Filters:</span>
            {currentCategory && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300">
                Category: {categories.find(c => c.slug === currentCategory)?.name || currentCategory}
                <button onClick={() => updateFilter('category', null)} className="hover:text-white">&times;</button>
              </span>
            )}
            {currentRoast && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300">
                Roast: {currentRoast}
                <button onClick={() => updateFilter('roast', null)} className="hover:text-white">&times;</button>
              </span>
            )}
            {currentOrigin && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300">
                Origin: {currentOrigin}
                <button onClick={() => updateFilter('origin', null)} className="hover:text-white">&times;</button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300">
                In Stock Only
                <button onClick={() => updateFilter('inStock', null)} className="hover:text-white">&times;</button>
              </span>
            )}
            {maxPrice < 50 && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300">
                Max ${maxPrice}
                <button onClick={() => updateFilter('maxPrice', null)} className="hover:text-white">&times;</button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-espresso-400 hover:text-amber-400 underline ml-2"
            >
              Reset all
            </button>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR FILTERS (DESKTOP + MOBILE) */}
          <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} lg:col-span-1 space-y-6 bg-espresso-900/40 lg:bg-transparent p-5 lg:p-0 rounded-2xl border lg:border-none border-espresso-800`}>
            {/* Category Filter */}
            <div className="pb-6 border-b border-espresso-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                Roast Collection
              </h3>
              <div className="space-y-1.5">
                <button
                  onClick={() => updateFilter('category', null)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors flex justify-between items-center ${
                    !currentCategory ? 'bg-amber-600/20 text-amber-300 font-semibold' : 'text-espresso-300 hover:text-white'
                  }`}
                >
                  <span>All Coffees</span>
                  <span className="text-[11px] text-espresso-500">{products.length}</span>
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id}
                    onClick={() => updateFilter('category', c.slug)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors flex justify-between items-center ${
                      currentCategory === c.slug ? 'bg-amber-600/20 text-amber-300 font-semibold' : 'text-espresso-300 hover:text-white'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="text-[11px] text-espresso-500">{c.itemCount}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Roast Level Spectrum */}
            <div className="pb-6 border-b border-espresso-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                Roast Profile
              </h3>
              <div className="space-y-1.5">
                {roastOptions.map((roast) => (
                  <button
                    key={roast}
                    onClick={() => updateFilter('roast', currentRoast === roast ? null : roast)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-2 ${
                      currentRoast === roast ? 'bg-amber-600/20 text-amber-300 font-semibold' : 'text-espresso-300 hover:text-white'
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        roast === 'Light' ? 'bg-amber-200' :
                        roast === 'Medium-Light' ? 'bg-amber-400' :
                        roast === 'Medium' ? 'bg-amber-600' :
                        roast === 'Medium-Dark' ? 'bg-amber-800' : 'bg-espresso-700'
                      }`}
                    />
                    <span>{roast}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Origin */}
            <div className="pb-6 border-b border-espresso-800/80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3">
                Origin Terroir
              </h3>
              <div className="space-y-1.5">
                {originOptions.map((origin) => (
                  <button
                    key={origin}
                    onClick={() => updateFilter('origin', currentOrigin === origin ? null : origin)}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between ${
                      currentOrigin === origin ? 'bg-amber-600/20 text-amber-300 font-semibold' : 'text-espresso-300 hover:text-white'
                    }`}
                  >
                    <span>{origin}</span>
                    {currentOrigin === origin && <span className="text-amber-400 text-xs">&check;</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pb-6 border-b border-espresso-800/80">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Max Price
                </h3>
                <span className="text-xs font-semibold text-white">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="14"
                max="50"
                step="1"
                value={maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-full accent-amber-500 bg-espresso-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-espresso-400 mt-1">
                <span>$14</span>
                <span>$50</span>
              </div>
            </div>

            {/* Stock Availability */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-espresso-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : null)}
                  className="rounded border-espresso-700 bg-espresso-950 text-amber-500 focus:ring-0 focus:ring-offset-0"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* PRODUCT GRID / LIST */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 px-4 bg-espresso-900/30 border border-espresso-800 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-xl font-bold text-white mb-2">No matching roasts found</h3>
                <p className="text-xs text-espresso-300 max-w-sm mx-auto mb-6">
                  Try adjusting your flavor note filters, price slider, or roast profile to see more offerings.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onQuickView={setSelectedQuickViewProduct}
                  />
                ))}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="bg-espresso-900/60 border border-espresso-800 rounded-xl p-4 flex flex-col sm:flex-row gap-5 hover:border-amber-600/40 transition-all"
                  >
                    <div className="w-full sm:w-44 h-44 rounded-lg overflow-hidden shrink-0 relative bg-espresso-950">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                      {product.badge && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-amber-600 text-white">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[11px] text-amber-400 font-medium uppercase tracking-wider">{product.category}</span>
                          {product.origin && <span className="text-espresso-500">&bull;</span>}
                          {product.origin && <span className="text-[11px] text-espresso-400">{product.origin}</span>}
                        </div>
                        <a href={`/product/${product.slug}`} className="font-serif text-lg font-bold text-white hover:text-amber-400 transition-colors">
                          {product.name}
                        </a>
                        <p className="text-xs text-espresso-300 mt-1 line-clamp-2 leading-relaxed">
                          {product.shortDescription}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {product.tastingNotes?.slice(0, 3).map((note, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-espresso-800/80 text-[10px] rounded text-espresso-300 border border-espresso-700/60">
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-espresso-800/80 flex items-center justify-between">
                        <div>
                          <span className="text-lg font-serif font-bold text-white">
                            ${product.salePrice || product.price}
                          </span>
                          {product.salePrice && (
                            <span className="text-xs text-espresso-400 line-through ml-2">
                              ${product.price}
                            </span>
                          )}
                          <span className="text-[11px] text-espresso-400 ml-1.5">/ 250g</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedQuickViewProduct(product)}
                            className="px-4 py-2 bg-espresso-800 hover:bg-espresso-700 text-white rounded-lg text-xs font-semibold border border-espresso-700"
                          >
                            Quick View
                          </button>
                          <a
                            href={`/product/${product.slug}`}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold"
                          >
                            View Details
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      <QuickViewModal
        product={selectedQuickViewProduct}
        isOpen={!!selectedQuickViewProduct}
        onClose={() => setSelectedQuickViewProduct(null)}
      />
    </div>
  );
};
