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
  }, [selectedClientId, clients]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.folderName.trim()) {
      alert('אנא הזן שם תיקייה');
      return;
    }
    
    if (selectedClientId === null) {
      alert('אנא בחר לקוח');
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
      
      // איפוס הטופס
      setFormData({
        folderName: '',
        description: '',
        priority: 'medium',
        color: '#667eea',
        tags: [],
      });
      setSelectedClient(null);
      onSelectClient(null);
    } catch (error) {
      console.error('Error adding folder:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClientSelect = (client: Client | null) => {
    const clientId = client?.id || null;
    onSelectClient(clientId);
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
                  onChange={(e) => setFormData(prev => ({ ...prev, folderName: e.target.value }))}
                  required
                  variant="outlined"
                />

                <Autocomplete
                  options={clients}
                  getOptionLabel={(client) => `${client.fullName} (${client.email})`}
                  value={selectedClient}
                  onChange={(_, client) => handleClientSelect(client)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="בחר לקוח"
                      required
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
        </Box>
      </Box>
    </FormContainer>
  );
};

export default AddFolderForm;