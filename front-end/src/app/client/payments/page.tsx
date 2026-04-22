'use client';
import ClientShell from '@/components/ClientShell';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Download } from 'lucide-react';

export default function ClientPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments').then((r: any) => setPayments(r.data.payments)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <ClientShell>
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">My Payments History</h1>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Loan #</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">EMI #</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Mode</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Reference #</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-500">No payments found</td></tr>
              ) : payments.map(p => (
                <tr key={p._id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-800">{formatDate(p.paymentDate)}</td>
                  <td className="px-4 py-3 text-gray-600">{p.loan?.loanNumber}</td>
                  <td className="px-4 py-3 text-gray-600">{p.emi?.emiNumber}</td>
                  <td className="px-4 py-3 font-medium text-emerald-600">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3 text-gray-600 capitalize">{p.paymentMode?.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-gray-500">{p.referenceNumber || '-'}</td>
                  <td className="px-4 py-3">
                    <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs" title="Download Receipt">
                      <Download size={14} /> Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ClientShell>
  );
}
