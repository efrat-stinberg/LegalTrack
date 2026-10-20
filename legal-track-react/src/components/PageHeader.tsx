import React, { useState } from 'react';
import { Box, Chip, InputBase } from '@mui/material';
import { Search } from 'lucide-react';
import PageTitle from './layout/PageTitle';
import { tokens } from '../theme';

interface PageHeaderProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: string[]) => void;
  activeFilters: string[];
}

const availableFilters = ['תיקיות פעילות', 'תיקיות ריקות', 'נוצר השבוע', 'נוצר החודש'];

// Header of the advanced case-management page: title, search and quick filters.
const PageHeader: React.FC<PageHeaderProps> = ({ onSearch, onFilterChange, activeFilters }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const toggle = (filter: string) =>
    onFilterChange(activeFilters.includes(filter) ? activeFilters.filter((f) => f !== filter) : [...activeFilters, filter]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
      <PageTitle title="ניהול תיקים מתקדם" subtitle="תצוגת כרטיסים עם סינון לפי פעילות ותאריך" />
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, alignItems: 'center' }}>
        <Box sx={{ flex: '1 1 280px', maxWidth: 420, display: 'flex', alignItems: 'center', gap: 1, height: 40, px: 1.5, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius}px`, background: tokens.white, color: tokens.muted, '&:focus-within': { borderColor: tokens.blue600 } }}>
          <Search size={16} aria-hidden="true" />
          <InputBase
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="חיפוש תיקים, לקוחות או מסמכים"
            inputProps={{ 'aria-label': 'חיפוש תיקים' }}
            sx={{ flex: 1, fontSize: 14 }}
          />
        </Box>
        {availableFilters.map((f) => {
          const active = activeFilters.includes(f);
          return (
            <Chip
              key={f}
              label={f}
              clickable
              onClick={() => toggle(f)}
              aria-pressed={active}
              variant={active ? 'filled' : 'outlined'}
              sx={active ? { background: tokens.navy700, color: tokens.white, '&:hover': { background: tokens.navy900 } } : { background: tokens.white }}
            />
          );
        })}
      </Box>
    </Box>
  );
};

export default PageHeader;
