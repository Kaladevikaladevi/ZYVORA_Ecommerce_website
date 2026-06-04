import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FaMinus,
  FaPlus,
  FaTrash,
  FaShoppingBag,
  FaArrowRight,
  FaTag,
} from 'react-icons/fa';

import Meta from '../components/ui/Meta';
import EmptyState from '../components/ui/EmptyState';
import {
  updateCartItem,
  removeFromCart,
  selectCartSubtotal,
} from '../redux/slices/cartSlice';
import {
  formatPrice,
  effectivePrice,
  computeTotals,
  FREE_SHIPPING_THRESHOLD,
} from '../utils/helpers';
import './Cart.css';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((s) => s.cart);
  const subtotal = useSelector(selectCartSubtotal);
  const totals = computeTotals(subtotal);

  if (!loading && items.length === 0) {
    return (
      <div className="page-pad">
        <Meta title="Your Cart" />
        <EmptyState
          icon={<FaShoppingBag />}
          title="Your cart is empty"
          text="Discover our curated luxury collection and add your favourites."
          ctaLabel="Start Shopping"
          ctaTo="/products"
        />
      </div>
    );
  }

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="page-pad">
      <Meta title="Your Cart" />
      <div className="container">
        <h1 className="cart__title">Shopping Cart</h1>

        <div className="cart">
          <div className="cart__items">
            {remaining > 0 && (
              <div className="cart__ship-note">
                <FaTag /> Add {formatPrice(remaining)} more for{' '}
                <strong>free shipping</strong>
              </div>
            )}

            {items.map((item) => {
              const p = item.product;
              return (
                <div className="cart-item" key={p._id}>
                  <Link to={`/products/${p.slug || p._id}`} className="cart-item__img">
                    <img src={p.images?.[0]?.url} alt={p.name} />
                  </Link>
                  <div className="cart-item__info">
                    <Link to={`/products/${p.slug || p._id}`}>
                      <h3>{p.name}</h3>
                    </Link>
                    <span className="cart-item__price">
                      {formatPrice(effectivePrice(p))}
                    </span>
                    {p.stock < 5 && (
                      <span className="cart-item__stock">
                        Only {p.stock} left
                      </span>
                    )}
                  </div>

                  <div className="cart-item__qty">
                    <button
                      onClick={() =>
                        dispatch(
                          updateCartItem({
                            productId: p._id,
                            quantity: item.quantity - 1,
                          })
                        )
                      }
                    >
                      <FaMinus />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      disabled={item.quantity >= p.stock}
                      onClick={() =>
                        dispatch(
                          updateCartItem({
                            productId: p._id,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                    >
                      <FaPlus />
                    </button>
                  </div>

                  <div className="cart-item__total">
                    {formatPrice(effectivePrice(p) * item.quantity)}
                  </div>

                  <button
                    className="cart-item__remove"
                    onClick={() => dispatch(removeFromCart(p._id))}
                    aria-label="Remove"
                  >
                    <FaTrash />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <aside className="cart__summary surface">
            <h3>Order Summary</h3>
            <div className="cart__row">
              <span>Subtotal</span>
              <span>{formatPrice(totals.subtotal)}</span>
            </div>
            <div className="cart__row">
              <span>Tax (5%)</span>
              <span>{formatPrice(totals.tax)}</span>
            </div>
            <div className="cart__row">
              <span>Shipping</span>
              <span>
                {totals.shipping === 0 ? (
                  <em style={{ color: 'var(--success)' }}>Free</em>
                ) : (
                  formatPrice(totals.shipping)
                )}
              </span>
            </div>
            <div className="cart__row cart__row--total">
              <span>Total</span>
              <span>{formatPrice(totals.total)}</span>
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <FaArrowRight />
            </button>
            <Link to="/products" className="cart__continue">
              Continue Shopping
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
