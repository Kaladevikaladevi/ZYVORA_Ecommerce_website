import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__bg" />
      <div className="hero__overlay" />
      <div className="container hero__inner">
        <motion.div
          className="hero__content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className="hero__eyebrow">The Art of Luxury</span>
          <h1 className="hero__title">
            Elegance, <em>Redefined</em>
          </h1>
          <p className="hero__text">
            Discover a curated collection of the world's most coveted pieces —
            where timeless craftsmanship meets modern sophistication.
          </p>
          <div className="hero__cta">
            <Link to="/products" className="btn btn-gold">
              Explore Collection <FaArrowRight />
            </Link>
            <Link to="/category/watches" className="btn btn-outline hero__btn-light">
              Shop Watches
            </Link>
          </div>

          <div className="hero__stats">
            <div>
              <strong>10K+</strong>
              <span>Premium Products</span>
            </div>
            <div>
              <strong>50K+</strong>
              <span>Happy Clients</span>
            </div>
            <div>
              <strong>4.9★</strong>
              <span>Average Rating</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
