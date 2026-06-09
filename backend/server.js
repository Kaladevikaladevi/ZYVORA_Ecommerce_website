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

/* ================= TRUST PROXY (IMPORTANT FOR VERCEL/RENDER) ================= */
app.set('trust proxy', 1);

/* ================= CORS FIX ================= */

const allowedOrigins = [
  "http://localhost:5173",
  "https://zyvora-ecommerce-website.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow Postman, mobile apps, server-to-server requests
    if (!origin) return callback(null, true);

    // Allow specific domains + all Vercel preview deployments
    if (
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ================= SECURITY ================= */

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* ================= RATE LIMIT ================= */
app.use("/api", apiLimiter);

/* ================= HEALTH CHECK ================= */
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Zyvora API is running",
    time: new Date(),
  });
});

/* ================= ROUTES ================= */

// IMPORTANT: THESE MUST MATCH FRONTEND CALLS
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/admin", adminRoutes);

/* ================= ERROR HANDLING ================= */
app.use(notFound);
app.use(errorHandler);

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Zyvora API running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});

/* ================= CRASH SAFETY ================= */
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
});