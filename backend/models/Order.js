import mongoose from 'mongoose';
import Counter from './Counter.js';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const trackingStepSchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    completed: { type: Boolean, default: false },
    date: { type: Date },
  },
  { _id: false }
);

const ORDER_STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipping',
  'Delivered',
  'Cancelled',
];

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    paymentMethod: {
      type: String,
      enum: ['COD'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed'],
      default: 'Pending',
    },
    itemsPrice: { type: Number, required: true, default: 0 },
    taxPrice: { type: Number, required: true, default: 0 },
    shippingPrice: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, required: true, default: 0 },
    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'Pending',
      index: true,
    },
    tracking: {
      type: [trackingStepSchema],
      default: () => [
        { status: 'Order Placed', completed: true, date: new Date() },
        { status: 'Confirmed', completed: false },
        { status: 'Processing', completed: false },
        { status: 'Shipping', completed: false },
        { status: 'Delivered', completed: false },
      ],
    },
    deliveredAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

// Generate a human-friendly sequential order id: ZYV-YYYY-000001
orderSchema.pre('save', async function (next) {
  if (this.orderId) return next();
  try {
    const year = new Date().getFullYear();
    const counter = await Counter.findByIdAndUpdate(
      `order-${year}`,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.orderId = `ZYV-${year}-${String(counter.seq).padStart(6, '0')}`;
    next();
  } catch (error) {
    next(error);
  }
});

export { ORDER_STATUSES };
const Order = mongoose.model('Order', orderSchema);
export default Order;
