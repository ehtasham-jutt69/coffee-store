import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { Coupon } from '../models/Coupon';
import { Wishlist } from '../models/Wishlist';
import {
  seedCategories,
  seedCoupons,
  seedProducts,
  seedCustomers,
  seedAdmin,
  sampleReviewTexts
} from './seedData';

export const runSeed = async (silent = false): Promise<void> => {
  try {
    await connectDB();

    if (!silent) console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Review.deleteMany({}),
      Coupon.deleteMany({}),
      Wishlist.deleteMany({})
    ]);

    if (!silent) console.log('[Seed] Seeding categories...');
    const createdCategories = await Category.insertMany(seedCategories);
    const categoryMap = new Map(createdCategories.map(c => [c.slug, c._id]));

    if (!silent) console.log('[Seed] Seeding products with variants...');
    const productsToInsert = seedProducts.map(p => {
      const isEquipment = p.category === 'equipment';
      const variants = isEquipment
        ? [
            {
              id: `${p.sku}-STD`,
              weight: 'Standard',
              grind: 'Standard',
              price: p.price,
              salePrice: p.salePrice || undefined,
              sku: `${p.sku}-STD`,
              stock: p.inventory
            }
          ]
        : [
            {
              id: `${p.sku}-250G-WB`,
              weight: '250g (8.8oz)',
              grind: 'Whole Bean',
              price: p.price,
              salePrice: p.salePrice || undefined,
              sku: `${p.sku}-250G-WB`,
              stock: Math.floor(p.inventory * 0.4)
            },
            {
              id: `${p.sku}-250G-FLT`,
              weight: '250g (8.8oz)',
              grind: 'Filter / Drip',
              price: p.price,
              salePrice: p.salePrice || undefined,
              sku: `${p.sku}-250G-FLT`,
              stock: Math.floor(p.inventory * 0.3)
            },
            {
              id: `${p.sku}-500G-WB`,
              weight: '500g (1.1lb)',
              grind: 'Whole Bean',
              price: Number((p.price * 1.85).toFixed(2)),
              salePrice: p.salePrice ? Number((p.salePrice * 1.85).toFixed(2)) : undefined,
              sku: `${p.sku}-500G-WB`,
              stock: Math.floor(p.inventory * 0.2)
            },
            {
              id: `${p.sku}-1KG-WB`,
              weight: '1kg (2.2lb)',
              grind: 'Whole Bean',
              price: Number((p.price * 3.4).toFixed(2)),
              salePrice: p.salePrice ? Number((p.salePrice * 3.4).toFixed(2)) : undefined,
              sku: `${p.sku}-1KG-WB`,
              stock: Math.floor(p.inventory * 0.1)
            }
          ];

      return {
        ...p,
        categoryRef: categoryMap.get(p.category),
        variants
      };
    });

    const createdProducts = await Product.insertMany(productsToInsert);

    // Update item counts in categories
    for (const cat of createdCategories) {
      const count = await Product.countDocuments({ category: cat.slug });
      cat.itemCount = count;
      await cat.save();
    }

    if (!silent) console.log('[Seed] Seeding users (Admin + 10 Customers)...');
    // Create admin
    const adminUser = await User.create(seedAdmin);

    // Create customers (User.create will run pre-save password hash hook)
    const createdCustomers = [];
    for (const cust of seedCustomers) {
      const u = await User.create(cust);
      createdCustomers.push(u);
    }

    if (!silent) console.log('[Seed] Seeding coupons...');
    await Coupon.insertMany(seedCoupons);

    if (!silent) console.log('[Seed] Seeding realistic reviews...');
    const createdReviews = [];
    let reviewTextIdx = 0;

    for (const prod of createdProducts) {
      const numReviews = Math.floor(Math.random() * 3) + 1; // 1-3 reviews per product
      for (let i = 0; i < numReviews; i++) {
        const reviewer = createdCustomers[(reviewTextIdx + i) % createdCustomers.length];
        const template = sampleReviewTexts[reviewTextIdx % sampleReviewTexts.length];
        reviewTextIdx++;

        const review = await Review.create({
          product: prod._id,
          user: reviewer._id,
          customerName: `${reviewer.firstName} ${reviewer.lastName.charAt(0)}.`,
          rating: template.rating,
          title: template.title,
          comment: template.comment,
          verifiedPurchase: true,
          approved: true,
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000)
        });
        createdReviews.push(review);
      }
    }

    if (!silent) console.log('[Seed] Seeding 15 realistic orders...');
    const orderStatuses: Array<'Delivered' | 'Shipped' | 'Processing' | 'Confirmed' | 'Pending'> = [
      'Delivered', 'Delivered', 'Delivered', 'Delivered', 'Delivered',
      'Shipped', 'Shipped', 'Shipped',
      'Processing', 'Processing',
      'Confirmed', 'Confirmed',
      'Pending'
    ];

    for (let i = 0; i < 15; i++) {
      const customer = createdCustomers[i % createdCustomers.length];
      const prod1 = createdProducts[i % createdProducts.length];
      const prod2 = createdProducts[(i + 3) % createdProducts.length];

      const var1 = prod1.variants[0];
      const var2 = prod2.variants[0];

      const item1Total = Number((var1.salePrice || var1.price).toFixed(2));
      const item2Total = Number(((var2.salePrice || var2.price) * 2).toFixed(2));
      const subtotal = Number((item1Total + item2Total).toFixed(2));
      const shippingFee = subtotal >= 50 ? 0 : 6.50;
      const tax = Number((subtotal * 0.075).toFixed(2));
      const total = Number((subtotal + shippingFee + tax).toFixed(2));

      const status = orderStatuses[i % orderStatuses.length];
      const daysAgo = (15 - i) * 3;

      await Order.create({
        orderNumber: `KAV-${104000 + i}`,
        user: customer._id,
        customer: {
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone || '+1 (555) 234-8901'
        },
        items: [
          {
            product: prod1._id,
            name: prod1.name,
            image: prod1.images[0],
            variant: {
              weight: var1.weight,
              grind: var1.grind,
              sku: var1.sku
            },
            quantity: 1,
            unitPrice: var1.salePrice || var1.price,
            totalPrice: item1Total
          },
          {
            product: prod2._id,
            name: prod2.name,
            image: prod2.images[0],
            variant: {
              weight: var2.weight,
              grind: var2.grind,
              sku: var2.sku
            },
            quantity: 2,
            unitPrice: var2.salePrice || var2.price,
            totalPrice: item2Total
          }
        ],
        shippingAddress: customer.addresses[0] || {
          fullName: `${customer.firstName} ${customer.lastName}`,
          phone: customer.phone,
          street: '123 Roastery Ave',
          city: 'Seattle',
          state: 'WA',
          postalCode: '98101',
          country: 'United States'
        },
        billingAddress: customer.addresses[0] || {
          fullName: `${customer.firstName} ${customer.lastName}`,
          street: '123 Roastery Ave',
          city: 'Seattle',
          state: 'WA',
          postalCode: '98101',
          country: 'United States'
        },
        shippingMethod: {
          name: subtotal >= 50 ? 'Free Standard Delivery' : 'Standard Delivery',
          price: shippingFee,
          estimatedDays: '3-5 business days'
        },
        subtotal,
        discount: 0,
        shippingFee,
        tax,
        total,
        paymentMethod: i % 2 === 0 ? 'credit_card' : 'test_payment',
        paymentStatus: (status as string) === 'Cancelled' ? 'Failed' : 'Paid',
        orderStatus: status,
        trackingNumber: `TRK-${48920000 + i}`,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
      });
    }

    // Seed Wishlist for demo customer
    const demoCustomer = createdCustomers[0];
    await Wishlist.create({
      user: demoCustomer._id,
      products: [createdProducts[0]._id, createdProducts[2]._id, createdProducts[4]._id]
    });

    if (!silent) {
      console.log('----------------------------------------------------');
      console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
      console.log(`- Categories: ${createdCategories.length}`);
      console.log(`- Products:   ${createdProducts.length}`);
      console.log(`- Customers:  ${createdCustomers.length} (Demo: customer@example.com / Demo123!)`);
      console.log(`- Admin:      1 (admin@example.com / Admin123!)`);
      console.log(`- Coupons:    ${seedCoupons.length}`);
      console.log(`- Reviews:    ${createdReviews.length}`);
      console.log(`- Orders:     15`);
      console.log('----------------------------------------------------');
    }
  } catch (error: any) {
    console.error('❌ Seeding error:', error.message);
    throw error;
  }
};

// Execute if run directly from CLI
if (require.main === module) {
  runSeed().then(() => {
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
