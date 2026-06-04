import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import SectionHeader from '../ui/SectionHeader';
import ProductGrid from '../product/ProductGrid';

// Home-page band: heading + product grid + "view all" link.
export default function ProductSection({
  eyebrow,
  title,
  text,
  products,
  loading,
  viewAll,
  tone = 'light',
}) {
  return (
    <section
      className="section"
      style={tone === 'mist' ? { background: 'var(--ivory)' } : undefined}
    >
      <div className="container">
        <SectionHeader eyebrow={eyebrow} title={title} text={text} />
        <ProductGrid products={products} loading={loading} skeletonCount={4} />
        {viewAll && !loading && products?.length > 0 && (
          <div className="text-center" style={{ marginTop: 40 }}>
            <Link to={viewAll} className="btn btn-outline">
              View All <FaArrowRight />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
