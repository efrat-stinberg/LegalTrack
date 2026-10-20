// src/pages/AnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Fade,
} from '@mui/material';
import PageTitle from '../components/layout/PageTitle';
import { Users, FileText, FolderOpen, Upload } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getAllFolders } from '../api/folderApi';
import { getAllDocuments } from '../api/documentApi';
import { getClients } from '../api/clientApi';




interface Stats {
  folders: number;
  documents: number;
  clients: number;
  documentsLast30Days: number;
  documentsByMonth: { month: string; count: number }[];
  foldersByClient: { client: string; count: number }[];
}

const MONTHS_SHOWN = 6;

// Counts the office's real data: cases, documents and clients
const buildStats = (
  folders: { clientId: number }[],
  documents: { uploadDate: string }[],
  clients: { id?: number; fullName: string }[]
): Stats => {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const documentsByMonth = Array.from({ length: MONTHS_SHOWN }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (MONTHS_SHOWN - 1 - i), 1);
    const count = documents.filter((doc) => {
      const uploaded = new Date(doc.uploadDate);
      return uploaded.getFullYear() === d.getFullYear() && uploaded.getMonth() === d.getMonth();
    }).length;
    return { month: d.toLocaleDateString('he-IL', { month: 'short', year: '2-digit' }), count };
  });

  const clientNames = new Map(clients.map((c) => [c.id, c.fullName]));
  const perClient = new Map<string, number>();
  folders.forEach((f) => {
    const name = clientNames.get(f.clientId) ?? 'ללא לקוח';
    perClient.set(name, (perClient.get(name) ?? 0) + 1);
  });
  const foldersByClient = [...perClient.entries()]
    .map(([client, count]) => ({ client, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    folders: folders.length,
    documents: documents.length,
    clients: clients.length,
    documentsLast30Days: documents.filter((d) => new Date(d.uploadDate) >= monthAgo).length,
    documentsByMonth,
    foldersByClient,
  };
};

const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAllFolders(), getAllDocuments(), getClients()])
      .then(([folders, documents, clientsResponse]) =>
        setStats(buildStats(folders, documents, clientsResponse?.data ?? [])))
      .catch(() => setError('שגיאה בטעינת הנתונים'));
  }, []);

  const cards = stats
    ? [
        { title: 'תיקים', value: stats.folders, icon: <FolderOpen size={24} />, color: '#1B3355' },
        { title: 'מסמכים', value: stats.documents, icon: <FileText size={24} />, color: '#1B3355' },
        { title: 'לקוחות', value: stats.clients, icon: <Users size={24} />, color: '#4A5363' },
        { title: 'מסמכים ב-30 הימים האחרונים', value: stats.documentsLast30Days, icon: <Upload size={24} />, color: '#2A4870' },
      ]
    : [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Fade in={true} timeout={600}>
        <div>
          <PageTitle title="דוחות" subtitle="נתוני הפעילות של המשרד" />

          {error && <Typography color="error" mb={2}>{error}</Typography>}
          {!stats && !error && <Typography>טוען נתונים...</Typography>}

          {stats && (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 2, my: 3 }}>
                {cards.map((stat) => (
                  <Box key={stat.title} sx={{ background: '#FFFFFF', border: '1px solid #E3E6EB', borderRadius: '8px', p: 2.5 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary' }}>{stat.title}</Typography>
                    <Typography sx={{ fontSize: 30, fontWeight: 600, color: '#0F1E33', fontVariantNumeric: 'tabular-nums' }}>{stat.value}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ display: 'grid', gap: 2.5, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' } }}>
                <Paper sx={{ p: 3, border: '1px solid #E3E6EB', borderRadius: '8px' }}>
                  <Typography variant="h6" fontWeight={600} mb={3}>
                    מסמכים שהועלו לפי חודש
                  </Typography>
                  <Box sx={{ height: 300 }} dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.documentsByMonth}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value) => [value, 'מסמכים']} />
                        <Bar dataKey="count" fill="#1B3355" radius={[3, 3, 0, 0]} maxBarSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>

                <Paper sx={{ p: 3, border: '1px solid #E3E6EB', borderRadius: '8px' }}>
                  <Typography variant="h6" fontWeight={600} mb={3}>
                    לקוחות עם הכי הרבה תיקים
                  </Typography>
                  {stats.foldersByClient.length === 0 ? (
                    <Typography color="text.secondary">אין עדיין תיקים</Typography>
                  ) : (
                    stats.foldersByClient.map((row) => (
                      <Box key={row.client} display="flex" justifyContent="space-between" py={1}
                           sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography>{row.client}</Typography>
                        <Typography fontWeight={600}>{row.count}</Typography>
                      </Box>
                    ))
                  )}
                </Paper>
              </Box>
            </>
          )}
        </div>
      </Fade>
    </Box>
  );
};

export default AnalyticsPage;
