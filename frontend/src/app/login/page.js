'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const user = res.data.user;
      // Save to context (which also saves to localStorage)
      setUser(user);
      // Join socket room for real-time notifications
      const socket = getSocket();
      socket.emit('join', user.id);
      if (user.role === 'provider') {
        router.push('/provider/dashboard');
      } else {
        router.push('/services');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-6 sm:p-8">
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-center text-black dark:text-white">Welcome back</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">Sign in to your account</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg p-3 mb-6 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg p-3 text-sm text-black dark:text-white bg-white dark:bg-neutral-900 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg p-3 text-sm text-black dark:text-white bg-white dark:bg-neutral-900 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black dark:bg-white text-white dark:text-black rounded-lg p-3 mt-6 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors active:scale-[0.98]"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-sm mt-6 text-center text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <a href="/signup" className="text-black dark:text-white font-semibold hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}
