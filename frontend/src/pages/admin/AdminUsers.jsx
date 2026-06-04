import { useEffect, useState, useCallback } from 'react';
import { FaSearch, FaBan, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';

import api from '../../services/api';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { formatDate } from '../../utils/helpers';
import './admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pages: 1 });
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toToggle, setToToggle] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/users?keyword=${keyword}&page=${page}&limit=12`
      );
      setUsers(data.users);
      setMeta({ page: data.page, pages: data.pages });
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const toggleBlock = async () => {
    const u = toToggle;
    setToToggle(null);
    try {
      const { data } = await api.put(`/users/${u._id}/block`);
      toast.success(data.message);
      setUsers((prev) =>
        prev.map((x) => (x._id === u._id ? { ...x, isBlocked: data.isBlocked } : x))
      );
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div>
      <div className="adm-head">
        <div>
          <h1>Users</h1>
          <p>Manage your customers.</p>
        </div>
      </div>

      <div className="adm-toolbar">
        <div className="adm-search">
          <FaSearch />
          <input
            placeholder="Search by name or email…"
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
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="adm-table__product">
                      {u.avatar?.url ? (
                        <img src={u.avatar.url} alt={u.name} />
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: 8, background: 'var(--tyrian)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
                          {u.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <strong>{u.name}</strong>
                    </div>
                  </td>
                  <td className="muted">{u.email}</td>
                  <td className="muted">{u.phone || '—'}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-sale' : 'badge-soft'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="muted">{formatDate(u.createdAt)}</td>
                  <td>
                    {u.isBlocked ? (
                      <span className="badge" style={{ background: '#fbeae8', color: 'var(--danger)' }}>Blocked</span>
                    ) : (
                      <span className="badge" style={{ background: '#e6f5ec', color: 'var(--success)' }}>Active</span>
                    )}
                  </td>
                  <td>
                    {u.role !== 'admin' && (
                      <button
                        className={`adm-icon-btn ${u.isBlocked ? '' : 'adm-icon-btn--danger'}`}
                        onClick={() => setToToggle(u)}
                        title={u.isBlocked ? 'Unblock' : 'Block'}
                      >
                        {u.isBlocked ? <FaCheckCircle /> : <FaBan />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={7} className="adm-empty">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={meta.page} pages={meta.pages} onChange={setPage} />

      <ConfirmDialog
        open={!!toToggle}
        title={toToggle?.isBlocked ? 'Unblock user?' : 'Block user?'}
        message={
          toToggle?.isBlocked
            ? `${toToggle?.name} will regain access to their account.`
            : `${toToggle?.name} will be unable to log in or place orders.`
        }
        confirmLabel={toToggle?.isBlocked ? 'Unblock' : 'Block'}
        danger={!toToggle?.isBlocked}
        onConfirm={toggleBlock}
        onCancel={() => setToToggle(null)}
      />
    </div>
  );
}
