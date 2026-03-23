import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute() {
  const { user, isAuthLoading } = useAuth();
  if (isAuthLoading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>Loading...</div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
