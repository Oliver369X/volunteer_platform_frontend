'use strict';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
const STORAGE_KEY = 'vip.auth.tokens';

const AuthContext = createContext(undefined);

const readStoredTokens = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const persistTokens = (tokens) => {
  if (!tokens) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const payload = await response.json();
    return payload;
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [status, setStatus] = useState('idle'); // idle | loading | authenticated | unauthenticated
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(() => readStoredTokens());
  const [error, setError] = useState(null);
  const isRefreshing = useRef(false);

  const saveTokens = useCallback((nextTokens) => {
    setTokens(nextTokens);
    persistTokens(nextTokens);
  }, []);

  const clearSession = useCallback(() => {
    saveTokens(null);
    setUser(null);
    setStatus('unauthenticated');
  }, [saveTokens]);

  const refreshTokens = useCallback(async () => {
    if (isRefreshing.current) return null;
    if (!tokens?.refreshToken) return null;
    try {
      isRefreshing.current = true;
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      const payload = await parseResponse(response);

      if (!response.ok) {
        clearSession();
        throw new Error(payload?.message ?? 'No fue posible refrescar la sesión');
      }

      const refreshed = {
        ...tokens,
        accessToken: payload?.data?.accessToken ?? payload?.accessToken,
        refreshToken: payload?.data?.refreshToken ?? payload?.refreshToken,
      };
      saveTokens(refreshed);
      return refreshed;
    } catch (refreshError) {
      clearSession();
      throw refreshError;
    } finally {
      isRefreshing.current = false;
    }
  }, [clearSession, saveTokens, tokens]);

  const authFetch = useCallback(
    async (path, { method = 'GET', body, headers = {}, retry = true, signal } = {}) => {
      if (!tokens?.accessToken) {
        const error = new Error('Sesión no iniciada');
        error.code = 'NO_TOKEN';
        throw error;
      }

      const finalHeaders = {
        Accept: 'application/json',
        ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...headers,
        Authorization: `Bearer ${tokens.accessToken}`,
      };

      const requestInit = {
        method,
        headers: finalHeaders,
        credentials: 'include',
        signal,
        body:
          body instanceof FormData
            ? body
            : body !== undefined
            ? JSON.stringify(body)
            : undefined,
      };

      const response = await fetch(`${API_BASE_URL}${path}`, requestInit);

      if (response.status === 401 && tokens?.refreshToken && retry) {
        const refreshed = await refreshTokens();
        if (refreshed?.accessToken) {
          return authFetch(path, { method, body, headers, retry: false, signal });
        }
      }

      const payload = await parseResponse(response);

      if (!response.ok) {
        const error = new Error(payload?.message ?? 'Error inesperado');
        error.details = payload?.details;
        error.status = response.status;
        throw error;
      }

      return payload?.data ?? payload;
    },
    [refreshTokens, tokens?.accessToken, tokens?.refreshToken],
  );

  const fetchCurrentUser = useCallback(async () => {
    if (!tokens?.accessToken) {
      clearSession();
      return null;
    }
    setStatus('loading');
    try {
      const profile = await authFetch('/auth/me', { method: 'GET' });
      setUser(profile);
      setStatus('authenticated');
      return profile;
    } catch {
      clearSession();
      return null;
    }
  }, [authFetch, clearSession, tokens?.accessToken]);

  useEffect(() => {
    if (!tokens?.accessToken) {
      setStatus('unauthenticated');
      setUser(null);
      return;
    }
    // Solo cargar usuario una vez cuando hay token y no hay usuario
    if (!user) {
      fetchCurrentUser();
    } else {
      setStatus('authenticated');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens?.accessToken]);

  const login = useCallback(
    async ({ email, password }) => {
      setError(null);
      setStatus('loading');
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        });
        const payload = await parseResponse(response);
        if (!response.ok) {
          throw new Error(payload?.message ?? 'No se pudo iniciar sesión');
        }
        const { user: userData, tokens: receivedTokens } = payload.data ?? payload;
        saveTokens(receivedTokens);
        setUser(userData);
        setStatus('authenticated');
        return userData;
      } catch (loginError) {
        setError(loginError.message);
        clearSession();
        throw loginError;
      }
    },
    [clearSession, saveTokens],
  );

  const registerVolunteer = useCallback(
    async (formData) => {
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/auth/register/volunteer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        });
        const payload = await parseResponse(response);
        if (!response.ok) {
          throw new Error(payload?.message ?? 'No se pudo completar el registro');
        }
        const { user: userData, tokens: receivedTokens } = payload.data ?? payload;
        saveTokens(receivedTokens);
        setUser(userData);
        setStatus('authenticated');
        return userData;
      } catch (error) {
        setError(error.message);
        throw error;
      }
    },
    [saveTokens, setError],
  );

  const registerOrganization = useCallback(
    async (formData) => {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/auth/register/organization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const payload = await parseResponse(response);
      if (!response.ok) {
        throw new Error(payload?.message ?? 'No se pudo completar el registro');
      }
      const { user: userData, tokens: receivedTokens } = payload.data ?? payload;
      saveTokens(receivedTokens);
      setUser(userData);
      setStatus('authenticated');
      return userData;
    },
    [saveTokens],
  );

  const logout = useCallback(async () => {
    try {
      if (tokens?.refreshTokenId) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: tokens?.accessToken ? `Bearer ${tokens.accessToken}` : undefined,
          },
          credentials: 'include',
          body: JSON.stringify({ refreshTokenId: tokens.refreshTokenId }),
        });
      }
    } catch {
      // Ignoramos errores en logout para garantizar salida limpia
    } finally {
      clearSession();
    }
  }, [clearSession, tokens?.accessToken, tokens?.refreshTokenId]);

  const value = useMemo(
    () => ({
      status,
      user,
      tokens,
      error,
      login,
      registerVolunteer,
      registerOrganization,
      logout,
      authFetch,
      refreshCurrentUser: fetchCurrentUser,
      setError,
    }),
    [
      authFetch,
      error,
      fetchCurrentUser,
      login,
      logout,
      registerOrganization,
      registerVolunteer,
      status,
      tokens,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext debe utilizarse dentro de AuthProvider');
  }
  return context;
};

