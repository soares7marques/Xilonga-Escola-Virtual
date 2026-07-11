export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';

export const getAuthToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

export const setAuthSession = ({ token, email, role, expiresAt }) => {
  const userData = { email, role, expiresAt };

  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(userData));
};

export const clearAuthSession = () => {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('Ticket');
};

export const getCurrentUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem(USER_KEY)) || {};
  } catch {
    return {};
  }
};

export const isTokenValid = () => {
  const token = getAuthToken();

  if (!token) {
    return false;
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return !payload.exp || payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const apiFetch = (url, options = {}) => {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  const method = (options.method || 'GET').toUpperCase();

  if (
    !headers.has('Content-Type') &&
    !(options.body instanceof FormData) &&
    options.body != null &&
    method !== 'GET' &&
    method !== 'HEAD'
  ) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
};

export const changePassword = async (email, newPassword) => {
  return apiFetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'POST',
    body: JSON.stringify({ email, senha: newPassword }),
  });
};
