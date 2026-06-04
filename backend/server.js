// Load env vars FIRST. Using the side-effect import (instead of a body-level
// dotenv.config()) guarantees env is populated before the imports below are
// evaluated — ESM evaluates all imports in source order before any body code,
// so config/cloudinary.js must not be imported before this runs.
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import xss from 'xss-clean';

import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimiters.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

await connectDB();

const app = express();

// ---- Security & parsing middleware ----
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize()); // strip $ / . from req payloads (NoSQL injection)
app.use(xss()); // sanitize user input against stored XSS
app.use(hpp()); // protect against HTTP param pollution

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use('/api', apiLimiter);

// ---- Health check ----
app.get('/api/health', (req, res) =>
  res.json({ success: true, status: 'Zyvora API is running', time: new Date() })
);

// ---- Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin', adminRoutes);

// ---- Errors ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(
    `🚀 Zyvora API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  )
);

// Crash-safety: log unhandled rejections instead of dying silently.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});
