import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useSelector((state: any) => state.user.isAuthenticated);
  const currentUser = useSelector((state: any) => state.user.currentUser);
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidToken, setHasValidToken] = useState(false);

  console.log('ProtectedRoute: Current state:', { isAuthenticated, currentUser: !!currentUser });

  useEffect(() => {
    // בדיקת טוקן בlocalStorage
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        console.log('ProtectedRoute: Checking token:', !!token);
        
        if (token) {
          // נוכל להוסיף כאן בדיקה נוספת של תוקף הטוקן
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
    console.log('ProtectedRoute: Still loading...');
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  // בדיקה מפורטת יותר
  const shouldAllowAccess = (isAuthenticated && currentUser) || hasValidToken;
  
  console.log('ProtectedRoute: Access decision:', {
    isAuthenticated,
    hasCurrentUser: !!currentUser,
    hasValidToken,
    shouldAllowAccess
  });

  if (shouldAllowAccess) {
    return <>{children}</>;
  }

  // אחרת - הפנה ללוגין
  console.log('ProtectedRoute: Redirecting to login');
  return <Navigate to="/login" replace />;
};

export default ProtectedRoute;