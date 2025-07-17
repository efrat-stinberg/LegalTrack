// src/App.tsx - תיקון לטיפול נכון ברישום
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
import Register from './components/Register'; // ודא שזה הקומפוננט הנכון
import HomePage from './pages/HomePage';
import FolderDetailsPage from './pages/FolderDetailsPage';
import ClientsPage from './pages/ClientsPage';
import FoldersPage from './pages/FolderPage';
import FolderManagementPage from './pages/FolderManagementPage';
import LandingPage from './pages/LoginPage';

import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from './components/ProtectedLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { getUserByEmail } from './api/userApi';
import { login } from './store/slices/userSlice';
import DocumentsPage from './pages/DocumentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import MessagesPage from './pages/MessagesPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';

// הוסף את זה בתחילת App.tsx כדי לבדוק routing
import { useLocation } from 'react-router-dom';

// הוסף קומפוננט זה ב-App.tsx
function DebugRouter() {
  const location = useLocation();
  
  console.log('=== ROUTER DEBUG ===');
  console.log('Current pathname:', location.pathname);
  console.log('Current search:', location.search);
  console.log('Current hash:', location.hash);
  console.log('Full location:', location);
  console.log('Window URL:', window.location.href);
  
  return null;
}

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <DebugRouter />
          <Routes>
            {/* Public routes */}
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage />} />
            
            {/* Register route - ללא התנאי protected */}
            <Route path="/register" element={<Register />} />
            
            {/* Root redirect */}
            <Route path="/" element={<RootHandler />} />
            
            {/* Protected routes with layout */}
            <Route path="/protected" element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }>
              {/* עמוד הבית */}
              <Route path="home" element={<HomePage />} />
              
              {/* ניהול תיקיות */}
              <Route path="folders" element={<FoldersPage />} />
              <Route path="folders-management" element={<FolderManagementPage />} />
              <Route path="folders/:folderId" element={<FolderDetailsPage />} />
              
              {/* ניהול נתונים */}
              <Route path="clients" element={<ClientsPage />} />
              <Route path="documents" element={<DocumentsPage />} />
              
              {/* כלים וניתוח */}
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="messages" element={<MessagesPage />} />
              
              {/* הגדרות ותמיכה */}
              <Route path="settings" element={<SettingsPage />} />
              <Route path="support" element={<SupportPage />} />
            </Route>

            {/* Direct protected routes (fallback for old URLs) */}
            <Route path="/home" element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }>
              <Route index element={<HomePage />} />
            </Route>

            <Route path="/folders" element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }>
              <Route index element={<FoldersPage />} />
              <Route path=":folderId" element={<FolderDetailsPage />} />
            </Route>

            <Route path="/clients" element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }>
              <Route index element={<ClientsPage />} />
            </Route>

            <Route path="/documents" element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }>
              <Route index element={<DocumentsPage />} />
            </Route>

            <Route path="/analytics" element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AnalyticsPage />} />
            </Route>

            <Route path="/calendar" element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }>
              <Route index element={<CalendarPage />} />
            </Route>

            <Route path="/messages" element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }>
              <Route index element={<MessagesPage />} />
            </Route>

            <Route path="/settings" element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }>
              <Route index element={<SettingsPage />} />
            </Route>

            <Route path="/support" element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }>
              <Route index element={<SupportPage />} />
            </Route>

            {/* Catch all - redirect to home */}
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
            navigate('/home', { replace: true });
            return;
          }
        } catch (error) {
          console.error('RootHandler: Failed to restore user session:', error);
          localStorage.removeItem('token');
        }
      }
      
      // אם יש אימות או משתמש נוכחי, נווט לעמוד הבית
      if (isAuthenticated && currentUser) {
        console.log('RootHandler: User is authenticated, navigating to home');
        navigate('/home', { replace: true });
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