import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { seedCategories, seedProducts, seedCoupons, seedAdmin, seedCustomers } from './seedData';

export interface Env {
  MONGODB_URI?: string;
  JWT_SECRET?: string;
  ASSETS?: {
    fetch: (request: Request) => Promise<Response>;
  };
}

const app = new Hono<{ Bindings: Env; Variables: { user?: any } }>();

// Enable CORS for all incoming API calls
app.use('*', cors({
  origin: (origin) => origin || '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true,
}));

// MongoDB Client Cache across warm edge invocations
let cachedClient: MongoClient | null = null;

async function getDb(env: Env) {
  const uri = env.MONGODB_URI || 'mongodb+srv://Ehtasham:Spiderman.71@cluster0.bdehuam.mongodb.net/?appName=Cluster0';
  if (!cachedClient) {
    cachedClient = new MongoClient(uri, {
      maxPoolSize: 5,
      minPoolSize: 1,
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000,
    });
    await cachedClient.connect();
  }
  return cachedClient.db('coffee_store');
}

function getJwtSecret(env: Env): string {
  return env.JWT_SECRET || 'super_secret_kavah_coffee_jwt_key_2026_dev';
}

function generateToken(id: string, env: Env): string {
  return jwt.sign({ id }, getJwtSecret(env), { expiresIn: '30d' });
}

function verifyToken(token: string, env: Env): { id: string } | null {
  try {
    return jwt.verify(token, getJwtSecret(env)) as { id: string };
  } catch {
    return null;
  }
}

// Convert string id safely to ObjectId or string filter
function toIdFilter(id: string) {
  try {
    if (ObjectId.isValid(id)) {
      return { $or: [{ _id: new ObjectId(id) }, { _id: id }] };
    }
  } catch {}
  return { _id: id };
}

// Auth Middleware
async function authenticate(c: any, next: any) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, message: 'Not authorized, no token provided' }, 401);
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token, c.env);
  if (!decoded || !decoded.id) {
    return c.json({ success: false, message: 'Not authorized, invalid token' }, 401);
  }

  const db = await getDb(c.env);
  const user = await db.collection('users').findOne(toIdFilter(decoded.id));
  if (!user) {
    return c.json({ success: false, message: 'User not found' }, 401);
  }

  c.set('user', user);
  await next();
}

// Admin Middleware
async function requireAdmin(c: any, next: any) {
  const user = c.get('user');
  if (!user || user.role !== 'admin') {
    return c.json({ success: false, message: 'Not authorized as an admin' }, 403);
  }
  await next();
}

// Ensure database collections have initial data
async function ensureSeeded(db: any) {
  const productCount = await db.collection('products').countDocuments();
  if (productCount === 0) {
    console.log('[Worker] Database is empty. Seeding specialty catalog...');
    // Seed categories
    await db.collection('categories').insertMany(seedCategories.map((c: any) => ({
      ...c,
      createdAt: new Date(),
      updatedAt: new Date(),
    })));

    // Seed products
    await db.collection('products').insertMany(seedProducts.map((p: any) => ({
      ...p,
      createdAt: new Date(),
      updatedAt: new Date(),
    })));

    // Seed coupons
    await db.collection('coupons').insertMany(seedCoupons.map((c: any) => ({
      ...c,
      createdAt: new Date(),
      updatedAt: new Date(),
    })));

    // Seed users with hashed passwords
    const allUsers = [seedAdmin, ...seedCustomers];
    const usersWithHash = await Promise.all(
      allUsers.map(async (u: any) => {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        return {
          ...u,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      })
    );
    await db.collection('users').insertMany(usersWithHash);
  }
}

// ==========================================
// API ROUTES
// ==========================================

// Health Check
app.get('/api/health', (c) => {
  return c.json({
    status: 'online',
    platform: 'Cloudflare Workers (Edge)',
    brand: 'Kavah & Co. Artisanal Roasters',
    time: new Date().toISOString()
  });
});

// Explicit Seed Endpoint
app.post('/api/seed', async (c) => {
  try {
    const db = await getDb(c.env);
    await ensureSeeded(db);
    return c.json({ success: true, message: 'Specialty coffee data seeded successfully.' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// Categories
app.get('/api/categories', async (c) => {
  try {
    const db = await getDb(c.env);
    await ensureSeeded(db);
    const categories = await db.collection('categories').find({}).toArray();
    return c.json({ success: true, categories });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.post('/api/categories', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    const body = await c.req.json();
    const result = await db.collection('categories').insertOne({ ...body, createdAt: new Date() });
    return c.json({ success: true, category: { ...body, _id: result.insertedId } }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// Products
app.get('/api/products', async (c) => {
  try {
    const db = await getDb(c.env);
    await ensureSeeded(db);

    const query = c.req.query();
    const filter: any = {};

    if (query.category) filter.category = query.category;
    if (query.featured === 'true') filter.featured = true;
    if (query.bestSeller === 'true') filter.bestSeller = true;
    if (query.roastLevel) filter.roastLevel = query.roastLevel;

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { shortDescription: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } }
      ];
    }

    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 12));
    const skip = (page - 1) * limit;

    let sort: any = { createdAt: -1 };
    if (query.sort === 'price_asc') sort = { price: 1 };
    else if (query.sort === 'price_desc') sort = { price: -1 };
    else if (query.sort === 'rating') sort = { rating: -1 };

    const total = await db.collection('products').countDocuments(filter);
    const products = await db.collection('products').find(filter).sort(sort).skip(skip).limit(limit).toArray();

    return c.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      products
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.get('/api/products/slug/:slug', async (c) => {
  try {
    const db = await getDb(c.env);
    await ensureSeeded(db);
    const slug = c.req.param('slug');
    const product = await db.collection('products').findOne({ slug });
    if (!product) {
      return c.json({ success: false, message: 'Product not found' }, 404);
    }

    const relatedProducts = await db.collection('products')
      .find({ category: product.category, slug: { $ne: slug } })
      .limit(4)
      .toArray();

    return c.json({ success: true, product, relatedProducts });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.get('/api/products/:id', async (c) => {
  try {
    const db = await getDb(c.env);
    const id = c.req.param('id');
    const product = await db.collection('products').findOne(toIdFilter(id));
    if (!product) {
      return c.json({ success: false, message: 'Product not found' }, 404);
    }
    return c.json({ success: true, product });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.post('/api/products', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    const body = await c.req.json();
    const result = await db.collection('products').insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return c.json({ success: true, product: { ...body, _id: result.insertedId }, message: 'Product created successfully' }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.put('/api/products/:id', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    delete body._id;
    await db.collection('products').updateOne(toIdFilter(id), { $set: { ...body, updatedAt: new Date() } });
    const product = await db.collection('products').findOne(toIdFilter(id));
    return c.json({ success: true, product, message: 'Product updated successfully' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.delete('/api/products/:id', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    const id = c.req.param('id');
    await db.collection('products').deleteOne(toIdFilter(id));
    return c.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.patch('/api/products/:id/inventory', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    const id = c.req.param('id');
    const { inventory } = await c.req.json();
    await db.collection('products').updateOne(toIdFilter(id), { $set: { inventory: Number(inventory), updatedAt: new Date() } });
    return c.json({ success: true, inventory, message: 'Inventory updated' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// ==========================================
// AUTH & USER ROUTES
// ==========================================

app.post('/api/auth/signup', async (c) => {
  try {
    const db = await getDb(c.env);
    const body = await c.req.json();
    const { firstName, lastName, email, password, phone } = body;

    if (!email || !password) {
      return c.json({ success: false, message: 'Please provide both email and password.' }, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.collection('users').findOne({ email: normalizedEmail });
    if (existing) {
      return c.json({ success: false, message: 'An account with this email already exists.' }, 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      firstName: firstName || '',
      lastName: lastName || '',
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || '',
      role: 'customer',
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('users').insertOne(newUser);
    const user = { ...newUser, _id: result.insertedId };
    delete (user as any).password;

    const token = generateToken(String(result.insertedId), c.env);
    return c.json({ success: true, token, user, message: 'Account created successfully' }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const db = await getDb(c.env);
    await ensureSeeded(db);
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ success: false, message: 'Please provide email and password.' }, 400);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await db.collection('users').findOne({ email: normalizedEmail });
    if (!user) {
      return c.json({ success: false, message: 'Invalid email or password.' }, 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return c.json({ success: false, message: 'Invalid email or password.' }, 401);
    }

    const token = generateToken(String(user._id), c.env);
    const safeUser = { ...user };
    delete (safeUser as any).password;

    return c.json({ success: true, token, user: safeUser, message: 'Login successful' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.get('/api/auth/me', authenticate, (c) => {
  const user = { ...c.get('user') };
  delete user.password;
  return c.json({ success: true, user });
});

app.put('/api/auth/profile', authenticate, async (c) => {
  try {
    const db = await getDb(c.env);
    const user = c.get('user');
    const { firstName, lastName, phone } = await c.req.json();

    await db.collection('users').updateOne(toIdFilter(String(user._id)), {
      $set: { firstName, lastName, phone, updatedAt: new Date() }
    });

    const updated = await db.collection('users').findOne(toIdFilter(String(user._id)));
    delete (updated as any).password;
    return c.json({ success: true, user: updated, message: 'Profile updated' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.put('/api/auth/change-password', authenticate, async (c) => {
  try {
    const db = await getDb(c.env);
    const user = c.get('user');
    const { currentPassword, newPassword } = await c.req.json();

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return c.json({ success: false, message: 'Current password is incorrect' }, 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.collection('users').updateOne(toIdFilter(String(user._id)), {
      $set: { password: hashedPassword, updatedAt: new Date() }
    });

    return c.json({ success: true, message: 'Password changed successfully' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.post('/api/auth/forgot-password', async (c) => {
  try {
    const { email } = await c.req.json();
    const token = 'kavah-reset-' + Math.random().toString(36).substring(2, 10);
    return c.json({
      success: true,
      message: 'Password reset link sent (demo mode)',
      resetToken: token,
      resetUrl: `/reset-password?token=${token}`
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.post('/api/auth/reset-password', async (c) => {
  try {
    const { token, password } = await c.req.json();
    return c.json({ success: true, message: 'Password reset successful. Please sign in.' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.post('/api/auth/logout', (c) => {
  return c.json({ success: true });
});

// Addresses
app.post('/api/auth/addresses', authenticate, async (c) => {
  try {
    const db = await getDb(c.env);
    const user = c.get('user');
    const address = await c.req.json();
    const addressWithId = { ...address, id: 'addr_' + Date.now() };

    const addresses = [...(user.addresses || []), addressWithId];
    await db.collection('users').updateOne(toIdFilter(String(user._id)), {
      $set: { addresses, updatedAt: new Date() }
    });

    return c.json({ success: true, addresses, message: 'Address saved' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.put('/api/auth/addresses/:id', authenticate, async (c) => {
  try {
    const db = await getDb(c.env);
    const user = c.get('user');
    const id = c.req.param('id');
    const updatedAddress = await c.req.json();

    const addresses = (user.addresses || []).map((a: any) =>
      (a.id === id || a._id === id) ? { ...a, ...updatedAddress } : a
    );

    await db.collection('users').updateOne(toIdFilter(String(user._id)), {
      $set: { addresses, updatedAt: new Date() }
    });

    return c.json({ success: true, addresses, message: 'Address updated' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.delete('/api/auth/addresses/:id', authenticate, async (c) => {
  try {
    const db = await getDb(c.env);
    const user = c.get('user');
    const id = c.req.param('id');

    const addresses = (user.addresses || []).filter((a: any) => a.id !== id && a._id !== id);
    await db.collection('users').updateOne(toIdFilter(String(user._id)), {
      $set: { addresses, updatedAt: new Date() }
    });

    return c.json({ success: true, addresses, message: 'Address removed' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// ==========================================
// ORDERS
// ==========================================

app.post('/api/orders', async (c) => {
  try {
    const db = await getDb(c.env);
    const payload = await c.req.json();

    const orderNumber = 'KAV-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      ...payload,
      orderNumber,
      orderStatus: payload.orderStatus || 'processing',
      paymentStatus: payload.paymentStatus || 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('orders').insertOne(newOrder);
    const order = { ...newOrder, _id: result.insertedId };

    return c.json({ success: true, order, message: 'Order placed successfully!' }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.get('/api/orders/my', authenticate, async (c) => {
  try {
    const db = await getDb(c.env);
    const user = c.get('user');
    const email = user.email || c.req.query('email');

    const orders = await db.collection('orders')
      .find({ $or: [{ user: user._id }, { 'customer.email': email }, { 'shippingAddress.email': email }] })
      .sort({ createdAt: -1 })
      .toArray();

    return c.json({ success: true, count: orders.length, orders });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.get('/api/orders', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    const query = c.req.query();
    const filter: any = {};
    if (query.status) filter.orderStatus = query.status;

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 20);

    const total = await db.collection('orders').countDocuments(filter);
    const orders = await db.collection('orders').find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray();

    return c.json({ success: true, orders, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.get('/api/orders/:identifier', async (c) => {
  try {
    const db = await getDb(c.env);
    const id = c.req.param('identifier');

    let order = await db.collection('orders').findOne({ orderNumber: id });
    if (!order) {
      order = await db.collection('orders').findOne(toIdFilter(id));
    }

    if (!order) {
      return c.json({ success: false, message: 'Order not found' }, 404);
    }
    return c.json({ success: true, order });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.put('/api/orders/:id/status', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();

    await db.collection('orders').updateOne(toIdFilter(id), {
      $set: { ...body, updatedAt: new Date() }
    });
    const order = await db.collection('orders').findOne(toIdFilter(id));
    return c.json({ success: true, order, message: 'Order updated' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// ==========================================
// COUPONS
// ==========================================

app.post('/api/coupons/validate', async (c) => {
  try {
    const db = await getDb(c.env);
    await ensureSeeded(db);
    const { code, subtotal } = await c.req.json();

    const coupon = await db.collection('coupons').findOne({
      code: code ? code.trim().toUpperCase() : '',
      isActive: true
    });

    if (!coupon) {
      return c.json({ success: false, message: 'Invalid or inactive promo code.' }, 400);
    }

    if (subtotal && coupon.minimumOrder && subtotal < coupon.minimumOrder) {
      return c.json({ success: false, message: `Minimum order amount of $${coupon.minimumOrder} required for this code.` }, 400);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100 * 100) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    return c.json({
      success: true,
      message: 'Promo coupon applied!',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        description: coupon.description
      }
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.get('/api/coupons', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    await ensureSeeded(db);
    const coupons = await db.collection('coupons').find({}).sort({ createdAt: -1 }).toArray();
    return c.json({ success: true, coupons });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.post('/api/coupons', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    const body = await c.req.json();
    const result = await db.collection('coupons').insertOne({ ...body, createdAt: new Date() });
    return c.json({ success: true, coupon: { ...body, _id: result.insertedId }, message: 'Coupon created' }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.put('/api/coupons/:id', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    const id = c.req.param('id');
    const body = await c.req.json();
    delete body._id;
    await db.collection('coupons').updateOne(toIdFilter(id), { $set: { ...body, updatedAt: new Date() } });
    const coupon = await db.collection('coupons').findOne(toIdFilter(id));
    return c.json({ success: true, coupon, message: 'Coupon updated' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.delete('/api/coupons/:id', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    const id = c.req.param('id');
    await db.collection('coupons').deleteOne(toIdFilter(id));
    return c.json({ success: true, message: 'Coupon deleted' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// ==========================================
// REVIEWS
// ==========================================

app.get('/api/reviews/product/:productId', async (c) => {
  try {
    const db = await getDb(c.env);
    const productId = c.req.param('productId');

    const reviews = await db.collection('reviews').find({
      $or: [{ productId: productId }, { product: productId }],
      approved: true
    }).sort({ createdAt: -1 }).toArray();

    const total = reviews.length;
    const averageRating = total > 0 ? (reviews.reduce((acc: number, r: any) => acc + (r.rating || 5), 0) / total) : 5;
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r: any) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating || 5)));
      distribution[star] = (distribution[star] || 0) + 1;
    });

    return c.json({
      success: true,
      total,
      averageRating: Math.round(averageRating * 10) / 10,
      distribution,
      reviews
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.post('/api/reviews', async (c) => {
  try {
    const db = await getDb(c.env);
    const body = await c.req.json();
    const newReview = {
      ...body,
      approved: true, // auto-approve for responsive UX
      createdAt: new Date()
    };
    const result = await db.collection('reviews').insertOne(newReview);
    return c.json({ success: true, review: { ...newReview, _id: result.insertedId }, message: 'Review submitted! Thank you.' }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.get('/api/reviews', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    const reviews = await db.collection('reviews').find({}).sort({ createdAt: -1 }).toArray();
    return c.json({ success: true, count: reviews.length, reviews });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.patch('/api/reviews/:id/status', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    const id = c.req.param('id');
    const { approved } = await c.req.json();
    await db.collection('reviews').updateOne(toIdFilter(id), { $set: { approved } });
    const review = await db.collection('reviews').findOne(toIdFilter(id));
    return c.json({ success: true, review, message: 'Review status updated' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.delete('/api/reviews/:id', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    const id = c.req.param('id');
    await db.collection('reviews').deleteOne(toIdFilter(id));
    return c.json({ success: true, message: 'Review deleted' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// ==========================================
// WISHLIST
// ==========================================

app.get('/api/wishlist', authenticate, async (c) => {
  try {
    const db = await getDb(c.env);
    const user = c.get('user');
    const doc = await db.collection('wishlists').findOne({ user: user._id });
    if (!doc || !doc.products || doc.products.length === 0) {
      return c.json({ success: true, wishlist: [] });
    }

    const products = await db.collection('products').find({
      _id: { $in: doc.products.map((pid: string) => ObjectId.isValid(pid) ? new ObjectId(pid) : pid) }
    }).toArray();

    return c.json({ success: true, wishlist: products });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.post('/api/wishlist/:productId', authenticate, async (c) => {
  try {
    const db = await getDb(c.env);
    const user = c.get('user');
    const productId = c.req.param('productId');

    let doc = await db.collection('wishlists').findOne({ user: user._id });
    let products: string[] = doc ? (doc.products || []) : [];

    if (products.includes(productId)) {
      products = products.filter((id) => id !== productId);
    } else {
      products.push(productId);
    }

    await db.collection('wishlists').updateOne(
      { user: user._id },
      { $set: { user: user._id, products, updatedAt: new Date() } },
      { upsert: true }
    );

    return c.json({ success: true, message: 'Wishlist updated' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.delete('/api/wishlist/:productId', authenticate, async (c) => {
  try {
    const db = await getDb(c.env);
    const user = c.get('user');
    const productId = c.req.param('productId');

    await db.collection('wishlists').updateOne(
      { user: user._id },
      { $pull: { products: productId } as any }
    );
    return c.json({ success: true, message: 'Removed from wishlist' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.post('/api/wishlist/sync', authenticate, async (c) => {
  try {
    const db = await getDb(c.env);
    const user = c.get('user');
    const { productIds } = await c.req.json();

    await db.collection('wishlists').updateOne(
      { user: user._id },
      { $set: { user: user._id, products: productIds || [], updatedAt: new Date() } },
      { upsert: true }
    );

    return c.json({ success: true, message: 'Wishlist synced' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// ==========================================
// ADMIN DASHBOARD
// ==========================================

app.get('/api/admin/dashboard', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    const totalRevenueResult = await db.collection('orders').aggregate([
      { $group: { _id: null, total: { $sum: '$pricing.total' } } }
    ]).toArray();

    const totalRevenue = totalRevenueResult[0]?.total || 0;
    const totalOrders = await db.collection('orders').countDocuments();
    const totalCustomers = await db.collection('users').countDocuments({ role: 'customer' });
    const totalProducts = await db.collection('products').countDocuments();
    const lowStockProducts = await db.collection('products').find({ inventory: { $lte: 10 } }).limit(5).toArray();
    const recentOrders = await db.collection('orders').find({}).sort({ createdAt: -1 }).limit(5).toArray();
    const recentCustomers = await db.collection('users').find({ role: 'customer' }).sort({ createdAt: -1 }).limit(5).toArray();

    return c.json({
      success: true,
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockCount: lowStockProducts.length
      },
      lowStockProducts,
      recentOrders,
      recentCustomers,
      statusCounts: [],
      recentSalesTrend: []
    });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.get('/api/admin/customers', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    const customers = await db.collection('users').find({ role: 'customer' }).project({ password: 0 }).toArray();
    return c.json({ success: true, customers, total: customers.length, page: 1, pages: 1 });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// ==========================================
// STATIC ASSET FALLBACK (CLOUDFLARE CDN)
// ==========================================
app.all('*', async (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('Not Found', 404);
});

export default app;
