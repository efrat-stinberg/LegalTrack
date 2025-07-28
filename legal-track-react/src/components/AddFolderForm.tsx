import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Autocomplete,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FolderPlus, Tag, User } from 'lucide-react';
import { Client } from '../models/Client';

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

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  background: theme.palette.background.paper, // רקע לא שקוף
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const AddFolderForm: React.FC<AddFolderFormProps> = ({
  onAddFolder,
  clients,
  selectedClientId,
  onSelectClient,
}) => {
  const theme = useTheme();
  
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
        console.log('AddFolderForm: Selected client updated:', client);
        setSelectedClient(client);
      }
    }
  }, [selectedClientId, clients]);

  // פונקציות מאמורטות למניעת re-creation בכל render
  const validateForm = useCallback((): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.folderName.trim()) {
      errors.folderName = 'שם התיקייה הוא שדה חובה';
    }
    
    if (selectedClientId === null) {
      errors.client = 'בחירת לקוח הוא שדה חובה';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData.folderName, selectedClientId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission started', {
      folderName: formData.folderName,
      selectedClientId,
      formData
    });

    if (!validateForm()) {
      console.log('Form validation failed', formErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // נשלח רק את הנתונים שה-Backend מצפה לקבל
      const backendData: BackendFolderData = {
        folderName: formData.folderName.trim(),
        clientId: selectedClientId,
      };
      
      console.log('Sending data to backend:', backendData);
      
      await onAddFolder(backendData);
      
      console.log('Folder created successfully');
      
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
      if (error.message.includes('Client ID')) {
        setFormErrors({ client: 'בעיה בבחירת הלקוח. אנא בחר לקוח מחדש.' });
      } else if (error.message.includes('folderName')) {
        setFormErrors({ folderName: 'בעיה בשם התיקייה. אנא בדוק את השם.' });
      } else {
        setFormErrors({ general: error.message || 'שגיאה ביצירת התיקייה' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, selectedClientId, onAddFolder, onSelectClient, validateForm, formErrors]);

  const handleClientSelect = useCallback((client: Client | null) => {
    const clientId = client?.id || null;
    console.log('Client selected:', { client, clientId });
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
    <FormContainer elevation={2}>
      <Box component="form" onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          
          {/* הצגת שגיאה כללית */}
          {formErrors.general && (
            <Box sx={{ 
              p: 2, 
              borderRadius: 2, 
              backgroundColor: alpha(theme.palette.error.main, 0.1),
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`
            }}>
              <Typography color="error" variant="body2">
                {formErrors.general}
              </Typography>
            </Box>
          )}
          
          {/* פרטים בסיסיים */}
          <Box>
            <SectionTitle variant="h6">
              <FolderPlus size={20} />
              פרטים בסיסיים
            </SectionTitle>
            
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
              gap: 3 
            }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="שם תיקייה"
                  value={formData.folderName}
                  onChange={(e) => handleFolderNameChange(e.target.value)}
                  required
                  variant="outlined"
                  error={!!formErrors.folderName}
                  helperText={formErrors.folderName}
                  disabled={isSubmitting}
                />

                <Autocomplete
                  options={clients || []}
                  getOptionLabel={(client) => `${client.fullName} (${client.email})`}
                  value={selectedClient}
                  onChange={(_, client) => handleClientSelect(client)}
                  disabled={isSubmitting}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="בחר לקוח"
                      required
                      error={!!formErrors.client}
                      helperText={formErrors.client}
                    />
                  )}
                  renderOption={(props, client) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {client.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {client.email} • {client.phone}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                />
              </Box>

              <TextField
                fullWidth
                label="תיאור (אופציונלי)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                multiline
                rows={4}
                variant="outlined"
                disabled={isSubmitting}
              />
            </Box>
          </Box>

          {/* כפתור שליחה */}
          <Box display="flex" justifyContent="flex-end" gap={2} mt={3}>
            <Button 
              type="submit" 
              variant="contained"
              size="large"
              disabled={isSubmitting || !formData.folderName.trim() || selectedClientId === null}
              sx={{ 
                borderRadius: 3,
                px: 4,
                py: 1.5,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                }
              }}
            >
              {isSubmitting ? 'יוצר תיקייה...' : 'יצירת תיקייה'}
            </Button>
          </Box>

          {/* הודעת debug במצב פיתוח */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
            }}>
              <Typography variant="caption" component="div">
                <strong>Debug Info:</strong>
              </Typography>
              <Typography variant="caption" component="div">
                Folder Name: {formData.folderName || 'Empty'}
              </Typography>
              <Typography variant="caption" component="div">
                Selected Client ID: {selectedClientId || 'None'}
              </Typography>
              <Typography variant="caption" component="div">
                Selected Client: {selectedClient?.fullName || 'None'}
              </Typography>
              <Typography variant="caption" component="div">
                Clients Array: {Array.isArray(clients) ? `${clients.length} clients` : 'Not an array'}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </FormContainer>
  );
};

export default AddFolderForm;