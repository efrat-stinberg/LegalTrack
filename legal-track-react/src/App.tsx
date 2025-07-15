import { Provider, useDispatch, useSelector } from 'react-redux';
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  Navigate,
} from 'react-router-dom';
import { useEffect } from 'react';
import store from './store/store';
import AuthPage from './pages/AuthPage';
import Register from './components/Register';
import FolderManagementPage from './pages/FolderManagementPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from './components/ProtectedLayout';
import FolderDetailsPage from './pages/FolderDetailsPage';
import ClientsPage from './pages/ClientsPage';
import ErrorBoundary from './components/ErrorBoundary';
import { getUserByEmail } from './api/userApi';
import { login } from './store/slices/userSlice';

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<Register />} />
            
            {/* Root redirect */}
            <Route path="/" element={<RootHandler />} />
            
            {/* Protected routes */}
            <Route path="/protected" element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }>
              <Route path="folders" element={<FolderManagementPage />} />
              <Route path="folders/:folderId" element={<FolderDetailsPage />} />
              <Route path="clients" element={<ClientsPage />} />
            </Route>

            {/* Fallback for authenticated users */}
            <Route path="/folders" element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }>
              <Route index element={<FolderManagementPage />} />
              <Route path=":folderId" element={<FolderDetailsPage />} />
            </Route>

            <Route path="/clients" element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ClientsPage />} />
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
}

function RootHandler() {
  const isAuthenticated = useSelector(
    (state: { user: { isAuthenticated: boolean } }) =>
      state.user.isAuthenticated,
  );
  const currentUser = useSelector(
    (state: { user: { currentUser: any } }) =>
      state.user.currentUser,
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('RootHandler: Initializing auth...');
      
      // בדיקה אם יש טוקן בlocalStorage
      const token = localStorage.getItem('token');
      
      if (token && !isAuthenticated) {
        try {
          console.log('RootHandler: Found token, attempting to restore user session');
          
          // נסה לפענח את הטוקן כדי לקבל את האימייל
          const payload = JSON.parse(atob(token.replace(/"/g, '').split('.')[1]));
          const email = payload.email || payload.Email;
          
          if (email) {
            console.log('RootHandler: Restoring user session for:', email);
            const user = await getUserByEmail(email);
            dispatch(login(user));
            console.log('RootHandler: User session restored successfully');
            navigate('/folders', { replace: true });
            return;
          }
        } catch (error) {
          console.error('RootHandler: Failed to restore user session:', error);
          localStorage.removeItem('token');
        }
      }
      
      // אם יש אימות או משתמש נוכחי, נווט לתיקיות
      if (isAuthenticated && currentUser) {
        console.log('RootHandler: User is authenticated, navigating to folders');
        navigate('/folders', { replace: true });
      } else {
        console.log('RootHandler: User not authenticated, navigating to login');
        navigate('/login', { replace: true });
      }
    };

    initializeAuth();
  }, [isAuthenticated, currentUser, navigate, dispatch]);

  return null;
}

export default App;