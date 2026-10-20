import React from 'react';
import { Box, Typography } from '@mui/material';
import { MyFolder } from '../models/Folder';
import { Client } from '../models/Client';
import { tokens } from '../theme';

interface StatsSectionProps {
  folders: MyFolder[];
  clients: Client[];
}

// Key numbers for the advanced case-management page, computed from the office's real data.
const StatsSection: React.FC<StatsSectionProps> = ({ folders, clients }) => {
  const totalDocuments = folders.reduce((sum, folder) => sum + (folder.documents?.length || 0), 0);
  const weekAgo = Date.now() - 7 * 864e5;
  const recentFolders = folders.filter((folder) => new Date(folder.createdDate).getTime() > weekAgo).length;
  const avgDocumentsPerFolder = folders.length > 0 ? Math.round((totalDocuments / folders.length) * 10) / 10 : 0;

  const stats = [
    { title: 'תיקים', value: folders.length, note: 'בסך הכול' },
    { title: 'מסמכים', value: totalDocuments, note: 'בכל התיקים' },
    { title: 'לקוחות', value: clients.length, note: 'רשומים במשרד' },
    { title: 'ממוצע מסמכים', value: avgDocumentsPerFolder, note: 'לתיק' },
    { title: 'תיקים חדשים', value: recentFolders, note: 'בשבוע האחרון' },
  ];

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' }, gap: 2, mb: 3 }}>
      {stats.map((s) => (
        <Box key={s.title} sx={{ background: tokens.white, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radiusLg}px`, p: 2.25 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, color: tokens.slate }}>{s.title}</Typography>
          <Typography sx={{ fontSize: 26, fontWeight: 600, color: tokens.navy900, fontVariantNumeric: 'tabular-nums', lineHeight: 1.3 }}>{s.value}</Typography>
          <Typography sx={{ fontSize: 12, color: tokens.muted }}>{s.note}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default StatsSection;
