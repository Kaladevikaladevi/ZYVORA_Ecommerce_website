import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

// @desc    Dashboard summary: KPI cards + charts + recent orders
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalOrders,
    salesAgg,
    recentOrders,
    monthly,
    statusBreakdown,
    lowStock,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Product.countDocuments(),
    Order.countDocuments(),
    // Total revenue from non-cancelled orders
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(8),
    // Monthly revenue + order count for the last 12 months
    Order.aggregate([
      { $match: { orderStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
    ]),
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]),
    Product.find({ stock: { $lte: 5 } })
      .select('name stock images')
      .sort({ stock: 1 })
      .limit(5),
  ]);

  const MONTHS = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const monthlyData = monthly.map((m) => ({
    label: `${MONTHS[m._id.month - 1]} ${m._id.year}`,
    revenue: m.revenue,
    orders: m.orders,
  }));

  res.json({
    success: true,
    stats: {
      totalSales: salesAgg[0]?.total || 0,
      totalOrders,
      totalUsers,
      totalProducts,
    },
    monthly: monthlyData,
    statusBreakdown,
    recentOrders,
    lowStock,
  });
});
