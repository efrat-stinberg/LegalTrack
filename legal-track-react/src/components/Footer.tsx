import React from "react";
import {
  Box,
  Typography,
  Container,
  Divider,
  useTheme,
  alpha,
  Link
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Scale,
  Heart,
  Shield,
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

  // Hash URLs: the app uses HashRouter, so plain hrefs must include "#/"
  const quickLinks = [
    { label: 'ניהול תיקים', href: '#/folders' },
    { label: 'לקוחות', href: '#/clients' },
    { label: 'מסמכים', href: '#/documents' },
    { label: 'דוחות', href: '#/analytics' },
    { label: 'עזרה ותמיכה', href: '#/support' },
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
                  LegalTrack
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  מערכת לניהול תיקים ומסמכים משפטיים
                </Typography>
              </Box>
            </LogoContainer>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              ניהול לקוחות, תיקים ומסמכים במקום אחד, עם צ'אט AI שעונה על שאלות מתוך מסמכי התיק.
            </Typography>

            <Box display="flex" flexDirection="column" gap={1}>
              <FeatureChip>
                <Shield size={12} />
                כל משרד רואה רק את הנתונים שלו
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
        </FooterSection>

        <Divider sx={{ mb: 3 }} />

        <CopyrightSection>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="body2" color="text.secondary">
              © {currentYear} LegalTrack. כל הזכויות שמורות.
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

        </CopyrightSection>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;