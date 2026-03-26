import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../../shared/api';

function StatusPill({ status }) {
  const styles = useMemo(() => {
    if (status === 'available') return 'bg-emerald-50 text-emerald-700';
    if (status === 'occupied') return 'bg-rose-50 text-rose-700';
    return 'bg-amber-50 text-amber-800';
  }, [status]);

  const label = status === 'available' ? 'Available' : status === 'occupied' ? 'Occupied' : 'Maintenance';

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${styles}`}>
      <span className="h-2 w-2 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

function Card({ title, subtitle, right, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
      <div className="flex items-start justify-between gap-4 p-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-slate-500">{subtitle}</p> : null}
        </div>
        {right}
      </div>
      <div className="px-6 pb-6">{children}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [slots, setSlots] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError('');
        const [slotRes, userRes] = await Promise.all([adminApi.getSlots(), adminApi.getUsers()]);
        if (!mounted) return;
        setSlots(slotRes.slots || []);
        setUsers(userRes.users || []);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load admin dashboard');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const slotPreview = slots.slice(0, 5);
  const userPreview = users.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Parking Inventory</h1>
          <p className="mt-2 text-slate-500">Detailed view of parking capacity and active occupants.</p>
        </div>
        <Link
          to="/admin/inventory"
          className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-white font-bold shadow-sm hover:bg-teal-700"
        >
          <span className="text-xl leading-none">+</span> Add / Manage Slots
        </Link>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700">{error}</div>
      ) : null}

      <Card
        title="Inventory Management"
        subtitle="Slots and their current occupancy."
        right={
          <Link to="/admin/inventory" className="text-teal-700 font-bold hover:underline">
            View All →
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr className="border-b border-slate-100">
                <th className="py-3 pr-4">Slot ID</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Occupancy Details</th>
                <th className="py-3 pr-4">Duration</th>
                <th className="py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="py-6 text-slate-500" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              ) : (
                slotPreview.map((slot) => {
                  const res = slot.active_reservation;
                  const occupant = res?.occupant;

                  return (
                    <tr key={slot.id} className="hover:bg-slate-50/60">
                      <td className="py-4 pr-4 font-extrabold text-slate-900">{slot.slot_number}</td>
                      <td className="py-4 pr-4">
                        <StatusPill status={slot.status} />
                      </td>
                      <td className="py-4 pr-4">
                        {res ? (
                          <div className="space-y-1">
                            <div className="inline-flex items-center gap-2">
                              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold text-slate-700">
                                {res.vehicle_plate || '—'}
                              </span>
                              <span className="font-bold text-slate-900">{occupant?.full_name || '—'}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                              {occupant?.email || '—'} {occupant?.phone ? `• ${occupant.phone}` : ''}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Ready for booking</span>
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        {res ? (
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900">{res.elapsed_duration || res.planned_duration}</div>
                            <div className="text-xs text-slate-500">
                              Since {res.start_time ? String(res.start_time).slice(0, 5) : '—'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 text-right text-slate-400">—</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card
        title="Registered Users"
        subtitle="Directory of users currently using the platform."
        right={
          <Link to="/admin/users" className="text-teal-700 font-bold hover:underline">
            View All Users →
          </Link>
        }
      >
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
                userPreview.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold">
                          {(u.full_name || 'U').slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{u.full_name || '—'}</div>
                          <div className="text-xs text-slate-500">
                            Member since {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-slate-700">
                      <div>{u.email || '—'}</div>
                      <div className="text-xs text-slate-500">{u.phone || ''}</div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        {String(u.role || 'customer').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 text-right text-slate-400">—</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
