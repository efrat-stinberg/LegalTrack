
// src/pages/AnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  useTheme,
  alpha,
  Fade,
  LinearProgress,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  FolderOpen,
  Activity,
  Clock,
  Target
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

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
  }
}));

const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);

  const analyticsData = [
    {
      title: 'תיקים פעילים',
      value: 45,
      change: '+12%',
      icon: <FolderOpen size={24} />,
      color: '#667eea'
    },
    {
      title: 'מסמכים חדשים',
      value: 128,
      change: '+24%',
      icon: <FileText size={24} />,
      color: '#10b981'
    },
    {
      title: 'לקוחות פעילים',
      value: 23,
      change: '+8%',
      icon: <Users size={24} />,
      color: '#f59e0b'
    },
    {
      title: 'זמן טיפול ממוצע',
      value: '2.5 שעות',
      change: '-15%',
      icon: <Clock size={24} />,
      color: '#8b5cf6'
    }
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <PageContainer maxWidth="xl">
      <Fade in={true} timeout={600}>
        <div>
          <HeaderSection elevation={0}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              דוחות וניתוחים 📊
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              תובנות חכמות על הפעילות והביצועים שלך
            </Typography>
            
            <Box display="flex" gap={2} flexWrap="wrap">
              <Chip 
                label="נתונים עדכניים" 
                sx={{ 
                  background: alpha('#ffffff', 0.2), 
                  color: 'white' 
                }} 
              />
              <Chip 
                label="עדכון אוטומטי" 
                sx={{ 
                  background: alpha('#ffffff', 0.2), 
                  color: 'white' 
                }} 
              />
            </Box>
          </HeaderSection>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {analyticsData.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatsCard>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${stat.color}, ${alpha(stat.color, 0.8)})`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white'
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography variant="h4" fontWeight={700} color="primary">
                          {stat.value}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {stat.title}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TrendingUp size={16} color={theme.palette.success.main} />
                      <Typography variant="body2" color="success.main" fontWeight={600}>
                        {stat.change}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        השבוע
                      </Typography>
                    </Box>
                  </CardContent>
                </StatsCard>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  פעילות חודשית
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    גרף יוצג כאן (נדרש ספריית גרפים)
                  </Typography>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  התפלגות תיקים
                </Typography>
                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography color="text.secondary">
                    גרף עוגה יוצג כאן
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </Fade>
    </PageContainer>
  );
};

export default AnalyticsPage;