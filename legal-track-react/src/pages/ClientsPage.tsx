// Clients: searchable table with each client's cases, plus add / edit / delete.
import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
import { Edit3, FolderOpen, MoreVertical, Plus, Search, Trash2 } from 'lucide-react';
import { getClients, createClient, updateClient, deleteClient } from '../api/clientApi';
import { getAllFolders } from '../api/folderApi';
import { MyFolder } from '../models/Folder';
import { Client } from '../models/Client';
import PageTitle from '../components/layout/PageTitle';
import { tokens } from '../theme';

const emptyForm = { fullName: '', email: '', phone: '' };
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [folders, setFolders] = useState<MyFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; client?: Client } | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [menu, setMenu] = useState<{ anchor: HTMLElement; client: Client } | null>(null);
  const [toDelete, setToDelete] = useState<Client | null>(null);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    Promise.all([getClients(), getAllFolders().catch(() => [] as MyFolder[])])
      .then(([c, f]) => {
        setClients(c?.data ?? []);
        setFolders(f || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const caseCount = useMemo(() => {
    const counts = new Map<number, number>();
    folders.forEach((f) => counts.set(f.clientId, (counts.get(f.clientId) ?? 0) + 1));
    return counts;
  }, [folders]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? clients.filter((c) => [c.fullName, c.email, c.phone].some((v) => (v ?? '').toLowerCase().includes(q)))
      : [...clients];
    return list.sort((a, b) => a.fullName.localeCompare(b.fullName, 'he'));
  }, [clients, search]);

  const openCreate = () => {
    setForm(emptyForm);
    setTouched(false);
    setDialog({ mode: 'create' });
  };

  const openEdit = (client: Client) => {
    setForm({ fullName: client.fullName || '', email: client.email || '', phone: client.phone || '' });
    setTouched(false);
    setDialog({ mode: 'edit', client });
  };

  const nameError = !form.fullName.trim() ? 'יש להזין את שם הלקוח' : '';
  const emailError = form.email.trim() && !emailPattern.test(form.email.trim()) ? 'כתובת האימייל לא תקינה' : '';

  const submit = async () => {
    setTouched(true);
    if (nameError || emailError || !dialog) return;
    setSaving(true);
    const data = { fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim() };
    try {
      if (dialog.mode === 'create') {
        const created = await createClient(data);
        setClients((prev) => [...prev, created]);
        setNotice({ text: `הלקוח "${created.fullName}" נוסף` });
      } else if (dialog.client?.id) {
        const updated = await updateClient(dialog.client.id, data);
        setClients((prev) => prev.map((c) => (c.id === dialog.client!.id ? updated : c)));
        setNotice({ text: 'פרטי הלקוח עודכנו' });
      }
      setDialog(null);
    } catch {
      setNotice({ text: 'שמירת הלקוח נכשלה', error: true });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete?.id) return;
    setSaving(true);
    try {
      await deleteClient(toDelete.id);
      setClients((prev) => prev.filter((c) => c.id !== toDelete.id));
      setNotice({ text: `הלקוח "${toDelete.fullName}" נמחק` });
      setToDelete(null);
    } catch (error: any) {
      const serverMessage = typeof error?.response?.data === 'string' ? error.response.data : null;
      setNotice({ text: serverMessage || 'מחיקת הלקוח נכשלה', error: true });
      setToDelete(null);
    } finally {
      setSaving(false);
    }
  };

  const grid = 'minmax(0, 1.4fr) minmax(0, 1.4fr) minmax(0, 1fr) 80px 132px';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <PageTitle
        title="לקוחות"
        subtitle="פרטי הלקוחות של המשרד והתיקים שלהם"
        actions={
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={openCreate}>
            לקוח חדש
          </Button>
        }
      />

      <Box sx={{ background: tokens.white, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radiusLg}px` }}>
        <Box sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${tokens.border}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: 40, px: 1.5, maxWidth: 420, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radius}px`, color: tokens.muted, '&:focus-within': { borderColor: tokens.blue600 } }}>
            <Search size={16} aria-hidden="true" />
            <InputBase value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש לפי שם, אימייל או טלפון" inputProps={{ 'aria-label': 'חיפוש לקוחות' }} sx={{ flex: 1, fontSize: 14 }} />
          </Box>
        </Box>

        <Box sx={{ overflowX: 'auto' }}>
          <Box role="table" aria-label="לקוחות" sx={{ minWidth: 680 }}>
            <Box role="row" sx={{ display: 'grid', gridTemplateColumns: grid, gap: 1.5, px: 2, py: 1.25, background: tokens.ground, borderBottom: `1px solid ${tokens.border}`, fontSize: 12, fontWeight: 600, color: tokens.slate }}>
              <span role="columnheader">שם הלקוח</span>
              <span role="columnheader">אימייל</span>
              <span role="columnheader">טלפון</span>
              <span role="columnheader">תיקים</span>
              <span role="columnheader" className="sr-only">
                פעולות
              </span>
            </Box>

            {loading &&
              [0, 1, 2].map((i) => (
                <Box key={i} sx={{ px: 2, py: 1.75, borderBottom: `1px solid ${tokens.borderSoft}` }}>
                  <Skeleton width="40%" />
                </Box>
              ))}

            {!loading && rows.length === 0 && (
              <Box sx={{ px: 2, py: 5, display: 'flex', flexDirection: 'column', gap: 1.5, alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 600 }}>{clients.length === 0 ? 'עדיין אין לקוחות במשרד' : 'לא נמצאו לקוחות שמתאימים לחיפוש'}</Typography>
                {clients.length === 0 && (
                  <Button variant="contained" startIcon={<Plus size={16} />} onClick={openCreate}>
                    הוספת לקוח ראשון
                  </Button>
                )}
              </Box>
            )}

            {!loading &&
              rows.map((c) => {
                const count = c.id ? caseCount.get(c.id) ?? 0 : 0;
                return (
                  <Box role="row" key={c.id} sx={{ display: 'grid', gridTemplateColumns: grid, gap: 1.5, alignItems: 'center', px: 2, minHeight: 52, borderBottom: `1px solid ${tokens.borderSoft}`, '&:hover': { background: tokens.hover } }}>
                    <Typography role="cell" sx={{ fontWeight: 600, color: tokens.navy900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.fullName}
                    </Typography>
                    <Box role="cell" sx={{ color: tokens.slate, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'right' }}>
                      {c.email ? <Link href={`mailto:${c.email}`} underline="hover" sx={{ color: 'inherit' }}>{c.email}</Link> : '—'}
                    </Box>
                    <Box role="cell" sx={{ color: tokens.slate, direction: 'ltr', textAlign: 'right' }}>
                      {c.phone ? <Link href={`tel:${c.phone}`} underline="hover" sx={{ color: 'inherit' }}>{c.phone}</Link> : '—'}
                    </Box>
                    <Box role="cell" sx={{ color: tokens.slate, fontVariantNumeric: 'tabular-nums' }}>
                      {count}
                    </Box>
                    <Box role="cell" sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                      <Button size="small" variant="text" component={RouterLink} to={`/folders?client=${c.id}`} disabled={count === 0}>
                        תיקים
                      </Button>
                      <Tooltip title="פעולות נוספות">
                        <IconButton size="small" aria-label={`פעולות עבור ${c.fullName}`} aria-haspopup="menu" onClick={(e) => setMenu({ anchor: e.currentTarget, client: c })} sx={{ border: `1px solid ${tokens.border}` }}>
                          <MoreVertical size={15} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                );
              })}
          </Box>
        </Box>
        {!loading && clients.length > 0 && (
          <Typography sx={{ px: 2, py: 1.5, fontSize: 13, color: tokens.slate }}>
            {rows.length === clients.length ? `${clients.length} לקוחות` : `מוצגים ${rows.length} מתוך ${clients.length} לקוחות`}
          </Typography>
        )}
      </Box>

      <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)}>
        <MenuItem component={RouterLink} to={`/folders?client=${menu?.client.id}`} onClick={() => setMenu(null)}>
          <ListItemIcon>
            <FolderOpen size={16} />
          </ListItemIcon>
          תיקי הלקוח
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menu) openEdit(menu.client);
            setMenu(null);
          }}
        >
          <ListItemIcon>
            <Edit3 size={16} />
          </ListItemIcon>
          עריכת פרטים
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menu) setToDelete(menu.client);
            setMenu(null);
          }}
        >
          <ListItemIcon>
            <Trash2 size={16} />
          </ListItemIcon>
          מחיקת לקוח
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(dialog)} onClose={() => !saving && setDialog(null)} maxWidth="sm" fullWidth>
        <DialogTitle>{dialog?.mode === 'create' ? 'לקוח חדש' : 'עריכת פרטי לקוח'}</DialogTitle>
        <DialogContent sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: '8px !important' }}>
          <TextField
            autoFocus
            required
            label="שם מלא"
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            error={touched && Boolean(nameError)}
            helperText={touched && nameError ? nameError : ' '}
            sx={{ gridColumn: { sm: '1 / -1' } }}
          />
          <TextField
            label="אימייל (רשות)"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={touched && Boolean(emailError)}
            helperText={touched && emailError ? emailError : ' '}
            inputProps={{ dir: 'ltr', style: { textAlign: 'right' } }}
          />
          <TextField
            label="טלפון (רשות)"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            helperText=" "
            inputProps={{ dir: 'ltr', style: { textAlign: 'right' } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="outlined" onClick={() => setDialog(null)} disabled={saving}>
            ביטול
          </Button>
          <Button variant="contained" onClick={submit} disabled={saving}>
            {dialog?.mode === 'create' ? 'הוספת הלקוח' : 'שמירה'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(toDelete)} onClose={() => !saving && setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>מחיקת לקוח</DialogTitle>
        <DialogContent>
          <Typography>
            הלקוח <strong>{toDelete?.fullName}</strong> יימחק לצמיתות. לקוח שיש לו תיקים לא ניתן למחוק עד שהתיקים יימחקו או יועברו.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="outlined" onClick={() => setToDelete(null)} disabled={saving}>
            ביטול
          </Button>
          <Button variant="contained" onClick={confirmDelete} disabled={saving} startIcon={<Trash2 size={16} />}>
            מחיקת הלקוח
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

export default ClientsPage;
