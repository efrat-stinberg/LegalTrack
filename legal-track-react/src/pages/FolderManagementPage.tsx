import React, { useState, useEffect } from "react";
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Fade 
} from "@mui/material";
import { styled } from "@mui/material/styles";
import FolderList from "../components/FolderList";
import AddFolderForm from "../components/AddFolderForm";
import { useNavigate } from "react-router-dom";
import { FolderOpen } from "lucide-react";

import {
  createFolder,
  deleteFolder,
  getAllFolders,
  updateFolder,
} from "../api/api";

import MyFolder from "../models/Folder";
import { Client } from "../models/Client";
import { getClients } from "../api/client";

const StyledContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(3),
  minHeight: "100vh",
  backgroundColor: "#fafafa",
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

const ContentWrapper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 8,
  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  backgroundColor: "#ffffff",
  border: "1px solid #e0e0e0",
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(2),
    borderRadius: 4,
  },
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  textAlign: "center",
  marginBottom: theme.spacing(4),
  paddingBottom: theme.spacing(3),
  borderBottom: "1px solid #e0e0e0",
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(3),
    paddingBottom: theme.spacing(2),
  },
}));

const StyledTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: "#1a1a1a",
  marginBottom: theme.spacing(1),
  fontSize: "2.25rem",
  letterSpacing: "-0.02em",
  [theme.breakpoints.down('md')]: {
    fontSize: "2rem",
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: "1.75rem",
  },
}));

const SubTitle = styled(Typography)(({ theme }) => ({
  color: "#666666",
  fontSize: "1rem",
  fontWeight: 400,
  [theme.breakpoints.down('sm')]: {
    fontSize: "0.9rem",
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginBottom: theme.spacing(2),
  "& svg": {
    fontSize: "2.5rem",
    color: "#2c5aa0",
    [theme.breakpoints.down('sm')]: {
      fontSize: "2rem",
    },
  },
}));

const SectionWrapper = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  [theme.breakpoints.down('sm')]: {
    marginBottom: theme.spacing(3),
  },
}));

const FolderManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<MyFolder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadFolders(), loadClients()]);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToAddClient = () => {
    navigate('/clients/new');
  };

  const loadClients = async () => {
    try {
      const response = await getClients();
      console.log('Loaded clients:', response.data); // להדפסת דיבאג
      setClients(response.data || []);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      setClients([]);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await getAllFolders();
      console.log('Loaded folders:', response); // להדפסת דיבאג
      setFolders(response || []);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
      setFolders([]);
    }
  };

  const handleAddFolder = async (folderName: string, clientId: number | null) => {
    try {
      const newFolder = await createFolder({ folderName, clientId });
      setFolders((prev) => [...prev, newFolder]);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert('שגיאה ביצירת תיקייה');
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
    } catch (error) {
      console.error("Error updating folder:", error);
      alert('שגיאה בעדכון תיקייה');
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    try {
      await deleteFolder(folderId);
      setFolders((prev) => prev.filter((f) => f.folderId !== folderId));
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert('שגיאה במחיקת תיקייה');
    }
  };

  const handleFolderClick = (folder: { id: number }) => {
    navigate(`/folders/${folder.id}`);
  };

  const handleClientAdded = (newClient: Client) => {
    setClients(prev => [...prev, newClient]);
    setSelectedClientId(newClient.id || null);
  };

  if (loading) {
    return (
      <StyledContainer maxWidth="xl">
        <ContentWrapper elevation={0}>
          <Typography variant="h6" textAlign="center">
            טוען נתונים...
          </Typography>
        </ContentWrapper>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer maxWidth="xl">
        <ContentWrapper elevation={0}>
          <Typography variant="h6" color="error" textAlign="center">
            שגיאה בטעינת הנתונים: {error}
          </Typography>
        </ContentWrapper>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth="xl">
      <button 
        onClick={handleGoToAddClient}
        style={{
          marginBottom: '16px',
          padding: '8px 16px',
          backgroundColor: '#2c5aa0',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        הוספת לקוח חדש
      </button>

      <Fade in={true} timeout={600}>
        <ContentWrapper elevation={0}>
          <HeaderSection>
            <IconWrapper>
              <FolderOpen />
            </IconWrapper>
            <StyledTitle variant="h3" as="h1">
              ניהול תיקים
            </StyledTitle>
            <SubTitle variant="body1">
              ארגון וניהול יעיל של תיקים משפטיים
            </SubTitle>
          </HeaderSection>

          <SectionWrapper>
            <AddFolderForm 
              onAddFolder={handleAddFolder}
              clients={clients}
              selectedClientId={selectedClientId}
              onSelectClient={setSelectedClientId}
            />
          </SectionWrapper>

          <SectionWrapper>
            {folders.length > 0 ? (
              <FolderList
                folders={folders.map((folder) => ({
                  name: folder.folderName,
                  files: folder.documents?.map((doc) => doc.documentName) || [],
                  id: folder.folderId,
                }))}
                onFolderClick={handleFolderClick}
                onEditFolder={handleEditFolder}
                onDeleteFolder={handleDeleteFolder}
              />
            ) : (
              <Typography variant="body1" textAlign="center" color="textSecondary">
                עדיין אין תיקיות. צור תיקייה חדשה למעלה.
              </Typography>
            )}
          </SectionWrapper>
        </ContentWrapper>
      </Fade>
    </StyledContainer>
  );
};

export default FolderManagementPage;