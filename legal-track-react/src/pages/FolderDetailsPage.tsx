import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getFolderByIdWithDocuments } from "../api/api";
import DocumentList from "../components/DocumentList";
import FileUpload from "../components/FileUpload";
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import MyFolder from "../models/Folder";
import Chat from "../components/Chat";

const FolderDetailsPage: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const [folder, setFolder] = useState<MyFolder | null>(null);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (folderId) {
      getFolderByIdWithDocuments(+folderId)
        .then(setFolder)
        .catch(console.error);
    }
  }, [folderId]);

  const handleFileUploadClose = () => setIsFileUploadOpen(false);

  const handleUploadSuccess = async () => {
    if (!folderId) return;
    const updatedFolder = await getFolderByIdWithDocuments(+folderId);
    setFolder(updatedFolder);
  };

  if (!folder) return <div>Loading...</div>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Button onClick={() => navigate("/folders")} sx={{ mb: 2 }}>
        Back to folders
      </Button>

      <Typography variant="h4" sx={{ mb: 2 }}>
        {folder.folderName}
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => setIsFileUploadOpen(true)}
        >
          Upload File
        </Button>
      </Box>

      {isFileUploadOpen && (
        <FileUpload
          folderId={folder.folderId}
          onClose={handleFileUploadClose}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      <Box display="flex" flexDirection={{ xs: "column", md: "row" }} gap={3}>
        {/* Documents Section */}
        <Paper elevation={3} sx={{ flex: 1, p: 3 }}>
          
          <Typography variant="h6" sx={{ mb: 1 }}>
            Documents
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <DocumentList documents={folder.documents || []} />
        </Paper>

        {/* Chat Section */}
        <Paper elevation={3} sx={{ width: { xs: "100%", md: 360 }, p: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Chat
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Chat folderId={folder.folderId} />
        </Paper>
      </Box>
    </Container>
  );
};

export default FolderDetailsPage;
