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
import { styled } from "@mui/material/styles";
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

// Calm, flat styles matching the design system (navy, grays, 6–8px radii, no motion)
const UploadContainer = styled(Paper)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(3),
  background: theme.palette.background.paper,
  border: 'none',
  boxShadow: 'none',
  position: 'relative',
  width: '100%',
  // No height cap or flex here: the surrounding Dialog scrolls. A capped flex column squeezed
  // the file list (inside a Collapse) and its rows spilled over the buttons below.
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: theme.spacing(2.5),
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.text.secondary,
  borderRadius: 6,
}));

const DropZone = styled(Box, { shouldForwardProp: (prop) => prop !== 'isDragActive' && prop !== 'hasFiles' })<{ isDragActive: boolean; hasFiles: boolean }>(({ theme, isDragActive }) => ({
  border: `1px dashed ${isDragActive ? theme.palette.info.main : '#C9CFD8'}`,
  borderRadius: 8,
  padding: theme.spacing(5, 3),
  textAlign: 'center',
  background: isDragActive ? '#F3F6FA' : '#F6F7F9',
  cursor: 'pointer',
  '&:hover': {
    borderColor: theme.palette.info.main,
    background: '#F3F6FA',
  },
}));

const UploadIcon = styled(Box, { shouldForwardProp: (prop) => prop !== 'isDragActive' && prop !== 'hasFiles' })<{ isDragActive: boolean; hasFiles: boolean }>(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 8,
  background: '#FFFFFF',
  border: '1px solid #E3E6EB',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  '& svg': {
    color: theme.palette.primary.main,
  },
}));

const FilesList = styled(Box)(({ theme }) => ({
  maxHeight: 300,
  overflowY: 'auto',
  marginTop: theme.spacing(2),
  border: '1px solid #E3E6EB',
  borderRadius: 8,
  background: '#FFFFFF',
}));

const FileItem = styled(ListItem)(() => ({
  borderBottom: '1px solid #EEF0F3',
  '&:last-child': {
    borderBottom: 'none',
  },
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(2),
  background: '#F6F7F9',
  borderRadius: 8,
  border: '1px solid #E3E6EB',
}));

const ActionButton = styled(Button)(() => ({
  borderRadius: 6,
  fontWeight: 600,
}));

const UploadButton = styled(ActionButton)(({ theme }) => ({
  background: theme.palette.primary.main,
  color: 'white',
  '&:hover': {
    background: theme.palette.primary.dark,
  },
  '&:disabled': {
    background: '#EEF0F3',
    color: '#8A919C',
  },
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
    // Counted here: the failedFiles value from state is stale inside this async loop
    let failures = 0;

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
        failures++;
        
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
    if (failures === 0) {
      setTimeout(() => {
        onUploadSuccess?.();
        onClose?.();
      }, 1500);
    } else {
      setError(`${failures} קבצים לא הועלו. פרטי השגיאה מופיעים ליד כל קובץ.`);
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
              background: theme.palette.primary.main,
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
            : 'אפשר לבחור כמה קבצים יחד. העוזר (AI) קורא קובצי PDF בלבד.'
          }
        </Typography>
        
        <Box display="flex" gap={1} justifyContent="center" flexWrap="wrap" mt={2}>
          <Chip label="קבצים מרובים" size="small" variant="outlined" />
          <Chip label="עד 50MB לקובץ" size="small" variant="outlined" />
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
                    secondaryTypographyProps={{ component: 'div' }}
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
                          <Typography variant="caption" component="div" role="alert" sx={{ color: 'text.primary', fontWeight: 500, mt: 0.25 }}>
                            {fileItem.error}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Box display="flex" gap={0.5}>
                      <Tooltip title="הסר קובץ">
                        <IconButton 
                          size="small" 
                          aria-label={`הסרת ${fileItem.file.name}`}
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
                  background: theme.palette.primary.main,
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
          טיפים להעלאת קבצים
        </Typography>
        <Typography variant="body2" color="text.secondary" component="div">
          • ניתן לבחור מספר קבצים בו-זמנית (Ctrl/Cmd + Click)<br/>
          • גרירה ושחרור של קבצים מרובים נתמכת<br/>
          • גודל מקסימלי לקובץ: 50MB<br/>
          • נשמרים כל סוגי הקבצים; העוזר (AI) קורא רק קובצי PDF עם טקסט
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