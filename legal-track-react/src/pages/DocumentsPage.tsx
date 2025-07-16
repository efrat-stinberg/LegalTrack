// src/pages/DocumentsPage.tsx
import React, { useState, useEffect } from 'react';
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
  IconButton,
  Chip,
  useTheme,
  alpha,
  Fade,
  Tooltip,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { ResponsiveGrid } from '../utils/GridHelpers';
import {
  Search,
  FileText,
  Download,
  Eye,
  MoreVertical,
  Upload,
  Filter,
  Calendar,
  User,
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
  interface Document {
    id: number;
    name: string;
    type: string;
    size: string;
    uploadDate: string;
    folder: string;
    uploader: string;
  }
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const mockDocuments = [
    {
      id: 1,
      name: 'חוזה שכירות - דירה ברמת גן.pdf',
      type: 'PDF',
      size: '2.3 MB',
      uploadDate: '2024-01-15',
      folder: 'תיק משפחת כהן',
      uploader: 'עו"ד שרה לוי'
    },
    {
      id: 2,
      name: 'תביעה אזרחית - נזקי רכוש.docx',
      type: 'DOCX',
      size: '1.8 MB',
      uploadDate: '2024-01-14',
      folder: 'תיק חברת ביטוח',
      uploader: 'עו"ד דני כהן'
    },
    {
      id: 3,
      name: 'הסכם עבודה - חברת היי-טק.pdf',
      type: 'PDF',
      size: '1.2 MB',
      uploadDate: '2024-01-13',
      folder: 'תיק דיני עבודה',
      uploader: 'עו"ד רינה גל'
    },
    {
      id: 4,
      name: 'צו עיקול - בנק הפועלים.pdf',
      type: 'PDF',
      size: '856 KB',
      uploadDate: '2024-01-12',
      folder: 'תיק גבייה',
      uploader: 'עו"ד משה לוי'
    },
    {
      id: 5,
      name: 'תשובה לכתב אישום.docx',
      type: 'DOCX',
      size: '3.1 MB',
      uploadDate: '2024-01-11',
      folder: 'תיק פלילי',
      uploader: 'עו"ד אמיר כהן'
    },
    {
      id: 6,
      name: 'הצעת פשרה - תאונת דרכים.pdf',
      type: 'PDF',
      size: '945 KB',
      uploadDate: '2024-01-10',
      folder: 'תיק נזיקין',
      uploader: 'עו"ד לילך רוזן'
    }
  ];

  useEffect(() => {
    // טוען מסמכים מה-API
    setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.folder.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.uploader.toLowerCase().includes(searchQuery.toLowerCase())
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
                sx={{
                  background: alpha('#ffffff', 0.2),
                  '&:hover': { background: alpha('#ffffff', 0.3) }
                }}
              >
                העלה מסמך
              </Button>
              <Button
                variant="outlined"
                startIcon={<Filter size={20} />}
                sx={{
                  borderColor: alpha('#ffffff', 0.3),
                  color: 'white',
                  '&:hover': { 
                    borderColor: alpha('#ffffff', 0.5),
                    background: alpha('#ffffff', 0.1)
                  }
                }}
              >
                סינון
              </Button>
            </Box>
          </HeaderSection>

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
                          <Chip label={doc.size} size="small" variant="outlined" />
                        </Box>
                      </Box>
                      <IconButton size="small">
                        <MoreVertical size={16} />
                      </IconButton>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <FolderOpen size={14} color={theme.palette.text.secondary} />
                      <Typography variant="caption" color="text.secondary">
                        {doc.folder}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <User size={14} color={theme.palette.text.secondary} />
                      <Typography variant="caption" color="text.secondary">
                        {doc.uploader}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <Calendar size={14} color={theme.palette.text.secondary} />
                      <Typography variant="caption" color="text.secondary">
                        {new Date(doc.uploadDate).toLocaleDateString('he-IL')}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" gap={1}>
                      <Button size="small" startIcon={<Eye size={16} />} variant="outlined">
                        צפה
                      </Button>
                      <Button size="small" startIcon={<Download size={16} />} variant="contained">
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
              <Button variant="contained" startIcon={<Upload size={20} />}>
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