// utils/GridHelpers.ts
import { Box, BoxProps } from '@mui/material';
import { styled } from '@mui/material/styles';

// Grid Wrapper שעובד עם כל גרסה של MUI
export const ResponsiveGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  width: '100%',
  
  // Responsive breakpoints
  gridTemplateColumns: 'repeat(1, 1fr)',
  
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  
  [theme.breakpoints.up('lg')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
  },
  
  [theme.breakpoints.up('xl')]: {
    gridTemplateColumns: 'repeat(6, 1fr)',
  },
}));

// Stats Grid
export const StatsGrid = styled(Box)(({ theme }) => ({
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

// Folder Grid
export const FolderGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(1, 1fr)',
  },
}));

// Form Grid - for two column forms
export const FormGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  
  gridTemplateColumns: 'repeat(1, 1fr)',
  
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
}));

// Flex Grid - גיבוי אם Grid לא עובד
export const FlexGrid = styled(Box)<{ columns?: number }>(({ theme, columns = 4 }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(3),
  
  '& > *': {
    flex: `1 1 calc(100% / ${columns} - ${theme.spacing(3)})`,
    minWidth: 280,
    
    [theme.breakpoints.down('lg')]: {
      flex: '1 1 calc(33.333% - 16px)',
    },
    
    [theme.breakpoints.down('md')]: {
      flex: '1 1 calc(50% - 12px)',
    },
    
    [theme.breakpoints.down('sm')]: {
      flex: '1 1 100%',
    },
  },
}));