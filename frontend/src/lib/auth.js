// Auth helpers — use sessionStorage so each browser tab keeps its own session.
// This prevents the "last login overwrites" problem when testing provider/customer
// accounts in different tabs of the same browser.

export const saveUser = (user) => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearUser = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('user');
};
