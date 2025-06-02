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
import AddFolderForm from "../components/AddFolder";
import { useNavigate } from "react-router-dom";
import { FolderOpen } from "lucide-react";

import {
  createFolder,
  deleteFolder,
  getAllFolders,
  updateFolder,
} from "../api/api";

import MyFolder from "../models/Folder";
import Header from "../components/Header";
import Footer from "../components/Footer";

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

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const response = await getAllFolders();
      setFolders(response);
    } catch (error) {
      console.error("Failed to fetch folders:", error);
    }
  };

  const handleAddFolder = async (folderName: string) => {
    try {
      const newFolder = await createFolder(folderName);
      setFolders((prev) => [...prev, newFolder]);
    } catch (error) {
      console.error("Error creating folder:", error);
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
    }
  };

  const handleDeleteFolder = async (folderId: number) => {
    try {
      await deleteFolder(folderId);
      setFolders((prev) => prev.filter((f) => f.folderId !== folderId));
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  };

  const handleFolderClick = (folder: { id: number }) => {
    navigate(`/folders/${folder.id}`);
  };

  return (
    <StyledContainer maxWidth="xl">
      <Fade in={true} timeout={600}>
        <ContentWrapper elevation={0}>
          <HeaderSection>
            <IconWrapper>
              <FolderOpen />
            </IconWrapper>
            <StyledTitle variant="h3" as="h1">
              Case Management
            </StyledTitle>
            <SubTitle variant="body1">
              Organize and manage your legal cases efficiently
            </SubTitle>
          </HeaderSection>

          <SectionWrapper>
            <AddFolderForm onAddFolder={handleAddFolder} />
          </SectionWrapper>

          <SectionWrapper>
            <FolderList
              folders={folders.map((folder) => ({
                name: folder.folderName,
                files: folder.documents?.map((doc) => doc.documentName) || [],
                id: folder.folderId,
              }))}
              onFolderClick={handleFolderClick}
              onEditFolder={handleEditFolder}
              onDeleteFolder={handleDeleteFolder} />
          </SectionWrapper>
        </ContentWrapper>
      </Fade>
    </StyledContainer>
  );
};

export default FolderManagementPage;