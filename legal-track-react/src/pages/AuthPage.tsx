import React, { useEffect, useState } from "react";
import Login from "../components/Login";
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
  Chip
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
  Star,
  Zap
} from "lucide-react";

const PageContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: `linear-gradient(145deg, #f8fafc 0%, #e2e8f0 100%)`,
  position: 'relative',
  overflow: 'hidden',
}));

const ContentWrapper = styled(Container)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4, 2),
  maxWidth: '1400px !important',
  
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2, 1),
  },
}));

const MainContent = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(6),
  width: '100%',
  maxWidth: '1200px',
  alignItems: 'center',
  
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
  overflow: 'hidden',
  
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

const AuthPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentTime, setCurrentTime] = useState(new Date());

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
      description: "מערכת מתקדמת לניהול כל התיקים והמסמכים במקום אחד."
    },
    {
      icon: <Users size={20} />,
      title: "ניהול לקוחות מתקדם",
      description: "מעקב מקצועי אחר פרטי הלקוחות והיסטוריית תיקים."
    },
    {
      icon: <Shield size={20} />,
      title: "אבטחה ברמה בנקאית",
      description: "הגנה מלאה על מידע רגיש עם הצפנה מתקדמת."
    },
    {
      icon: <Award size={20} />,
      title: "דוחות ואנליטיקה",
      description: "כלי ניתוח מתקדמים להערכת ביצועים ומעקב."
    }
  ];

  const stats = [
    { number: '1,000+', label: 'תיקים' },
    { number: '50,000+', label: 'מסמכים' },
    { number: '99.9%', label: 'זמינות' },
    { number: '24/7', label: 'תמיכה' }
  ];

  return (
    <PageContainer>
      <ContentWrapper>
        <MainContent>
          {/* Brand Section */}
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

            {/* Features Grid */}
            <FeatureGrid>
              {features.map((feature, index) => (
                <Fade in={true} timeout={600 + index * 100} key={index}>
                  <FeatureCard>
                    <CardContent sx={{ p: '16px !important' }}>
                      <FeatureIcon>
                        {feature.icon}
                      </FeatureIcon>
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

            {/* Stats */}
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

            {/* Trust Badges */}
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

          {/* Login Section */}
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

            {/* Security Info */}
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