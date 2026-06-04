import Product from '../models/Product.js';
import Review from '../models/Review.js';
import ApiFeatures from '../utils/apiFeatures.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

// @desc    List products with search / filter / sort / pagination
// @route   GET /api/products
// @access  Public
export const getProducts = asyncHandler(async (req, res) => {
  const baseFilter = { isActive: true };

  const features = new ApiFeatures(Product.find(baseFilter), req.query)
    .search()
    .filter()
    .sort()
    .paginate(Number(req.query.limit) || 12);

  // Count matching docs (search + filter applied) for pagination metadata.
  const countFeatures = new ApiFeatures(
    Product.find(baseFilter),
    req.query
  )
    .search()
    .filter();
  const total = await Product.countDocuments(countFeatures.query.getFilter());

  const products = await features.query.populate('category', 'name slug');

  res.json({
    success: true,
    products,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    total,
  });
});

// @desc    Featured-to-home products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ featuredToHome: true, isActive: true })
    .sort({ createdAt: -1 })
    .limit(8)
    .populate('category', 'name slug');
  res.json({ success: true, products });
});

// @desc    Latest products
// @route   GET /api/products/latest
// @access  Public
export const getLatestProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(8)
    .populate('category', 'name slug');
  res.json({ success: true, products });
});

// @desc    Best-selling products
// @route   GET /api/products/best-selling
// @access  Public
export const getBestSelling = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .sort({ sold: -1, ratings: -1 })
    .limit(8)
    .populate('category', 'name slug');
  res.json({ success: true, products });
});

// @desc    Products with a big discount (>50% off) for the hero carousel
// @route   GET /api/products/deals
// @access  Public
export const getDeals = asyncHandler(async (req, res) => {
  // discountPrice < 50% of price  ==>  more than 50% off
  const products = await Product.find({
    isActive: true,
    discountPrice: { $gt: 0 },
    $expr: { $lt: ['$discountPrice', { $multiply: ['$price', 0.5] }] },
  })
    .sort({ createdAt: -1 })
    .limit(12)
    .populate('category', 'name slug');
  res.json({ success: true, products });
});

// @desc    Get one product (by id or slug) + its reviews + related products
// @route   GET /api/products/:idOrSlug
// @access  Public
export const getProduct = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
    ? { _id: idOrSlug }
    : { slug: idOrSlug };

  const product = await Product.findOne(query).populate('category', 'name slug');
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const [reviews, related] = await Promise.all([
    Review.find({ product: product._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 }),
    Product.find({
      category: product.category._id,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .populate('category', 'name slug'),
  ]);

  res.json({ success: true, product, reviews, related });
});

/* ===================== Admin: product CRUD ===================== */

const parseImages = async (files) => {
  const uploads = await Promise.all(
    files.map((f) => uploadToCloudinary(f.buffer, 'zyvora/products'))
  );
  return uploads;
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    discountPrice,
    stock,
    category,
    brand,
    featuredToHome,
  } = req.body;

  if (!name || !description || !price || !category || stock === undefined) {
    res.status(400);
    throw new Error('Name, description, price, stock and category are required');
  }

  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error('At least one product image is required');
  }

  const images = await parseImages(req.files);

  const product = await Product.create({
    name,
    description,
    price: Number(price),
    discountPrice: Number(discountPrice) || 0,
    stock: Number(stock),
    category,
    brand: brand || 'Zyvora',
    featuredToHome: featuredToHome === 'true' || featuredToHome === true,
    images,
  });

  res.status(201).json({ success: true, product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const fields = [
    'name',
    'description',
    'price',
    'discountPrice',
    'stock',
    'category',
    'brand',
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined && req.body[f] !== '') {
      product[f] = ['price', 'discountPrice', 'stock'].includes(f)
        ? Number(req.body[f])
        : req.body[f];
    }
  });

  if (req.body.featuredToHome !== undefined) {
    product.featuredToHome =
      req.body.featuredToHome === 'true' || req.body.featuredToHome === true;
  }
  if (req.body.isActive !== undefined) {
    product.isActive = req.body.isActive === 'true' || req.body.isActive === true;
  }

  // Remove images explicitly flagged for deletion
  if (req.body.removeImages) {
    const toRemove = Array.isArray(req.body.removeImages)
      ? req.body.removeImages
      : [req.body.removeImages];
    await Promise.all(toRemove.map((pid) => deleteFromCloudinary(pid)));
    product.images = product.images.filter(
      (img) => !toRemove.includes(img.public_id)
    );
  }

  // Append any newly uploaded images
  if (req.files && req.files.length > 0) {
    const newImages = await parseImages(req.files);
    product.images.push(...newImages);
  }

  await product.save();
  res.json({ success: true, product });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  await Promise.all(
    product.images.map((img) => deleteFromCloudinary(img.public_id))
  );
  await Review.deleteMany({ product: product._id });
  await product.deleteOne();

  res.json({ success: true, message: 'Product deleted' });
});
