import { Router } from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  syncWishlist
} from '../controllers/wishlistController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getWishlist);
router.post('/sync', protect, syncWishlist);
router.post('/:productId', protect, addToWishlist);
router.delete('/:productId', protect, removeFromWishlist);

export default router;
