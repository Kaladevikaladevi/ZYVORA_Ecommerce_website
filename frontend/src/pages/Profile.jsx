import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FaCamera, FaUser, FaLock, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

import api from '../services/api';
import Meta from '../components/ui/Meta';
import { setUser } from '../redux/slices/authSlice';
import './Profile.css';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const fileRef = useRef();

  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    line1: user?.address?.line1 || '',
    line2: user?.address?.line2 || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'India',
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', {
        name: profile.name,
        phone: profile.phone,
        address: {
          line1: profile.line1,
          line2: profile.line2,
          city: profile.city,
          state: profile.state,
          postalCode: profile.postalCode,
          country: profile.country,
        },
      });
      dispatch(setUser(data.user));
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await api.put('/users/change-password', {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      toast.success('Password changed');
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await api.put('/users/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      dispatch(setUser({ ...user, avatar: data.avatar }));
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="page-pad">
      <Meta title="My Profile" />
      <div className="container">
        <h1 className="profile__title">My Account</h1>

        <div className="profile">
          {/* Sidebar */}
          <aside className="profile__side surface">
            <div className="profile__avatar">
              {user?.avatar?.url ? (
                <img src={user.avatar.url} alt={user.name} />
              ) : (
                <div className="profile__avatar-fallback">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <button onClick={() => fileRef.current.click()} aria-label="Change photo">
                <FaCamera />
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={uploadAvatar} />
            </div>
            <h3>{user?.name}</h3>
            <span className="muted">{user?.email}</span>

            <nav className="profile__tabs">
              <button className={tab === 'profile' ? 'is-active' : ''} onClick={() => setTab('profile')}>
                <FaUser /> Profile
              </button>
              <button className={tab === 'address' ? 'is-active' : ''} onClick={() => setTab('address')}>
                <FaMapMarkerAlt /> Address
              </button>
              <button className={tab === 'password' ? 'is-active' : ''} onClick={() => setTab('password')}>
                <FaLock /> Password
              </button>
            </nav>
          </aside>

          {/* Content */}
          <div className="profile__content surface">
            {tab === 'profile' && (
              <form onSubmit={saveProfile}>
                <h3>Personal Information</h3>
                <div className="field">
                  <label>Full Name</label>
                  <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input className="input" value={user?.email} disabled />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </form>
            )}

            {tab === 'address' && (
              <form onSubmit={saveProfile}>
                <h3>Shipping Address</h3>
                <div className="field">
                  <label>Address Line 1</label>
                  <input className="input" value={profile.line1} onChange={(e) => setProfile({ ...profile, line1: e.target.value })} />
                </div>
                <div className="field">
                  <label>Address Line 2</label>
                  <input className="input" value={profile.line2} onChange={(e) => setProfile({ ...profile, line2: e.target.value })} />
                </div>
                <div className="profile__grid">
                  <div className="field">
                    <label>City</label>
                    <input className="input" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>State</label>
                    <input className="input" value={profile.state} onChange={(e) => setProfile({ ...profile, state: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Postal Code</label>
                    <input className="input" value={profile.postalCode} onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Country</label>
                    <input className="input" value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })} />
                  </div>
                </div>
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save Address'}
                </button>
              </form>
            )}

            {tab === 'password' && (
              <form onSubmit={changePassword}>
                <h3>Change Password</h3>
                <div className="field">
                  <label>Current Password</label>
                  <input className="input" type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
                </div>
                <div className="field">
                  <label>New Password</label>
                  <input className="input" type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required />
                </div>
                <div className="field">
                  <label>Confirm New Password</label>
                  <input className="input" type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
                </div>
                <button className="btn btn-primary" disabled={saving}>
                  {saving ? 'Updating…' : 'Update Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
