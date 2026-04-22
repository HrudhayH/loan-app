'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useEffect, ReactNode } from 'react';
import {
  LayoutDashboard, FileText, CreditCard, LogOut
} from 'lucide-react';

const navItems = [
  { href: '/client/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/client/loans', label: 'My Loans', icon: FileText },
  { href: '/client/payments', label: 'My Payments', icon: CreditCard },
];

export default function ClientShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
    if (!loading && user && user.role !== 'client') router.replace('/dashboard');
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'client') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-gray-100">
          <span className="text-base font-semibold text-gray-900 tracking-tight">Loan Manager</span>
        </div>
        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${active ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400">Client</p>
            </div>
            <button onClick={() => { logout(); router.push('/login'); }} className="text-gray-400 hover:text-red-500 transition" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
