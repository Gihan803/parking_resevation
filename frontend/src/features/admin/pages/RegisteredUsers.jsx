import React, { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../../shared/api';

function RolePill({ role }) {
  const styles = useMemo(() => {
    if (role === 'admin') return 'bg-indigo-50 text-indigo-700';
    return 'bg-emerald-50 text-emerald-700';
  }, [role]);

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${styles}`}>
      {String(role || 'customer').toUpperCase()}
    </span>
  );
}

function UserEditModal({ user, isOpen, onClose, onSave }) {
  const [form, setForm] = useState({ full_name: '', phone: '', role: 'customer' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setForm({
      full_name: user.full_name || '',
      phone: user.phone || '',
      role: user.role || 'customer',
    });
    setError('');
  }, [user]);

  if (!isOpen) return null;

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (e2) {
      setError(e2?.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-900/30" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-extrabold text-slate-900">Edit User</h2>
          <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">{error}</div> : null}
          <div>
            <label className="block text-sm font-bold text-slate-700">Full name</label>
            <input
              value={form.full_name}
              onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-200"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-200"
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RegisteredUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [editingUser, setEditingUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminApi.getUsers();
      setUsers(res.users || []);
    } catch (e) {
      setError(e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const saveUser = async (payload) => {
    setNotice('');
    setError('');
    const id = editingUser?.id;
    if (!id) return;
    await adminApi.updateUser(id, payload);
    setNotice('User updated.');
    await fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Registered Users</h1>
          <p className="mt-2 text-slate-500">Manage customer and admin accounts.</p>
        </div>
        <button
          onClick={fetchUsers}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div> : null}
      {notice ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">{notice}</div>
      ) : null}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr className="border-b border-slate-100">
                <th className="py-3 pr-4">User</th>
                <th className="py-3 pr-4">Contact</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="py-6 text-slate-500" colSpan={4}>
                    Loading...
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                          {(u.full_name || 'U').slice(0, 1).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{u.full_name || '—'}</div>
                          <div className="text-xs text-slate-500 truncate">
                            Member since {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-slate-700">
                      <div className="truncate">{u.email || '—'}</div>
                      <div className="text-xs text-slate-500">{u.phone || ''}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <RolePill role={u.role} />
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => setEditingUser(u)}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50"
                        title="Edit user"
                      >
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm18-11.5a1 1 0 0 0 0-1.41l-1.34-1.34a1 1 0 0 0-1.41 0l-1.12 1.12 3.75 3.75L21 5.75z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserEditModal
        user={editingUser}
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onSave={saveUser}
      />
    </div>
  );
}
