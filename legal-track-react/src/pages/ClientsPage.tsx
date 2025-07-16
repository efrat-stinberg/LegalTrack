import React, { useState, useEffect, useMemo } from 'react';
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
  Avatar,
  Chip,
  useTheme,
  alpha,
  Fade,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Fab,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  User,
  Users,
  TrendingUp,
  Filter,
  Download,
  Upload,
  Calendar,
  FolderOpen,
  Eye,
  Star,
  X
} from 'lucide-react';

// Import existing utilities and components
import { StatsGrid } from '../utils/GridHelpers';
import { getClients, createClient, updateClient, deleteClient } from '../api/clientApi';
import { Client } from '../models/Client';

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
  position: 'relative',
  overflow: 'hidden',

  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
  },
}));

const SearchSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  flexWrap: 'wrap',

  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
}));

const StyledSearchField = styled(TextField)(({ theme }) => ({
  flex: 1,
  minWidth: 300,

  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    background: theme.palette.background.paper,
    transition: 'all 0.3s ease',

    '&:hover': {
      boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
    },

    '&.Mui-focused': {
      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  background: theme.palette.background.paper,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.3s ease',

  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

const ClientCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',

  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,

    '& .client-actions': {
      opacity: 1,
      transform: 'translateY(0)',
    },
  },

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'linear-gradient(90deg, #667eea, #764ba2)',
  },
}));

const ClientAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  fontSize: '1.5rem',
  fontWeight: 700,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
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

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
  zIndex: 1000,

  '&:hover': {
    transform: 'scale(1.1) translateY(-4px)',
    boxShadow: `0 16px 48px ${alpha(theme.palette.primary.main, 0.6)}`,
  },
}));

const ClientsGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(3),
  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',

  [theme.breakpoints.down('sm')]: {
    gridTemplateColumns: '1fr',
  },
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
  },

  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: 'var(--card-color, linear-gradient(90deg, #667eea, #764ba2))',
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    padding: theme.spacing(2),
    minWidth: 500,
    background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  },
}));

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const ClientsPage: React.FC = () => {
  const theme = useTheme();

  // State Management
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>('create');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  // Form Data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    notes: '',
  });

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await getClients();
      const clientsData = response?.data || [];
      setClients(clientsData);
    } catch (error) {
      console.error('Failed to load clients:', error);
      showNotification('שגיאה בטעינת לקוחות', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ open: true, message, severity });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  // Filter clients based on search
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    
    const query = searchQuery.toLowerCase();
    return clients.filter(client =>
      client.fullName?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query) ||
      client.company?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status !== 'inactive').length;
    const newThisMonth = clients.filter(c => {
      const clientDate = new Date(c.createdDate || Date.now());
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return clientDate > monthAgo;
    }).length;

    return [
      {
        title: 'סה"כ לקוחות',
        value: totalClients,
        icon: <Users size={24} />,
        color: '#667eea',
        change: '+12%'
      },
      {
        title: 'לקוחות פעילים',
        value: activeClients,
        icon: <User size={24} />,
        color: '#10b981',
        change: '+8%'
      },
      {
        title: 'חדשים החודש',
        value: newThisMonth,
        icon: <TrendingUp size={24} />,
        color: '#f59e0b',
        change: '+25%'
      },
      {
        title: 'דירוג ממוצע',
        value: '4.8',
        icon: <Star size={24} />,
        color: '#ef4444',
        change: '+0.2'
      },
    ];
  }, [clients]);

  const handleCreateClient = () => {
    setFormMode('create');
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      notes: '',
    });
    setDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setFormMode('edit');
    setSelectedClient(client);
    setFormData({
      fullName: client.fullName || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      company: client.company || '',
      notes: client.notes || '',
    });
    setDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleViewClient = (client: Client) => {
    setFormMode('view');
    setSelectedClient(client);
    setFormData({
      fullName: client.fullName || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      company: client.company || '',
      notes: client.notes || '',
    });
    setDialogOpen(true);
  };

  const handleDeleteClient = async (client: Client) => {
    if (!client.id) return;
    
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את הלקוח "${client.fullName}"?`)) {
      try {
        await deleteClient(client.id);
        setClients(prev => prev.filter(c => c.id !== client.id));
        showNotification('הלקוח נמחק בהצלחה', 'success');
      } catch (error) {
        showNotification('שגיאה במחיקת הלקוח', 'error');
      }
    }
    setMenuAnchor(null);
  };

  const handleSubmit = async () => {
    try {
      if (formMode === 'create') {
        const newClient = await createClient(formData);
        setClients(prev => [...prev, newClient]);
        showNotification('לקוח נוסף בהצלחה', 'success');
      } else if (formMode === 'edit' && selectedClient?.id) {
        const updatedClient = await updateClient(selectedClient.id, formData);
        setClients(prev => prev.map(c => c.id === selectedClient.id ? updatedClient : c));
        showNotification('פרטי הלקוח עודכנו בהצלחה', 'success');
      }
      setDialogOpen(false);
    } catch (error) {
      showNotification('שגיאה בשמירת הלקוח', 'error');
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, client: Client) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedClient(client);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <PageContainer maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Typography>טוען לקוחות...</Typography>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="xl">
      <Fade in={true} timeout={600}>
        <div>
          {/* Header */}
          <HeaderSection elevation={0}>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="flex-start" 
              flexWrap="wrap" 
              gap={3}
            >
              <Box flex={1} minWidth="300px">
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      background: alpha('#ffffff', 0.2),
                      backdropFilter: 'blur(10px)',
                      border: `2px solid ${alpha('#ffffff', 0.3)}`,
                    }}
                  >
                    <Users size={28} color="white" />
                  </Avatar>
                  <Box>
                    <Typography variant="h3" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                      ניהול לקוחות
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9, mt: 0.5 }}>
                      נהל את קשרי הלקוחות שלך במקום אחד מרכזי
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" gap={2} flexWrap="wrap" mt={3}>
                  <Chip 
                    icon={<User size={16} />}
                    label="ניהול מתקדם" 
                    sx={{ 
                      background: alpha('#ffffff', 0.2), 
                      color: 'white',
                      border: `1px solid ${alpha('#ffffff', 0.3)}`,
                      height: 32
                    }} 
                  />
                  <Chip 
                    icon={<Phone size={16} />}
                    label="יצירת קשר מהירה" 
                    sx={{ 
                      background: alpha('#ffffff', 0.2), 
                      color: 'white',
                      border: `1px solid ${alpha('#ffffff', 0.3)}`,
                      height: 32
                    }} 
                  />
                  <Chip 
                    icon={<Star size={16} />}
                    label="מעקב דירוגים" 
                    sx={{ 
                      background: alpha('#ffffff', 0.2), 
                      color: 'white',
                      border: `1px solid ${alpha('#ffffff', 0.3)}`,
                      height: 32
                    }} 
                  />
                </Box>
              </Box>

              <Box display="flex" flexDirection="column" gap={2} alignItems="flex-end">
                <Box display="flex" gap={2}>
                  <Tooltip title="ייצא לקוחות ל-Excel" arrow>
                    <ActionButton 
                      sx={{ 
                        background: alpha('#ffffff', 0.2), 
                        color: 'white',
                        border: `1px solid ${alpha('#ffffff', 0.3)}`,
                        '&:hover': {
                          background: alpha('#ffffff', 0.3),
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <Download size={20} />
                    </ActionButton>
                  </Tooltip>
                  <Tooltip title="ייבא לקוחות מ-CSV" arrow>
                    <ActionButton 
                      sx={{ 
                        background: alpha('#ffffff', 0.2), 
                        color: 'white',
                        border: `1px solid ${alpha('#ffffff', 0.3)}`,
                        '&:hover': {
                          background: alpha('#ffffff', 0.3),
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <Upload size={20} />
                    </ActionButton>
                  </Tooltip>
                </Box>
                
                <Button
                  variant="contained"
                  startIcon={<Plus size={20} />}
                  onClick={handleCreateClient}
                  sx={{
                    background: alpha('#ffffff', 0.2),
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${alpha('#ffffff', 0.3)}`,
                    color: 'white',
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    '&:hover': {
                      background: alpha('#ffffff', 0.3),
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 24px ${alpha('#000000', 0.2)}`,
                    }
                  }}
                >
                  לקוח חדש
                </Button>
              </Box>
            </Box>
          </HeaderSection>

          {/* Statistics */}
          <StatsGrid sx={{ mb: 4 }}>
            {stats.map((stat, index) => (
              <StatsCard key={index} sx={{ '--card-color': stat.color }}>
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {stat.title}
                      </Typography>
                      <Typography variant="h3" fontWeight={700} color="primary">
                        {stat.value}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        background: `linear-gradient(135deg, ${stat.color}, ${alpha(stat.color, 0.8)})`,
                        color: '#ffffff'
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TrendingUp size={16} color={theme.palette.success.main} />
                    <Typography variant="body2" color="success.main" fontWeight={600}>
                      {stat.change}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      מהחודש שעבר
                    </Typography>
                  </Box>
                </CardContent>
              </StatsCard>
            ))}
          </StatsGrid>

          {/* Search and Actions */}
          <SearchSection>
            <StyledSearchField
              placeholder="חפש לקוחות לפי שם, אימייל או טלפון..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />

            <Box display="flex" gap={1} alignItems="center">
              <Tooltip title="מסנן מתקדם">
                <ActionButton>
                  <Filter size={20} />
                </ActionButton>
              </Tooltip>
            </Box>
          </SearchSection>

          {/* Clients Grid */}
          {filteredClients.length > 0 ? (
            <ClientsGrid>
              {filteredClients.map((client, index) => (
                <ClientCard key={client.id || index} onClick={() => handleViewClient(client)}>
                  <ActionButtons className="client-actions">
                    <Tooltip title="פעולות">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, client)}
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
                    <ClientAvatar>
                      {getInitials(client.fullName || 'לקוח')}
                    </ClientAvatar>

                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {client.fullName}
                    </Typography>

                    {client.company && (
                      <Chip
                        label={client.company}
                        size="small"
                        sx={{ mb: 2, backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
                      />
                    )}

                    <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                      <Mail size={14} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {client.email}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
                      <Phone size={14} color={theme.palette.text.secondary} />
                      <Typography variant="body2" color="text.secondary">
                        {client.phone}
                      </Typography>
                    </Box>

                    <Box display="flex" gap={1} justifyContent="center" mt={2}>
                      <Tooltip title="צפייה בפרטים">
                        <IconButton size="small" color="primary">
                          <Eye size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="צפייה בתיקים">
                        <IconButton size="small" color="primary">
                          <FolderOpen size={16} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </ClientCard>
              ))}
            </ClientsGrid>
          ) : (
            <Box
              textAlign="center"
              py={8}
              sx={{
                background: alpha(theme.palette.primary.main, 0.05),
                borderRadius: 4,
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
              }}
            >
              <Users size={64} color={alpha(theme.palette.primary.main, 0.5)} />
              <Typography variant="h6" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                {searchQuery ? 'לא נמצאו לקוחות' : 'עדיין אין לקוחות במערכת'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchQuery
                  ? 'נסה לשנות את מונחי החיפוש'
                  : 'התחל על ידי הוספת הלקוח הראשון שלך'}
              </Typography>
              {!searchQuery && (
                <Button
                  variant="contained"
                  startIcon={<Plus size={20} />}
                  onClick={handleCreateClient}
                >
                  הוסף לקוח ראשון
                </Button>
              )}
            </Box>
          )}

          {/* Floating Action Button */}
          <StyledFab onClick={handleCreateClient}>
            <Plus size={24} />
          </StyledFab>

          {/* Context Menu */}
          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            PaperProps={{
              sx: { borderRadius: 2, minWidth: 180 }
            }}
          >
            <MenuItem onClick={() => selectedClient && handleViewClient(selectedClient)}>
              <Eye size={16} style={{ marginRight: 8 }} />
              צפה בפרטים
            </MenuItem>
            <MenuItem onClick={() => selectedClient && handleEditClient(selectedClient)}>
              <Edit size={16} style={{ marginRight: 8 }} />
              ערוך
            </MenuItem>
            <Divider />
            <MenuItem 
              onClick={() => selectedClient && handleDeleteClient(selectedClient)}
              sx={{ color: 'error.main' }}
            >
              <Trash2 size={16} style={{ marginRight: 8 }} />
              מחק
            </MenuItem>
          </Menu>

          {/* Client Dialog */}
          <StyledDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }}>
                    {formMode === 'create' ? <Plus size={20} /> : <User size={20} />}
                  </Avatar>
                  <Typography variant="h6" fontWeight={700}>
                    {formMode === 'create' ? 'הוספת לקוח חדש' : 
                     formMode === 'edit' ? 'עריכת לקוח' : 'פרטי לקוח'}
                  </Typography>
                </Box>
                <IconButton onClick={() => setDialogOpen(false)}>
                  <X size={20} />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent>
              <Box display="flex" flexDirection="column" gap={3} pt={2}>
                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={3}>
                  <TextField
                    label="שם מלא"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    fullWidth
                    required
                    disabled={formMode === 'view'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <User size={16} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="חברה"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    fullWidth
                    disabled={formMode === 'view'}
                  />
                </Box>

                <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={3}>
                  <TextField
                    label="אימייל"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    fullWidth
                    required
                    disabled={formMode === 'view'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Mail size={16} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    label="טלפון"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    fullWidth
                    required
                    disabled={formMode === 'view'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone size={16} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <TextField
                  label="כתובת"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  fullWidth
                  disabled={formMode === 'view'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MapPin size={16} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="הערות"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={formMode === 'view'}
                />

                {formMode === 'view' && selectedClient?.createdDate && (
                  <Box p={2} bgcolor={alpha(theme.palette.info.main, 0.1)} borderRadius={2}>
                    <Typography variant="body2" color="text.secondary">
                      <Calendar size={16} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                      נוצר: {new Date(selectedClient.createdDate).toLocaleDateString('he-IL')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>

            {formMode !== 'view' && (
              <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button onClick={() => setDialogOpen(false)} variant="outlined">
                  ביטול
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  disabled={!formData.fullName || !formData.email || !formData.phone}
                >
                  {formMode === 'create' ? 'הוסף לקוח' : 'שמור שינויים'}
                </Button>
              </DialogActions>
            )}
          </StyledDialog>

          {/* Notification */}
          <Snackbar
            open={notification.open}
            autoHideDuration={4000}
            onClose={hideNotification}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={hideNotification}
              severity={notification.severity}
              sx={{
                borderRadius: 2,
                boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.12)}`
              }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        </div>
      </Fade>
    </PageContainer>
  );
};

export default ClientsPage;