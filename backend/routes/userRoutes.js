import express from 'express';
import {
  updateProfile,
  changePassword,
  uploadAvatar,
  getUsers,
  getUserById,
  adminUpdateUser,
  toggleBlockUser,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Authenticated user self-service
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/avatar', protect, upload.single('avatar'), uploadAvatar);

// Admin user management
router.get('/', protect, admin, getUsers);
router.get('/:id', protect, admin, getUserById);
router.put('/:id', protect, admin, adminUpdateUser);
router.put('/:id/block', protect, admin, toggleBlockUser);

export default router;
