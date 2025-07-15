import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Tooltip,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search,
  Filter,
  Settings,
  Download,
  Upload,
  MoreVertical,
  Bell,
  HelpCircle
} from 'lucide-react';

const HeaderCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(4),
  borderRadius: 20,
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
  }
}));

const SearchSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  alignItems: 'center',
  marginTop: theme.spacing(3),
  flexWrap: 'wrap',
  
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column',
    alignItems: 'stretch',
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  flex: 1,
  minWidth: 300,
  
  '& .MuiOutlinedInput-root': {
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    borderRadius: 12,
    backdropFilter: 'blur(10px)',
    
    '& fieldset': {
      borderColor: alpha(theme.palette.common.white, 0.3),
    },
    
    '&:hover fieldset': {
      borderColor: alpha(theme.palette.common.white, 0.5),
    },
    
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.common.white,
    }
  },
  
  '& .MuiInputBase-input': {
    color: theme.palette.common.white,
    
    '&::placeholder': {
      color: alpha(theme.palette.common.white, 0.7),
    }
  },
  
  '& .MuiInputAdornment-root .MuiSvgIcon-root': {
    color: alpha(theme.palette.common.white, 0.7),
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.white, 0.2),
  color: theme.palette.common.white,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.3),
    transform: 'translateY(-2px)',
  }
}));

const FilterChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.common.white, 0.2),
  color: theme.palette.common.white,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.common.white, 0.3)}`,
  
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.3),
  },
  
  '& .MuiChip-deleteIcon': {
    color: alpha(theme.palette.common.white, 0.8),
    
    '&:hover': {
      color: theme.palette.common.white,
    }
  }
}));

interface PageHeaderProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: string[]) => void;
  activeFilters: string[];
}

const PageHeader: React.FC<PageHeaderProps> = ({
  onSearch,
  onFilterChange,
  activeFilters
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleFilterToggle = (filter: string) => {
    const newFilters = activeFilters.includes(filter)
      ? activeFilters.filter(f => f !== filter)
      : [...activeFilters, filter];
    onFilterChange(newFilters);
  };

  const availableFilters = [
    'תיקיות פעילות',
    'תיקיות ריקות', 
    'נוצר השבוע',
    'נוצר החודש'
  ];

  return (
    <HeaderCard elevation={0}>
      {/* Title Section */}
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              background: alpha(theme.palette.common.white, 0.2),
              backdropFilter: 'blur(10px)',
            }}
          >
            📁
          </Avatar>
          <Box>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              ניהול תיקים משפטיים
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              ארגון וניהול יעיל של תיקים ומסמכים
            </Typography>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box display="flex" gap={1}>
          <Tooltip title="התראות">
            <ActionButton size="small">
              <Bell size={20} />
            </ActionButton>
          </Tooltip>
          
          <Tooltip title="עזרה">
            <ActionButton size="small">
              <HelpCircle size={20} />
            </ActionButton>
          </Tooltip>
          
          <Tooltip title="אפשרויות נוספות">
            <ActionButton size="small" onClick={handleMenuOpen}>
              <MoreVertical size={20} />
            </ActionButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Search and Filter Section */}
      <SearchSection>
        <StyledTextField
          placeholder="חיפוש תיקיות, לקוחות או מסמכים..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search size={20} />
              </InputAdornment>
            ),
          }}
        />
        
        <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
          <Tooltip title="מסנן מתקדם">
            <ActionButton size="small">
              <Filter size={20} />
            </ActionButton>
          </Tooltip>
          
          <Tooltip title="ייצא נתונים">
            <ActionButton size="small">
              <Download size={20} />
            </ActionButton>
          </Tooltip>
          
          <Tooltip title="ייבא נתונים">
            <ActionButton size="small">
              <Upload size={20} />
            </ActionButton>
          </Tooltip>
        </Box>
      </SearchSection>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <Box mt={2} display="flex" gap={1} flexWrap="wrap">
          {activeFilters.map((filter) => (
            <FilterChip
              key={filter}
              label={filter}
              onDelete={() => handleFilterToggle(filter)}
              size="small"
            />
          ))}
        </Box>
      )}

      {/* Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            borderRadius: 2,
            minWidth: 200,
          }
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <Settings size={16} style={{ marginRight: 8 }} />
          הגדרות מערכת
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <Download size={16} style={{ marginRight: 8 }} />
          ייצוא דוח מלא
        </MenuItem>
        <Divider />
        {availableFilters.map((filter) => (
          <MenuItem
            key={filter}
            onClick={() => {
              handleFilterToggle(filter);
              handleMenuClose();
            }}
            selected={activeFilters.includes(filter)}
          >
            {filter}
          </MenuItem>
        ))}
      </Menu>
    </HeaderCard>
  );
};

export default PageHeader;