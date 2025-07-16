// src/pages/CalendarPage.tsx
import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Button,
  Card,
  CardContent,
  useTheme,
  alpha,
  Fade,
  Chip,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Calendar,
  Plus,
  Clock,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight
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

const EventCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
  }
}));

const CalendarPage: React.FC = () => {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());

  const mockEvents = [
    {
      id: 1,
      title: 'פגישה עם לקוח - משפחת כהן',
      time: '09:00',
      duration: '1 שעה',
      location: 'משרד',
      type: 'meeting',
      color: '#667eea'
    },
    {
      id: 2,
      title: 'דיון בבית משפט',
      time: '14:00',
      duration: '2 שעות',
      location: 'בית משפט השלום תל אביב',
      type: 'court',
      color: '#ef4444'
    },
    {
      id: 3,
      title: 'הכנת תסקירים',
      time: '16:30',
      duration: '1.5 שעות',
      location: 'משרד',
      type: 'work',
      color: '#10b981'
    }
  ];

  return (
    <PageContainer maxWidth="xl">
      <Fade in={true} timeout={600}>
        <div>
          <HeaderSection elevation={0}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Box>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  יומן וזמנים 📅
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  נהל את הפגישות והמשימות שלך
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Plus size={20} />}
                sx={{
                  background: alpha('#ffffff', 0.2),
                  '&:hover': { background: alpha('#ffffff', 0.3) }
                }}
              >
                אירוע חדש
              </Button>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2}>
              <Button
                startIcon={<ChevronRight size={20} />}
                sx={{ color: 'white' }}
              >
                חודש קודם
              </Button>
              <Typography variant="h6" fontWeight={600}>
                {currentDate.toLocaleDateString('he-IL', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </Typography>
              <Button
                endIcon={<ChevronLeft size={20} />}
                sx={{ color: 'white' }}
              >
                חודש הבא
              </Button>
            </Box>
          </HeaderSection>

          <Box sx={{ 
            display: 'grid', 
            gap: 3, 
            gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' } 
          }}>
            <Paper sx={{ p: 3, borderRadius: 3, minHeight: 500 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                לוח שנה
              </Typography>
              <Box 
                sx={{ 
                  height: 400, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                  borderRadius: 2
                }}
              >
                <Typography color="text.secondary">
                  רכיב לוח שנה יוצג כאן
                </Typography>
              </Box>
            </Paper>
            
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={3}>
                אירועים היום
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={2}>
                {mockEvents.map((event) => (
                  <EventCard key={event.id}>
                    <CardContent sx={{ p: 2 }}>
                      <Box display="flex" alignItems="center" gap={2} mb={1}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            background: event.color,
                            color: 'white'
                          }}
                        >
                          <Calendar size={16} />
                        </Avatar>
                        <Box flex={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {event.title}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <Clock size={12} />
                            <Typography variant="caption" color="text.secondary">
                              {event.time} • {event.duration}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <MapPin size={12} color={theme.palette.text.secondary} />
                        <Typography variant="caption" color="text.secondary">
                          {event.location}
                        </Typography>
                      </Box>
                    </CardContent>
                  </EventCard>
                ))}
              </Box>
            </Paper>
          </Box>
        </div>
      </Fade>
    </PageContainer>
  );
};

export default CalendarPage;