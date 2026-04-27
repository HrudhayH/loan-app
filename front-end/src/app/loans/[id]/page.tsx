'use client';
import Shell from '@/components/Shell';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { formatCurrency, formatDate, loanTypeLabels, statusColors } from '@/lib/utils';
import { X } from 'lucide-react';

export default function LoanDetailPage() {
  const { id } = useParams();
  const [loan, setLoan] = useState<any>(null);
  const [emis, setEmis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payEmi, setPayEmi] = useState<any>(null);

  const fetchLoan = () => {
    setLoading(true);
    api.get(`/loans/${id}`).then(r => { setLoan(r.data.loan); setEmis(r.data.emis); }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoan(); }, [id]);

  const updateStatus = async (status: string) => {
    await api.patch(`/loans/${id}/status`, { status });
    fetchLoan();
  };

  const detectOverdue = async () => {
    const r = await api.post(`/loans/${id}/detect-overdue`);
    alert(`Found ${r.data.overdueCount} overdue EMIs. Penalty: ${formatCurrency(r.data.totalPenalty)}`);
    fetchLoan();
  };

  const handlePayment = async (data: any) => {
    await api.post('/payments', { loan: id, emi: payEmi._id, ...data, amount: Number(data.amount) });
    setPayEmi(null);
    fetchLoan();
  };

  if (loading) return <Shell><div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div></Shell>;
  if (!loan) return <Shell><div className="p-8 text-center text-gray-500">Loan not found</div></Shell>;

  return (
    <Shell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Loan details</p>
            <h1 className="text-3xl font-semibold text-slate-900">{loan.loanNumber}</h1>
            <p className="text-sm text-slate-500 mt-1">{loan.client?.name} · {loanTypeLabels[loan.loanType] || loan.customLoanType}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {loan.status === 'pending_approval' && (
              <button onClick={() => updateStatus('active')} className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition">Approve</button>
            )}
            {loan.status === 'active' && (
              <>
                <button onClick={detectOverdue} className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition">Detect Overdue</button>
                <button onClick={() => updateStatus('defaulted')} className="px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition">Mark Defaulted</button>
              </>
            )}
          </div>
        </div>

        {/* Loan Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Status', value: loan.status.replace('_', ' '), badge: true },
            { label: 'Loan Amount', value: formatCurrency(loan.loanAmount) },
            { label: 'Interest', value: `${loan.interestRate}% (${loan.interestType})` },
            { label: 'Outstanding', value: formatCurrency(loan.outstandingAmount) },
          ].map(item => (
            <div key={item.label} className="bg-white/95 rounded-3xl border border-slate-200 p-5 shadow-sm">
              <p className="text-xs text-gray-500">{item.label}</p>
              {item.badge ? (
                <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[loan.status] || 'bg-gray-100'}`}>{item.value}</span>
              ) : (
                <p className="text-sm font-semibold text-gray-900 mt-1">{item.value}</p>
              )}
            </div>
          ))}
        </div>

        {/* EMI Schedule */}
        <div className="bg-white/95 rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-sm font-semibold text-slate-900">EMI Schedule</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500">#</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Due Date</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500">EMI</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Principal</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Interest</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Penalty</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Paid</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {emis.map(emi => (
                <tr key={emi._id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-2.5 text-gray-600">{emi.emiNumber}</td>
                  <td className="px-4 py-2.5 text-gray-600">{formatDate(emi.dueDate)}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-800">{formatCurrency(emi.emiAmount)}</td>
                  <td className="px-4 py-2.5 text-gray-600">{formatCurrency(emi.principalComponent)}</td>
                  <td className="px-4 py-2.5 text-gray-600">{formatCurrency(emi.interestComponent)}</td>
                  <td className="px-4 py-2.5 text-red-600">{emi.penaltyAmount ? formatCurrency(emi.penaltyAmount) : '-'}</td>
                  <td className="px-4 py-2.5 text-emerald-600">{emi.paidAmount ? formatCurrency(emi.paidAmount) : '-'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[emi.status] || 'bg-gray-100'}`}>{emi.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    {emi.status !== 'paid' && (
                      <button onClick={() => setPayEmi(emi)} className="text-xs text-blue-600 hover:underline">Record Payment</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payEmi && <PaymentModal emi={payEmi} onSave={handlePayment} onClose={() => setPayEmi(null)} />}
      </div>
    </Shell>
  );
}

function PaymentModal({ emi, onSave, onClose }: { emi: any; onSave: (d: any) => void; onClose: () => void }) {
  const remaining = emi.emiAmount + (emi.penaltyAmount || 0) - (emi.paidAmount || 0);
  const [form, setForm] = useState({ amount: String(remaining), paymentMode: 'cash', referenceNumber: '', notes: '' });
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
          <h2 className="text-base font-semibold text-gray-900">Record Payment – EMI #{emi.emiNumber}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <p className="text-xs text-gray-500">Remaining: {formatCurrency(remaining)}</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount *</label>
            <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min="1"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Payment Mode</label>
            <select value={form.paymentMode} onChange={e => setForm({ ...form, paymentMode: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['cash', 'bank_transfer', 'upi', 'card', 'other'].map(m => (
                <option key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Reference #</label>
            <input type="text" value={form.referenceNumber} onChange={e => setForm({ ...form, referenceNumber: e.target.value })}
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
