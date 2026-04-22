'use client';
import Shell from '@/components/Shell';
import { useState } from 'react';
import api from '@/lib/api';
import { formatCurrency, formatDate, statusColors } from '@/lib/utils';

type Tab = 'emi' | 'payments' | 'overdue';

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>('emi');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ from: '', to: '', status: '' });

  const fetchReport = async (t: Tab) => {
    setTab(t);
    setLoading(true);
    try {
      if (t === 'emi') {
        const r = await api.get('/reports/emi', { params: { status: filters.status || undefined } });
        setData(r.data);
      } else if (t === 'payments') {
        const r = await api.get('/reports/payments', { params: { from: filters.from || undefined, to: filters.to || undefined } });
        setData(r.data);
      } else {
        const r = await api.get('/reports/overdue');
        setData(r.data);
      }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <Shell>
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <h1 className="text-xl font-semibold text-gray-900">Reports</h1>

        {/* Tabs */}
        <div className="flex gap-2">
          {[{ key: 'emi', label: 'EMI Report' }, { key: 'payments', label: 'Payment Report' }, { key: 'overdue', label: 'Overdue Report' }].map(t => (
            <button key={t.key} onClick={() => fetchReport(t.key as Tab)}
              className={`px-4 py-2 text-sm rounded-lg border transition ${tab === t.key ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        {tab === 'emi' && (
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg">
                <option value="">All</option>
                {['upcoming', 'paid', 'partially_paid', 'unpaid', 'overdue'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
            <button onClick={() => fetchReport('emi')} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Generate</button>
          </div>
        )}
        {tab === 'payments' && (
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <input type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <input type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg" />
            </div>
            <button onClick={() => fetchReport('payments')} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Generate</button>
          </div>
        )}
        {tab === 'overdue' && !data && (
          <button onClick={() => fetchReport('overdue')} className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Generate Report</button>
        )}

        {/* Results */}
        {loading && <div className="py-12 text-center text-gray-400">Loading...</div>}

        {!loading && data && tab === 'emi' && Array.isArray(data) && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <p className="text-sm font-medium text-gray-900">{data.length} EMI records</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Loan #</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Client</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">EMI #</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Due Date</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Amount</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Paid</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((e: any) => (
                  <tr key={e._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-gray-800">{e.loan?.loanNumber}</td>
                    <td className="px-4 py-2.5 text-gray-600">{e.loan?.client?.name}</td>
                    <td className="px-4 py-2.5 text-gray-600">#{e.emiNumber}</td>
                    <td className="px-4 py-2.5 text-gray-600">{formatDate(e.dueDate)}</td>
                    <td className="px-4 py-2.5 font-medium">{formatCurrency(e.emiAmount)}</td>
                    <td className="px-4 py-2.5 text-emerald-600">{formatCurrency(e.paidAmount || 0)}</td>
                    <td className="px-4 py-2.5"><span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[e.status]}`}>{e.status.replace('_', ' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && data && tab === 'payments' && data.payments && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <p className="text-sm font-medium text-gray-900">{data.payments.length} payments · Total: {formatCurrency(data.total)}</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Loan #</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Client</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">EMI #</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Amount</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Mode</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.payments.map((p: any) => (
                  <tr key={p._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-gray-800">{p.loan?.loanNumber}</td>
                    <td className="px-4 py-2.5 text-gray-600">{p.loan?.client?.name}</td>
                    <td className="px-4 py-2.5 text-gray-600">#{p.emi?.emiNumber}</td>
                    <td className="px-4 py-2.5 font-medium text-emerald-600">{formatCurrency(p.amount)}</td>
                    <td className="px-4 py-2.5 text-gray-600 capitalize">{p.paymentMode?.replace('_', ' ')}</td>
                    <td className="px-4 py-2.5 text-gray-600">{formatDate(p.paymentDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && data && tab === 'overdue' && data.emis && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{data.emis.length} overdue EMIs · Total overdue: {formatCurrency(data.totalOverdue)}</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Loan #</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Client</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">EMI #</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Due Date</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">EMI Amount</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Penalty</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-gray-500">Overdue Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.emis.map((e: any) => (
                  <tr key={e._id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-2.5 text-gray-800">{e.loan?.loanNumber}</td>
                    <td className="px-4 py-2.5 text-gray-600">{e.loan?.client?.name}</td>
                    <td className="px-4 py-2.5 text-gray-600">#{e.emiNumber}</td>
                    <td className="px-4 py-2.5 text-gray-600">{formatDate(e.dueDate)}</td>
                    <td className="px-4 py-2.5 font-medium">{formatCurrency(e.emiAmount)}</td>
                    <td className="px-4 py-2.5 text-red-600">{formatCurrency(e.penaltyAmount)}</td>
                    <td className="px-4 py-2.5 text-red-600">{e.overdueDays} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Shell>
  );
}
