import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  useTheme,
  Fade,
  Container,
  useMediaQuery,
  Paper,
  Card,
  CardContent,
  Avatar,
  Chip,
  TextField,
  Button,
  Snackbar,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  alpha
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Scale,
  Shield,
  Globe,
  CheckCircle,
  FileText,
  Users,
  Briefcase,
  Award,
  Lock,
  Mail,
  LogIn,
  Eye,
  EyeOff
} from "lucide-react";
import { loginUser, getUserByEmail } from "../api/api";
import { login } from "../store/slices/userSlice";

// Styled Components (קצרנו את הקוד)
const PageContainer = styled(Box)(() => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: `linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)`,
  position: 'relative',
  paddingTop: 0,
  paddingBottom: '2rem',
}));

const ContentWrapper = styled(Container)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: theme.spacing(6, 2),
  maxWidth: '1400px !important',
  flex: 1,
  width: '100%',

  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4, 1),
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(6),
  width: '100%',
  maxWidth: '1200px',
  alignItems: 'flex-start',

  [theme.breakpoints.down('lg')]: {
    gap: theme.spacing(4),
  },

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(3),
    textAlign: 'center',
  },
}));

const LoginSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 24,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, rgba(255, 255, 255, 0.8))`,
  border: `1px solid rgba(59, 130, 246, 0.1)`,
  backdropFilter: 'blur(20px)',
  boxShadow: `0 20px 40px rgba(0, 0, 0, 0.1)`,
  position: 'relative',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, #3b82f6, #8b5cf6)`,
  },

  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    order: 1,
  },
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

// Login Component
const Login = () => {
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
      const token = await loginUser(email, password);
      localStorage.setItem('token', JSON.stringify(token));
      
      setLoginSuccess(true);
      
      const user = await getUserByEmail(email);
      
      if (!user || !user.email) {
        throw new Error('Invalid user data received from server');
      }
      
      dispatch(login(user));
      
      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 1000);
      
    } catch (error: any) {
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

  const isFormValid = email.trim() && password.trim() && !emailError && !passwordError;

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <StyledTextField
          type="email"
          label="כתובת אימייל"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) validateEmail(e.target.value);
          }}
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
          onChange={(e) => {
            setPassword(e.target.value);
            if (passwordError) validatePassword(e.target.value);
          }}
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
                  {showPassword ? <EyeOff fontSize="small" /> : <Eye fontSize="small" />}
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

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            padding: '12px 16px',
            background: '#f0f9ff',
            borderRadius: 6,
            border: `1px solid ${alpha('#3b82f6', 0.2)}`,
            marginTop: 3,
          }}
        >
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
        </Box>
      </Box>
      
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
    </Box>
  );
};

// Main AuthPage Component
const AuthPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  const features = [
    {
      icon: <FileText size={20} />,
      title: "ניהול מסמכים חכם",
      description: "מערכת מתקדמת לניהול כל התיקים והמסמכים במקום אחד.",
    },
    {
      icon: <Users size={20} />,
      title: "ניהול לקוחות מתקדם",
      description: "מעקב מקצועי אחר פרטי הלקוחות והיסטוריית תיקים.",
    },
    {
      icon: <Shield size={20} />,
      title: "אבטחה ברמה בנקאית",
      description: "הגנה מלאה על מידע רגיש עם הצפנה מתקדמת.",
    },
    {
      icon: <Award size={20} />,
      title: "דוחות ואנליטיקה",
      description: "כלי ניתוח מתקדמים להערכת ביצועים ומעקב.",
    },
  ];

  return (
    <PageContainer>
      <ContentWrapper>
        <MainContent>
          {/* Brand Section */}
          <Box sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={3} mb={4}>
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                  background: `linear-gradient(135deg, #3b82f6, #8b5cf6)`,
                  boxShadow: `0 8px 32px rgba(59, 130, 246, 0.4)`,
                }}
              >
                <Scale size={36} color="white" />
              </Avatar>
              <Box>
                <Typography
                  variant={isMobile ? "h4" : "h3"}
                  sx={{
                    fontWeight: 700,
                    color: '#1e293b',
                    letterSpacing: '-0.025em',
                    mb: 0.5,
                    lineHeight: 1.2
                  }}
                >
                  Legal Manager Pro
                </Typography>
                <Typography
                  variant={isSmall ? "body1" : "h6"}
                  sx={{
                    color: '#64748b',
                    fontWeight: 500
                  }}
                >
                  מערכת ניהול תיקים משפטיים מתקדמת
                </Typography>
              </Box>
            </Box>

            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 600,
                color: '#334155',
                mb: 2,
                lineHeight: 1.3
              }}
            >
              הפתרון המקצועי לעורכי דין מודרניים
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#64748b',
                fontSize: isMobile ? '1rem' : '1.125rem',
                lineHeight: 1.7,
                mb: 4
              }}
            >
              מערכת מתקדמת שפותחה במיוחד לצרכים הייחודיים של משרדי עורכי דין.
              ניהול תיקים, מעקב אחר לקוחות, ארגון מסמכים ועוד - הכל במקום אחד.
            </Typography>

            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={3}>
              {features.map((feature, index) => (
                <Fade in={true} timeout={600 + index * 100} key={index}>
                  <Card>
                    <CardContent sx={{ p: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, #667eea, #764ba2)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                          color: 'white'
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: '#1e293b',
                          mb: 1,
                          fontSize: '1rem'
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748b',
                          lineHeight: 1.5,
                          fontSize: '0.875rem'
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Fade>
              ))}
            </Box>

            <Box display="flex" gap={2} justifyContent="center" mt={4} flexWrap="wrap">
              <Chip
                icon={<CheckCircle size={16} />}
                label="מערכת מאובטחת"
                sx={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontWeight: 600
                }}
              />
              <Chip
                icon={<Globe size={16} />}
                label="זמינות 24/7"
                sx={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  fontWeight: 600
                }}
              />
            </Box>
          </Box>

          {/* Login Section */}
          <LoginSection>
            <Box textAlign="center" mb={4}>
              <Typography
                variant={isMobile ? "h4" : "h3"}
                sx={{
                  fontWeight: 700,
                  color: '#1e293b',
                  mb: 1,
                  letterSpacing: '-0.025em'
                }}
              >
                כניסה למערכת
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: '#64748b',
                  fontSize: '1rem',
                  lineHeight: 1.6
                }}
              >
                אנא הזן את פרטי ההתחברות שלך כדי לגשת למערכת
              </Typography>
            </Box>

            <Login />

            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: '1px solid #e2e8f0'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  background: '#f8fafc',
                  borderRadius: 2,
                  border: '1px solid #e2e8f0',
                  mb: 3
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: 1,
                    background: '#dbeafe',
                    color: '#3b82f6',
                    flexShrink: 0
                  }}
                >
                  <Briefcase size={20} />
                </Box>
                <Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: '#374151',
                      mb: 0.5,
                      fontSize: '1rem'
                    }}
                  >
                    גישה מוגבלת למשרדי עורכי דין
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      fontSize: '0.875rem',
                      lineHeight: 1.4
                    }}
                  >
                    המערכת מיועדת למשרדי עורכי דין מורשים בלבד.
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#94a3b8',
                    fontSize: '0.75rem'
                  }}
                >
                  © 2025 Legal Manager Pro - כל הזכויות שמורות
                </Typography>
              </Box>
            </Box>
          </LoginSection>
        </MainContent>
      </ContentWrapper>
    </PageContainer>
  );
};

export default AuthPage;