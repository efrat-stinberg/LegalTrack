// Cases list: search, filter by client and status of documents, sort, and row actions.
import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Link,
  ListItemIcon,
  Menu,
  MenuItem,
  Skeleton,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Edit3, MoreVertical, Plus, Search, Trash2 } from 'lucide-react';
import { createFolder as apiCreateFolder, deleteFolder, getAllFolders, updateFolder } from '../api/api';
import { getClients } from '../api/clientApi';
import { MyFolder } from '../models/Folder';
import { Client } from '../models/Client';
import PageTitle from '../components/layout/PageTitle';
import { tokens } from '../theme';

type QuickFilter = 'all' | 'hasDocuments' | 'empty' | 'recent' | 'older';
type SortKey = 'date-desc' | 'date-asc' | 'name' | 'documents';

const quickFilters: { key: QuickFilter; label: string }[] = [
  { key: 'all', label: 'כל התיקים' },
  { key: 'hasDocuments', label: 'תיקים עם מסמכים' },
  { key: 'empty', label: 'תיקים ללא מסמכים' },
  { key: 'recent', label: 'נפתחו השבוע' },
  { key: 'older', label: 'נפתחו לפני יותר מחודש' },
];

const selectSx = {
  height: 40,
  px: 1.25,
  border: `1px solid ${tokens.border}`,
  borderRadius: `${tokens.radius}px`,
  font: `14px ${tokens.fontUi}`,
  color: tokens.ink,
  background: tokens.white,
};

const FoldersPage: React.FC = () => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [folders, setFolders] = useState<MyFolder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState(params.get('q') ?? '');
  const [clientFilter, setClientFilter] = useState<number | 'all'>(params.get('client') ? Number(params.get('client')) : 'all');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [sort, setSort] = useState<SortKey>('date-desc');

  const [createOpen, setCreateOpen] = useState(params.get('new') === '1');
  const [form, setForm] = useState<{ folderName: string; clientId: number | '' }>({ folderName: '', clientId: '' });
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const [menu, setMenu] = useState<{ anchor: HTMLElement; folder: MyFolder } | null>(null);
  const [toRename, setToRename] = useState<{ folder: MyFolder; name: string } | null>(null);
  const [toDelete, setToDelete] = useState<MyFolder | null>(null);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);

  // The top bar's search and "new case" button navigate here with ?q= / ?new=1
  useEffect(() => {
    setSearch(params.get('q') ?? '');
    if (params.get('client')) setClientFilter(Number(params.get('client')));
    if (params.get('new') === '1') setCreateOpen(true);
  }, [params]);

  const load = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [f, c] = await Promise.all([getAllFolders(), getClients()]);
      setFolders(f || []);
      setClients(c?.data ?? []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const clientName = useMemo(() => new Map(clients.map((c) => [c.id, c.fullName])), [clients]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const weekAgo = Date.now() - 7 * 864e5;
    const monthAgo = Date.now() - 30 * 864e5;
    const list = folders.filter((f) => {
      const created = new Date(f.createdDate).getTime();
      const docs = f.documents?.length || 0;
      if (clientFilter !== 'all' && f.clientId !== clientFilter) return false;
      if (quickFilter === 'hasDocuments' && docs === 0) return false;
      if (quickFilter === 'empty' && docs > 0) return false;
      if (quickFilter === 'recent' && created < weekAgo) return false;
      if (quickFilter === 'older' && created > monthAgo) return false;
      if (!q) return true;
      return (
        f.folderName.toLowerCase().includes(q) ||
        (clientName.get(f.clientId) ?? '').toLowerCase().includes(q) ||
        f.documents?.some((d) => d.documentName.toLowerCase().includes(q))
      );
    });
    return list.sort((a, b) => {
      switch (sort) {
        case 'name':
          return a.folderName.localeCompare(b.folderName, 'he');
        case 'documents':
          return (b.documents?.length || 0) - (a.documents?.length || 0);
        case 'date-asc':
          return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
        default:
          return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
      }
    });
  }, [folders, search, clientFilter, quickFilter, sort, clientName]);

  const closeCreate = () => {
    setCreateOpen(false);
    setForm({ folderName: '', clientId: '' });
    setTouched(false);
    if (params.get('new')) {
      params.delete('new');
      setParams(params, { replace: true });
    }
  };

  const submitCreate = async () => {
    setTouched(true);
    if (!form.folderName.trim() || form.clientId === '') return;
    setSaving(true);
    try {
      const created = await apiCreateFolder({ folderName: form.folderName.trim(), clientId: form.clientId });
      closeCreate();
      setNotice({ text: `התיק "${created.folderName}" נפתח` });
      navigate(`/folders/${created.folderId}`);
    } catch (e: any) {
      setNotice({ text: e?.message || 'פתיחת התיק נכשלה', error: true });
    } finally {
      setSaving(false);
    }
  };

  const submitRename = async () => {
    if (!toRename || !toRename.name.trim()) return;
    setSaving(true);
    try {
      await updateFolder(toRename.folder.folderId, { folderName: toRename.name.trim(), clientId: toRename.folder.clientId });
      setFolders((prev) => prev.map((f) => (f.folderId === toRename.folder.folderId ? { ...f, folderName: toRename.name.trim() } : f)));
      setNotice({ text: 'שם התיק עודכן' });
      setToRename(null);
    } catch {
      setNotice({ text: 'עדכון שם התיק נכשל', error: true });
    } finally {
      setSaving(false);
    }
  };

  const submitDelete = async () => {
    if (!toDelete) return;
    setSaving(true);
    try {
      await deleteFolder(toDelete.folderId);
      setFolders((prev) => prev.filter((f) => f.folderId !== toDelete.folderId));
      setNotice({ text: `התיק "${toDelete.folderName}" נמחק` });
      setToDelete(null);
    } catch {
      setNotice({ text: 'מחיקת התיק נכשלה', error: true });
    } finally {
      setSaving(false);
    }
  };

  const grid = 'minmax(0, 2fr) minmax(0, 1.4fr) 90px 110px 120px';
  const filtered = rows.length !== folders.length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <PageTitle
        title="תיקים"
        subtitle="כל תיקי המשרד במקום אחד"
        actions={
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
            תיק חדש
          </Button>
        }
      />

      <Box sx={{ background: tokens.white, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radiusLg}px` }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, alignItems: 'center', px: 2, py: 1.75, borderBottom: `1px solid ${tokens.border}` }}>
          <Box
            sx={{
              flex: '1 1 260px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              height: 40,
              px: 1.5,
              border: `1px solid ${tokens.border}`,
              borderRadius: `${tokens.radius}px`,
              color: tokens.muted,
              '&:focus-within': { borderColor: tokens.blue600 },
            }}
          >
            <Search size={16} aria-hidden="true" />
            <InputBase
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="חיפוש לפי שם תיק, לקוח או מסמך"
              inputProps={{ 'aria-label': 'חיפוש תיקים' }}
              sx={{ flex: 1, fontSize: 14 }}
            />
          </Box>
          <Box component="select" aria-label="סינון לפי לקוח" value={clientFilter} onChange={(e: any) => setClientFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))} sx={selectSx}>
            <option value="all">כל הלקוחות</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </Box>
          <Box component="select" aria-label="סינון תיקים" value={quickFilter} onChange={(e: any) => setQuickFilter(e.target.value)} sx={selectSx}>
            {quickFilters.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </Box>
          <Box component="select" aria-label="מיון" value={sort} onChange={(e: any) => setSort(e.target.value)} sx={selectSx}>
            <option value="date-desc">נפתח לאחרונה</option>
            <option value="date-asc">נפתח ראשון</option>
            <option value="name">שם התיק (א-ת)</option>
            <option value="documents">מספר מסמכים</option>
          </Box>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <Box role="table" aria-label="תיקים" sx={{ minWidth: 680 }}>
            <Box
              role="row"
              sx={{ display: 'grid', gridTemplateColumns: grid, gap: 1.5, px: 2, py: 1.25, background: tokens.ground, borderBottom: `1px solid ${tokens.border}`, fontSize: 12, fontWeight: 600, color: tokens.slate }}
            >
              <span role="columnheader">שם התיק</span>
              <span role="columnheader">לקוח</span>
              <span role="columnheader">מסמכים</span>
              <span role="columnheader">נפתח</span>
              <span role="columnheader" className="sr-only">
                פעולות
              </span>
            </Box>

            {loading &&
              [0, 1, 2, 3].map((i) => (
                <Box key={i} sx={{ display: 'grid', gridTemplateColumns: grid, gap: 1.5, px: 2, py: 1.75, borderBottom: `1px solid ${tokens.borderSoft}` }}>
                  <Skeleton width="70%" />
                  <Skeleton width="60%" />
                  <Skeleton width={30} />
                  <Skeleton width={70} />
                  <span />
                </Box>
              ))}

            {!loading && loadError && (
              <Box sx={{ px: 2, py: 4, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography>לא ניתן לטעון את התיקים.</Typography>
                <Button variant="outlined" size="small" onClick={load}>
                  נסו שוב
                </Button>
              </Box>
            )}

            {!loading && !loadError && rows.length === 0 && (
              <Box sx={{ px: 2, py: 5, display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center', textAlign: 'center' }}>
                <Typography sx={{ fontWeight: 600 }}>{folders.length === 0 ? 'אין עדיין תיקים במשרד' : 'לא נמצאו תיקים שמתאימים לחיפוש'}</Typography>
                {folders.length === 0 ? (
                  <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
                    פתיחת תיק ראשון
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSearch('');
                      setClientFilter('all');
                      setQuickFilter('all');
                    }}
                  >
                    ניקוי סינון
                  </Button>
                )}
              </Box>
            )}

            {!loading &&
              rows.map((f) => (
                <Box
                  role="row"
                  key={f.folderId}
                  sx={{ display: 'grid', gridTemplateColumns: grid, gap: 1.5, alignItems: 'center', px: 2, minHeight: 52, borderBottom: `1px solid ${tokens.borderSoft}`, '&:hover': { background: tokens.hover } }}
                >
                  <Box role="cell" sx={{ minWidth: 0 }}>
                    <Link component={RouterLink} to={`/folders/${f.folderId}`} underline="hover" sx={{ fontWeight: 600, color: tokens.navy900, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {f.folderName}
                    </Link>
                  </Box>
                  <Box role="cell" sx={{ color: tokens.slate, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {clientName.get(f.clientId) ?? '—'}
                  </Box>
                  <Box role="cell" sx={{ color: tokens.slate, fontVariantNumeric: 'tabular-nums' }}>
                    {f.documents?.length || 0}
                  </Box>
                  <Box role="cell" sx={{ color: tokens.slate, fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(f.createdDate).toLocaleDateString('he-IL')}
                  </Box>
                  <Box role="cell" sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    <Button size="small" variant="text" component={RouterLink} to={`/folders/${f.folderId}`}>
                      פתיחה
                    </Button>
                    <Tooltip title="פעולות נוספות">
                      <IconButton size="small" aria-label={`פעולות עבור ${f.folderName}`} aria-haspopup="menu" onClick={(e) => setMenu({ anchor: e.currentTarget, folder: f })} sx={{ border: `1px solid ${tokens.border}` }}>
                        <MoreVertical size={15} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
          </Box>
        </Box>

        {!loading && !loadError && folders.length > 0 && (
          <Typography sx={{ px: 2, py: 1.5, fontSize: 13, color: tokens.slate }}>
            {filtered ? `מוצגים ${rows.length} מתוך ${folders.length} תיקים` : `${folders.length} תיקים`}
          </Typography>
        )}
      </Box>

      <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)}>
        <MenuItem
          onClick={() => {
            if (menu) setToRename({ folder: menu.folder, name: menu.folder.folderName });
            setMenu(null);
          }}
        >
          <ListItemIcon>
            <Edit3 size={16} />
          </ListItemIcon>
          שינוי שם
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menu) setToDelete(menu.folder);
            setMenu(null);
          }}
        >
          <ListItemIcon>
            <Trash2 size={16} />
          </ListItemIcon>
          מחיקת התיק
        </MenuItem>
      </Menu>

      <Dialog open={createOpen} onClose={() => !saving && closeCreate()} maxWidth="xs" fullWidth>
        <DialogTitle>תיק חדש</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField
            autoFocus
            required
            label="שם התיק"
            value={form.folderName}
            onChange={(e) => setForm((f) => ({ ...f, folderName: e.target.value }))}
            error={touched && !form.folderName.trim()}
            helperText={touched && !form.folderName.trim() ? 'יש להזין שם לתיק' : 'לדוגמה: תביעת שכירות – רחוב הרצל 10'}
          />
          <TextField
            select
            required
            label="לקוח"
            value={form.clientId}
            onChange={(e) => setForm((f) => ({ ...f, clientId: Number(e.target.value) }))}
            error={touched && form.clientId === ''}
            helperText={touched && form.clientId === '' ? 'יש לבחור לקוח' : ' '}
            SelectProps={{ native: false }}
          >
            {clients.length === 0 && (
              <MenuItem disabled value="">
                אין עדיין לקוחות
              </MenuItem>
            )}
            {clients.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.fullName}
              </MenuItem>
            ))}
          </TextField>
          {clients.length === 0 && (
            <Typography sx={{ fontSize: 13, color: tokens.slate }}>
              כדי לפתוח תיק צריך קודם{' '}
              <Link component={RouterLink} to="/clients">
                להוסיף לקוח
              </Link>
              .
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="outlined" onClick={closeCreate} disabled={saving}>
            ביטול
          </Button>
          <Button variant="contained" onClick={submitCreate} disabled={saving}>
            פתיחת התיק
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(toRename)} onClose={() => !saving && setToRename(null)} maxWidth="xs" fullWidth>
        <DialogTitle>שינוי שם התיק</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="שם התיק"
            value={toRename?.name ?? ''}
            onChange={(e) => setToRename((r) => (r ? { ...r, name: e.target.value } : r))}
            onKeyDown={(e) => e.key === 'Enter' && submitRename()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="outlined" onClick={() => setToRename(null)} disabled={saving}>
            ביטול
          </Button>
          <Button variant="contained" onClick={submitRename} disabled={saving || !toRename?.name.trim()}>
            שמירה
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(toDelete)} onClose={() => !saving && setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>מחיקת תיק</DialogTitle>
        <DialogContent>
          <Typography>
            התיק <strong>{toDelete?.folderName}</strong> יימחק לצמיתות, כולל {toDelete?.documents?.length || 0} המסמכים שבו והיסטוריית השיחה עם העוזר. לא ניתן לשחזר אותו.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="outlined" onClick={() => setToDelete(null)} disabled={saving}>
            ביטול
          </Button>
          <Button variant="contained" onClick={submitDelete} disabled={saving} startIcon={<Trash2 size={16} />}>
            מחיקת התיק
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(notice)} autoHideDuration={notice?.error ? null : 5000} onClose={() => setNotice(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        <Alert severity={notice?.error ? 'error' : 'success'} onClose={() => setNotice(null)}>
          {notice?.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FoldersPage;
