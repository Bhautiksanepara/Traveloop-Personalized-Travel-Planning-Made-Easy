import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, usersApi } from '../lib/api';
import {
  clearSession,
  getStoredRefreshToken,
  getStoredUser,
  storeSession
} from '../lib/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredUser()));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const profile = await usersApi.me();
        if (mounted) {
          setUser(profile.data);
          setIsAuthenticated(true);
        }
      } catch {
        clearSession();
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    if (getStoredRefreshToken()) {
      bootstrap();
    } else {
      setLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      loading,
      async login(payload) {
        const response = await authApi.login(payload);
        storeSession(response.data);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data;
      },
      async signup(payload) {
        const response = await authApi.signup(payload);
        storeSession(response.data);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return response.data;
      },
      async logout() {
        const refreshToken = getStoredRefreshToken();
        try {
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } catch {
          // Keep local logout resilient even if the server rejects the token.
        } finally {
          clearSession();
          setUser(null);
          setIsAuthenticated(false);
        }
      },
      async refreshProfile() {
        const response = await usersApi.me();
        setUser(response.data);
        storeSession({ user: response.data });
        return response.data;
      }
    }),
    [isAuthenticated, loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
