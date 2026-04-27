'use client';
import Shell from '@/components/Shell';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus, Search, X } from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchClients = () => {
    setLoading(true);
    api.get('/clients', { params: { search: search || undefined, page, limit: 20 } })
      .then(r => { setClients(r.data.clients); setTotal(r.data.total); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchClients(); }, [page, search]);

  const handleSave = async (data: any) => {
    if (editClient) {
      await api.put(`/clients/${editClient._id}`, data);
    } else {
      await api.post('/clients', data);
    }
    setShowForm(false);
    setEditClient(null);
    fetchClients();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this client?')) return;
    await api.delete(`/clients/${id}`);
    fetchClients();
  };

  return (
    <Shell>
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Clients</h1>
            <p className="text-sm text-slate-500 mt-1">Manage client profiles and contact details with ease.</p>
          </div>
          <button onClick={() => { setEditClient(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl shadow-lg hover:opacity-95 transition">
            <Plus size={16} /> Add Client
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search clients..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-3 py-3 text-sm bg-white/90 border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="bg-white/90 rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Name</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Phone</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">City</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">ID Type</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Created</th>
                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Loading...</td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">No clients found</td></tr>
              ) : clients.map(c => (
                <tr key={c._id} className="hover:bg-slate-100/70 transition">
                  <td className="px-4 py-4 font-semibold text-slate-900">{c.name}</td>
                  <td className="px-4 py-4 text-slate-600">{c.phone}</td>
                  <td className="px-4 py-4 text-slate-600">{c.email || '-'}</td>
                  <td className="px-4 py-4 text-slate-600">{c.city || '-'}</td>
                  <td className="px-4 py-4 text-slate-600 capitalize">{c.idType?.replace('_', ' ') || '-'}</td>
                  <td className="px-4 py-4 text-slate-500">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex gap-3">
                      <button onClick={() => { setEditClient(c); setShowForm(true); }} className="text-xs font-semibold text-slate-700 hover:text-blue-600 transition">Edit</button>
                      <button onClick={() => handleDelete(c._id)} className="text-xs font-semibold text-red-500 hover:text-red-600 transition">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center gap-2 justify-center">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Previous</button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <button disabled={clients.length < 20} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Next</button>
          </div>
        )}

        {/* Modal */}
        {showForm && <ClientForm client={editClient} onSave={handleSave} onClose={() => { setShowForm(false); setEditClient(null); }} />}
      </div>
    </Shell>
  );
}

function ClientForm({ client, onSave, onClose }: { client: any; onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    name: client?.name || '', email: client?.email || '', phone: client?.phone || '',
    alternatePhone: client?.alternatePhone || '', address: client?.address || '',
    city: client?.city || '', state: client?.state || '', pincode: client?.pincode || '',
    idType: client?.idType || 'aadhaar', idNumber: client?.idNumber || '',
    occupation: client?.occupation || '', monthlyIncome: client?.monthlyIncome || '',
    notes: client?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...form, monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : undefined });
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const field = (label: string, key: string, type = 'text', required = false) => (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <input type={type} value={(form as any)[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required={required}
        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm">
      <div className="bg-white/95 rounded-[28px] shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50">
          <div>
            <p className="text-sm text-slate-500 uppercase tracking-[0.2em]">Client profile</p>
            <h2 className="text-lg font-semibold text-slate-900">{client ? 'Edit Client' : 'Create New Client'}</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {field('Name *', 'name', 'text', true)}
            {field('Phone *', 'phone', 'tel', true)}
            {field('Email', 'email', 'email')}
            {field('Alternate Phone', 'alternatePhone', 'tel')}
          </div>
          {field('Address', 'address')}
          <div className="grid grid-cols-3 gap-3">
            {field('City', 'city')}
            {field('State', 'state')}
            {field('Pincode', 'pincode')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">ID Type</label>
              <select value={form.idType} onChange={e => setForm({ ...form, idType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {['aadhaar', 'pan', 'voter_id', 'passport', 'driving_license', 'other'].map(t => (
                  <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                ))}
              </select>
            </div>
            {field('ID Number', 'idNumber')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('Occupation', 'occupation')}
            {field('Monthly Income', 'monthlyIncome', 'number')}
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-2xl hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl shadow-lg hover:opacity-95 transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
