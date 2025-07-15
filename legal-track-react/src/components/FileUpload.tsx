import React, { useState, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  LinearProgress,
  Alert,
  IconButton,
  Chip,
  Fade,
  Zoom,
  useTheme,
  alpha,
  Tooltip
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import {
  Upload,
  X,
  File,
  FileText,
  Image,
  Video,
  Archive,
  CheckCircle,
  AlertCircle,
  Trash2,
  Download,
  Eye
} from "lucide-react";
import { uploadFileToServer } from "../api/api";

interface FileUploadProps {
  folderId: number;
  onClose?: () => void;
  onUploadSuccess?: () => void;
}

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
  100% { transform: scale(1); opacity: 1; }
`;

const uploadAnimation = keyframes`
  0% { transform: translateY(100%); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
`;

const UploadContainer = styled(Paper)(({ theme }) => ({
  borderRadius: 20,
  padding: theme.spacing(4),
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  animation: `${uploadAnimation} 0.5s ease-out`,
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(3),
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  background: alpha(theme.palette.error.main, 0.1),
  color: theme.palette.error.main,
  borderRadius: 12,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    background: alpha(theme.palette.error.main, 0.2),
    transform: 'scale(1.1)',
  }
}));

const DropZone = styled(Box)<{ isDragActive: boolean; hasFile: boolean }>(({ theme, isDragActive, hasFile }) => ({
  border: `2px dashed ${
    hasFile 
      ? theme.palette.success.main
      : isDragActive 
        ? theme.palette.primary.main 
        : alpha(theme.palette.primary.main, 0.3)
  }`,
  borderRadius: 16,
  padding: theme.spacing(6),
  textAlign: 'center',
  background: hasFile
    ? alpha(theme.palette.success.main, 0.05)
    : isDragActive
      ? alpha(theme.palette.primary.main, 0.1)
      : alpha(theme.palette.primary.main, 0.02),
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  
  '&:hover': {
    borderColor: theme.palette.primary.main,
    background: alpha(theme.palette.primary.main, 0.08),
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
  },
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    left: -50,
    width: 100,
    height: 100,
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
    borderRadius: '50%',
    opacity: isDragActive ? 1 : 0,
    transition: 'opacity 0.3s ease',
  }
}));

const UploadIcon = styled(Box)<{ isDragActive: boolean; hasFile: boolean }>(({ theme, isDragActive, hasFile }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: hasFile
    ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
    : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  boxShadow: `0 8px 24px ${alpha(hasFile ? theme.palette.success.main : theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  animation: isDragActive ? `${pulse} 1s infinite` : hasFile ? `${bounce} 0.6s ease-out` : 'none',
  
  '& svg': {
    color: 'white',
  }
}));

const FileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  background: alpha(theme.palette.background.paper, 0.8),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
  }
}));

const FileIconContainer = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  
  '& svg': {
    color: 'white',
  }
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  background: alpha(theme.palette.info.main, 0.05),
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
  }
}));

const UploadButton = styled(ActionButton)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
  
  '&:hover': {
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
  },
  
  '&:disabled': {
    background: alpha(theme.palette.action.disabled, 0.12),
    color: theme.palette.action.disabled,
    transform: 'none',
    boxShadow: 'none',
  }
}));

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <Image size={20} />;
  if (fileType.startsWith('video/')) return <Video size={20} />;
  if (fileType.includes('pdf')) return <FileText size={20} />;
  if (fileType.includes('zip') || fileType.includes('rar')) return <Archive size={20} />;
  return <File size={20} />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileUpload: React.FC<FileUploadProps> = ({ folderId, onClose, onUploadSuccess }) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setError("");
      setSuccess(false);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError("");
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 200);

      await uploadFileToServer(file, folderId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setSuccess(true);
      
      setTimeout(() => {
        onUploadSuccess?.();
        onClose?.();
      }, 1500);
      
    } catch (err: any) {
      console.error("Upload failed:", err);
      setError("שגיאה בהעלאת הקובץ. אנא נסה שוב.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setError("");
    setSuccess(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Fade in={true} timeout={300}>
      <UploadContainer elevation={0}>
        <HeaderSection>
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Upload size={24} color="white" />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary">
                העלאת קובץ חדש
              </Typography>
              <Typography variant="body2" color="text.secondary">
                בחר קובץ או גרור אותו לכאן
              </Typography>
            </Box>
          </Box>
          
          <Tooltip title="סגור">
            <CloseButton onClick={onClose} disabled={uploading}>
              <X size={20} />
            </CloseButton>
          </Tooltip>
        </HeaderSection>

        {error && (
          <Zoom in={true}>
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 3,
                '& .MuiAlert-icon': {
                  alignItems: 'center',
                }
              }}
              icon={<AlertCircle size={20} />}
            >
              {error}
            </Alert>
          </Zoom>
        )}

        {success && (
          <Zoom in={true}>
            <Alert
              severity="success"
              sx={{
                mb: 3,
                borderRadius: 3,
                '& .MuiAlert-icon': {
                  alignItems: 'center',
                }
              }}
              icon={<CheckCircle size={20} />}
            >
              הקובץ הועלה בהצלחה!
            </Alert>
          </Zoom>
        )}
        
        <DropZone
          isDragActive={dragActive}
          hasFile={!!file}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
            disabled={uploading}
          />
          
          <UploadIcon isDragActive={dragActive} hasFile={!!file}>
            {file ? <CheckCircle size={32} /> : <Upload size={32} />}
          </UploadIcon>
          
          {file ? (
            <Box>
              <Typography variant="h6" fontWeight={600} color="success.main" gutterBottom>
                קובץ נבחר בהצלחה!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                לחץ "העלה קובץ" כדי להתחיל
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {dragActive ? 'שחרר כדי להעלות' : 'גרור קובץ לכאן'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                או לחץ לבחירת קובץ מהמחשב
              </Typography>
              <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap" mt={2}>
                <Chip label="PDF" size="small" variant="outlined" />
                <Chip label="DOC" size="small" variant="outlined" />
                <Chip label="תמונות" size="small" variant="outlined" />
                <Chip label="טקסט" size="small" variant="outlined" />
              </Box>
            </Box>
          )}
        </DropZone>

        {file && (
          <Fade in={true} timeout={500}>
            <FileCard elevation={0}>
              <FileIconContainer>
                {getFileIcon(file.type)}
              </FileIconContainer>
              
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {file.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                </Typography>
              </Box>
              
              <Box display="flex" gap={1}>
                <Tooltip title="תצוגה מקדימה">
                  <IconButton size="small">
                    <Eye size={16} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="הסר קובץ">
                  <IconButton 
                    size="small" 
                    onClick={removeFile}
                    disabled={uploading}
                    sx={{ 
                      color: 'error.main',
                      '&:hover': {
                        background: alpha(theme.palette.error.main, 0.1),
                      }
                    }}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </Tooltip>
              </Box>
            </FileCard>
          </Fade>
        )}

        {uploading && (
          <Fade in={true}>
            <ProgressContainer>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Upload size={20} color={theme.palette.info.main} />
                <Typography variant="body2" fontWeight={600} color="info.main">
                  מעלה קובץ... {Math.round(uploadProgress)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{
                  borderRadius: 2,
                  height: 8,
                  background: alpha(theme.palette.info.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                אנא אל תסגור את החלון במהלך ההעלאה
              </Typography>
            </ProgressContainer>
          </Fade>
        )}

        <Box display="flex" gap={2} mt={4}>
          <UploadButton
            onClick={handleUpload}
            disabled={uploading || !file || success}
            startIcon={uploading ? null : success ? <CheckCircle size={18} /> : <Upload size={18} />}
            fullWidth
          >
            {uploading ? 'מעלה...' : success ? 'הועלה בהצלחה!' : 'העלה קובץ'}
          </UploadButton>
          
          <ActionButton
            onClick={onClose}
            disabled={uploading}
            variant="outlined"
            sx={{
              borderColor: alpha(theme.palette.text.secondary, 0.3),
              color: 'text.secondary',
              
              '&:hover': {
                borderColor: alpha(theme.palette.text.secondary, 0.5),
                background: alpha(theme.palette.text.secondary, 0.05),
              }
            }}
          >
            ביטול
          </ActionButton>
        </Box>

        {/* File Type Guide */}
        <Box 
          mt={3} 
          p={2} 
          bgcolor={alpha(theme.palette.info.main, 0.05)} 
          borderRadius={2}
          border={`1px solid ${alpha(theme.palette.info.main, 0.2)}`}
        >
          <Typography variant="body2" color="info.main" fontWeight={600} gutterBottom>
            💡 סוגי קבצים נתמכים
          </Typography>
          <Typography variant="body2" color="text.secondary">
            מסמכים: PDF, DOC, DOCX, TXT • תמונות: JPG, PNG, GIF • גודל מקסימלי: 10MB
          </Typography>
        </Box>
      </UploadContainer>
    </Fade>
  );
};

export default FileUpload;