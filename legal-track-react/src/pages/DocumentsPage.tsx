// src/pages/DocumentsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDocuments } from '../api/documentApi';
import { getAllFolders } from '../api/folderApi';
import { getDownloadUrl } from '../api/s3Api';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Card,
  CardContent,
  Chip,
  useTheme,
  alpha,
  Fade,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ResponsiveGrid } from '../utils/GridHelpers';
import {
  Search,
  FileText,
  Download,
  Eye,
  Upload,
  Calendar,
  FolderOpen
} from 'lucide-react';

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
}));

const DocumentCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
  }
}));

const DocumentsPage: React.FC = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  interface Document {
    id: number;
    name: string;
    type: string;
    filePath: string;
    uploadDate: string;
    folder: string;
    folderId: number;
  }

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // All documents of the office, with the name of the case each belongs to
    Promise.all([getAllDocuments(), getAllFolders()])
      .then(([docs, folders]) => {
        const folderNames = new Map(folders.map((f) => [f.folderId, f.folderName]));
        setDocuments(
          docs.map((d) => ({
            id: d.documentId,
            name: d.documentName,
            type: (d.documentName.split('.').pop() || '').toUpperCase(),
            filePath: d.filePath,
            uploadDate: d.uploadDate,
            folder: folderNames.get(d.folderId) ?? '',
            folderId: d.folderId,
          }))
        );
      })
      .catch(() => setError('שגיאה בטעינת המסמכים'))
      .finally(() => setLoading(false));
  }, []);

  const openDocument = async (doc: Document) => {
    try {
      const url = await getDownloadUrl(doc.filePath);
      window.open(url, '_blank', 'noopener');
    } catch {
      setError('לא ניתן לפתוח את המסמך');
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.folder.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageContainer maxWidth="xl">
      <Fade in={true} timeout={600}>
        <div>
          <HeaderSection elevation={0}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              ניהול מסמכים 📄
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              כל המסמכים שלך במקום אחד מאובטח ונגיש
            </Typography>
            
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                placeholder="חפש מסמכים..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  flex: 1,
                  '& .MuiOutlinedInput-root': {
                    background: alpha('#ffffff', 0.2),
                    color: 'white',
                    '& fieldset': { borderColor: alpha('#ffffff', 0.3) },
                    '&:hover fieldset': { borderColor: alpha('#ffffff', 0.5) },
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search size={20} color="white" />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                startIcon={<Upload size={20} />}
                onClick={() => navigate("/folders")}
                sx={{
                  background: alpha('#ffffff', 0.2),
                  '&:hover': { background: alpha('#ffffff', 0.3) }
                }}
              >
                העלה מסמך
              </Button>
            </Box>
          </HeaderSection>

          {error && (
            <Typography color="error" mb={2}>{error}</Typography>
          )}

          {loading ? (
            <Box display="flex" justifyContent="center" py={8}>
              <Typography>טוען מסמכים...</Typography>
            </Box>
          ) : (
            <ResponsiveGrid>
              {filteredDocuments.map((doc) => (
                <DocumentCard key={doc.id}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar
                        sx={{
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }}
                      >
                        <FileText size={20} />
                      </Avatar>
                      <Box flex={1}>
                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                          {doc.name}
                        </Typography>
                        <Box display="flex" gap={1} mt={1}>
                          <Chip label={doc.type} size="small" color="primary" />
                        </Box>
                      </Box>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <FolderOpen size={14} color={theme.palette.text.secondary} />
                      <Typography variant="caption" color="primary" sx={{ cursor: "pointer" }} onClick={() => navigate(`/folders/${doc.folderId}`)}>
                        {doc.folder}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Calendar size={14} color={theme.palette.text.secondary} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(doc.uploadDate).toLocaleDateString('he-IL')}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" gap={1}>
                      <Button size="small" startIcon={<Eye size={16} />} variant="outlined" onClick={() => openDocument(doc)}>
                        צפה
                      </Button>
                      <Button size="small" startIcon={<Download size={16} />} variant="contained" onClick={() => openDocument(doc)}>
                        הורד
                      </Button>
                    </Box>
                  </CardContent>
                </DocumentCard>
              ))}
            </ResponsiveGrid>
          )}

          {!loading && filteredDocuments.length === 0 && (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center" 
              py={8}
              textAlign="center"
            >
              <FileText size={64} color={theme.palette.text.secondary} />
              <Typography variant="h6" color="text.secondary" mt={2}>
                לא נמצאו מסמכים
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {searchQuery ? 'נסה לשנות את מונחי החיפוש' : 'התחל על ידי העלאת המסמך הראשון שלך'}
              </Typography>
              <Button variant="contained" startIcon={<Upload size={20} />} onClick={() => navigate("/folders")}>
                העלה מסמך ראשון
              </Button>
            </Box>
          )}
        </div>
      </Fade>
    </PageContainer>
  );
};

export default DocumentsPage;