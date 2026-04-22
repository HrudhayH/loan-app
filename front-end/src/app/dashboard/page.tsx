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
    { label: 'Total Loans', value: s.totalLoans, icon: FileText, color: 'text-blue-600 bg-blue-50' },
    { label: 'Active Loans', value: s.activeLoans, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Overdue EMIs', value: s.overdueLoans, icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
    { label: 'Closed Loans', value: s.closedLoans, icon: CheckCircle, color: 'text-gray-600 bg-gray-100' },
    { label: 'Pending Approval', value: s.pendingLoans, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Total Clients', value: s.totalClients, icon: Users, color: 'text-indigo-600 bg-indigo-50' },
  ];

  return (
    <Shell>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {cards.map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>
                <c.icon size={16} />
              </div>
              <p className="text-2xl font-semibold text-gray-900">{c.value ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Disbursed', value: m.totalDisbursed },
            { label: 'Total Collected', value: m.totalCollected },
            { label: 'Outstanding', value: m.totalOutstanding },
            { label: 'Total Penalties', value: m.totalPenalty },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">{item.label}</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{formatCurrency(item.value || 0)}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming EMIs */}
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
                    <p className="text-sm font-medium text-gray-800">{emi.loan?.client?.name}</p>
                    <p className="text-xs text-gray-400">{emi.loan?.loanNumber} · EMI #{emi.emiNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(emi.emiAmount)}</p>
                    <p className="text-xs text-gray-400">{formatDate(emi.dueDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Payments */}
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
                    <p className="text-xs text-gray-400">{p.paymentMode} · by {p.recordedBy?.name}</p>
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
    </Shell>
  );
}
