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
  alpha,
  Tooltip
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { 
  Mail, 
  Lock, 
  LogIn,
  Shield,
  CheckCircle
} from "lucide-react";
import { getUserByEmail, loginUser } from "../api/api";
import { login } from "../store/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from '@mui/icons-material';


const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const FormContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 400,
  margin: '0 auto',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    background: alpha(theme.palette.background.paper, 0.9),
    backdropFilter: 'blur(20px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
    
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
      borderColor: alpha(theme.palette.primary.main, 0.3),
    },
    
    '&.Mui-focused': {
      transform: 'translateY(-2px)',
      boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
      borderColor: theme.palette.primary.main,
    },
    
    '&.Mui-error': {
      animation: `${shake} 0.6s ease-in-out`,
      borderColor: theme.palette.error.main,
    }
  },
  
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    fontWeight: 500,
    
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    }
  },
  
  '& .MuiInputAdornment-root': {
    '& svg': {
      transition: 'color 0.3s ease',
    }
  },
  
  '&:hover .MuiInputAdornment-root svg': {
    color: theme.palette.primary.main,
  }
}));

const LoginButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(2, 4),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  fontWeight: 700,
  fontSize: '1.1rem',
  textTransform: 'none',
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.4)}`,
    
    '&::before': {
      opacity: 1,
    }
  },
  
  '&:active': {
    transform: 'translateY(-1px)',
  },
  
  '&:disabled': {
    background: alpha(theme.palette.action.disabled, 0.12),
    color: theme.palette.action.disabled,
    transform: 'none',
    boxShadow: 'none',
    
    '&::before': {
      opacity: 0,
    }
  },
  
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1),
    transition: 'transform 0.3s ease',
  },
  
  '&:hover .MuiButton-startIcon': {
    transform: 'translateX(2px)',
  }
}));

const PasswordStrengthIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
}));

const StrengthBar = styled(Box)<{ active: boolean }>(({ theme, active }) => ({
  height: 3,
  flex: 1,
  borderRadius: 2,
  background: active 
    ? `linear-gradient(90deg, ${theme.palette.error.main}, ${theme.palette.warning.main}, ${theme.palette.success.main})`
    : alpha(theme.palette.action.disabled, 0.2),
  transition: 'all 0.3s ease',
}));

const SecurityBadge = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 2),
  background: alpha(theme.palette.success.main, 0.1),
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
  marginTop: theme.spacing(2),
  animation: `${float} 3s ease-in-out infinite`,
}));

const LoadingSpinner = styled(CircularProgress)(({ theme }) => ({
  color: 'white',
  '& .MuiCircularProgress-circle': {
    strokeLinecap: 'round',
  }
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

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return 0;
    if (password.length < 4) return 1;
    if (password.length < 8) return 2;
    return 3;
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
      
      // שלב 1: התחברות וקבלת טוקן
      const token = await loginUser(email, password);
      console.log('Login: Token received successfully');
      
      // שלב 2: שמירת הטוקן
      localStorage.setItem('token', JSON.stringify(token));
      console.log('Login: Token saved to localStorage');
      
      // אנימציית הצלחה
      setLoginSuccess(true);
      
      // שלב 3: קבלת נתוני המשתמש
      console.log('Login: Fetching user data for:', email);
      const user = await getUserByEmail(email);
      console.log('Login: User data received:', user);
      
      // וידוא שיש נתונים בסיסיים
      if (!user || !user.email) {
        throw new Error('Invalid user data received from server');
      }
      
      // שלב 4: עדכון Redux state
      console.log('Login: Updating Redux state with user:', user);
      dispatch(login(user));
      
      // שלב 5: המתנה קצרה לוודא שה-state התעדכן ואז ניווט
      setTimeout(() => {
        console.log('Login: Navigating to folders page...');
        navigate("/folders", { replace: true });
      }, 1000);
      
    } catch (error: any) {
      console.error("Login failed:", error);
      setLoginSuccess(false);
      
      // הצגת שגיאה מפורטת יותר
      let errorMsg = "התחברות נכשלה. אנא בדוק את הפרטים שלך.";
      
      if (error.response) {
        // שגיאה מהשרת
        if (error.response.status === 401) {
          errorMsg = "אימייל או סיסמה שגויים";
        } else if (error.response.status === 429) {
          errorMsg = "יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר";
        } else {
          errorMsg = error.response.data?.message || `שגיאת שרת: ${error.response.status}`;
        }
      } else if (error.request) {
        // בעיית רשת
        errorMsg = "בעיית חיבור לשרת. אנא בדוק את החיבור לאינטרנט.";
      } else {
        // שגיאה אחרת
        errorMsg = error.message || "אירעה שגיאה לא צפויה.";
      }
      
      setErrorMessage(errorMsg);
      setOpenSnackbar(true);
      
      // ניקוי טוקן במקרה של שגיאה
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

  const passwordStrength = getPasswordStrength(password);
  const isFormValid = email.trim() && password.trim() && !emailError && !passwordError;

  return (
    <FormContainer>
      <Fade in={true} timeout={800}>
        <Box component="form" onSubmit={handleSubmit}>
          <Box mb={4}>
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
              margin="normal"
              variant="outlined"
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Mail size={20} />
                  </InputAdornment>
                ),
                endAdornment: email && !emailError && (
                  <InputAdornment position="end">
                    <CheckCircle size={20} color={theme.palette.success.main} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  animation: emailError ? `${shake} 0.6s ease-in-out` : 'none',
                }
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
              margin="normal"
              variant="outlined"
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock size={20} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}>
                      <IconButton onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  animation: passwordError ? `${shake} 0.6s ease-in-out` : 'none',
                }
              }}
            />

            {password && (
              <PasswordStrengthIndicator>
                {[1, 2, 3].map((level) => (
                  <StrengthBar key={level} active={passwordStrength >= level} />
                ))}
              </PasswordStrengthIndicator>
            )}
          </Box>

          <LoginButton 
            type="submit" 
            variant="contained"
            fullWidth
            size="large"
            disabled={isLoading || !isFormValid}
            startIcon={
              isLoading ? (
                <LoadingSpinner size={20} />
              ) : loginSuccess ? (
                <CheckCircle size={20} />
              ) : (
                <LogIn size={20} />
              )
            }
            sx={{
              animation: loginSuccess ? `${pulse} 0.6s ease-in-out` : 'none',
              background: loginSuccess 
                ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
                : undefined,
            }}
          >
            {isLoading ? 'מתחבר...' : loginSuccess ? 'התחברות הושלמה!' : 'התחבר'}
          </LoginButton>

          <SecurityBadge>
            <Shield size={16} color={theme.palette.success.main} />
            <Typography variant="caption" color="success.main" fontWeight={600}>
              חיבור מאובטח SSL
            </Typography>
          </SecurityBadge>
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
            borderRadius: 3,
            boxShadow: `0 8px 32px ${alpha(theme.palette.error.main, 0.2)}`,
          }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </FormContainer>
  );
};

export default Login;