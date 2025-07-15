import React from "react";
import {
  Box,
  Typography,
  Container,
  IconButton,
  Divider,
  useTheme,
  alpha,
  Link,
  Tooltip
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Scale,
  Heart,
  Shield,
  Globe,
  Mail,
  Phone,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  ExternalLink
} from "lucide-react";

const FooterContainer = styled(Box)(({ theme }) => ({
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  marginTop: 'auto',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const FooterContent = styled(Container)(({ theme }) => ({
  padding: theme.spacing(6, 3),
  
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4, 2),
  }
}));

const FooterSection = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.spacing(4),
  marginBottom: theme.spacing(4),
  
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
    gap: theme.spacing(3),
  }
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
}));

const LogoIcon = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
  
  '& svg': {
    color: 'white',
  }
}));

const ContactItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1.5),
  marginBottom: theme.spacing(1),
  color: theme.palette.text.secondary,
  transition: 'color 0.3s ease',
  
  '&:hover': {
    color: theme.palette.primary.main,
  },
  
  '& svg': {
    color: theme.palette.primary.main,
  }
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  width: 44,
  height: 44,
  background: alpha(theme.palette.primary.main, 0.1),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  color: theme.palette.primary.main,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    color: 'white',
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
  }
}));

const FooterLink = styled(Link)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  fontSize: '0.9rem',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(1),
  transition: 'all 0.3s ease',
  
  '&:hover': {
    color: theme.palette.primary.main,
    transform: 'translateX(4px)',
  }
}));

const CopyrightSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingTop: theme.spacing(3),
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    textAlign: 'center',
  }
}));

const FeatureChip = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(0.5, 1),
  background: alpha(theme.palette.success.main, 0.1),
  borderRadius: 8,
  color: theme.palette.success.main,
  fontSize: '0.75rem',
  fontWeight: 600,
  marginBottom: theme.spacing(1),
}));

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'ניהול תיקים', href: '/folders' },
    { label: 'לקוחות', href: '/clients' },
    { label: 'מסמכים', href: '/documents' },
    { label: 'דוחות', href: '/reports' },
    { label: 'הגדרות', href: '/settings' },
  ];

  const legalLinks = [
    { label: 'תנאי שימוש', href: '/terms' },
    { label: 'מדיניות פרטיות', href: '/privacy' },
    { label: 'הסכם רישיון', href: '/license' },
    { label: 'אבטחת מידע', href: '/security' },
    { label: 'תמיכה', href: '/support' },
  ];

  const socialLinks = [
    { icon: <Github size={20} />, href: '#', label: 'GitHub' },
    { icon: <Twitter size={20} />, href: '#', label: 'Twitter' },
    { icon: <Linkedin size={20} />, href: '#', label: 'LinkedIn' },
  ];

  return (
    <FooterContainer as="footer">
      <FooterContent maxWidth="xl">
        <FooterSection>
          {/* Company Info */}
          <LogoSection>
            <LogoContainer>
              <LogoIcon>
                <Scale size={24} />
              </LogoIcon>
              <Box>
                <Typography variant="h6" fontWeight={700} color="primary">
                  Legal Manager Pro
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  מערכת ניהול תיקים מתקדמת
                </Typography>
              </Box>
            </LogoContainer>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              פתרון מקצועי לניהול תיקים משפטיים עם טכנולוגיית AI מתקדמת. 
              ארגון חכם, חיפוש מהיר ואבטחה מלאה לכל הנתונים שלך.
            </Typography>

            <Box display="flex" flexDirection="column" gap={1}>
              <FeatureChip>
                <Shield size={12} />
                הגנה מלאה על הנתונים
              </FeatureChip>
              <FeatureChip>
                <Globe size={12} />
                נגישות 24/7 מכל מקום
              </FeatureChip>
            </Box>
          </LogoSection>

          {/* Quick Links */}
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom color="primary">
              קישורים מהירים
            </Typography>
            <Box display="flex" flexDirection="column">
              {quickLinks.map((link, index) => (
                <FooterLink key={index} href={link.href}>
                  <ExternalLink size={14} />
                  {link.label}
                </FooterLink>
              ))}
            </Box>
          </Box>

          {/* Legal */}
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom color="primary">
              משפטי ותמיכה
            </Typography>
            <Box display="flex" flexDirection="column">
              {legalLinks.map((link, index) => (
                <FooterLink key={index} href={link.href}>
                  <ExternalLink size={14} />
                  {link.label}
                </FooterLink>
              ))}
            </Box>
          </Box>

          {/* Contact */}
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom color="primary">
              יצירת קשר
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <ContactItem>
                <Mail size={16} />
                <Typography variant="body2">
                  support@legalmanager.co.il
                </Typography>
              </ContactItem>
              <ContactItem>
                <Phone size={16} />
                <Typography variant="body2">
                  03-1234567
                </Typography>
              </ContactItem>
              <ContactItem>
                <MapPin size={16} />
                <Typography variant="body2">
                  תל אביב, ישראל
                </Typography>
              </ContactItem>
            </Box>

            <Box display="flex" gap={1} mt={3}>
              {socialLinks.map((social, index) => (
                <Tooltip key={index} title={social.label} arrow>
                  <Link href={social.href} underline="none">
                    <SocialButton>
                      {social.icon}
                    </SocialButton>
                  </Link>
                </Tooltip>
              ))}
            </Box>
          </Box>
        </FooterSection>

        <Divider sx={{ mb: 3 }} />

        <CopyrightSection>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              © {currentYear} Legal Manager Pro. כל הזכויות שמורות.
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              נבנה באהבה
            </Typography>
            <Heart size={16} color={theme.palette.error.main} />
            <Typography variant="body2" color="text.secondary">
              עבור עורכי הדין בישראל
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="caption" color="text.secondary">
              גרסה 2.1.0
            </Typography>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: theme.palette.success.main,
                animation: 'pulse 2s infinite',
              }}
            />
            <Typography variant="caption" color="success.main">
              מערכת פעילה
            </Typography>
          </Box>
        </CopyrightSection>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;