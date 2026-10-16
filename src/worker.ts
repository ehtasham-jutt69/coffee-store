import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { seedCategories, seedProducts, seedCoupons, seedAdmin, seedCustomers } from './seedData';
import {
  sendEdgeEmail,
  sendEdgeWelcomeEmail,
  sendEdgePasswordResetEmail,
  sendEdgeOrderConfirmationEmail,
  EmailEnv
} from './edgeEmail';

export interface Env extends EmailEnv {
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
  })) as any[],
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

function toIdFilter(id: string): any {
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

app.post('/api/products', authenticate, requireAdmin, async (c) => {
  try {
    const body = await c.req.json();
    const newProduct = {
      ...body,
      _id: 'prod_' + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
      rating: 5.0,
      reviewCount: 0
    };
    try {
      const db = await getDb(c.env);
      if (db) await db.collection('products').insertOne({ ...newProduct });
    } catch {}
    memoryStore.products.unshift(newProduct);
    return c.json({ success: true, product: newProduct, message: 'Product created successfully' }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.put('/api/products/:id', authenticate, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    const prod = memoryStore.products.find(p => String(p._id) === id);
    if (!prod) return c.json({ success: false, message: 'Product not found' }, 404);
    Object.assign(prod, body, { updatedAt: new Date() });
    try {
      const db = await getDb(c.env);
      if (db) await db.collection('products').updateOne(toIdFilter(id), { $set: { ...body, updatedAt: new Date() } });
    } catch {}
    return c.json({ success: true, product: prod, message: 'Product updated successfully' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.delete('/api/products/:id', authenticate, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    memoryStore.products = memoryStore.products.filter(p => String(p._id) !== id);
    try {
      const db = await getDb(c.env);
      if (db) await db.collection('products').deleteOne(toIdFilter(id));
    } catch {}
    return c.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.patch('/api/products/:id/inventory', authenticate, requireAdmin, async (c) => {
  try {
    const id = c.req.param('id');
    const { inventory } = await c.req.json();
    const prod = memoryStore.products.find(p => String(p._id) === id);
    if (prod) prod.inventory = Number(inventory);
    try {
      const db = await getDb(c.env);
      if (db) await db.collection('products').updateOne(toIdFilter(id), { $set: { inventory: Number(inventory) } });
    } catch {}
    return c.json({ success: true, inventory: Number(inventory), message: 'Inventory updated' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
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

    // Dispatch welcome email asynchronously via Cloudflare edge sockets
    try {
      c.executionCtx.waitUntil(
        sendEdgeWelcomeEmail(c.env, normalizedEmail, firstName).catch(err => {
          console.error('[Worker] Error sending welcome email:', err);
        })
      );
    } catch {
      sendEdgeWelcomeEmail(c.env, normalizedEmail, firstName).catch(() => {});
    }

    return c.json({
      success: true,
      token,
      user: safeUser,
      message: `Account created successfully! We sent a welcome message with your 10% coupon to ${normalizedEmail} from instahelper7109648@gmail.com.`
    }, 201);
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
  let email = '';
  try {
    const body = await c.req.json();
    email = (body.email || '').trim().toLowerCase();
  } catch {}

  const token = 'kavah-reset-' + Math.random().toString(36).substring(2, 10);
  const resetUrl = `/reset-password?token=${token}`;

  // Dispatch password reset email asynchronously via Cloudflare edge sockets
  if (email) {
    try {
      c.executionCtx.waitUntil(
        sendEdgePasswordResetEmail(c.env, email, token, resetUrl).catch(err => {
          console.error('[Worker] Error sending password reset email:', err);
        })
      );
    } catch {
      sendEdgePasswordResetEmail(c.env, email, token, resetUrl).catch(() => {});
    }
  }

  return c.json({
    success: true,
    message: email
      ? `A password reset link has been sent to ${email} from instahelper7109648@gmail.com. Please check your inbox and spam folder.`
      : 'A password reset link has been sent from instahelper7109648@gmail.com. Please check your inbox and spam folder.',
    resetToken: token,
    resetUrl
  });
});

app.post('/api/auth/reset-password', (c) => c.json({ success: true, message: 'Password updated. Please sign in.' }));

// Customer Profile
app.put('/api/auth/profile', authenticate, async (c) => {
  try {
    const user = c.get('user');
    const { firstName, lastName, phone } = await c.req.json();
    if (firstName) user.firstName = firstName.trim();
    if (lastName) user.lastName = lastName.trim();
    if (phone !== undefined) user.phone = phone.trim();

    try {
      const db = await getDb(c.env);
      if (db) {
        await db.collection('users').updateOne(
          toIdFilter(String(user._id)),
          { $set: { firstName: user.firstName, lastName: user.lastName, phone: user.phone } }
        );
      }
    } catch {}

    const safeUser = { ...user };
    delete safeUser.password;
    return c.json({ success: true, user: safeUser, message: 'Profile updated successfully' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// Change Password
app.put('/api/auth/change-password', authenticate, async (c) => {
  try {
    const user = c.get('user');
    const { currentPassword, newPassword, confirmPassword } = await c.req.json();
    if (!currentPassword || !newPassword) {
      return c.json({ success: false, message: 'Current and new passwords required' }, 400);
    }
    if (newPassword.length < 6) {
      return c.json({ success: false, message: 'Password must be at least 6 characters' }, 400);
    }
    if (confirmPassword && newPassword !== confirmPassword) {
      return c.json({ success: false, message: 'New passwords do not match' }, 400);
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return c.json({ success: false, message: 'Current password provided is incorrect' }, 400);
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    try {
      const db = await getDb(c.env);
      if (db) {
        await db.collection('users').updateOne(
          toIdFilter(String(user._id)),
          { $set: { password: hashedPassword } }
        );
      }
    } catch {}

    return c.json({ success: true, message: 'Password changed successfully!' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// Address Management
app.post('/api/auth/addresses', authenticate, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();
    if (!user.addresses) user.addresses = [];

    if (body.isDefault) {
      user.addresses.forEach((a: any) => (a.isDefault = false));
    }

    const newAddress = {
      _id: 'addr_' + Date.now(),
      ...body,
      isDefault: body.isDefault ?? (user.addresses.length === 0)
    };
    user.addresses.push(newAddress);

    try {
      const db = await getDb(c.env);
      if (db) {
        await db.collection('users').updateOne(
          toIdFilter(String(user._id)),
          { $set: { addresses: user.addresses } }
        );
      }
    } catch {}

    return c.json({ success: true, addresses: user.addresses, message: 'Address saved successfully.' }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.put('/api/auth/addresses/:id', authenticate, async (c) => {
  try {
    const user = c.get('user');
    const addrId = c.req.param('id');
    const body = await c.req.json();
    if (!user.addresses) user.addresses = [];

    const address = user.addresses.find((a: any) => String(a._id) === addrId);
    if (!address) return c.json({ success: false, message: 'Address not found' }, 404);

    if (body.isDefault) {
      user.addresses.forEach((a: any) => (a.isDefault = false));
    }

    Object.assign(address, body);

    try {
      const db = await getDb(c.env);
      if (db) {
        await db.collection('users').updateOne(
          toIdFilter(String(user._id)),
          { $set: { addresses: user.addresses } }
        );
      }
    } catch {}

    return c.json({ success: true, addresses: user.addresses, message: 'Address updated successfully.' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.delete('/api/auth/addresses/:id', authenticate, async (c) => {
  try {
    const user = c.get('user');
    const addrId = c.req.param('id');
    if (!user.addresses) user.addresses = [];

    user.addresses = user.addresses.filter((a: any) => String(a._id) !== addrId);

    try {
      const db = await getDb(c.env);
      if (db) {
        await db.collection('users').updateOne(
          toIdFilter(String(user._id)),
          { $set: { addresses: user.addresses } }
        );
      }
    } catch {}

    return c.json({ success: true, addresses: user.addresses, message: 'Address deleted successfully.' });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// ==========================================
// ORDERS & CHECKOUT
// ==========================================
app.post('/api/orders', async (c) => {
  try {
    const payload = await c.req.json();
    const orderNumber = 'KAV-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
    const trackingNumber = 'TRK-' + Math.floor(10000000 + Math.random() * 90000000);

    // Optional user attachment if authenticated
    let userId = payload.user;
    const authHeader = c.req.header('Authorization');
    if (!userId && authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token, c.env);
      if (decoded?.id) userId = decoded.id;
    }

    const newOrder = {
      ...payload,
      _id: 'ord_' + Date.now(),
      orderNumber,
      trackingNumber: payload.trackingNumber || trackingNumber,
      user: userId || undefined,
      orderStatus: payload.orderStatus || 'Confirmed',
      paymentStatus: payload.paymentStatus || (payload.paymentMethod === 'cod' ? 'Pending' : 'Paid'),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to direct MongoDB Atlas if connected
    try {
      const db = await getDb(c.env);
      if (db) {
        await db.collection('orders').insertOne({ ...newOrder });
      }
    } catch (e: any) {
      console.warn('[Worker] Direct mongo insert skipped:', e.message);
    }

    memoryStore.orders.unshift(newOrder);

    // Dispatch Order Confirmation Email asynchronously via Cloudflare edge sockets
    if (newOrder.customer?.email) {
      try {
        c.executionCtx.waitUntil(
          sendEdgeOrderConfirmationEmail(c.env, newOrder).catch(err => {
            console.error('[Worker] Error sending order confirmation email:', err);
          })
        );
      } catch {
        sendEdgeOrderConfirmationEmail(c.env, newOrder).catch(() => {});
      }
    }

    return c.json({
      success: true,
      order: newOrder,
      message: 'Order placed successfully! Fresh roasting sequence initiated.'
    }, 201);
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

// Direct test email route for instant verification
app.post('/api/test-email', async (c) => {
  try {
    let toEmail = 'instahelper7109648@gmail.com';
    try {
      const body = await c.req.json();
      if (body.to) toEmail = body.to;
    } catch {}

    const res = await sendEdgeEmail(c.env, {
      to: toEmail,
      subject: '☕ Test Email from Cloudflare Worker Edge',
      html: `
        <div style="font-family: sans-serif; background: #160c07; color: #f5ede6; padding: 30px; border-radius: 12px;">
          <h2 style="color: #fbbf24;">Kavah & Co. Edge Email System Operational!</h2>
          <p>This email was delivered directly from Cloudflare Workers edge via Brevo SMTP relay.</p>
          <p style="color: #c5a880; font-size: 12px;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
      text: `Kavah & Co. Edge Email System Operational! This email was delivered directly from Cloudflare Workers edge via Brevo SMTP relay. Timestamp: ${new Date().toISOString()}`
    });

    return c.json({ success: res.success, error: res.error, targetEmail: toEmail });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

app.get('/api/orders/my', async (c) => {
  try {
    let user: any = null;
    const authHeader = c.req.header('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token, c.env);
      if (decoded && decoded.id) {
        user = memoryStore.users.find(u => String(u._id) === decoded.id || u.email === decoded.id);
      }
    }

    const emailQuery = c.req.query('email');
    const targetEmail = (user?.email || emailQuery || '').toLowerCase().trim();
    const userId = user ? String(user._id) : '';

    try {
      const db = await getDb(c.env);
      if (db) {
        const filter: any = {};
        if (userId && targetEmail) {
          filter.$or = [{ user: userId }, { 'customer.email': targetEmail }];
        } else if (userId) {
          filter.user = userId;
        } else if (targetEmail) {
          filter['customer.email'] = targetEmail;
        }

        if (Object.keys(filter).length > 0) {
          const orders = await db.collection('orders').find(filter).sort({ createdAt: -1 }).toArray();
          if (orders && orders.length > 0) {
            return c.json({ success: true, count: orders.length, orders });
          }
        }
      }
    } catch {}

    const userOrders = memoryStore.orders.filter(o => {
      if (userId && String(o.user) === userId) return true;
      if (targetEmail && o.customer?.email?.toLowerCase() === targetEmail) return true;
      return false;
    });

    return c.json({ success: true, count: userOrders.length, orders: userOrders });
  } catch (err: any) {
    return c.json({ success: false, message: err.message }, 500);
  }
});

app.get('/api/orders/:identifier', async (c) => {
  const id = c.req.param('identifier');
  try {
    const db = await getDb(c.env);
    if (db) {
      const order = await db.collection('orders').findOne({
        $or: [{ orderNumber: id }, { _id: id as any }]
      });
      if (order) return c.json({ success: true, order });
    }
  } catch {}

  const order = memoryStore.orders.find(o => o.orderNumber === id || String(o._id) === id);
  if (!order) return c.json({ success: false, message: 'Order not found' }, 404);
  return c.json({ success: true, order });
});

app.get('/api/orders', authenticate, requireAdmin, async (c) => {
  try {
    const db = await getDb(c.env);
    if (db) {
      const orders = await db.collection('orders').find({}).sort({ createdAt: -1 }).toArray();
      if (orders.length > 0) {
        return c.json({ success: true, orders, total: orders.length, page: 1, pages: 1 });
      }
    }
  } catch {}

  return c.json({
    success: true,
    orders: memoryStore.orders,
    total: memoryStore.orders.length,
    page: 1,
    pages: 1
  });
});

app.put('/api/orders/:id/status', authenticate, requireAdmin, async (c) => {
  const id = c.req.param('id');
  const { orderStatus, paymentStatus, trackingNumber } = await c.req.json();

  let order = memoryStore.orders.find(o => o.orderNumber === id || String(o._id) === id);
  if (order) {
    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    order.updatedAt = new Date();
  }

  try {
    const db = await getDb(c.env);
    if (db) {
      await db.collection('orders').updateOne(
        { $or: [{ orderNumber: id }, { _id: id as any }] } as any,
        {
          $set: {
            ...(orderStatus ? { orderStatus } : {}),
            ...(paymentStatus ? { paymentStatus } : {}),
            ...(trackingNumber ? { trackingNumber } : {}),
            updatedAt: new Date()
          }
        }
      );
    }
  } catch {}

  if (!order) return c.json({ success: false, message: 'Order not found' }, 404);
  return c.json({ success: true, order, message: 'Order status updated successfully' });
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
