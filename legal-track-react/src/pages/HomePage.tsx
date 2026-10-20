import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  IconButton,
  Avatar,
  Chip,
  useTheme,
  alpha,
  Fade,
  Zoom,
  LinearProgress,
  Tooltip,
  // Remove Grid from here
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import {
  FolderOpen,
  Users,
  FileText,
  Plus,
  ArrowRight,
  Clock,
  Activity,
  BarChart3,
  Search,
  Shield,
  Globe,
  Zap
} from "lucide-react";

// Import your existing components
import { getAllFolders } from "../api/api";
import { getClients } from "../api/clientApi";
import { MyFolder } from "../models/Folder";
import { Client } from "../models/Client";

const PageContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4, 3),
  minHeight: "100vh",
  background: `linear-gradient(145deg, #f8fafc 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
}));

const WelcomeSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 24,
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  marginBottom: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -100,
    right: -100,
    width: 200,
    height: 200,
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
  }
}));

const StatsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  marginBottom: theme.spacing(4),
  
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  }
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'var(--card-color, linear-gradient(90deg, #667eea, #764ba2))',
  }
}));

const ActionCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  height: '100%',
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.2)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  }
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(2, 3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  fontWeight: 600,
  textTransform: 'none',
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
  }
}));

const RecentActivityCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  marginBottom: theme.spacing(2),
}));

const ProgressIndicator = styled(LinearProgress)(({ theme }) => ({
  borderRadius: 4,
  height: 8,
  background: alpha(theme.palette.primary.main, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

// New Styled Components for Grid Layout
const MainContentGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: theme.spacing(4),
  
  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  }
}));

const QuickActionsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: theme.spacing(3),
  
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  }
}));

interface HomePageProps {}

const HomePage: React.FC<HomePageProps> = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [folders, setFolders] = useState<MyFolder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [foldersData, clientsData] = await Promise.all([
          getAllFolders(),
          getClients()
        ]);
        setFolders(foldersData || []);
        setClients(clientsData?.data || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const totalDocuments = folders.reduce((sum, folder) => 
    sum + (folder.documents?.length || 0), 0
  );

  const recentFolders = folders
    .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    .slice(0, 5);

  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const foldersLast30Days = folders.filter((f) => new Date(f.createdDate).getTime() >= monthAgo).length;

  const statsData = [
    {
      title: 'סה"כ תיקיות',
      value: folders.length,
      icon: <FolderOpen size={24} />,
      color: '#667eea',
      subtitle: "תיקים פתוחים במשרד"
    },
    {
      title: 'מסמכים',
      value: totalDocuments,
      icon: <FileText size={24} />,
      color: '#10b981',
      subtitle: "בכל התיקים"
    },
    {
      title: 'לקוחות פעילים',
      value: clients.length,
      icon: <Users size={24} />,
      color: '#f59e0b',
      subtitle: "לקוחות רשומים"
    },
    {
      title: "תיקים חדשים",
      value: foldersLast30Days,
      icon: <Activity size={24} />,
      color: "#ef4444",
      subtitle: "ב-30 הימים האחרונים"
    }
  ];

  const quickActions = [
    {
      title: 'תיקייה חדשה',
      description: 'צור תיקייה חדשה לתיק',
      icon: <Plus size={24} />,
      action: () => navigate('/folders'),
      color: '#667eea'
    },
    {
      title: 'ניהול תיקיות',
      description: 'צפה וערוך תיקיות קיימות',
      icon: <FolderOpen size={24} />,
      action: () => navigate('/folders'),
      color: '#10b981'
    },
    {
      title: 'לקוחות',
      description: 'נהל את רשימת הלקוחות',
      icon: <Users size={24} />,
      action: () => navigate('/clients'),
      color: '#f59e0b'
    },
    {
      title: 'דוחות',
      description: 'צפה בדוחות ונתונים',
      icon: <BarChart3 size={24} />,
      action: () => console.log('Reports'),
      color: '#8b5cf6'
    }
  ];

  if (loading) {
    return (
      <PageContainer maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Box textAlign="center">
            <ProgressIndicator sx={{ width: 200, mb: 2 }} />
            <Typography variant="body1" color="text.secondary">
              טוען נתונים...
            </Typography>
          </Box>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="xl">
      <Fade in={true} timeout={600}>
        <div>
          {/* Welcome Section */}
          <WelcomeSection elevation={0}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  ברוכים השבים! 👋
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                  סקירה יומית של המערכת שלך
                </Typography>
                <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                  <Chip 
                    icon={<Shield size={16} />}
                    label="מערכת מאובטחת" 
                    sx={{ 
                      background: alpha('#ffffff', 0.2)
, 
                      color: 'white', 
                      border: `1px solid ${alpha('#ffffff', 0.3)
}` 
                    }} 
                  />
                  <Chip 
                    icon={<Globe size={16} />}
                    label="זמינות 99.9%" 
                    sx={{ 
                      background: alpha('#ffffff', 0.2)
, 
                      color: 'white', 
                      border: `1px solid ${alpha('#ffffff', 0.3)
}` 
                    }} 
                  />
                  <Chip 
                    icon={<Zap size={16} />}
                    label="עדכון אחרון: היום" 
                    sx={{ 
                      background: alpha('#ffffff', 0.2)
, 
                      color: 'white', 
                      border: `1px solid ${alpha('#ffffff', 0.3)
}` 
                    }} 
                  />
                </Box>
              </Box>
              <Box display="flex" gap={2}>
                <QuickActionButton
                  startIcon={<Plus size={20} />}
                  onClick={() => navigate('/folders')}
                >
                  תיקייה חדשה
                </QuickActionButton>
                <QuickActionButton
                  variant="outlined"
                  startIcon={<Search size={20} />}
                  sx={{
                    background: alpha('#ffffff', 0.2)
,
                    border: `1px solid ${alpha('#ffffff', 0.3)
}`,
                    color: 'white',
                    '&:hover': {
                      background: alpha('#ffffff', 0.3)
,
                    }
                  }}
                >
                  חיפוש מהיר
                </QuickActionButton>
              </Box>
            </Box>
          </WelcomeSection>

          {/* Stats Section */}
          <StatsGrid>
            {statsData.map((stat, index) => (
              <Zoom in={true} timeout={300 + index * 100} key={index}>
                <StatsCard sx={{ '--card-color': stat.color }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {stat.title}
                        </Typography>
                        <Typography variant="h3" fontWeight={700} color="primary">
                          {stat.value.toLocaleString()}
                        </Typography>
                      </Box>
                      <Avatar 
                        sx={{ 
                          background: `linear-gradient(135deg, ${stat.color}, ${alpha(stat.color, 0.8)})`,
                          color: '#ffffff'
                        }}
                      >
                        {stat.icon}
                      </Avatar>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2" color="text.secondary">
                        {stat.subtitle}
                      </Typography>
                    </Box>
                  </CardContent>
                </StatsCard>
              </Zoom>
            ))}
          </StatsGrid>

          {/* Quick Actions & Recent Activity */}
          <MainContentGrid>
            {/* Quick Actions */}
            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom color="primary" sx={{ mb: 3 }}>
                פעולות מהירות
              </Typography>
              <QuickActionsGrid>
                {quickActions.map((action, index) => (
                  <Zoom in={true} timeout={400 + index * 100} key={index}>
                    <ActionCard onClick={action.action}>
                      <CardContent sx={{ p: 3, textAlign: 'center' }}>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            margin: '0 auto',
                            mb: 2,
                            background: `linear-gradient(135deg, ${action.color}, ${alpha(action.color, 0.8)})`,
                            color: '#ffffff'
                          }}
                        >
                          {action.icon}
                        </Avatar>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {action.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {action.description}
                        </Typography>
                      </CardContent>
                    </ActionCard>
                  </Zoom>
                ))}
              </QuickActionsGrid>
            </Box>

            {/* Recent Activity */}
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h5" fontWeight={700} color="primary">
                  פעילות אחרונה
                </Typography>
                <Button
                  endIcon={<ArrowRight size={16} />}
                  onClick={() => navigate('/folders')}
                  sx={{ color: 'text.secondary' }}
                >
                  צפה בכל התיקיות
                </Button>
              </Box>

              {recentFolders.length > 0 ? (
                <Box>
                  {recentFolders.map((folder, index) => (
                    <Fade in={true} timeout={500 + index * 100} key={folder.folderId}>
                      <RecentActivityCard elevation={0}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            sx={{
                              background: `linear-gradient(135deg, #667eea, #764ba2)`,
                              color: '#ffffff'
                            }}
                          >
                            <FolderOpen size={20} />
                          </Avatar>
                          <Box flex={1}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {folder.folderName}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                                <FileText size={12} />
                                {folder.documents?.length || 0} מסמכים
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                                <Clock size={12} />
                                {new Date(folder.createdDate).toLocaleDateString('he-IL')}
                              </Typography>
                            </Box>
                          </Box>
                          <Tooltip title="פתח תיקייה">
                            <IconButton
                              onClick={() => navigate(`/folders/${folder.folderId}`)}
                              sx={{
                                background: alpha(theme.palette.primary.main, 0.1),
                                '&:hover': {
                                  background: alpha(theme.palette.primary.main, 0.2),
                                }
                              }}
                            >
                              <ArrowRight size={16} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </RecentActivityCard>
                    </Fade>
                  ))}
                </Box>
              ) : (
                <Box 
                  textAlign="center" 
                  py={6}
                  sx={{
                    background: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 3,
                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  <FolderOpen size={48} color={alpha(theme.palette.primary.main, 0.5)} />
                  <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                    אין תיקיות עדיין
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    התחל על ידי יצירת התיקייה הראשונה שלך
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={() => navigate('/folders')}
                  >
                    צור תיקייה חדשה
                  </Button>
                </Box>
              )}
            </Box>
          </MainContentGrid>
        </div>
      </Fade>
    </PageContainer>
  );
};

export default HomePage;