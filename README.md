# Zyvora — Premium Luxury E‑Commerce Platform (MERN)

A production‑ready luxury e‑commerce platform built with the **MERN stack**
(MongoDB, Express, React, Node) featuring a Tyrian Purple & White theme,
JWT auth with HttpOnly cookies, Cloudinary image uploads, order tracking,
an admin dashboard with analytics, email notifications, and a fully
responsive, animated storefront.

![Theme](https://img.shields.io/badge/Theme-Tyrian%20Purple%20%234F0341-4F0341) ![Stack](https://img.shields.io/badge/Stack-MERN-success)

---

## ✨ Features

**Storefront**
- Luxury hero, auto‑scrolling deals carousel (>50% off, 4s autoplay)
- Featured categories, featured / latest / best‑selling sections
- Promo banner, newsletter, customer testimonials
- Product listing with search, category + price filters, sort & pagination
- Product details with image gallery + hover zoom, reviews & related products
- Cart, wishlist, COD checkout with live tax/shipping totals
- Order history + real‑time tracking timeline (ZYV‑YYYY‑NNNNNN order IDs)
- Profile management: edit details, address, avatar upload, change password

**Admin Panel** (`/admin`, admin role only)
- Dashboard: sales / orders / users / products KPIs, revenue & orders charts,
  recent orders, low‑stock alerts
- Product CRUD with multi‑image upload + "Feature To Home" toggle
- Category CRUD, Order management (status updates notify customers),
  User management (search, block / unblock)

**Security**: JWT + HttpOnly cookies, bcrypt hashing, RBAC, Helmet,
rate limiting, mongo‑sanitize, xss‑clean, hpp, input validation.

**SEO / Perf**: dynamic meta + Open Graph tags, robots.txt, sitemap.xml,
lazy‑loaded routes (code splitting), optimized images, responsive design.

---

## 🗂 Project Structure

```
ZYVORA_Ecommerce_website/
├── backend/          Express API (controllers, models, routes, middleware, utils, config)
└── frontend/         React + Vite app (components, pages, layouts, redux, services, hooks, utils)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB running locally (or a MongoDB Atlas URI)
- (Optional) Cloudinary account for image uploads
- (Optional) SMTP credentials for emails (e.g. a Gmail App Password)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env        # then fill in the values
npm run seed                # load demo categories + products + admin user
npm run dev                 # starts API on http://localhost:5000
```

Key `.env` values:

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random secret for signing tokens |
| `CLOUDINARY_*` | Cloudinary credentials (image uploads) |
| `SMTP_*` | SMTP credentials (email notifications) |
| `ADMIN_EMAIL` | Email auto‑promoted to admin on register (`kaladevins9@gmail.com`) |

> Cloudinary and SMTP are optional for local dev — the app degrades
> gracefully (uploads require Cloudinary; emails are skipped if SMTP is unset).

### 2. Frontend

```bash
cd frontend
npm install
npm run dev                 # starts app on http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:5000`, so no extra
config is needed locally. For production, set `VITE_API_URL` to your API URL.

---

## 🔑 Demo Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | `kaladevins9@gmail.com` | `Admin@123` |
| Customer | `customer@zyvora.com` | `Customer@123` |

---

## 🎨 Brand

| Token | Value |
|---|---|
| Primary | Tyrian Purple `#4F0341` |
| Secondary | White `#FFFFFF` |
| Accents | `#6D0A58` · `#7A1266` · `#A53F8C` · Gold `#C9A96A` |
| Fonts | Cormorant Garamond (serif) · Jost (sans) |

---

## 📡 API Overview

| Group | Base | Notes |
|---|---|---|
| Auth | `/api/auth` | register, login, logout, me, forgot/reset password |
| Products | `/api/products` | list/search/filter, featured, latest, best‑selling, deals, CRUD |
| Categories | `/api/categories` | list + CRUD |
| Cart | `/api/cart` | get/add/update/remove/clear |
| Wishlist | `/api/wishlist` | get/add/remove |
| Orders | `/api/orders` | create, my orders, get, cancel, admin list + status |
| Reviews | `/api/reviews` · `/api/products/:id/reviews` | verified‑buyer reviews |
| Users | `/api/users` | profile, avatar, password, admin user mgmt |
| Admin | `/api/admin/stats` | dashboard analytics |

---

## 🛠 Built With

React 18 · Redux Toolkit · React Router · Axios · Swiper · Recharts ·
Framer Motion · React Toastify · Vite — Express · Mongoose · JWT · bcryptjs ·
Multer · Cloudinary · Nodemailer · Helmet.

---

© Zyvora. Crafted with passion for luxury.
