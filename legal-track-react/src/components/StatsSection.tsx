import React from 'react';
import { 
  Paper, 
  Typography, 
  Box,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  FolderOpen, 
  FileText, 
  Users, 
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';
import { Client } from '../models/Client';
import {MyFolder} from '../models/Folder';

// Custom Grid Component
const StatsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  marginBottom: theme.spacing(4),
  
  gridTemplateColumns: 'repeat(1, 1fr)',
  
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(6, 1fr)',
  },
}));

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  subtitle: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, var(--card-color), var(--card-color-light))',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  background: 'linear-gradient(135deg, var(--card-color), var(--card-color-light))',
  boxShadow: `0 8px 24px ${alpha('#000', 0.15)}`,
  
  '& svg': {
    color: 'white',
  },
}));

const TrendIndicator = styled(Box)<{ isPositive: boolean }>(({ theme, isPositive }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
  fontSize: '0.875rem',
  fontWeight: 600,
  color: isPositive ? theme.palette.success.main : theme.palette.error.main,
}));

const StatCard: React.FC<StatsCardProps> = ({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color,
  trend 
}) => {
  
  return (
    <StatsCard
      sx={{
        '--card-color': color,
        '--card-color-light': alpha(color, 0.8),
      }}
    >
      <IconWrapper>
        {icon}
      </IconWrapper>
      
      <Typography 
        variant="h3" 
        fontWeight={700} 
        color="text.primary"
        sx={{ 
          background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.8)})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 0.5
        }}
      >
        {value.toLocaleString()}
      </Typography>
      
      <Typography variant="h6" fontWeight={600} color="text.primary" gutterBottom>
        {title}
      </Typography>
      
      <Typography variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
      
      {trend && (
        <TrendIndicator isPositive={trend.isPositive}>
          <TrendingUp size={16} />
          {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
        </TrendIndicator>
      )}
    </StatsCard>
  );
};

interface StatsSectionProps {
  folders: MyFolder[];
  clients: Client[];
}

const StatsSection: React.FC<StatsSectionProps> = ({ folders, clients }) => {
  const totalDocuments = folders.reduce((sum, folder) => 
    sum + (folder.documents?.length || 0), 0
  );
  
  const recentFolders = folders.filter(folder => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(folder.createdDate) > weekAgo;
  }).length;

  const avgDocumentsPerFolder = folders.length > 0 
    ? Math.round(totalDocuments / folders.length) 
    : 0;

  const stats = [
    {
      icon: <FolderOpen size={24} />,
      title: 'תיקיות פעילות',
      value: folders.length,
      subtitle: 'סה"כ תיקיות במערכת',
      color: '#667eea',
      trend: { value: 12, isPositive: true }
    },
    {
      icon: <FileText size={24} />,
      title: 'מסמכים',
      value: totalDocuments,
      subtitle: 'סה"כ מסמכים שהועלו',
      color: '#10b981',
      trend: { value: 8, isPositive: true }
    },
    {
      icon: <Users size={24} />,
      title: 'לקוחות',
      value: clients.length,
      subtitle: 'לקוחות רשומים במערכת',
      color: '#f59e0b',
    },
    {
      icon: <Activity size={24} />,
      title: 'ממוצע מסמכים',
      value: avgDocumentsPerFolder,
      subtitle: 'מסמכים לתיקייה',
      color: '#ef4444',
    },
    {
      icon: <Calendar size={24} />,
      title: 'תיקיות חדשות',
      value: recentFolders,
      subtitle: 'השבוע האחרון',
      color: '#8b5cf6',
      trend: { value: 25, isPositive: true }
    },
    {
      icon: <TrendingUp size={24} />,
      title: 'פעילות',
      value: 94,
      subtitle: 'אחוז השלמת משימות',
      color: '#06b6d4',
      trend: { value: 5, isPositive: true }
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Typography 
        variant="h5" 
        fontWeight={700} 
        gutterBottom 
        sx={{ mb: 3, color: 'text.primary' }}
      >
        סקירה כללית
      </Typography>
      
      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </StatsGrid>
    </Box>
  );
};

export default StatsSection;