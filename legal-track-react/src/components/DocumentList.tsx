import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  ListItemIcon,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { ArrowDownUp, Copy, Download, Edit3, MoreVertical, Search, Trash2 } from "lucide-react";
import { deleteDocument, getDownloadUrl, updateDocument } from "../api/api";
import MyDocument from "../models/Document";
import { tokens } from "../theme";

interface DocumentListProps {
  documents: MyDocument[];
  onDelete?: (deletedId: number) => void;
  onRenamed?: (documentId: number, newName: string) => void;
}

type SortKey = "name" | "date";

const fileType = (name: string) => (name.split(".").pop() || "").toUpperCase().slice(0, 5);
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("he-IL", { day: "2-digit", month: "2-digit", year: "numeric" });

// The case's documents as a sortable, filterable table with consistent row actions.
const DocumentList: React.FC<DocumentListProps> = ({ documents, onDelete, onRenamed }) => {
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "date", desc: true });
  const [menu, setMenu] = useState<{ anchor: HTMLElement; doc: MyDocument } | null>(null);
  const [toDelete, setToDelete] = useState<MyDocument | null>(null);
  const [toRename, setToRename] = useState<{ doc: MyDocument; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; error?: boolean } | null>(null);

  const rows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = q ? documents.filter((d) => d.documentName.toLowerCase().includes(q)) : [...documents];
    list.sort((a, b) => {
      const cmp =
        sort.key === "name"
          ? a.documentName.localeCompare(b.documentName, "he")
          : new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      return sort.desc ? -cmp : cmp;
    });
    return list;
  }, [documents, filter, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, desc: !s.desc } : { key, desc: key === "date" }));

  const urlFor = (doc: MyDocument) => getDownloadUrl(doc.filePath.split("/").pop() || doc.documentName);

  const open = async (doc: MyDocument) => {
    try {
      window.open(await urlFor(doc), "_blank", "noopener,noreferrer");
    } catch {
      setNotice({ text: "לא ניתן לפתוח את המסמך", error: true });
    }
  };

  const download = async (doc: MyDocument) => {
    try {
      const link = document.createElement("a");
      link.href = await urlFor(doc);
      link.download = doc.documentName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      setNotice({ text: "לא ניתן להוריד את המסמך", error: true });
    }
  };

  const copyLink = async (doc: MyDocument) => {
    try {
      await navigator.clipboard.writeText(await urlFor(doc));
      setNotice({ text: "הקישור הועתק. הוא תקף ל-5 דקות." });
    } catch {
      setNotice({ text: "לא ניתן להעתיק את הקישור", error: true });
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await deleteDocument(toDelete.filePath);
      onDelete?.(toDelete.documentId);
      setNotice({ text: `המסמך "${toDelete.documentName}" נמחק` });
      setToDelete(null);
    } catch {
      setNotice({ text: "מחיקת המסמך נכשלה", error: true });
    } finally {
      setBusy(false);
    }
  };

  const confirmRename = async () => {
    if (!toRename) return;
    const name = toRename.name.trim();
    if (!name) return;
    setBusy(true);
    try {
      await updateDocument(toRename.doc.documentId, {
        DocumentName: name,
        FilePath: toRename.doc.filePath,
        FolderId: toRename.doc.folderId,
      });
      onRenamed?.(toRename.doc.documentId, name);
      setNotice({ text: "שם המסמך עודכן" });
      setToRename(null);
    } catch {
      setNotice({ text: "עדכון השם נכשל", error: true });
    } finally {
      setBusy(false);
    }
  };

  const headerCell = (label: string, key?: SortKey) =>
    key ? (
      <Box
        component="button"
        type="button"
        onClick={() => toggleSort(key)}
        aria-label={`מיון לפי ${label}`}
        sx={{ all: "unset", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 0.5, "&:focus-visible": { outline: `2px solid ${tokens.blue600}` } }}
      >
        {label}
        <ArrowDownUp size={12} aria-hidden="true" color={sort.key === key ? tokens.ink : tokens.borderStrong} />
      </Box>
    ) : (
      <span>{label}</span>
    );

  const grid = "minmax(0, 1fr) 64px 104px 132px";

  return (
    <Box>
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: `1px solid ${tokens.border}` }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            height: 34,
            px: 1.25,
            maxWidth: 280,
            border: `1px solid ${tokens.border}`,
            borderRadius: `${tokens.radius}px`,
            color: tokens.muted,
            "&:focus-within": { borderColor: tokens.blue600 },
          }}
        >
          <Search size={15} aria-hidden="true" />
          <InputBase
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="סינון לפי שם"
            inputProps={{ "aria-label": "סינון מסמכים לפי שם" }}
            sx={{ flex: 1, fontSize: 13 }}
          />
        </Box>
      </Box>

      <Box sx={{ overflowX: "auto" }}>
        <Box role="table" aria-label="מסמכי התיק" sx={{ minWidth: 420 }}>
          <Box
            role="row"
            sx={{
              display: "grid",
              gridTemplateColumns: grid,
              gap: 1.5,
              px: 2.5,
              py: 1.25,
              background: tokens.ground,
              borderBottom: `1px solid ${tokens.border}`,
              fontSize: 12,
              fontWeight: 600,
              color: tokens.slate,
            }}
          >
            <Box role="columnheader">{headerCell("שם המסמך", "name")}</Box>
            <Box role="columnheader">{headerCell("סוג")}</Box>
            <Box role="columnheader">{headerCell("הועלה", "date")}</Box>
            <Box role="columnheader">
              <span className="sr-only">פעולות</span>
            </Box>
          </Box>

          {rows.length === 0 && (
            <Typography sx={{ px: 2.5, py: 3, color: tokens.slate }}>אין מסמכים שמתאימים לסינון.</Typography>
          )}

          {rows.map((doc) => (
            <Box
              role="row"
              key={doc.documentId}
              sx={{
                display: "grid",
                gridTemplateColumns: grid,
                gap: 1.5,
                alignItems: "center",
                px: 2.5,
                py: 1,
                minHeight: 52,
                borderBottom: `1px solid ${tokens.borderSoft}`,
                "&:hover": { background: tokens.hover },
              }}
            >
              <Box role="cell" sx={{ minWidth: 0 }}>
                <Box
                  component="button"
                  type="button"
                  onClick={() => open(doc)}
                  title={doc.documentName}
                  sx={{
                    all: "unset",
                    cursor: "pointer",
                    display: "block",
                    maxWidth: "100%",
                    fontWeight: 500,
                    color: tokens.ink,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    "&:hover": { color: tokens.blue600, textDecoration: "underline" },
                    "&:focus-visible": { outline: `2px solid ${tokens.blue600}` },
                  }}
                >
                  {doc.documentName}
                </Box>
              </Box>
              <Box role="cell">
                <Box component="span" sx={{ px: 1, py: 0.25, borderRadius: `${tokens.radiusSm}px`, background: tokens.borderSoft, color: tokens.slate, fontSize: 12, fontWeight: 600 }}>
                  {fileType(doc.documentName) || "קובץ"}
                </Box>
              </Box>
              <Box role="cell" sx={{ color: tokens.slate, fontVariantNumeric: "tabular-nums" }}>
                {formatDate(doc.uploadDate)}
              </Box>
              <Box role="cell" sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                <Button size="small" variant="text" onClick={() => open(doc)}>
                  פתיחה
                </Button>
                <Tooltip title="הורדה">
                  <IconButton size="small" aria-label={`הורדת ${doc.documentName}`} onClick={() => download(doc)} sx={{ border: `1px solid ${tokens.border}` }}>
                    <Download size={15} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="פעולות נוספות">
                  <IconButton
                    size="small"
                    aria-label={`פעולות נוספות עבור ${doc.documentName}`}
                    aria-haspopup="menu"
                    onClick={(e) => setMenu({ anchor: e.currentTarget, doc })}
                    sx={{ border: `1px solid ${tokens.border}` }}
                  >
                    <MoreVertical size={15} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Menu anchorEl={menu?.anchor} open={Boolean(menu)} onClose={() => setMenu(null)}>
        <MenuItem
          onClick={() => {
            if (menu) copyLink(menu.doc);
            setMenu(null);
          }}
        >
          <ListItemIcon>
            <Copy size={16} />
          </ListItemIcon>
          העתקת קישור
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menu) setToRename({ doc: menu.doc, name: menu.doc.documentName });
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
            if (menu) setToDelete(menu.doc);
            setMenu(null);
          }}
        >
          <ListItemIcon>
            <Trash2 size={16} />
          </ListItemIcon>
          מחיקה
        </MenuItem>
      </Menu>

      <Dialog open={Boolean(toDelete)} onClose={() => !busy && setToDelete(null)} maxWidth="xs" fullWidth>
        <DialogTitle>מחיקת מסמך</DialogTitle>
        <DialogContent>
          <Typography>
            המסמך <strong>{toDelete?.documentName}</strong> יימחק לצמיתות מהתיק ומהאחסון. לא ניתן לשחזר אותו.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="outlined" onClick={() => setToDelete(null)} disabled={busy}>
            ביטול
          </Button>
          <Button variant="contained" onClick={confirmDelete} disabled={busy} startIcon={<Trash2 size={16} />}>
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(toRename)} onClose={() => !busy && setToRename(null)} maxWidth="xs" fullWidth>
        <DialogTitle>שינוי שם המסמך</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="שם המסמך"
            value={toRename?.name ?? ""}
            onChange={(e) => setToRename((r) => (r ? { ...r, name: e.target.value } : r))}
            onKeyDown={(e) => e.key === "Enter" && confirmRename()}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button variant="outlined" onClick={() => setToRename(null)} disabled={busy}>
            ביטול
          </Button>
          <Button variant="contained" onClick={confirmRename} disabled={busy || !toRename?.name.trim()}>
            שמירה
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(notice)}
        autoHideDuration={notice?.error ? null : 5000}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert severity={notice?.error ? "error" : "success"} onClose={() => setNotice(null)} sx={{ minWidth: 280 }}>
          {notice?.text}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentList;
