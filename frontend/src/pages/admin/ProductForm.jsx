import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTimes, FaCloudUploadAlt, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import './admin.css';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const editing = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    stock: '',
    category: '',
    brand: 'Zyvora',
    featuredToHome: false,
  });
  const [existingImages, setExistingImages] = useState([]); // {url, public_id}
  const [removeImages, setRemoveImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]); // File[]

  useEffect(() => {
    api.get('/categories').then((r) => setCategories(r.data.categories));
  }, []);

  useEffect(() => {
    if (!editing) return;
    api
      .get(`/products/${id}`)
      .then((r) => {
        const p = r.data.product;
        setForm({
          name: p.name,
          description: p.description,
          price: p.price,
          discountPrice: p.discountPrice || '',
          stock: p.stock,
          category: p.category?._id || '',
          brand: p.brand,
          featuredToHome: p.featuredToHome,
        });
        setExistingImages(p.images);
      })
      .finally(() => setLoading(false));
  }, [editing, id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const addFiles = (e) => {
    const files = Array.from(e.target.files);
    const total = existingImages.length - removeImages.length + newFiles.length + files.length;
    if (total > 6) {
      toast.error('Maximum 6 images allowed');
      return;
    }
    setNewFiles((prev) => [...prev, ...files]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.category) return toast.error('Please select a category');
    const totalImages = existingImages.length - removeImages.length + newFiles.length;
    if (totalImages === 0) return toast.error('At least one image is required');

    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      removeImages.forEach((pid) => fd.append('removeImages', pid));
      newFiles.forEach((file) => fd.append('images', file));

      if (editing) {
        await api.put(`/products/${id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated');
      } else {
        await api.post('/products', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  const visibleExisting = existingImages.filter(
    (img) => !removeImages.includes(img.public_id)
  );

  return (
    <div>
      <div className="adm-head">
        <div>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/admin/products')}>
            <FaArrowLeft /> Back
          </button>
          <h1>{editing ? 'Edit Product' : 'Add Product'}</h1>
        </div>
      </div>

      <form className="adm-form" onSubmit={submit}>
        <div className="adm-form__grid">
          <div className="field adm-form__full">
            <label>Product Name *</label>
            <input className="input" name="name" value={form.name} onChange={onChange} required />
          </div>

          <div className="field adm-form__full">
            <label>Description *</label>
            <textarea className="textarea" name="description" value={form.description} onChange={onChange} required />
          </div>

          <div className="field">
            <label>Price (₹) *</label>
            <input className="input" type="number" name="price" value={form.price} onChange={onChange} min="0" required />
          </div>
          <div className="field">
            <label>Discount Price (₹)</label>
            <input className="input" type="number" name="discountPrice" value={form.discountPrice} onChange={onChange} min="0" placeholder="0 = no discount" />
          </div>
          <div className="field">
            <label>Stock *</label>
            <input className="input" type="number" name="stock" value={form.stock} onChange={onChange} min="0" required />
          </div>
          <div className="field">
            <label>Brand</label>
            <input className="input" name="brand" value={form.brand} onChange={onChange} />
          </div>
          <div className="field adm-form__full">
            <label>Category *</label>
            <select className="select" name="category" value={form.category} onChange={onChange} required>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Images */}
          <div className="field adm-form__full">
            <label>Product Images * (max 6)</label>
            <label className="adm-dropzone">
              <FaCloudUploadAlt size={28} style={{ marginBottom: 8 }} />
              <div>Click to upload images</div>
              <input type="file" accept="image/*" multiple hidden onChange={addFiles} />
            </label>

            <div className="adm-uploads">
              {visibleExisting.map((img) => (
                <div className="adm-upload-thumb" key={img.public_id}>
                  <img src={img.url} alt="" />
                  <button type="button" onClick={() => setRemoveImages((r) => [...r, img.public_id])}>
                    <FaTimes />
                  </button>
                </div>
              ))}
              {newFiles.map((file, i) => (
                <div className="adm-upload-thumb" key={i}>
                  <img src={URL.createObjectURL(file)} alt="" />
                  <button type="button" onClick={() => setNewFiles((f) => f.filter((_, idx) => idx !== i))}>
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="field adm-form__full">
            <label className="adm-checkbox">
              <input type="checkbox" name="featuredToHome" checked={form.featuredToHome} onChange={onChange} />
              <span>
                <strong>Feature To Home</strong> — show this product in the Featured Products section on the home page.
              </span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : editing ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/products')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
