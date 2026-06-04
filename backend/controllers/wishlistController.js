import Wishlist from '../models/Wishlist.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const getPopulated = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate({
    path: 'products',
    select: 'name price discountPrice images ratings stock slug isActive',
  });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [] });
  wishlist.products = wishlist.products.filter((p) => p && p.isActive);
  return wishlist;
};

// @desc    Get my wishlist
// @route   GET /api/wishlist
// @access  Private
export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getPopulated(req.user._id);
  res.json({ success: true, wishlist });
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $addToSet: { products: productId } },
    { upsert: true }
  );
  const wishlist = await getPopulated(req.user._id);
  res.json({ success: true, wishlist });
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
export const removeFromWishlist = asyncHandler(async (req, res) => {
  await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { products: req.params.productId } }
  );
  const wishlist = await getPopulated(req.user._id);
  res.json({ success: true, wishlist });
});
