import React, { useEffect, useMemo, useState } from 'react';
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

export default function InventoryManagement() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newSlotNumber, setNewSlotNumber] = useState('');
  const [addError, setAddError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchSlots = async (opts = { silent: false }) => {
    try {
      if (!opts.silent) setLoading(true);
      setError('');
      const res = await adminApi.getSlots();
      setSlots(res.slots || []);
    } catch (e) {
      setError(e?.message || 'Failed to load slots');
    } finally {
      if (!opts.silent) setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    fetchSlots();
    const interval = setInterval(() => {
      if (!mounted) return;
      fetchSlots({ silent: true });
    }, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleOpenAdd = () => {
    setAddError('');
    setNewSlotNumber('');
    setIsAddOpen(true);
  };

  const handleAddConfirm = async (e) => {
    if (e) e.preventDefault();
    setNotice('');
    setError('');
    setAddError('');
    const slotLabel = newSlotNumber.trim().toUpperCase();
    if (!slotLabel) {
      setAddError('Slot number is required.');
      return;
    }

    try {
      setSaving(true);
      await adminApi.createSlot(slotLabel);
      setNewSlotNumber('');
      setNotice('Slot created successfully.');
      setIsAddOpen(false);
      await fetchSlots();
    } catch (e2) {
      setAddError(e2?.message || 'Failed to create slot');
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
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fetchSlots()}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-white font-bold shadow-sm hover:bg-teal-700"
          >
            <span className="text-xl leading-none">+</span> Add New Slot
          </button>
        </div>
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
                            <div className="font-bold text-slate-900">
                              {res.has_started ? (res.elapsed_duration || res.planned_duration) : res.planned_duration}
                            </div>
                            <div className="text-xs text-slate-500">
                              {res.has_started
                                ? `Since ${res.since_time || String(res.start_time || '').slice(0, 5)}`
                                : `Starts ${res.since_time || String(res.start_time || '').slice(0, 5)}`}
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

      {isAddOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setIsAddOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-extrabold text-slate-900">Add New Slot</h2>
              <p className="mt-1 text-sm text-slate-500">Enter a slot ID like A1, B2, or C3.</p>
            </div>
            <form onSubmit={handleAddConfirm} className="p-6 space-y-4">
              {addError ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">{addError}</div>
              ) : null}
              <div>
                <label className="block text-sm font-bold text-slate-700">Slot number</label>
                <input
                  value={newSlotNumber}
                  onChange={(e) => setNewSlotNumber(e.target.value)}
                  placeholder="A1"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  disabled={saving}
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white hover:bg-teal-700 disabled:opacity-60"
                >
                  {saving ? 'Adding...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
