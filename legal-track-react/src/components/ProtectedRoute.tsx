import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);
  const currentUser = useSelector((state: any) => state.user.currentUser);
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        
        if (token) {
          setHasValidToken(true);
        } else {
          setHasValidToken(false);
        }
      } catch (error) {
        console.error('Error checking auth token:', error);
        setHasValidToken(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress />
        <span>טוען...</span>
      </Box>
    );
  }

  // בדיקה מפורטת יותר
  const shouldAllowAccess = (isAuthenticated && currentUser) || hasValidToken;

  if (shouldAllowAccess) {
    return <>{children}</>;
  }

  // אחרת - הפנה ללוגין
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;