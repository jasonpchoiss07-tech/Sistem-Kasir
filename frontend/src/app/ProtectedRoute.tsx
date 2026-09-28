import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { LoadingScreen } from '@/components/ui';

/**
 * Gates all authenticated areas. While the session is being validated we show
 * a loading screen; unauthenticated users are redirected to /login.
 *
 * Note: this only controls navigation/UX. Real authorization is enforced by
 * the backend on every request.
 */
export function ProtectedRoute() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen />;
  }
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
