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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
      <div className="flex gap-6 items-center">
        <span className="font-bold text-xl tracking-tight text-black">ServiceHub</span>
        <div className="flex gap-4 ml-4">
          {links.map((link) => (
            <a key={link.href} href={link.href} className={`text-sm font-medium transition-colors ${pathname === link.href ? 'text-black' : 'text-gray-400 hover:text-black'}`}>
              {link.label}
            </a>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-500">{user.name} <span className="text-gray-300">|</span> <span className="capitalize">{user.role}</span></span>
        <button onClick={handleLogout} className="text-sm font-medium text-black hover:text-gray-600 transition-colors">Logout</button>
      </div>
    </nav>
  );
}