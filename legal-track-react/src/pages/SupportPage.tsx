// src/pages/SupportPage.tsx
import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Rating,
  useTheme,
  alpha,
  Fade
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ResponsiveGrid } from '../utils/GridHelpers';
import {
  HelpCircle,
  Send,
  Phone,
  Mail,
  MessageSquare,
  Book,
  Video,
  Download,
  ChevronDown,
  CheckCircle,
  Clock,
  Star,
  Users,
  Headphones
} from 'lucide-react';

const PageContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4, 3),
  minHeight: '100vh',
  background: `linear-gradient(145deg, #f8fafc 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
}));

const HeaderSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 20,
  marginBottom: theme.spacing(4),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
}));

const SupportCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  height: '100%',
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
  }
}));

const SupportPage: React.FC = () => {
  const theme = useTheme();
  const [message, setMessage] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | false>(false);

  const supportOptions = [
    {
      title: 'צ\'אט בזמן אמת',
      description: 'תמיכה מיידית עם הצוות שלנו',
      icon: <MessageSquare size={32} />,
      color: '#10b981',
      available: true
    },
    {
      title: 'שיחת טלפון',
      description: 'דבר ישירות עם מומחה',
      icon: <Phone size={32} />,
      color: '#667eea',
      available: true
    },
    {
      title: 'אימייל',
      description: 'שלח שאלה מפורטת',
      icon: <Mail size={32} />,
      color: '#f59e0b',
      available: true
    },
    {
      title: 'מדריכים',
      description: 'למד להשתמש במערכת',
      icon: <Book size={32} />,
      color: '#8b5cf6',
      available: true
    }
  ];

  const faqItems = [
    {
      id: 'faq1',
      question: 'איך יוצרים תיקייה חדשה?',
      answer: 'כדי ליצור תיקייה חדשה, נווט לעמוד "תיקיות" ולחץ על כפתור "+" או "צור תיקייה חדשה". מלא את הפרטים הנדרשים ושמור.'
    },
    {
      id: 'faq2',
      question: 'איך מעלים מסמכים לתיקייה?',
      answer: 'פתח את התיקייה הרצויה, לחץ על "העלה קובץ" וגרור את הקבצים או בחר אותם מהמחשב. המערכת תתמוך בפורמטים שונים כמו PDF, DOC, ותמונות.'
    },
    {
      id: 'faq3',
      question: 'איך משתמשים בצ\'אט AI?',
      answer: 'בכל תיקייה יש אזור צ\'אט AI שמאפשר לך לשאול שאלות על המסמכים. פשוט כתוב שאלה ו-AI יחפש ויספק תשובות מתוך המסמכים שלך.'
    },
    {
      id: 'faq4',
      question: 'איך מנהלים הרשאות גישה?',
      answer: 'בעמוד הגדרות תוכל לנהל את הרשאות הגישה למשתמשים שונים, להגדיר תפקידים ולשלוט על מי יכול לגשת לאילו תיקיות.'
    },
    {
      id: 'faq5',
      question: 'מה לעשות אם שכחתי את הסיסמה?',
      answer: 'בעמוד הכניסה, לחץ על "שכחתי סיסמה" ותקבל הוראות לאיפוס הסיסמה באימייל. אם אין גישה לאימייל, פנה לתמיכה.'
    }
  ];

  const handleFaqChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedFaq(isExpanded ? panel : false);
  };

  return (
    <PageContainer maxWidth="xl">
      <Fade in={true} timeout={600}>
        <div>
          <HeaderSection elevation={0}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              עזרה ותמיכה 🆘
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              אנחנו כאן לעזור לך בכל שאלה או בעיה
            </Typography>
            
            <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
              <Chip 
                icon={<Clock size={16} />}
                label="זמינות 24/7" 
                sx={{ 
                  background: alpha('#ffffff', 0.2), 
                  color: 'white' 
                }} 
              />
              <Chip 
                icon={<Headphones size={16} />}
                label="תמיכה בעברית" 
                sx={{ 
                  background: alpha('#ffffff', 0.2), 
                  color: 'white' 
                }} 
              />
              <Chip 
                icon={<Users size={16} />}
                label="צוות מומחים" 
                sx={{ 
                  background: alpha('#ffffff', 0.2), 
                  color: 'white' 
                }} 
              />
            </Box>
          </HeaderSection>

          <Box sx={{ 
            display: 'grid', 
            gap: 4, 
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' } 
          }}>
            {/* אפשרויות תמיכה */}
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                בחר את הדרך המועדפת עליך ליצירת קשר
              </Typography>
              
              <Box sx={{ 
                display: 'grid', 
                gap: 3, 
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                mb: 4 
              }}>
                {supportOptions.map((option, index) => (
                  <SupportCard key={index}>
                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${option.color}, ${alpha(option.color, 0.8)})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto',
                          mb: 2,
                          color: 'white'
                        }}
                      >
                        {option.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {option.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {option.description}
                      </Typography>
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <CheckCircle size={16} color={theme.palette.success.main} />
                        <Typography variant="caption" color="success.main">
                          זמין עכשיו
                        </Typography>
                      </Box>
                    </CardContent>
                  </SupportCard>
                ))}
              </Box>

              {/* שאלות נפוצות */}
              <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                שאלות נפוצות
              </Typography>
              
              <Box>
                {faqItems.map((faq) => (
                  <Accordion
                    key={faq.id}
                    expanded={expandedFaq === faq.id}
                    onChange={handleFaqChange(faq.id)}
                    sx={{
                      borderRadius: 2,
                      mb: 2,
                      '&:before': { display: 'none' },
                      boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ChevronDown size={20} />}
                      sx={{
                        borderRadius: 2,
                        '&.Mui-expanded': {
                          borderBottomLeftRadius: 0,
                          borderBottomRightRadius: 0,
                        }
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={600}>
                        {faq.question}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" color="text.secondary">
                        {faq.answer}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Box>

            {/* טופס יצירת קשר */}
            <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 20 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                שלח לנו הודעה
              </Typography>
              
              <Box component="form" display="flex" flexDirection="column" gap={2}>
                <TextField
                  label="שם מלא"
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <TextField
                  label="אימייל"
                  type="email"
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <TextField
                  label="נושא"
                  fullWidth
                  variant="outlined"
                  size="small"
                />
                <TextField
                  label="הודעה"
                  multiline
                  rows={4}
                  fullWidth
                  variant="outlined"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="תאר את הבעיה או השאלה שלך..."
                />
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Send size={16} />}
                  disabled={!message.trim()}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    py: 1.5,
                    mt: 2
                  }}
                >
                  שלח הודעה
                </Button>
              </Box>

              <Box mt={4} p={2} bgcolor={alpha(theme.palette.info.main, 0.1)} borderRadius={2}>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                  זמני מענה צפויים:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <MessageSquare size={16} />
                    </ListItemIcon>
                    <ListItemText primary="צ'אט - מיידי" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Phone size={16} />
                    </ListItemIcon>
                    <ListItemText primary="טלפון - מיידי" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Mail size={16} />
                    </ListItemIcon>
                    <ListItemText primary="אימייל - עד 24 שעות" />
                  </ListItem>
                </List>
              </Box>

              <Box mt={3} textAlign="center">
                <Typography variant="body2" color="text.secondary" mb={2}>
                  דרג את השירות שלנו:
                </Typography>
                <Rating name="service-rating" defaultValue={5} />
              </Box>
            </Paper>
          </Box>
        </div>
      </Fade>
    </PageContainer>
  );
};

export default SupportPage;