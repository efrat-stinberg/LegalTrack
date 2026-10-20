// Folder management: create, rename and delete folders, with search and quick filters.
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Box, Skeleton, Snackbar, Typography } from "@mui/material";
import { FolderOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import StatsSection from "../components/StatsSection";
import FolderCreationSection from "../components/FolderCreationSection";
import FolderGridView from "../components/FolderGridView";

import { deleteFolder, getAllFolders, updateFolder, createFolder as apiCreateFolder } from "../api/api";
import { MyFolder } from "../models/Folder";
import { Client } from "../models/Client";
import { getClients } from "../api/clientApi";
import { tokens } from "../theme";

const LoadingSkeleton = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }} aria-busy="true" aria-label="טוען">
    <Skeleton variant="rounded" height={72} />
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2 }}>
      {[...Array(4)].map((_, i) => <Skeleton key={i} variant="rounded" height={96} />)}
    </Box>
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 2 }}>
      {[...Array(6)].map((_, i) => <Skeleton key={i} variant="rounded" height={140} />)}
    </Box>
  </Box>
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
        const payload = JSON.parse(atob(cleanToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
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
      await Promise.all([loadFolders(), loadClients()]);
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
      
      setClients(clientsData);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      // במקרה של שגיאה, הגדר array ריק
      setClients([]);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await getAllFolders();
      const foldersData = response || [];
      setFolders(foldersData);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      setFolders([]);
    }
  };

  const handleAddFolder = async (folderData: CreateFolderRequest) => {
    setIsCreating(true);
    try {
      
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

      
      // קריאה ל-API עם הנתונים הנכונים
      const newFolder = await apiCreateFolder(backendData);
      
      setFolders((prev) => [...prev, newFolder]);
      showNotification(`התיק "${folderData.folderName}" נוצר`, 'success');
    } catch (error: any) {
      console.error("Error creating folder:", error);
      const errorMessage = error.message || 'יצירת התיק נכשלה';
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
      showNotification(`שם התיק שונה ל"${newName}"`, 'success');
    } catch (error) {
      console.error("Error updating folder:", error);
      showNotification('עדכון התיק נכשל', 'error');
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    const folder = folders.find(f => f.folderId === folderId);
    try {
      
      await deleteFolder(folderId);
      setFolders((prev) => prev.filter((f) => f.folderId !== folderId));
      showNotification(`התיק "${folder?.folderName}" נמחק`, 'success');
    } catch (error) {
      console.error("Error deleting folder:", error);
      showNotification('מחיקת התיק נכשלה', 'error');
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

  const pageShell = (children: React.ReactNode) => (
    <Box sx={{ maxWidth: 1360, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 2.5, md: 4 } }}>{children}</Box>
  );

  if (loading) return pageShell(<LoadingSkeleton />);

  const filtering = Boolean(searchQuery) || activeFilters.length > 0;

  return pageShell(
    <>
      <PageHeader onSearch={handleSearch} onFilterChange={handleFilterChange} activeFilters={activeFilters} />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <StatsSection folders={folders} clients={clients} />

      <FolderCreationSection
        onAddFolder={handleAddFolder}
        clients={clients}
        selectedClientId={selectedClientId}
        onSelectClient={setSelectedClientId}
        isLoading={isCreating}
      />

      {filteredFolders.length > 0 ? (
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
            documentsCount: folder.documents?.length || 0,
          }))}
          onFolderClick={handleFolderClick}
          onEditFolder={handleEditFolder}
          onDeleteFolder={handleDeleteFolder}
          searchQuery={searchQuery}
        />
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 7,
            px: 2,
            background: tokens.white,
            border: `1px solid ${tokens.border}`,
            borderRadius: `${tokens.radiusLg}px`,
          }}
        >
          <Box sx={{ color: tokens.muted, mb: 1.5, display: "flex", justifyContent: "center" }} aria-hidden="true">
            <FolderOpen size={32} strokeWidth={1.5} />
          </Box>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
            {filtering ? "לא נמצאו תיקים התואמים לחיפוש" : "עדיין אין תיקים במשרד"}
          </Typography>
          <Typography sx={{ color: tokens.slate, fontSize: 14 }}>
            {filtering ? "נסו מילות חיפוש או מסננים אחרים." : "פתחו תיק חדש ושייכו אותו ללקוח."}
          </Typography>
        </Box>
      )}

      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={hideNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={hideNotification} severity={notification.severity}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FolderManagementPage;
