import React, { useEffect, useState } from "react";
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

// Fixed Page container that allows scrolling
const PageContainer = styled(Box)(({  }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: `linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)`,
  position: 'relative',
  // Removed overflow: 'hidden' to allow scrolling
  paddingTop: 0,
  paddingBottom: '2rem', // Add bottom padding for better spacing
}));

// Wrapper to align content at top with natural height
const ContentWrapper = styled(Container)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: theme.spacing(6, 2),
  maxWidth: '1400px !important',
  flex: 1, // Allow natural growth
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

const BrandSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),

  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
    order: 2,
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
  // Removed overflow: 'hidden' to allow content to expand

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

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: 16,
  },
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(4),

  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
    marginBottom: theme.spacing(3),
  },

  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const LogoIcon = styled(Avatar)(({ theme }) => ({
  width: 72,
  height: 72,
  background: `linear-gradient(135deg, #3b82f6, #8b5cf6)`,
  boxShadow: `0 8px 32px rgba(59, 130, 246, 0.4)`,
  position: 'relative',

  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    padding: '2px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'subtract',
    maskComposite: 'subtract',
  },

  [theme.breakpoints.down('sm')]: {
    width: 56,
    height: 56,
  },
}));

const FeatureGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  marginTop: theme.spacing(4),

  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: theme.spacing(2),
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, rgba(255, 255, 255, 0.8))`,
  border: `1px solid rgba(59, 130, 246, 0.1)`,
  transition: 'all 0.3s ease',

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 32px rgba(59, 130, 246, 0.15)`,
  },

  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
  },
}));

const FeatureIcon = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  background: `linear-gradient(135deg, #3b82f6, #8b5cf6)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),

  '& svg': {
    color: 'white',
  },

  [theme.breakpoints.down('sm')]: {
    width: 40,
    height: 40,
    marginBottom: theme.spacing(1),
  },
}));

const StatsSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(4),
  marginTop: theme.spacing(4),
  justifyContent: 'center',
  flexWrap: 'wrap',

  [theme.breakpoints.down('md')]: {
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',

  [theme.breakpoints.down('sm')]: {
    minWidth: 80,
  },
}));

const TrustBadges = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
  justifyContent: 'center',
  flexWrap: 'wrap',

  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(1),
  },
}));

// Login Form Styles
const FormContainer = styled(Box)(({  }) => ({
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

// Login Component
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);

  const validateEmail = (email) => {
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

  const validatePassword = (password) => {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLoginSuccess(true);
      
      setTimeout(() => {
        alert('Login successful! (This is a demo)');
        setIsLoading(false);
        setLoginSuccess(false);
      }, 1000);
      
    } catch (error) {
      setLoginSuccess(false);
      setErrorMessage("התחברות נכשלה. אנא בדוק את הפרטים שלך.");
      setOpenSnackbar(true);
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (emailError) {
      validateEmail(value);
    }
  };

  const handlePasswordChange = (e) => {
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

// Main AuthPage Component
const AuthPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <FileText size={20} />,
      title: "ניהול תיקים דיגיטלי",
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

  const stats = [
    { number: '1,000+', label: 'תיקים' },
    { number: '50,000+', label: 'מסמכים' },
    { number: '99.9%', label: 'זמינות' },
    { number: '24/7', label: 'תמיכה' },
  ];

  return (
    <PageContainer>
      <ContentWrapper>
        <MainContent>
          <BrandSection>
            <LogoSection>
              <LogoIcon>
                <Scale size={isMobile ? 28 : 36} color="white" />
              </LogoIcon>
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
            </LogoSection>

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

            <FeatureGrid>
              {features.map((feature, index) => (
                <Fade in={true} timeout={600 + index * 100} key={index}>
                  <FeatureCard>
                    <CardContent sx={{ p: '16px !important' }}>
                      <FeatureIcon>{feature.icon}</FeatureIcon>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          color: '#1e293b',
                          mb: 1,
                          fontSize: isSmall ? '1rem' : '1.125rem'
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#64748b',
                          lineHeight: 1.5,
                          fontSize: isSmall ? '0.875rem' : '1rem'
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </FeatureCard>
                </Fade>
              ))}
            </FeatureGrid>

            <StatsSection>
              {stats.map((stat, index) => (
                <StatItem key={index}>
                  <Typography
                    variant={isMobile ? "h5" : "h4"}
                    sx={{
                      fontWeight: 700,
                      color: '#3b82f6',
                      mb: 0.5
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: '#64748b' }}
                  >
                    {stat.label}
                  </Typography>
                </StatItem>
              ))}
            </StatsSection>

            <TrustBadges>
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
              <Chip
                icon={<Lock size={16} />}
                label="הצפנה SSL"
                sx={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  color: '#8b5cf6',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  fontWeight: 600
                }}
              />
            </TrustBadges>
          </BrandSection>

          <LoginSection>
            <Box textAlign="center" mb={4}>
              {isMobile && (
                <Box mb={3}>
                  <LogoIcon sx={{ margin: '0 auto', mb: 2 }}>
                    <Scale size={28} color="white" />
                  </LogoIcon>
                </Box>
              )}

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
                  fontSize: isSmall ? '0.875rem' : '1rem',
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
                      fontSize: isSmall ? '0.875rem' : '1rem'
                    }}
                  >
                    גישה מוגבלת למשרדי עורכי דין
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      fontSize: isSmall ? '0.75rem' : '0.875rem',
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