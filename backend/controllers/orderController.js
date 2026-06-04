import mongoose from 'mongoose';
import Order, { ORDER_STATUSES } from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import sendEmail from '../utils/sendEmail.js';
import {
  orderConfirmationEmail,
  adminNewOrderEmail,
  orderStatusEmail,
} from '../utils/emailTemplates.js';

const TAX_RATE = 0.05; // 5%
const FREE_SHIPPING_THRESHOLD = 2000;
const SHIPPING_FEE = 99;

// Map an order status to the tracking-timeline label it should complete.
const STATUS_TO_STEP = {
  Confirmed: 'Confirmed',
  Processing: 'Processing',
  Shipping: 'Shipping',
  Delivered: 'Delivered',
};

// @desc    Create a new order from provided items
// @route   POST /api/orders
// @access  Private
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items provided');
  }
  if (
    !shippingAddress?.fullName ||
    !shippingAddress?.phone ||
    !shippingAddress?.line1 ||
    !shippingAddress?.city ||
    !shippingAddress?.state ||
    !shippingAddress?.postalCode
  ) {
    res.status(400);
    throw new Error('Complete shipping address is required');
  }

  // Build order items from authoritative DB data (never trust client prices).
  const orderItems = [];
  let itemsPrice = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error(`Product not available: ${item.product}`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const unitPrice =
      product.discountPrice && product.discountPrice > 0
        ? product.discountPrice
        : product.price;

    itemsPrice += unitPrice * item.quantity;
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: unitPrice,
      quantity: item.quantity,
    });
  }

  const taxPrice = Math.round(itemsPrice * TAX_RATE);
  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const totalPrice = itemsPrice + taxPrice + shippingPrice;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod: 'COD',
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  // Decrement stock & bump sold counters.
  await Promise.all(
    orderItems.map((it) =>
      Product.findByIdAndUpdate(it.product, {
        $inc: { stock: -it.quantity, sold: it.quantity },
      })
    )
  );

  // Clear the user's cart after a successful order.
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  // Fire notification emails (non-blocking failures handled in sendEmail).
  sendEmail({
    to: req.user.email,
    subject: `Order Confirmed — ${order.orderId}`,
    html: orderConfirmationEmail(order, req.user.name),
  });
  sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New Order — ${order.orderId}`,
    html: adminNewOrderEmail(order, req.user.name),
  });

  res.status(201).json({ success: true, order });
});

// @desc    Get my orders
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, orders });
});

// @desc    Get a single order (owner or admin) by orderId or _id
// @route   GET /api/orders/:idOrOrderId
// @access  Private
export const getOrder = asyncHandler(async (req, res) => {
  const { idOrOrderId } = req.params;
  const query = mongoose.isValidObjectId(idOrOrderId)
    ? { _id: idOrOrderId }
    : { orderId: idOrOrderId };

  const order = await Order.findOne(query).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isOwner = order.user._id.equals(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, order });
});

// @desc    Cancel my own order (only while still cancellable)
// @route   PUT /api/orders/:id/cancel
// @access  Private
export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (!order.user.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (['Shipping', 'Delivered', 'Cancelled'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error(`Cannot cancel an order that is ${order.orderStatus}`);
  }

  order.orderStatus = 'Cancelled';
  order.cancelledAt = new Date();
  await restock(order);
  await order.save();

  sendEmail({
    to: req.user.email,
    subject: `Order Cancelled — ${order.orderId}`,
    html: orderStatusEmail(order, req.user.name, 'Cancelled'),
  });

  res.json({ success: true, order });
});

/* ===================== Admin ===================== */

// @desc    List all orders (search + filter + paginate)
// @route   GET /api/orders
// @access  Private/Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 12);
  const { status, keyword } = req.query;

  const filter = {};
  if (status && status !== 'all') filter.orderStatus = status;
  if (keyword) filter.orderId = { $regex: keyword, $options: 'i' };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    orders,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Update order status (admin) + notify the customer
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const previous = order.orderStatus;

  // Restock if moving to Cancelled from a non-cancelled state.
  if (status === 'Cancelled' && previous !== 'Cancelled') {
    await restock(order);
    order.cancelledAt = new Date();
  }

  order.orderStatus = status;

  if (status === 'Delivered') {
    order.deliveredAt = new Date();
    order.paymentStatus = 'Paid'; // COD collected on delivery
  }

  // Advance the tracking timeline.
  const stepLabel = STATUS_TO_STEP[status];
  if (stepLabel) {
    let reached = false;
    order.tracking = order.tracking.map((step) => {
      if (step.status === stepLabel) {
        reached = true;
        return { ...step.toObject(), completed: true, date: new Date() };
      }
      // Mark all steps before the reached one as completed too.
      if (!reached && !step.completed) {
        return { ...step.toObject(), completed: true, date: new Date() };
      }
      return step;
    });
  }

  await order.save();

  // Notify the customer about meaningful status changes.
  if (previous !== status) {
    sendEmail({
      to: order.user.email,
      subject: `Order Update — ${order.orderId} (${status})`,
      html: orderStatusEmail(order, order.user.name, status),
    });
  }

  res.json({ success: true, order });
});

// Restock all items of an order (used on cancellation).
const restock = async (order) => {
  await Promise.all(
    order.items.map((it) =>
      Product.findByIdAndUpdate(it.product, {
        $inc: { stock: it.quantity, sold: -it.quantity },
      })
    )
  );
};
