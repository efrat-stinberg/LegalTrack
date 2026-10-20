// Form for a new folder: name + client. Sends only what the server expects.
import React, { useState, useEffect, useCallback } from 'react';
import { Alert, Autocomplete, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { Client } from '../models/Client';
import { tokens } from '../theme';

// טיפוס נתוני הטופס (רק השדות הפעילים)
interface FormData {
  folderName: string;
  description: string;
}

// טיפוס הנתונים שנשלחים לBackend
interface BackendFolderData {
  folderName: string;
  clientId: number | null;
}

interface AddFolderFormProps {
  onAddFolder: (folderData: BackendFolderData) => Promise<void>;
  clients: Client[];
  selectedClientId: number | null;
  onSelectClient: (clientId: number | null) => void;
}

const AddFolderForm: React.FC<AddFolderFormProps> = ({
  onAddFolder,
  clients,
  selectedClientId,
  onSelectClient,
}) => {
  // נתוני הטופס (רק השדות הפעילים)
  const [formData, setFormData] = useState<FormData>({
    folderName: '',
    description: '',
  });
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // מניעת re-render אינסופי
  useEffect(() => {
    if (clients && Array.isArray(clients)) {
      const client = clients.find(c => c.id === selectedClientId) || null;
      
      if (client !== selectedClient) {
        setSelectedClient(client);
      }
    }
  }, [selectedClientId, clients]);

  // פונקציות מאמורטות למניעת re-creation בכל render
  const validateForm = useCallback((): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.folderName.trim()) {
      errors.folderName = 'יש להזין שם לתיק';
    }
    
    if (selectedClientId === null) {
      errors.client = 'יש לבחור לקוח';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.folderName, selectedClientId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // נשלח רק את הנתונים שה-Backend מצפה לקבל
      const backendData: BackendFolderData = {
        folderName: formData.folderName.trim(),
        clientId: selectedClientId,
      };
      
      
      await onAddFolder(backendData);
      
      
      // איפוס הטופס רק אחרי הצלחה
      setFormData({
        folderName: '',
        description: '',
      });
      setSelectedClient(null);
      onSelectClient(null);
      setFormErrors({});
      
    } catch (error: any) {
      console.error('Error in form submission:', error);
      
      // הצגת שגיאה למשתמש
      if (error.message?.includes('Client ID')) {
        setFormErrors({ client: 'בעיה בבחירת הלקוח. בחרו לקוח מחדש.' });
      } else if (error.message?.includes('folderName')) {
        setFormErrors({ folderName: 'בעיה בשם התיק. בדקו את השם.' });
      } else {
        setFormErrors({ general: error.message || 'יצירת התיק נכשלה' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, selectedClientId, onAddFolder, onSelectClient, validateForm, formErrors]);

  const handleClientSelect = useCallback((client: Client | null) => {
    const clientId = client?.id || null;
    onSelectClient(clientId);
    
    // נקה שגיאות קודמות
    if (formErrors.client) {
      setFormErrors(prev => ({ ...prev, client: '' }));
    }
  }, [onSelectClient, formErrors.client]);

  const handleFolderNameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, folderName: value }));
    
    // נקה שגיאות קודמות
    if (formErrors.folderName) {
      setFormErrors(prev => ({ ...prev, folderName: '' }));
    }
  }, [formErrors.folderName]);

  return (
    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {formErrors.general && (
        <Alert severity="error" role="alert">
          {formErrors.general}
        </Alert>
      )}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <TextField
          fullWidth
          label="שם התיק"
          value={formData.folderName}
          onChange={(e) => handleFolderNameChange(e.target.value)}
          required
          error={!!formErrors.folderName}
          helperText={formErrors.folderName || ' '}
          disabled={isSubmitting}
        />

        <Autocomplete
          options={clients || []}
          getOptionLabel={(client) => client.email ? `${client.fullName} (${client.email})` : client.fullName}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          value={selectedClient}
          onChange={(_, client) => handleClientSelect(client)}
          disabled={isSubmitting}
          noOptionsText="אין לקוחות. הוסיפו לקוח במסך הלקוחות."
          renderInput={(params) => (
            <TextField
              {...params}
              label="לקוח"
              required
              error={!!formErrors.client}
              helperText={formErrors.client || ' '}
            />
          )}
          renderOption={(props, client) => (
            <Box component="li" {...props} key={client.id}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{client.fullName}</Typography>
                <Typography sx={{ fontSize: 13, color: tokens.slate }}>
                  {[client.email, client.phone].filter(Boolean).join(' · ')}
                </Typography>
              </Box>
            </Box>
          )}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || !formData.folderName.trim() || selectedClientId === null}
          sx={{ minWidth: 140 }}
        >
          {isSubmitting ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : 'פתיחת התיק'}
        </Button>
      </Box>
    </Box>
  );
};

export default AddFolderForm;
