import React from "react";
import {
  Dialog,
  DialogActions,
  Button,
  Input,
  Box,
  Typography,
  Paper,
} from "@mui/material";

interface UploadDialogProps {
  open: boolean;
  selectedFolder: string;
  documents: string[];
  onClose: () => void;
  onFileUpload: (file: File | null) => void;
  handleUpload: () => void; // הוספת הפרופס
}

const UploadDialog: React.FC<UploadDialogProps> = ({
  open,
  selectedFolder,
  documents,
  onClose,
  onFileUpload,
  handleUpload, // קבלת הפונקציה
}) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0]);
    } else {
      onFileUpload(null);
    }
  };
  

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Paper style={{ padding: "20px" }}>
        <Typography variant="h6" gutterBottom align="center">
          העלאת קבצים לתיקיה: {selectedFolder}
        </Typography>
        <Box display="flex" flexDirection="column" alignItems="center">
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              sx={{
                backgroundColor: "#f5f5f5",
                color: "#3f51b5",
                height: "48px",
                borderRadius: "4px",
                marginBottom: "20px",
                "&:hover": {
                  backgroundColor: "#e0e0e0",
                },
              }}
            >
              בחירת קבצים
            </Button>
          </label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />
        </Box>
        <Typography variant="body1" align="center" gutterBottom>
          מסמכים בתיקיה:
        </Typography>
        {documents.length === 0 ? (
          <Typography align="center">אין קבצים בתיקיה זו</Typography>
        ) : (
          <ul>
            {documents.map((doc, index) => (
              <li key={index}>{doc}</li>
            ))}
          </ul>
        )}
        <DialogActions>
          <Button onClick={handleUpload} color="primary" disabled={!File}>
            העלה
          </Button>
          <Button onClick={onClose} color="primary">
            סגור
          </Button>
        </DialogActions>
      </Paper>
    </Dialog>
  );
};

export default UploadDialog;
