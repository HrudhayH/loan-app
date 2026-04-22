export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const loanTypeLabels: Record<string, string> = {
  vehicle: 'Vehicle Loan',
  gold: 'Gold Loan',
  home: 'Home Loan',
  personal: 'Personal Loan',
  business: 'Business Loan',
  custom: 'Custom',
};

export const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-gray-100 text-gray-600',
  defaulted: 'bg-red-100 text-red-700',
  pending_approval: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  partially_paid: 'bg-blue-100 text-blue-700',
  unpaid: 'bg-gray-100 text-gray-600',
  overdue: 'bg-red-100 text-red-700',
  upcoming: 'bg-sky-100 text-sky-700',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-gray-100 text-gray-500',
};
