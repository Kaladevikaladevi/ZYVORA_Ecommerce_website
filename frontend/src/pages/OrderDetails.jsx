import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCheck, FaTimesCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

import api from '../services/api';
import Meta from '../components/ui/Meta';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { formatPrice, formatDate } from '../utils/helpers';
import './OrderDetails.css';

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(false);

  const load = () =>
    api
      .get(`/orders/${orderId}`)
      .then((r) => setOrder(r.data.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const cancelOrder = async () => {
    setConfirm(false);
    try {
      await api.put(`/orders/${order._id}/cancel`);
      toast.success('Order cancelled');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="page-pad"><Spinner /></div>;
  if (!order) {
    return (
      <div className="page-pad container text-center">
        <h2 style={{ color: 'var(--tyrian)' }}>Order not found</h2>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: 20 }}>
          My Orders
        </Link>
      </div>
    );
  }

  const cancellable = !['Shipping', 'Delivered', 'Cancelled'].includes(
    order.orderStatus
  );
  const isCancelled = order.orderStatus === 'Cancelled';

  return (
    <div className="page-pad">
      <Meta title={`Order ${order.orderId}`} />
      <div className="container">
        <div className="od__head">
          <div>
            <Link to="/orders" className="od__back">← My Orders</Link>
            <h1>{order.orderId}</h1>
            <span className="muted">Placed on {formatDate(order.createdAt)}</span>
          </div>
          <StatusBadge status={order.orderStatus} />
        </div>

        <div className="od">
          <div className="od__main">
            {/* Tracking timeline */}
            <section className="od__card surface">
              <h3>Order Tracking</h3>
              {isCancelled ? (
                <div className="od__cancelled">
                  <FaTimesCircle />
                  <div>
                    <strong>This order was cancelled</strong>
                    <span className="muted">
                      {order.cancelledAt && formatDate(order.cancelledAt)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="timeline">
                  {order.tracking.map((step, i) => (
                    <div
                      key={i}
                      className={`timeline__step ${step.completed ? 'is-done' : ''}`}
                    >
                      <div className="timeline__dot">
                        {step.completed && <FaCheck />}
                      </div>
                      <div className="timeline__content">
                        <strong>{step.status}</strong>
                        {step.date && (
                          <span className="muted">{formatDate(step.date)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Items */}
            <section className="od__card surface">
              <h3>Order Items</h3>
              <div className="od__items">
                {order.items.map((it, i) => (
                  <div className="od__item" key={i}>
                    <img src={it.image} alt={it.name} />
                    <div className="od__item-info">
                      <Link to={`/products/${it.product}`}>
                        <strong>{it.name}</strong>
                      </Link>
                      <span className="muted">Qty: {it.quantity}</span>
                    </div>
                    <span className="od__item-price">
                      {formatPrice(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="od__side">
            <section className="od__card surface">
              <h3>Summary</h3>
              <div className="od__row"><span>Subtotal</span><span>{formatPrice(order.itemsPrice)}</span></div>
              <div className="od__row"><span>Tax</span><span>{formatPrice(order.taxPrice)}</span></div>
              <div className="od__row"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}</span></div>
              <div className="od__row od__row--total"><span>Total</span><span>{formatPrice(order.totalPrice)}</span></div>
              <div className="od__pay">
                <span>Payment</span>
                <div>
                  <strong>{order.paymentMethod}</strong>
                  <StatusBadge status={order.paymentStatus} />
                </div>
              </div>
            </section>

            <section className="od__card surface">
              <h3><FaMapMarkerAlt /> Shipping Address</h3>
              <p className="od__address">
                <strong>{order.shippingAddress.fullName}</strong><br />
                {order.shippingAddress.line1}<br />
                {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}<br />
                📞 {order.shippingAddress.phone}
              </p>
            </section>

            {cancellable && (
              <button className="btn btn-outline btn-block" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => setConfirm(true)}>
                Cancel Order
              </button>
            )}
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        title="Cancel this order?"
        message="This action cannot be undone. Your items will be restocked."
        confirmLabel="Yes, Cancel"
        onConfirm={cancelOrder}
        onCancel={() => setConfirm(false)}
      />
    </div>
  );
}
