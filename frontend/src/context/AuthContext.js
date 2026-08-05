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
  // Seed from localStorage immediately — Navbar renders on first paint
  const [user, setUserState] = useState(() => getUser());
  // ready = the /auth/me check has settled (success or failure)
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restore = async () => {
      const cached = getUser();

      try {
        // Verify cookie with backend and get fresh user data from DB
        const res = await api.get('/auth/me');
        const fresh = res.data.user;
        const merged = { ...(cached || {}), ...fresh };
        saveUser(merged);
        setUserState(merged);
        // Re-join socket room for real-time events
        const socket = getSocket();
        socket.emit('join', merged.id);
      } catch (err) {
        // If we have a cached user (i.e. they were logged in before), keep them.
        // The /auth/me failure could be a network error, missing NODE_ENV on
        // the server, or a brief Render cold-start — we don't want to force a
        // logout on every network hiccup.
        // Only clear if the server explicitly said the session is invalid (401)
        // AND there's no cached user to fall back on.
        const status = err?.response?.status;
        if (status === 401 && !cached) {
          // Definitely not logged in — no cache, no valid cookie
          clearUser();
          setUserState(null);
        }
        // If there IS a cached user and /auth/me failed, keep the cached user.
        // Pages will still call the API and get a 401 if the cookie is truly gone,
        // at which point they show appropriate errors — but we don't redirect blindly.
        if (cached && !user) {
          setUserState(cached);
        }
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

  return (
    <AuthContext.Provider value={{ user, ready, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
