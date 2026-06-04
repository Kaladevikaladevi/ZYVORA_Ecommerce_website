import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBoxOpen, FaChevronRight } from 'react-icons/fa';

import api from '../services/api';
import Meta from '../components/ui/Meta';
import EmptyState from '../components/ui/EmptyState';
import StatusBadge from '../components/ui/StatusBadge';
import Spinner from '../components/ui/Spinner';
import { formatPrice, formatDate } from '../utils/helpers';
import './Orders.css';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders/my')
      .then((r) => setOrders(r.data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-pad"><Spinner /></div>;

  if (orders.length === 0) {
    return (
      <div className="page-pad">
        <Meta title="My Orders" />
        <EmptyState
          icon={<FaBoxOpen />}
          title="No orders yet"
          text="When you place an order, it will appear here for tracking."
          ctaLabel="Start Shopping"
          ctaTo="/products"
        />
      </div>
    );
  }

  return (
    <div className="page-pad">
      <Meta title="My Orders" />
      <div className="container">
        <h1 className="orders__title">My Orders</h1>

        <div className="orders__list">
          {orders.map((o) => (
            <Link to={`/orders/${o.orderId}`} key={o._id} className="order-row">
              <div className="order-row__main">
                <div className="order-row__imgs">
                  {o.items.slice(0, 3).map((it, i) => (
                    <img key={i} src={it.image} alt={it.name} />
                  ))}
                  {o.items.length > 3 && (
                    <span className="order-row__more">+{o.items.length - 3}</span>
                  )}
                </div>
                <div className="order-row__info">
                  <strong>{o.orderId}</strong>
                  <span className="muted">
                    {o.items.length} item{o.items.length > 1 ? 's' : ''} •{' '}
                    {formatDate(o.createdAt)}
                  </span>
                </div>
              </div>
              <div className="order-row__meta">
                <StatusBadge status={o.orderStatus} />
                <span className="order-row__total">{formatPrice(o.totalPrice)}</span>
                <FaChevronRight className="order-row__chev" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
