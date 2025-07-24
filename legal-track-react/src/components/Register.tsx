// src/components/Register.tsx - FIXED VERSION
import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { TextField, Button, Snackbar, Box, Alert, Typography, Paper, Avatar, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { UserPlus, Shield, CheckCircle } from "lucide-react";
import { getUserByEmail, apiClient } from "../api/api";
import { login } from "../store/slices/userSlice";
import { useDispatch } from "react-redux";

const RegisterContainer = styled(Paper)(({ theme }) => ({
  maxWidth: 500,
  margin: '0 auto',
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  borderRadius: 20,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.primary.main}08)`,
  border: `1px solid ${theme.palette.primary.main}20`,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
}));

const Register = () => {
  console.log('=== REGISTER COMPONENT MOUNTED ===');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  
  // Only get token from query parameters - this is the fix!
  const token = searchParams.get("token");
  
  console.log('Register component rendered');
  console.log('Search params:', Object.fromEntries(searchParams.entries()));
  console.log('Token from query params:', token);
  console.log('Current URL:', window.location.href);
  
  const [groupId, setGroupId] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('=== TOKEN VALIDATION USEEFFECT ===');
    console.log('Token value:', token);
    console.log('Is token present?', !!token);
    
    const validateToken = async () => {
      if (!token) {
        console.error('No token provided in URL');
        console.log('Current URL:', window.location.href);
        console.log('Search params:', Object.fromEntries(searchParams.entries()));
        setStatus("invalid");
        setErrorMessage("לא נמצא טוקן בקישור");
        return;
      }

      try {
        console.log('Validating token:', token);
        console.log('Full URL:', window.location.href);
        
        // Call API with the token
        const response = await apiClient.post("/invite/validate", { token });
        
        console.log('Token validation response:', response.data);
        
        setGroupId(response.data.groupId);
        setEmail(response.data.email);
        setStatus("valid");
        
      } catch (error: any) {
        console.error('Token validation failed:', error);
        
        let errorMsg = "הטוקן לא תקין או שפג תוקפו";
        
        if (error.response) {
          console.error('API Error Response:', error.response.data);
          console.error('API Error Status:', error.response.status);
          
          if (error.response.status === 400) {
            errorMsg = error.response.data?.message || "הטוקן לא תקין";
          } else if (error.response.status === 404) {
            errorMsg = "הטוקן לא נמצא במערכת";
          } else if (error.response.status === 410) {
            errorMsg = "הטוקן פג תוקף";
          } else {
            errorMsg = error.response.data?.message || error.response.data || errorMsg;
          }
        } else if (error.request) {
          console.error('Network Error:', error.request);
          errorMsg = "שגיאת חיבור לשרת. אנא בדוק את החיבור לאינטרנט.";
        }
        
        setErrorMessage(errorMsg);
        setStatus("invalid");
      }
    };

    validateToken();
  }, [token, searchParams]); // Removed pathToken from dependencies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setErrorMessage("שם הוא שדה חובה");
      setOpenSnackbar(true);
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMessage("הסיסמאות אינן תואמות");
      setOpenSnackbar(true);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("הסיסמה חייבת להכיל לפחות 6 תווים");
      setOpenSnackbar(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log('Submitting registration:', { token, name, password: '***' });
      
      const response = await apiClient.post("/register", { 
        token, 
        name, 
        password 
      });
      
      console.log('Registration response:', response.data);
      
      const tokenValue = response.data.token;

      // Save token to localStorage
      localStorage.setItem("token", JSON.stringify(tokenValue));

      // Fetch user and dispatch login
      const user = await getUserByEmail(email);
      dispatch(login(user));

      navigate("/home", { replace: true });
      
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMsg = "נכשלה ההרשמה. אנא נסה שוב.";
      
      if (error.response) {
        console.error('Registration API Error:', error.response.data);
        console.error('Registration API Status:', error.response.status);
        
        if (error.response.status === 400) {
          errorMsg = error.response.data?.message || "שגיאה בנתונים שנשלחו";
        } else if (error.response.status === 409) {
          errorMsg = "משתמש עם אימייל זה כבר קיים";
        } else {
          errorMsg = error.response.data?.message || error.response.data || errorMsg;
        }
      } else if (error.request) {
        errorMsg = "שגיאת חיבור לשרת. אנא נסה שוב.";
      }
      
      setErrorMessage(errorMsg);
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Debug info for development
  if (process.env.NODE_ENV === 'development') {
    console.log('=== REGISTER COMPONENT STATE ===');
    console.log('Status:', status);
    console.log('Token:', token);
    console.log('Email:', email);
    console.log('GroupId:', groupId);
    console.log('Error:', errorMessage);
  }

  if (status === "loading") {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          בודק טוקן הזמנה...
        </Typography>
        
        {/* Debug info in loading state */}
        {process.env.NODE_ENV === 'development' && (
          <Box mt={2} p={2} bgcolor="background.paper" borderRadius={2}>
            <Typography variant="caption" component="div">
              Debug: Token = {token || 'NULL'}
            </Typography>
            <Typography variant="caption" component="div">
              URL = {window.location.href}
            </Typography>
          </Box>
        )}
      </Box>
    );
  }
  
  if (status === "invalid") {
    return (
      <RegisterContainer elevation={3}>
        <Box textAlign="center">
          <StyledAvatar>
            <Shield size={32} />
          </StyledAvatar>
          
          <Typography variant="h5" fontWeight={700} gutterBottom color="error">
            טוקן לא תקין
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {errorMessage || "הטוקן לא תקין או שפג תוקפו"}
          </Typography>
          
          <Button 
            variant="outlined" 
            onClick={() => navigate('/login')}
            fullWidth
          >
            חזור לעמוד הכניסה
          </Button>
          
          {/* Debug info for invalid token */}
          {process.env.NODE_ENV === 'development' && (
            <Box mt={3} p={2} bgcolor="error.light" borderRadius={2}>
              <Typography variant="caption" component="div" color="error.dark">
                Debug Info:
              </Typography>
              <Typography variant="caption" component="div" color="error.dark">
                Token: {token || 'NULL'}
              </Typography>
              <Typography variant="caption" component="div" color="error.dark">
                Error: {errorMessage}
              </Typography>
              <Typography variant="caption" component="div" color="error.dark">
                Status: {status}
              </Typography>
            </Box>
          )}
        </Box>
      </RegisterContainer>
    );
  }

  return (
    <RegisterContainer elevation={3}>
      <Box textAlign="center" mb={4}>
        <StyledAvatar>
          <UserPlus size={32} />
        </StyledAvatar>
        
        <Typography variant="h4" fontWeight={700} gutterBottom>
          השלמת רישום
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          ברוכים הבאים! אנא השלימו את פרטי הרישום
        </Typography>
        
        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={2}>
          <CheckCircle size={16} color="green" />
          <Typography variant="body2" color="success.main">
            הזמנה תקפה עבור: {email}
          </Typography>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="שם מלא"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          margin="normal"
          variant="outlined"
          disabled={isLoading}
          sx={{ mb: 2 }}
        />
        
        <TextField
          label="אימייל"
          value={email}
          disabled
          fullWidth
          margin="normal"
          variant="outlined"
          sx={{ mb: 2 }}
        />
        
        <TextField
          type="password"
          label="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          margin="normal"
          variant="outlined"
          disabled={isLoading}
          sx={{ mb: 2 }}
          helperText="לפחות 6 תווים"
        />
        
        <TextField
          type="password"
          label="אישור סיסמה"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
          margin="normal"
          variant="outlined"
          disabled={isLoading}
          sx={{ mb: 3 }}
        />
        
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isLoading || !name || !password || !confirmPassword}
          sx={{
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          {isLoading ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={20} color="inherit" />
              רושם...
            </Box>
          ) : (
            "השלם רישום"
          )}
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      
      {/* Debug panel for development */}
      {process.env.NODE_ENV === 'development' && (
        <Box mt={3} p={2} bgcolor="info.light" borderRadius={2}>
          <Typography variant="subtitle2" color="info.dark" gutterBottom>
            Debug Info:
          </Typography>
          <Typography variant="caption" component="div" color="info.dark">
            Token: {token}
          </Typography>
          <Typography variant="caption" component="div" color="info.dark">
            Email: {email}
          </Typography>
          <Typography variant="caption" component="div" color="info.dark">
            GroupId: {groupId}
          </Typography>
          <Typography variant="caption" component="div" color="info.dark">
            Status: {status}
          </Typography>
        </Box>
      )}
    </RegisterContainer>
  );
};

export default Register;