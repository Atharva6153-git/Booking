'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/axios';
import { saveUser, getUser, clearUser } from '@/lib/auth';
import { getSocket } from '@/lib/socket';

const AuthContext = createContext({ user: null, setUser: () => {} });

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(null);
  const [ready, setReady] = useState(false);

  // On every mount, check if the JWT cookie is still valid.
  // If it is, restore (or refresh) the user in localStorage.
  // This means: close tab → reopen → still logged in, correct role, correct data.
  useEffect(() => {
    const restore = async () => {
      // Optimistically show cached user immediately (no flash)
      const cached = getUser();
      if (cached) setUserState(cached);

      try {
        // Verify the cookie is still valid with the backend
        const res = await api.get('/auth/me');
        const freshUser = res.data.user;
        // Merge with any extra fields we store locally (name etc.)
        // /auth/me returns { id, role } — enrich with cached name if available
        const merged = { ...cached, ...freshUser };
        saveUser(merged);
        setUserState(merged);
        // Re-join socket room in case the socket reconnected
        const socket = getSocket();
        socket.emit('join', merged.id);
      } catch {
        // Cookie expired or invalid — clear everything
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

  if (!ready) return null; // Prevent flash of wrong state

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
