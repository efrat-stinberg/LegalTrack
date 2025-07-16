import React, { useEffect, useState } from "react";
import Login from "../components/Login";
import { 
  Box, 
  Typography, 
  useTheme,
  Fade,
  Container
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
  Award
} from "lucide-react";

const PageContainer = styled(Box)(({  }) => ({
  minHeight: '100vh',
  display: 'flex',
  background: '#f1f5f9',
  position: 'relative',
  overflow: 'hidden',
}));

const LeftPanel = styled(Box)(({ theme }) => ({
  flex: '0 0 50%',
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: theme.spacing(8),
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '1px',
    background: 'linear-gradient(to bottom, transparent, rgba(148, 163, 184, 0.3), transparent)',
  },
  
  [theme.breakpoints.down('lg')]: {
    flex: '0 0 45%',
    padding: theme.spacing(6),
  },
  
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const RightPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(6),
  background: '#ffffff',
  
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
}));

const BrandContainer = styled(Box)(({  }) => ({
  maxWidth: '480px',
  width: '100%',
}));

const LogoSection = styled(Box)(({  theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(6),
}));

const LogoIcon = styled(Box)(({  }) => ({
  width: 64,
  height: 64,
  borderRadius: 16,
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
  position: 'relative',
  
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 16,
    padding: '2px',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)',
    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
    WebkitMaskComposite: 'subtract',
    maskComposite: 'subtract',
  }
}));

const FeatureGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(4),
  marginBottom: theme.spacing(6),
}));

const FeatureItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 12,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.08)',
    transform: 'translateY(-2px)',
  }
}));

const FeatureIcon = styled(Box)(({  }) => ({
  width: 48,
  height: 48,
  borderRadius: 8,
  background: 'rgba(59, 130, 246, 0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  
  '& svg': {
    color: '#60a5fa',
  }
}));

const LoginContainer = styled(Container)(({ }) => ({
  maxWidth: '440px',
  width: '100%',
  padding: 0,
}));

const MobileHeader = styled(Box)(({ theme }) => ({
  display: 'none',
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  
  [theme.breakpoints.down('md')]: {
    display: 'block',
  },
}));

const MobileLogo = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: 12,
  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
}));

const StatusBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(4),
  marginTop: theme.spacing(6),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: 8,
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const StatusItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: '#94a3b8',
  fontSize: '0.875rem',
  
  '& svg': {
    color: '#10b981',
    width: 16,
    height: 16,
  }
}));

const AuthPage: React.FC = () => {
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
      description: "מערכת מתקדמת לניהול כל התיקים, המסמכים והפעילות המשפטית במקום אחד מרכזי ומאובטח."
    },
    {
      icon: <Users size={20} />,
      title: "ניהול לקוחות מתקדם",
      description: "מעקב מקצועי אחר פרטי הלקוחות, היסטוריית תיקים, ותקשורת עם כלים חכמים ואינטואיטיביים."
    },
    {
      icon: <Shield size={20} />,
      title: "אבטחה ברמה בנקאית",
      description: "הגנה מלאה על מידע רגיש עם הצפנה מתקדמת, גיבויים אוטומטיים ותאימות לתקני הענף."
    },
    {
      icon: <Award size={20} />,
      title: "דוחות ואנליטיקה",
      description: "כלי ניתוח מתקדמים להערכת ביצועים, מעקב אחר תיקים ויצירת דוחות מקצועיים."
    }
  ];

  return (
    <PageContainer>
      {/* Left Panel - Desktop Only */}
      <LeftPanel>
        <BrandContainer>
          <LogoSection>
            <LogoIcon>
              <Scale size={28} color="white" />
            </LogoIcon>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700,
                  color: '#f8fafc',
                  letterSpacing: '-0.025em',
                  mb: 0.5
                }}
              >
                Legal Manager Pro
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#94a3b8',
                  fontWeight: 400,
                  fontSize: '1.125rem'
                }}
              >
                מערכת ניהול תיקים משפטיים מתקדמת
              </Typography>
            </Box>
          </LogoSection>
          
          <Box sx={{ mb: 6 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 600,
                color: '#e2e8f0',
                mb: 3,
                lineHeight: 1.2
              }}
            >
              הפתרון המקצועי לעורכי דין מודרניים
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#94a3b8',
                fontSize: '1.125rem',
                lineHeight: 1.7
              }}
            >
              מערכת מתקדמת שפותחה במיוחד לצרכים הייחודיים של משרדי עורכי דין.
              ניהול תיקים, מעקב אחר לקוחות, ארגון מסמכים ועוד - הכל במקום אחד.
            </Typography>
          </Box>

          <FeatureGrid>
            {features.map((feature, index) => (
              <Fade in={true} timeout={800 + index * 200} key={index}>
                <FeatureItem>
                  <FeatureIcon>
                    {feature.icon}
                  </FeatureIcon>
                  <Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#e2e8f0',
                        mb: 1,
                        fontSize: '1.125rem'
                      }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#94a3b8',
                        lineHeight: 1.6
                      }}
                    >
                      {feature.description}
                    </Typography>
                  </Box>
                </FeatureItem>
              </Fade>
            ))}
          </FeatureGrid>

          <StatusBar>
            <StatusItem>
              <CheckCircle />
              <span>מערכת פעילה</span>
            </StatusItem>
            <StatusItem>
              <Shield />
              <span>חיבור מאובטח</span>
            </StatusItem>
            <StatusItem>
              <Globe />
              <span>זמינות 24/7</span>
            </StatusItem>
          </StatusBar>
        </BrandContainer>
      </LeftPanel>

      {/* Right Panel - Login */}
      <RightPanel>
        <LoginContainer>
          {/* Mobile Header */}
          <MobileHeader>
            <MobileLogo>
              <Scale size={24} color="white" />
            </MobileLogo>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 700,
                color: '#0f172a',
                mb: 1
              }}
            >
              Legal Manager Pro
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#64748b',
                fontSize: '1rem'
              }}
            >
              מערכת ניהול תיקים משפטיים
            </Typography>
          </MobileHeader>

          <Fade in={true} timeout={600}>
            <Box>
              <Box sx={{ mb: 5 }}>
                <Typography 
                  variant="h2" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#0f172a',
                    mb: 2,
                    fontSize: '2.5rem',
                    letterSpacing: '-0.025em',
                    
                    [theme.breakpoints.down('sm')]: {
                      fontSize: '2rem',
                    }
                  }}
                >
                  כניסה למערכת
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: '#64748b',
                    fontSize: '1.125rem',
                    lineHeight: 1.6
                  }}
                >
                  אנא הזן את פרטי ההתחברות שלך כדי לגשת למערכת
                </Typography>
              </Box>

              <Login />

              <Box 
                sx={{ 
                  mt: 6,
                  pt: 4,
                  borderTop: '1px solid #e2e8f0'
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 3,
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
                      variant="body1" 
                      sx={{ 
                        fontWeight: 600,
                        color: '#374151',
                        mb: 0.5
                      }}
                    >
                      גישה מוגבלת למשרדי עורכי דין
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#64748b',
                        fontSize: '0.875rem'
                      }}
                    >
                      המערכת מיועדת למשרדי עורכי דין מורשים בלבד. לקבלת גישה, אנא פנה למנהל המערכת.
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: '#94a3b8',
                      fontSize: '0.875rem'
                    }}
                  >
                    © {new Date().getFullYear()} Legal Manager Pro - כל הזכויות שמורות
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        </LoginContainer>
      </RightPanel>
    </PageContainer>
  );
};

export default AuthPage;