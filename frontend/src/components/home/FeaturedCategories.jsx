import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SectionHeader from '../ui/SectionHeader';
import './FeaturedCategories.css';

// Fallback imagery per category name so the grid always looks complete.
const FALLBACK = {
  fashion: '1445205170230-053b83016050',
  watches: '1523275335684-37898b6baf30',
  accessories: '1584917865442-de89df76afd3',
  beauty: '1592945403244-b3fbafd7f539',
  electronics: '1505740420928-5e560c06d30e',
  'home decor': '1507473885765-e6ed057f782c',
};
const img = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=700&q=80`;

export default function FeaturedCategories({ categories = [] }) {
  if (!categories.length) return null;

  return (
    <section className="section container">
      <SectionHeader
        eyebrow="Curated Collections"
        title="Shop by Category"
        text="Explore our world of luxury, thoughtfully organized for you."
      />
      <div className="cats">
        {categories.slice(0, 6).map((c, i) => (
          <motion.div
            key={c._id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
          >
            <Link to={`/category/${c.slug}`} className="cat-card">
              <img
                src={c.image?.url || img(FALLBACK[c.name.toLowerCase()] || FALLBACK.fashion)}
                alt={c.name}
                loading="lazy"
              />
              <div className="cat-card__overlay" />
              <div className="cat-card__label">
                <h3>{c.name}</h3>
                <span>Discover →</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
