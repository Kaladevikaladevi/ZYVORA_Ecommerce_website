import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import { FaFilter, FaTimes } from 'react-icons/fa';

import api from '../services/api';
import Meta from '../components/ui/Meta';
import ProductGrid from '../components/product/ProductGrid';
import Pagination from '../components/ui/Pagination';
import './ProductList.css';

const SORTS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Top Rated' },
  { value: 'best-selling', label: 'Best Selling' },
];

export default function ProductList() {
  const { slug } = useParams(); // category route
  const [params, setParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, total: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Local filter state mirrors the URL.
  const [priceRange, setPriceRange] = useState({
    min: params.get('minPrice') || '',
    max: params.get('maxPrice') || '',
  });

  const keyword = params.get('keyword') || '';
  const sort = params.get('sort') || 'newest';
  const page = Number(params.get('page')) || 1;
  const activeCategory = params.get('category') || '';

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.categories));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (keyword) query.set('keyword', keyword);
      if (sort) query.set('sort', sort);
      query.set('page', page);
      query.set('limit', 12);
      if (priceRange.min) query.set('minPrice', priceRange.min);
      if (priceRange.max) query.set('maxPrice', priceRange.max);

      // Category can come from the /category/:slug route or a filter param.
      let categoryId = activeCategory;
      if (slug) {
        const match = categories.find((c) => c.slug === slug);
        if (match) categoryId = match._id;
      }
      if (categoryId) query.set('category', categoryId);

      const { data } = await api.get(`/products?${query.toString()}`);
      setProducts(data.products);
      setMeta({ page: data.page, pages: data.pages, total: data.total });
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword, sort, page, slug, activeCategory, categories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page'); // reset paging on filter change
    setParams(next);
  };

  const applyPrice = () => {
    const next = new URLSearchParams(params);
    if (priceRange.min) next.set('minPrice', priceRange.min);
    else next.delete('minPrice');
    if (priceRange.max) next.set('maxPrice', priceRange.max);
    else next.delete('maxPrice');
    next.delete('page');
    setParams(next);
    setShowFilters(false);
  };

  const clearAll = () => {
    setPriceRange({ min: '', max: '' });
    setParams(slug ? {} : {});
  };

  const heading = slug
    ? categories.find((c) => c.slug === slug)?.name || 'Collection'
    : keyword
    ? `Results for "${keyword}"`
    : 'All Products';

  return (
    <div className="page-pad">
      <Meta title={`${heading} — Zyvora`} />

      <div className="plist-hero">
        <div className="container">
          <span className="eyebrow" style={{ color: 'var(--gold-soft)' }}>
            The Collection
          </span>
          <h1>{heading}</h1>
          <p>{meta.total} luxury {meta.total === 1 ? 'piece' : 'pieces'} available</p>
        </div>
      </div>

      <div className="container plist">
        {/* Filters */}
        <aside className={`plist__filters ${showFilters ? 'is-open' : ''}`}>
          <div className="plist__filters-head">
            <h3>Filters</h3>
            <button onClick={() => setShowFilters(false)} aria-label="Close">
              <FaTimes />
            </button>
          </div>

          <div className="filter-group">
            <h4>Categories</h4>
            <button
              className={`filter-chip ${!activeCategory && !slug ? 'is-active' : ''}`}
              onClick={() => updateParam('category', '')}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c._id}
                className={`filter-chip ${
                  activeCategory === c._id || slug === c.slug ? 'is-active' : ''
                }`}
                onClick={() => updateParam('category', c._id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <h4>Price Range</h4>
            <div className="filter-price">
              <input
                className="input"
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange((p) => ({ ...p, min: e.target.value }))
                }
              />
              <span>—</span>
              <input
                className="input"
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange((p) => ({ ...p, max: e.target.value }))
                }
              />
            </div>
            <button className="btn btn-primary btn-sm btn-block" onClick={applyPrice}>
              Apply
            </button>
          </div>

          <button className="btn btn-ghost btn-sm" onClick={clearAll}>
            Clear all filters
          </button>
        </aside>

        {/* Results */}
        <div className="plist__results">
          <div className="plist__toolbar">
            <button
              className="plist__filter-btn"
              onClick={() => setShowFilters(true)}
            >
              <FaFilter /> Filters
            </button>
            <div className="spacer" />
            <label className="plist__sort">
              Sort:
              <select
                className="select"
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <ProductGrid products={products} loading={loading} skeletonCount={9} />
          <Pagination
            page={meta.page}
            pages={meta.pages}
            onChange={(p) => updateParam('page', p)}
          />
        </div>
      </div>

      {showFilters && (
        <div className="plist__overlay" onClick={() => setShowFilters(false)} />
      )}
    </div>
  );
}
