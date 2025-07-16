import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  IconButton,
  Box,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  useTheme,
  alpha,
  Tooltip,
  Zoom,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  FolderOpen,
  MoreVertical,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  User,
  Eye,
  Share2,
  Archive
} from 'lucide-react';

// Custom Grid Component
const FolderGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  
  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: 'repeat(1, 1fr)',
  },
}));

interface Folder {
  id: number;
  name: string;
  files: string[];
  clientName?: string;
  createdDate?: string;
  lastModified?: string;
  status?: 'active' | 'archived' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  color?: string;
  tags?: string[];
  documentsCount?: number;
}

interface FolderGridViewProps {
  folders: Folder[];
  onFolderClick: (folder: Folder) => void;
  onEditFolder: (oldName: string, newName: string) => void;
  onDeleteFolder: (folderId: number) => void;
  searchQuery?: string;
}

const FolderCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: 20,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
    
    '& .folder-actions': {
      opacity: 1,
      transform: 'translateY(0)',
    },
    
    '& .folder-icon': {
      transform: 'scale(1.1) rotate(5deg)',
    }
  },
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'var(--folder-color, linear-gradient(90deg, #667eea, #764ba2))',
  }
}));

const FolderIcon = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  background: 'var(--folder-color, linear-gradient(135deg, #667eea, #764ba2))',
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  boxShadow: `0 8px 24px ${alpha('#667eea', 0.3)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  
  '& svg': {
    color: 'white',
  }
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

const StatsChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  fontSize: '0.75rem',
  height: 24,
  
  '& .MuiChip-icon': {
    color: 'inherit',
    fontSize: '0.875rem',
  }
}));

const MetaInfo = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  
  '& svg': {
    fontSize: '0.875rem',
  }
}));

const EditDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    padding: theme.spacing(2),
    minWidth: 400,
  }
}));

const FolderGridView: React.FC<FolderGridViewProps> = ({
  folders,
  onFolderClick,
  onEditFolder,
  onDeleteFolder,
  searchQuery = ''
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const folderColors = [
    'linear-gradient(135deg, #667eea, #764ba2)',
    'linear-gradient(135deg, #f093fb, #f5576c)',
    'linear-gradient(135deg, #4facfe, #00f2fe)',
    'linear-gradient(135deg, #43e97b, #38f9d7)',
    'linear-gradient(135deg, #fa709a, #fee140)',
    'linear-gradient(135deg, #a8edea, #fed6e3)',
    'linear-gradient(135deg, #ff9a9e, #fecfef)',
    'linear-gradient(135deg, #fecfef, #fecfef)',
  ];

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, folder: Folder) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedFolder(folder);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedFolder(null);
  };

  const handleEditClick = () => {
    if (selectedFolder) {
      setNewFolderName(selectedFolder.name);
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleEditSubmit = () => {
    if (selectedFolder && newFolderName.trim()) {
      onEditFolder(selectedFolder.name, newFolderName.trim());
      setEditDialogOpen(false);
      setNewFolderName('');
      setSelectedFolder(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedFolder) {
      onDeleteFolder(selectedFolder.id);
      setDeleteDialogOpen(false);
      setSelectedFolder(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} style={{ 
          backgroundColor: alpha(theme.palette.warning.main, 0.3),
          fontWeight: 'bold'
        }}>
          {part}
        </span>
      ) : part
    );
  };

  return (
    <>
      <FolderGrid>
        {folders.map((folder, index) => (
          <Zoom in={true} timeout={300 + index * 100} key={folder.id}>
            <FolderCard
              onClick={() => onFolderClick(folder)}
              sx={{
                '--folder-color': folderColors[index % folderColors.length],
              }}
            >
              <ActionButtons className="folder-actions">
                <Tooltip title="אפשרויות">
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, folder)}
                    sx={{
                      backgroundColor: alpha(theme.palette.background.paper, 0.9),
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        backgroundColor: theme.palette.background.paper,
                      }
                    }}
                  >
                    <MoreVertical size={16} />
                  </IconButton>
                </Tooltip>
              </ActionButtons>

              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <FolderIcon 
                  className="folder-icon"
                  sx={{ '--folder-color': folderColors[index % folderColors.length] }}
                >
                  <FolderOpen size={28} />
                </FolderIcon>

                <Typography 
                  variant="h6" 
                  fontWeight={700} 
                  gutterBottom
                  sx={{ 
                    minHeight: 32,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {highlightText(folder.name, searchQuery)}
                </Typography>

                <Box display="flex" justifyContent="center" gap={1} mb={2}>
                  <StatsChip
                    icon={<FileText />}
                    label={`${folder.files.length} קבצים`}
                    size="small"
                  />
                </Box>

                {folder.clientName && (
                  <MetaInfo>
                    <User size={14} />
                    <Typography variant="caption">
                      {highlightText(folder.clientName, searchQuery)}
                    </Typography>
                  </MetaInfo>
                )}

                {folder.createdDate && (
                  <MetaInfo>
                    <Calendar size={14} />
                    <Typography variant="caption">
                      נוצר: {formatDate(folder.createdDate)}
                    </Typography>
                  </MetaInfo>
                )}
              </CardContent>
            </FolderCard>
          </Zoom>
        ))}
      </FolderGrid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`,
          }
        }}
      >
        <MenuItem onClick={() => selectedFolder && onFolderClick(selectedFolder)}>
          <Eye size={16} style={{ marginRight: 8 }} />
          פתח תיקייה
        </MenuItem>
        <MenuItem onClick={handleEditClick}>
          <Edit2 size={16} style={{ marginRight: 8 }} />
          עריכת שם
        </MenuItem>
        <MenuItem>
          <Share2 size={16} style={{ marginRight: 8 }} />
          שיתוף
        </MenuItem>
        <MenuItem>
          <Archive size={16} style={{ marginRight: 8 }} />
          ארכב
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Trash2 size={16} style={{ marginRight: 8 }} />
          מחיקה
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <EditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ backgroundColor: 'primary.main' }}>
              <Edit2 size={20} />
            </Avatar>
            עריכת שם תיקייה
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="שם תיקייה"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            margin="normal"
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setEditDialogOpen(false)}>
            ביטול
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            variant="contained"
            disabled={!newFolderName.trim()}
          >
            שמור
          </Button>
        </DialogActions>
      </EditDialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ backgroundColor: 'error.main' }}>
              <Trash2 size={20} />
            </Avatar>
            אישור מחיקה
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך למחוק את התיקייה "{selectedFolder?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            פעולה זו לא ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            ביטול
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            variant="contained"
            color="error"
          >
            מחק
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FolderGridView;