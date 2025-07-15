import { Provider, useSelector } from 'react-redux';
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

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/folders" replace />} />
            <Route path="folders" element={<FolderManagementPage />} />
            <Route path="folders/:folderId" element={<FolderDetailsPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="*" element={<Navigate to="/folders" replace />} />
          </Route>

          {/* Main route handler */}
          <Route path="/" element={<Main />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

function Main() {
  const isAuthenticated = useSelector(
    (state: { user: { isAuthenticated: boolean } }) =>
      state.user.isAuthenticated,
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/folders', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return null; // או spinner
}

export default App;