import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { FaLock, FaMoneyBillWave } from 'react-icons/fa';
import { toast } from 'react-toastify';

import api from '../services/api';
import Meta from '../components/ui/Meta';
import EmptyState from '../components/ui/EmptyState';
import { fetchCart, selectCartSubtotal } from '../redux/slices/cartSlice';
import { formatPrice, effectivePrice, computeTotals } from '../utils/helpers';
import './Checkout.css';

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const subtotal = useSelector(selectCartSubtotal);
  const totals = computeTotals(subtotal);

  const [form, setForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    line1: user?.address?.line1 || '',
    line2: user?.address?.line2 || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'India',
  });
  const [placing, setPlacing] = useState(false);

  if (items.length === 0) {
    return (
      <div className="page-pad">
        <Meta title="Checkout" />
        <EmptyState
          title="Nothing to check out"
          text="Your cart is empty. Add some products first."
          ctaLabel="Browse Products"
          ctaTo="/products"
        />
      </div>
    );
  }

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const placeOrder = async (e) => {
    e.preventDefault();
    const required = ['fullName', 'phone', 'line1', 'city', 'state', 'postalCode'];
    for (const key of required) {
      if (!form[key].trim()) return toast.error('Please complete all required fields');
    }
    if (!/^\d{10}$/.test(form.phone.replace(/\D/g, '').slice(-10))) {
      return toast.error('Please enter a valid phone number');
    }

    setPlacing(true);
    try {
      const payload = {
        items: items.map((i) => ({ product: i.product._id, quantity: i.quantity })),
        shippingAddress: form,
      };
      const { data } = await api.post('/orders', payload);
      dispatch(fetchCart());
      toast.success('Order placed successfully! 🎉');
      navigate(`/orders/${data.order.orderId}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="page-pad">
      <Meta title="Checkout" />
      <div className="container">
        <h1 className="checkout__title">Checkout</h1>

        <form className="checkout" onSubmit={placeOrder}>
          <div className="checkout__main">
            {/* Shipping */}
            <section className="checkout__card surface">
              <h3>Shipping Address</h3>
              <div className="checkout__grid">
                <div className="field">
                  <label>Full Name *</label>
                  <input className="input" name="fullName" value={form.fullName} onChange={onChange} />
                </div>
                <div className="field">
                  <label>Phone *</label>
                  <input className="input" name="phone" value={form.phone} onChange={onChange} />
                </div>
                <div className="field checkout__full">
                  <label>Address Line 1 *</label>
                  <input className="input" name="line1" value={form.line1} onChange={onChange} placeholder="House no, street" />
                </div>
                <div className="field checkout__full">
                  <label>Address Line 2</label>
                  <input className="input" name="line2" value={form.line2} onChange={onChange} placeholder="Apartment, landmark (optional)" />
                </div>
                <div className="field">
                  <label>City *</label>
                  <input className="input" name="city" value={form.city} onChange={onChange} />
                </div>
                <div className="field">
                  <label>State *</label>
                  <input className="input" name="state" value={form.state} onChange={onChange} />
                </div>
                <div className="field">
                  <label>Postal Code *</label>
                  <input className="input" name="postalCode" value={form.postalCode} onChange={onChange} />
                </div>
                <div className="field">
                  <label>Country</label>
                  <input className="input" name="country" value={form.country} onChange={onChange} />
                </div>
              </div>
            </section>

            {/* Payment */}
            <section className="checkout__card surface">
              <h3>Payment Method</h3>
              <label className="checkout__pay is-active">
                <input type="radio" name="payment" defaultChecked readOnly />
                <FaMoneyBillWave />
                <div>
                  <strong>Cash on Delivery</strong>
                  <span>Pay with cash when your order arrives.</span>
                </div>
              </label>
            </section>
          </div>

          {/* Summary */}
          <aside className="checkout__summary surface">
            <h3>Your Order</h3>
            <div className="checkout__items">
              {items.map((i) => (
                <div className="checkout__item" key={i.product._id}>
                  <img src={i.product.images?.[0]?.url} alt={i.product.name} />
                  <div>
                    <strong>{i.product.name}</strong>
                    <span>Qty: {i.quantity}</span>
                  </div>
                  <span className="checkout__item-price">
                    {formatPrice(effectivePrice(i.product) * i.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="checkout__row"><span>Subtotal</span><span>{formatPrice(totals.subtotal)}</span></div>
            <div className="checkout__row"><span>Tax (5%)</span><span>{formatPrice(totals.tax)}</span></div>
            <div className="checkout__row">
              <span>Shipping</span>
              <span>{totals.shipping === 0 ? <em style={{ color: 'var(--success)' }}>Free</em> : formatPrice(totals.shipping)}</span>
            </div>
            <div className="checkout__row checkout__row--total">
              <span>Total</span><span>{formatPrice(totals.total)}</span>
            </div>

            <button className="btn btn-primary btn-block" disabled={placing}>
              <FaLock /> {placing ? 'Placing Order…' : 'Place Order'}
            </button>
            <Link to="/cart" className="checkout__back">Back to Cart</Link>
          </aside>
        </form>
      </div>
    </div>
  );
}
