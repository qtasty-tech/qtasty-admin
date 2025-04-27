import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';


const ProtectedRoute = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;