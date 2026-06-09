import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaTags,
  FaShoppingCart,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaStore,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import { logout } from '../redux/slices/authSlice';
import './AdminLayout.css';

const nav = [
  { to: '/admin', label: 'Dashboard', icon: <FaTachometerAlt />, end: true },
  { to: '/admin/products', label: 'Products', icon: <FaBoxOpen /> },
  { to: '/admin/categories', label: 'Categories', icon: <FaTags /> },
  { to: '/admin/orders', label: 'Orders', icon: <FaShoppingCart /> },
  { to: '/admin/users', label: 'Users', icon: <FaUsers /> },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const [open, setOpen] = useState(false);

  // Auto-close sidebar on route change (for mobile viewports)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div className="admin">
      <aside className={`admin__side ${open ? 'is-open' : ''}`}>
        <div className="admin__brand">
          <Link to="/admin">ZYVORA</Link>
          <span>Admin</span>
          <button className="admin__close-btn" onClick={() => setOpen(false)} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>

        <nav className="admin__nav">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `admin__link ${isActive ? 'is-active' : ''}`
              }
            >
              {n.icon} {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin__side-foot">
          <Link to="/" className="admin__link">
            <FaStore /> View Store
          </Link>
          <button className="admin__link" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {open && <div className="admin__overlay" onClick={() => setOpen(false)} />}

      <div className="admin__main">
        <header className="admin__topbar">
          <button
            className="admin__burger"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            style={{ display: open ? 'none' : 'grid' }}
          >
            <FaBars />
          </button>
          <div className="spacer" />
          <div className="admin__user">
            {user?.avatar?.url ? (
              <img src={user.avatar.url} alt="" />
            ) : (
              <div className="admin__avatar-fallback">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <strong>{user?.name}</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        <div className="admin__content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
