// FolderDetailsPage.tsx - גרסה משופרת
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
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { 
  ArrowLeft, 
  Upload, 
  FolderOpen, 
  FileText, 
  Calendar,
  User,
  Home
} from "lucide-react";
import { MyFolder } from "../models/Folder";
import Chat from "../components/Chat";

const PageContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4, 3),
  minHeight: '100vh',
  background: `linear-gradient(145deg, #f8fafc 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
}));

const HeaderSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 20,
  marginBottom: theme.spacing(4),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
  },
}));

const ContentSection = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(3),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  gap: theme.spacing(2),
}));

const FolderDetailsPage: React.FC = () => {
  const theme = useTheme();
  const { id: folderIdParam } = useParams<{ id: string }>();
  const [folder, setFolder] = useState<MyFolder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const navigate = useNavigate();

  // המרת הפרמטר לID
  const folderId = folderIdParam ? parseInt(folderIdParam, 10) : null;

  useEffect(() => {
    const loadFolder = async () => {
      if (!folderId || isNaN(folderId)) {
        console.error('FolderDetailsPage: Invalid folder ID:', folderIdParam);
        setError('מזהה תיקייה לא תקין');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('FolderDetailsPage: Loading folder with ID:', folderId);
        
        const folderData = await getFolderByIdWithDocuments(folderId);
        console.log('FolderDetailsPage: Folder data received:', folderData);
        
        setFolder(folderData);
      } catch (error: any) {
        console.error('FolderDetailsPage: Error loading folder:', error);
        setError(error.message || 'שגיאה בטעינת התיקייה');
      } finally {
        setLoading(false);
      }
    };

    loadFolder();
  }, [folderId, folderIdParam]);

  const handleFileUploadClose = () => {
    setIsFileUploadOpen(false);
  };

  const handleUploadSuccess = async () => {
    if (!folderId) return;
    
    try {
      console.log('FolderDetailsPage: Refreshing folder after upload');
      const updatedFolder = await getFolderByIdWithDocuments(folderId);
      setFolder(updatedFolder);
      setIsFileUploadOpen(false);
    } catch (error) {
      console.error('FolderDetailsPage: Error refreshing folder:', error);
    }
  };

  const handleBackToFolders = () => {
    navigate("/folders");
  };

  // Loading state
  if (loading) {
    return (
      <PageContainer maxWidth="xl">
        <LoadingContainer>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            טוען תיקייה...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            מזהה תיקייה: {folderIdParam}
          </Typography>
        </LoadingContainer>
      </PageContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <PageContainer maxWidth="xl">
        <Box display="flex" flexDirection="column" alignItems="center" gap={3} mt={8}>
          <Alert severity="error" sx={{ maxWidth: 500 }}>
            <Typography variant="h6" gutterBottom>
              שגיאה בטעינת התיקייה
            </Typography>
            <Typography variant="body2">
              {error}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              מזהה תיקייה: {folderIdParam}
            </Typography>
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowLeft size={20} />}
            onClick={handleBackToFolders}
          >
            חזור לתיקיות
          </Button>
        </Box>
      </PageContainer>
    );
  }

  // No folder found
  if (!folder) {
    return (
      <PageContainer maxWidth="xl">
        <Box display="flex" flexDirection="column" alignItems="center" gap={3} mt={8}>
          <Typography variant="h5" color="text.secondary">
            תיקייה לא נמצאה
          </Typography>
          <Typography variant="body2" color="text.secondary">
            מזהה תיקייה: {folderIdParam}
          </Typography>
          <Button
            variant="contained"
            startIcon={<ArrowLeft size={20} />}
            onClick={handleBackToFolders}
          >
            חזור לתיקיות
          </Button>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="xl">
      <Fade in={true} timeout={600}>
        <div>
          {/* Header */}
          <HeaderSection elevation={0}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
              <Box>
                <Breadcrumbs sx={{ color: 'white', mb: 2 }}>
                  <Link
                    color="inherit"
                    onClick={handleBackToFolders}
                    sx={{ 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 0.5,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    <Home size={16} />
                    תיקיות
                  </Link>
                  <Typography color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <FolderOpen size={16} />
                    {folder.folderName}
                  </Typography>
                </Breadcrumbs>

                <Typography variant="h3" fontWeight={700} gutterBottom>
                  {folder.folderName}
                </Typography>
                
                <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                  <Chip
                    icon={<FileText size={16} />}
                    label={`${folder.documents?.length || 0} מסמכים`}
                    sx={{ 
                      background: alpha('#ffffff', 0.2), 
                      color: 'white',
                      border: `1px solid ${alpha('#ffffff', 0.3)}`
                    }}
                  />
                  <Chip
                    icon={<Calendar size={16} />}
                    label={`נוצר: ${new Date(folder.createdDate).toLocaleDateString('he-IL')}`}
                    sx={{ 
                      background: alpha('#ffffff', 0.2), 
                      color: 'white',
                      border: `1px solid ${alpha('#ffffff', 0.3)}`
                    }}
                  />
                  {folder.clientId && (
                    <Chip
                      icon={<User size={16} />}
                      label={`לקוח: ${folder.clientId}`}
                      sx={{ 
                        background: alpha('#ffffff', 0.2), 
                        color: 'white',
                        border: `1px solid ${alpha('#ffffff', 0.3)}`
                      }}
                    />
                  )}
                </Box>
              </Box>

              <Box display="flex" gap={2}>
                <Button
                  variant="contained"
                  startIcon={<ArrowLeft size={20} />}
                  onClick={handleBackToFolders}
                  sx={{
                    background: alpha('#ffffff', 0.2),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha('#ffffff', 0.3)}`,
                    color: 'white',
                    '&:hover': {
                      background: alpha('#ffffff', 0.3),
                    }
                  }}
                >
                  חזור
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Upload size={20} />}
                  onClick={() => setIsFileUploadOpen(true)}
                  sx={{
                    background: alpha('#ffffff', 0.2),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha('#ffffff', 0.3)}`,
                    color: 'white',
                    '&:hover': {
                      background: alpha('#ffffff', 0.3),
                    }
                  }}
                >
                  העלה קבצים
                </Button>
              </Box>
            </Box>
          </HeaderSection>

          {/* File Upload Modal */}
          {isFileUploadOpen && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: alpha(theme.palette.common.black, 0.7),
                backdropFilter: 'blur(10px)',
                zIndex: 1300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
              }}
              onClick={handleFileUploadClose}
            >
              <Box onClick={(e) => e.stopPropagation()}>
                <FileUpload
                  folderId={folder.folderId}
                  onClose={handleFileUploadClose}
                  onUploadSuccess={handleUploadSuccess}
                />
              </Box>
            </Box>
          )}

          {/* Main Content - עכשיו הצאט רחב יותר */}
          <Box 
            display="flex" 
            flexDirection={{ xs: "column", lg: "row" }} 
            gap={4}
          >
            {/* Documents Section - עכשיו קטן יותר */}
            <ContentSection sx={{ flex: { xs: 1, lg: 0.4 } }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    color: 'white'
                  }}
                >
                  <FileText size={20} />
                </Avatar>
                <Typography variant="h5" fontWeight={700}>
                  מסמכים ({folder.documents?.length || 0})
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {folder.documents && folder.documents.length > 0 ? (
                <DocumentList 
                  documents={folder.documents} 
                  onDelete={(deletedId) => {
                    setFolder(prev => prev ? {
                      ...prev,
                      documents: prev.documents?.filter(doc => doc.documentId !== deletedId) || []
                    } : null);
                  }}
                />
              ) : (
                <Box 
                  textAlign="center" 
                  py={6}
                  sx={{
                    background: alpha(theme.palette.primary.main, 0.05),
                    borderRadius: 3,
                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  <FileText size={48} color={alpha(theme.palette.primary.main, 0.5)} />
                  <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                    אין מסמכים בתיקייה זו
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    התחל על ידי העלאת המסמכים הראשונים
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Upload size={20} />}
                    onClick={() => setIsFileUploadOpen(true)}
                  >
                    העלה מסמכים
                  </Button>
                </Box>
              )}
            </ContentSection>

            {/* Chat Section - עכשיו רחב יותר */}
            <ContentSection sx={{ flex: { xs: 1, lg: 0.6 } }}>
              <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Avatar
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                    color: 'white'
                  }}
                >
                  🤖
                </Avatar>
                <Typography variant="h5" fontWeight={700}>
                  צ'אט AI חכם
                </Typography>
                <Chip
                  label="מתקדם"
                  size="small"
                  sx={{
                    background: alpha(theme.palette.success.main, 0.1),
                    color: theme.palette.success.main,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                  }}
                />
              </Box>
              <Divider sx={{ mb: 3 }} />
              <Chat folderId={folder.folderId} />
            </ContentSection>
          </Box>
        </div>
      </Fade>
    </PageContainer>
  );
};

export default FolderDetailsPage;