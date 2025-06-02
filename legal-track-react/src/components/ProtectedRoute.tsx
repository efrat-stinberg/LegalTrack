import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};
export default ProtectedRoute;