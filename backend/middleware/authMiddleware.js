import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from './errorMiddleware.js';

/**
 * Protect routes — requires a valid JWT, sent either via HttpOnly cookie
 * or an Authorization: Bearer header.
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized — please log in');
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    res.status(401);
    throw new Error('User no longer exists');
  }

  if (user.isBlocked) {
    res.status(403);
    throw new Error('Your account has been blocked. Contact support.');
  }

  req.user = user;
  next();
});

/**
 * Restrict a route to admins only. Must run after `protect`.
 */
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Admin access required');
};
