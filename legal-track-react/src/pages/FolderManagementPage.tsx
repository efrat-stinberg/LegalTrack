import React, { useState, useEffect, useMemo } from "react";
import { 
  Container, 
  Box,
  Alert,
  Skeleton,
  Snackbar,
  useTheme,
  alpha,
  Fade,
  Typography
} from "@mui/material";
import { styled } from "@mui/material/styles";
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