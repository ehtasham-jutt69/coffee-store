import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Product } from '../models/Product';
import { User } from '../models/User';

// @desc    Get Admin Dashboard KPI metrics and charts
// @route   GET /api/admin/dashboard
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments();

    // Sum paid order revenue
    const revenueAgg = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAgg.length > 0 ? Number(revenueAgg[0].totalRevenue.toFixed(2)) : 0;

    // Low stock products
    const lowStockProducts = await Product.find({ inventory: { $lte: 15 } })
      .select('name sku inventory price category images')
      .sort({ inventory: 1 })
      .limit(8);

    // Recent 6 orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('orderNumber customer total orderStatus paymentStatus createdAt items');

    // Recent 5 customers
    const recentCustomers = await User.find({ role: 'customer' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('firstName lastName email phone createdAt');

    // Order status breakdown
    const statusCounts = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ]);

    // Simulated sales trend for visualization (recent days)
    const recentSalesTrend = [
      { day: 'Mon', revenue: 420.50, orders: 8 },
      { day: 'Tue', revenue: 680.00, orders: 12 },
      { day: 'Wed', revenue: 540.25, orders: 9 },
      { day: 'Thu', revenue: 890.75, orders: 15 },
      { day: 'Fri', revenue: 1120.00, orders: 19 },
      { day: 'Sat', revenue: 1450.50, orders: 24 },
      { day: 'Sun', revenue: 980.00, orders: 17 }
    ];

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        lowStockCount: lowStockProducts.length
      },
      lowStockProducts,
      recentOrders,
      recentCustomers,
      statusCounts,
      recentSalesTrend
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get list of customers with order counts and total spent
// @route   GET /api/admin/customers
export const getCustomersAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const query: any = { role: 'customer' };

    if (search) {
      const regex = new RegExp(search as string, 'i');
      query.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }, { phone: regex }];
    }

    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * pageSize;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    // Populate order statistics for each user
    const customersWithStats = await Promise.all(
      users.map(async u => {
        const orders = await Order.find({ 'customer.email': u.email });
        const totalSpent = orders.reduce((sum, o) => sum + (o.paymentStatus === 'Paid' ? o.total : 0), 0);
        return {
          _id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone,
          addresses: u.addresses,
          orderCount: orders.length,
          totalSpent: Number(totalSpent.toFixed(2)),
          createdAt: u.createdAt
        };
      })
    );

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / pageSize),
      customers: customersWithStats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
