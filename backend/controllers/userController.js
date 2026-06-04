import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  avatar: user.avatar,
  address: user.address,
  role: user.role,
});

// @desc    Update own profile (name, phone, address)
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, phone, address } = req.body;

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address) {
    user.address = { ...user.address?.toObject?.(), ...address };
  }

  await user.save();
  res.json({ success: true, user: sanitizeUser(user) });
});

// @desc    Change own password (requires current password)
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Current and new password are required');
  }
  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password changed successfully' });
});

// @desc    Upload / replace profile picture
// @route   PUT /api/users/avatar
// @access  Private
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please provide an image');
  }

  const user = await User.findById(req.user._id);

  if (user.avatar?.public_id) {
    await deleteFromCloudinary(user.avatar.public_id);
  }

  const result = await uploadToCloudinary(req.file.buffer, 'zyvora/avatars');
  user.avatar = result;
  await user.save();

  res.json({ success: true, avatar: user.avatar });
});

/* ===================== Admin: user management ===================== */

// @desc    List users (search + paginate)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.max(1, Number(req.query.limit) || 10);
  const keyword = req.query.keyword?.trim();

  const filter = keyword
    ? {
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { email: { $regex: keyword, $options: 'i' } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    users,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc    Get a single user
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, user });
});

// @desc    Update a user (admin)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const adminUpdateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, email, phone, role } = req.body;
  if (name) user.name = name;
  if (email) user.email = email.toLowerCase();
  if (phone !== undefined) user.phone = phone;
  if (role && ['user', 'admin'].includes(role)) user.role = role;

  await user.save();
  res.json({ success: true, user: sanitizeUser(user) });
});

// @desc    Block / unblock a user
// @route   PUT /api/users/:id/block
// @access  Private/Admin
export const toggleBlockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot block an admin account');
  }

  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({
    success: true,
    isBlocked: user.isBlocked,
    message: user.isBlocked ? 'User blocked' : 'User unblocked',
  });
});
