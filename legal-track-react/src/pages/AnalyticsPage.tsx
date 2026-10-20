// src/pages/AnalyticsPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  alpha,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { StatsGrid } from '../utils/GridHelpers';
import { Users, FileText, FolderOpen, Upload } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getAllFolders } from '../api/folderApi';
import { getAllDocuments } from '../api/documentApi';
import { getClients } from '../api/clientApi';

const PageContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4, 3),
  minHeight: '100vh',
  background: `linear-gradient(145deg, #f8fafc 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
}));

const HeaderSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 20,
  marginBottom: theme.spacing(4),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
}));

const StatsCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  transition: 'all 0.3s ease',

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
  }
}));

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
        { title: 'תיקים', value: stats.folders, icon: <FolderOpen size={24} />, color: '#667eea' },
        { title: 'מסמכים', value: stats.documents, icon: <FileText size={24} />, color: '#10b981' },
        { title: 'לקוחות', value: stats.clients, icon: <Users size={24} />, color: '#f59e0b' },
        { title: 'מסמכים ב-30 הימים האחרונים', value: stats.documentsLast30Days, icon: <Upload size={24} />, color: '#8b5cf6' },
      ]
    : [];

  return (
    <PageContainer maxWidth="xl">
      <Fade in={true} timeout={600}>
        <div>
          <HeaderSection elevation={0}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              דוחות וניתוחים 📊
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              נתוני הפעילות של המשרד
            </Typography>
          </HeaderSection>

          {error && <Typography color="error" mb={2}>{error}</Typography>}
          {!stats && !error && <Typography>טוען נתונים...</Typography>}

          {stats && (
            <>
              <StatsGrid sx={{ mb: 4 }}>
                {cards.map((stat) => (
                  <StatsCard key={stat.title}>
                    <CardContent sx={{ p: 3 }}>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            background: `linear-gradient(135deg, ${stat.color}, ${alpha(stat.color, 0.8)})`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white'
                          }}
                        >
                          {stat.icon}
                        </Box>
                        <Box>
                          <Typography variant="h4" fontWeight={700} color="primary">
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {stat.title}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </StatsCard>
                ))}
              </StatsGrid>

              <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' } }}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
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
                        <Bar dataKey="count" fill="#667eea" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>

                <Paper sx={{ p: 3, borderRadius: 3 }}>
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
    </PageContainer>
  );
};

export default AnalyticsPage;
