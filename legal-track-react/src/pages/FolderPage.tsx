import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Fab,
  Alert,
  Snackbar,
  useTheme,
  alpha,
  Fade,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  Divider,
  Paper,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  Download,
  Upload,
  Folder,
  TrendingUp,
} from 'lucide-react';

// Components
import FolderCreationSection from '../components/FolderCreationSection';
import FolderGridView from '../components/FolderGridView';

// API & Models
import {
  deleteFolder,
  getAllFolders,
  updateFolder,
  createFolder as apiCreateFolder,
} from '../api/api';
import { MyFolder } from '../models/Folder';
import { Client } from '../models/Client';
import { getClients } from '../api/clientApi';

const PageContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: '100vh',
  background: `linear-gradient(145deg, #f8fafc 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
}));

const HeaderSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 20,
  marginBottom: theme.spacing(4),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    background:
      'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
  },
}));

const SearchSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  flexWrap: 'wrap',

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const StyledSearchField = styled(TextField)(({ theme }) => ({
  flex: 1,
  minWidth: 300,

  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    background: theme.palette.background.paper,
    transition: 'all 0.3s ease',

    '&:hover': {
      boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
    },

    '&.Mui-focused': {
      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  background: theme.palette.background.paper,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.3s ease',

  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
  transition: 'all 0.3s ease',
  zIndex: 1000,

  '&:hover': {
    transform: 'scale(1.1) translateY(-4px)',
    boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.6)}`,
  },
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  borderRadius: 12,
  background: alpha(theme.palette.primary.main, 0.1),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  color: theme.palette.primary.main,

  '&.active': {
    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    color: 'white',
  },
}));

const StatsBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(3),
  alignItems: 'center',
  padding: theme.spacing(2, 3),
  background: alpha(theme.palette.background.paper, 0.8),
  borderRadius: 16,
  marginBottom: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,

  [theme.breakpoints.down('sm')]: {
    flexWrap: 'wrap',
    gap: theme.spacing(1),
  },
}));

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export interface CreateFolderRequest {
  folderName: string;
  clientId: number | null;
}

const FoldersPage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // State Management
  const [folders, setFolders] = useState<MyFolder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'documents'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showCreationForm, setShowCreationForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(
    null,
  );

  // Filter options
  const filterOptions = [
    { key: 'hasDocuments', label: 'תיקיות עם מסמכים' },
    { key: 'empty', label: 'תיקיות ריקות' },
    { key: 'recent', label: 'נוצרו השבוע' },
    { key: 'older', label: 'ישנות מחודש' },
  ];

  // פונקציה עזר לקבלת groupId מהטוקן
  const getUserGroupId = (): number => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const cleanToken = token.replace(/^"|"$/g, '');
        const payload = JSON.parse(atob(cleanToken.split('.')[1]));
        return payload.GroupId || payload.groupId || 1;
      }
    } catch (error) {
      console.error('Error parsing token for groupId:', error);
    }
    return 1;
  };

  // Filtered and sorted folders
  const processedFolders = useMemo(() => {
    let filtered = folders;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (folder) =>
          folder.folderName.toLowerCase().includes(query) ||
          folder.documents?.some((doc: { documentName: string }) =>
            doc.documentName.toLowerCase().includes(query),
          ),
      );
    }

    // Additional filters
    activeFilters.forEach((filter) => {
      switch (filter) {
        case 'hasDocuments':
          filtered = filtered.filter(
            (folder) => folder.documents && folder.documents.length > 0,
          );
          break;
        case 'empty':
          filtered = filtered.filter(
            (folder) => !folder.documents || folder.documents.length === 0,
          );
          break;
        case 'recent':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          filtered = filtered.filter(
            (folder) => new Date(folder.createdDate) > weekAgo,
          );
          break;
        case 'older':
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          filtered = filtered.filter(
            (folder) => new Date(folder.createdDate) < monthAgo,
          );
          break;
      }
    });

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.folderName.localeCompare(b.folderName);
          break;
        case 'date':
          comparison =
            new Date(a.createdDate).getTime() -
            new Date(b.createdDate).getTime();
          break;
        case 'documents':
          comparison = (a.documents?.length || 0) - (b.documents?.length || 0);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [folders, searchQuery, activeFilters, sortBy, sortOrder]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const showNotification = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info' = 'info',
  ) => {
    setNotification({ open: true, message, severity });
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadFolders(), loadClients()]);
    } catch (err) {
      showNotification('שגיאה בטעינת הנתונים', 'error');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    try {
      const response = await getClients();
      const clientsData = response?.data || [];
      setClients(clientsData);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      setClients([]);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await getAllFolders();
      const foldersData = response || [];
      setFolders(foldersData);
    } catch (error) {
      console.error('Failed to fetch folders:', error);
      setFolders([]);
    }
  };

  const handleAddFolder = async (folderData: CreateFolderRequest) => {
    setIsCreating(true);
    try {
      if (!folderData.clientId) {
        throw new Error('Client ID is required');
      }

      const backendData = {
        folderName: folderData.folderName,
        clientId: folderData.clientId,
        groupId: getUserGroupId(),
      };

      const newFolder = await apiCreateFolder(backendData);
      setFolders((prev) => [...prev, newFolder]);
      showNotification(
        `תיקייה "${folderData.folderName}" נוצרה בהצלחה`,
        'success',
      );
      setShowCreationForm(false);
    } catch (error: any) {
      console.error('Error creating folder:', error);
      showNotification(error.message || 'שגיאה ביצירת תיקייה', 'error');
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
            : f,
        ),
      );
      showNotification(`תיקייה שונתה ל"${newName}"`, 'success');
    } catch (error) {
      console.error('Error updating folder:', error);
      showNotification('שגיאה בעדכון תיקייה', 'error');
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    const folder = folders.find((f) => f.folderId === folderId);
    try {
      await deleteFolder(folderId);
      setFolders((prev) => prev.filter((f) => f.folderId !== folderId));
      showNotification(`תיקייה "${folder?.folderName}" נמחקה`, 'success');
    } catch (error) {
      console.error('Error deleting folder:', error);
      showNotification('שגיאה במחיקת תיקייה', 'error');
    }
  };

  const handleFolderClick = (folder: { id: number }) => {
    navigate(`/folders/${folder.id}`);
  };

  const handleFilterToggle = (filterKey: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterKey)
        ? prev.filter((f) => f !== filterKey)
        : [...prev, filterKey],
    );
  };

  const handleSortChange = (newSortBy: 'name' | 'date' | 'documents') => {
    if (sortBy === newSortBy) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  const totalDocuments = folders.reduce(
    (sum, folder) => sum + (folder.documents?.length || 0),
    0,
  );

  if (loading) {
    return (
      <PageContainer maxWidth="xl">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <Typography>טוען תיקיות...</Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="xl">
      <Fade in={true} timeout={600}>
        <div>
          {/* Header */}
          <HeaderSection elevation={0}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              <Box>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  ניהול תיקיות 📁
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  ארגן, חפש ונהל את כל התיקיות שלך במקום אחד
                </Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Tooltip title="ייצא נתונים">
                  <ActionButton
                    sx={{ background: alpha('#ffffff', 0.2), color: 'white' }}
                  >
                    <Download size={20} />
                  </ActionButton>
                </Tooltip>
                <Tooltip title="ייבא נתונים">
                  <ActionButton
                    sx={{ background: alpha('#ffffff', 0.2), color: 'white' }}
                  >
                    <Upload size={20} />
                  </ActionButton>
                </Tooltip>
              </Box>
            </Box>
          </HeaderSection>

          {/* Stats Bar */}
          <StatsBar>
            <Box display="flex" alignItems="center" gap={1}>
              <Folder size={20} color={theme.palette.primary.main} />
              <Typography variant="h6" fontWeight={600}>
                {folders.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                תיקיות
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" fontWeight={600}>
                {totalDocuments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                מסמכים
              </Typography>
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" fontWeight={600}>
                {clients.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                לקוחות
              </Typography>
            </Box>

            <Box sx={{ ml: 'auto' }}>
              <Chip
                icon={<TrendingUp size={16} />}
                label="פעילות גבוהה"
                color="success"
                variant="outlined"
              />
            </Box>
          </StatsBar>

          {/* Search and Filters */}
          <SearchSection>
            <StyledSearchField
              placeholder="חפש תיקיות, לקוחות או מסמכים..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />

            <Box display="flex" gap={1} alignItems="center">
              <Tooltip title="מסננים">
                <ActionButton
                  onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
                >
                  <Filter size={20} />
                </ActionButton>
              </Tooltip>

              <Tooltip
                title={`מיון לפי ${sortBy === 'name' ? 'שם' : sortBy === 'date' ? 'תאריך' : 'מסמכים'}`}
              >
                <ActionButton onClick={() => handleSortChange(sortBy)}>
                  {sortOrder === 'asc' ? (
                    <SortAsc size={20} />
                  ) : (
                    <SortDesc size={20} />
                  )}
                </ActionButton>
              </Tooltip>

              <Tooltip
                title={viewMode === 'grid' ? 'מעבר לרשימה' : 'מעבר לרשת'}
              >
                <ActionButton
                  onClick={() =>
                    setViewMode((prev) => (prev === 'grid' ? 'list' : 'grid'))
                  }
                >
                  {viewMode === 'grid' ? (
                    <List size={20} />
                  ) : (
                    <Grid3X3 size={20} />
                  )}
                </ActionButton>
              </Tooltip>
            </Box>
          </SearchSection>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <Box display="flex" gap={1} flexWrap="wrap" mb={3}>
              {activeFilters.map((filter) => {
                const filterOption = filterOptions.find(
                  (f) => f.key === filter,
                );
                return (
                  <FilterChip
                    key={filter}
                    label={filterOption?.label}
                    onDelete={() => handleFilterToggle(filter)}
                    className="active"
                  />
                );
              })}
            </Box>
          )}

          {/* Folder Creation Form */}
          {showCreationForm && (
            <Box mb={4}>
              <FolderCreationSection
                onAddFolder={handleAddFolder}
                clients={clients}
                selectedClientId={selectedClientId}
                onSelectClient={setSelectedClientId}
                isLoading={isCreating}
              />
            </Box>
          )}

          {/* Folders Grid/List */}
          {processedFolders.length > 0 ? (
            <FolderGridView
              folders={processedFolders.map((folder) => ({
                name: folder.folderName,
                files:
                  folder.documents?.map(
                    (doc: { documentName: any }) => doc.documentName,
                  ) || [],
                id: folder.folderId,
                createdDate: folder.createdDate,
                lastModified: folder.lastModified,
                clientName:
                  folder.clientId &&
                  Array.isArray(clients) &&
                  clients.length > 0
                    ? clients.find((c) => c.id === folder.clientId)?.fullName
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
                  : 'עדיין אין תיקיות במערכת'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchQuery || activeFilters.length > 0
                  ? 'נסה לשנות את מילות החיפוש או המסננים'
                  : 'התחל על ידי יצירת תיקייה חדשה'}
              </Typography>
              {!searchQuery && activeFilters.length === 0 && (
                <ActionButton
                  onClick={() => setShowCreationForm(true)}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: 'white',
                    width: 'auto',
                    px: 3,
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Plus size={20} />
                </ActionButton>
              )}
            </Box>
          )}

          {/* Floating Action Button */}
          <StyledFab
            onClick={() => setShowCreationForm(!showCreationForm)}
            sx={{
              transform: showCreationForm ? 'rotate(45deg)' : 'rotate(0deg)',
            }}
          >
            <Plus size={24} />
          </StyledFab>

          {/* Filter Menu */}
          <Menu
            anchorEl={filterMenuAnchor}
            open={Boolean(filterMenuAnchor)}
            onClose={() => setFilterMenuAnchor(null)}
            PaperProps={{
              sx: { borderRadius: 2, minWidth: 200 },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ px: 2, py: 1, fontWeight: 600 }}
            >
              מסננים
            </Typography>
            <Divider />
            {filterOptions.map((option) => (
              <MenuItem
                key={option.key}
                onClick={() => {
                  handleFilterToggle(option.key);
                  setFilterMenuAnchor(null);
                }}
                selected={activeFilters.includes(option.key)}
              >
                {option.label}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem onClick={() => handleSortChange('name')}>
              מיון לפי שם
            </MenuItem>
            <MenuItem onClick={() => handleSortChange('date')}>
              מיון לפי תאריך
            </MenuItem>
            <MenuItem onClick={() => handleSortChange('documents')}>
              מיון לפי מספר מסמכים
            </MenuItem>
          </Menu>

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
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
              }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </div>
      </Fade>
    </PageContainer>
  );
};

export default FoldersPage;
