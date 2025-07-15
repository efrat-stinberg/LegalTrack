import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
  Typography,
  Autocomplete,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FolderPlus, User, Tag, Palette, AlertTriangle } from 'lucide-react';
import { Client } from '../models/Client';

// טיפוס נתוני הטופס (כולל שדות נוספים לעתיד)
interface FormData {
  folderName: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  color: string;
  tags: string[];
}

// טיפוס הנתונים שנשלחים לBackend (פשוט יותר)
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
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  color: theme.palette.text.primary,
}));

const ColorButton = styled(Box)<{ selected: boolean; color: string }>(({ theme, selected, color }) => ({
  width: 40,
  height: 40,
  borderRadius: '50%',
  background: color,
  cursor: 'pointer',
  border: selected ? `3px solid ${theme.palette.primary.main}` : `2px solid ${alpha(theme.palette.common.black, 0.1)}`,
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: `0 4px 12px ${alpha(color, 0.4)}`,
  }
}));

const AddFolderForm: React.FC<AddFolderFormProps> = ({
  onAddFolder,
  clients,
  selectedClientId,
  onSelectClient,
}) => {
  const theme = useTheme();
  
  // נתוני הטופס (כולל שדות שלא נשלחים לBackend)
  const [formData, setFormData] = useState<FormData>({
    folderName: '',
    description: '',
    priority: 'medium',
    color: '#667eea',
    tags: [],
  });
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const predefinedColors = [
    '#667eea', '#f093fb', '#4facfe', '#43e97b', 
    '#fa709a', '#ff9a9e', '#a8edea', '#fecfef',
    '#667eea', '#764ba2', '#667eea', '#f5576c'
  ];

  const predefinedTags = [
    'דחוף', 'פלילי', 'אזרחי', 'עבודה', 'נדל"ן', 
    'חוזים', 'משפחה', 'נזיקין', 'מיסים', 'חברות'
  ];

  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b', 
    high: '#ef4444',
    urgent: '#dc2626'
  };

  const priorityLabels = {
    low: 'נמוכה',
    medium: 'בינונית',
    high: 'גבוהה', 
    urgent: 'דחופה'
  };

  useEffect(() => {
    const client = clients.find(c => c.id === selectedClientId) || null;
    setSelectedClient(client);
    console.log('Selected client updated:', client);
  }, [selectedClientId, clients]);

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.folderName.trim()) {
      errors.folderName = 'שם התיקייה הוא שדה חובה';
    }
    
    if (selectedClientId === null) {
      errors.client = 'בחירת לקוח הוא שדה חובה';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
        priority: 'medium',
        color: '#667eea',
        tags: [],
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
  };

  const handleClientSelect = (client: Client | null) => {
    const clientId = client?.id || null;
    console.log('Client selected:', { client, clientId });
    onSelectClient(clientId);
    
    // נקה שגיאות קודמות
    if (formErrors.client) {
      setFormErrors(prev => ({ ...prev, client: '' }));
    }
  };

  const handleFolderNameChange = (value: string) => {
    setFormData(prev => ({ ...prev, folderName: value }));
    
    // נקה שגיאות קודמות
    if (formErrors.folderName) {
      setFormErrors(prev => ({ ...prev, folderName: '' }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagSelect = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

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
                  options={clients}
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
                helperText="שדה זה לא נשמר כרגע אבל יהיה זמין בעתיד"
                disabled={isSubmitting}
              />
            </Box>
          </Box>

          <Divider />

          {/* עדיפות וצבע (לעתיד) */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, 
            gap: 3 
          }}>
            <Box>
              <SectionTitle variant="h6">
                <AlertTriangle size={20} />
                עדיפות (לעתיד)
              </SectionTitle>
              
              <FormControl fullWidth>
                <InputLabel>עדיפות</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    priority: e.target.value as 'low' | 'medium' | 'high' | 'urgent'
                  }))}
                  label="עדיפות"
                  disabled
                >
                  {Object.entries(priorityLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box
                          width={12}
                          height={12}
                          borderRadius="50%"
                          bgcolor={priorityColors[value as keyof typeof priorityColors]}
                        />
                        {label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <SectionTitle variant="h6">
                <Palette size={20} />
                צבע תיקייה (לעתיד)
              </SectionTitle>
              
              <Box display="flex" flexWrap="wrap" gap={1}>
                {predefinedColors.map((color) => (
                  <ColorButton
                    key={color}
                    selected={formData.color === color}
                    color={color}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                    sx={{ opacity: 0.5, pointerEvents: 'none' }}
                  />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary">
                תכונה זו תהיה זמינה בעתיד
              </Typography>
            </Box>
          </Box>

          {/* תגיות (לעתיד) */}
          <Box>
            <SectionTitle variant="h6">
              <Tag size={20} />
              תגיות (לעתיד)
            </SectionTitle>
            
            <Box mb={2}>
              <Box display="flex" gap={1} mb={2}>
                <TextField
                  size="small"
                  label="הוסף תגית"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  disabled
                />
                <Button 
                  variant="outlined" 
                  onClick={handleAddTag}
                  disabled
                >
                  הוסף
                </Button>
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                תגיות מוצעות (לא פעילות):
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                {predefinedTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ opacity: 0.5 }}
                  />
                ))}
              </Box>
            </Box>

            {formData.tags.length > 0 && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  תגיות נבחרות:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {formData.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      color="primary"
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            <Typography variant="caption" color="text.secondary">
              תכונה זו תהיה זמינה בעתיד
            </Typography>
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
                Form Valid: {validateForm() ? 'Yes' : 'No'}
              </Typography>
              <Typography variant="caption" component="div">
                Errors: {JSON.stringify(formErrors)}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </FormContainer>
  );
};

export default AddFolderForm;