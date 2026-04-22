'use client';
import ClientShell from '@/components/ClientShell';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import { FileText, TrendingUp, AlertTriangle, CreditCard } from 'lucide-react';

export default function ClientDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <ClientShell><div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div></ClientShell>;

  const s = data?.stats || {};

  const cards = [
    { label: 'Total Loans', value: s.totalLoans || 0, icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Loans', value: s.activeLoans || 0, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Overdue EMIs', value: s.overdueEmis || 0, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
    { label: 'Total Paid', value: formatCurrency(s.totalPaid || 0), icon: CreditCard, color: 'text-indigo-600 bg-indigo-50', isCurrency: true },
  ];

  return (
    <ClientShell>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-gray-900">My Dashboard</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cards.map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>
                <c.icon size={16} />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{c.isCurrency ? c.value : c.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {s.totalOutstanding > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm font-medium text-amber-800">Outstanding Balance: {formatCurrency(s.totalOutstanding)}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-900">Upcoming EMIs (7 days)</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {(data?.upcomingEmis || []).length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-400">No upcoming EMIs</p>
              ) : data.upcomingEmis.map((emi: any) => (
                <div key={emi._id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{emi.loan?.loanNumber}</p>
                    <p className="text-xs text-gray-400">EMI #{emi.emiNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(emi.emiAmount)}</p>
                    <p className="text-xs text-gray-400">{formatDate(emi.dueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-900">Recent Payments</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {(data?.recentPayments || []).length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-400">No payments yet</p>
              ) : data.recentPayments.map((p: any) => (
                <div key={p._id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.loan?.loanNumber}</p>
                    <p className="text-xs text-gray-400 capitalize">{p.paymentMode?.replace('_', ' ')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-emerald-600">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-gray-400">{formatDate(p.paymentDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ClientShell>
  );
}
