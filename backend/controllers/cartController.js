import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

// Populate cart items and drop any that point to deleted/inactive products.
const getPopulatedCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: 'items.product',
    select: 'name price discountPrice images stock isActive slug',
  });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });

  cart.items = cart.items.filter((i) => i.product && i.product.isActive);
  return cart;
};

// @desc    Get my cart
// @route   GET /api/cart
// @access  Private
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getPopulatedCart(req.user._id);
  res.json({ success: true, cart });
});

// @desc    Add an item to the cart (or increment quantity)
// @route   POST /api/cart
// @access  Private
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const qty = Math.max(1, Number(quantity));

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const existing = cart.items.find((i) => i.product.equals(productId));
  const newQty = (existing?.quantity || 0) + qty;

  if (newQty > product.stock) {
    res.status(400);
    throw new Error(`Only ${product.stock} in stock`);
  }

  if (existing) existing.quantity = newQty;
  else cart.items.push({ product: productId, quantity: qty });

  await cart.save();
  const populated = await getPopulatedCart(req.user._id);
  res.json({ success: true, cart: populated });
});

// @desc    Update a cart item's quantity
// @route   PUT /api/cart/:productId
// @access  Private
export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const qty = Number(quantity);

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  const item = cart.items.find((i) => i.product.equals(req.params.productId));
  if (!item) {
    res.status(404);
    throw new Error('Item not in cart');
  }

  if (qty <= 0) {
    cart.items = cart.items.filter(
      (i) => !i.product.equals(req.params.productId)
    );
  } else {
    const product = await Product.findById(req.params.productId);
    if (qty > product.stock) {
      res.status(400);
      throw new Error(`Only ${product.stock} in stock`);
    }
    item.quantity = qty;
  }

  await cart.save();
  const populated = await getPopulatedCart(req.user._id);
  res.json({ success: true, cart: populated });
});

// @desc    Remove an item from the cart
// @route   DELETE /api/cart/:productId
// @access  Private
export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = cart.items.filter(
      (i) => !i.product.equals(req.params.productId)
    );
    await cart.save();
  }
  const populated = await getPopulatedCart(req.user._id);
  res.json({ success: true, cart: populated });
});

// @desc    Clear the cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, cart: { items: [] } });
});
