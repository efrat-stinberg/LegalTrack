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
  TextField,
  Button,
  Snackbar,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  alpha,
  Card,
  CardContent,
  Chip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Scale,
  Shield,
  CheckCircle,
  FileText,
  Users,
  Briefcase,
  Lock,
  Mail,
  LogIn,
  Eye,
  EyeOff,
  Zap,
  Sparkles,
  Cpu,
  Bot
} from "lucide-react";
import { loginUser, getUserByEmail } from "../api/api";
import { login } from "../store/slices/userSlice";

// Styled Components
const PageContainer = styled(Box)(() => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: `
    radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #2d3748 100%)
  `,
  position: 'relative',
  paddingTop: 0,
  paddingBottom: '2rem',
  color: '#f0f6fc'
}));

const ContentWrapper = styled(Container)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
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
  gridTemplateColumns: '1.2fr 1fr',
  gap: theme.spacing(8),
  width: '100%',
  maxWidth: '1200px',
  alignItems: 'center',

  [theme.breakpoints.down('lg')]: {
    gap: theme.spacing(6),
  },

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(4),
    textAlign: 'center',
  },
}));

const LoginSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 24,
  background: 'rgba(13, 17, 23, 0.8)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(56, 189, 248, 0.2)',
  boxShadow: `
    0 20px 40px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1)
  `,
  position: 'relative',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background: `linear-gradient(90deg, #38bdf8, #8b5cf6)`,
    borderRadius: '24px 24px 0 0',
  },

  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
    order: 1,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: 'rgba(33, 38, 45, 0.8)',
    transition: 'all 0.2s ease',
    fontSize: '0.875rem',
    color: '#f0f6fc',
    
    '& fieldset': {
      borderColor: 'rgba(139, 148, 158, 0.3)',
      borderWidth: '1px',
    },
    
    '&:hover fieldset': {
      borderColor: 'rgba(56, 189, 248, 0.5)',
    },
    
    '&.Mui-focused fieldset': {
      borderColor: '#38bdf8',
      borderWidth: '2px',
    },
    
    '&.Mui-error fieldset': {
      borderColor: '#f87171',
    }
  },
  
  '& .MuiInputLabel-root': {
    color: '#8b949e',
    fontSize: '0.875rem',
    
    '&.Mui-focused': {
      color: '#38bdf8',
    },
    
    '&.Mui-error': {
      color: '#f87171',
    }
  },
  
  '& .MuiInputBase-input': {
    fontSize: '0.875rem',
    color: '#f0f6fc',
    padding: '12px 14px',
  },
  
  '& .MuiFormHelperText-root': {
    fontSize: '0.75rem',
    marginLeft: 0,
    marginRight: 0,
    marginTop: theme.spacing(0.5),
    color: '#8b949e',
    
    '&.Mui-error': {
      color: '#f87171',
    }
  }
}));

const LoginButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 3),
  background: 'linear-gradient(135deg, #238636, #2ea043)',
  color: '#ffffff',
  fontWeight: 600,
  fontSize: '0.875rem',
  textTransform: 'none',
  boxShadow: '0 4px 12px rgba(35, 134, 54, 0.3)',
  transition: 'all 0.2s ease',
  border: 'none',
  
  '&:hover': {
    background: 'linear-gradient(135deg, #2ea043, #238636)',
    boxShadow: '0 6px 20px rgba(35, 134, 54, 0.4)',
    transform: 'translateY(-1px)',
  },
  
  '&:active': {
    transform: 'translateY(0px)',
  },
  
  '&:disabled': {
    background: 'rgba(139, 148, 158, 0.2)',
    color: '#8b949e',
    cursor: 'not-allowed',
    boxShadow: 'none',
    transform: 'none',
  }
}));

const FeatureCard = styled(Card)(({  }) => ({
  background: 'rgba(33, 38, 45, 0.6)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(56, 189, 248, 0.1)',
  borderRadius: 16,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-4px)',
    border: '1px solid rgba(56, 189, 248, 0.3)',
    boxShadow: '0 8px 32px rgba(56, 189, 248, 0.2)',
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
                <Mail size={16} color="#8b949e" />
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
                <Lock size={16} color="#8b949e" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={togglePasswordVisibility} 
                  edge="end"
                  size="small"
                  sx={{ color: '#8b949e' }}
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
            background: 'rgba(16, 185, 129, 0.1)',
            borderRadius: 12,
            border: `1px solid rgba(16, 185, 129, 0.2)`,
            marginTop: 2,
          }}
        >
          <CheckCircle size={16} color="#10b981" />
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#10b981',
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
            fontSize: '0.875rem',
            background: 'rgba(248, 113, 113, 0.9)',
            color: 'white'
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

  const features = [
    {
      icon: <Bot size={24} />,
      title: "AI חכם לניתוח מסמכים",
      description: "בינה מלאכותית מתקדמת שמבינה את המסמכים שלך ומספקת תשובות מדויקות",
      color: '#8b5cf6'
    },
    {
      icon: <FileText size={24} />,
      title: "ניהול מסמכים מתקדם",
      description: "ארגון חכם של כל המסמכים עם חיפוש מהיר ותיוג אוטומטי",
      color: '#38bdf8'
    },
    {
      icon: <Users size={24} />,
      title: "ניהול לקוחות יעיל",
      description: "מעקב מקצועי אחר לקוחות, תיקים וסטטוס הטיפול במקום אחד",
      color: '#ec4899'
    },
    {
      icon: <Shield size={24} />,
      title: "אבטחה ברמה בנקאית",
      description: "הגנה מלאה על מידע רגיש עם הצפנה והגנה מתקדמת",
      color: '#10b981'
    }
  ];

  return (
    <PageContainer>
      <ContentWrapper>
        <MainContent>
          {/* Brand Section */}
          <Box sx={{ color: '#f0f6fc' }}>
            <Box display="flex" alignItems="center" gap={3} mb={4}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 3,
                  background: `linear-gradient(135deg, #38bdf8, #8b5cf6)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(56, 189, 248, 0.4)',
                }}
              >
                <Scale size={40} color="white" />
              </Box>
              <Box>
                <Typography
                  variant={isMobile ? "h4" : "h3"}
                  sx={{
                    fontWeight: 800,
                    color: '#f0f6fc',
                    letterSpacing: '-0.025em',
                    mb: 1,
                    lineHeight: 1.1,
                    background: 'linear-gradient(135deg, #38bdf8, #8b5cf6)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  Legal Manager Pro
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: '#8b949e',
                    fontWeight: 500,
                    lineHeight: 1.3
                  }}
                >
                  מערכת ניהול תיקים משפטיים עם AI
                </Typography>
              </Box>
            </Box>

            <Typography
              variant={isMobile ? "h5" : "h4"}
              sx={{
                fontWeight: 700,
                color: '#f0f6fc',
                mb: 2,
                lineHeight: 1.3
              }}
            >
              הפתרון הטכנולוגי המתקדם ביותר לעורכי דין
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: '#8b949e',
                fontSize: '1.125rem',
                lineHeight: 1.7,
                mb: 4
              }}
            >
              שלב בינה מלאכותית מתקדמת עם ניהול תיקים מקצועי. 
              צ'אט חכם עם המסמכים, ארגון אוטומטי ואבטחה מלאה.
            </Typography>

            <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={3}>
              {features.map((feature, index) => (
                <Fade in={true} timeout={600 + index * 100} key={index}>
                  <FeatureCard>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${feature.color}, ${alpha(feature.color, 0.8)})`,
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
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: '#f0f6fc',
                          mb: 1,
                          fontSize: '0.95rem'
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#8b949e',
                          lineHeight: 1.5,
                          fontSize: '0.85rem'
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </FeatureCard>
                </Fade>
              ))}
            </Box>

            <Box display="flex" gap={2} justifyContent="center" mt={4} flexWrap="wrap">
              <Chip
                icon={<Sparkles size={16} />}
                label="טכנולוגיית AI מתקדמת"
                sx={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  color: '#8b5cf6',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)'
                }}
              />
              <Chip
                icon={<Cpu size={16} />}
                label="עיבוד מסמכים חכם"
                sx={{
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)'
                }}
              />
              <Chip
                icon={<Zap size={16} />}
                label="ביצועים מהירים"
                sx={{
                  background: 'rgba(245, 158, 11, 0.2)',
                  color: '#f59e0b',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)'
                }}
              />
            </Box>
          </Box>

          {/* Login Section */}
          <LoginSection>
            <Box textAlign="center" mb={4}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#f0f6fc',
                  mb: 1,
                  letterSpacing: '-0.025em'
                }}
              >
                כניסה למערכת
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: '#8b949e',
                  fontSize: '1rem',
                  lineHeight: 1.6
                }}
              >
                היכנס כדי לגשת למערכת הניהול המתקדמת
              </Typography>
            </Box>

            <Login />

            <Box
              sx={{
                mt: 4,
                pt: 3,
                borderTop: '1px solid rgba(139, 148, 158, 0.2)'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  background: 'rgba(33, 38, 45, 0.6)',
                  borderRadius: 2,
                  border: '1px solid rgba(56, 189, 248, 0.2)',
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
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
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
                      color: '#f0f6fc',
                      mb: 0.5,
                      fontSize: '0.9rem'
                    }}
                  >
                    גישה מוגבלת למשרדי עורכי דין
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#8b949e',
                      fontSize: '0.8rem',
                      lineHeight: 1.4
                    }}
                  >
                    המערכת מיועדת למשרדי עורכי דין מורשים בלבד
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#6e7681',
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