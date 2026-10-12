export interface IProductVariant {
  id: string;
  weight: string;
  grind: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  category: string;
  categoryRef?: string;
  shortDescription: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  inventory: number;
  rating: number;
  reviewCount: number;
  roastLevel?: 'Light' | 'Medium-Light' | 'Medium' | 'Medium-Dark' | 'Dark';
  origin?: string;
  coffeeType: 'Single Origin' | 'Blend' | 'Espresso' | 'Decaf' | 'Flavored' | 'Cold Brew' | 'Equipment' | 'Gift Sets';
  tastingNotes: string[];
  brewingMethod: string[];
  processingMethod?: string;
  elevation?: string;
  variants: IProductVariant[];
  images: string[];
  badge?: string;
  featured: boolean;
  bestSeller: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
  featured: boolean;
}

export interface IAddress {
  _id?: string;
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  addresses: IAddress[];
}

export interface ICartItem {
  product: IProduct;
  variant: IProductVariant;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrderItem {
  product: string | IProduct;
  name: string;
  image: string;
  variant: {
    weight: string;
    grind: string;
    sku?: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  user?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  items: IOrderItem[];
  shippingAddress: IAddress;
  billingAddress: IAddress;
  shippingMethod: {
    name: string;
    price: number;
    estimatedDays: string;
  };
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  tax: number;
  total: number;
  paymentMethod: 'credit_card' | 'cod' | 'test_payment';
  paymentStatus: 'Pending' | 'Paid' | 'Failed' | 'Refunded';
  orderStatus: 'Pending' | 'Confirmed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface IReview {
  _id: string;
  product: string | { _id: string; name: string; slug: string; images: string[] };
  user?: string;
  customerName: string;
  rating: number;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
  approved: boolean;
  createdAt: string;
}

export interface ICoupon {
  _id?: string;
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minimumOrder: number;
  expirationDate: string;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  description: string;
}
