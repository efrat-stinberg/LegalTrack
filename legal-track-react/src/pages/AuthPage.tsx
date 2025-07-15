import React, { useEffect, useState } from "react";
import Login from "../components/Login";
import { 
  Container, 
  Box, 
  Typography, 
  Paper,
  Divider,
  useTheme,
  alpha,
  Fade,
  Zoom,
  IconButton,
  Tooltip,
  useMediaQuery
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { 
  Scale, 
  FileText, 
  Shield, 
  Users, 
  MessageCircle,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Globe,
  Clock,
  CheckCircle
} from "lucide-react";

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const slideInLeft = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(-50px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
`;

const slideInRight = keyframes`
  from { 
    opacity: 0; 
    transform: translateX(50px); 
  }
  to { 
    opacity: 1; 
    transform: translateX(0); 
  }
`;

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
    `,
    pointerEvents: 'none',
  }
}));

const ContentWrapper = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
}));

const MainCard = styled(Paper)(({ theme }) => ({
  borderRadius: 24,
  overflow: 'hidden',
  background: alpha(theme.palette.background.paper, 0.95),
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  boxShadow: `
    0 32px 64px ${alpha(theme.palette.common.black, 0.15)},
    0 0 0 1px ${alpha(theme.palette.common.white, 0.1)}
  `,
  position: 'relative',
}));

const BrandingSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  textAlign: 'center',
  color: 'white',
  position: 'relative',
  
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  }
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-block',
  marginBottom: theme.spacing(4),
}));

const LogoIcon = styled(Box)(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: '50%',
  background: `
    linear-gradient(135deg, 
      ${alpha(theme.palette.common.white, 0.2)} 0%, 
      ${alpha(theme.palette.common.white, 0.1)} 100%)
  `,
  backdropFilter: 'blur(20px)',
  border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  animation: `${float} 6s ease-in-out infinite`,
  boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.2)}`,
  
  [theme.breakpoints.down('md')]: {
    width: 80,
    height: 80,
  }
}));

const SparkleIcon = styled(Box)(({ theme }) => ({
  position: 'absolute',
  color: alpha(theme.palette.common.white, 0.7),
  animation: `${rotate} 8s linear infinite`,
  
  '&.sparkle-1': {
    top: '10%',
    right: '20%',
    animationDelay: '0s',
  },
  
  '&.sparkle-2': {
    bottom: '15%',
    left: '15%',
    animationDelay: '2s',
  },
  
  '&.sparkle-3': {
    top: '20%',
    left: '25%',
    animationDelay: '4s',
  }
}));

const FeatureGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: theme.spacing(3),
  marginTop: theme.spacing(4),
  
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(2),
  }
}));

const FeatureCard = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 16,
  background: alpha(theme.palette.common.white, 0.1),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  textAlign: 'center',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  
  '&:hover': {
    transform: 'translateY(-5px)',
    background: alpha(theme.palette.common.white, 0.15),
    boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.2)}`,
  }
}));

const LoginSection = styled(Box)(({ theme }) => ({
  padding: theme.spacing(6),
  background: theme.palette.background.paper,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  }
}));

const StatsSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-around',
  marginTop: theme.spacing(4),
  padding: theme.spacing(2, 0),
  borderTop: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
}));

const StatItem = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  color: 'white',
}));

const ScrollIndicator = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(3),
  left: '50%',
  transform: 'translateX(-50%)',
  color: alpha(theme.palette.common.white, 0.7),
  animation: `${pulse} 2s ease-in-out infinite`,
  cursor: 'pointer',
}));

const AuthPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <FileText size={24} />,
      title: "ניהול מסמכים",
      description: "ארגון חכם של כל המסמכים"
    },
    {
      icon: <MessageCircle size={24} />,
      title: "צ'אט עם AI",
      description: "שיחה חכמה על התוכן"
    },
    {
      icon: <Users size={24} />,
      title: "ניהול לקוחות",
      description: "מעקב אחר כל הלקוחות"
    },
    {
      icon: <Shield size={24} />,
      title: "אבטחה מתקדמת",
      description: "הגנה מלאה על הנתונים"
    }
  ];

  return (
    <PageContainer>
      <ContentWrapper maxWidth="lg">
        <MainCard elevation={0}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              minHeight: { md: '80vh' }
            }}
          >
            {/* Left Side - Branding */}
            <Box 
              sx={{ 
                flex: 1, 
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <BrandingSection>
                <LogoContainer>
                  <LogoIcon>
                    <Scale size={isMobile ? 40 : 56} color="white" />
                  </LogoIcon>
                  
                  <SparkleIcon className="sparkle-1">
                    <Sparkles size={16} />
                  </SparkleIcon>
                  <SparkleIcon className="sparkle-2">
                    <Sparkles size={12} />
                  </SparkleIcon>
                  <SparkleIcon className="sparkle-3">
                    <Sparkles size={14} />
                  </SparkleIcon>
                </LogoContainer>
                
                <Fade in={true} timeout={1000}>
                  <Box>
                    <Typography 
                      variant={isMobile ? "h4" : "h3"} 
                      component="h1" 
                      gutterBottom 
                      sx={{ fontWeight: 800, mb: 2 }}
                    >
                      Legal Manager Pro
                    </Typography>
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      sx={{ opacity: 0.95, fontWeight: 300, mb: 4 }}
                    >
                      מערכת ניהול תיקים משפטיים מתקדמת
                    </Typography>
                  </Box>
                </Fade>

                <Zoom in={true} timeout={1200}>
                  <FeatureGrid>
                    {features.map((feature, index) => (
                      <FeatureCard key={index}>
                        <Box sx={{ mb: 1, color: 'white' }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                          {feature.description}
                        </Typography>
                      </FeatureCard>
                    ))}
                  </FeatureGrid>
                </Zoom>

                <StatsSection>
                  <StatItem>
                    <Typography variant="h4" fontWeight={700}>
                      500+
                    </Typography>
                    <Typography variant="caption">
                      תיקים פעילים
                    </Typography>
                  </StatItem>
                  <StatItem>
                    <Typography variant="h4" fontWeight={700}>
                      10K+
                    </Typography>
                    <Typography variant="caption">
                      מסמכים
                    </Typography>
                  </StatItem>
                  <StatItem>
                    <Typography variant="h4" fontWeight={700}>
                      99.9%
                    </Typography>
                    <Typography variant="caption">
                      זמינות
                    </Typography>
                  </StatItem>
                </StatsSection>

                {!isMobile && (
                  <ScrollIndicator>
                    <ChevronDown size={24} />
                  </ScrollIndicator>
                )}
              </BrandingSection>
            </Box>

            {/* Right Side - Login Form */}
            <LoginSection sx={{ flex: 1 }}>
              <Fade in={true} timeout={1500}>
                <Box>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography 
                      variant="h4" 
                      component="h2" 
                      gutterBottom 
                      sx={{ fontWeight: 700, color: 'text.primary' }}
                    >
                      ברוכים השבים
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      התחברו כדי לגשת למערכת ניהול התיקים שלכם
                    </Typography>
                    
                    <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={3}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Globe size={16} color={theme.palette.success.main} />
                        <Typography variant="caption" color="success.main">
                          חיבור מאובטח
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Clock size={16} color={theme.palette.info.main} />
                        <Typography variant="caption" color="info.main">
                          {currentTime.toLocaleTimeString('he-IL')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Login />

                  <Divider sx={{ my: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      או
                    </Typography>
                  </Divider>

                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      p: 3,
                      background: alpha(theme.palette.info.main, 0.05),
                      borderRadius: 3,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                    }}
                  >
                    <CheckCircle size={20} color={theme.palette.info.main} style={{ marginBottom: 8 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      משתמשים חדשים נרשמים רק על ידי מנהל המערכת
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      לקבלת גישה, פנו למנהל המערכת שלכם
                    </Typography>
                  </Box>

                  <Box 
                    sx={{ 
                      mt: 4, 
                      p: 2, 
                      textAlign: 'center',
                      borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      © {new Date().getFullYear()} Legal Manager Pro. כל הזכויות שמורות.
                    </Typography>
                  </Box>
                </Box>
              </Fade>
            </LoginSection>
          </Box>
        </MainCard>
      </ContentWrapper>
    </PageContainer>
  );
};

export default AuthPage;