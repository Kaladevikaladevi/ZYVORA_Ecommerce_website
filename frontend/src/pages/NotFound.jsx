import { Link } from 'react-router-dom';
import Meta from '../components/ui/Meta';

export default function NotFound() {
  return (
    <div className="page-pad container text-center" style={{ display: 'grid', placeItems: 'center' }}>
      <Meta title="Page Not Found" />
      <div>
        <h1 style={{ fontSize: 'clamp(80px, 16vw, 160px)', color: 'var(--tyrian)', lineHeight: 1 }}>
          404
        </h1>
        <h2 style={{ color: 'var(--ink)', marginBottom: 12 }}>Page Not Found</h2>
        <p className="muted" style={{ marginBottom: 26 }}>
          The page you're looking for has wandered off into luxury.
        </p>
        <Link to="/" className="btn btn-primary">Return Home</Link>
      </div>
    </div>
  );
}
