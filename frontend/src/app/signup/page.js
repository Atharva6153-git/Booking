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
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-6">
        <h1 className="text-3xl font-bold mb-8 tracking-tight text-center">Create account</h1>

        {error && <p className="text-red-500 text-sm mb-6 text-center">{error}</p>}

        <div className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-md p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
            required
          />
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

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-md p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-all bg-white"
          >
            <option value="customer">Customer</option>
            <option value="provider">Provider</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded-md p-3 mt-6 text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>

        <p className="text-sm mt-6 text-center text-gray-500">
          Already have an account? <a href="/login" className="text-black font-medium hover:underline">Sign in</a>
        </p>
      </form>
    </div>
  );
}