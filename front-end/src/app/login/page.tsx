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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Loan Manager</h1>
          <p className="text-sm text-gray-500 mt-1">{isRegister ? 'Create admin account' : 'Sign in to continue'}</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="Your name" />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="••••••" />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
            {loading ? 'Please wait...' : isRegister ? 'Create admin account' : 'Sign in'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-500 mt-4">
          {isRegister ? 'Already have an account?' : 'First time setup?'}{' '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="text-blue-600 hover:underline">
            {isRegister ? 'Sign in' : 'Create admin account'}
          </button>
        </p>
      </div>
    </div>
  );
}
