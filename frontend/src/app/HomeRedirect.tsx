import { Navigate } from 'react-router-dom';
import { useAuth } from '@/store/auth';
import { homeFor } from '@/lib/routes';

/** Sends "/" to the role-appropriate landing page. */
export function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={homeFor(user.role)} replace />;
}
