import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Avatar,
  Chip,
  Card,
  CardContent,
  CardActions,
  Button,
  useTheme,
  alpha,
  Zoom,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Delete,
  Download,
  FileText,
  Calendar,
  ExternalLink,
  Share2,
  Edit3,
  Copy
} from "lucide-react";
import { deleteDocument, getDownloadUrl } from "../api/api";
import MyDocument from "../models/Document";
import { MoreVert, Visibility } from "@mui/icons-material";

interface DocumentListProps {
  documents: MyDocument[];
  onDelete?: (deletedId: number) => void;
}

const DocumentCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,

    '& .document-actions': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: '#e0e0e0', // Light gray top bar
  }
}));

const DocumentIcon = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: 12,
  background: '#e0e0e0', // Light gray icon background
  color: 'white',
  boxShadow: `0 8px 24px ${alpha('#000000', 0.1)}`,
  marginBottom: theme.spacing(2),
}));

const ActionButtons = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  opacity: 0,
  transform: 'translateY(-10px)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 2,
}));

const DocumentGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(2),
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',

  [theme.breakpoints.down('md')]: {
    gridTemplateColumns: '1fr',
  },
}));

const MetaChip = styled(Chip)(({ theme }) => ({
  height: 24,
  fontSize: '0.75rem',
  background: alpha(theme.palette.info.main, 0.1),
  color: theme.palette.info.main,
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
}));

const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<MyDocument | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, doc: MyDocument) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedDoc(doc);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDoc(null);
  };

  const handlePreview = async () => {
    if (!selectedDoc) return;

    try {
      const fileName = selectedDoc.filePath.split('/').pop() || selectedDoc.documentName;
      const url = await getDownloadUrl(fileName);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error('Error getting download URL:', error);
      alert('שגיאה בפתיחת המסמך');
    }
    handleMenuClose();
  };

  const handleDownload = async () => {
    if (!selectedDoc) return;

    try {
      const fileName = selectedDoc.filePath.split('/').pop() || selectedDoc.documentName;
      const url = await getDownloadUrl(fileName);

      const link = document.createElement('a');
      link.href = url;
      link.download = selectedDoc.documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('שגיאה בהורדת הקובץ');
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedDoc) return;
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את "${selectedDoc.documentName}"?`)) {
      handleMenuClose();
      return;
    }

    try {
      await deleteDocument(selectedDoc.filePath);
      onDelete?.(selectedDoc.documentId);
      alert('הקובץ נמחק בהצלחה');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('שגיאה במחיקת הקובץ');
    }
    handleMenuClose();
  };

  const handleCopyLink = async () => {
    if (!selectedDoc) return;

    try {
      const fileName = selectedDoc.filePath.split('/').pop() || selectedDoc.documentName;
      const url = await getDownloadUrl(fileName);

      await navigator.clipboard.writeText(url);
      alert('הקישור הועתק ללוח');
    } catch (error) {
      console.error('Error copying link:', error);
      alert('שגיאה בהעתקת הקישור');
    }
    handleMenuClose();
  };

  if (documents.length === 0) {
    return (
      <Box textAlign="center" py={4}>
        <FileText size={48} color={theme.palette.text.secondary} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          אין מסמכים להצגה
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxHeight: '75vh', overflowY: 'auto', pr: 1 }}>
      <DocumentGrid>
        {documents.map((doc, index) => (
          <Zoom in={true} timeout={300 + index * 100} key={doc.documentId}>
            <DocumentCard className="document-card">
              <ActionButtons className="document-actions">
                <Tooltip title="אפשרויות">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, doc)}
                    sx={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.9),
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      '&:hover': {
                        backgroundColor: theme.palette.background.paper,
                        transform: 'scale(1.1)',
                      }
                    }}
                  >
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Tooltip>
              </ActionButtons>

              <CardContent sx={{ p: 3, flex: 1, textAlign: 'center' }}>
                <DocumentIcon>
                  <FileText size={24} />
                </DocumentIcon>

                <Typography
                  variant="h6"
                  fontWeight={600}
                  gutterBottom
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '3em',
                    textAlign: 'center'
                  }}
                  title={doc.documentName}
                >
                  {doc.documentName}
                </Typography>

                <Box display="flex" justifyContent="center" gap={1} mb={2}>
                  <MetaChip label="קובץ" size="small" />
                  <MetaChip label={formatFileSize(1024 * 1024)} size="small" />
                </Box>

                <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
                  <Calendar size={14} color={theme.palette.text.secondary} />
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(doc.uploadDate)}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0, justifyContent: 'center' }}>
                <Button
                  size="small"
                  startIcon={<ExternalLink size={16} />}
                  onClick={() => {
                    setSelectedDoc(doc);
                    handlePreview();
                  }}
                  variant="contained"
                  sx={{
                    backgroundColor: '#9e9e9e',
                    color: 'white',
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: '#757575',
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  פתח
                </Button>

                <Button
                  size="small"
                  startIcon={<Download size={16} />}
                  onClick={() => {
                    setSelectedDoc(doc);
                    handleDownload();
                  }}
                  variant="outlined"
                  sx={{
                    borderColor: '#bdbdbd',
                    color: '#424242',
                    borderRadius: 2,
                    '&:hover': {
                      borderColor: '#9e9e9e',
                      background: alpha('#9e9e9e', 0.1),
                    }
                  }}
                >
                  הורד
                </Button>
              </CardActions>
            </DocumentCard>
          </Zoom>
        ))}
      </DocumentGrid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 200,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          }
        }}
      >
        <MenuItem onClick={handlePreview}>
          <ExternalLink size={16} style={{ marginRight: 8 }} />
          פתח בטאב חדש
        </MenuItem>
        <MenuItem onClick={() => selectedDoc && handlePreview()}>
          <Visibility fontSize="small" style={{ marginRight: 8 }} />
          תצוגה מקדימה
        </MenuItem>
        <MenuItem onClick={handleDownload}>
          <Download size={16} style={{ marginRight: 8 }} />
          הורד קובץ
        </MenuItem>
        <MenuItem onClick={handleCopyLink}>
          <Copy size={16} style={{ marginRight: 8 }} />
          העתק קישור
        </MenuItem>
        <MenuItem>
          <Share2 size={16} style={{ marginRight: 8 }} />
          שתף
        </MenuItem>
        <MenuItem>
          <Edit3 size={16} style={{ marginRight: 8 }} />
          שנה שם
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete size={16} style={{ marginRight: 8 }} />
          מחק
        </MenuItem>
      </Menu>

      <Dialog
        open={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="between">
            <Typography variant="h6" fontWeight={600}>
              תצוגה מקדימה - {selectedDoc?.documentName}
            </Typography>
            <IconButton onClick={() => setPreviewUrl(null)}>×</IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {previewUrl ? (
            <iframe
              src={previewUrl}
              title="Document Preview"
              style={{
                width: "100%",
                height: "600px",
                border: "none",
                borderRadius: '8px'
              }}
            />
          ) : (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              height={400}
            >
              <Typography color="text.secondary">
                לא ניתן להציג תצוגה מקדימה לקובץ זה
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DocumentList;
