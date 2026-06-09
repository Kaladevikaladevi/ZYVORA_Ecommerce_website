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

  // separate toggles (FIXED)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // proper cleanup (FIXED)
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const submit = (e) => {
    e.preventDefault();

    if (form.password.length < 6)
      return toast.error('Password must be at least 6 characters');

    if (form.password !== form.confirm)
      return toast.error('Passwords do not match');

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
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label>Email Address</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="field">
            <label>Phone Number</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          {/* PASSWORD */}
          <div className="field auth__pw">
            <label>Password</label>
            <input
              className="input"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />
            <button type="button" onClick={() => setShowPassword((s) => !s)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="field auth__pw">
            <label>Confirm Password</label>
            <input
              className="input"
              type={showConfirm ? 'text' : 'password'}
              value={form.confirm}
              onChange={(e) =>
                setForm({ ...form, confirm: e.target.value })
              }
              required
            />
            <button type="button" onClick={() => setShowConfirm((s) => !s)}>
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button className="btn btn-primary btn-block" disabled={loading}>
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