import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  FaRupeeSign,
  FaShoppingCart,
  FaUsers,
  FaBoxOpen,
  FaExclamationTriangle,
} from 'react-icons/fa';

import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import StatusBadge from '../../components/ui/StatusBadge';
import { formatPrice, formatDate } from '../../utils/helpers';
import './admin.css';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/stats')
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <p className="adm-empty">Failed to load dashboard.</p>;

  const { stats, monthly, recentOrders, lowStock } = data;

  const cards = [
    { label: 'Total Sales', value: formatPrice(stats.totalSales), icon: <FaRupeeSign />, tone: 'g' },
    { label: 'Total Orders', value: stats.totalOrders, icon: <FaShoppingCart />, tone: 'p' },
    { label: 'Total Users', value: stats.totalUsers, icon: <FaUsers />, tone: 'b' },
    { label: 'Total Products', value: stats.totalProducts, icon: <FaBoxOpen />, tone: 'r' },
  ];

  return (
    <div>
      <div className="adm-head">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back — here's how Zyvora is performing.</p>
        </div>
      </div>

      <div className="adm-cards">
        {cards.map((c) => (
          <div className="adm-card" key={c.label}>
            <div className={`adm-card__icon adm-card__icon--${c.tone}`}>{c.icon}</div>
            <div>
              <div className="adm-card__val">{c.value}</div>
              <div className="adm-card__label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-charts">
        <div className="adm-panel">
          <h3>Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4F0341" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#4F0341" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e6ee" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#7c6f78' }} />
              <YAxis tick={{ fontSize: 12, fill: '#7c6f78' }} />
              <Tooltip formatter={(v) => formatPrice(v)} />
              <Area type="monotone" dataKey="revenue" stroke="#4F0341" strokeWidth={2.5} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="adm-panel">
          <h3>Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e6ee" />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#7c6f78' }} />
              <YAxis tick={{ fontSize: 12, fill: '#7c6f78' }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#A53F8C" radius={[6, 6, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="adm-charts" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        {/* Recent orders */}
        <div className="adm-table-wrap">
          <div className="adm-panel" style={{ border: 'none', boxShadow: 'none', paddingBottom: 0 }}>
            <h3>Recent Orders</h3>
          </div>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <Link to={`/orders/${o.orderId}`} style={{ color: 'var(--tyrian)', fontWeight: 600 }}>
                      {o.orderId}
                    </Link>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{formatDate(o.createdAt)}</div>
                  </td>
                  <td>{o.user?.name || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{formatPrice(o.totalPrice)}</td>
                  <td><StatusBadge status={o.orderStatus} /></td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr><td colSpan={4} className="adm-empty">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Low stock */}
        <div className="adm-panel">
          <h3><FaExclamationTriangle style={{ color: 'var(--warning)', marginRight: 8 }} />Low Stock Alert</h3>
          {lowStock.length === 0 ? (
            <p className="muted">All products are well stocked. 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {lowStock.map((p) => (
                <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <img src={p.images?.[0]?.url} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                  </div>
                  <span className="badge" style={{ background: '#fdf3e2', color: 'var(--warning)' }}>
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
