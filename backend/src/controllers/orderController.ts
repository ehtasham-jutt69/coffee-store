import { Request, Response } from 'express';
import { Order, IOrderItem } from '../models/Order';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { AuthRequest } from '../middleware/auth';

// @desc    Create new order
// @route   POST /api/orders
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      customer,
      items,
      shippingAddress,
      billingAddress,
      shippingMethod,
      paymentMethod = 'test_payment',
      couponCode,
      notes
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'Cart items cannot be empty.' });
      return;
    }

    if (!customer?.firstName || !customer?.lastName || !customer?.email || !customer?.phone) {
      res.status(400).json({ success: false, message: 'Customer details are incomplete.' });
      return;
    }

    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.postalCode) {
      res.status(400).json({ success: false, message: 'Shipping address is incomplete.' });
      return;
    }

    // Recalculate and validate items against DB
    let subtotal = 0;
    const validatedItems: IOrderItem[] = [];

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);
      if (!product) {
        res.status(404).json({ success: false, message: `Product not found: ${item.name || item.productId}` });
        return;
      }

      // Check product overall stock
      if (product.inventory < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient inventory for "${product.name}". Only ${product.inventory} available.`
        });
        return;
      }

      // Find variant price if available
      let unitPrice = product.salePrice || product.price;
      if (item.variant?.weight) {
        const matchedVariant = product.variants.find(
          v => v.weight === item.variant.weight && (!item.variant.grind || v.grind === item.variant.grind)
        ) || product.variants.find(v => v.weight === item.variant.weight);

        if (matchedVariant) {
          unitPrice = matchedVariant.salePrice || matchedVariant.price;
          if (matchedVariant.stock < item.quantity) {
            res.status(400).json({
              success: false,
              message: `Insufficient inventory for "${product.name} (${item.variant.weight})".`
            });
            return;
          }
          // Decrease variant stock
          matchedVariant.stock -= item.quantity;
        }
      }

      // Decrease product inventory
      product.inventory -= item.quantity;
      await product.save();

      const itemTotal = Number((unitPrice * item.quantity).toFixed(2));
      subtotal += itemTotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        image: item.image || product.images[0] || '/images/coffee.jpg',
        variant: {
          weight: item.variant?.weight || '250g',
          grind: item.variant?.grind || 'Whole Bean',
          sku: item.variant?.sku || product.sku
        },
        quantity: item.quantity,
        unitPrice,
        totalPrice: itemTotal
      });
    }

    subtotal = Number(subtotal.toFixed(2));

    // Calculate coupon discount
    let discount = 0;
    let validCouponCode = '';

    if (couponCode) {
      const codeUpper = couponCode.trim().toUpperCase();
      const coupon = await Coupon.findOne({
        code: codeUpper,
        isActive: true,
        expirationDate: { $gt: new Date() }
      });

      if (coupon) {
        if (coupon.minimumOrder <= subtotal) {
          if (coupon.discountType === 'percentage') {
            discount = Number(((subtotal * coupon.discountValue) / 100).toFixed(2));
          } else if (coupon.discountType === 'fixed') {
            discount = Math.min(coupon.discountValue, subtotal);
          } else if (coupon.discountType === 'free_shipping') {
            // Handled in shipping fee below
          }
          validCouponCode = coupon.code;
          coupon.usedCount += 1;
          await coupon.save();
        }
      }
    }

    // Shipping calculation: Free over $50 or if FREESHIP coupon
    let shippingFee = subtotal >= 50 ? 0 : 6.50;
    if (validCouponCode === 'FREESHIP') {
      shippingFee = 0;
    }
    if (shippingMethod?.price !== undefined) {
      shippingFee = subtotal >= 50 && shippingMethod.name.includes('Standard') ? 0 : Number(shippingMethod.price);
    }

    // Tax calculation (approx 7.5%)
    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Number((taxableAmount * 0.075).toFixed(2));
    const grandTotal = Number((taxableAmount + shippingFee + tax).toFixed(2));

    // Generate Order Number
    const orderNumber = `KAV-${Math.floor(100000 + Math.random() * 900000)}`;

    const order = await Order.create({
      orderNumber,
      user: req.user?._id,
      customer: {
        firstName: customer.firstName.trim(),
        lastName: customer.lastName.trim(),
        email: customer.email.toLowerCase().trim(),
        phone: customer.phone.trim()
      },
      items: validatedItems,
      shippingAddress: {
        fullName: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone,
        street: shippingAddress.street,
        apartment: shippingAddress.apartment || '',
        city: shippingAddress.city,
        state: shippingAddress.state,
        postalCode: shippingAddress.postalCode,
        country: shippingAddress.country || 'United States'
      },
      billingAddress: billingAddress?.street
        ? {
            fullName: billingAddress.fullName || `${customer.firstName} ${customer.lastName}`,
            street: billingAddress.street,
            apartment: billingAddress.apartment || '',
            city: billingAddress.city,
            state: billingAddress.state,
            postalCode: billingAddress.postalCode,
            country: billingAddress.country || 'United States'
          }
        : {
            fullName: `${customer.firstName} ${customer.lastName}`,
            street: shippingAddress.street,
            apartment: shippingAddress.apartment || '',
            city: shippingAddress.city,
            state: shippingAddress.state,
            postalCode: shippingAddress.postalCode,
            country: shippingAddress.country || 'United States'
          },
      shippingMethod: {
        name: shippingMethod?.name || (subtotal >= 50 ? 'Free Standard Shipping' : 'Standard Delivery'),
        price: shippingFee,
        estimatedDays: shippingMethod?.estimatedDays || '3-5 business days'
      },
      subtotal,
      discount,
      couponCode: validCouponCode || undefined,
      shippingFee,
      tax,
      total: grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
      orderStatus: 'Confirmed',
      trackingNumber: `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      notes: notes || ''
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Thank you for ordering from Kavah & Co.',
      order
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const query: any = {};
    if (req.user) {
      query.$or = [{ user: req.user._id }, { 'customer.email': req.user.email }];
    } else if (req.query.email) {
      query['customer.email'] = (req.query.email as string).toLowerCase().trim();
    } else {
      res.status(400).json({ success: false, message: 'User authentication or email query parameter required.' });
      return;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID or Order Number
// @route   GET /api/orders/:identifier
export const getOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { identifier } = req.params;

    let order = null;
    if (identifier.startsWith('KAV-')) {
      order = await Order.findOne({ orderNumber: identifier });
    } else {
      order = await Order.findById(identifier);
    }

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    // Check authorization: admin, order owner, or guest matching order email
    if (
      req.user &&
      req.user.role !== 'admin' &&
      order.user &&
      order.user.toString() !== req.user._id.toString() &&
      order.customer.email !== req.user.email
    ) {
      res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
      return;
    }

    res.status(200).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
export const getAllOrdersAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, paymentStatus, search, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    if (paymentStatus && paymentStatus !== 'all') {
      query.paymentStatus = paymentStatus;
    }
    if (search) {
      const regex = new RegExp(search as string, 'i');
      query.$or = [
        { orderNumber: regex },
        { 'customer.firstName': regex },
        { 'customer.lastName': regex },
        { 'customer.email': regex }
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * pageSize;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / pageSize),
      orders
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
export const updateOrderStatusAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderStatus, paymentStatus, trackingNumber } = req.body;

    const updateFields: any = {};
    if (orderStatus) updateFields.orderStatus = orderStatus;
    if (paymentStatus) updateFields.paymentStatus = paymentStatus;
    if (trackingNumber !== undefined) updateFields.trackingNumber = trackingNumber;

    const order = await Order.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Order status updated to ${order.orderStatus}.`,
      order
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
