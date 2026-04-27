'use client';
import ClientShell from '@/components/ClientShell';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { formatCurrency, formatDate, loanTypeLabels, statusColors } from '@/lib/utils';
import { X } from 'lucide-react';

export default function ClientLoanDetailPage() {
  const { id } = useParams();
  const [loan, setLoan] = useState<any>(null);
  const [emis, setEmis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payEmi, setPayEmi] = useState<any>(null);

  const fetchLoan = () => {
    setLoading(true);
    api.get(`/loans/${id}`).then((r: any) => { setLoan(r.data.loan); setEmis(r.data.emis); }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLoan(); }, [id]);

  const handlePayment = async (data: any) => {
    await api.post('/payments', { loan: id, emi: payEmi._id, ...data, amount: Number(data.amount) });
    setPayEmi(null);
    fetchLoan();
  };

  if (loading) return <ClientShell><div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div></ClientShell>;
  if (!loan) return <ClientShell><div className="p-8 text-center text-gray-500">Loan not found</div></ClientShell>;

  return (
    <ClientShell>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Loan details</p>
            <h1 className="text-3xl font-semibold text-slate-900">{loan.loanNumber}</h1>
            <p className="text-sm text-slate-500 mt-1">{loanTypeLabels[loan.loanType] || loan.customLoanType}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Status', value: loan.status.replace('_', ' '), badge: true },
            { label: 'Loan Amount', value: formatCurrency(loan.loanAmount) },
            { label: 'Interest', value: `${loan.interestRate}% (${loan.interestType})` },
            { label: 'Tenure', value: `${loan.tenure} months` },
            { label: 'Total Paid', value: formatCurrency(loan.totalPaid || 0) },
            { label: 'Outstanding', value: formatCurrency(loan.outstandingAmount) },
          ].map(item => (
            <div key={item.label} className="bg-white/95 rounded-[28px] border border-slate-200 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              {item.badge ? (
                <span className={`inline-flex mt-3 px-3 py-1 text-xs font-semibold rounded-full ${statusColors[loan.status] || 'bg-slate-100 text-slate-700'}`}>{item.value}</span>
              ) : (
                <p className="mt-3 text-lg font-semibold text-slate-900">{item.value}</p>
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
                    {emi.status !== 'paid' && loan.status === 'active' && (
                      <button onClick={() => setPayEmi(emi)} className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded flex items-center justify-center hover:bg-blue-700 transition">Pay Now</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {payEmi && <PaymentModal emi={payEmi} onSave={handlePayment} onClose={() => setPayEmi(null)} />}
      </div>
    </ClientShell>
  );
}

function PaymentModal({ emi, onSave, onClose }: { emi: any; onSave: (d: any) => void; onClose: () => void }) {
  const remaining = emi.emiAmount + (emi.penaltyAmount || 0) - (emi.paidAmount || 0);
  const [form, setForm] = useState({ amount: String(remaining), paymentMode: 'upi', referenceNumber: '' });
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
          <h2 className="text-base font-semibold text-gray-900">Pay EMI #{emi.emiNumber}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <p className="text-xs text-gray-500">Amount Due: <span className="font-semibold text-gray-900">{formatCurrency(remaining)}</span></p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount to Pay *</label>
            <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required min="1" max={remaining}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Payment Mode</label>
            <select value={form.paymentMode} onChange={e => setForm({ ...form, paymentMode: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              {['upi', 'bank_transfer', 'card'].map(m => (
                <option key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Transaction Ref #</label>
            <input type="text" value={form.referenceNumber} onChange={e => setForm({ ...form, referenceNumber: e.target.value })} required placeholder="e.g. TXN123456789"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50">{saving ? 'Processing...' : 'Pay Now'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
