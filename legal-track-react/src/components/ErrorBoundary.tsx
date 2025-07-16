import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 3,
            backgroundColor: '#f5f5f5'
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
              borderRadius: 3
            }}
          >
            <Box mb={3}>
              <AlertTriangle 
                size={64} 
                color="#f44336" 
                style={{ marginBottom: 16 }}
              />
              <Typography variant="h4" gutterBottom color="error">
                אופס! משהו השתבש
              </Typography>
              <Typography variant="body1" color="text.secondary" mb={3}>
                אירעה שגיאה בלתי צפויה באפליקציה. אנא נסה לרענן את הדף.
              </Typography>
            </Box>

            <Alert 
              severity="error" 
              sx={{ mb: 3, textAlign: 'left' }}
            >
              <Typography variant="body2" component="div">
                <strong>שגיאה:</strong> {this.state.error?.message}
              </Typography>
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <Box mt={2}>
                  <Typography variant="caption" component="div">
                    <strong>Stack Trace:</strong>
                  </Typography>
                  <pre style={{ 
                    fontSize: '10px', 
                    overflow: 'auto',
                    maxHeight: '200px',
                    backgroundColor: '#f5f5f5',
                    padding: '8px',
                    borderRadius: '4px',
                    marginTop: '8px'
                  }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </Box>
              )}
            </Alert>

            <Box display="flex" gap={2} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<RefreshCw size={20} />}
                onClick={this.handleReload}
                sx={{ borderRadius: 2 }}
              >
                רענן דף
              </Button>
              <Button
                variant="outlined"
                startIcon={<Home size={20} />}
                onClick={this.handleGoHome}
                sx={{ borderRadius: 2 }}
              >
                חזור לעמוד הבית
              </Button>
            </Box>

            {process.env.NODE_ENV === 'development' && (
              <Box mt={3}>
                <Typography variant="caption" color="text.secondary">
                  מצב פיתוח - מידע נוסף זמין בקונסול
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;