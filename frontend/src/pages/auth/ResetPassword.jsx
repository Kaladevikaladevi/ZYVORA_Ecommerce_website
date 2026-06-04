import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

import api from '../../services/api';
import Meta from '../../components/ui/Meta';
import AuthAside from './AuthAside';
import { setUser } from '../../redux/slices/authSlice';
import './Auth.css';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({ password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await api.put(`/auth/reset-password/${token}`, { password: form.password });
      // Session is established by the backend; refresh our user.
      const me = await api.get('/auth/me');
      dispatch(setUser(me.data.user));
      toast.success('Password reset successful');
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <Meta title="Reset Password" />
      <AuthAside
        title={<>Create a new <em>password</em></>}
        text="Choose a strong password to secure your Zyvora account."
      />
      <div className="auth__form-wrap">
        <form className="auth__form" onSubmit={submit}>
          <h1>Reset Password</h1>
          <p>Enter and confirm your new password below.</p>

          <div className="field auth__pw">
            <label>New Password</label>
            <input
              className="input"
              type={show ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
              required
            />
            <button type="button" onClick={() => setShow((s) => !s)}>
              {show ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <div className="field">
            <label>Confirm Password</label>
            <input
              className="input"
              type={show ? 'text' : 'password'}
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              placeholder="Re-enter password"
              required
            />
          </div>

          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Resetting…' : 'Reset Password'}
          </button>

          <p className="auth__alt">
            <Link to="/login">Back to sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
