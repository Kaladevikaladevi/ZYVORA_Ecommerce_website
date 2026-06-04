import { useEffect, useState, useCallback } from 'react';
import { FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';

import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatPrice, formatDate } from '../../utils/helpers';
import './admin.css';

const STATUSES = [
  'Pending',
  'Confirmed',
  'Processing',
  'Shipping',
  'Delivered',
  'Cancelled',
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/orders?keyword=${keyword}&status=${status}&page=${page}&limit=12`
      );
      setOrders(data.orders);
      setMeta({ page: data.page, pages: data.pages });
    } finally {
      setLoading(false);
    }
  }, [keyword, status, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const changeStatus = async (order, newStatus) => {
    setUpdating(order._id);
    try {
      await api.put(`/orders/${order._id}/status`, { status: newStatus });
      toast.success(`Order marked ${newStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o._id === order._id ? { ...o, orderStatus: newStatus } : o))
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <div className="adm-head">
        <div>
          <h1>Orders</h1>
          <p>Track and fulfil customer orders. Status changes notify customers automatically.</p>
        </div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-search">
          <FaSearch />
          <input
            placeholder="Search by Order ID…"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <select
          className="select adm-filter-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="all">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontWeight: 600, color: 'var(--tyrian)' }}>{o.orderId}</td>
                  <td>
                    {o.user?.name || '—'}
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{o.user?.email}</div>
                  </td>
                  <td className="muted">{formatDate(o.createdAt)}</td>
                  <td style={{ fontWeight: 600 }}>{formatPrice(o.totalPrice)}</td>
                  <td><StatusBadge status={o.orderStatus} /></td>
                  <td>
                    <select
                      className="select"
                      style={{ padding: '8px 10px', minWidth: 130 }}
                      value={o.orderStatus}
                      disabled={updating === o._id || o.orderStatus === 'Cancelled'}
                      onChange={(e) => changeStatus(o, e.target.value)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="adm-empty">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />
    </div>
  );
}
