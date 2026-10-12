import { Router } from 'express';
import {
  getProductReviews,
  createReview,
  getAllReviewsAdmin,
  updateReviewStatusAdmin
} from '../controllers/reviewController';
import { protect, adminOnly, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', optionalAuth, createReview);

// Admin review moderation
router.get('/', protect, adminOnly, getAllReviewsAdmin);
router.patch('/:id/status', protect, adminOnly, updateReviewStatusAdmin);

export default router;
