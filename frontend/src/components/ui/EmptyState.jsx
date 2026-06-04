import { Link } from 'react-router-dom';

// Centered empty/CTA state used across cart, wishlist, orders, etc.
export default function EmptyState({ icon, title, text, ctaLabel, ctaTo }) {
  return (
    <div
      className="text-center"
      style={{ padding: '80px 20px', maxWidth: 460, margin: '0 auto' }}
    >
      {icon && (
        <div style={{ fontSize: 56, color: 'var(--accent-3)', marginBottom: 18 }}>
          {icon}
        </div>
      )}
      <h2 style={{ color: 'var(--tyrian)', fontSize: 28, marginBottom: 10 }}>
        {title}
      </h2>
      {text && <p className="muted" style={{ marginBottom: 24 }}>{text}</p>}
      {ctaLabel && ctaTo && (
        <Link to={ctaTo} className="btn btn-primary">
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
