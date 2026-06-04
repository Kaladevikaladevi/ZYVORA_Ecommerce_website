import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FaShoppingBag,
  FaHeart,
  FaUser,
  FaSearch,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaBoxOpen,
  FaTachometerAlt,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import { logout } from '../redux/slices/authSlice';
import { resetCart, selectCartCount } from '../redux/slices/cartSlice';
import { resetWishlist } from '../redux/slices/wishlistSlice';
import './Navbar.css';

const links = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Shop' },
  { to: '/category/watches', label: 'Watches' },
  { to: '/category/fashion', label: 'Fashion' },
  { to: '/category/beauty', label: 'Beauty' },
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const wishCount = useSelector((s) => s.wishlist.products.length);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [userMenu, setUserMenu] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?keyword=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(resetCart());
    dispatch(resetWishlist());
    toast.success('Logged out');
    setUserMenu(false);
    navigate('/');
  };

  return (
    <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
      <div className="nav__bar container">
        <button
          className="nav__burger"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
        >
          <FaBars />
        </button>

        <Link to="/" className="nav__logo">
          ZYVORA
        </Link>

        <nav className="nav__links">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `nav__link ${isActive ? 'is-active' : ''}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form className="nav__search" onSubmit={handleSearch}>
          <FaSearch />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search luxury…"
            aria-label="Search products"
          />
        </form>

        <div className="nav__actions">
          <Link to="/wishlist" className="nav__icon" aria-label="Wishlist">
            <FaHeart />
            {wishCount > 0 && <span className="nav__count">{wishCount}</span>}
          </Link>
          <Link to="/cart" className="nav__icon" aria-label="Cart">
            <FaShoppingBag />
            {cartCount > 0 && <span className="nav__count">{cartCount}</span>}
          </Link>

          {user ? (
            <div className="nav__user">
              <button
                className="nav__icon"
                onClick={() => setUserMenu((v) => !v)}
                aria-label="Account"
              >
                {user.avatar?.url ? (
                  <img src={user.avatar.url} alt="" className="nav__avatar" />
                ) : (
                  <FaUser />
                )}
              </button>
              {userMenu && (
                <div className="nav__dropdown" onMouseLeave={() => setUserMenu(false)}>
                  <div className="nav__dropdown-head">
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setUserMenu(false)}>
                      <FaTachometerAlt /> Admin Dashboard
                    </Link>
                  )}
                  <Link to="/profile" onClick={() => setUserMenu(false)}>
                    <FaUser /> My Profile
                  </Link>
                  <Link to="/orders" onClick={() => setUserMenu(false)}>
                    <FaBoxOpen /> My Orders
                  </Link>
                  <button onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm nav__login">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`nav__drawer ${menuOpen ? 'is-open' : ''}`}>
        <div className="nav__drawer-head">
          <span className="nav__logo">ZYVORA</span>
          <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <FaTimes />
          </button>
        </div>
        <form className="nav__search nav__search--mobile" onSubmit={handleSearch}>
          <FaSearch />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search luxury…"
          />
        </form>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className="nav__drawer-link"
            onClick={() => setMenuOpen(false)}
          >
            {l.label}
          </NavLink>
        ))}
        {!user && (
          <Link
            to="/login"
            className="btn btn-primary btn-block"
            style={{ marginTop: 20 }}
            onClick={() => setMenuOpen(false)}
          >
            Login / Register
          </Link>
        )}
      </div>
      {menuOpen && (
        <div className="nav__overlay" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
}
