'use client';
import Shell from '@/components/Shell';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Plus, X, ToggleLeft, ToggleRight } from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/auth/users').then(r => setUsers(r.data)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleActive = async (id: string) => {
    await api.patch(`/auth/users/${id}/toggle`);
    fetchUsers();
  };

  return (
    <Shell>
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            <Plus size={16} /> Create Client Account
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Role</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Linked Client</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Created</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.linkedClient?.name || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${u.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    {u.role !== 'admin' && (
                      <button onClick={() => toggleActive(u._id)} className="text-gray-400 hover:text-gray-700 transition" title={u.isActive ? 'Deactivate' : 'Activate'}>
                        {u.isActive ? <ToggleRight size={20} className="text-emerald-500" /> : <ToggleLeft size={20} />}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showForm && <CreateClientForm onClose={() => setShowForm(false)} onCreated={fetchUsers} />}
      </div>
    </Shell>
  );
}

function CreateClientForm({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    city: '', state: '', pincode: '', idType: 'aadhaar', idNumber: '',
    occupation: '', monthlyIncome: '', address: '', alternatePhone: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/auth/create-client-account', {
        ...form,
        monthlyIncome: form.monthlyIncome ? Number(form.monthlyIncome) : undefined,
      });
      onClose();
      onCreated();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create account');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Create Client Account</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
            This creates both a client profile and a login account. The client will use these credentials to access their loan portal.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {field('Name *', 'name', 'text', true)}
            {field('Phone *', 'phone', 'tel', true)}
            {field('Email *', 'email', 'email', true)}
            {field('Password *', 'password', 'password', true)}
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
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
