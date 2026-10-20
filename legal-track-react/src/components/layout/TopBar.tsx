import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, IconButton, InputBase } from '@mui/material';
import { Menu as MenuIcon, Plus, Search } from 'lucide-react';
import UserAvatar from '../UserAvatar';
import { tokens } from '../../theme';

interface TopBarProps {
  onOpenMenu: () => void;
}

// Search opens the cases list filtered by the query; "New case" opens the create form there.
const TopBar: React.FC<TopBarProps> = ({ onOpenMenu }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/folders?q=${encodeURIComponent(q)}` : '/folders');
  };

  return (
    <Box
      component="header"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: { xs: 2, md: 4 },
        height: 64,
        background: tokens.white,
        borderBottom: `1px solid ${tokens.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <IconButton
        onClick={onOpenMenu}
        aria-label="פתיחת תפריט"
        sx={{ display: { xs: 'inline-flex', md: 'none' }, color: tokens.ink }}
      >
        <MenuIcon size={20} />
      </IconButton>

      <Box
        component="form"
        role="search"
        onSubmit={submitSearch}
        sx={{
          flex: '0 1 440px',
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          height: 40,
          px: 1.5,
          border: `1px solid ${tokens.border}`,
          borderRadius: `${tokens.radius}px`,
          background: tokens.ground,
          color: tokens.muted,
          '&:focus-within': { borderColor: tokens.blue600, background: tokens.white },
        }}
      >
        <Search size={16} aria-hidden="true" />
        <InputBase
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש תיק או לקוח"
          inputProps={{ 'aria-label': 'חיפוש תיק או לקוח' }}
          sx={{ flex: 1, fontSize: 14, color: tokens.ink }}
        />
      </Box>

      <Box sx={{ flex: 1 }} />

      <Button
        variant="contained"
        startIcon={<Plus size={16} />}
        onClick={() => navigate('/folders?new=1')}
        sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
      >
        תיק חדש
      </Button>
      <UserAvatar />
    </Box>
  );
};

export default TopBar;
