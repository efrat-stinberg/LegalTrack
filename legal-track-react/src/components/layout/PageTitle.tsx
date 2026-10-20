import React from 'react';
import { Box, Typography } from '@mui/material';
import { tokens } from '../../theme';

interface PageTitleProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

// The standard page heading: serif title, one line of context, and the page's main actions.
const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle, actions }) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'flex-end' }}>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0 }}>
      <Typography variant="h1" sx={{ fontSize: { xs: 24, md: 30 } }}>
        {title}
      </Typography>
      {subtitle && <Typography sx={{ color: tokens.slate }}>{subtitle}</Typography>}
    </Box>
    {actions && <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>{actions}</Box>}
  </Box>
);

export default PageTitle;
