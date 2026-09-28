import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Store } from 'lucide-react';
import { useAuth } from '@/store/auth';
import { homeFor } from '@/lib/routes';
import { ApiError } from '@/lib/api';
import { Button, Input, Alert } from '@/components/ui';

/**
 * Login screen. Connects to the backend auth API via the auth context.
 * Shows validation, loading, and error states.
 */
export function LoginPage() {
  const { status, user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in → send to role home.
  if (status === 'authenticated' && user) {
    return <Navigate to={homeFor(user.role)} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Username dan password wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const loggedIn = await login(username.trim(), password);
      navigate(homeFor(loggedIn.role), { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Username atau password salah.');
      } else if (err instanceof ApiError && err.status === 403) {
        setError('Akun ini dinonaktifkan.');
      } else {
        setError('Gagal terhubung ke server. Coba lagi.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Store className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">POS Toko Bangunan</h1>
          <p className="mt-1 text-sm text-slate-500">Masuk untuk melanjutkan</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >
          {error && <Alert>{error}</Alert>}

          <Input
            label="Username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="owner / kasir"
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <Button type="submit" loading={submitting} className="mt-1 w-full">
            {submitting ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>
      </div>
    </main>
  );
}
