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
  createFolder,
  deleteFolder,
  getAllFolders,
  updateFolder,
  CreateFolderRequest
} from "../api/api";
import {MyFolder} from "../models/Folder";
import { Client } from "../models/Client";
import { getClients } from "../api/client";

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
      const response = await getClients();
      setClients(response.data || []);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      setClients([]);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await getAllFolders();
      setFolders(response || []);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      setFolders([]);
    }
  };

  const handleAddFolder = async (folderData: CreateFolderRequest) => {
    setIsCreating(true);
    try {
      const newFolder = await createFolder(folderData);
      setFolders((prev) => [...prev, newFolder]);
      showNotification(`תיקייה "${folderData.folderName}" נוצרה בהצלחה`, 'success');
    } catch (error) {
      console.error("Error creating folder:", error);
      showNotification('שגיאה ביצירת תיקייה', 'error');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditFolder = async (oldName: string, newName: string) => {
    const folderToUpdate = folders.find((f) => f.folderName === oldName);
    if (!folderToUpdate) return;
    
    try {
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
      await deleteFolder(folderId);
      setFolders((prev) => prev.filter((f) => f.folderId !== folderId));
      showNotification(`תיקייה "${folder?.folderName}" נמחקה`, 'success');
    } catch (error) {
      console.error("Error deleting folder:", error);
      showNotification('שגיאה במחיקת תיקייה', 'error');
    }
  };

  const handleFolderClick = (folder: { id: number }) => {
    navigate(`/folders/${folder.id}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filters: string[]) => {
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
                  clientName: folder.clientId 
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