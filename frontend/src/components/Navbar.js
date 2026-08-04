'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/axios';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      {/* Main bar */}
      <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <span className="font-bold text-xl tracking-tight text-black">ServiceHub</span>

        {/* Desktop links */}
        <div className="hidden md:flex gap-4 items-center ml-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${pathname === link.href ? 'text-black' : 'text-gray-400 hover:text-black'}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-4 ml-auto">
          <span className="text-sm font-medium text-gray-500">
            {user.name} <span className="text-gray-300">|</span> <span className="capitalize">{user.role}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-black hover:text-gray-600 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Hamburger button (mobile only) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-md hover:bg-gray-100 transition-colors gap-1.5"
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-5 bg-black transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block h-0.5 w-5 bg-black transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-5 bg-black transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium py-2 transition-colors ${pathname === link.href ? 'text-black' : 'text-gray-500 hover:text-black'}`}
            >
              {link.label}
            </a>
          ))}
          <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {user.name} · <span className="capitalize">{user.role}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-black hover:text-gray-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
