// Last-resort screen for render errors. It sits outside the app's ThemeProvider, so it brings its own.
import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, CssBaseline, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AlertTriangle, LogOut, RefreshCw } from 'lucide-react';
import theme, { tokens } from '../theme';

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
    window.location.href = '/#/login';
  };

  public render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box component="main" sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, background: tokens.ground }}>
          <Box
            role="alert"
            sx={{
              width: '100%',
              maxWidth: 520,
              p: { xs: 3, sm: 4 },
              background: tokens.white,
              border: `1px solid ${tokens.border}`,
              borderRadius: `${tokens.radiusLg}px`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, color: tokens.navy700, mb: 1.5 }} aria-hidden="true">
              <AlertTriangle size={22} />
            </Box>
            <Typography variant="h1" sx={{ fontSize: 26, mb: 1 }}>
              משהו השתבש
            </Typography>
            <Typography sx={{ color: tokens.slate, mb: 2.5 }}>
              אירעה שגיאה לא צפויה בתצוגה. רענון הדף פותר את רוב המקרים.
            </Typography>

            {this.state.error?.message && (
              <Box
                sx={{
                  mb: 3,
                  px: 1.75,
                  py: 1.25,
                  background: tokens.ground,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: `${tokens.radius}px`,
                  boxShadow: `inset -3px 0 0 ${tokens.ink}`,
                  fontSize: 13,
                }}
              >
                <strong>פרטי השגיאה: </strong>
                <bdi dir="ltr">{this.state.error.message}</bdi>
                {import.meta.env.DEV && this.state.errorInfo && (
                  <Box component="pre" dir="ltr" sx={{ fontSize: 11, overflow: 'auto', maxHeight: 200, mt: 1, mb: 0, textAlign: 'left' }}>
                    {this.state.errorInfo.componentStack}
                  </Box>
                )}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button variant="contained" startIcon={<RefreshCw size={16} />} onClick={this.handleReload}>
                רענון הדף
              </Button>
              <Button variant="outlined" startIcon={<LogOut size={16} />} onClick={this.handleGoHome}>
                יציאה והתחברות מחדש
              </Button>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
  }
}

export default ErrorBoundary;
