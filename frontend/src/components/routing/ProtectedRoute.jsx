import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PageLoader from '../ui/PageLoader';

// Gate routes behind authentication. Waits for the initial session check.
export default function ProtectedRoute() {
  const { user, initializing } = useSelector((s) => s.auth);
  const location = useLocation();

  if (initializing) return <PageLoader />;
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
