import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
  Tooltip,
  Badge,
  Chip,
  Divider,
  useMediaQuery,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  FolderOpen,
  Menu as MenuIcon,
  Bell,
  Search,
  Users,
  Settings,
  HelpCircle,
  Home,
  FileText,
  BarChart3,
  Calendar,
  MessageSquare,
  FolderCog,
  Shield,
  Globe,
  Scale
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
  backdropFilter: 'blur(20px)',
  borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
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

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  padding: theme.spacing(0, 4),
  minHeight: 80,
  position: 'relative',
  zIndex: 1,

  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(0, 2),
    minHeight: 70,
  },
}));

const LogoSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  flex: 1,
  minWidth: '300px',

  '&:hover': {
    transform: 'scale(1.02)',
  },

  [theme.breakpoints.down('md')]: {
    minWidth: 'auto',
    flex: 'none',
  },
}));

const LogoIcon = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  background: alpha(theme.palette.common.white, 0.2),
  backdropFilter: 'blur(10px)',
  border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
  transition: 'all 0.3s ease',

  '&:hover': {
    transform: 'scale(1.05)',
  },
}));

const TitleSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),

  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  background: alpha(theme.palette.common.white, 0.1),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
  color: 'white',
  transition: 'all 0.3s ease',

  '&:hover': {
    background: alpha(theme.palette.common.white, 0.2),
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.2)}`,
  },
}));

const NavigationSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  background: alpha(theme.palette.common.white, 0.08),
  backdropFilter: 'blur(15px)',
  borderRadius: 16,
  padding: theme.spacing(0.5),
  border: `1px solid ${alpha(theme.palette.common.white, 0.15)}`,

  [theme.breakpoints.down('lg')]: {
    display: 'none',
  },
}));

const ActionsSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginLeft: 'auto',
}));

const QuickNavButton = styled(IconButton)(({ theme }) => ({
  width: 44,
  height: 44,
  borderRadius: 10,
  background: 'transparent',
  color: alpha(theme.palette.common.white, 0.8),
  transition: 'all 0.3s ease',
  position: 'relative',

  '&:hover': {
    background: alpha(theme.palette.common.white, 0.15),
    color: 'white',
    transform: 'translateY(-1px)',
  },

  '&.active': {
    background: alpha(theme.palette.common.white, 0.2),
    color: 'white',
    
    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: -2,
      left: '50%',
      transform: 'translateX(-50%)',
      width: 20,
      height: 2,
      background: 'white',
      borderRadius: 1,
    },
  },
}));

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: 280,
    background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
    borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  },
}));

const DrawerHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  textAlign: 'center',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
  }
}));

const MenuListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: 12,
  margin: theme.spacing(0.5, 1),
  transition: 'all 0.2s ease',

  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.1),
    transform: 'translateX(4px)',
  },

  '&.active': {
    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.secondary.main, 0.15)})`,
    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,

    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },

    '& .MuiListItemText-primary': {
      color: theme.palette.primary.main,
      fontWeight: 600,
    },
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  background: alpha(theme.palette.success.main, 0.2),
  color: theme.palette.success.main,
  border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
  fontSize: '0.75rem',
  height: 24,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1, 2),
  color: theme.palette.text.secondary,
  fontWeight: 600,
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
}));

const FeatureChips = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  marginTop: theme.spacing(1),
  flexWrap: 'wrap',
  justifyContent: 'center',

  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  section?: string;
}

const Header: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications] = useState(3);

  const menuItems: MenuItem[] = [
    {
      path: '/',
      label: 'עמוד בית',
      icon: <Home size={20} />,
      section: 'main'
    },
    {
      path: '/folders',
      label: 'תיקיות',
      icon: <FolderOpen size={20} />,
      section: 'management'
    },
    {
      path: '/folder-management',
      label: 'ניהול תיקיות מתקדם',
      icon: <FolderCog size={20} />,
      section: 'management'
    },
    {
      path: '/clients',
      label: 'לקוחות',
      icon: <Users size={20} />,
      section: 'management'
    },
    {
      path: '/documents',
      label: 'מסמכים',
      icon: <FileText size={20} />,
      section: 'management'
    },
    {
      path: '/analytics',
      label: 'דוחות וניתוחים',
      icon: <BarChart3 size={20} />,
      section: 'tools'
    },
    {
      path: '/calendar',
      label: 'יומן',
      icon: <Calendar size={20} />,
      section: 'tools'
    },
    {
      path: '/messages',
      label: 'הודעות',
      icon: <MessageSquare size={20} />,
      badge: 5,
      section: 'tools'
    },
  ];

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuItemClick = (path: string) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const isActivePath = (path: string) => {
    // מטפל בעמוד הבית
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    
    return (
      location.pathname === path || 
      location.pathname.startsWith(path + '/') ||
      (path === '/folders' && location.pathname.startsWith('/folders'))
    );
  };

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    const section = item.section || 'other';
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  const sectionTitles = {
    main: 'ראשי',
    management: 'ניהול',
    tools: 'כלים',
    other: 'אחר'
  };

  const drawer = (
    <Box>
      <DrawerHeader>
        <LogoIcon>
          <Scale size={28} color="white" />
        </LogoIcon>
        <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 1 }}>
          Legal Manager Pro
        </Typography>
        <StatusChip label="מחובר" size="small" />
        
        <Box display="flex" gap={1} justifyContent="center" mt={2}>
          <Chip 
            icon={<Shield size={12} />}
            label="מאובטח" 
            size="small"
            sx={{ 
              background: alpha('#ffffff', 0.2), 
              color: 'white', 
              fontSize: '0.7rem',
              height: 20
            }} 
          />
          <Chip 
            icon={<Globe size={12} />}
            label="מקוון" 
            size="small"
            sx={{ 
              background: alpha('#ffffff', 0.2), 
              color: 'white', 
              fontSize: '0.7rem',
              height: 20
            }} 
          />
        </Box>
      </DrawerHeader>

      <Box sx={{ p: 1 }}>
        {Object.entries(groupedMenuItems).map(([section, items]) => (
          <Box key={section}>
            <SectionTitle variant="caption">
              {sectionTitles[section as keyof typeof sectionTitles] || section}
            </SectionTitle>
            
            <List dense>
              {items.map((item) => (
                <MenuListItem
                  key={item.path}
                  onClick={() => handleMenuItemClick(item.path)}
                  className={isActivePath(item.path) ? 'active' : ''}
                  sx={{ cursor: 'pointer' }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="error">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: '0.875rem'
                    }}
                  />
                </MenuListItem>
              ))}
            </List>
            
            {section !== 'tools' && <Divider sx={{ my: 1 }} />}
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        <List dense>
          <MenuListItem 
            sx={{ cursor: 'pointer' }}
            onClick={() => handleMenuItemClick('/settings')}
            className={isActivePath('/settings') ? 'active' : ''}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Settings size={20} />
            </ListItemIcon>
            <ListItemText 
              primary="הגדרות"
              primaryTypographyProps={{
                fontSize: '0.875rem'
              }}
            />
          </MenuListItem>

          <MenuListItem 
            sx={{ cursor: 'pointer' }}
            onClick={() => handleMenuItemClick('/support')}
            className={isActivePath('/support') ? 'active' : ''}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <HelpCircle size={20} />
            </ListItemIcon>
            <ListItemText 
              primary="עזרה ותמיכה"
              primaryTypographyProps={{
                fontSize: '0.875rem'
              }}
            />
          </MenuListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      <StyledAppBar position="static" elevation={0}>
        <StyledToolbar>
          {/* Left Side - Logo and Branding */}
          <LogoSection onClick={handleLogoClick}>
            {isMobile && (
              <ActionButton onClick={handleDrawerToggle} sx={{ mr: 1 }}>
                <MenuIcon size={20} />
              </ActionButton>
            )}
            
            <LogoIcon>
              <Scale size={28} color="white" />
            </LogoIcon>
            
            <TitleSection>
              <Typography
                variant="h5"
                component="h1"
                fontWeight={700}
                color="white"
                sx={{ lineHeight: 1.2 }}
              >
                Legal Manager Pro
              </Typography>
              <Typography
                variant="caption"
                sx={{ 
                  color: alpha('#ffffff', 0.8),
                  fontSize: '0.875rem',
                  lineHeight: 1.2
                }}
              >
                מערכת ניהול תיקים משפטיים
              </Typography>
            </TitleSection>

            <FeatureChips>
              <Chip 
                icon={<Shield size={14} />}
                label="מאובטח" 
                size="small"
                sx={{ 
                  background: alpha('#ffffff', 0.15), 
                  color: 'white',
                  border: `1px solid ${alpha('#ffffff', 0.25)}`,
                  fontSize: '0.75rem',
                  height: 28
                }} 
              />
              <Chip 
                icon={<Users size={14} />}
                label="מתקדם" 
                size="small"
                sx={{ 
                  background: alpha('#ffffff', 0.15), 
                  color: 'white',
                  border: `1px solid ${alpha('#ffffff', 0.25)}`,
                  fontSize: '0.75rem',
                  height: 28
                }} 
              />
            </FeatureChips>
          </LogoSection>

          {/* Center - Quick Navigation (Desktop Only) */}
          {!isTablet && (
            <NavigationSection>
              {menuItems.slice(0, 6).map((item) => (
                <Tooltip key={item.path} title={item.label} arrow>
                  <QuickNavButton
                    onClick={() => handleMenuItemClick(item.path)}
                    className={isActivePath(item.path) ? 'active' : ''}
                  >
                    {item.badge ? (
                      <Badge 
                        badgeContent={item.badge} 
                        color="error"
                        sx={{ 
                          '& .MuiBadge-badge': { 
                            fontSize: '0.6rem',
                            minWidth: '16px',
                            height: '16px'
                          } 
                        }}
                      >
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </QuickNavButton>
                </Tooltip>
              ))}
            </NavigationSection>
          )}

          {/* Right Side - Actions and User */}
          <ActionsSection>
            <Tooltip title="חיפוש מהיר" arrow>
              <ActionButton>
                <Search size={20} />
              </ActionButton>
            </Tooltip>

            <Tooltip title="התראות" arrow>
              <ActionButton>
                <Badge 
                  badgeContent={notifications} 
                  color="error"
                  sx={{ 
                    '& .MuiBadge-badge': { 
                      fontSize: '0.7rem',
                      minWidth: '18px',
                      height: '18px'
                    } 
                  }}
                >
                  <Bell size={20} />
                </Badge>
              </ActionButton>
            </Tooltip>

            <UserAvatar />
          </ActionsSection>
        </StyledToolbar>
      </StyledAppBar>

      {/* Mobile Drawer */}
      <StyledDrawer
        variant="temporary"
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
      >
        {drawer}
      </StyledDrawer>
    </>
  );
};

export default Header;