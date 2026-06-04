import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import PageLoader from '../ui/PageLoader';

// Gate routes behind the admin role.
export default function AdminRoute() {
  const { user, initializing } = useSelector((s) => s.auth);

  if (initializing) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}
