import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";

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

const Chat: React.FC<ChatProps> = ({ folderId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!folderId) return;

    fetch(`https://localhost:7042/api/Chat/${folderId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load chat history");
        return res.json();
      })
      .then((data: ChatMessage[]) => setMessages(data))
      .catch((err) => setError(err.message));
  }, [folderId]);

  const sendQuestion = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://localhost:7042/api/Chat/${folderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to send question");
      }

      const newMessage: ChatMessage = await res.json();
      setMessages((prev) => [...prev, newMessage]);
      setQuestion("");
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 3,
        maxWidth: 600,
        bgcolor: "#ffffff",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        display: "flex",
        flexDirection: "column",
        height: 550,
      }}
    >
      <Typography
        variant="h6"
        fontWeight="bold"
        gutterBottom
        sx={{ pb: 1, borderBottom: "1px solid #eee" }}
      >
        Folder Chat
      </Typography>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          p: 2,
          mb: 1,
          bgcolor: "#f7f9fc",
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          scrollbarWidth: "thin",
          scrollbarColor: "#c1c1c1 transparent",

          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#c1c1c1",
            borderRadius: "3px",
          },
        }}
      >
        {messages.length === 0 && (
          <Typography color="textSecondary" textAlign="center" sx={{ mt: 4 }}>
            No messages yet.
          </Typography>
        )}

        {messages.map((m) => (
          <Box key={m.id} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* User question bubble aligned right */}
            <Box
              sx={{
                alignSelf: "flex-end",
                bgcolor: "#1976d2",
                color: "white",
                p: 1.8,
                borderRadius: "18px 18px 0 18px",
                maxWidth: "75%",
                whiteSpace: "pre-wrap",
                boxShadow: "0 2px 6px rgba(25, 118, 210, 0.3)",
              }}
            >
              <Typography variant="body2">{m.question}</Typography>
            </Box>

            {/* AI answer bubble aligned left */}
            <Box
              sx={{
                alignSelf: "flex-start",
                bgcolor: "#e3f2fd",
                color: "#0d47a1",
                p: 1.8,
                borderRadius: "18px 18px 18px 0",
                maxWidth: "75%",
                whiteSpace: "pre-wrap",
                boxShadow: "0 2px 6px rgba(3, 169, 244, 0.2)",
              }}
            >
              <Typography variant="body2">{m.answer}</Typography>
              <Typography
                variant="caption"
                color="textSecondary"
                sx={{ mt: 0.5, fontSize: 11, fontStyle: "italic" }}
              >
                {new Date(m.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        ))}

        <div ref={messagesEndRef} />
      </Box>

      {error && (
        <Typography color="error" mb={2} sx={{ textAlign: "center" }}>
          Error: {error}
        </Typography>
      )}

      <TextField
        label="Type your question..."
        placeholder="Ask something..."
        multiline
        rows={3}
        fullWidth
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        disabled={loading}
        sx={{ mb: 2 }}
        inputProps={{ style: { fontSize: 14 } }}
      />
      <Button
        variant="contained"
        fullWidth
        onClick={sendQuestion}
        disabled={loading || !question.trim()}
        sx={{ fontWeight: "bold", py: 1.5 }}
      >
        {loading ? "Sending..." : "Send"}
      </Button>
    </Paper>
  );
};

export default Chat;
