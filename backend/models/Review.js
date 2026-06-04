import mongoose from 'mongoose';
import Product from './Product.js';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: { type: String, required: true },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters'],
    },
  },
  { timestamps: true }
);

// A user can review a given product only once
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Recalculate a product's average rating + review count after changes
reviewSchema.statics.recalcProductRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const ratings = stats.length ? Math.round(stats[0].avgRating * 10) / 10 : 0;
  const numReviews = stats.length ? stats[0].count : 0;

  await Product.findByIdAndUpdate(productId, { ratings, numReviews });
};

reviewSchema.post('save', function () {
  this.constructor.recalcProductRating(this.product);
});

// findOneAndDelete / findOneAndUpdate hooks
reviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) doc.constructor.recalcProductRating(doc.product);
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
