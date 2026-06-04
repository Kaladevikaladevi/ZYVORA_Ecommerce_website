import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';

import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatPrice, effectivePrice } from '../../utils/helpers';
import './admin.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/products?keyword=${keyword}&page=${page}&limit=10&sort=newest`
      );
      setProducts(data.products);
      setMeta({ page: data.page, pages: data.pages });
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const remove = async () => {
    const id = toDelete._id;
    setToDelete(null);
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="adm-head">
        <div>
          <h1>Products</h1>
          <p>Manage your luxury catalog.</p>
        </div>
        <Link to="/admin/products/new" className="btn btn-primary">
          <FaPlus /> Add Product
        </Link>
      </div>

      <div className="adm-toolbar">
        <div className="adm-search">
          <FaSearch />
          <input
            placeholder="Search products…"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="adm-table__product">
                      <img src={p.images?.[0]?.url} alt={p.name} />
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td>{p.category?.name || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{formatPrice(effectivePrice(p))}</td>
                  <td>
                    <span style={{ color: p.stock <= 5 ? 'var(--danger)' : 'inherit' }}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    {p.featuredToHome ? (
                      <FaStar style={{ color: 'var(--gold)' }} />
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    <div className="adm-actions">
                      <Link to={`/admin/products/${p._id}/edit`} className="adm-icon-btn">
                        <FaEdit />
                      </Link>
                      <button
                        className="adm-icon-btn adm-icon-btn--danger"
                        onClick={() => setToDelete(p)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className="adm-empty">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />

      <ConfirmDialog
        open={!!toDelete}
        title="Delete product?"
        message={`"${toDelete?.name}" will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
