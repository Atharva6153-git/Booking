'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { getSocket } from '@/lib/socket';

export default function LoginPage() {
  const router = useRouter();
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

      localStorage.setItem('user', JSON.stringify(user));

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
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-6">
        <h1 className="text-3xl font-bold mb-8 tracking-tight text-center">Welcome back</h1>

        {error && <p className="text-red-500 text-sm mb-6 text-center">{error}</p>}

        <div className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-md p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-md p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-md p-3 mt-6 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Logging in...' : 'Sign In'}
        </button>

        <p className="text-sm mt-6 text-center text-gray-500">
          Don't have an account? <a href="/signup" className="text-black font-medium hover:underline">Sign up</a>
        </p>
      </form>
    </div>
  );
}