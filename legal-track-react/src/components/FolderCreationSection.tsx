// "New folder" panel on the folder-management page: a header row that expands into the form.
import React, { useState } from 'react';
import { Box, Button, Card, Collapse, Typography } from '@mui/material';
import { FolderPlus, Plus, X } from 'lucide-react';
import AddFolderForm from './AddFolderForm';
import { Client } from '../models/Client';
import { tokens } from '../theme';

interface FolderCreationSectionProps {
  onAddFolder: (folderData: {
    folderName: string;
    clientId: number | null;
  }) => Promise<void>;
  clients: Client[];
  selectedClientId: number | null;
  onSelectClient: (clientId: number | null) => void;
  isLoading?: boolean;
}

const FolderCreationSection: React.FC<FolderCreationSectionProps> = ({
  onAddFolder,
  clients,
  selectedClientId,
  onSelectClient,
  isLoading = false
}) => {
  const [showForm, setShowForm] = useState(false);

  const handleFormSubmit = async (folderData: { folderName: string; clientId: number | null }) => {
    // Errors are shown by the page and the form; the form stays open so the user can retry
    await onAddFolder(folderData);
    setShowForm(false);
  };

  return (
    <Card sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2.5, py: 2, flexWrap: 'wrap' }}>
        <Box sx={{ color: tokens.navy700, display: 'flex' }} aria-hidden="true">
          <FolderPlus size={20} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 180 }}>
          <Typography sx={{ fontWeight: 600 }}>תיק חדש</Typography>
          <Typography sx={{ fontSize: 13, color: tokens.slate }}>פתיחת תיק ושיוך ללקוח של המשרד</Typography>
        </Box>
        <Button
          variant={showForm ? 'outlined' : 'contained'}
          startIcon={showForm ? <X size={16} /> : <Plus size={16} />}
          onClick={() => setShowForm((s) => !s)}
          disabled={isLoading}
          aria-expanded={showForm}
          aria-controls="new-folder-form"
        >
          {showForm ? 'סגירה' : 'תיק חדש'}
        </Button>
      </Box>

      <Collapse in={showForm} timeout={200} unmountOnExit>
        <Box id="new-folder-form" sx={{ borderTop: `1px solid ${tokens.borderSoft}`, px: 2.5, py: 2.5 }}>
          <AddFolderForm
            onAddFolder={handleFormSubmit}
            clients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={onSelectClient}
          />
        </Box>
      </Collapse>
    </Card>
  );
};

export default FolderCreationSection;
