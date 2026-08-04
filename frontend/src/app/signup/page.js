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
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-6 sm:p-8">
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-center text-black">Create account</h1>
        <p className="text-sm text-gray-500 text-center mb-8">Join ServiceHub today</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-6 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
            <input
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">I am a</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg p-3 text-sm text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white"
            >
              <option value="customer">Customer</option>
              <option value="provider">Provider</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-lg p-3 mt-6 text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors active:scale-[0.98]"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="text-sm mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-black font-semibold hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
