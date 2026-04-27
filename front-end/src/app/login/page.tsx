'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
        router.push('/dashboard');
      } else {
        const user = await login(email, password);
        router.push(user.role === 'admin' ? '/dashboard' : '/client/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="w-full max-w-sm relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">₹</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">LoanFlow</h1>
          </div>
          <p className="text-slate-300 text-sm">{isRegister ? 'Create admin account' : 'Sign in to continue'}</p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl space-y-5 border border-white/20">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2 uppercase tracking-wide">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 transition" 
                placeholder="Your full name" />
            </div>
          )}
          
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2 uppercase tracking-wide">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 transition" 
              placeholder="you@example.com" />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-2 uppercase tracking-wide">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              className="w-full px-4 py-3 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-400 transition" 
              placeholder="••••••" />
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <p className="text-xs text-red-200 font-medium">{error}</p>
            </div>
          )}
          
          <button type="submit" disabled={loading}
            className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl hover:from-blue-700 hover:to-teal-700 transition duration-200 disabled:opacity-50 shadow-lg">
            {loading ? 'Processing...' : isRegister ? 'Create admin account' : 'Sign in'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          {isRegister ? 'Already have an account?' : 'First time setup?'}{' '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-blue-400 hover:text-blue-300 font-semibold transition">
            {isRegister ? 'Sign in' : 'Create admin account'}
          </button>
        </p>
        
        <p className="text-center text-xs text-slate-500 mt-4">
          © 2026 LoanFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}
