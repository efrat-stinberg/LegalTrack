import React, { useEffect, useRef, useState } from "react";
import { Box, Button, CircularProgress, IconButton, InputBase, Tooltip, Typography } from "@mui/material";
import { Copy, Send } from "lucide-react";
import axios from "axios";
import { apiClient } from "../api/config";
import { tokens } from "../theme";

// The AI answer can take a while; it gets longer than the default apiClient timeout
const CHAT_TIMEOUT_MS = 120000;

type ChatMessage = {
  id: number;
  folderId: number;
  question: string;
  answer: string;
  createdAt: string;
};

type ChatProps = {
  folderId: number;
};

const suggestedQuestions = [
  "מה התוכן העיקרי של המסמכים?",
  "סכם לי את המידע החשוב",
  "אילו תאריכים מופיעים במסמכים?",
  "מה הנקודות המרכזיות לתשומת לב?",
];

const formatTime = (dateString: string) =>
  new Date(dateString).toLocaleString("he-IL", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

// AI assistant for one case: answers are based only on the case's documents.
const Chat: React.FC<ChatProps> = ({ folderId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pendingQuestion]);

  useEffect(() => {
    if (!folderId) return;
    setLoadingHistory(true);
    apiClient
      .get<ChatMessage[]>(`/Chat/${folderId}`)
      .then((res) => setMessages(res.data))
      .catch(() => setError("לא ניתן לטעון את היסטוריית השיחה"))
      .finally(() => setLoadingHistory(false));
  }, [folderId]);

  const sendQuestion = async (questionText?: string) => {
    const text = (questionText ?? question).trim();
    if (!text || pendingQuestion) return;

    setQuestion("");
    setError(null);
    setPendingQuestion(text);

    try {
      const { data: newMessage } = await apiClient.post<ChatMessage>(
        `/Chat/${folderId}`,
        { question: text },
        { timeout: CHAT_TIMEOUT_MS }
      );
      setMessages((prev) => [...prev, newMessage]);
    } catch (err: unknown) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined;
      const serverMessage = axios.isAxiosError(err) && typeof err.response?.data === "string" ? err.response.data : null;
      // The server explains 503s in technical English (e.g. missing ChatKey); lead with a Hebrew sentence
      if (status === 503) setError(`העוזר אינו זמין כרגע.${serverMessage ? ` פרטים: ${serverMessage}` : ""}`);
      else if (axios.isAxiosError(err) && !err.response) setError("אין חיבור לשרת או שהתשובה התעכבה. נסו שוב.");
      else if (status && status >= 500) setError(`עיבוד התשובה נכשל בשרת.${serverMessage ? ` פרטים: ${serverMessage}` : ""}`);
      else setError(serverMessage || "שליחת השאלה נכשלה. נסו שוב.");
      setQuestion(text);
    } finally {
      setPendingQuestion(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  const copyAnswer = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.answer);
      setCopiedId(message.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("לא ניתן להעתיק את התשובה");
    }
  };

  const bubbleQuestion = {
    alignSelf: "flex-start",
    maxWidth: "80%",
    background: "#EEF2F8",
    borderRadius: `${tokens.radiusLg}px`,
    px: 1.75,
    py: 1.25,
    whiteSpace: "pre-wrap" as const,
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      <Box
        aria-live="polite"
        sx={{ flex: 1, minHeight: 360, maxHeight: "62vh", overflowY: "auto", px: 2.5, py: 2, display: "flex", flexDirection: "column", gap: 2 }}
      >
        {loadingHistory && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: tokens.slate }}>
            <CircularProgress size={16} /> טוען שיחה קודמת…
          </Box>
        )}

        {!loadingHistory && messages.length === 0 && !pendingQuestion && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, py: 2 }}>
            <Typography sx={{ fontWeight: 600 }}>שאלו שאלה על מסמכי התיק</Typography>
            <Typography sx={{ color: tokens.slate }}>
              העוזר קורא את קובצי ה-PDF, ה-Word והתמונות שהועלו לתיק ועונה רק על סמך התוכן שלהם.
            </Typography>
          </Box>
        )}

        {messages.map((m) => (
          <Box key={m.id} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={bubbleQuestion}>{m.question}</Box>
            <Box
              sx={{
                alignSelf: "flex-end",
                maxWidth: "92%",
                border: `1px solid ${tokens.border}`,
                borderRadius: `${tokens.radiusLg}px`,
                px: 1.75,
                py: 1.25,
                lineHeight: 1.65,
                whiteSpace: "pre-wrap",
              }}
            >
              {m.answer}
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mt: 1, color: tokens.muted, fontSize: 12 }}>
                <span>{formatTime(m.createdAt)}</span>
                <Tooltip title={copiedId === m.id ? "הועתק" : "העתקת התשובה"}>
                  <IconButton size="small" aria-label="העתקת התשובה" onClick={() => copyAnswer(m)}>
                    <Copy size={14} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        ))}

        {pendingQuestion && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Box sx={bubbleQuestion}>{pendingQuestion}</Box>
            <Box sx={{ alignSelf: "flex-end", display: "flex", alignItems: "center", gap: 1, color: tokens.slate, px: 1 }}>
              <CircularProgress size={14} /> העוזר קורא את מסמכי התיק…
            </Box>
          </Box>
        )}
        <div ref={endRef} />
      </Box>

      <Box sx={{ px: 2.5, pb: 1.5, display: "flex", flexWrap: "wrap", gap: 1 }}>
        {suggestedQuestions.map((q) => (
          <Button
            key={q}
            size="small"
            variant="outlined"
            onClick={() => sendQuestion(q)}
            disabled={Boolean(pendingQuestion)}
            sx={{ borderRadius: 999, fontWeight: 400, minHeight: 30 }}
          >
            {q}
          </Button>
        ))}
      </Box>

      {error && (
        <Typography role="alert" sx={{ mx: 2.5, mb: 1, px: 1.5, py: 1, border: `1px solid ${tokens.border}`, boxShadow: `inset -3px 0 0 ${tokens.ink}`, borderRadius: `${tokens.radius}px`, fontSize: 13 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end", px: 2.5, py: 1.75, borderTop: `1px solid ${tokens.border}` }}>
        <InputBase
          multiline
          maxRows={5}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="שאלה על מסמכי התיק"
          inputProps={{ "aria-label": "שאלה לעוזר" }}
          sx={{
            flex: 1,
            minHeight: 40,
            px: 1.5,
            py: 1,
            fontSize: 14,
            border: `1px solid ${tokens.borderStrong}`,
            borderRadius: `${tokens.radius}px`,
            "&.Mui-focused": { borderColor: tokens.blue600, boxShadow: `0 0 0 3px rgba(31, 78, 140, 0.15)` },
          }}
        />
        <Button
          variant="contained"
          onClick={() => sendQuestion()}
          disabled={!question.trim() || Boolean(pendingQuestion)}
          startIcon={<Send size={16} />}
        >
          שליחה
        </Button>
      </Box>
      <Typography sx={{ px: 2.5, pb: 1.5, fontSize: 12, color: tokens.muted }}>
        Enter לשליחה · Shift+Enter לשורה חדשה · יש לאמת כל תשובה מול המסמך המקורי
      </Typography>
    </Box>
  );
};

export default Chat;
