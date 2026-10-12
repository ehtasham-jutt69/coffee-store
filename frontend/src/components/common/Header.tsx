import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  PackageCheck,
  Settings,
  LogOut,
  Coffee
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();

  const navigate = useNavigate();
  const location = useLocation();
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* Top Banner */}
      <div className="bg-coffee-950 text-roast-crema text-xs tracking-wider uppercase py-2 px-4 text-center font-medium border-b border-coffee-900/60 flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-roast-gold animate-pulse" />
        <span>Complimentary roastery shipping on orders over $50</span>
        <span className="hidden sm:inline text-coffee-400">•</span>
        <span className="hidden sm:inline text-coffee-300">Small-batch roasted to order</span>
      </div>

      {/* Main Navigation Bar */}
      <nav
        className={`bg-white/95 backdrop-blur-md border-b transition-all duration-300 ${
          isScrolled ? 'border-coffee-200 shadow-sm py-3' : 'border-coffee-100 py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-coffee-900 hover:text-coffee-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-coffee-950 flex items-center justify-center text-roast-gold group-hover:scale-105 transition-transform shadow-inner">
              <Coffee className="w-5 h-5 text-roast-gold" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-coffee-950 group-hover:text-coffee-800 transition-colors">
                KAVAH & CO.
              </span>
              <span className="text-[10px] uppercase tracking-widest text-coffee-500 font-sans -mt-1 font-semibold">
                Artisanal Roasters
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8 text-sm font-medium tracking-wide text-coffee-800">
            <Link to="/shop" className="hover:text-roast-bronze transition-colors py-1">
              Shop All
            </Link>
            <Link to="/shop?category=single-origin" className="hover:text-roast-bronze transition-colors py-1">
              Single Origin
            </Link>
            <Link to="/shop?category=house-blends" className="hover:text-roast-bronze transition-colors py-1">
              Espresso & Blends
            </Link>
            <Link to="/shop?category=equipment" className="hover:text-roast-bronze transition-colors py-1">
              Brew Gear
            </Link>
            <Link to="/collections" className="hover:text-roast-bronze transition-colors py-1">
              Collections
            </Link>
            <Link to="/coffee-guide" className="hover:text-roast-bronze transition-colors py-1">
              Brew Guide
            </Link>
            <Link to="/journal" className="hover:text-roast-bronze transition-colors py-1">
              Journal
            </Link>
            <Link to="/about" className="hover:text-roast-bronze transition-colors py-1">
              About
            </Link>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-coffee-800 hover:text-coffee-950 hover:bg-coffee-50 rounded-full transition-colors"
              aria-label="Search roasts"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link */}
            <Link
              to="/wishlist"
              className="p-2 text-coffee-800 hover:text-coffee-950 hover:bg-coffee-50 rounded-full transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-roast-bronze text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* User Account Menu */}
            <div className="relative" ref={accountMenuRef}>
              <button
                onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                className="p-2 text-coffee-800 hover:text-coffee-950 hover:bg-coffee-50 rounded-full transition-colors flex items-center gap-1"
                aria-label="Account"
              >
                <UserIcon className="w-5 h-5" />
                {isAuthenticated && <ChevronDown className="w-3.5 h-3.5 hidden sm:inline text-coffee-500" />}
              </button>

              {/* Account Dropdown */}
              {accountMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-coffee-100 py-2.5 z-50 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                  {isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-3 border-b border-coffee-100">
                        <p className="text-xs text-coffee-500 uppercase tracking-wider font-semibold">Signed in as</p>
                        <p className="font-semibold text-coffee-950 truncate mt-0.5">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-coffee-500 truncate">{user.email}</p>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded-md border border-amber-200/80">
                            <ShieldCheck className="w-3 h-3 text-amber-700" /> Roastery Admin
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-2.5 px-4 py-2 text-coffee-900 font-semibold hover:bg-amber-50 hover:text-amber-900 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            Admin Dashboard
                          </Link>
                        )}
                        <Link
                          to="/account"
                          className="flex items-center gap-2.5 px-4 py-2 text-coffee-800 hover:bg-coffee-50 hover:text-coffee-950 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-coffee-500" />
                          Account Overview
                        </Link>
                        <Link
                          to="/account/orders"
                          className="flex items-center gap-2.5 px-4 py-2 text-coffee-800 hover:bg-coffee-50 hover:text-coffee-950 transition-colors"
                        >
                          <PackageCheck className="w-4 h-4 text-coffee-500" />
                          My Orders
                        </Link>
                        <Link
                          to="/account/settings"
                          className="flex items-center gap-2.5 px-4 py-2 text-coffee-800 hover:bg-coffee-50 hover:text-coffee-950 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-coffee-500" />
                          Settings & Security
                        </Link>
                      </div>

                      <div className="border-t border-coffee-100 pt-1 mt-1">
                        <button
                          onClick={() => {
                            logout();
                            setAccountMenuOpen(false);
                          }}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 space-y-2">
                      <p className="text-xs text-coffee-600 px-1 font-medium">Access your orders, saved roasts, and subscription preferences.</p>
                      <Link
                        to="/login"
                        className="block w-full py-2 px-3 text-center bg-coffee-950 text-white rounded-xl font-medium text-xs hover:bg-coffee-800 transition-colors shadow-sm"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        className="block w-full py-2 px-3 text-center border border-coffee-200 text-coffee-900 rounded-xl font-medium text-xs hover:bg-coffee-50 transition-colors"
                      >
                        Create Account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart Button */}
            <Link
              to="/cart"
              className="flex items-center gap-2 bg-coffee-950 text-white px-3.5 py-2 rounded-full hover:bg-coffee-800 transition-all shadow-sm group"
              aria-label="Cart"
            >
              <ShoppingBag className="w-4 h-4 text-roast-gold group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold tracking-wide">
                {itemCount}
              </span>
            </Link>
          </div>
        </div>

        {/* Search Bar Dropdown Overlay */}
        {searchOpen && (
          <div className="border-t border-coffee-100 bg-coffee-50/90 py-3 px-4 sm:px-8 animate-in fade-in duration-200">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-coffee-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search single-origin, dark espresso, roast level, origin..."
                  className="w-full bg-white border border-coffee-200 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-roast-bronze/40 focus:border-roast-bronze transition-all"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-coffee-950 text-white text-xs font-semibold uppercase tracking-wider rounded-xl hover:bg-coffee-800 transition-colors shadow-sm"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="p-2 text-coffee-500 hover:text-coffee-900 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex flex-col w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 z-10 overflow-y-auto">
            <div className="flex items-center justify-between pb-5 border-b border-coffee-100">
              <span className="font-serif text-xl font-bold text-coffee-950">KAVAH & CO.</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 -mr-2 text-coffee-700 hover:text-coffee-950"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Nav Links */}
            <div className="flex flex-col space-y-4 py-6 text-base font-medium text-coffee-900 border-b border-coffee-100">
              <Link to="/shop" className="hover:text-roast-bronze transition-colors">
                Shop All Roasts
              </Link>
              <Link to="/shop?category=single-origin" className="hover:text-roast-bronze transition-colors">
                Single Origin Microlots
              </Link>
              <Link to="/shop?category=house-blends" className="hover:text-roast-bronze transition-colors">
                Espresso & House Blends
              </Link>
              <Link to="/shop?category=flavored-infusions" className="hover:text-roast-bronze transition-colors">
                Infused & Flavored
              </Link>
              <Link to="/shop?category=equipment" className="hover:text-roast-bronze transition-colors">
                Brew Gear & Mugs
              </Link>
              <Link to="/collections" className="hover:text-roast-bronze transition-colors">
                Featured Collections
              </Link>
              <Link to="/coffee-guide" className="hover:text-roast-bronze transition-colors">
                Interactive Coffee Guide
              </Link>
              <Link to="/journal" className="hover:text-roast-bronze transition-colors">
                Coffee Journal
              </Link>
              <Link to="/about" className="hover:text-roast-bronze transition-colors">
                Our Story & Roastery
              </Link>
              <Link to="/contact" className="hover:text-roast-bronze transition-colors">
                Contact & Tasting Room
              </Link>
            </div>

            {/* Mobile Auth / Account Area */}
            <div className="pt-6 space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="p-3 bg-coffee-50 rounded-xl">
                    <p className="text-xs text-coffee-500 font-semibold uppercase">Hello,</p>
                    <p className="font-bold text-coffee-950">{user?.firstName} {user?.lastName}</p>
                  </div>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      className="block w-full text-center py-2.5 bg-amber-800 text-white rounded-xl text-sm font-semibold"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/account"
                    className="block w-full text-center py-2.5 border border-coffee-300 text-coffee-900 rounded-xl text-sm font-semibold"
                  >
                    My Account
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-center py-2.5 text-rose-600 text-sm font-semibold"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    className="block w-full text-center py-2.5 bg-coffee-950 text-white rounded-xl text-sm font-semibold shadow-sm"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="block w-full text-center py-2.5 border border-coffee-200 text-coffee-900 rounded-xl text-sm font-semibold"
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
