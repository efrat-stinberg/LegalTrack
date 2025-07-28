import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Fade,
  Paper,
  TextField,
  Button,
  Snackbar,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Card,
  Divider,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import {
  Scale,
  Shield,
  CheckCircle,
  Briefcase,
  Lock,
  Mail,
  LogIn,
  Eye,
  EyeOff,
  TrendingUp,
} from "lucide-react";
import { loginUser, getUserByEmail } from "../api/api";
import { login } from "../store/slices/userSlice";
import { CloudDone, Groups, HelpOutline, Memory, PersonAdd, SupportAgent } from "@mui/icons-material";

// Keyframes for animations
const particleFloat = keyframes`
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
`;

const orbFloat = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
`;

const shapeRotate = keyframes`
  0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
`;

const logoFloat = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-5px) rotate(3deg); }
`;

const iconGlow = keyframes`
  0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
`;

const titleSlide = keyframes`
  0% {
    opacity: 0;
    transform: translateX(20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

const sparkle = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
`;

const diamondRotate = keyframes`
  0%, 100% { transform: rotate(45deg) scale(1); }
  50% { transform: rotate(225deg) scale(1.2); }
`;

const featuresSlideUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const leftSlideIn = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-50px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

const rightSlideIn = keyframes`
  0% {
    opacity: 0;
    transform: translateX(50px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`;

const glowPulse = keyframes`
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

// Main Layout Components
const PageContainer = styled(Box)(() => ({
  minHeight: '100vh',
  position: 'relative',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
}));

const BackgroundWrapper = styled(Box)(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: `
    radial-gradient(circle at 20% 50%, #667eea 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, #764ba2 0%, transparent 50%),
    radial-gradient(circle at 40% 80%, #f093fb 0%, transparent 50%),
    linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)
  `,
  zIndex: 1,
}));

const ParticleField = styled(Box)(() => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
}));

const Particle = styled(Box)(() => ({
  position: 'absolute',
  width: '3px',
  height: '3px',
  background: 'rgba(255, 255, 255, 0.8)',
  borderRadius: '50%',
  animation: `${particleFloat} 15s infinite linear`,
  boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
}));

const GradientOrbs = styled(Box)(() => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
}));

const Orb = styled(Box)<{ size: number; top: string; left?: string; right?: string; delay: number }>(({ size, top, left, right, delay }) => ({
  position: 'absolute',
  width: `${size}px`,
  height: `${size}px`,
  borderRadius: '50%',
  filter: 'blur(40px)',
  animation: `${orbFloat} 20s infinite ease-in-out`,
  animationDelay: `${delay}s`,
  top,
  left,
  right,
}));

const Orb1 = styled(Orb)(() => ({
  background: 'radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%)',
}));

const Orb2 = styled(Orb)(() => ({
  background: 'radial-gradient(circle, rgba(240, 147, 251, 0.4) 0%, transparent 70%)',
}));

const Orb3 = styled(Orb)(() => ({
  background: 'radial-gradient(circle, rgba(118, 75, 162, 0.3) 0%, transparent 70%)',
}));

const Orb4 = styled(Orb)(() => ({
  background: 'radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%)',
}));

const GeometricShapes = styled(Box)(() => ({
  position: 'absolute',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
}));

const Shape = styled(Box)(() => ({
  position: 'absolute',
  opacity: 0.1,
  animation: `${shapeRotate} 25s infinite linear`,
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 10,
  width: '100%',
  maxWidth: '1400px',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: '1fr 500px',
  gap: '60px',
  alignItems: 'center',
  minHeight: '80vh',

  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: '1fr 450px',
    gap: '40px',
  },

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
    gap: '40px',
    textAlign: 'center',
  },
}));

const LeftSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '40px',
  animation: `${leftSlideIn} 1s ease-out`,

  [theme.breakpoints.down('md')]: {
    order: 2,
  },
}));

const RightSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  animation: `${rightSlideIn} 1s ease-out 0.3s both`,

  [theme.breakpoints.down('md')]: {
    order: 1,
  },
}));
// Brand Section Components
const BrandHeader = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '24px',
  direction: 'ltr',

  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
  },
}));

const LogoContainer = styled(Box)(() => ({
  position: 'relative',
  width: '80px',
  height: '80px',
  flexShrink: 0,
}));

const LogoBackground = styled(Box)(() => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '20px',
  animation: `${logoFloat} 6s infinite ease-in-out`,
}));

const LogoIcon = styled(Box)(() => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
  color: 'white',

  '& svg': {
    fontSize: '40px',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
  }
}));

const IconGlow = styled(Box)(() => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '90px',
  height: '90px',
  transform: 'translate(-50%, -50%)',
  background: 'radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
  borderRadius: '50%',
  animation: `${iconGlow} 3s infinite ease-in-out`,
}));

const BrandInfo = styled(Box)(({ theme }) => ({
  flex: 1,
  textAlign: 'right',

  [theme.breakpoints.down('md')]: {
    textAlign: 'center',
  },
}));

const BrandTitle = styled(Typography)(({ theme }) => ({
  fontSize: '42px',
  fontWeight: 700,
  margin: '0 0 12px 0',
  letterSpacing: '-1px',
  background: 'linear-gradient(45deg, #1a237e, #667eea, #764ba2)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',

  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
    fontSize: '36px',
  },

  [theme.breakpoints.down('sm')]: {
    fontSize: '28px',
  },
}));

const TitlePart = styled('span')<{ accent?: boolean }>(({ accent }) => ({
  display: 'inline-block',
  animation: `${titleSlide} 1s ease-out forwards`,
  animationDelay: accent ? '0.3s' : '0s',
}));

const BrandSubtitle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  color: '#666',
  fontSize: '16px',
  fontWeight: 500,

  [theme.breakpoints.down('md')]: {
    justifyContent: 'center',
  },
}));

const SubtitleIcon = styled('span')(() => ({
  animation: `${sparkle} 2s infinite ease-in-out`,
}));

const SubtitleBadge = styled(Box)(() => ({
  background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
  color: '#1a237e',
  padding: '4px 12px',
  borderRadius: '16px',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)',
}));

const WelcomeSection = styled(Box)(() => ({
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '20px',
  padding: '32px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

const WelcomeTitle = styled(Typography)(({ theme }) => ({
  fontSize: '36px',
  fontWeight: 600,
  margin: '0 0 16px 0',
  color: 'white',
  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',

  [theme.breakpoints.down('md')]: {
    fontSize: '32px',
  },

  [theme.breakpoints.down('sm')]: {
    fontSize: '24px',
  },
}));

const WelcomeText = styled(Typography)(() => ({
  fontSize: '18px',
  color: 'rgba(255, 255, 255, 0.9)',
  margin: '0 0 24px 0',
  lineHeight: 1.6,
}));

const HeaderDecoration = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
}));

const DecorationLine = styled(Box)(() => ({
  height: '2px',
  width: '80px',
  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)',
}));

const DecorationDiamond = styled(Box)(() => ({
  width: '10px',
  height: '10px',
  background: 'rgba(255, 255, 255, 0.8)',
  transform: 'rotate(45deg)',
  animation: `${diamondRotate} 4s infinite ease-in-out`,
}));

// Features Section Components
const FeaturesSection = styled(Box)(() => ({
  animation: `${featuresSlideUp} 1s ease-out 0.5s both`,
}));

const FeaturesGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '24px',

  [theme.breakpoints.down('lg')]: {
    gridTemplateColumns: '1fr',
    gap: '16px',
  },

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

const FeatureCard = styled(Card)(() => ({
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  padding: '24px',
  textAlign: 'center',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
    transform: 'scaleX(0)',
    transition: 'transform 0.4s ease',
  },

  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.2)',
    background: 'rgba(255, 255, 255, 0.25)',

    '&::before': {
      transform: 'scaleX(1)',
    },
  },
}));

const FeatureIcon = styled(Box)<{ gradient: string }>(({ gradient }) => ({
  width: '60px',
  height: '60px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 16px auto',
  position: 'relative',
  overflow: 'hidden',
  background: gradient,

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'inherit',
    filter: 'blur(10px)',
    opacity: 0.3,
  },

  '& svg': {
    color: 'white',
    position: 'relative',
    zIndex: 2,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  }
}));

const StyledCardContent = styled(Box)(() => ({
  padding: '40px !important',
}));

const FeatureContent = styled(Box)(() => ({
  padding: '0 !important',

  '& h4': {
    fontSize: '16px',
    fontWeight: 600,
    margin: '0 0 8px 0',
    color: 'white',
  },

  '& p': {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
    lineHeight: 1.4,
  }
}));

const InfoCards = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '20px',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

const InfoCard = styled(Card)(() => ({
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  borderRadius: '16px',
  padding: '20px',
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',

  '&:hover': {
    transform: 'translateY(-4px)',
    background: 'rgba(255, 255, 255, 0.2)',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
  },
}));

const InfoText = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
}));

const InfoTitle = styled(Typography)(() => ({
  fontWeight: 600,
  color: 'white',
  fontSize: '14px',
}));

const InfoSubtitle = styled(Typography)(() => ({
  fontSize: '12px',
  color: 'rgba(255, 255, 255, 0.7)',
}));
// Login Components
const LoginCardContainer = styled(Box)(() => ({
  position: 'relative',
  width: '100%',
  maxWidth: '480px',
}));

const CardGlow = styled(Box)(() => ({
  position: 'absolute',
  top: '-20px',
  left: '-20px',
  right: '-20px',
  bottom: '-20px',
  background: `linear-gradient(45deg, 
    rgba(102, 126, 234, 0.3) 0%, 
    rgba(240, 147, 251, 0.3) 50%, 
    rgba(118, 75, 162, 0.3) 100%)`,
  borderRadius: '32px',
  filter: 'blur(20px)',
  animation: `${glowPulse} 4s infinite ease-in-out`,
}));

const LoginCard = styled(Paper)(() => ({
  position: 'relative',
  borderRadius: '28px !important',
  background: 'rgba(255, 255, 255, 0.95) !important',
  backdropFilter: 'blur(30px) !important',
  border: '1px solid rgba(255, 255, 255, 0.3) !important',
  boxShadow: `
    0 25px 80px rgba(0, 0, 0, 0.15),
    0 12px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important
  `,
  overflow: 'hidden',
  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',

  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `
      0 35px 100px rgba(0, 0, 0, 0.2),
      0 20px 40px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.9)
    `,
  },
}));

const FormHeader = styled(Box)(() => ({
  padding: '32px 40px 24px 40px',
  background: `linear-gradient(135deg, 
    rgba(255, 255, 255, 0.9) 0%, 
    rgba(248, 250, 255, 0.8) 100%)`,
  textAlign: 'center',
  borderBottom: '1px solid rgba(102, 126, 234, 0.1)',
}));

const FormTitle = styled(Typography)(() => ({
  fontSize: '28px',
  fontWeight: 600,
  margin: '0 0 8px 0',
  color: '#1a237e',
  background: 'linear-gradient(45deg, #1a237e, #667eea)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}));

const FormSubtitle = styled(Typography)(() => ({
  color: '#666',
  fontSize: '14px',
  margin: 0,
}));

// const CardContent = styled(Box)(() => ({
//   padding: '40px !important',
// }));

// const FeatureContentDuplicate = styled(CardContent)(() => ({
//   padding: '0 !important',

//   '& h4': {
//     fontSize: '16px',
//     fontWeight: 600,
//     margin: '0 0 8px 0',
//     color: 'white',
//   },

//   '& p': {
//     fontSize: '14px',
//     color: 'rgba(255, 255, 255, 0.8)',
//     margin: 0,
//     lineHeight: 1.4,
//   }
// }));

const PremiumForm = styled('form')(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '32px',
}));

const FormGroup = styled(Box)(() => ({
  position: 'relative',
}));

const PremiumTextField = styled(TextField)(() => ({
  width: '100%',
  position: 'relative',

  '& .MuiOutlinedInput-root': {
    borderRadius: '16px !important',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

    '&:hover': {
      background: 'rgba(255, 255, 255, 0.95)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },

    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 1)',
      transform: 'translateY(-2px)',
      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.15)',
    },
  },

  '& .MuiInputAdornment-root svg': {
    color: '#667eea !important',
    marginRight: '12px',
  },
}));

const FieldDecoration = styled(Box)<{ focused: boolean }>(({ focused }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: '2px',
  background: 'linear-gradient(90deg, #667eea, #764ba2)',
  transform: focused ? 'scaleX(1)' : 'scaleX(0)',
  transition: 'transform 0.3s ease',
}));

const FormOptions = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  margin: '-8px 0 8px 0',

  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '16px',
  },
}));

const PremiumCheckbox = styled(FormControlLabel)(() => ({
  fontSize: '14px',
  color: '#666',

  '& .MuiCheckbox-root': {
    '& .MuiSvgIcon-root': {
      borderRadius: '6px',
      color: '#667eea',
    }
  }
}));

const CheckboxText = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
}));

const ForgotPassword = styled(Button)(() => ({
  fontSize: '14px',
  color: '#667eea',
  fontWeight: 500,
  padding: '8px 16px',
  borderRadius: '8px',
  transition: 'all 0.3s ease',

  '&:hover:not(:disabled)': {
    background: 'rgba(102, 126, 234, 0.1)',
    transform: 'translateY(-1px)',
  },

  '&:disabled': {
    color: '#ccc',
  },
}));

const PremiumSubmitButton = styled(Button)<{ loading?: boolean }>(({  }) => ({
  height: '64px !important',
  borderRadius: '16px !important',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
  position: 'relative',
  overflow: 'hidden',
  fontSize: '16px !important',
  fontWeight: '600 !important',
  letterSpacing: '0.5px',
  boxShadow: `
    0 8px 32px rgba(102, 126, 234, 0.4),
    0 4px 16px rgba(0, 0, 0, 0.1) !important
  `,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important',

  '&:hover:not(:disabled)': {
    transform: 'translateY(-4px)',
    boxShadow: `
      0 16px 48px rgba(102, 126, 234, 0.5),
      0 8px 24px rgba(0, 0, 0, 0.15)
    `,
  },

  '&:active:not(:disabled)': {
    transform: 'translateY(-2px)',
  },

  '&:disabled': {
    background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%) !important',
    color: '#999 !important',
    transform: 'none !important',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1) !important',
  },
}));

const ButtonContent = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '12px',
  position: 'relative',
  zIndex: 2,
}));

const ButtonGlow = styled(Box)(() => ({
  position: 'absolute',
  top: 0,
  left: '-100%',
  width: '100%',
  height: '100%',
  background: `linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.3), 
    transparent)`,
  transition: 'left 0.6s ease',
  
  '.MuiButton-root:hover &': {
    left: '100%',
  },
}));

const LoadingDots = styled(Box)(() => ({
  display: 'flex',
  gap: '4px',
  marginRight: '8px',
}));

const Dot = styled(Box)<{ delay: number }>(({ delay }) => ({
  width: '4px',
  height: '4px',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.8)',
  animation: `${dotBounce} 1.4s infinite ease-in-out both`,
  animationDelay: `${delay}s`,
}));

const PremiumDivider = styled(Divider)(() => ({
  margin: '0 !important',
  background: `linear-gradient(90deg, 
    transparent 0%, 
    rgba(102, 126, 234, 0.2) 50%, 
    transparent 100%) !important`,
  height: '1px !important',
}));

const CardFooter = styled(Box)(() => ({
  padding: '32px 40px !important',
  background: `linear-gradient(135deg, 
    rgba(248, 250, 255, 0.8) 0%, 
    rgba(255, 255, 255, 0.9) 100%)`,
}));

const FooterContent = styled(Box)(() => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '20px',
  textAlign: 'center',
}));

const FooterText = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: '#666',
  fontSize: '14px',
}));

const PremiumRegisterButton = styled(Button)(() => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '12px !important',
  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important',
  padding: '16px 32px !important',
  fontWeight: '600 !important',
  boxShadow: '0 6px 24px rgba(240, 147, 251, 0.3) !important',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important',

  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 36px rgba(240, 147, 251, 0.4)',
  },
}));

const ButtonShine = styled(Box)(() => ({
  position: 'absolute',
  top: 0,
  left: '-100%',
  width: '100%',
  height: '100%',
  background: `linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.4), 
    transparent)`,
  transition: 'left 0.8s ease',
  
  '.MuiButton-root:hover &': {
    left: '100%',
  },
}));
// Login Component
const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

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
    } else if (password.length < 5) {
      setPasswordError("סיסמה חייבת להכיל לפחות 5 תווים");
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

  const goToRegister = () => {
    // Navigate to register page
    console.log('Navigate to register');
  };

  const isFormValid = email.trim() && password.trim() && !emailError && !passwordError;

  return (
    <LoginCardContainer>
      <CardGlow />
      <LoginCard elevation={0}>
        <FormHeader>
          <FormTitle>התחברות למערכת</FormTitle>
          <FormSubtitle>הכניסו את פרטי ההתחברות שלכם</FormSubtitle>
        </FormHeader>

        <StyledCardContent>
          <PremiumForm onSubmit={handleSubmit}>
            <FormGroup>
              <PremiumTextField
                type="email"
                label="כתובת אימייל"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) validateEmail(e.target.value);
                }}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => {
                  setEmailFocused(false);
                  validateEmail(email);
                }}
                error={!!emailError}
                helperText={emailError}
                required
                fullWidth
                disabled={isLoading}
                placeholder="admin@legalflow.co.il"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} />
                    </InputAdornment>
                  ),
                }}
              />
              <FieldDecoration focused={emailFocused} />
            </FormGroup>

            <FormGroup>
              <PremiumTextField
                type={showPassword ? "text" : "password"}
                label="סיסמה"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) validatePassword(e.target.value);
                }}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => {
                  setPasswordFocused(false);
                  validatePassword(password);
                }}
                error={!!passwordError}
                helperText={passwordError}
                required
                fullWidth
                disabled={isLoading}
                placeholder="הכניסו סיסמה מאובטחת"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={togglePasswordVisibility} 
                        edge="end"
                        size="small"
                        sx={{ 
                          color: '#667eea',
                          transition: 'all 0.3s ease',
                          
                          '&:hover': {
                            background: 'rgba(102, 126, 234, 0.1)',
                            transform: 'scale(1.1)',
                          }
                        }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FieldDecoration focused={passwordFocused} />
            </FormGroup>

            <FormOptions>
              <PremiumCheckbox
                control={
                  <Checkbox 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      '& .MuiSvgIcon-root': {
                        color: '#667eea',
                      }
                    }}
                  />
                }
                label={
                  <CheckboxText>
                    <Memory fontSize="small" sx={{ color: "#667eea" }} />
                    זכור אותי למשך 30 יום
                  </CheckboxText>
                }
              />
              <ForgotPassword disabled>
                <HelpOutline fontSize="small" />
                שכחתם סיסמה?
              </ForgotPassword>
            </FormOptions>

            <PremiumSubmitButton
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading || !isFormValid}
              loading={isLoading}
            >
              <ButtonContent>
                {isLoading ? (
                  <>
                    <CircularProgress size={20} color="inherit" />
                    <span>מתחבר...</span>
                    <LoadingDots>
                      <Dot delay={-0.32} />
                      <Dot delay={-0.16} />
                      <Dot delay={0} />
                    </LoadingDots>
                  </>
                ) : loginSuccess ? (
                  <>
                    <CheckCircle size={20} />
                    <span>התחברות הושלמה!</span>
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    <span>התחבר למערכת</span>
                  </>
                )}
                <ButtonGlow />
              </ButtonContent>
            </PremiumSubmitButton>
          </PremiumForm>
        </StyledCardContent>

        <PremiumDivider />

        <CardFooter>
          <FooterContent>
            <FooterText>
              <Briefcase size={18} color="#667eea" />
              <span>אין לכם חשבון מנהל עדיין?</span>
            </FooterText>
            <PremiumRegisterButton
              variant="contained"
              onClick={goToRegister}
            >
              <ButtonShine />
              <PersonAdd fontSize="small" />
              <span>צרו חשבון מנהל</span>
            </PremiumRegisterButton>
          </FooterContent>
        </CardFooter>
      </LoginCard>

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
    </LoginCardContainer>
  );
};

// Particle Generator Component
const ParticleGenerator = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 15,
    duration: 15 + Math.random() * 10,
  }));

  return (
    <ParticleField>
      {particles.map((particle) => (
        <Particle
          key={particle.id}
          sx={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </ParticleField>
  );
};
// Main AuthPage Component
const AuthPage = () => {
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const features = [
    {
      icon: <Shield size={28} />,
      title: "אבטחה מתקדמת",
      description: "הצפנה ברמה בנקאית",
      gradient: "linear-gradient(135deg, #4caf50, #81c784)"
    },
    {
      icon: <CloudDone fontSize="large" />,
      title: "גיבוי אוטומטי", 
      description: "נתונים מאובטחים בענן",
      gradient: "linear-gradient(135deg, #2196f3, #64b5f6)"
    },
    {
      icon: <SupportAgent fontSize="large" />,
      title: "תמיכה 24/6",
      description: "צוות מומחים זמין תמיד",
      gradient: "linear-gradient(135deg, #ff9800, #ffb74d)"
    }
  ];

  const infoCards = [
    {
      icon: <TrendingUp size={32} color="#ffd700" />,
      title: "יעילות מוכחת",
      subtitle: "חיסכון של 40% בזמן העבודה"
    },
    {
      icon: <Groups fontSize="large" sx={{ color: "#ffd700" }} />,
      title: "מעל 1,000 לקוחות",
      subtitle: "משרדי עורכי דין מובילים"
    }
  ];

  return (
    <PageContainer>
      <BackgroundWrapper>
        <ParticleGenerator />
        <GradientOrbs>
          <Orb1 size={300} top="10%" left="10%" delay={0} />
          <Orb2 size={200} top="60%" right="15%" delay={7} />
          <Orb3 size={250} top="20%" left="20%" delay={14} />
          <Orb4 size={180} top="30%" right="30%" delay={10} />
        </GradientOrbs>
        <GeometricShapes>
          <Shape
            sx={{
              width: 0,
              height: 0,
              borderLeft: '25px solid transparent',
              borderRight: '25px solid transparent',
              borderBottom: '43px solid rgba(255, 255, 255, 0.1)',
              top: '20%',
              left: '15%',
              animationDelay: '0s',
            }}
          />
          <Shape
            sx={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              top: '70%',
              right: '25%',
              animationDelay: '8s',
            }}
          />
          <Shape
            sx={{
              width: '40px',
              height: '40px',
              background: 'rgba(255, 255, 255, 0.1)',
              top: '40%',
              left: '70%',
              animationDelay: '15s',
              transformOrigin: 'center',
            }}
          />
        </GeometricShapes>
      </BackgroundWrapper>

      <ContentWrapper>
        <LeftSection>
          <BrandHeader>
            <LogoSection>
              <LogoContainer>
                <LogoBackground />
                <LogoIcon>
                  <Scale size={40} />
                  <IconGlow />
                </LogoIcon>
              </LogoContainer>
              
              <BrandInfo>
                <BrandTitle>
                  <TitlePart>Legal</TitlePart>
                  <TitlePart accent>Flow</TitlePart>
                </BrandTitle>
                <BrandSubtitle>
                  <SubtitleIcon>✨</SubtitleIcon>
                  Admin Panel Premium
                  <SubtitleBadge>Pro</SubtitleBadge>
                </BrandSubtitle>
              </BrandInfo>
            </LogoSection>
            
            <WelcomeSection>
              <WelcomeTitle>ברוכים הבאים!</WelcomeTitle>
              <WelcomeText>
                התחברו לחוויה מתקדמת של ניהול משרד עורכי דין
              </WelcomeText>
              <HeaderDecoration>
                <DecorationLine />
                <DecorationDiamond />
                <DecorationLine />
              </HeaderDecoration>
            </WelcomeSection>
          </BrandHeader>
          
          <FeaturesSection>
            <FeaturesGrid>
              {features.map((feature, index) => (
                <Fade in={true} timeout={600 + index * 100} key={index}>
                  <FeatureCard>
                    <FeatureIcon gradient={feature.gradient}>
                      {feature.icon}
                    </FeatureIcon>
                    <FeatureContent>
                      <Typography variant="h6" component="h4">
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" component="p">
                        {feature.description}
                      </Typography>
                    </FeatureContent>
                  </FeatureCard>
                </Fade>
              ))}
            </FeaturesGrid>
          </FeaturesSection>
          
          <InfoCards>
            {infoCards.map((card, index) => (
              <InfoCard key={index}>
                {card.icon}
                <InfoText>
                  <InfoTitle>{card.title}</InfoTitle>
                  <InfoSubtitle>{card.subtitle}</InfoSubtitle>
                </InfoText>
              </InfoCard>
            ))}
          </InfoCards>
        </LeftSection>

        <RightSection>
          <Login />
        </RightSection>
      </ContentWrapper>
    </PageContainer>
  );
};

export default AuthPage;