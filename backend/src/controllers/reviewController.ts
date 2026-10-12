import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({
      product: productId,
      approved: true
    }).sort({ createdAt: -1 });

    // Compute rating breakdown
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalScore = 0;

    reviews.forEach(r => {
      totalScore += r.rating;
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 ? Number((totalScore / totalReviews).toFixed(1)) : 5.0;

    res.status(200).json({
      success: true,
      total: totalReviews,
      averageRating,
      distribution,
      reviews
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create review for product
// @route   POST /api/reviews
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, rating, title, comment, customerName } = req.body;

    if (!productId || !rating || !title || !comment) {
      res.status(400).json({ success: false, message: 'Rating, title, and comment are required.' });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const authorName = customerName || (req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Coffee Enthusiast');

    const review = await Review.create({
      product: product._id,
      user: req.user?._id,
      customerName: authorName.trim(),
      rating: Math.min(5, Math.max(1, Number(rating))),
      title: title.trim(),
      comment: comment.trim(),
      verifiedPurchase: true,
      approved: true
    });

    // Update product rating and review count
    const allApproved = await Review.find({ product: product._id, approved: true });
    const avg = allApproved.reduce((sum, r) => sum + r.rating, 0) / allApproved.length;
    product.rating = Number(avg.toFixed(1));
    product.reviewCount = allApproved.length;
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been published.',
      review
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all reviews (Admin)
// @route   GET /api/reviews
export const getAllReviewsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const reviews = await Review.find()
      .populate('product', 'name slug images')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update review approval status (Admin)
// @route   PATCH /api/reviews/:id/status
export const updateReviewStatusAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { approved } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { approved: Boolean(approved) },
      { new: true }
    );

    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    // Recalculate product rating
    const allApproved = await Review.find({ product: review.product, approved: true });
    const product = await Product.findById(review.product);
    if (product) {
      if (allApproved.length > 0) {
        const avg = allApproved.reduce((sum, r) => sum + r.rating, 0) / allApproved.length;
        product.rating = Number(avg.toFixed(1));
        product.reviewCount = allApproved.length;
      } else {
        product.rating = 5.0;
        product.reviewCount = 0;
      }
      await product.save();
    }

    res.status(200).json({
      success: true,
      message: `Review marked as ${review.approved ? 'approved' : 'hidden'}.`,
      review
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
