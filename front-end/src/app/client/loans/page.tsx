'use client';
import ClientShell from '@/components/ClientShell';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { formatCurrency, formatDate, loanTypeLabels, statusColors } from '@/lib/utils';
import { Eye } from 'lucide-react';

export default function ClientLoansPage() {
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/loans').then((r: any) => setLoans(r.data.loans)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <ClientShell>
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">My Loans</h1>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Loan #</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Type</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Outstanding</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : loans.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">No loans found</td></tr>
              ) : loans.map(l => (
                <tr key={l._id} className="hover:bg-gray-50/50 group">
                  <td className="px-4 py-3">
                    <Link href={`/client/loans/${l._id}`} className="font-medium text-blue-600 hover:underline flex items-center gap-1.5">
                      {l.loanNumber}
                      <Eye size={14} className="opacity-0 group-hover:opacity-100 transition" />
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{loanTypeLabels[l.loanType] || l.customLoanType}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{formatCurrency(l.loanAmount)}</td>
                  <td className="px-4 py-3 font-medium text-gray-800">{formatCurrency(l.outstandingAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[l.status] || 'bg-gray-100'}`}>
                      {l.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(l.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ClientShell>
  );
}
