'use client';
import Shell from '@/components/Shell';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate, statusColors } from '@/lib/utils';
import { TrendingUp, Users, AlertTriangle, CheckCircle, Clock, FileText } from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <Shell><div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" /></div></Shell>;

  const s = data?.stats || {};
  const m = data?.summary || {};

  const cards = [
    { label: 'Total Loans', value: s.totalLoans, icon: FileText, gradient: 'from-blue-500 to-blue-600', bgLight: 'bg-blue-50' },
    { label: 'Active Loans', value: s.activeLoans, icon: TrendingUp, gradient: 'from-emerald-500 to-teal-600', bgLight: 'bg-emerald-50' },
    { label: 'Overdue EMIs', value: s.overdueLoans, icon: AlertTriangle, gradient: 'from-red-500 to-red-600', bgLight: 'bg-red-50' },
    { label: 'Closed Loans', value: s.closedLoans, icon: CheckCircle, gradient: 'from-slate-500 to-slate-600', bgLight: 'bg-slate-100' },
    { label: 'Pending Approval', value: s.pendingLoans, icon: Clock, gradient: 'from-amber-500 to-orange-600', bgLight: 'bg-amber-50' },
    { label: 'Total Clients', value: s.totalClients, icon: Users, gradient: 'from-indigo-500 to-indigo-600', bgLight: 'bg-indigo-50' },
  ];

  return (
    <Shell>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Welcome back! Here's your loan portfolio overview.</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {cards.map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition duration-300 group">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${c.gradient} text-white flex items-center justify-center mb-4 group-hover:scale-110 transition duration-300 shadow-lg`}>
                <c.icon size={24} strokeWidth={2} />
              </div>
              <p className="text-3xl font-bold text-slate-900">{c.value ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 mb-4">Financial Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Disbursed', value: m.totalDisbursed, color: 'from-blue-500 to-blue-600' },
              { label: 'Total Collected', value: m.totalCollected, color: 'from-emerald-500 to-teal-600' },
              { label: 'Outstanding', value: m.totalOutstanding, color: 'from-amber-500 to-orange-600' },
              { label: 'Total Penalties', value: m.totalPenalty, color: 'from-red-500 to-red-600' },
            ].map(item => (
              <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
                <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">{item.label}</p>
                <p className={`text-2xl font-bold mt-3 bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                  {formatCurrency(item.value || 0)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming EMIs */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <h2 className="text-sm font-bold text-slate-900">📅 Upcoming EMIs (Next 7 days)</h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {(data?.upcomingEmis || []).length === 0 ? (
                <p className="px-6 py-12 text-center text-sm text-slate-400">No upcoming EMIs</p>
              ) : data.upcomingEmis.map((emi: any) => (
                <div key={emi._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{emi.loan?.client?.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{emi.loan?.loanNumber} · EMI #{emi.emiNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(emi.emiAmount)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(emi.dueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition">
            <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
              <h2 className="text-sm font-bold text-slate-900">💳 Recent Payments</h2>
            </div>
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {(data?.recentPayments || []).length === 0 ? (
                <p className="px-6 py-12 text-center text-sm text-slate-400">No payments yet</p>
              ) : data.recentPayments.map((p: any) => (
                <div key={p._id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{p.loan?.loanNumber}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{p.paymentMode} · by {p.recordedBy?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{formatCurrency(p.amount)}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(p.paymentDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
