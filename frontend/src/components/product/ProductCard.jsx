import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaHeart, FaRegHeart, FaShoppingBag } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import Rating from '../ui/Rating';
import { formatPrice, effectivePrice, discountPercent } from '../../utils/helpers';
import { addToCart } from '../../redux/slices/cartSlice';
import {
  addToWishlist,
  removeFromWishlist,
} from '../../redux/slices/wishlistSlice';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const wishlisted = useSelector((s) =>
    s.wishlist.products.some((p) => (p._id || p) === product._id)
  );

  const pct = discountPercent(product);
  const outOfStock = product.stock <= 0;

  const requireAuth = () => {
    if (!user) {
      toast.info('Please log in to continue');
      return false;
    }
    return true;
  };

  const handleCart = (e) => {
    e.preventDefault();
    if (!requireAuth() || outOfStock) return;
    dispatch(addToCart({ productId: product._id, quantity: 1 }));
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (wishlisted) dispatch(removeFromWishlist(product._id));
    else dispatch(addToWishlist(product._id));
  };

  return (
    <motion.div
      className="pcard"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45 }}
    >
      <Link to={`/products/${product.slug || product._id}`} className="pcard__media">
        <img
          src={product.images?.[0]?.url}
          alt={product.name}
          loading="lazy"
        />
        {pct > 0 && <span className="badge badge-sale pcard__badge">-{pct}%</span>}
        {outOfStock && <span className="pcard__sold">Sold Out</span>}

        <button
          className={`pcard__wish ${wishlisted ? 'is-active' : ''}`}
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
        >
          {wishlisted ? <FaHeart /> : <FaRegHeart />}
        </button>

        <button
          className="pcard__cart"
          onClick={handleCart}
          disabled={outOfStock}
          aria-label="Add to cart"
        >
          <FaShoppingBag /> {outOfStock ? 'Sold Out' : 'Add to Cart'}
        </button>
      </Link>

      <div className="pcard__body">
        {product.category?.name && (
          <span className="pcard__cat">{product.category.name}</span>
        )}
        <Link to={`/products/${product.slug || product._id}`}>
          <h3 className="pcard__name">{product.name}</h3>
        </Link>
        <Rating value={product.ratings} count={product.numReviews} />
        <div className="pcard__price">
          <span className="pcard__now">{formatPrice(effectivePrice(product))}</span>
          {pct > 0 && (
            <span className="pcard__was">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
