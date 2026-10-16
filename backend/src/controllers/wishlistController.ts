import { Response } from 'express';
import mongoose from 'mongoose';
import { Wishlist } from '../models/Wishlist';
import { AuthRequest } from '../middleware/auth';

// @desc    Get user wishlist
// @route   GET /api/wishlist
export const getWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name slug price salePrice images rating reviewCount category badge roastLevel shortDescription inventory'
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    res.status(200).json({ success: true, wishlist: wishlist.products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/:productId
export const addToWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { productId } = req.params;
    const productIdStr = String(productId);
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: [new mongoose.Types.ObjectId(productIdStr)]
      });
    } else {
      const exists = wishlist.products.some(p => p.toString() === productIdStr);
      if (!exists) {
        wishlist.products.push(new mongoose.Types.ObjectId(productIdStr));
        await wishlist.save();
      }
    }

    const populated = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      select: 'name slug price salePrice images rating reviewCount category badge roastLevel shortDescription inventory'
    });

    res.status(200).json({
      success: true,
      message: 'Item added to wishlist.',
      wishlist: populated?.products || []
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
export const removeFromWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { productId } = req.params;
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (wishlist) {
      wishlist.products = wishlist.products.filter(p => p.toString() !== productId);
      await wishlist.save();
    }

    const populated = await Wishlist.findOne({ user: req.user._id }).populate({
      path: 'products',
      select: 'name slug price salePrice images rating reviewCount category badge roastLevel shortDescription inventory'
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist.',
      wishlist: populated?.products || []
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Sync guest wishlist on login
// @route   POST /api/wishlist/sync
export const syncWishlist = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    const { productIds } = req.body;
    if (!Array.isArray(productIds)) {
      res.status(400).json({ success: false, message: 'Invalid productIds array.' });
      return;
    }

    let wishlist = await Wishlist.findOne({ user: req.user._id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }

    const currentSet = new Set(wishlist.products.map(p => p.toString()));
    productIds.forEach(id => {
      if (mongoose.Types.ObjectId.isValid(id) && !currentSet.has(id)) {
        wishlist!.products.push(new mongoose.Types.ObjectId(id));
      }
    });

    await wishlist.save();

    const populated = await Wishlist.findById(wishlist._id).populate({
      path: 'products',
      select: 'name slug price salePrice images rating reviewCount category badge roastLevel shortDescription inventory'
    });

    res.status(200).json({
      success: true,
      message: 'Wishlist synced.',
      wishlist: populated?.products || []
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
