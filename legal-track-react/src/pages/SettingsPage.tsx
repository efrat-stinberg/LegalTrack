// src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Switch,
  Button,
  TextField,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Avatar,
  useTheme,
  alpha,
  Fade,
  Tab,
  Tabs,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FormGrid } from '../utils/GridHelpers';
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Key,
  Download,
  Upload,
  Trash2,
  Save
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

const SettingsCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
  }
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const SettingsPage: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: true,
      marketing: false
    },
    privacy: {
      twoFactor: true,
      loginAlerts: true,
      dataSharing: false
    },
    appearance: {
      darkMode: false,
      language: 'hebrew',
      timezone: 'Israel'
    }
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSettingChange = (category: keyof typeof settings, setting: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const settingsTabs = [
    { label: 'פרופיל', icon: <User size={16} /> },
    { label: 'התראות', icon: <Bell size={16} /> },
    { label: 'אבטחה', icon: <Shield size={16} /> },
    { label: 'מראה', icon: <Palette size={16} /> },
    { label: 'נתונים', icon: <Database size={16} /> }
  ];

  return (
    <PageContainer maxWidth="xl">
      <Fade in={true} timeout={600}>
        <div>
          <HeaderSection elevation={0}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              הגדרות מערכת ⚙️
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              התאם את המערכת לצרכים שלך
            </Typography>
          </HeaderSection>

          <Box sx={{ 
            display: 'grid', 
            gap: 3, 
            gridTemplateColumns: { xs: '1fr', md: '300px 1fr' } 
          }}>
            <SettingsCard>
              <Tabs
                orientation="vertical"
                value={tabValue}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTabs-indicator': {
                    left: 0,
                    right: 'auto',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                  }
                }}
              >
                {settingsTabs.map((tab, index) => (
                  <Tab
                    key={index}
                    label={tab.label}
                    icon={tab.icon}
                    iconPosition="start"
                    sx={{
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                      minHeight: 48,
                      py: 2
                    }}
                  />
                ))}
              </Tabs>
            </SettingsCard>

            <SettingsCard>
              {/* פרופיל */}
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  פרטי פרופיל
                </Typography>
                
                <Box display="flex" alignItems="center" gap={3} mb={4}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      fontSize: '2rem',
                      fontWeight: 700
                    }}
                  >
                    מ
                  </Avatar>
                  <Box>
                    <Button variant="outlined" size="small" startIcon={<Upload size={16} />}>
                      שנה תמונה
                    </Button>
                    <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                      JPG, PNG עד 2MB
                    </Typography>
                  </Box>
                </Box>

                <FormGrid>
                  <TextField
                    label="שם מלא"
                    defaultValue="משה לוי"
                    fullWidth
                    variant="outlined"
                  />
                  <TextField
                    label="אימייל"
                    defaultValue="moshe@example.com"
                    fullWidth
                    variant="outlined"
                  />
                  <TextField
                    label="טלפון"
                    defaultValue="050-1234567"
                    fullWidth
                    variant="outlined"
                  />
                  <TextField
                    label="תפקיד"
                    defaultValue="עורך דין"
                    fullWidth
                    variant="outlined"
                  />
                </FormGrid>

                <TextField
                  label="כתובת"
                  defaultValue="רחוב הרצל 123, תל אביב"
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 3, mb: 4 }}
                />

                <Box>
                  <Button
                    variant="contained"
                    startIcon={<Save size={16} />}
                    sx={{ mr: 2 }}
                  >
                    שמור שינויים
                  </Button>
                  <Button variant="outlined">
                    ביטול
                  </Button>
                </Box>
              </TabPanel>

              {/* התראות */}
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  הגדרות התראות
                </Typography>

                <List>
                  <ListItem>
                    <ListItemText
                      primary="התראות אימייל"
                      secondary="קבל עדכונים חשובים באימייל"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.email}
                        onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  
                  <ListItem>
                    <ListItemText
                      primary="התראות Push"
                      secondary="התראות מיידיות בדפדפן"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.push}
                        onChange={(e) => handleSettingChange('notifications', 'push', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  
                  <ListItem>
                    <ListItemText
                      primary="הודעות SMS"
                      secondary="עדכונים דחופים בסמס"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.sms}
                        onChange={(e) => handleSettingChange('notifications', 'sms', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  
                  <ListItem>
                    <ListItemText
                      primary="התראות שיווקיות"
                      secondary="מידע על תכונות חדשות ועדכונים"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.notifications.marketing}
                        onChange={(e) => handleSettingChange('notifications', 'marketing', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>
              </TabPanel>

              {/* אבטחה */}
              <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  הגדרות אבטחה
                </Typography>

                <List>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <span>אימות דו-שלבי</span>
                          <Chip label="מומלץ" size="small" color="success" />
                        </Box>
                      }
                      secondary="הגנה נוספת עם SMS או אפליקציה"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.privacy.twoFactor}
                        onChange={(e) => handleSettingChange('privacy', 'twoFactor', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  
                  <ListItem>
                    <ListItemText
                      primary="התראות כניסה"
                      secondary="הודעה על כניסות חדשות לחשבון"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.privacy.loginAlerts}
                        onChange={(e) => handleSettingChange('privacy', 'loginAlerts', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Box mt={4} p={3} bgcolor={alpha(theme.palette.warning.main, 0.1)} borderRadius={2}>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    שנה סיסמה
                  </Typography>
                  <FormGrid>
                    <TextField
                      label="סיסמה נוכחית"
                      type="password"
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="סיסמה חדשה"
                      type="password"
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="אימות סיסמה"
                      type="password"
                      fullWidth
                      size="small"
                    />
                  </FormGrid>
                  <Button
                    variant="contained"
                    startIcon={<Key size={16} />}
                    sx={{ mt: 2 }}
                    size="small"
                  >
                    עדכן סיסמה
                  </Button>
                </Box>
              </TabPanel>

              {/* מראה */}
              <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  מראה ותצוגה
                </Typography>

                <List>
                  <ListItem>
                    <ListItemText
                      primary="מצב כהה"
                      secondary="מראה כהה לעיניים"
                    />
                    <ListItemSecondaryAction>
                      <Switch
                        checked={settings.appearance.darkMode}
                        onChange={(e) => handleSettingChange('appearance', 'darkMode', e.target.checked)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                  
                  <ListItem>
                    <ListItemText
                      primary="שפת ממשק"
                      secondary="עברית, אנגלית, ערבית"
                    />
                    <ListItemSecondaryAction>
                      <Button variant="outlined" size="small" startIcon={<Globe size={16} />}>
                        עברית
                      </Button>
                    </ListItemSecondaryAction>
                  </ListItem>
                </List>

                <Box mt={4} p={3} bgcolor={alpha(theme.palette.info.main, 0.1)} borderRadius={2}>
                  <Typography variant="h6" fontWeight={600} mb={2}>
                    התאמה אישית
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    בחר את הצבעים והעיצוב המועדפים עליך
                  </Typography>
                  <Box display="flex" gap={2}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        cursor: 'pointer',
                        border: '3px solid #667eea'
                      }}
                    />
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #f093fb, #f5576c)',
                        cursor: 'pointer',
                        border: '2px solid #e0e0e0'
                      }}
                    />
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
                        cursor: 'pointer',
                        border: '2px solid #e0e0e0'
                      }}
                    />
                  </Box>
                </Box>
              </TabPanel>

              {/* נתונים */}
              <TabPanel value={tabValue} index={4}>
                <Typography variant="h6" fontWeight={600} mb={3}>
                  ניהול נתונים
                </Typography>

                <Box sx={{ 
                  display: 'grid', 
                  gap: 3, 
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } 
                }}>
                  <Box p={3} bgcolor={alpha(theme.palette.success.main, 0.1)} borderRadius={2}>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      גיבוי נתונים
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      צור גיבוי של כל הנתונים שלך
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Download size={16} />}
                      size="small"
                    >
                      הורד גיבוי
                    </Button>
                  </Box>
                  
                  <Box p={3} bgcolor={alpha(theme.palette.warning.main, 0.1)} borderRadius={2}>
                    <Typography variant="h6" fontWeight={600} mb={2}>
                      ייבוא נתונים
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      ייבא נתונים מקובץ גיבוי
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Upload size={16} />}
                      size="small"
                    >
                      ייבא נתונים
                    </Button>
                  </Box>
                </Box>

                <Box mt={4} p={3} bgcolor={alpha(theme.palette.error.main, 0.1)} borderRadius={2}>
                  <Typography variant="h6" fontWeight={600} mb={2} color="error">
                    אזור מסוכן
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    פעולות אלה אינן הפיכות ועלולות לגרום לאובדן נתונים
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Trash2 size={16} />}
                    size="small"
                  >
                    מחק את כל הנתונים
                  </Button>
                </Box>
              </TabPanel>
            </SettingsCard>
          </Box>
        </div>
      </Fade>
    </PageContainer>
  );
};

export default SettingsPage;