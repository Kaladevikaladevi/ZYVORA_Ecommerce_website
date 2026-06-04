import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

import Meta from '../../components/ui/Meta';
import AuthAside from './AuthAside';
import { register, clearError } from '../../redux/slices/authSlice';
import './Auth.css';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  });
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  useEffect(() => () => dispatch(clearError()), [dispatch]);

  const submit = (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    const { confirm, ...payload } = form;
    dispatch(register(payload));
  };

  return (
    <div className="auth">
      <Meta title="Create Account" />
      <AuthAside
        title={<>Begin your <em>luxury</em> journey</>}
        text="Create an account to unlock exclusive offers and a personalised experience."
      />
      <div className="auth__form-wrap">
        <form className="auth__form" onSubmit={submit}>
          <h1>Create Account</h1>
          <p>Join the Zyvora circle in seconds.</p>

          {error && <div className="auth__error">{error}</div>}

          <div className="field">
            <label>Full Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" required />
          </div>
          <div className="field">
            <label>Email Address</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
          </div>
          <div className="field">
            <label>Phone Number</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
          </div>
          <div className="field auth__pw">
            <label>Password</label>
            <input className="input" type={show ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" required />
            <button type="button" onClick={() => setShow((s) => !s)}>
              {show ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <input className="input" type={show ? 'text' : 'password'} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Re-enter password" required />
          </div>

          <button className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>

          <p className="auth__alt">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
