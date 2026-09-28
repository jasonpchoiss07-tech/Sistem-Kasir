import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@/types/auth';
import { tokenStore } from '@/lib/token';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { loginRequest, logoutRequest, meRequest } from '@/features/auth/auth.api';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Holds authentication state for the whole app.
 *
 * On mount, if a token exists we validate it against `GET /auth/me` so a
 * stale/expired/disabled session is cleared before rendering protected UI.
 * Authorization itself always remains enforced by the backend — this state
 * only drives navigation and what the UI offers.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!tokenStore.get()) {
        setStatus('unauthenticated');
        return;
      }
      try {
        const { user: me } = await meRequest();
        if (!active) return;
        setUser(me);
        setStatus('authenticated');
        connectSocket(tokenStore.get()!);
      } catch {
        if (!active) return;
        tokenStore.clear();
        setUser(null);
        setStatus('unauthenticated');
      }
    }

    void bootstrap();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const { token, user: loggedIn } = await loginRequest(username, password);
    tokenStore.set(token);
    setUser(loggedIn);
    setStatus('authenticated');
    connectSocket(token);
    return loggedIn;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Stateless logout: ignore network/API errors, clear locally regardless.
    }
    disconnectSocket();
    tokenStore.clear();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, logout }),
    [user, status, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
