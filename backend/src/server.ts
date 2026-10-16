import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { Product } from './models/Product';
import { runSeed } from './seed/seed';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import orderRoutes from './routes/orderRoutes';
import couponRoutes from './routes/couponRoutes';
import reviewRoutes from './routes/reviewRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import adminRoutes from './routes/adminRoutes';
import { verifyEmailConfig } from './services/emailService';

// Load environment variables (Gmail / Brevo SMTP & Database)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Health route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    brand: 'Kavah & Co. Artisanal Roasters',
    time: new Date().toISOString()
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

// Connect DB and launch server
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is freshly initialized or empty
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('[Bootstrap] No products found in database. Auto-seeding initial specialty catalog...');
      await runSeed(false);
    }

    // Initialize & verify email notification service
    await verifyEmailConfig();

    app.listen(PORT, () => {
      console.log(`☕ Kavah & Co. REST API listening on http://localhost:${PORT}`);
    });
  } catch (error: any) {
    console.error('Fatal server boot failure:', error.message);
    process.exit(1);
  }
};

startServer();
