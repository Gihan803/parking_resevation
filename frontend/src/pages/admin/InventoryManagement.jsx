import React, { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../utils/api';

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

export default function InventoryManagement() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [newSlotNumber, setNewSlotNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminApi.getSlots();
      setSlots(res.slots || []);
    } catch (e) {
      setError(e?.message || 'Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setNotice('');
    setError('');
    if (!newSlotNumber.trim()) return;

    try {
      setSaving(true);
      await adminApi.createSlot(newSlotNumber.trim());
      setNewSlotNumber('');
      setNotice('Slot created successfully.');
      await fetchSlots();
    } catch (e2) {
      setError(e2?.message || 'Failed to create slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Delete this slot? This cannot be undone.')) return;

    setNotice('');
    setError('');
    try {
      setDeletingId(slotId);
      await adminApi.deleteSlot(slotId);
      setNotice('Slot deleted.');
      await fetchSlots();
    } catch (e) {
      setError(e?.message || 'Failed to delete slot');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Inventory Management</h1>
          <p className="mt-2 text-slate-500">Create, view, and remove parking slots.</p>
        </div>
        <form onSubmit={handleAdd} className="flex items-center gap-3">
          <input
            value={newSlotNumber}
            onChange={(e) => setNewSlotNumber(e.target.value)}
            placeholder="Slot number (e.g., A1)"
            className="w-48 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
          />
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-white font-bold shadow-sm hover:bg-teal-700 disabled:opacity-60"
          >
            <span className="text-xl leading-none">+</span> Add New Slot
          </button>
        </form>
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
                slots.map((slot) => {
                  const res = slot.active_reservation;
                  const occupant = res?.occupant;
                  const canDelete = slot.status !== 'occupied';

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
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDelete(slot.id)}
                          disabled={!canDelete || deletingId === slot.id}
                          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                          title={canDelete ? 'Delete slot' : 'Cannot delete occupied slot'}
                        >
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

