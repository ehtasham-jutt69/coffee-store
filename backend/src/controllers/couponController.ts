import { Request, Response } from 'express';
import { Coupon } from '../models/Coupon';

// @desc    Validate coupon code
// @route   POST /api/coupons/validate
export const validateCoupon = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, subtotal = 0 } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: 'Please provide a coupon code.' });
      return;
    }

    const coupon = await Coupon.findOne({
      code: code.trim().toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      res.status(404).json({ success: false, message: 'Invalid or inactive promotional code.' });
      return;
    }

    if (new Date() > new Date(coupon.expirationDate)) {
      res.status(400).json({ success: false, message: 'This coupon has expired.' });
      return;
    }

    if (coupon.usedCount >= coupon.maxUses) {
      res.status(400).json({ success: false, message: 'This coupon has reached its maximum redemptions.' });
      return;
    }

    if (coupon.minimumOrder > Number(subtotal)) {
      res.status(400).json({
        success: false,
        message: `Order minimum of $${coupon.minimumOrder.toFixed(2)} required for this code.`
      });
      return;
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Number(((Number(subtotal) * coupon.discountValue) / 100).toFixed(2));
    } else if (coupon.discountType === 'fixed') {
      discountAmount = Math.min(coupon.discountValue, Number(subtotal));
    } else if (coupon.discountType === 'free_shipping') {
      discountAmount = 6.50; // Standard shipping waived
    }

    res.status(200).json({
      success: true,
      message: `Coupon "${coupon.code}" applied successfully!`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        description: coupon.description
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all coupons (Admin)
// @route   GET /api/coupons
export const getCouponsAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new coupon (Admin)
// @route   POST /api/coupons
export const createCouponAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, discountType, discountValue, minimumOrder, expirationDate, maxUses, description, isActive } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      res.status(400).json({ success: false, message: 'Code, discount type, and discount value are required.' });
      return;
    }

    const existing = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (existing) {
      res.status(400).json({ success: false, message: 'A coupon with this code already exists.' });
      return;
    }

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minimumOrder: Number(minimumOrder || 0),
      expirationDate: expirationDate ? new Date(expirationDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      maxUses: Number(maxUses || 500),
      description: description || '',
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    res.status(201).json({ success: true, message: 'Coupon created successfully.', coupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update coupon (Admin)
// @route   PUT /api/coupons/:id
export const updateCouponAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.body.code) {
      req.body.code = req.body.code.trim().toUpperCase();
    }
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Coupon updated.', coupon });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete coupon (Admin)
// @route   DELETE /api/coupons/:id
export const deleteCouponAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      res.status(404).json({ success: false, message: 'Coupon not found.' });
      return;
    }
    res.status(200).json({ success: true, message: 'Coupon deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
