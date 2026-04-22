'use client';
import Shell from '@/components/Shell';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate, statusColors } from '@/lib/utils';
import { Plus, X } from 'lucide-react';

export default function FollowUpsPage() {
  const [followups, setFollowups] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    api.get('/followups', { params: { status: statusFilter || undefined, limit: 100 } })
      .then(r => setFollowups(r.data.followups))
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [statusFilter]);

  const openForm = () => {
    api.get('/clients', { params: { limit: 500 } }).then(r => setClients(r.data.clients)).catch(console.error);
    setShowForm(true);
  };

  const handleCreate = async (data: any) => {
    await api.post('/followups', data);
    setShowForm(false);
    fetch();
  };

  const markComplete = async (id: string) => {
    await api.patch(`/followups/${id}`, { status: 'completed' });
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this follow-up?')) return;
    await api.delete(`/followups/${id}`);
    fetch();
  };

  return (
    <Shell>
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Follow-ups</h1>
          <button onClick={openForm}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            <Plus size={16} /> New Follow-up
          </button>
        </div>

        <div className="flex gap-2">
          {['', 'pending', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition ${statusFilter === s ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Client</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Loan #</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Follow-up Date</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Notes</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : followups.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No follow-ups</td></tr>
              ) : followups.map(f => (
                <tr key={f._id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">{f.client?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{f.loan?.loanNumber || '-'}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{f.type.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(f.followUpDate)}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{f.notes || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[f.status] || 'bg-gray-100'}`}>{f.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {f.status === 'pending' && <button onClick={() => markComplete(f._id)} className="text-xs text-emerald-600 hover:underline">Complete</button>}
                      <button onClick={() => handleDelete(f._id)} className="text-xs text-red-500 hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showForm && <FollowUpForm clients={clients} onSave={handleCreate} onClose={() => setShowForm(false)} />}
      </div>
    </Shell>
  );
}

function FollowUpForm({ clients, onSave, onClose }: { clients: any[]; onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({ client: '', type: 'general', followUpDate: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(form); } catch (err) { console.error(err); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">New Follow-up</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Client *</label>
            <select value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select client</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['emi_reminder', 'overdue', 'general', 'payment_commitment'].map(t => (
                <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Follow-up Date *</label>
            <input type="date" value={form.followUpDate} onChange={e => setForm({ ...form, followUpDate: e.target.value })} required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
