import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaHeart,
  FaRegHeart,
  FaShoppingBag,
  FaMinus,
  FaPlus,
  FaCheck,
  FaTruck,
  FaShieldAlt,
  FaUndo,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import api from '../services/api';
import Meta from '../components/ui/Meta';
import Rating from '../components/ui/Rating';
import ProductGrid from '../components/product/ProductGrid';
import ReviewSection from '../components/product/ReviewSection';
import PageLoader from '../components/ui/PageLoader';
import { formatPrice, effectivePrice, discountPercent } from '../utils/helpers';
import { addToCart } from '../redux/slices/cartSlice';
import {
  addToWishlist,
  removeFromWishlist,
} from '../redux/slices/wishlistSlice';
import './ProductDetails.css';

export default function ProductDetails() {
  const { idOrSlug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState({ active: false, x: 50, y: 50 });

  const isWishlisted = useSelector((s) =>
    data ? s.wishlist.products.some((p) => (p._id || p) === data.product._id) : false
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setActiveImg(0);
    setQty(1);
    (async () => {
      try {
        const { data } = await api.get(`/products/${idOrSlug}`);
        if (active) setData(data);
      } catch {
        if (active) setData(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [idOrSlug]);

  if (loading) return <PageLoader />;
  if (!data) {
    return (
      <div className="page-pad container text-center">
        <h2 style={{ color: 'var(--tyrian)' }}>Product not found</h2>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: 20 }}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const { product, reviews, related } = data;
  const pct = discountPercent(product);
  const outOfStock = product.stock <= 0;

  const requireAuth = () => {
    if (!user) {
      toast.info('Please log in to continue');
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!requireAuth() || outOfStock) return;
    dispatch(addToCart({ productId: product._id, quantity: qty }));
  };

  const handleBuyNow = () => {
    if (!requireAuth() || outOfStock) return;
    dispatch(addToCart({ productId: product._id, quantity: qty })).then(() =>
      navigate('/checkout')
    );
  };

  const handleWishlist = () => {
    if (!requireAuth()) return;
    if (isWishlisted) dispatch(removeFromWishlist(product._id));
    else dispatch(addToWishlist(product._id));
  };

  const onMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoom({ active: true, x, y });
  };

  return (
    <div className="page-pad">
      <Meta title={product.name} description={product.description?.slice(0, 150)} image={product.images?.[0]?.url} />

      <div className="container">
        <nav className="pd-breadcrumb">
          <Link to="/">Home</Link> / <Link to="/products">Shop</Link> /{' '}
          {product.category?.name && (
            <>
              <Link to={`/category/${product.category.slug}`}>
                {product.category.name}
              </Link>{' '}
              /{' '}
            </>
          )}
          <span>{product.name}</span>
        </nav>

        <div className="pd">
          {/* Gallery */}
          <div className="pd__gallery">
            <div
              className="pd__main"
              onMouseMove={onMouseMove}
              onMouseEnter={() => setZoom((z) => ({ ...z, active: true }))}
              onMouseLeave={() => setZoom((z) => ({ ...z, active: false }))}
            >
              <img
                src={product.images?.[activeImg]?.url}
                alt={product.name}
                style={
                  zoom.active
                    ? {
                        transform: 'scale(1.8)',
                        transformOrigin: `${zoom.x}% ${zoom.y}%`,
                      }
                    : undefined
                }
              />
              {pct > 0 && (
                <span className="badge badge-sale pd__badge">-{pct}% OFF</span>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="pd__thumbs">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    className={`pd__thumb ${i === activeImg ? 'is-active' : ''}`}
                    onClick={() => setActiveImg(i)}
                  >
                    <img src={img.url} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd__info">
            {product.category?.name && (
              <span className="pd__cat">{product.category.name}</span>
            )}
            <h1>{product.name}</h1>
            <div className="pd__rating">
              <Rating value={product.ratings} size={16} />
              <span>
                {product.ratings?.toFixed(1)} ({product.numReviews} reviews)
              </span>
            </div>

            <div className="pd__price">
              <span className="now">{formatPrice(effectivePrice(product))}</span>
              {pct > 0 && (
                <>
                  <span className="was">{formatPrice(product.price)}</span>
                  <span className="save">Save {pct}%</span>
                </>
              )}
            </div>

            <p className="pd__desc">{product.description}</p>

            <div className="pd__meta">
              <div>
                <span>Brand</span>
                <strong>{product.brand}</strong>
              </div>
              <div>
                <span>Availability</span>
                <strong className={outOfStock ? 'text-danger' : 'text-success'}>
                  {outOfStock ? 'Out of Stock' : `In Stock (${product.stock})`}
                </strong>
              </div>
            </div>

            {!outOfStock && (
              <div className="pd__qty">
                <span>Quantity</span>
                <div className="qty-stepper">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))}>
                    <FaMinus />
                  </button>
                  <span>{qty}</span>
                  <button
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
            )}

            <div className="pd__actions">
              <button
                className="btn btn-primary pd__add"
                onClick={handleAddToCart}
                disabled={outOfStock}
              >
                <FaShoppingBag /> Add to Cart
              </button>
              <button
                className="btn btn-gold"
                onClick={handleBuyNow}
                disabled={outOfStock}
              >
                Buy Now
              </button>
              <button
                className={`pd__wish ${isWishlisted ? 'is-active' : ''}`}
                onClick={handleWishlist}
                aria-label="Wishlist"
              >
                {isWishlisted ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>

            <ul className="pd__perks">
              <li><FaTruck /> Free shipping on orders over ₹2,000</li>
              <li><FaShieldAlt /> 100% authentic guarantee</li>
              <li><FaUndo /> 7-day easy returns</li>
              <li><FaCheck /> Cash on delivery available</li>
            </ul>
          </div>
        </div>

        {/* Reviews */}
        <ReviewSection
          productId={product._id}
          reviews={reviews}
          onChange={() =>
            api.get(`/products/${idOrSlug}`).then((r) => setData(r.data))
          }
        />

        {/* Related */}
        {related?.length > 0 && (
          <section style={{ marginTop: 64 }}>
            <h2 style={{ color: 'var(--tyrian)', fontSize: 30, marginBottom: 26 }}>
              You May Also Like
            </h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </div>
  );
}
