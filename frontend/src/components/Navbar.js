'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/axios';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, [pathname]);

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

  const ThemeToggle = ({ className = '' }) => (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-300 ${className}`}
    >
      {theme === 'dark' ? (
        /* Sun icon */
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
        </svg>
      ) : (
        /* Moon icon */
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      )}
    </button>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md border-b border-gray-100 dark:border-neutral-800">
      {/* Main bar */}
      <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <span className="font-bold text-xl tracking-tight text-black dark:text-white">ServiceHub</span>

        {/* Desktop links */}
        <div className="hidden md:flex gap-4 items-center ml-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                pathname === link.href
                  ? 'text-black dark:text-white'
                  : 'text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
          <ThemeToggle />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {user.name} <span className="text-gray-300 dark:text-gray-600">|</span> <span className="capitalize">{user.role}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Mobile right: theme toggle + hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col justify-center items-center w-9 h-9 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors gap-1.5"
            aria-label="Toggle menu"
          >
            <span className={`block h-0.5 w-5 bg-black dark:bg-white transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-5 bg-black dark:bg-white transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-black dark:bg-white transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-4 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-sm font-medium py-2 transition-colors ${
                pathname === link.href
                  ? 'text-black dark:text-white'
                  : 'text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white'
              }`}
            >
              {link.label}
            </a>
          ))}
          <div className="border-t border-gray-100 dark:border-neutral-800 pt-4 flex items-center justify-between">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {user.name} · <span className="capitalize">{user.role}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
