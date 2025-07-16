import React, { useState } from 'react';
import { useDispatch } from "react-redux";
import { 
  TextField, 
  Button,  
  Snackbar, 
  Box,
  InputAdornment,
  IconButton,
  Alert,
  Typography,
  Fade,
  CircularProgress,
  useTheme,
  alpha
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { 
  Mail, 
  Lock, 
  LogIn,
  CheckCircle
} from "lucide-react";
import { getUserByEmail, loginUser } from "../api/api";
import { login } from "../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from '@mui/icons-material';

const FormContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 400,
  margin: '0 auto',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 6,
    background: '#ffffff',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
    
    '& fieldset': {
      borderColor: alpha('#64748b', 0.3),
      borderWidth: '1px',
    },
    
    '&:hover fieldset': {
      borderColor: alpha('#3b82f6', 0.5),
    },
    
    '&.Mui-focused fieldset': {
      borderColor: '#3b82f6',
      borderWidth: '2px',
    },
    
    '&.Mui-error fieldset': {
      borderColor: '#ef4444',
    }
  },
  
  '& .MuiInputLabel-root': {
    color: '#64748b',
    fontSize: '0.875rem',
    
    '&.Mui-focused': {
      color: '#3b82f6',
    },
    
    '&.Mui-error': {
      color: '#ef4444',
    }
  },
  
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
    color: '#0f172a',
    padding: '12px 14px',
  },
  
  '& .MuiFormHelperText-root': {
    fontSize: '0.75rem',
    marginLeft: 0,
    marginRight: 0,
    marginTop: theme.spacing(0.5),
    
    '&.Mui-error': {
      color: '#ef4444',
    }
  }
}));

const LoginButton = styled(Button)(({ theme }) => ({
  borderRadius: 6,
  padding: theme.spacing(1.5, 3),
  background: '#3b82f6',
  color: '#ffffff',
  fontWeight: 500,
  fontSize: '0.875rem',
  textTransform: 'none',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  transition: 'all 0.2s ease',
  border: 'none',
  
  '&:hover': {
    background: '#2563eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  
  '&:active': {
    background: '#1d4ed8',
    transform: 'translateY(1px)',
  },
  
  '&:disabled': {
    background: '#e2e8f0',
    color: '#94a3b8',
    cursor: 'not-allowed',
    boxShadow: 'none',
    transform: 'none',
    
    '&:hover': {
      background: '#e2e8f0',
    }
  }
}));

const SecurityBadge = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1.5, 2),
  background: '#f0f9ff',
  borderRadius: 6,
  border: `1px solid ${alpha('#3b82f6', 0.2)}`,
  marginTop: theme.spacing(3),
}));

const Login: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("אימייל הוא שדה חובה");
      return false;
    } else if (!emailRegex.test(email)) {
      setEmailError("אימייל לא תקין");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("סיסמה היא שדה חובה");
      return false;
    } else if (password.length < 3) {
      setPasswordError("סיסמה חייבת להכיל לפחות 3 תווים");
      return false;
    } else {
      setPasswordError("");
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      console.log('Login: Starting login process for:', email);
      
      const token = await loginUser(email, password);
      console.log('Login: Token received successfully');
      
      localStorage.setItem('token', JSON.stringify(token));
      console.log('Login: Token saved to localStorage');
      
      setLoginSuccess(true);
      
      console.log('Login: Fetching user data for:', email);
      const user = await getUserByEmail(email);
      console.log('Login: User data received:', user);
      
      if (!user || !user.email) {
        throw new Error('Invalid user data received from server');
      }
      
      console.log('Login: Updating Redux state with user:', user);
      dispatch(login(user));
      
      setTimeout(() => {
        console.log('Login: Navigating to home page...');
        navigate("/home", { replace: true });
      }, 1000);
      
    } catch (error: any) {
      console.error("Login failed:", error);
      setLoginSuccess(false);
      
      let errorMsg = "התחברות נכשלה. אנא בדוק את הפרטים שלך.";
      
      if (error.response) {
        if (error.response.status === 401) {
          errorMsg = "אימייל או סיסמה שגויים";
        } else if (error.response.status === 429) {
          errorMsg = "יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר";
        } else {
          errorMsg = error.response.data?.message || `שגיאת שרת: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMsg = "בעיית חיבור לשרת. אנא בדוק את החיבור לאינטרנט.";
      } else {
        errorMsg = error.message || "אירעה שגיאה לא צפויה.";
      }
      
      setErrorMessage(errorMsg);
      setOpenSnackbar(true);
      
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      validateEmail(value);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (passwordError) {
      validatePassword(value);
    }
  };

  const isFormValid = email.trim() && password.trim() && !emailError && !passwordError;

  return (
    <FormContainer>
      <Fade in={true} timeout={600}>
        <Box component="form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <StyledTextField
              type="email"
              label="כתובת אימייל"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => validateEmail(email)}
              error={!!emailError}
              helperText={emailError}
              required
              fullWidth
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={16} color="#64748b" />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              type={showPassword ? "text" : "password"}
              label="סיסמה"
              value={password}
              onChange={handlePasswordChange}
              onBlur={() => validatePassword(password)}
              error={!!passwordError}
              helperText={passwordError}
              required
              fullWidth
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={16} color="#64748b" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton 
                      onClick={togglePasswordVisibility} 
                      edge="end"
                      size="small"
                      sx={{ color: '#64748b' }}
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <LoginButton 
              type="submit" 
              variant="contained"
              fullWidth
              size="large"
              disabled={isLoading || !isFormValid}
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : loginSuccess ? (
                  <CheckCircle size={16} />
                ) : (
                  <LogIn size={16} />
                )
              }
            >
              {isLoading ? 'מתחבר...' : loginSuccess ? 'התחברות הושלמה!' : 'התחבר למערכת'}
            </LoginButton>

            <SecurityBadge>
              <CheckCircle size={16} color="#10b981" />
              <Typography 
                variant="body2" 
                sx={{ 
                  color: '#0f172a',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                חיבור מוצפן ומאובטח SSL
              </Typography>
            </SecurityBadge>
          </Box>
        </Box>
      </Fade>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="error" 
          sx={{ 
            width: '100%',
            borderRadius: 2,
            fontSize: '0.875rem'
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </FormContainer>
  );
};

export default Login;