import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin
} from '../controllers/orderController';
import { protect, adminOnly, optionalAuth } from '../middleware/auth';

const router = Router();

// Order creation supports both logged-in and guest checkout
router.post('/', optionalAuth, createOrder);

// Customer orders
router.get('/my', optionalAuth, getMyOrders);

// Admin orders management (placed before /:identifier to avoid collision)
router.get('/', protect, adminOnly, getAllOrdersAdmin);
router.put('/:id/status', protect, adminOnly, updateOrderStatusAdmin);

// Order details by ID or Order Number
router.get('/:identifier', optionalAuth, getOrderById);

export default router;
