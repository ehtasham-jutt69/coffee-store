import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/admin', label: 'Dashboard & Metrics', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/admin/orders', label: 'Order Fulfillment', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
    { to: '/admin/products', label: 'Coffee Inventory', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { to: '/admin/customers', label: 'Club Customers', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { to: '/admin/coupons', label: 'Promo Coupons', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
    { to: '/admin/reviews', label: 'Cupping Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  ];

  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen flex flex-col">
      {/* Top Admin Bar */}
      <header className="bg-espresso-900 border-b border-espresso-800 px-6 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center text-white font-serif font-bold text-base">
              K
            </div>
            <span className="font-serif text-lg font-bold text-white hidden sm:inline">
              Kavah & Co. <span className="text-amber-400 font-sans text-xs uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">Roastery Admin</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/shop"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5"
          >
            <span>&larr; View Public Store</span>
          </Link>
          <div className="h-4 w-px bg-espresso-800" />
          <div className="flex items-center gap-2 text-xs text-espresso-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{user?.firstName} ({user?.email})</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-rose-400 hover:text-rose-300 ml-2"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Two-Column Admin Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-espresso-900/60 border-r border-espresso-800/80 p-4 shrink-0">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-espresso-300 hover:text-white hover:bg-espresso-800/60'
                  }`
                }
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={item.icon} />
                </svg>
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-8 p-4 bg-espresso-950/80 rounded-xl border border-espresso-800">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
              Production Environment
            </span>
            <p className="text-[11px] text-espresso-400">
              Connected to MongoDB Atlas cluster with live stock tracking.
            </p>
          </div>
        </aside>

        {/* ADMIN CONTENT STAGE */}
        <main className="flex-1 p-6 sm:p-8 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
