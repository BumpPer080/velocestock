import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const TOKEN_KEY = 'velocestock.authToken';
const USER_KEY = 'velocestock.authUser';

const loadStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => loadStoredUser());
  const [isInitializing, setIsInitializing] = useState(Boolean(localStorage.getItem(TOKEN_KEY)));
  const [isProcessing, setIsProcessing] = useState(false);
  const interceptorIdRef = useRef(null);

  const applyAuthHeader = useCallback(
    (authToken) => {
      if (authToken) {
        axios.defaults.headers.common.Authorization = `Bearer ${authToken}`;
      } else {
        delete axios.defaults.headers.common.Authorization;
      }
    },
    [],
  );

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    applyAuthHeader(null);
  }, [applyAuthHeader]);

  useEffect(() => {
    applyAuthHeader(token);
  }, [applyAuthHeader, token]);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setIsInitializing(false);
        return;
      }
      try {
        const { data } = await axios.get('/api/auth/me');
        setUser(data);
        localStorage.setItem(USER_KEY, JSON.stringify(data));
      } catch (error) {
        clearAuth();
      } finally {
        setIsInitializing(false);
      }
    };
    bootstrap();
  }, [clearAuth, token]);

  useEffect(() => {
    interceptorIdRef.current = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error?.response?.status === 401) {
          clearAuth();
        }
        return Promise.reject(error);
      },
    );
    return () => {
      if (interceptorIdRef.current !== null) {
        axios.interceptors.response.eject(interceptorIdRef.current);
      }
    };
  }, [clearAuth]);

  const login = useCallback(
    async ({ username, password }) => {
      setIsProcessing(true);
      try {
        const { data } = await axios.post('/api/auth/login', { username, password });
        setToken(data.token);
        localStorage.setItem(TOKEN_KEY, data.token);
        setUser(data.user);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        applyAuthHeader(data.token);
        return data.user;
      } finally {
        setIsProcessing(false);
      }
    },
    [applyAuthHeader],
  );

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user,
      token,
      isInitializing,
      isProcessing,
      login,
      logout,
      clearAuth,
    }),
    [clearAuth, isInitializing, isProcessing, login, logout, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};

