import { useSelector } from 'react-redux';
import { FaHeart } from 'react-icons/fa';

import Meta from '../components/ui/Meta';
import EmptyState from '../components/ui/EmptyState';
import ProductGrid from '../components/product/ProductGrid';

export default function Wishlist() {
  const { products } = useSelector((s) => s.wishlist);

  if (products.length === 0) {
    return (
      <div className="page-pad">
        <Meta title="Your Wishlist" />
        <EmptyState
          icon={<FaHeart />}
          title="Your wishlist is empty"
          text="Save the pieces you love and find them all here."
          ctaLabel="Explore Products"
          ctaTo="/products"
        />
      </div>
    );
  }

  return (
    <div className="page-pad">
      <Meta title="Your Wishlist" />
      <div className="container">
        <h1 style={{ color: 'var(--tyrian)', fontSize: 'clamp(28px,4vw,40px)', marginBottom: 28 }}>
          My Wishlist
        </h1>
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
