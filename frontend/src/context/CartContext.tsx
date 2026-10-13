import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IProduct, IProductVariant, ICartItem } from '../types';
import { api } from '../services/api';
import { useToast } from './ToastContext';

interface AppliedCoupon {
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  description: string;
}

interface CartContextType {
  items: ICartItem[];
  addItem: (product: IProduct, variant?: IProductVariant, quantity?: number) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  clearCart: () => void;
  coupon: AppliedCoupon | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  tax: number;
  total: number;
  itemCount: number;
  freeShippingRemaining: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ICartItem[]>(() => {
    try {
      const stored = localStorage.getItem('kavah_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState<AppliedCoupon | null>(() => {
    try {
      const stored = localStorage.getItem('kavah_coupon');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const { showToast } = useToast();

  useEffect(() => {
    localStorage.setItem('kavah_cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('kavah_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('kavah_coupon');
    }
  }, [coupon]);

  const addItem = (product: IProduct, variant?: IProductVariant, quantity = 1) => {
    const selectedVariant = variant || (product.variants && product.variants.length > 0 ? product.variants[0] : null) || {
      id: `${product.sku || 'KAV'}-default`,
      weight: '250g',
      grind: 'Whole Bean',
      price: product.price || 0,
      salePrice: product.salePrice || undefined,
      sku: product.sku || 'KAV-DEF',
      stock: product.inventory !== undefined ? product.inventory : 99
    };

    const unitPrice = selectedVariant.salePrice || selectedVariant.price || product.salePrice || product.price;

    setItems(prevItems => {
      const existingIdx = prevItems.findIndex(
        item => item.product._id === product._id && item.variant.id === selectedVariant.id
      );

      if (existingIdx > -1) {
        const currentQty = prevItems[existingIdx].quantity;
        const newQty = currentQty + quantity;

        // Stock check
        if (selectedVariant.stock && newQty > selectedVariant.stock) {
          showToast(`Maximum available stock reached for ${product.name}.`, 'error');
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: Number((unitPrice * newQty).toFixed(2))
        };
        showToast(`Updated "${product.name}" quantity to ${newQty}.`);
        return updated;
      } else {
        if (selectedVariant.stock && quantity > selectedVariant.stock) {
          showToast(`Only ${selectedVariant.stock} units available in stock.`, 'error');
          return prevItems;
        }

        showToast(`Added "${product.name}" (${selectedVariant.weight}) to your cart.`);
        return [
          ...prevItems,
          {
            product,
            variant: selectedVariant,
            quantity,
            unitPrice,
            totalPrice: Number((unitPrice * quantity).toFixed(2))
          }
        ];
      }
    });
  };

  const updateQuantity = (productId: string, variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.product._id === productId && item.variant.id === variantId) {
          if (item.variant.stock && quantity > item.variant.stock) {
            showToast(`Cannot exceed current stock (${item.variant.stock}).`, 'error');
            return item;
          }
          return {
            ...item,
            quantity,
            totalPrice: Number((item.unitPrice * quantity).toFixed(2))
          };
        }
        return item;
      })
    );
  };

  const removeItem = (productId: string, variantId: string) => {
    setItems(prevItems => {
      const filtered = prevItems.filter(
        item => !(item.product._id === productId && item.variant.id === variantId)
      );
      showToast('Item removed from cart.', 'info');
      return filtered;
    });
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  // Calculations
  const subtotal = Number(
    items.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)
  );

  let discountAmount = 0;
  if (coupon) {
    if (coupon.discountType === 'percentage') {
      discountAmount = Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
    } else if (coupon.discountType === 'fixed') {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    } else if (coupon.discountType === 'free_shipping') {
      discountAmount = subtotal > 0 ? 6.50 : 0;
    }
  }

  const freeShippingThreshold = 50.00;
  const freeShippingRemaining = Math.max(0, Number((freeShippingThreshold - subtotal).toFixed(2)));

  const isFreeShipping = subtotal >= freeShippingThreshold || coupon?.code === 'FREESHIP';
  const shippingFee = subtotal === 0 ? 0 : (isFreeShipping ? 0 : 6.50);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = Number((taxableAmount * 0.075).toFixed(2));
  const total = Number((taxableAmount + shippingFee + tax).toFixed(2));

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = async (code: string): Promise<boolean> => {
    try {
      const res = await api.validateCoupon(code, subtotal);
      if (res.success && res.coupon) {
        setCoupon({
          code: res.coupon.code,
          discountType: res.coupon.discountType,
          discountValue: res.coupon.discountValue,
          discountAmount: res.coupon.discountAmount,
          description: res.coupon.description
        });
        showToast(res.message);
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(err.message || 'Invalid promotion code.', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    showToast('Promotion code removed.', 'info');
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
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
        itemCount,
        freeShippingRemaining
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
