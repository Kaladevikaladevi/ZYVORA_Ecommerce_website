import { FaCheck } from 'react-icons/fa';

// Shared luxury brand panel shown beside auth forms.
export default function AuthAside({ title, text }) {
  return (
    <div className="auth__aside">
      <div className="logo">ZYVORA</div>
      <h2>{title}</h2>
      <p>{text}</p>
      <ul className="auth__perks">
        <li><FaCheck /> Exclusive member-only offers</li>
        <li><FaCheck /> Faster checkout & order tracking</li>
        <li><FaCheck /> Curated luxury, delivered to your door</li>
      </ul>
    </div>
  );
}
