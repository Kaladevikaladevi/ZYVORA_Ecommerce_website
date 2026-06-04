import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import api from '../../services/api';
import Meta from '../../components/ui/Meta';
import AuthAside from './AuthAside';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent if the email exists');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth">
      <Meta title="Forgot Password" />
      <AuthAside
        title={<>Recover your <em>access</em></>}
        text="We'll help you get back into your account in no time."
      />
      <div className="auth__form-wrap">
        <form className="auth__form" onSubmit={submit}>
          <h1>Forgot Password</h1>
          <p>Enter your email and we'll send you a reset link.</p>

          {sent ? (
            <div className="auth__error" style={{ background: 'var(--mist)', color: 'var(--success)' }}>
              If an account exists for <strong>{email}</strong>, a reset link is on its way.
              Please check your inbox.
            </div>
          ) : (
            <>
              <div className="field">
                <label>Email Address</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button className="btn btn-primary btn-block" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </>
          )}

          <p className="auth__alt">
            Remembered it? <Link to="/login">Back to sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
