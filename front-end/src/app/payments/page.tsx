'use client';
import Shell from '@/components/Shell';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/payments', { params: { page, limit: 50 } })
      .then(r => { setPayments(r.data.payments); setTotal(r.data.total); })
      .catch(console.error).finally(() => setLoading(false));
  }, [page]);

  return (
    <Shell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Payments</h1>
            <p className="text-sm text-slate-500 mt-1">{total} total payments recorded</p>
          </div>
        </div>

        <div className="bg-white/90 rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-left">
                <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Loan #</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">EMI #</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Mode</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Reference</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No payments recorded yet</td></tr>
              ) : payments.map(p => (
                <tr key={p._id} className="hover:bg-slate-100/70 transition">
                  <td className="px-4 py-4 text-blue-600 font-medium">{p.loan?.loanNumber}</td>
                  <td className="px-4 py-3 text-gray-600">#{p.emi?.emiNumber}</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{p.paymentMode?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(p.paymentDate)}</td>
                  <td className="px-4 py-3 text-gray-500">{p.referenceNumber || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{p.recordedBy?.name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {total > 50 && (
          <div className="flex items-center gap-2 justify-center">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Previous</button>
            <span className="text-sm text-gray-500">Page {page}</span>
            <button disabled={payments.length < 50} onClick={() => setPage(p => p + 1)} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </Shell>
  );
}
