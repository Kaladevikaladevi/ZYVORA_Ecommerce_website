import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import Meta from '../../components/ui/Meta';
import AuthAside from './AuthAside';
import { login, clearError } from '../../redux/slices/authSlice';
import './Auth.css';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading, error } = useSelector((s) => s.auth);

  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);

  const from = location.state?.from || '/';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  // FIXED cleanup
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const submit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  return (
    <div className="auth">
      <Meta title="Login" />

      <AuthAside
        title={<>Welcome back to <em>luxury</em></>}
        text="Sign in to continue your journey through the world of Zyvora."
      />

      <div className="auth__form-wrap">
        <form className="auth__form" onSubmit={submit}>
          <h1>Sign In</h1>
          <p>Enter your credentials to access your account.</p>

          {error && <div className="auth__error">{error}</div>}

          <div className="field">
            <label>Email Address</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              required
            />
          </div>

          <div className="field auth__pw">
            <label>Password</label>
            <input
              type={show ? 'text' : 'password'}
              className="input"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              required
            />
            <button type="button" onClick={() => setShow((s) => !s)}>
              {show ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="auth__row">
            <span />
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p className="auth__alt">
            New to Zyvora? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  );
}