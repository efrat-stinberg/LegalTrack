// Case details: header with client and actions, the case's documents, and the AI assistant.
import axios from "axios";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Link,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowRight, Edit3, Upload } from "lucide-react";
import { getFolderByIdWithDocuments, updateFolder } from "../api/api";
import { getClients } from "../api/clientApi";
import DocumentList from "../components/DocumentList";
import FileUpload from "../components/FileUpload";
import Chat from "../components/Chat";
import { CaseStatus, MyFolder } from "../models/Folder";
import { DeadlineText, StatusChip } from "../components/caseStatus";
import { CASE_STATUSES } from "../utils/caseStatus";
import { Client } from "../models/Client";
import { tokens } from "../theme";

const panel = {
  background: tokens.white,
  border: `1px solid ${tokens.border}`,
  borderRadius: `${tokens.radiusLg}px`,
};

const FolderDetailsPage: React.FC = () => {
  const { id: folderIdParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const folderId = folderIdParam ? parseInt(folderIdParam, 10) : NaN;

  const [folder, setFolder] = useState<MyFolder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<{ folderName: string; clientId: number; status: CaseStatus; nextDeadline: string; nextDeadlineNote: string }>({
    folderName: "",
    clientId: 0,
    status: "open",
    nextDeadline: "",
    nextDeadlineNote: "",
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = async () => {
    if (isNaN(folderId)) {
      setError("מזהה התיק לא תקין");
      setLoading(false);
      return;
    }
    try {
      setError(null);
      setFolder(await getFolderByIdWithDocuments(folderId));
    } catch (e: unknown) {
      setError(axios.isAxiosError(e) && e.response?.status === 404 ? "התיק לא נמצא או שאין לך גישה אליו" : "לא ניתן לטעון את התיק");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId]);

  const openEdit = async () => {
    if (!folder) return;
    setForm({
      folderName: folder.folderName,
      clientId: folder.clientId,
      status: folder.status ?? "open",
      nextDeadline: folder.nextDeadline?.slice(0, 10) ?? "",
      nextDeadlineNote: folder.nextDeadlineNote ?? "",
    });
    setEditOpen(true);
    if (clients.length === 0) {
      const res = await getClients();
      setClients(res?.data ?? []);
    }
  };

  const saveEdit = async () => {
    if (!folder || !form.folderName.trim()) return;
    setSaving(true);
    try {
      await updateFolder(folder.folderId, {
        folderName: form.folderName.trim(),
        clientId: form.clientId,
        status: form.status,
        nextDeadline: form.nextDeadline || null,
        nextDeadlineNote: form.nextDeadline ? form.nextDeadlineNote.trim() || null : null,
      });
      await load();
      setEditOpen(false);
      setNotice("פרטי התיק עודכנו");
    } catch (e: unknown) {
      setNotice(e instanceof Error ? e.message : "עדכון התיק נכשל");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 10, justifyContent: "center", color: tokens.slate }}>
        <CircularProgress size={22} /> טוען את התיק…
      </Box>
    );
  }

  if (error || !folder) {
    return (
      <Box sx={{ ...panel, p: 4, maxWidth: 520, mx: "auto", mt: 6, display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="h5">{error || "התיק לא נמצא"}</Typography>
        <Typography sx={{ color: tokens.slate }}>ייתכן שהתיק נמחק או שהקישור שגוי.</Typography>
        <Box>
          <Button variant="contained" startIcon={<ArrowRight size={16} />} onClick={() => navigate("/folders")}>
            חזרה לרשימת התיקים
          </Button>
        </Box>
      </Box>
    );
  }

  const docCount = folder.documents?.length || 0;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Breadcrumbs aria-label="פירורי לחם" sx={{ fontSize: 13, color: tokens.muted }}>
        <Link component={RouterLink} to="/folders" underline="hover" sx={{ color: tokens.blue600 }}>
          תיקים
        </Link>
        {folder.clientName && <span>{folder.clientName}</span>}
        <Typography aria-current="page" sx={{ fontSize: 13, color: tokens.ink }}>
          {folder.folderName}
        </Typography>
      </Breadcrumbs>

      <Paper sx={{ ...panel, px: 3, py: 2.75, display: "flex", flexWrap: "wrap", gap: 2.5, justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
            <Typography variant="h1" sx={{ fontSize: { xs: 24, md: 30 } }}>
              {folder.folderName}
            </Typography>
            <StatusChip status={folder.status} />
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5, color: tokens.slate }}>
            <span>
              לקוח: <strong style={{ color: tokens.ink }}>{folder.clientName || "—"}</strong>
            </span>
            <span>נפתח: {new Date(folder.createdDate).toLocaleDateString("he-IL")}</span>
            <span>{docCount === 1 ? "מסמך אחד" : `${docCount} מסמכים`}</span>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "baseline", flexWrap: "wrap" }}>
            <Typography component="span" sx={{ color: tokens.slate, fontSize: 14 }}>
              המועד הבא:
            </Typography>
            {folder.nextDeadline ? (
              <Box component="span" sx={{ fontSize: 14 }}>
                <DeadlineText date={folder.nextDeadline} />
                {folder.nextDeadlineNote && <Box component="span" sx={{ color: tokens.ink, fontWeight: 500 }}> – {folder.nextDeadlineNote}</Box>}
              </Box>
            ) : (
              <Button size="small" variant="text" onClick={openEdit} sx={{ minHeight: 0, p: 0, fontSize: 14 }}>
                הוספת מועד
              </Button>
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap" }}>
          <Button variant="outlined" startIcon={<Edit3 size={16} />} onClick={openEdit}>
            עריכת פרטי תיק
          </Button>
          <Button variant="contained" startIcon={<Upload size={16} />} onClick={() => setUploadOpen(true)}>
            העלאת מסמכים
          </Button>
        </Box>
      </Paper>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5, alignItems: "flex-start" }}>
        <Box component="section" aria-labelledby="docs-title" sx={{ ...panel, flex: "1 1 340px", minWidth: 0 }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${tokens.border}` }}>
            <Typography id="docs-title" component="h2" variant="h6" sx={{ color: tokens.navy900 }}>
              מסמכי התיק
            </Typography>
          </Box>
          {docCount > 0 ? (
            <DocumentList
              documents={folder.documents}
              onDelete={(deletedId) =>
                setFolder((prev) => (prev ? { ...prev, documents: prev.documents.filter((d) => d.documentId !== deletedId) } : prev))
              }
              onRenamed={(docId, name) =>
                setFolder((prev) =>
                  prev ? { ...prev, documents: prev.documents.map((d) => (d.documentId === docId ? { ...d, documentName: name } : d)) } : prev
                )
              }
            />
          ) : (
            <Box sx={{ m: 2.5, p: 4, border: `1px dashed ${tokens.borderStrong}`, borderRadius: `${tokens.radiusLg}px`, textAlign: "center", display: "flex", flexDirection: "column", gap: 1.5, alignItems: "center" }}>
              <Typography sx={{ fontWeight: 600 }}>אין עדיין מסמכים בתיק</Typography>
              <Typography sx={{ color: tokens.slate }}>העלו קובצי PDF, Word או תמונות כדי לשמור אותם בתיק ולשאול עליהם את העוזר.</Typography>
              <Button variant="contained" startIcon={<Upload size={16} />} onClick={() => setUploadOpen(true)}>
                העלאת מסמכים
              </Button>
            </Box>
          )}
        </Box>

        <Box component="section" aria-labelledby="ai-title" sx={{ ...panel, flex: "1.5 1 440px", minWidth: 0, minHeight: 620, display: "flex", flexDirection: "column" }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${tokens.border}`, display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography id="ai-title" component="h2" variant="h6" sx={{ color: tokens.navy900 }}>
              עוזר AI לתיק
            </Typography>
            <Typography sx={{ fontSize: 12, color: tokens.muted }}>התשובות מבוססות רק על מסמכי התיק.</Typography>
          </Box>
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <Chat folderId={folder.folderId} />
          </Box>
        </Box>
      </Box>

      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="md" fullWidth>
        <FileUpload
          folderId={folder.folderId}
          onClose={() => setUploadOpen(false)}
          onUploadSuccess={async () => {
            await load();
            setUploadOpen(false);
            setNotice("המסמכים הועלו לתיק");
          }}
        />
      </Dialog>

      <Dialog open={editOpen} onClose={() => !saving && setEditOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>עריכת פרטי תיק</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <TextField
            label="שם התיק"
            required
            value={form.folderName}
            onChange={(e) => setForm((f) => ({ ...f, folderName: e.target.value }))}
            error={!form.folderName.trim()}
            helperText={!form.folderName.trim() ? "יש להזין שם לתיק" : " "}
          />
          <TextField
            select
            label="לקוח"
            required
            value={clients.some((c) => c.id === form.clientId) ? form.clientId : ""}
            onChange={(e) => setForm((f) => ({ ...f, clientId: Number(e.target.value) }))}
          >
            {clients.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.fullName}
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="סטטוס" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CaseStatus }))}>
            {CASE_STATUSES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <s.icon size={15} aria-hidden="true" />
                  {s.label}
                </Box>
              </MenuItem>
            ))}
          </TextField>
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            <TextField
              type="date"
              label="המועד הבא"
              value={form.nextDeadline}
              onChange={(e) => setForm((f) => ({ ...f, nextDeadline: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              helperText="רשות – למשל דיון או הגשה"
              sx={{ flex: 1 }}
            />
            {form.nextDeadline && (
              <Button variant="text" onClick={() => setForm((f) => ({ ...f, nextDeadline: "", nextDeadlineNote: "" }))} sx={{ mt: 0.5 }}>
                ניקוי
              </Button>
            )}
          </Box>
          {form.nextDeadline && (
            <TextField
              label="מה המועד"
              value={form.nextDeadlineNote}
              onChange={(e) => setForm((f) => ({ ...f, nextDeadlineNote: e.target.value }))}
              inputProps={{ maxLength: 200 }}
              placeholder="לדוגמה: דיון בבית משפט השלום"
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="outlined" onClick={() => setEditOpen(false)} disabled={saving}>
            ביטול
          </Button>
          <Button variant="contained" onClick={saveEdit} disabled={saving || !form.folderName.trim()}>
            שמירה
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(notice)} autoHideDuration={5000} onClose={() => setNotice(null)} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
        <Alert severity="success" onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FolderDetailsPage;
