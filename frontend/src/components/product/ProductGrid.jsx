import ProductCard from './ProductCard';

// Renders a responsive grid of products, with a skeleton + empty state.
export default function ProductGrid({ products = [], loading, skeletonCount = 8 }) {
  if (loading) {
    return (
      <div className="products-grid">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div key={i} className="surface" style={{ overflow: 'hidden' }}>
            <div className="skeleton" style={{ aspectRatio: '1 / 1.08' }} />
            <div style={{ padding: 16, display: 'grid', gap: 10 }}>
              <div className="skeleton" style={{ height: 12, width: '40%' }} />
              <div className="skeleton" style={{ height: 18, width: '85%' }} />
              <div className="skeleton" style={{ height: 18, width: '50%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="text-center" style={{ padding: '60px 0', color: 'var(--muted)' }}>
        <p style={{ fontFamily: 'var(--font-serif)', fontSize: 22 }}>
          No products found
        </p>
        <p>Try adjusting your filters or search.</p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  );
}
