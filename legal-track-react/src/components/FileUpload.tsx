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
  Tooltip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Collapse
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
  Eye,
  Plus,
  FileX,
  Clock
} from "lucide-react";
import { uploadFileToServer } from "../api/api";

interface FileUploadProps {
  folderId: number;
  onClose?: () => void;
  onUploadSuccess?: () => void;
}

interface FileWithProgress {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
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
  maxWidth: 700,
  width: '100%',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  
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

const DropZone = styled(Box)<{ isDragActive: boolean; hasFiles: boolean }>(({ theme, isDragActive, hasFiles }) => ({
  border: `2px dashed ${
    hasFiles 
      ? theme.palette.success.main
      : isDragActive 
        ? theme.palette.primary.main 
        : alpha(theme.palette.primary.main, 0.3)
  }`,
  borderRadius: 16,
  padding: theme.spacing(6),
  textAlign: 'center',
  background: hasFiles
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

const UploadIcon = styled(Box)<{ isDragActive: boolean; hasFiles: boolean }>(({ theme, isDragActive, hasFiles }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: hasFiles
    ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
    : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  boxShadow: `0 8px 24px ${alpha(hasFiles ? theme.palette.success.main : theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  animation: isDragActive ? `${pulse} 1s infinite` : hasFiles ? `${bounce} 0.6s ease-out` : 'none',
  
  '& svg': {
    color: 'white',
  }
}));

const FilesList = styled(Box)(({ theme }) => ({
  maxHeight: 300,
  overflowY: 'auto',
  marginTop: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: 12,
  background: alpha(theme.palette.background.paper, 0.5),
  
  '&::-webkit-scrollbar': {
    width: 6,
  },
  
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.action.hover, 0.1),
    borderRadius: 3,
  },
  
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: 3,
    
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.5),
    }
  }
}));

const FileItem = styled(ListItem)(({ theme }) => ({
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  transition: 'all 0.2s ease',
  
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.05),
  },
  
  '&:last-child': {
    borderBottom: 'none',
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
  
  const [files, setFiles] = useState<FileWithProgress[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  
  const totalFiles = files.length;
  const completedFiles = files.filter(f => f.status === 'success').length;
  const failedFiles = files.filter(f => f.status === 'error').length;
  const overallProgress = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;

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

    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      addFiles(droppedFiles);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const filesWithProgress: FileWithProgress[] = newFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      progress: 0,
      status: 'pending' as const
    }));
    
    setFiles(prev => [...prev, ...filesWithProgress]);
    setError("");
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAllFiles = () => {
    setFiles([]);
    setError("");
  };

  const handleUploadAll = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setError("");

    for (const fileItem of files) {
      if (fileItem.status === 'success') continue;
      
      try {
        // עדכן סטטוס להעלאה
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'uploading' as const, progress: 0 }
            : f
        ));

        // העלה קובץ
        await uploadFileToServer(
          fileItem.file, 
          folderId,
          (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setFiles(prev => prev.map(f => 
                f.id === fileItem.id 
                  ? { ...f, progress: percentCompleted }
                  : f
              ));
            }
          }
        );

        // עדכן סטטוס להצלחה
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'success' as const, progress: 100 }
            : f
        ));

      } catch (err: any) {
        console.error("Upload failed:", err);
        
        // עדכן סטטוס לשגיאה
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, status: 'error' as const, error: err.message || 'שגיאה בהעלאה' }
            : f
        ));
      }
    }
    
    setIsUploading(false);
    
    // אם כל הקבצים הועלו בהצלחה
    if (failedFiles === 0) {
      setTimeout(() => {
        onUploadSuccess?.();
        onClose?.();
      }, 1500);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return theme.palette.success.main;
      case 'error': return theme.palette.error.main;
      case 'uploading': return theme.palette.info.main;
      default: return theme.palette.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle size={16} />;
      case 'error': return <AlertCircle size={16} />;
      case 'uploading': return <Clock size={16} />;
      default: return getFileIcon('');
    }
  };

  return (
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
              העלאת קבצים מרובים
            </Typography>
            <Typography variant="body2" color="text.secondary">
              בחר או גרור מספר קבצים להעלאה
            </Typography>
          </Box>
        </Box>
        
        <Tooltip title="סגור">
          <CloseButton onClick={onClose} disabled={isUploading}>
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

      {completedFiles === totalFiles && totalFiles > 0 && (
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
            כל הקבצים הועלו בהצלחה! ({completedFiles} קבצים)
          </Alert>
        </Zoom>
      )}
      
      <DropZone
        isDragActive={dragActive}
        hasFiles={files.length > 0}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
          disabled={isUploading}
        />
        
        <UploadIcon isDragActive={dragActive} hasFiles={files.length > 0}>
          {files.length > 0 ? <CheckCircle size={32} /> : <Plus size={32} />}
        </UploadIcon>
        
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {dragActive 
            ? 'שחרר כדי להוסיף קבצים' 
            : files.length > 0 
              ? `נבחרו ${files.length} קבצים` 
              : 'גרור קבצים לכאן או לחץ לבחירה'
          }
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {files.length > 0 
            ? 'לחץ "העלה הכל" כדי להתחיל, או הוסף עוד קבצים'
            : 'תמיכה בקבצים מרובים - PDF, DOC, תמונות ועוד'
          }
        </Typography>
        
        <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap" mt={2}>
          <Chip label="קבצים מרובים" size="small" variant="outlined" />
          <Chip label="עד 10MB" size="small" variant="outlined" />
          <Chip label="גרירה ושחרור" size="small" variant="outlined" />
        </Box>
      </DropZone>

      {/* רשימת קבצים */}
      <Collapse in={files.length > 0}>
        <Box mt={3}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              קבצים להעלאה ({files.length})
            </Typography>
            <Box display="flex" gap={1}>
              <Tooltip title="נקה הכל">
                <IconButton size="small" onClick={clearAllFiles} disabled={isUploading}>
                  <FileX size={16} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <FilesList>
            <List dense>
              {files.map((fileItem) => (
                <FileItem key={fileItem.id}>
                  <ListItemIcon>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        background: alpha(getStatusColor(fileItem.status), 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: getStatusColor(fileItem.status)
                      }}
                    >
                      {getStatusIcon(fileItem.status)}
                    </Box>
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={600}>
                        {fileItem.file.name}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(fileItem.file.size)} • {fileItem.file.type || 'Unknown type'}
                        </Typography>
                        {fileItem.status === 'uploading' && (
                          <LinearProgress 
                            variant="determinate" 
                            value={fileItem.progress} 
                            sx={{ mt: 0.5, borderRadius: 1 }}
                          />
                        )}
                        {fileItem.error && (
                          <Typography variant="caption" color="error.main">
                            {fileItem.error}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="תצוגה מקדימה">
                        <IconButton size="small" disabled={isUploading}>
                          <Eye size={14} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="הסר קובץ">
                        <IconButton 
                          size="small" 
                          onClick={() => removeFile(fileItem.id)}
                          disabled={isUploading}
                          sx={{ 
                            color: 'error.main',
                            '&:hover': {
                              background: alpha(theme.palette.error.main, 0.1),
                            }
                          }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItemSecondaryAction>
                </FileItem>
              ))}
            </List>
          </FilesList>
        </Box>
      </Collapse>

      {/* התקדמות כללית */}
      {isUploading && (
        <Fade in={true}>
          <ProgressContainer>
            <Box display="flex" alignItems="center" gap={2} mb={2}>
              <Upload size={20} color={theme.palette.info.main} />
              <Typography variant="body2" fontWeight={600} color="info.main">
                מעלה קבצים... {completedFiles}/{totalFiles} ({Math.round(overallProgress)}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={overallProgress}
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

      {/* כפתורי פעולה */}
      <Box display="flex" gap={2} mt={4}>
        <UploadButton
          onClick={handleUploadAll}
          disabled={isUploading || files.length === 0 || completedFiles === totalFiles}
          startIcon={isUploading ? null : completedFiles === totalFiles ? <CheckCircle size={18} /> : <Upload size={18} />}
          fullWidth
        >
          {isUploading 
            ? `מעלה... (${completedFiles}/${totalFiles})`
            : completedFiles === totalFiles && totalFiles > 0
              ? 'הועלו בהצלחה!'
              : `העלה ${files.length} קבצים`
          }
        </UploadButton>
        
        <ActionButton
          onClick={onClose}
          disabled={isUploading}
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
          {isUploading ? 'מעלה...' : 'ביטול'}
        </ActionButton>
      </Box>

      {/* מידע כללי */}
      <Box 
        mt={3} 
        p={2} 
        bgcolor={alpha(theme.palette.info.main, 0.05)} 
        borderRadius={2}
        border={`1px solid ${alpha(theme.palette.info.main, 0.2)}`}
      >
        <Typography variant="body2" color="info.main" fontWeight={600} gutterBottom>
          💡 טיפים להעלאת קבצים
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          • ניתן לבחור מספר קבצים בו-זמנית (Ctrl/Cmd + Click)<br/>
          • גרירה ושחרור של קבצים מרובים נתמכת<br/>
          • גודל מקסימלי לקובץ: 10MB<br/>
          • סוגי קבצים נתמכים: PDF, DOC, DOCX, TXT, תמונות, ארכיונים
        </Typography>
      </Box>

      {/* סיכום סטטיסטיקות */}
      {files.length > 0 && (
        <Box 
          mt={2}
          p={2} 
          bgcolor={alpha(theme.palette.background.default, 0.5)} 
          borderRadius={2}
          display="flex"
          gap={3}
          justifyContent="center"
        >
          <Box textAlign="center">
            <Typography variant="h6" fontWeight={700} color="primary">
              {totalFiles}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              סה"כ קבצים
            </Typography>
          </Box>
          
          <Box textAlign="center">
            <Typography variant="h6" fontWeight={700} color="success.main">
              {completedFiles}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              הועלו
            </Typography>
          </Box>
          
          {failedFiles > 0 && (
            <Box textAlign="center">
              <Typography variant="h6" fontWeight={700} color="error.main">
                {failedFiles}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                נכשלו
              </Typography>
            </Box>
          )}
          
          <Box textAlign="center">
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {Math.round(files.reduce((sum, f) => sum + f.file.size, 0) / 1024 / 1024 * 100) / 100}MB
            </Typography>
            <Typography variant="caption" color="text.secondary">
              גודל כולל
            </Typography>
          </Box>
        </Box>
      )}
    </UploadContainer>
  );
};

export default FileUpload;