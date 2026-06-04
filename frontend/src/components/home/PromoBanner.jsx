import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './PromoBanner.css';

export default function PromoBanner() {
  return (
    <section className="promo">
      <div className="container promo__inner">
        <motion.div
          className="promo__content"
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="promo__eyebrow">The Zyvora Signature</span>
          <h2>
            Crafted for the <em>Extraordinary</em>
          </h2>
          <p>
            Every piece in our collection is selected for its exceptional
            quality, heritage, and design. Experience luxury that lasts a
            lifetime — backed by our promise of authenticity and white-glove
            service.
          </p>
          <Link to="/products" className="btn btn-gold">
            Discover the Collection
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
