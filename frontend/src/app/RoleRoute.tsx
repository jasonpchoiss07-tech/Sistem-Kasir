import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { homeFor } from '@/lib/routes';
import type { Role } from '@/types/auth';

/**
 * Restricts a group of routes to a single role. If the current user has a
 * different role, they are redirected to their own home area.
 *
 * This is a UX guard only; the backend still authorizes every API call.
 */
export function RoleRoute({ allow }: { allow: Role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== allow) return <Navigate to={homeFor(user.role)} replace />;

  return <Outlet />;
}
