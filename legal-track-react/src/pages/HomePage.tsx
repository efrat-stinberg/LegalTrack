// Overview: the office's key numbers, upcoming deadlines, the latest cases, and quick ways to start common work.
import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, Button, Link, Skeleton, Typography } from "@mui/material";
import { ChevronLeft, FilePlus2, FolderPlus, UserPlus } from "lucide-react";
import { getAllFolders } from "../api/api";
import { getClients } from "../api/clientApi";
import { MyFolder } from "../models/Folder";
import { DeadlineText } from "../components/caseStatus";
import { daysUntil } from "../utils/caseStatus";
import type { RootState } from "../store/store";
import { Client } from "../models/Client";
import PageTitle from "../components/layout/PageTitle";
import { tokens } from "../theme";

const panel = {
  background: tokens.white,
  border: `1px solid ${tokens.border}`,
  borderRadius: `${tokens.radiusLg}px`,
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const [folders, setFolders] = useState<MyFolder[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([getAllFolders(), getClients()])
      .then(([f, c]) => {
        setFolders(f || []);
        setClients(c?.data ?? []);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const clientName = useMemo(() => new Map(clients.map((c) => [c.id, c.fullName])), [clients]);
  const totalDocuments = folders.reduce((sum, f) => sum + (f.documents?.length || 0), 0);
  const monthAgo = Date.now() - 30 * 864e5;
  const newCases = folders.filter((f) => new Date(f.createdDate).getTime() >= monthAgo).length;
  const recent = [...folders].sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()).slice(0, 6);
  const activeCount = folders.filter((f) => f.status !== "closed").length;
  // Active cases with a deadline in the next 30 days or already overdue, soonest first
  const upcoming = folders
    .filter((f) => f.status !== "closed" && f.nextDeadline && daysUntil(f.nextDeadline) <= 30)
    .sort((a, b) => a.nextDeadline!.localeCompare(b.nextDeadline!))
    .slice(0, 5);

  const stats = [
    { label: "תיקים פעילים", value: activeCount, note: `מתוך ${folders.length} תיקים`, to: "/folders" },
    { label: "תיקים חדשים", value: newCases, note: "ב-30 הימים האחרונים", to: "/folders" },
    { label: "לקוחות", value: clients.length, note: "רשומים במשרד", to: "/clients" },
    { label: "מסמכים", value: totalDocuments, note: "בכל התיקים", to: "/documents" },
  ];

  const actions = [
    { icon: <FolderPlus size={18} />, label: "פתיחת תיק חדש", onClick: () => navigate("/folders?new=1") },
    { icon: <UserPlus size={18} />, label: "הוספת לקוח", onClick: () => navigate("/clients") },
    { icon: <FilePlus2 size={18} />, label: "העלאת מסמכים לתיק", onClick: () => navigate("/folders") },
  ];

  const firstName = (currentUser?.username || "").split(" ")[0];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <PageTitle title={firstName ? `שלום, ${firstName}` : "סקירה"} subtitle="מצב המשרד במבט אחד" />

      {error && (
        <Typography role="alert" sx={{ ...panel, px: 2, py: 1.5, boxShadow: `inset -3px 0 0 ${tokens.ink}` }}>
          לא ניתן לטעון את נתוני המשרד. רעננו את הדף או נסו שוב בעוד רגע.
        </Typography>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" }, gap: 2 }}>
        {stats.map((s) => (
          <Box
            key={s.label}
            component={RouterLink}
            to={s.to}
            sx={{
              ...panel,
              p: 2.5,
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              "&:hover": { borderColor: tokens.borderStrong },
              "&:focus-visible": { outline: `2px solid ${tokens.blue600}` },
            }}
          >
            <Typography sx={{ fontSize: 13, fontWeight: 500, color: tokens.slate }}>{s.label}</Typography>
            {loading ? (
              <Skeleton width={48} height={40} />
            ) : (
              <Typography sx={{ fontSize: 30, fontWeight: 600, color: tokens.navy900, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
                {s.value}
              </Typography>
            )}
            <Typography sx={{ fontSize: 12, color: tokens.muted }}>{s.note}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2.5, alignItems: "flex-start" }}>
        <Box component="section" aria-labelledby="recent-title" sx={{ ...panel, flex: "2 1 460px", minWidth: 0 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2.5, py: 2, borderBottom: `1px solid ${tokens.border}` }}>
            <Typography id="recent-title" component="h2" variant="h6" sx={{ color: tokens.navy900 }}>
              תיקים אחרונים
            </Typography>
            <Link component={RouterLink} to="/folders" underline="hover" sx={{ fontSize: 13, display: "flex", alignItems: "center", gap: 0.5 }}>
              כל התיקים <ChevronLeft size={14} aria-hidden="true" />
            </Link>
          </Box>
          {loading &&
            [0, 1, 2].map((i) => (
              <Box key={i} sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${tokens.borderSoft}` }}>
                <Skeleton width="50%" />
              </Box>
            ))}
          {!loading && recent.length === 0 && (
            <Box sx={{ px: 2.5, py: 4, display: "flex", flexDirection: "column", gap: 1.5, alignItems: "flex-start" }}>
              <Typography sx={{ color: tokens.slate }}>עדיין אין תיקים במשרד.</Typography>
              <Button variant="contained" onClick={() => navigate("/folders?new=1")}>
                פתיחת תיק ראשון
              </Button>
            </Box>
          )}
          {!loading &&
            recent.map((f) => (
              <Box
                key={f.folderId}
                component={RouterLink}
                to={`/folders/${f.folderId}`}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr) 90px",
                  gap: 1.5,
                  alignItems: "center",
                  px: 2.5,
                  minHeight: 52,
                  borderBottom: `1px solid ${tokens.borderSoft}`,
                  textDecoration: "none",
                  color: tokens.ink,
                  "&:hover": { background: tokens.hover },
                  "&:focus-visible": { outline: `2px solid ${tokens.blue600}`, outlineOffset: -2 },
                }}
              >
                <Typography sx={{ fontWeight: 600, color: tokens.navy900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.folderName}</Typography>
                <Typography sx={{ color: tokens.slate, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{clientName.get(f.clientId) ?? "—"}</Typography>
                <Typography sx={{ color: tokens.slate, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>{new Date(f.createdDate).toLocaleDateString("he-IL")}</Typography>
              </Box>
            ))}
        </Box>

        <Box sx={{ flex: "1 1 280px", minWidth: 0, display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box component="section" aria-labelledby="deadlines-title" sx={{ ...panel }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${tokens.border}` }}>
            <Typography id="deadlines-title" component="h2" variant="h6" sx={{ color: tokens.navy900 }}>
              מועדים קרובים
            </Typography>
            <Typography sx={{ fontSize: 12, color: tokens.muted }}>30 הימים הקרובים, כולל מועדים שעברו</Typography>
          </Box>
          {loading && (
            <Box sx={{ px: 2.5, py: 1.75 }}>
              <Skeleton width="70%" />
            </Box>
          )}
          {!loading && upcoming.length === 0 && (
            <Typography sx={{ px: 2.5, py: 2.5, color: tokens.slate, fontSize: 14 }}>אין מועדים קרובים. מוסיפים מועד מתוך דף התיק.</Typography>
          )}
          {!loading &&
            upcoming.map((f) => (
              <Box
                key={f.folderId}
                component={RouterLink}
                to={`/folders/${f.folderId}`}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0.25,
                  px: 2.5,
                  py: 1.25,
                  borderBottom: `1px solid ${tokens.borderSoft}`,
                  textDecoration: "none",
                  color: tokens.ink,
                  "&:hover": { background: tokens.hover },
                  "&:focus-visible": { outline: `2px solid ${tokens.blue600}`, outlineOffset: -2 },
                }}
              >
                <Typography sx={{ fontWeight: 600, color: tokens.navy900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f.folderName}
                  {f.nextDeadlineNote && <Box component="span" sx={{ fontWeight: 400, color: tokens.slate }}> · {f.nextDeadlineNote}</Box>}
                </Typography>
                <Box sx={{ fontSize: 13 }}>
                  <DeadlineText date={f.nextDeadline} />
                </Box>
              </Box>
            ))}
        </Box>

        <Box component="section" aria-labelledby="actions-title" sx={{ ...panel }}>
          <Box sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${tokens.border}` }}>
            <Typography id="actions-title" component="h2" variant="h6" sx={{ color: tokens.navy900 }}>
              פעולות מהירות
            </Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            {actions.map((a) => (
              <Box
                key={a.label}
                component="button"
                type="button"
                onClick={a.onClick}
                sx={{
                  all: "unset",
                  boxSizing: "border-box",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  minHeight: 44,
                  px: 1.5,
                  borderRadius: `${tokens.radius}px`,
                  cursor: "pointer",
                  color: tokens.ink,
                  "&:hover": { background: tokens.hover },
                  "&:focus-visible": { outline: `2px solid ${tokens.blue600}` },
                }}
              >
                <Box component="span" sx={{ color: tokens.navy700, display: "flex" }} aria-hidden="true">
                  {a.icon}
                </Box>
                <span>{a.label}</span>
                <ChevronLeft size={16} color={tokens.muted} style={{ marginInlineStart: "auto" }} aria-hidden="true" />
              </Box>
            ))}
          </Box>
        </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
