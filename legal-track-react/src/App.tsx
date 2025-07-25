// App.tsx - גרסה מתוקנת ומפושטת
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import Store from './store/store';

// Import components
import AuthPage from './pages/AuthPage';
import Register from './components/Register';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from './components/ProtectedLayout';
import HomePage from './pages/HomePage';
import FoldersPage from './pages/FolderPage';
import FolderDetailsPage from './pages/FolderDetailsPage';
import ClientsPage from './pages/ClientsPage';
import DocumentsPage from './pages/DocumentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CalendarPage from './pages/CalendarPage';
import MessagesPage from './pages/MessagesPage';
import SettingsPage from './pages/SettingsPage';
import SupportPage from './pages/SupportPage';
import FolderManagementPage from './pages/FolderManagementPage';
import ErrorBoundary from './components/ErrorBoundary';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: 'Heebo, Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
});

function App() {
  return (
    <ErrorBoundary>
      <Provider store={Store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<AuthPage />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<ProtectedRoute><ProtectedLayout /></ProtectedRoute>}>
                <Route index element={<HomePage />} />
                <Route path="home" element={<HomePage />} />
                <Route path="folders" element={<FoldersPage />} />
                <Route path="folders/:id" element={<FolderDetailsPage />} />
                <Route path="clients" element={<ClientsPage />} />
                <Route path="documents" element={<DocumentsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="calendar" element={<CalendarPage />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="support" element={<SupportPage />} />
                <Route path="folder-management" element={<FolderManagementPage />} />
              </Route>

              {/* Fallback for unknown routes */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;