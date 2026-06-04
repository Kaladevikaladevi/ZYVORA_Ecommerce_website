import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

/**
 * Seed script — populates demo categories, products and an admin user so the
 * storefront looks complete on first run.
 *
 *   npm run seed           # import demo data
 *   npm run seed:destroy   # wipe all data
 *
 * Images use Unsplash placeholders so no Cloudinary upload is needed for the demo.
 */

const img = (id) => ({
  url: `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`,
  public_id: `demo/${id}`,
});

const CATEGORIES = [
  { name: 'Fashion', description: 'Curated luxury apparel and timeless style.' },
  { name: 'Watches', description: 'Precision craftsmanship for the discerning wrist.' },
  { name: 'Accessories', description: 'Refined finishing touches for every look.' },
  { name: 'Beauty', description: 'Premium skincare and fragrances.' },
  { name: 'Electronics', description: 'Elegant technology that elevates living.' },
  { name: 'Home Decor', description: 'Sophisticated pieces for a luxurious home.' },
];

// Product blueprints keyed by category name.
const PRODUCTS = {
  Watches: [
    { name: 'Zyvora Noir Automatic Watch', price: 24999, discountPrice: 11999, images: ['1523275335684-37898b6baf30'], featured: true, desc: 'Swiss-inspired automatic movement with sapphire crystal and a hand-finished leather strap.' },
    { name: 'Imperial Rose Gold Chronograph', price: 32999, discountPrice: 0, images: ['1524592094714-0f0654e20314'], featured: true, desc: 'A statement chronograph in brushed rose gold with luminescent indices.' },
    { name: 'Midnight Skeleton Timepiece', price: 45999, discountPrice: 19999, images: ['1547996160-81dfa63595aa'], featured: false, desc: 'Exposed mechanical heart, sapphire case back, and a midnight-blue dial.' },
  ],
  Fashion: [
    { name: 'Tyrian Silk Evening Gown', price: 18999, discountPrice: 7999, images: ['1539008835657-9e8e9680c956'], featured: true, desc: 'Hand-draped mulberry silk in our signature Tyrian purple.' },
    { name: 'Heritage Cashmere Overcoat', price: 27999, discountPrice: 0, images: ['1591047139829-d91aecb6caea'], featured: false, desc: 'Pure cashmere tailored for an effortless silhouette.' },
    { name: 'Velvet Tailored Blazer', price: 15999, discountPrice: 6499, images: ['1594938298603-c8148c4dae35'], featured: true, desc: 'Italian velvet with satin lapels — refined evening elegance.' },
  ],
  Accessories: [
    { name: 'Monogram Leather Handbag', price: 21999, discountPrice: 9999, images: ['1584917865442-de89df76afd3'], featured: true, desc: 'Full-grain leather with gold-tone hardware and suede lining.' },
    { name: 'Silk Twill Scarf', price: 5999, discountPrice: 2499, images: ['1601924994987-69e26d50dc26'], featured: false, desc: 'Hand-rolled edges and an exclusive Zyvora print.' },
    { name: 'Onyx Cufflink Set', price: 8999, discountPrice: 0, images: ['1606760227091-3dd870d97f1d'], featured: false, desc: 'Sterling silver cufflinks set with polished black onyx.' },
  ],
  Beauty: [
    { name: 'Velour Noir Eau de Parfum', price: 12999, discountPrice: 5499, images: ['1592945403244-b3fbafd7f539'], featured: true, desc: 'An opulent blend of oud, rose, and amber.' },
    { name: 'Radiance Gold Serum', price: 7999, discountPrice: 0, images: ['1620916566398-39f1143ab7be'], featured: false, desc: '24k gold-infused serum for a luminous complexion.' },
  ],
  Electronics: [
    { name: 'Aurora Wireless Headphones', price: 18999, discountPrice: 8499, images: ['1505740420928-5e560c06d30e'], featured: true, desc: 'Studio-grade audio wrapped in machined aluminium and leather.' },
    { name: 'Zyvora SmartGlass Speaker', price: 14999, discountPrice: 0, images: ['1608043152269-423dbba4e7e1'], featured: false, desc: 'Hand-blown glass enclosure with 360° luxury sound.' },
  ],
  'Home Decor': [
    { name: 'Marble & Brass Table Lamp', price: 9999, discountPrice: 3999, images: ['1507473885765-e6ed057f782c'], featured: true, desc: 'Carrara marble base with a warm brass stem.' },
    { name: 'Tyrian Velvet Accent Chair', price: 29999, discountPrice: 0, images: ['1586023492125-27b2c045efd7'], featured: false, desc: 'Plush velvet upholstery on a gold-finished frame.' },
  ],
};

const importData = async () => {
  await connectDB();

  await Promise.all([
    Order.deleteMany(),
    Review.deleteMany(),
    Product.deleteMany(),
    Category.deleteMany(),
    User.deleteMany(),
  ]);

  // Admin + a demo customer
  await User.create({
    name: 'Zyvora Admin',
    email: process.env.ADMIN_EMAIL || 'kaladevins9@gmail.com',
    password: 'Admin@123',
    role: 'admin',
    phone: '9000000000',
  });
  await User.create({
    name: 'Demo Customer',
    email: 'customer@zyvora.com',
    password: 'Customer@123',
    phone: '9111111111',
  });

  const createdCategories = await Category.create(CATEGORIES);
  const catMap = Object.fromEntries(
    createdCategories.map((c) => [c.name, c._id])
  );

  const productDocs = [];
  for (const [catName, items] of Object.entries(PRODUCTS)) {
    for (const p of items) {
      productDocs.push({
        name: p.name,
        description: p.desc,
        price: p.price,
        discountPrice: p.discountPrice,
        stock: Math.floor(20 + Math.cos(p.price) * 0 + 30), // deterministic-ish stock
        category: catMap[catName],
        brand: 'Zyvora',
        featuredToHome: p.featured,
        images: p.images.map(img),
        sold: (p.price % 50) + 5,
        ratings: 4 + (p.price % 10) / 10,
        numReviews: (p.price % 7) + 1,
      });
    }
  }
  await Product.create(productDocs);

  console.log('✅ Seed complete:');
  console.log('   Admin    -> ', process.env.ADMIN_EMAIL, '/ Admin@123');
  console.log('   Customer ->  customer@zyvora.com / Customer@123');
  console.log(`   ${createdCategories.length} categories, ${productDocs.length} products`);
  await mongoose.connection.close();
  process.exit(0);
};

const destroyData = async () => {
  await connectDB();
  await Promise.all([
    Order.deleteMany(),
    Review.deleteMany(),
    Product.deleteMany(),
    Category.deleteMany(),
    User.deleteMany(),
  ]);
  console.log('🗑️  All data destroyed');
  await mongoose.connection.close();
  process.exit(0);
};

if (process.argv[2] === '--destroy') {
  destroyData();
} else {
  importData();
}
