import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// @desc    List all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ success: true, categories });
});

// @desc    Get a single category by id or slug
// @route   GET /api/categories/:idOrSlug
// @access  Public
export const getCategory = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };
  const category = await Category.findOne(query);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }
  res.json({ success: true, category });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    res.status(400);
    throw new Error('Category name is required');
  }

  let image = { url: '', public_id: '' };
  if (req.file) {
    image = await uploadToCloudinary(req.file.buffer, 'zyvora/categories');
  }

  const category = await Category.create({ name, description, image });
  res.status(201).json({ success: true, category });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const { name, description, isActive } = req.body;
  if (name) category.name = name;
  if (description !== undefined) category.description = description;
  if (isActive !== undefined) category.isActive = isActive === 'true' || isActive === true;

  if (req.file) {
    if (category.image?.public_id) {
      await deleteFromCloudinary(category.image.public_id);
    }
    category.image = await uploadToCloudinary(req.file.buffer, 'zyvora/categories');
  }

  await category.save();
  res.json({ success: true, category });
});

// @desc    Delete category (blocked if products still reference it)
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    res.status(400);
    throw new Error(
      `Cannot delete — ${productCount} product(s) still use this category`
    );
  }

  if (category.image?.public_id) {
    await deleteFromCloudinary(category.image.public_id);
  }
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
});
