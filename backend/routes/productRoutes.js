import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getLatestProducts,
  getBestSelling,
  getDeals,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { createReview } from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Static collection endpoints (must precede the :idOrSlug catch-all)
router.get('/featured', getFeaturedProducts);
router.get('/latest', getLatestProducts);
router.get('/best-selling', getBestSelling);
router.get('/deals', getDeals);

router.get('/', getProducts);
router.post('/', protect, admin, upload.array('images', 6), createProduct);

// Reviews nested under a product
router.post('/:productId/reviews', protect, createReview);

router.get('/:idOrSlug', getProduct);
router.put('/:id', protect, admin, upload.array('images', 6), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
