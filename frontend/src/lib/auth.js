// Auth helpers
//
// User identity (name, role, id) is stored in localStorage so it survives
// page refreshes, tab closes, and reopens — the user stays logged in across
// sessions just like any normal web app.
//
// Security is handled entirely by the httpOnly JWT cookie that the backend sets.
// localStorage only holds non-sensitive display data (name, role, id).
// Even if someone reads localStorage they cannot forge API requests because
// every API call still requires the httpOnly cookie the browser sends automatically.
//
// For multi-tab testing (provider in Tab A, customer in Tab B):
// Use two different browsers or one normal + one incognito window.
// Each browser context has its own cookie jar, so sessions stay separate.

export const saveUser = (user) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearUser = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
};
