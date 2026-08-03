'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/axios';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
      router.push('/login');
    }
  };

  if (pathname === '/login' || pathname === '/signup') return null;
  if (!user) return null;

  const customerLinks = [
    { href: '/services', label: 'Browse Services' },
    { href: '/bookings', label: 'My Bookings' },
  ];

  const providerLinks = [
    { href: '/provider/dashboard', label: 'My Services' },
    { href: '/provider/bookings', label: 'Incoming Bookings' },
  ];

  const links = user.role === 'provider' ? providerLinks : customerLinks;

  return (
    <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <div className="flex gap-4 items-center">
        <span className="font-bold text-blue-600">ServiceHub</span>
        {links.map((link) => (
          <a key={link.href} href={link.href} className={pathname === link.href ? 'text-sm text-blue-600 font-medium' : 'text-sm text-gray-600'}>{link.label}</a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">{user.name} ({user.role})</span>
        <button onClick={handleLogout} className="text-sm text-red-600">Logout</button>
      </div>
    </nav>
  );
}