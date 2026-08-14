import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Guards /admin/* routes. Must be nested inside ProtectedRoute so an
 * unauthenticated user is redirected to /login first; this only checks role.
 */
const AdminRoute = () => {
  const user = useSelector((state) => state.auth.user);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
