import mongoose, { Document, Schema } from 'mongoose';

export interface IProductVariant {
  id: string;
  weight: string; // e.g. "250g", "500g", "1kg", "Standard"
  grind: string; // e.g. "Whole Bean", "Espresso", "Filter / Drip", "French Press", "Coarse Cold Brew"
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  category: string;
  categoryRef?: mongoose.Types.ObjectId;
  shortDescription: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  inventory: number;
  rating: number;
  reviewCount: number;
  roastLevel?: 'Light' | 'Medium' | 'Medium-Dark' | 'Dark';
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
  createdAt: Date;
  updatedAt: Date;
}

const ProductVariantSchema = new Schema<IProductVariant>({
  id: { type: String, required: true },
  weight: { type: String, required: true },
  grind: { type: String, required: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  sku: { type: String, required: true },
  stock: { type: Number, required: true, default: 20 }
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    category: { type: String, required: true, index: true },
    categoryRef: { type: Schema.Types.ObjectId, ref: 'Category' },
    shortDescription: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    salePrice: { type: Number, min: 0 },
    sku: { type: String, required: true, unique: true },
    inventory: { type: Number, required: true, default: 50, min: 0 },
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    roastLevel: {
      type: String,
      enum: ['Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark', null],
      default: 'Medium'
    },
    origin: { type: String, default: '' },
    coffeeType: {
      type: String,
      enum: ['Single Origin', 'Blend', 'Espresso', 'Decaf', 'Flavored', 'Cold Brew', 'Equipment', 'Gift Sets'],
      default: 'Single Origin'
    },
    tastingNotes: [{ type: String }],
    brewingMethod: [{ type: String }],
    processingMethod: { type: String, default: '' },
    elevation: { type: String, default: '' },
    variants: [ProductVariantSchema],
    images: [{ type: String, required: true }],
    badge: { type: String, default: '' },
    featured: { type: Boolean, default: false, index: true },
    bestSeller: { type: Boolean, default: false, index: true },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', description: 'text', origin: 'text', tastingNotes: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
