'use client';
import Shell from '@/components/Shell';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate, loanTypeLabels, statusColors } from '@/lib/utils';
import { Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = () => {
    setLoading(true);
    api.get('/loans', { params: { status: statusFilter || undefined, loanType: typeFilter || undefined, page, limit: 20 } })
      .then(r => { setLoans(r.data.loans); setTotal(r.data.total); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoans(); }, [page, statusFilter, typeFilter]);

  const openForm = () => {
    api.get('/clients', { params: { limit: 500 } }).then(r => setClients(r.data.clients)).catch(console.error);
    setShowForm(true);
  };

  const handleCreate = async (data: any) => {
    await api.post('/loans', data);
    setShowForm(false);
    fetchLoans();
  };

  return (
    <Shell>
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Loans</h1>
            <p className="text-sm text-slate-500 mt-1">Monitor and manage loan applications from a single dashboard.</p>
          </div>
          <button onClick={openForm}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl shadow-lg hover:opacity-95 transition">
            <Plus size={16} /> New Loan
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_auto]">
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Status</option>
            {['active', 'pending_approval', 'closed', 'defaulted'].map(s => (
              <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">All Types</option>
            {Object.entries(loanTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white/90 rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Loan #</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Client</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Rate</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Tenure</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Outstanding</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : loans.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-12 text-center text-gray-400">No loans found</td></tr>
              ) : loans.map(l => (
                <tr key={l._id} className="hover:bg-slate-100/70 transition">
                  <td className="px-4 py-4">
                    <Link href={`/loans/${l._id}`} className="text-blue-600 hover:text-blue-700 font-medium">{l.loanNumber}</Link>
                  </td>
                  <td className="px-4 py-3 text-gray-800">{l.client?.name}</td>
                  <td className="px-4 py-3 text-gray-600">{loanTypeLabels[l.loanType] || l.customLoanType || l.loanType}</td>
                  <td className="px-4 py-3 text-gray-800 font-medium">{formatCurrency(l.loanAmount)}</td>
                  <td className="px-4 py-3 text-gray-600">{l.interestRate}%</td>
                  <td className="px-4 py-3 text-gray-600">{l.tenure}m</td>
                  <td className="px-4 py-3 text-gray-800">{formatCurrency(l.outstandingAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[l.status] || 'bg-gray-100 text-gray-600'}`}>
                      {l.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(l.startDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > 20 && (
          <div className="flex items-center gap-2 justify-center">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Previous</button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <button disabled={loans.length < 20} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Next</button>
          </div>
        )}

        {showForm && <LoanForm clients={clients} onSave={handleCreate} onClose={() => setShowForm(false)} />}
      </div>
    </Shell>
  );
}

function LoanForm({ clients, onSave, onClose }: { clients: any[]; onSave: (d: any) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    client: '', loanType: 'personal', customLoanType: '', loanAmount: '',
    interestType: 'fixed', interestRate: '', tenure: '', emiFrequency: 'monthly',
    customFrequencyDays: '', startDate: new Date().toISOString().split('T')[0],
    penaltyType: 'percentage', penaltyValue: '2', penaltyGraceDays: '0', notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        loanAmount: Number(form.loanAmount),
        interestRate: Number(form.interestRate),
        tenure: Number(form.tenure),
        penaltyValue: Number(form.penaltyValue),
        penaltyGraceDays: Number(form.penaltyGraceDays),
        customFrequencyDays: form.customFrequencyDays ? Number(form.customFrequencyDays) : undefined,
      });
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Create New Loan</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Client *</label>
            <select value={form.client} onChange={e => setForm({ ...form, client: e.target.value })} required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select client</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.name} - {c.phone}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Loan Type *</label>
              <select value={form.loanType} onChange={e => setForm({ ...form, loanType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(loanTypeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            {form.loanType === 'custom' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Custom Type Name</label>
                <input type="text" value={form.customLoanType} onChange={e => setForm({ ...form, customLoanType: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Loan Amount *</label>
              <input type="number" value={form.loanAmount} onChange={e => setForm({ ...form, loanAmount: e.target.value })} required min="1"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Interest Type</label>
              <select value={form.interestType} onChange={e => setForm({ ...form, interestType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="fixed">Fixed</option>
                <option value="floating">Floating</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Interest Rate (%) *</label>
              <input type="number" step="0.01" value={form.interestRate} onChange={e => setForm({ ...form, interestRate: e.target.value })} required min="0"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tenure (months) *</label>
              <input type="number" value={form.tenure} onChange={e => setForm({ ...form, tenure: e.target.value })} required min="1"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">EMI Frequency</label>
              <select value={form.emiFrequency} onChange={e => setForm({ ...form, emiFrequency: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date *</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {form.emiFrequency === 'custom' && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Custom Frequency (days)</label>
              <input type="number" value={form.customFrequencyDays} onChange={e => setForm({ ...form, customFrequencyDays: e.target.value })} min="1"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Penalty Type</label>
              <select value={form.penaltyType} onChange={e => setForm({ ...form, penaltyType: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="percentage">Percentage</option>
                <option value="flat">Flat</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Penalty Value</label>
              <input type="number" step="0.01" value={form.penaltyValue} onChange={e => setForm({ ...form, penaltyValue: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Grace Days</label>
              <input type="number" value={form.penaltyGraceDays} onChange={e => setForm({ ...form, penaltyGraceDays: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-2xl hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-teal-500 rounded-2xl shadow-lg hover:opacity-95 transition disabled:opacity-50">
              {saving ? 'Creating...' : 'Create Loan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
