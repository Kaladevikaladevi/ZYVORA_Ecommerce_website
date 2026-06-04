import { Link } from 'react-router-dom';
import {
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaPinterestP,
} from 'react-icons/fa';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <h2>ZYVORA</h2>
          <p>
            Where luxury meets elegance. Curated premium products crafted for
            those with refined taste.
          </p>
          <div className="footer__social">
            <a href="#" aria-label="Instagram"><FaInstagram /></a>
            <a href="#" aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" aria-label="Twitter"><FaTwitter /></a>
            <a href="#" aria-label="Pinterest"><FaPinterestP /></a>
          </div>
        </div>

        <div className="footer__col">
          <h4>Shop</h4>
          <Link to="/products">All Products</Link>
          <Link to="/category/watches">Watches</Link>
          <Link to="/category/fashion">Fashion</Link>
          <Link to="/category/beauty">Beauty</Link>
        </div>

        <div className="footer__col">
          <h4>Account</h4>
          <Link to="/profile">My Profile</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart</Link>
        </div>

        <div className="footer__col">
          <h4>Support</h4>
          <a href="#">Shipping & Returns</a>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </div>

      <div className="footer__bottom container">
        <span>© {new Date().getFullYear()} Zyvora. All rights reserved.</span>
        <span>Crafted with passion for luxury.</span>
      </div>
    </footer>
  );
}
