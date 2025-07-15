import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Collapse,
  Fab,
  useTheme,
  alpha,
  Zoom,
  Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Plus, X, FolderPlus } from 'lucide-react';
import AddFolderForm from './AddFolderForm';
import { Client } from '../models/Client';

const ContentSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 20,
  marginBottom: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: theme.spacing(2),
  }
}));

const AnimatedFab = styled(Fab)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '&:hover': {
    transform: 'translateY(-4px) scale(1.05)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.6)}`,
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
  },
  
  '&.expanded': {
    background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
    
    '&:hover': {
      background: `linear-gradient(135deg, ${theme.palette.error.dark}, ${theme.palette.error.main})`,
    }
  }
}));

const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(6),
  borderRadius: 16,
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, transparent)`,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    borderColor: alpha(theme.palette.primary.main, 0.5),
    background: alpha(theme.palette.primary.main, 0.08),
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  
  '& svg': {
    color: theme.palette.primary.main,
  }
}));

interface FolderCreationSectionProps {
  onAddFolder: (folderData: {
    folderName: string;
    clientId: number | null;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    color?: string;
    tags?: string[];
  }) => Promise<void>;
  clients: Client[];
  selectedClientId: number | null;
  onSelectClient: (clientId: number | null) => void;
  isLoading?: boolean;
}

const FolderCreationSection: React.FC<FolderCreationSectionProps> = ({
  onAddFolder,
  clients,
  selectedClientId,
  onSelectClient,
  isLoading = false
}) => {
  const theme = useTheme();
  const [showForm, setShowForm] = useState(false);

  const handleToggleForm = () => {
    setShowForm(!showForm);
  };

  const handleFormSubmit = async (folderData: {
    folderName: string;
    clientId: number | null;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    color?: string;
    tags?: string[];
  }) => {
    try {
      await onAddFolder(folderData);
      setShowForm(false);
    } catch (error) {
      // Error handling is done in parent component
      console.error('Error in form submission:', error);
    }
  };

  if (showForm) {
    return (
      <ContentSection>
        <HeaderSection>
          <Box display="flex" alignItems="center" gap={2}>
            <IconWrapper sx={{ width: 48, height: 48 }}>
              <FolderPlus size={24} />
            </IconWrapper>
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary">
                יצירת תיקייה חדשה
              </Typography>
              <Typography variant="body2" color="text.secondary">
                הוסף תיקייה חדשה למערכת וקשר אותה ללקוח
              </Typography>
            </Box>
          </Box>
          
          <Tooltip title="סגור טופס">
            <AnimatedFab
              size="medium"
              onClick={handleToggleForm}
              className="expanded"
              disabled={isLoading}
            >
              <Zoom in={true}>
                <X size={24} />
              </Zoom>
            </AnimatedFab>
          </Tooltip>
        </HeaderSection>
        
        <Collapse in={showForm} timeout={400}>
          <Box sx={{ pt: 2 }}>
            <AddFolderForm
              onAddFolder={handleFormSubmit}
              clients={clients}
              selectedClientId={selectedClientId}
              onSelectClient={onSelectClient}
            />
          </Box>
        </Collapse>
      </ContentSection>
    );
  }

  return (
    <ContentSection>
      <EmptyState onClick={handleToggleForm} sx={{ cursor: 'pointer' }}>
        <IconWrapper>
          <FolderPlus size={40} />
        </IconWrapper>
        
        <Typography variant="h5" fontWeight={700} gutterBottom color="primary">
          צור תיקייה חדשה
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          התחל עבודה על תיק חדש על ידי יצירת תיקייה וקישורה ללקוח
        </Typography>
        
        <Tooltip title="לחץ להוספת תיקייה חדשה">
          <AnimatedFab
            size="large"
            onClick={handleToggleForm}
            disabled={isLoading}
          >
            <Zoom in={true}>
              <Plus size={28} />
            </Zoom>
          </AnimatedFab>
        </Tooltip>
      </EmptyState>
    </ContentSection>
  );
};

export default FolderCreationSection;