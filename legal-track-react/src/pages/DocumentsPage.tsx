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
  Grid,
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
    }
  ];

  useEffect(() => {
    // טוען מסמכים מה-API
    setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
  }, []);

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
            </Box>
          </HeaderSection>

          <Grid container spacing={3}>
            {mockDocuments.map((doc) => (
              <Grid item xs={12} md={6} lg={4} key={doc.id}>
                <DocumentCard>
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
                    
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <User size={14} color={theme.palette.text.secondary} />
                      <Typography variant="caption" color="text.secondary">
                        {doc.uploader}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" gap={1}>
                      <Button size="small" startIcon={<Eye size={16} />}>
                        צפה
                      </Button>
                      <Button size="small" startIcon={<Download size={16} />}>
                        הורד
                      </Button>
                    </Box>
                  </CardContent>
                </DocumentCard>
              </Grid>
            ))}
          </Grid>
        </div>
      </Fade>
    </PageContainer>
  );
};

export default DocumentsPage;