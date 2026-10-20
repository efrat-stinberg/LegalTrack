import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { Home, FolderOpen, FolderCog, Users, FileText, BarChart3, HelpCircle, Scale } from 'lucide-react';
import { tokens } from '../../theme';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  // Extra paths that also mark this item as active (e.g. a case's details page)
  match?: (pathname: string) => boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    title: 'עבודה שוטפת',
    items: [
      { path: '/home', label: 'סקירה', icon: <Home size={18} /> },
      {
        path: '/folders',
        label: 'תיקים',
        icon: <FolderOpen size={18} />,
        match: (p) => p === '/folders' || p.startsWith('/folders/'),
      },
      { path: '/clients', label: 'לקוחות', icon: <Users size={18} /> },
      { path: '/documents', label: 'מסמכים', icon: <FileText size={18} /> },
    ],
  },
  {
    title: 'ניהול וניתוח',
    items: [
      { path: '/folder-management', label: 'ניהול תיקים מתקדם', icon: <FolderCog size={18} /> },
      { path: '/analytics', label: 'דוחות', icon: <BarChart3 size={18} /> },
    ],
  },
  {
    title: 'עזרה',
    items: [{ path: '/support', label: 'עזרה ותמיכה', icon: <HelpCircle size={18} /> }],
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

// The main navigation. Used as a fixed column on desktop and inside a drawer on small screens.
const Sidebar: React.FC<SidebarProps> = ({ onNavigate }) => {
  const { pathname } = useLocation();

  const isActive = (item: NavItem) => (item.match ? item.match(pathname) : pathname === item.path);

  return (
    <Box
      component="nav"
      aria-label="ניווט ראשי"
      sx={{
        width: 248,
        height: '100%',
        boxSizing: 'border-box',
        background: tokens.navy900,
        color: '#C9D3E1',
        px: 1.75,
        py: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        overflowY: 'auto',
      }}
    >
      <Box
        component={NavLink}
        to="/home"
        onClick={onNavigate}
        sx={{ display: 'flex', alignItems: 'center', gap: 1.25, px: 1, textDecoration: 'none' }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: `${tokens.radius}px`,
            background: tokens.navy700,
            border: `1px solid ${tokens.navy500}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}
        >
          <Scale size={18} aria-hidden="true" />
        </Box>
        <Typography sx={{ fontFamily: tokens.fontDisplay, fontSize: 21, fontWeight: 600, color: '#FFFFFF' }}>
          LegalTrack
        </Typography>
      </Box>

      {groups.map((group) => (
        <Box key={group.title} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography
            component="div"
            sx={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: '#8C9AB0', px: 1.25, pb: 0.75 }}
          >
            {group.title}
          </Typography>
          {group.items.map((item) => {
            const active = isActive(item);
            return (
              <Box
                key={item.path}
                component={NavLink}
                to={item.path}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  minHeight: 40,
                  px: 1.25,
                  borderRadius: `${tokens.radius}px`,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#FFFFFF' : '#C9D3E1',
                  background: active ? tokens.navy700 : 'transparent',
                  boxShadow: active ? `inset -3px 0 0 ${tokens.steel}` : 'none',
                  '&:hover': { background: active ? tokens.navy700 : 'rgba(255,255,255,0.06)', color: '#FFFFFF' },
                  '&:focus-visible': { outline: `2px solid ${tokens.steel}`, outlineOffset: 1 },
                }}
              >
                <Box component="span" sx={{ display: 'flex' }} aria-hidden="true">
                  {item.icon}
                </Box>
                {item.label}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  );
};

export default Sidebar;
