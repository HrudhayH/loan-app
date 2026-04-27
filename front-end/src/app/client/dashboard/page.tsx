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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">My Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Your active loans, upcoming EMIs, and recent payments at a glance.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {cards.map(c => (
            <div key={c.label} className="bg-white/95 rounded-[28px] border border-slate-200 p-5 shadow-sm">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${c.color}`}>
                <c.icon size={18} />
              </div>
              <p className="text-3xl font-semibold text-slate-900">{c.isCurrency ? c.value : c.value}</p>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 mt-2">{c.label}</p>
            </div>
          ))}
        </div>

        {s.totalOutstanding > 0 && (
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 text-white rounded-[28px] border border-slate-800 p-6 shadow-lg">
            <p className="text-sm uppercase tracking-[0.18em] text-slate-300">Outstanding Balance</p>
            <p className="mt-3 text-3xl font-semibold">{formatCurrency(s.totalOutstanding)}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/95 rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900">Upcoming EMIs (7 days)</h2>
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

          <div className="bg-white/95 rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-semibold text-slate-900">Recent Payments</h2>
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
