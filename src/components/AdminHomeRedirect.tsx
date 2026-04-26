import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAdminHomePath } from '../utils/adminNavigation';

export const AdminHomeRedirect = () => {
  const { user } = useAuth();

  return <Navigate to={getAdminHomePath(user)} replace />;
};
