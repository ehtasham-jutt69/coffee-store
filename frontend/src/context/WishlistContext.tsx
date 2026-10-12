import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IProduct } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface WishlistContextType {
  wishlist: IProduct[];
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: IProduct) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<IProduct[]>(() => {
    try {
      const stored = localStorage.getItem('kavah_guest_wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  // Load or sync wishlist when user logs in
  useEffect(() => {
    const fetchAuthWishlist = async () => {
      if (isAuthenticated) {
        try {
          // If guest items existed in local storage, sync them to user DB
          const guestItems = localStorage.getItem('kavah_guest_wishlist');
          if (guestItems) {
            const parsed = JSON.parse(guestItems);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const ids = parsed.map((p: any) => p._id);
              const syncRes = await api.syncWishlist(ids);
              if (syncRes.success && syncRes.wishlist) {
                setWishlist(syncRes.wishlist);
                localStorage.removeItem('kavah_guest_wishlist');
                return;
              }
            }
          }

          const res = await api.getWishlist();
          if (res.success && res.wishlist) {
            setWishlist(res.wishlist);
          }
        } catch (err: any) {
          console.error('Error loading user wishlist:', err.message);
        }
      }
    };

    fetchAuthWishlist();
  }, [isAuthenticated]);

  // Persist to local storage for guests
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('kavah_guest_wishlist', JSON.stringify(wishlist));
    }
  }, [wishlist, isAuthenticated]);

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p._id === productId);
  };

  const toggleWishlist = async (product: IProduct) => {
    const exists = isInWishlist(product._id);

    if (exists) {
      await removeFromWishlist(product._id);
    } else {
      setWishlist(prev => [...prev, product]);
      showToast(`Saved "${product.name}" to your wishlist.`);

      if (isAuthenticated) {
        try {
          await api.addToWishlist(product._id);
        } catch (err: any) {
          console.error(err);
        }
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    const target = wishlist.find(p => p._id === productId);
    setWishlist(prev => prev.filter(p => p._id !== productId));
    showToast(`Removed "${target?.name || 'Item'}" from wishlist.`, 'info');

    if (isAuthenticated) {
      try {
        await api.removeFromWishlist(productId);
      } catch (err: any) {
        console.error(err);
      }
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        wishlistCount: wishlist.length
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
