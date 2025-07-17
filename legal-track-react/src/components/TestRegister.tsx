// צור קובץ חדש: src/components/TestRegister.tsx
import { useSearchParams, useLocation } from "react-router-dom";
import { Box, Typography, Paper } from "@mui/material";

const TestRegister = () => {
  console.log('=== TEST REGISTER COMPONENT LOADED ===');
  
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const token = searchParams.get("token");
  
  console.log('URL Info:', {
    pathname: location.pathname,
    search: location.search,
    token: token,
    allParams: Object.fromEntries(searchParams.entries()),
    fullURL: window.location.href
  });

  return (
    <Box sx={{ p: 4, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{ p: 4, maxWidth: 600 }}>
        <Typography variant="h4" gutterBottom>
          Register Page - Debug Mode
        </Typography>
        
        <Typography variant="h6" gutterBottom>
          URL Information:
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Full URL:</strong> {window.location.href}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Pathname:</strong> {location.pathname}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Search:</strong> {location.search}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Token:</strong> {token || 'NO TOKEN FOUND'}
        </Typography>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>All Params:</strong> {JSON.stringify(Object.fromEntries(searchParams.entries()))}
        </Typography>

        {token ? (
          <Typography variant="body1" color="success.main" sx={{ mt: 2 }}>
            ✅ Token found! Value: {token}
          </Typography>
        ) : (
          <Typography variant="body1" color="error.main" sx={{ mt: 2 }}>
            ❌ No token found in URL parameters
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default TestRegister;