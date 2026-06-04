import { useEffect, useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import './admin.css';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | {} | category
  const [form, setForm] = useState({ name: '', description: '' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = () =>
    api
      .get('/categories')
      .then((r) => setCategories(r.data.categories))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm({ name: '', description: '' });
    setFile(null);
    setModal({});
  };
  const openEdit = (c) => {
    setForm({ name: c.name, description: c.description || '' });
    setFile(null);
    setModal(c);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      if (file) fd.append('image', file);

      if (modal._id) {
        await api.put(`/categories/${modal._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Category updated');
      } else {
        await api.post('/categories', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Category created');
      }
      setModal(null);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const id = toDelete._id;
    setToDelete(null);
    try {
      await api.delete(`/categories/${id}`);
      toast.success('Category deleted');
      load();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="adm-head">
        <div>
          <h1>Categories</h1>
          <p>Organize your catalog into collections.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <FaPlus /> Add Category
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div className="adm-table__product">
                      {c.image?.url ? (
                        <img src={c.image.url} alt={c.name} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--mist)', display: 'grid', placeItems: 'center', color: 'var(--tyrian)', fontWeight: 700 }}>
                          {c.name[0]}
                        </div>
                      )}
                      <strong>{c.name}</strong>
                    </div>
                  </td>
                  <td className="muted">{c.slug}</td>
                  <td className="muted" style={{ maxWidth: 280 }}>{c.description || '—'}</td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-icon-btn" onClick={() => openEdit(c)}>
                        <FaEdit />
                      </button>
                      <button className="adm-icon-btn adm-icon-btn--danger" onClick={() => setToDelete(c)}>
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={4} className="adm-empty">No categories yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            className="adm-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModal(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(42,1,35,0.5)', display: 'grid', placeItems: 'center', zIndex: 1000, padding: 20 }}
          >
            <motion.form
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              onSubmit={submit}
              className="surface"
              style={{ width: '100%', maxWidth: 460, padding: 28 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                <h3 style={{ color: 'var(--tyrian)' }}>{modal._id ? 'Edit' : 'Add'} Category</h3>
                <button type="button" onClick={() => setModal(null)} style={{ color: 'var(--muted)' }}><FaTimes /></button>
              </div>
              <div className="field">
                <label>Name *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="field">
                <label>Description</label>
                <textarea className="textarea" style={{ minHeight: 80 }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="field">
                <label>Image</label>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
              </div>
              <button className="btn btn-primary btn-block" disabled={saving}>
                {saving ? 'Saving…' : modal._id ? 'Update' : 'Create'}
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={!!toDelete}
        title="Delete category?"
        message={`"${toDelete?.name}" will be removed. Categories with products cannot be deleted.`}
        confirmLabel="Delete"
        onConfirm={remove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
