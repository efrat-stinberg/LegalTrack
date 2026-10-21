import React from 'react';
import { Box, Typography } from '@mui/material';
import { MyFolder } from '../models/Folder';
import { Client } from '../models/Client';
import { daysUntil } from '../utils/caseStatus';
import { tokens } from '../theme';

interface StatsSectionProps {
  folders: MyFolder[];
  clients: Client[];
}

// Key numbers above the cases list, computed from the office's real data
const StatsSection: React.FC<StatsSectionProps> = ({ folders, clients }) => {
  const active = folders.filter((f) => f.status !== 'closed');
  const totalDocuments = folders.reduce((sum, folder) => sum + (folder.documents?.length || 0), 0);
  const weekAgo = Date.now() - 7 * 864e5;
  const recentFolders = folders.filter((folder) => new Date(folder.createdDate).getTime() > weekAgo).length;
  const dueSoon = active.filter((f) => f.nextDeadline && daysUntil(f.nextDeadline) <= 7).length;

  const stats = [
    { title: 'תיקים פעילים', value: active.length, note: `מתוך ${folders.length} תיקים` },
    { title: 'מועדים קרובים', value: dueSoon, note: 'בשבוע הקרוב או באיחור' },
    { title: 'מסמכים', value: totalDocuments, note: 'בכל התיקים' },
    { title: 'לקוחות', value: clients.length, note: 'רשומים במשרד' },
    { title: 'תיקים חדשים', value: recentFolders, note: 'בשבוע האחרון' },
  ];

  return (
    <Box component="section" aria-label="מספרים עיקריים" sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(5, minmax(0, 1fr))' }, gap: 2 }}>
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
