// HashRouter (URLs like /#/home): the static host only serves index.html at "/", so deep links and refreshes must not need server rewrites
import { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CircularProgress } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Store from './store/store';
import theme from './theme';

import AuthPage from './pages/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from './components/ProtectedLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages load on demand, so the first visit downloads only the shell and the page being opened
const Register = lazy(() => import('./components/Register'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const FoldersPage = lazy(() => import('./pages/FolderPage'));
const FolderDetailsPage = lazy(() => import('./pages/FolderDetailsPage'));
const ClientsPage = lazy(() => import('./pages/ClientsPage'));
const DocumentsPage = lazy(() => import('./pages/DocumentsPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const SupportPage = lazy(() => import('./pages/SupportPage'));

const PageLoading = () => (
  <Box role="status" aria-label="טוען" sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
    <CircularProgress size={24} />
  </Box>
);

function App() {
  return (
    <ErrorBoundary>
      <Provider store={Store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Suspense fallback={<PageLoading />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
                  <Route index element={<Navigate to="/home" replace />} />
                  <Route path="home" element={<HomePage />} />
                  <Route path="folders" element={<FoldersPage />} />
                  <Route path="folders/:id" element={<FolderDetailsPage />} />
                  <Route path="clients" element={<ClientsPage />} />
                  <Route path="documents" element={<DocumentsPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="support" element={<SupportPage />} />
                  {/* The old "advanced case management" page was merged into /folders */}
                  <Route path="folder-management" element={<Navigate to="/folders" replace />} />
                </Route>

                {/* Fallback for unknown routes */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
