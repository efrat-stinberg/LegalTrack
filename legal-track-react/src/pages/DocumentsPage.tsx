// All documents of the office, with the case each belongs to. Uploading happens inside a case.
import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, IconButton, InputBase, Link, Skeleton, Snackbar, Tooltip, Typography } from '@mui/material';
import { Download, Search, Upload } from 'lucide-react';
import { getAllDocuments } from '../api/documentApi';
import { getAllFolders } from '../api/folderApi';
import { getDownloadUrl } from '../api/s3Api';
import PageTitle from '../components/layout/PageTitle';
import { tokens } from '../theme';

interface Row {
  id: number;
  name: string;
  type: string;
  filePath: string;
  uploadDate: string;
  folder: string;
  folderId: number;
}

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAllDocuments(), getAllFolders()])
      .then(([docs, folders]) => {
        const folderNames = new Map(folders.map((f) => [f.folderId, f.folderName]));
        setDocuments(
          docs.map((d) => ({
            id: d.documentId,
            name: d.documentName,
            type: (d.documentName.split('.').pop() || '').toUpperCase().slice(0, 5),
            filePath: d.filePath,
            uploadDate: d.uploadDate,
            folder: folderNames.get(d.folderId) ?? '',
            folderId: d.folderId,
          }))
        );
      })
      .catch(() => setError('לא ניתן לטעון את המסמכים'))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? documents.filter((d) => d.name.toLowerCase().includes(q) || d.folder.toLowerCase().includes(q)) : [...documents];
    return list.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }, [documents, search]);

  const openDocument = async (doc: Row, asDownload = false) => {
    try {
      const url = await getDownloadUrl(doc.filePath.split('/').pop() || doc.name);
      if (asDownload) {
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(url, '_blank', 'noopener');
      }
    } catch {
      setError('לא ניתן לפתוח את המסמך');
    }
  };

  const grid = 'minmax(0, 2fr) minmax(0, 1.3fr) 64px 104px 120px';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <PageTitle
        title="מסמכים"
        subtitle="כל מסמכי המשרד. העלאה נעשית מתוך התיק."
        actions={
          <Button variant="contained" startIcon={<Upload size={16} />} onClick={() => navigate('/folders')}>
            העלאה לתיק
          </Button>
        }
      />

      <Box sx={{ background: tokens.white, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radiusLg}px` }}>
        <Box sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${tokens.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: 40, px: 1.5, maxWidth: 420, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius}px`, color: tokens.muted, '&:focus-within': { borderColor: tokens.blue600 } }}>
            <Search size={16} aria-hidden="true" />
            <InputBase value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש לפי שם מסמך או תיק" inputProps={{ 'aria-label': 'חיפוש מסמכים' }} sx={{ flex: 1, fontSize: 14 }} />
          </Box>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <Box role="table" aria-label="מסמכים" sx={{ minWidth: 680 }}>
            <Box role="row" sx={{ display: 'grid', gridTemplateColumns: grid, gap: 1.5, px: 2, py: 1.25, background: tokens.ground, borderBottom: `1px solid ${tokens.border}`, fontSize: 12, fontWeight: 600, color: tokens.slate }}>
              <span role="columnheader">שם המסמך</span>
              <span role="columnheader">תיק</span>
              <span role="columnheader">סוג</span>
              <span role="columnheader">הועלה</span>
              <span role="columnheader" className="sr-only">
                פעולות
              </span>
            </Box>

            {loading &&
              [0, 1, 2].map((i) => (
                <Box key={i} sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${tokens.borderSoft}` }}>
                  <Skeleton width="45%" />
                </Box>
              ))}

            {!loading && rows.length === 0 && (
              <Box sx={{ px: 2, py: 5, display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center', textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 600 }}>{documents.length === 0 ? 'עדיין אין מסמכים במשרד' : 'לא נמצאו מסמכים שמתאימים לחיפוש'}</Typography>
                {documents.length === 0 && <Typography sx={{ color: tokens.slate }}>מעלים מסמכים מתוך דף התיק.</Typography>}
              </Box>
            )}

            {!loading &&
              rows.map((d) => (
                <Box role="row" key={d.id} sx={{ display: 'grid', gridTemplateColumns: grid, gap: 1.5, alignItems: 'center', px: 2, minHeight: 52, borderBottom: `1px solid ${tokens.borderSoft}`, '&:hover': { background: tokens.hover } }}>
                  <Box role="cell" sx={{ minWidth: 0 }}>
                    <Box component="button" type="button" onClick={() => openDocument(d)} title={d.name} sx={{ all: 'unset', cursor: 'pointer', display: 'block', maxWidth: '100%', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', '&:hover': { color: tokens.blue600, textDecoration: 'underline' }, '&:focus-visible': { outline: `2px solid ${tokens.blue600}` } }}>
                      {d.name}
                    </Box>
                  </Box>
                  <Box role="cell" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Link component={RouterLink} to={`/folders/${d.folderId}`} underline="hover" sx={{ color: tokens.slate }}>
                      {d.folder || '—'}
                    </Link>
                  </Box>
                  <Box role="cell">
                    <Box component="span" sx={{ px: 1, py: 0.25, borderRadius: `${tokens.radiusSm}px`, background: tokens.borderSoft, color: tokens.slate, fontSize: 12, fontWeight: 600 }}>
                      {d.type || 'קובץ'}
                    </Box>
                  </Box>
                  <Box role="cell" sx={{ color: tokens.slate, fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(d.uploadDate).toLocaleDateString('he-IL')}
                  </Box>
                  <Box role="cell" sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    <Button size="small" variant="text" onClick={() => openDocument(d)}>
                      פתיחה
                    </Button>
                    <Tooltip title="הורדה">
                      <IconButton size="small" aria-label={`הורדת ${d.name}`} onClick={() => openDocument(d, true)} sx={{ border: `1px solid ${tokens.border}` }}>
                        <Download size={15} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
          </Box>
        </Box>
        {!loading && documents.length > 0 && (
          <Typography sx={{ px: 2, py: 1.5, fontSize: 13, color: tokens.slate }}>
            {rows.length === documents.length ? `${documents.length} מסמכים` : `מוצגים ${rows.length} מתוך ${documents.length} מסמכים`}
          </Typography>
        )}
      </Box>

      <Snackbar open={Boolean(error)} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentsPage;
