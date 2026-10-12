import { Router } from 'express';
import { getDashboardStats, getCustomersAdmin } from '../controllers/adminController';
import { protect, adminOnly } from '../middleware/auth';

const router = Router();

router.get('/dashboard', protect, adminOnly, getDashboardStats);
router.get('/customers', protect, adminOnly, getCustomersAdmin);

export default router;
