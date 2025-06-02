import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { MoreVert, Visibility, Delete } from "@mui/icons-material";
import { deleteDocument, getDownloadUrl } from "../api/api";
import MyDocument from "../models/Document";

interface DocumentListProps {
  documents: MyDocument[];
  onDelete?: (deletedId: number) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<MyDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, doc: MyDocument) => {
    setAnchorEl(event.currentTarget);
    setSelectedDoc(doc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDoc(null);
  };

  const handlePreview = async () => {
    if (!selectedDoc) return;
    // כאן תוכל להוסיף את הלוגיקה לקבלת ה-URL להקדמה
    // לדוגמה:
    const url = await getDownloadUrl(selectedDoc.filePath.split("/").pop() || "");
    setPreviewUrl(url);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    if (!window.confirm("Are you sure you want to delete this file?")) {
      handleMenuClose();
      return;
    }
    try {
      await deleteDocument(selectedDoc.filePath);
      alert("File deleted.");
      onDelete?.(selectedDoc.documentId);
    } catch {
      alert("Failed to delete file.");
    }
    handleMenuClose();
  };

  const handleClosePreview = () => {
    setPreviewUrl(null);
  };

  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom>
        Documents
      </Typography>

      {documents.length === 0 ? (
        <Typography color="textSecondary">No documents available.</Typography>
      ) : (
        <Paper elevation={3}>
          <List>
            {documents.map((doc) => (
              <ListItem
                key={doc.documentId}
                secondaryAction={
                  <>
                    <Tooltip title="Actions">
                      <IconButton
                        edge="end"
                        aria-label="actions"
                        onClick={(e) => handleMenuOpen(e, doc)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Tooltip>
                  </>
                }
              >
                <ListItemText
                  primary={doc.documentName}
                  secondary={`Uploaded: ${new Date(doc.uploadDate).toLocaleDateString()}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handlePreview}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          Preview
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={!!previewUrl}
        onClose={handleClosePreview}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Document Preview</DialogTitle>
        <DialogContent>
          {previewUrl ? (
            <iframe
              src={previewUrl}
              title="Document Preview"
              style={{ width: "100%", height: "600px", border: "none" }}
            />
          ) : (
            <Typography color="textSecondary">No preview available.</Typography>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DocumentList;
