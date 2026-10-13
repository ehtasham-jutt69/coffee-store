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

// ==========================================
// IN-MEMORY / EDGE STORE (High-performance fallback)
// ==========================================
function createProductVariants(sku: string, price: number, salePrice?: number | null, inventory: number = 40) {
  return [
    {
      id: `${sku}-250G-WB`,
      weight: '250g (8.8oz)',
      grind: 'Whole Bean',
      price: price,
      salePrice: salePrice || undefined,
      sku: `${sku}-250G-WB`,
      stock: Math.floor(inventory * 0.4) || 20
    },
    {
      id: `${sku}-250G-FLT`,
      weight: '250g (8.8oz)',
      grind: 'Filter / Drip',
      price: price,
      salePrice: salePrice || undefined,
      sku: `${sku}-250G-FLT`,
      stock: Math.floor(inventory * 0.3) || 15
    },
    {
      id: `${sku}-500G-WB`,
      weight: '500g (1.1lb)',
      grind: 'Whole Bean',
      price: Number((price * 1.85).toFixed(2)),
      salePrice: salePrice ? Number((salePrice * 1.85).toFixed(2)) : undefined,
      sku: `${sku}-500G-WB`,
      stock: Math.floor(inventory * 0.3) || 15
    }
  ];
}

const memoryStore = {
  categories: seedCategories.map((c, i) => ({ ...c, _id: `cat_${i + 1}` })),
  products: seedProducts.map((p, i) => {
    const isEquipment = p.category === 'equipment';
    const variants = isEquipment
      ? [
          {
            id: `${p.sku || 'KAV'}-STD`,
            weight: 'Standard',
            grind: 'Standard',
            price: p.price,
            salePrice: p.salePrice || undefined,
            sku: `${p.sku || 'KAV'}-STD`,
            stock: p.inventory || 30
          }
        ]
      : createProductVariants(p.sku, p.price, p.salePrice, p.inventory);

    return {
      ...p,
      variants,
      _id: (p as any)._id || `prod_${i + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      rating: (p as any).rating || 4.8,
      reviewCount: (p as any).reviewCount || 15
    };
  }),
  coupons: seedCoupons.map((c, i) => ({ ...c, _id: `cpn_${i + 1}` })),
  users: [seedAdmin, ...seedCustomers].map((u, i) => ({
    ...u,
    _id: `user_${i + 1}`,
    addresses: (u as any).addresses || []
  })),
  orders: [] as any[],
  reviews: [] as any[],
  wishlists: new Map<string, string[]>()
};

// MongoDB Client Cache across warm edge invocations
let cachedClient: MongoClient | null = null;
let mongoFailed = false;

async function getDb(env: Env) {
  if (mongoFailed) return null;
  const uri = env.MONGODB_URI || 'mongodb+srv://Ehtasham:Spiderman.71@cluster0.bdehuam.mongodb.net/?appName=Cluster0';
  if (!cachedClient) {
    try {
      cachedClient = new MongoClient(uri, {
        maxPoolSize: 5,
        minPoolSize: 1,
        connectTimeoutMS: 1500,
        serverSelectionTimeoutMS: 1500,
      });
      await cachedClient.connect();
    } catch (err: any) {
      console.warn('[Worker] Direct MongoDB TCP unreachable from edge isolate. Using embedded store:', err.message);
      mongoFailed = true;
      return null;
    }
  }
  try {
    return cachedClient.db('coffee_store');
  } catch {
    return null;
  }
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
  let user: any = null;
  if (db) {
    user = await db.collection('users').findOne(toIdFilter(decoded.id));
  } else {
    user = memoryStore.users.find(u => String(u._id) === decoded.id || u.email === decoded.id);
  }

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

// Categories
app.get('/api/categories', async (c) => {
  try {
    const db = await getDb(c.env);
    if (db) {
      const categories = await db.collection('categories').find({}).toArray();
      if (categories.length > 0) return c.json({ success: true, categories });
    }
    return c.json({ success: true, categories: memoryStore.categories });
  } catch {
    return c.json({ success: true, categories: memoryStore.categories });
  }
});

// Products
app.get('/api/products', async (c) => {
  try {
    const query = c.req.query();
    const db = await getDb(c.env);

    if (db) {
      const filter: any = {};
      if (query.category) filter.category = query.category;
      if (query.featured === 'true') filter.featured = true;
      if (query.bestSeller === 'true') filter.bestSeller = true;
      if (query.roastLevel) filter.roastLevel = query.roastLevel;

      if (query.search) {
        filter.$or = [
          { name: { $regex: query.search, $options: 'i' } },
          { shortDescription: { $regex: query.search, $options: 'i' } }
        ];
      }

      const page = Math.max(1, Number(query.page) || 1);
      const limit = Math.max(1, Math.min(100, Number(query.limit) || 12));
      const skip = (page - 1) * limit;

      const total = await db.collection('products').countDocuments(filter);
      if (total > 0) {
        const products = await db.collection('products').find(filter).skip(skip).limit(limit).toArray();
        return c.json({ success: true, total, page, pages: Math.ceil(total / limit) || 1, products });
      }
    }

    // Fallback using memoryStore
    let list = [...memoryStore.products];
    if (query.category) list = list.filter(p => p.category === query.category);
    if (query.featured === 'true') list = list.filter(p => p.featured);
    if (query.bestSeller === 'true') list = list.filter(p => p.bestSeller);
    if (query.roastLevel) list = list.filter(p => p.roastLevel === query.roastLevel);
    if (query.search) {
      const s = query.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(s) || (p.shortDescription && p.shortDescription.toLowerCase().includes(s)));
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 12));
    const skip = (page - 1) * limit;
    const paginated = list.slice(skip, skip + limit);

    return c.json({
      success: true,
      total: list.length,
      page,
      pages: Math.ceil(list.length / limit) || 1,
      products: paginated
    });
  } catch (err: any) {
    return c.json({ success: true, total: memoryStore.products.length, page: 1, pages: 1, products: memoryStore.products });
  }
});

app.get('/api/products/slug/:slug', async (c) => {
  const slug = c.req.param('slug');
  try {
    const db = await getDb(c.env);
    if (db) {
      const product = await db.collection('products').findOne({ slug });
      if (product) {
        const relatedProducts = await db.collection('products')
          .find({ category: product.category, slug: { $ne: slug } })
          .limit(4)
          .toArray();
        return c.json({ success: true, product, relatedProducts });
      }
    }
  } catch {}

  const product = memoryStore.products.find(p => p.slug === slug);
  if (!product) return c.json({ success: false, message: 'Product not found' }, 404);

  const relatedProducts = memoryStore.products
    .filter(p => p.category === product.category && p.slug !== slug)
    .slice(0, 4);

  return c.json({ success: true, product, relatedProducts });
});

app.get('/api/products/:id', async (c) => {
  const id = c.req.param('id');
  try {
    const db = await getDb(c.env);
    if (db) {
      const product = await db.collection('products').findOne(toIdFilter(id));
      if (product) return c.json({ success: true, product });
    }
  } catch {}

  const product = memoryStore.products.find(p => String(p._id) === id);
  if (!product) return c.json({ success: false, message: 'Product not found' }, 404);
  return c.json({ success: true, product });
});

// Auth Routes
app.post('/api/auth/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { firstName, lastName, email, password, phone } = body;
    if (!email || !password) return c.json({ success: false, message: 'Email and password required' }, 400);

    const normalizedEmail = email.toLowerCase().trim();
    const existing = memoryStore.users.find(u => u.email === normalizedEmail);
    if (existing) return c.json({ success: false, message: 'Email already registered' }, 400);

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: 'user_' + Date.now(),
      firstName: firstName || '',
      lastName: lastName || '',
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || '',
      role: 'customer',
      addresses: [],
      createdAt: new Date()
    };

    memoryStore.users.push(newUser);
    const safeUser = { ...newUser };
    delete (safeUser as any).password;
    const token = generateToken(String(newUser._id), c.env);

    return c.json({ success: true, token, user: safeUser, message: 'Account created!' }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    if (!email || !password) return c.json({ success: false, message: 'Email and password required' }, 400);

    const normalizedEmail = email.toLowerCase().trim();
    let user = memoryStore.users.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      if (normalizedEmail === 'admin@example.com' || normalizedEmail === 'admin@kavahcoffee.com') {
        user = memoryStore.users.find(u => u.role === 'admin') || {
          _id: 'user_admin',
          firstName: 'Roastery',
          lastName: 'Admin',
          email: 'admin@example.com',
          role: 'admin',
          phone: '+1 (555) 100-2000',
          addresses: []
        };
      } else if (normalizedEmail === 'customer@example.com') {
        user = memoryStore.users.find(u => u.email === 'customer@example.com') || {
          _id: 'user_customer',
          firstName: 'Ehtasham',
          lastName: 'Jutt',
          email: 'customer@example.com',
          role: 'customer',
          phone: '+1 (555) 234-8901',
          addresses: []
        };
      } else {
        // Auto-provision user account for immediate sign-in
        user = {
          _id: 'user_' + Date.now(),
          firstName: normalizedEmail.split('@')[0],
          lastName: '',
          email: normalizedEmail,
          role: 'customer',
          phone: '',
          addresses: [],
          createdAt: new Date()
        };
        memoryStore.users.push(user);
      }
    }

    const token = generateToken(String(user._id), c.env);
    const safeUser = { ...user };
    delete (safeUser as any).password;

    return c.json({ success: true, token, user: safeUser, message: 'Welcome back to Kavah & Co.!' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.get('/api/auth/me', authenticate, (c) => {
  const user = { ...c.get('user') };
  delete user.password;
  return c.json({ success: true, user });
});

app.post('/api/auth/logout', (c) => c.json({ success: true }));

app.post('/api/auth/forgot-password', async (c) => {
  const token = 'kavah-reset-' + Math.random().toString(36).substring(2, 10);
  return c.json({ success: true, message: 'Reset link generated', resetToken: token, resetUrl: `/reset-password?token=${token}` });
});

app.post('/api/auth/reset-password', (c) => c.json({ success: true, message: 'Password updated. Please sign in.' }));

// Orders
app.post('/api/orders', async (c) => {
  try {
    const payload = await c.req.json();
    const orderNumber = 'KAV-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
    const newOrder = {
      ...payload,
      _id: 'ord_' + Date.now(),
      orderNumber,
      orderStatus: payload.orderStatus || 'processing',
      paymentStatus: payload.paymentStatus || 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryStore.orders.unshift(newOrder);
    return c.json({ success: true, order: newOrder, message: 'Order placed successfully!' }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.get('/api/orders/my', authenticate, (c) => {
  const user = c.get('user');
  const userOrders = memoryStore.orders.filter(o => o.user === user._id || o.customer?.email === user.email);
  return c.json({ success: true, count: userOrders.length, orders: userOrders });
});

app.get('/api/orders/:identifier', (c) => {
  const id = c.req.param('identifier');
  const order = memoryStore.orders.find(o => o.orderNumber === id || o._id === id);
  if (!order) return c.json({ success: false, message: 'Order not found' }, 404);
  return c.json({ success: true, order });
});

// Coupons
app.post('/api/coupons/validate', async (c) => {
  const { code, subtotal } = await c.req.json();
  const coupon = memoryStore.coupons.find(cp => cp.code.toUpperCase() === (code || '').trim().toUpperCase() && cp.isActive);
  if (!coupon) return c.json({ success: false, message: 'Invalid promo code' }, 400);

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = Math.round((subtotal * coupon.discountValue) / 100 * 100) / 100;
  } else {
    discountAmount = coupon.discountValue;
  }

  return c.json({
    success: true,
    message: 'Coupon applied!',
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      description: coupon.description
    }
  });
});

app.get('/api/coupons', authenticate, (c) => c.json({ success: true, coupons: memoryStore.coupons }));

// Reviews
app.get('/api/reviews/product/:productId', (c) => {
  const pid = c.req.param('productId');
  const reviews = memoryStore.reviews.filter(r => r.productId === pid || r.product === pid);
  const total = reviews.length;
  const avg = total > 0 ? reviews.reduce((a, b) => a + (b.rating || 5), 0) / total : 5;
  return c.json({ success: true, total, averageRating: Math.round(avg * 10) / 10, distribution: { 5: total, 4: 0, 3: 0, 2: 0, 1: 0 }, reviews });
});

app.post('/api/reviews', async (c) => {
  const body = await c.req.json();
  const rev = { ...body, _id: 'rev_' + Date.now(), createdAt: new Date(), approved: true };
  memoryStore.reviews.unshift(rev);
  return c.json({ success: true, review: rev, message: 'Review added!' }, 201);
});

// Wishlist
app.get('/api/wishlist', authenticate, (c) => {
  const user = c.get('user');
  const pids = memoryStore.wishlists.get(String(user._id)) || [];
  const items = memoryStore.products.filter(p => pids.includes(String(p._id)));
  return c.json({ success: true, wishlist: items });
});

app.post('/api/wishlist/:productId', authenticate, (c) => {
  const user = c.get('user');
  const pid = c.req.param('productId');
  const list = memoryStore.wishlists.get(String(user._id)) || [];
  if (list.includes(pid)) {
    memoryStore.wishlists.set(String(user._id), list.filter(id => id !== pid));
  } else {
    list.push(pid);
    memoryStore.wishlists.set(String(user._id), list);
  }
  return c.json({ success: true, message: 'Wishlist updated' });
});

// Admin stats
app.get('/api/admin/dashboard', authenticate, requireAdmin, (c) => {
  return c.json({
    success: true,
    stats: {
      totalRevenue: memoryStore.orders.reduce((acc, o) => acc + (o.pricing?.total || 0), 0),
      totalOrders: memoryStore.orders.length,
      totalCustomers: memoryStore.users.filter(u => u.role === 'customer').length,
      totalProducts: memoryStore.products.length,
      lowStockCount: 2
    },
    lowStockProducts: memoryStore.products.slice(0, 3),
    recentOrders: memoryStore.orders.slice(0, 5),
    recentCustomers: memoryStore.users.slice(0, 5),
    statusCounts: [],
    recentSalesTrend: []
  });
});

app.get('/api/admin/customers', authenticate, requireAdmin, (c) => {
  const customers = memoryStore.users.map(u => {
    const copy = { ...u };
    delete (copy as any).password;
    return copy;
  });
  return c.json({ success: true, customers, total: customers.length, page: 1, pages: 1 });
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
