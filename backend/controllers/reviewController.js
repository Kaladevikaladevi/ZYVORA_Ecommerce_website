import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

// Verify the user actually bought (and received) the product.
const hasPurchased = async (userId, productId) => {
  const order = await Order.findOne({
    user: userId,
    'items.product': productId,
    orderStatus: { $in: ['Delivered'] },
  });
  return Boolean(order);
};

// @desc    Create a review (verified buyers only)
// @route   POST /api/products/:productId/reviews
// @access  Private
export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const { productId } = req.params;

  if (!rating || !comment) {
    res.status(400);
    throw new Error('Rating and comment are required');
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const purchased = await hasPurchased(req.user._id, productId);
  if (!purchased) {
    res.status(403);
    throw new Error('Only verified buyers can review this product');
  }

  const existing = await Review.findOne({
    product: productId,
    user: req.user._id,
  });
  if (existing) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  res.status(201).json({ success: true, review });
});

// @desc    Update own review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  if (!review.user.equals(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized to edit this review');
  }

  const { rating, comment } = req.body;
  if (rating) review.rating = Number(rating);
  if (comment) review.comment = comment;
  await review.save(); // triggers rating recalculation

  res.json({ success: true, review });
});

// @desc    Delete own review (or admin)
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }
  if (!review.user.equals(req.user._id) && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this review');
  }

  await Review.findByIdAndDelete(review._id); // triggers recalculation
  res.json({ success: true, message: 'Review deleted' });
});
