// Grid of folder cards for the folder-management page: open, rename, delete.
import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Calendar, Edit2, Eye, FileText, Folder as FolderIcon, MoreVertical, Trash2, User } from 'lucide-react';
import { tokens } from '../theme';

interface Folder {
  id: number;
  name: string;
  files: string[];
  clientName?: string;
  createdDate?: string;
  lastModified?: string;
  documentsCount?: number;
}

interface FolderGridViewProps {
  folders: Folder[];
  onFolderClick: (folder: { id: number }) => void;
  onEditFolder: (oldName: string, newName: string) => void;
  onDeleteFolder: (folderId: number) => void;
  searchQuery?: string;
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightText = (text: string, query: string) => {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${escapeRegExp(query.trim())})`, 'gi');
  return text.split(regex).map((part, index) =>
    index % 2 === 1 ? (
      <Box component="mark" key={index} sx={{ background: tokens.borderSoft, color: 'inherit', fontWeight: 700, borderRadius: '2px', px: '1px' }}>
        {part}
      </Box>
    ) : (
      part
    )
  );
};

const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('he-IL');

const FolderGridView: React.FC<FolderGridViewProps> = ({
  folders,
  onFolderClick,
  onEditFolder,
  onDeleteFolder,
  searchQuery = ''
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);

  const handleCardClick = (folder: Folder) => {
    if (!folder.id || isNaN(folder.id)) return;
    onFolderClick({ id: folder.id });
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, folder: Folder) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedFolder(folder);
  };

  // Keeps selectedFolder: the rename/delete dialogs opened from the menu still need it
  const handleMenuClose = () => setAnchorEl(null);

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

  return (
    <>
      <Box
        component="ul"
        aria-label="תיקים"
        sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}
      >
        {folders.map((folder) => (
          <Box component="li" key={folder.id}>
            <Card sx={{ height: '100%', position: 'relative', '&:hover': { borderColor: tokens.borderStrong } }}>
              <CardActionArea
                onClick={() => handleCardClick(folder)}
                aria-label={`פתיחת התיק ${folder.name}`}
                sx={{ height: '100%', p: 2.25, pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start', '&:hover': { background: tokens.hover } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, paddingInlineEnd: 4, mb: 1.5 }}>
                  <Box sx={{ color: tokens.navy700, display: 'flex', mt: '2px' }} aria-hidden="true">
                    <FolderIcon size={18} />
                  </Box>
                  <Typography
                    title={folder.name}
                    sx={{ fontWeight: 600, fontSize: 15, color: tokens.ink, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {highlightText(folder.name, searchQuery)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, color: tokens.slate, fontSize: 13 }}>
                  {folder.clientName && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      <User size={14} aria-hidden="true" />
                      <Typography component="span" sx={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {highlightText(folder.clientName, searchQuery)}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileText size={14} aria-hidden="true" />
                    <span>{folder.files.length === 1 ? 'מסמך אחד' : `${folder.files.length} מסמכים`}</span>
                  </Box>
                  {folder.createdDate && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Calendar size={14} aria-hidden="true" />
                      <span>נפתח {formatDate(folder.createdDate)}</span>
                    </Box>
                  )}
                </Box>
              </CardActionArea>

              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, folder)}
                aria-label={`פעולות לתיק ${folder.name}`}
                aria-haspopup="menu"
                sx={{ position: 'absolute', top: 10, insetInlineEnd: 8, color: tokens.slate }}
              >
                <MoreVertical size={16} />
              </IconButton>
            </Card>
          </Box>
        ))}
      </Box>

      {/* disableRestoreFocus: otherwise the closing menu pulls focus back from the dialog it opened */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose} disableRestoreFocus PaperProps={{ sx: { minWidth: 180 } }}>
        <MenuItem onClick={() => { handleMenuClose(); if (selectedFolder) handleCardClick(selectedFolder); }}>
          <ListItemIcon><Eye size={16} /></ListItemIcon>
          פתיחת התיק
        </MenuItem>
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon><Edit2 size={16} /></ListItemIcon>
          שינוי שם
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon><Trash2 size={16} /></ListItemIcon>
          מחיקה
        </MenuItem>
      </Menu>

      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="folder-rename-title"
        // autoFocus loses to the menu that opened the dialog, so focus the field once it is shown
        TransitionProps={{ onEntered: () => renameInputRef.current?.select() }}
      >
        <DialogTitle id="folder-rename-title">שינוי שם התיק</DialogTitle>
        <DialogContent>
          <Box component="form" id="folder-rename-form" onSubmit={(e) => { e.preventDefault(); handleEditSubmit(); }} sx={{ pt: 1 }}>
            <TextField inputRef={renameInputRef} fullWidth label="שם התיק" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setEditDialogOpen(false)}>
            ביטול
          </Button>
          <Button type="submit" form="folder-rename-form" variant="contained" disabled={!newFolderName.trim()}>
            שמירה
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth aria-labelledby="folder-delete-title">
        <DialogTitle id="folder-delete-title" sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Trash2 size={18} aria-hidden="true" />
          מחיקת תיק
        </DialogTitle>
        <DialogContent>
          <Typography>
            למחוק את התיק "{selectedFolder?.name}"?
          </Typography>
          <Typography sx={{ mt: 1, color: tokens.slate, fontSize: 14 }}>
            המסמכים והשיחות של התיק יימחקו גם הם. אי אפשר לבטל את הפעולה.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setDeleteDialogOpen(false)}>
            ביטול
          </Button>
          <Button onClick={handleDeleteConfirm} variant="contained" startIcon={<Trash2 size={16} />}>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FolderGridView;
