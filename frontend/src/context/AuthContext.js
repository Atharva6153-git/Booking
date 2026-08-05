'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { saveUser, getUser, clearUser } from '@/lib/auth';
import { getSocket } from '@/lib/socket';

const AuthContext = createContext({
  user: null,
  ready: false,
  setUser: () => {},
});

export function AuthProvider({ children }) {
  // Seed state from localStorage immediately so Navbar renders on first paint
  const [user, setUserState] = useState(() => getUser());
  // ready = /auth/me check has completed (used by pages, NOT the Navbar)
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restore = async () => {
      const cached = getUser();
      // Apply cached value right away — no flash of empty Navbar
      if (cached) setUserState(cached);

      try {
        // Confirm the JWT cookie is still valid and get fresh user data
        const res = await api.get('/auth/me');
        const fresh = res.data.user;
        // Merge — /auth/me gives us id + name + email + role from DB
        const merged = { ...(cached || {}), ...fresh };
        saveUser(merged);
        setUserState(merged);
        // Re-join socket room so real-time events keep working
        const socket = getSocket();
        socket.emit('join', merged.id);
      } catch {
        // Cookie invalid/expired — treat as logged out
        clearUser();
        setUserState(null);
      } finally {
        setReady(true);
      }
    };

    restore();
  }, []);

  const setUser = (u) => {
    if (u) {
      saveUser(u);
    } else {
      clearUser();
    }
    setUserState(u);
  };

  // IMPORTANT: always render children — never block on ready.
  // The Navbar reads `user` from context and shows instantly from localStorage.
  // Individual pages can check `ready` if they need to know auth is confirmed.
  return (
    <AuthContext.Provider value={{ user, ready, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
