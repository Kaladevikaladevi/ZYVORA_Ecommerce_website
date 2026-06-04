import { FaShippingFast, FaLock, FaUndo, FaHeadset } from 'react-icons/fa';
import './TrustBar.css';

const ITEMS = [
  { icon: <FaShippingFast />, title: 'Free Shipping', text: 'On orders over ₹2,000' },
  { icon: <FaLock />, title: 'Secure Checkout', text: '100% protected payments' },
  { icon: <FaUndo />, title: 'Easy Returns', text: '7-day return policy' },
  { icon: <FaHeadset />, title: 'Premium Support', text: 'Dedicated concierge' },
];

export default function TrustBar() {
  return (
    <div className="trustbar">
      <div className="container trustbar__grid">
        {ITEMS.map((it) => (
          <div className="trustbar__item" key={it.title}>
            <span className="trustbar__icon">{it.icon}</span>
            <div>
              <strong>{it.title}</strong>
              <span>{it.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
