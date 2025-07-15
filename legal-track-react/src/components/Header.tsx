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
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import UserAvatar from './UserAvatar';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.3)}`,
  backdropFilter: 'blur(20px)',
  borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  padding: theme.spacing(0, 3),
  minHeight: 80,

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
  transition: 'transform 0.2s ease',

  '&:hover': {
    transform: 'scale(1.02)',
  },
}));

const LogoIcon = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: 12,
  background: alpha(theme.palette.common.white, 0.2),
  backdropFilter: 'blur(10px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
  boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.1)}`,
}));

const TitleSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',

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

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const Header: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications] = useState(3); // Mock notifications

  const menuItems: MenuItem[] = [
    {
      path: '/folders',
      label: 'ניהול תיקים',
      icon: <FolderOpen size={20} />,
    },
    {
      path: '/clients',
      label: 'לקוחות',
      icon: <Users size={20} />,
    },
    {
      path: '/documents',
      label: 'מסמכים',
      icon: <FileText size={20} />,
    },
    {
      path: '/analytics',
      label: 'דוחות וניתוחים',
      icon: <BarChart3 size={20} />,
    },
    {
      path: '/calendar',
      label: 'יומן',
      icon: <Calendar size={20} />,
    },
    {
      path: '/messages',
      label: 'הודעות',
      icon: <MessageSquare size={20} />,
      badge: 5,
    },
  ];

  const handleLogoClick = () => {
    navigate('/folders');
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
    return (
      location.pathname === path || location.pathname.startsWith(path + '/')
    );
  };

  const drawer = (
    <Box>
      <DrawerHeader>
        <LogoIcon>
          <FolderOpen size={24} color="white" />
        </LogoIcon>
        <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 1 }}>
          Legal Manager
        </Typography>
        <StatusChip label="מחובר" size="small" />
      </DrawerHeader>

      <Box sx={{ p: 2 }}>
        <List>
          {menuItems.map((item) => (
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
              <ListItemText primary={item.label} />
            </MenuListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        <List>
          <MenuListItem sx={{ cursor: 'pointer' }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Settings size={20} />
            </ListItemIcon>
            <ListItemText primary="הגדרות" />
          </MenuListItem>

          <MenuListItem sx={{ cursor: 'pointer' }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <HelpCircle size={20} />
            </ListItemIcon>
            <ListItemText primary="עזרה ותמיכה" />
          </MenuListItem>
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      <StyledAppBar position="static" elevation={0}>
        <StyledToolbar>
          {/* Left Side - Logo and Menu */}
          <Box display="flex" alignItems="center" gap={2}>
            {isMobile && (
              <ActionButton onClick={handleDrawerToggle}>
                <MenuIcon size={20} />
              </ActionButton>
            )}

            <LogoSection onClick={handleLogoClick}>
              <LogoIcon>
                <FolderOpen size={24} color="white" />
              </LogoIcon>
              <TitleSection>
                <Typography
                  variant="h5"
                  component="h1"
                  fontWeight={700}
                  color="white"
                >
                  Legal Manager
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: alpha(theme.palette.common.white, 0.8) }}
                >
                  מערכת ניהול תיקים משפטיים
                </Typography>
              </TitleSection>
            </LogoSection>
          </Box>

          {/* Center - Navigation (Desktop Only) */}
          {!isMobile && (
            <Box display="flex" alignItems="center" gap={1} sx={{ mx: 4 }}>
              {menuItems.slice(0, 4).map((item) => (
                <Tooltip key={item.path} title={item.label} arrow>
                  <ActionButton
                    onClick={() => handleMenuItemClick(item.path)}
                    sx={{
                      background: isActivePath(item.path)
                        ? alpha(theme.palette.common.white, 0.2)
                        : alpha(theme.palette.common.white, 0.1),
                      transform: isActivePath(item.path)
                        ? 'translateY(-2px)'
                        : 'none',
                    }}
                  >
                    {item.badge ? (
                      <Badge badgeContent={item.badge} color="error">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </ActionButton>
                </Tooltip>
              ))}
            </Box>
          )}

          {/* Right Side - Actions and User */}
          <Box display="flex" alignItems="center" gap={2} sx={{ ml: 'auto' }}>
            <Tooltip title="חיפוש" arrow>
              <ActionButton>
                <Search size={20} />
              </ActionButton>
            </Tooltip>

            <Tooltip title="התראות" arrow>
              <ActionButton>
                <Badge badgeContent={notifications} color="error">
                  <Bell size={20} />
                </Badge>
              </ActionButton>
            </Tooltip>

            <UserAvatar />
          </Box>
        </StyledToolbar>
      </StyledAppBar>

      {/* Mobile Drawer */}
      <StyledDrawer
        variant="temporary"
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
      >
        {drawer}
      </StyledDrawer>
    </>
  );
};

export default Header;
