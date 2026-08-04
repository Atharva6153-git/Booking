'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'customer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/signup', form);
      router.push('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-6 sm:p-8">
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-center text-black dark:text-white">Create account</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">Join ServiceHub today</p>

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm rounded-lg p-3 mb-6 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
            <input
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg p-3 text-sm text-black dark:text-white bg-white dark:bg-neutral-900 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
              required
            />
          </div>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">I am a</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg p-3 text-sm text-black dark:text-white bg-white dark:bg-neutral-900 focus:border-black dark:focus:border-white focus:ring-1 focus:ring-black dark:focus:ring-white outline-none transition-all"
            >
              <option value="customer">Customer</option>
              <option value="provider">Provider</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black dark:bg-white text-white dark:text-black rounded-lg p-3 mt-6 text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 transition-colors active:scale-[0.98]"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="text-sm mt-6 text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <a href="/login" className="text-black dark:text-white font-semibold hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
