import { 
  Container, 
  Alert,
  Skeleton,
  Snackbar,
  Fade,
  
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Components
import PageHeader from "../components/PageHeader";
import StatsSection from "../components/StatsSection";
import FolderCreationSection from "../components/FolderCreationSection";
import FolderGridView from "../components/FolderGridView";

// API & Models
import {
  deleteFolder,
  getAllFolders,
  updateFolder,
  createFolder as apiCreateFolder
} from "../api/api";
import {MyFolder} from "../models/Folder";
import { Client } from "../models/Client";
import { getClients } from "../api/clientApi";

// קובץ עזר לשיפורים נוספים שיכולים להתווסף לאפליקציה

// 1. קומפוננט לתצוגת סטטיסטיקות מתקדמת
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AdvancedStatsCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'percentage' | 'currency';
  color?: string;
  icon?: React.ReactNode;
}

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
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

const AdvancedStatsCard: React.FC<AdvancedStatsCardProps> = ({
  title,
  value,
  previousValue,
  format = 'number',
  color = '#667eea',
  icon
}) => {
  
  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${val}%`;
      case 'currency':
        return `₪${val.toLocaleString()}`;
      default:
        return val.toLocaleString();
    }
  };

  const getTrend = () => {
    if (!previousValue) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    
    if (Math.abs(change) < 1) {
      return { icon: <Minus size={16} />, color: 'text.secondary', text: 'ללא שינוי' };
    } else if (change > 0) {
      return { icon: <TrendingUp size={16} />, color: 'success.main', text: `+${change.toFixed(1)}%` };
    } else {
      return { icon: <TrendingDown size={16} />, color: 'error.main', text: `${change.toFixed(1)}%` };
    }
  };

  const trend = getTrend();

  return (
    <StatsCard sx={{ '--card-color': color }}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color="primary">
            {formatValue(value)}
          </Typography>
        </Box>
        {icon && (
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              background: alpha(color, 0.1),
              color,
            }}
          >
            {icon}
          </Box>
        )}
      </Box>
      
      {trend && (
        <Box display="flex" alignItems="center" gap={1}>
          <Box display="flex" alignItems="center" gap={0.5} color={trend.color}>
            {trend.icon}
            <Typography variant="caption" fontWeight={600}>
              {trend.text}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            מהחודש שעבר
          </Typography>
        </Box>
      )}
    </StatsCard>
  );
};

// 2. קומפוננט לפופאפ מידע מתקדם
const InfoPopup = styled(Paper)(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: 500,
  borderRadius: 20,
  padding: theme.spacing(4),
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 32px 64px ${alpha(theme.palette.common.black, 0.2)}`,
  zIndex: 1300,
}));

// 3. קומפוננט לחיפוש מתקדם
const AdvancedSearchBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  marginBottom: theme.spacing(3),
}));

// 4. אנימציות CSS-in-JS
const animations = {
  slideInFromLeft: {
    '@keyframes slideInFromLeft': {
      '0%': {
        opacity: 0,
        transform: 'translateX(-50px)',
      },
      '100%': {
        opacity: 1,
        transform: 'translateX(0)',
      },
    },
    animation: 'slideInFromLeft 0.5s ease-out',
  },
  
  bounceIn: {
    '@keyframes bounceIn': {
      '0%': {
        opacity: 0,
        transform: 'scale(0.3)',
      },
      '50%': {
        opacity: 1,
        transform: 'scale(1.05)',
      },
      '70%': {
        transform: 'scale(0.9)',
      },
      '100%': {
        opacity: 1,
        transform: 'scale(1)',
      },
    },
    animation: 'bounceIn 0.6s ease-out',
  },
  
  fadeInUp: {
    '@keyframes fadeInUp': {
      '0%': {
        opacity: 0,
        transform: 'translateY(30px)',
      },
      '100%': {
        opacity: 1,
        transform: 'translateY(0)',
      },
    },
    animation: 'fadeInUp 0.5s ease-out',
  },
};

// 5. Hook עזר לניהול מצב אנימציות
export const useAnimations = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return { isVisible, animations };
};

// 6. קומפוננט למודל מתקדם
interface AdvancedModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const AdvancedModal: React.FC<AdvancedModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions
}) => {
  const theme = useTheme();
  
  if (!open) return null;
  
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: alpha(theme.palette.common.black, 0.7),
        backdropFilter: 'blur(10px)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
      onClick={onClose}
    >
      <InfoPopup
        onClick={(e) => e.stopPropagation()}
        sx={{
          ...animations.bounceIn,
        }}
      >
        <Typography variant="h5" fontWeight={700} gutterBottom color="primary">
          {title}
        </Typography>
        <Box mb={3}>
          {children}
        </Box>
        {actions && (
          <Box display="flex" gap={2} justifyContent="flex-end">
            {actions}
          </Box>
        )}
      </InfoPopup>
    </Box>
  );
};

// 7. Toast Notifications מתקדמות
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
}

// const ToastContainer = styled(Box)(({ theme }) => ({
//   position: 'fixed',
//   top: theme.spacing(2),
//   right: theme.spacing(2),
//   zIndex: 1400,
//   minWidth: 300,
//   maxWidth: 500,
// }));

const Toast: React.FC<ToastProps> = ({ message, type, duration = 4000, onClose }) => {
  const theme = useTheme();
  
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  const colors = {
    success: theme.palette.success.main,
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
  };
  
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        background: alpha(colors[type], 0.1),
        border: `1px solid ${alpha(colors[type], 0.3)}`,
        color: colors[type],
        ...animations.slideInFromLeft,
      }}
    >
      <Typography variant="body2" fontWeight={600}>
        {message}
      </Typography>
    </Paper>
  );
};

// 8. Hook לניהול Toast
export const useToast = () => {
  const [toasts, setToasts] = React.useState<Array<{
    id: number;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>>([]);
  
  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  
  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  const ToastContainer = () => (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </Box>
  );
  
  return { showToast, ToastContainer };
};

// Export all components for use
export {
  AdvancedStatsCard,
  AdvancedModal,
  Toast,
  animations,
  AdvancedSearchBox,
};

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: "100vh",
  backgroundColor: "#f8fafc",
  
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
  
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const LoadingSkeleton = () => (
  <LoadingContainer>
    {/* Header Skeleton */}
    <Skeleton 
      variant="rounded" 
      height={200} 
      sx={{ borderRadius: 4 }}
      animation="wave"
    />
    
    {/* Stats Skeleton */}
    <Box display="flex" gap={2}>
      {[...Array(6)].map((_, index) => (
        <Skeleton 
          key={index}
          variant="rounded" 
          height={140} 
          sx={{ flex: 1, borderRadius: 3 }}
          animation="wave"
        />
      ))}
    </Box>
    
    {/* Folders Skeleton */}
    <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={3}>
      {[...Array(8)].map((_, index) => (
        <Skeleton 
          key={index}
          variant="rounded" 
          height={200} 
          sx={{ borderRadius: 4 }}
          animation="wave"
        />
      ))}
    </Box>
  </LoadingContainer>
);

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// טיפוס הנתונים שהשרת מצפה לקבל
export interface CreateFolderRequest {
  folderName: string;
  clientId: number | null;
}

const FolderManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // State Management
  const [folders, setFolders] = useState<MyFolder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info'
  });

  // פונקציה עזר לקבלת groupId מהטוקן
  const getUserGroupId = (): number => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const cleanToken = token.replace(/^"|"$/g, '');
        const payload = JSON.parse(atob(cleanToken.split('.')[1]));
        console.log('JWT payload:', payload);
        return payload.GroupId || payload.groupId || 1;
      }
    } catch (error) {
      console.error('Error parsing token for groupId:', error);
    }
    console.warn('Using fallback groupId = 1');
    return 1; // fallback
  };

  // Filtered folders based on search and filters
  const filteredFolders = useMemo(() => {
    let filtered = folders;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(folder =>
        folder.folderName.toLowerCase().includes(query) ||
        folder.documents?.some((doc: { documentName: string; }) => 
          doc.documentName.toLowerCase().includes(query)
        )
      );
    }

    // Additional filters
    activeFilters.forEach(filter => {
      switch (filter) {
        case 'תיקיות פעילות':
          filtered = filtered.filter(folder => folder.documents && folder.documents.length > 0);
          break;
        case 'תיקיות ריקות':
          filtered = filtered.filter(folder => !folder.documents || folder.documents.length === 0);
          break;
        case 'נוצר השבוע':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          filtered = filtered.filter(folder => new Date(folder.createdDate) > weekAgo);
          break;
        case 'נוצר החודש':
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          filtered = filtered.filter(folder => new Date(folder.createdDate) > monthAgo);
          break;
      }
    });

    return filtered;
  }, [folders, searchQuery, activeFilters]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ open: true, message, severity });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading initial data...');
      await Promise.all([loadFolders(), loadClients()]);
      showNotification('נתונים נטענו בהצלחה', 'success');
    } catch (err) {
      const errorMessage = 'שגיאה בטעינת הנתונים. אנא נסה שוב.';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      console.log('Fetching clients...');
      const response = await getClients();
      console.log('Raw clients response:', response);
      
      // וודא שקיבלנו array תקין
      let clientsData = [];
      
      if (response && response.data && Array.isArray(response.data)) {
        clientsData = response.data;
      } else if (Array.isArray(response)) {
        clientsData = response;
      } else {
        console.warn('Invalid clients data format, using empty array');
        clientsData = [];
      }
      
      console.log('Clients loaded:', clientsData);
      setClients(clientsData);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      // במקרה של שגיאה, הגדר array ריק
      setClients([]);
    }
  };

  const loadFolders = async () => {
    try {
      console.log('Fetching folders...');
      const response = await getAllFolders();
      const foldersData = response || [];
      console.log('Folders loaded:', foldersData);
      setFolders(foldersData);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      setFolders([]);
    }
  };

  const handleAddFolder = async (folderData: CreateFolderRequest) => {
    setIsCreating(true);
    try {
      console.log('Creating folder with data:', folderData);
      
      // וידוא שיש clientId
      if (!folderData.clientId) {
        throw new Error('Client ID is required');
      }

      // יצירת הנתונים שהשרת מצפה להם
      const backendData = {
        folderName: folderData.folderName,
        clientId: folderData.clientId,
        groupId: getUserGroupId() // הוספת groupId
      };

      console.log('Sending to backend:', backendData);
      
      // קריאה ל-API עם הנתונים הנכונים
      const newFolder = await apiCreateFolder(backendData);
      console.log('Folder created:', newFolder);
      
      setFolders((prev) => [...prev, newFolder]);
      showNotification(`תיקייה "${folderData.folderName}" נוצרה בהצלחה`, 'success');
    } catch (error: any) {
      console.error("Error creating folder:", error);
      const errorMessage = error.message || 'שגיאה ביצירת תיקייה';
      showNotification(errorMessage, 'error');
      throw error; // מעביר את השגיאה הלאה כדי שהטופס יידע
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditFolder = async (oldName: string, newName: string) => {
    const folderToUpdate = folders.find((f) => f.folderName === oldName);
    if (!folderToUpdate) return;
    
    try {
      console.log('Updating folder:', { folderId: folderToUpdate.folderId, newName });
      
      await updateFolder(folderToUpdate.folderId, {
        ...folderToUpdate,
        folderName: newName,
      });
      
      setFolders((prev) =>
        prev.map((f) =>
          f.folderId === folderToUpdate.folderId
            ? { ...f, folderName: newName }
            : f
        )
      );
      showNotification(`תיקייה שונתה ל"${newName}"`, 'success');
    } catch (error) {
      console.error("Error updating folder:", error);
      showNotification('שגיאה בעדכון תיקייה', 'error');
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    const folder = folders.find(f => f.folderId === folderId);
    try {
      console.log('Deleting folder:', folderId);
      
      await deleteFolder(folderId);
      setFolders((prev) => prev.filter((f) => f.folderId !== folderId));
      showNotification(`תיקייה "${folder?.folderName}" נמחקה`, 'success');
    } catch (error) {
      console.error("Error deleting folder:", error);
      showNotification('שגיאה במחיקת תיקייה', 'error');
    }
  };

  const handleFolderClick = (folder: { id: number }) => {
    console.log('Navigating to folder:', folder.id);
    navigate(`/folders/${folder.id}`);
  };

  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    setSearchQuery(query);
  };

  const handleFilterChange = (filters: string[]) => {
    console.log('Filters changed:', filters);
    setActiveFilters(filters);
  };

  // Loading state
  if (loading) {
    return (
      <StyledContainer maxWidth="xl">
        <LoadingSkeleton />
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth="xl">
      <Fade in={true} timeout={600}>
        <div>
          {/* Page Header */}
          <PageHeader
            onSearch={handleSearch}
            onFilterChange={handleFilterChange}
            activeFilters={activeFilters}
          />

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
              sx={{ 
                mb: 3, 
                borderRadius: 3,
                boxShadow: `0 4px 20px ${alpha(theme.palette.error.main, 0.2)}`
              }}
            >
              {error}
            </Alert>
          )}

          {/* Statistics Section */}
          <StatsSection folders={folders} clients={clients} />

          {/* Folder Creation */}
          <FolderCreationSection
            onAddFolder={handleAddFolder}
            clients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={setSelectedClientId}
            isLoading={isCreating}
          />

          {/* Folders Grid */}
          {filteredFolders.length > 0 ? (
            <Box>
              <FolderGridView
                folders={filteredFolders.map((folder) => ({
                  name: folder.folderName,
                  files: folder.documents?.map((doc: { documentName: any; }) => doc.documentName) || [],
                  id: folder.folderId,
                  createdDate: folder.createdDate,
                  lastModified: folder.lastModified,
                  clientName: folder.clientId && Array.isArray(clients) && clients.length > 0
                    ? clients.find(c => c.id === folder.clientId)?.fullName 
                    : undefined,
                  status: folder.status || 'active',
                  priority: folder.priority || 'medium',
                  color: folder.color,
                  tags: folder.tags || [],
                  documentsCount: folder.documents?.length || 0,
                }))}
                onFolderClick={handleFolderClick}
                onEditFolder={handleEditFolder}
                onDeleteFolder={handleDeleteFolder}
                searchQuery={searchQuery}
              />
            </Box>
          ) : (
            <Box 
              textAlign="center" 
              py={8}
              sx={{
                background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.05)}, transparent)`,
                borderRadius: 4,
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery || activeFilters.length > 0 
                  ? 'לא נמצאו תיקיות התואמות לחיפוש'
                  : 'עדיין אין תיקיות במערכת'
                }
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery || activeFilters.length > 0
                  ? 'נסה לשנות את מילות החיפוש או המסננים'
                  : 'התחל על ידי יצירת תיקייה חדשה'
                }
              </Typography>
            </Box>
          )}

          {/* Notification Snackbar */}
          <Snackbar
            open={notification.open}
            autoHideDuration={4000}
            onClose={hideNotification}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={hideNotification} 
              severity={notification.severity}
              sx={{ 
                borderRadius: 2,
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`
              }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </div>
      </Fade>
    </StyledContainer>
  );
};

export default FolderManagementPage;