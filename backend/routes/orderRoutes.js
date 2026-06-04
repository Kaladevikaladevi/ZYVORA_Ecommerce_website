import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);

// Admin
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);

// User
router.put('/:id/cancel', protect, cancelMyOrder);
router.get('/:idOrOrderId', protect, getOrder);

export default router;
