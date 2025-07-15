import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar,
  IconButton,
  Fade,
  Zoom,
  CircularProgress,
  useTheme,
  alpha,
  Tooltip,
  Chip
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import {
  Send,
  Bot,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Sparkles,
  MessageCircle,
  Clock
} from "lucide-react";

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

const typing = keyframes`
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
`;

const slideUp = keyframes`
  from { 
    opacity: 0; 
    transform: translateY(20px); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0); 
  }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const ChatContainer = styled(Paper)(({ theme }) => ({
  borderRadius: 20,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${alpha(theme.palette.primary.main, 0.02)})`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.1)}`,
  display: 'flex',
  flexDirection: 'column',
  height: 600,
  overflow: 'hidden',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  }
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    borderRadius: '50%',
  }
}));

const BotAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  background: alpha(theme.palette.common.white, 0.2),
  backdropFilter: 'blur(10px)',
  border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
  
  '& svg': {
    color: 'white',
  }
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(2),
  background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.main, 0.02)}, transparent)`,
  
  '&::-webkit-scrollbar': {
    width: 6,
  },
  
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.action.hover, 0.1),
    borderRadius: 3,
  },
  
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.primary.main, 0.3),
    borderRadius: 3,
    
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.5),
    }
  }
}));

const MessageBubble = styled(Box)<{ isUser: boolean }>(({ theme, isUser }) => ({
  maxWidth: '75%',
  marginBottom: theme.spacing(2),
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  animation: `${slideUp} 0.3s ease-out`,
}));

const BubbleContent = styled(Paper)<{ isUser: boolean }>(({ theme, isUser }) => ({
  padding: theme.spacing(2),
  borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
  background: isUser
    ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
    : theme.palette.background.paper,
  color: isUser ? 'white' : theme.palette.text.primary,
  border: `1px solid ${isUser ? 'transparent' : alpha(theme.palette.primary.main, 0.1)}`,
  boxShadow: isUser
    ? `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`
    : `0 4px 16px ${alpha(theme.palette.common.black, 0.1)}`,
  position: 'relative',
  
  '&::before': isUser ? {
    content: '""',
    position: 'absolute',
    top: -20,
    right: -20,
    width: 40,
    height: 40,
    background: `radial-gradient(circle, ${alpha(theme.palette.common.white, 0.1)} 0%, transparent 70%)`,
    borderRadius: '50%',
  } : {},
}));

const MessageActions = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(0.5),
  marginTop: theme.spacing(1),
  opacity: 0,
  transition: 'opacity 0.3s ease',
  
  '.message-container:hover &': {
    opacity: 1,
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  width: 28,
  height: 28,
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  
  '&:hover': {
    background: alpha(theme.palette.primary.main, 0.1),
    transform: 'scale(1.1)',
  }
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: theme.palette.background.paper,
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    background: alpha(theme.palette.background.default, 0.5),
    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    transition: 'all 0.3s ease',
    
    '&:hover': {
      borderColor: alpha(theme.palette.primary.main, 0.4),
      boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
    
    '&.Mui-focused': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
    }
  },
  
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  }
}));

const SendButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  minWidth: 48,
  height: 48,
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  color: 'white',
  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
  },
  
  '&:disabled': {
    background: alpha(theme.palette.action.disabled, 0.12),
    color: theme.palette.action.disabled,
    transform: 'none',
    boxShadow: 'none',
  }
}));

const TypingIndicator = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(2),
  color: theme.palette.text.secondary,
}));

const TypingDot = styled(Box)(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: theme.palette.primary.main,
  animation: `${typing} 1.4s infinite ease-in-out`,
  
  '&:nth-of-type(2)': {
    animationDelay: '0.2s',
  },
  
  '&:nth-of-type(3)': {
    animationDelay: '0.4s',
  }
}));

const EmptyState = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  textAlign: 'center',
}));

const SparkleContainer = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  animation: `${pulse} 2s ease-in-out infinite`,
}));

const Chat: React.FC<ChatProps> = ({ folderId }) => {
  const theme = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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

    const userMessage = question;
    setQuestion("");
    setLoading(true);
    setError(null);
    setIsTyping(true);

    try {
      const res = await fetch(`https://localhost:7042/api/Chat/${folderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to send question");
      }

      const newMessage: ChatMessage = await res.json();
      
      // Simulate typing delay
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [...prev, newMessage]);
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || "Unknown error");
      setIsTyping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ChatContainer elevation={0}>
      <ChatHeader>
        <BotAvatar>
          <Bot size={24} />
        </BotAvatar>
        <Box flex={1}>
          <Typography variant="h6" fontWeight={700}>
            עוזר AI חכם
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            שאל אותי הכל על המסמכים בתיקייה
          </Typography>
        </Box>
        <Chip
          label="מחובר"
          size="small"
          sx={{
            background: alpha(theme.palette.success.main, 0.2),
            color: 'white',
            border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
          }}
        />
      </ChatHeader>

      <MessagesContainer>
        {messages.length === 0 && !isTyping ? (
          <EmptyState>
            <SparkleContainer>
              <Sparkles size={32} color={theme.palette.primary.main} />
            </SparkleContainer>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              התחל שיחה חדשה
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              שאל אותי שאלות על המסמכים בתיקייה וקבל תשובות מדויקות
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" justifyContent="center">
              <Chip label="מה התוכן העיקרי?" size="small" variant="outlined" />
              <Chip label="סכם לי את המסמכים" size="small" variant="outlined" />
              <Chip label="מצא נתונים חשובים" size="small" variant="outlined" />
            </Box>
          </EmptyState>
        ) : (
          <Box display="flex" flexDirection="column">
            {messages.map((message) => (
              <Box key={message.id}>
                {/* User Message */}
                <Box display="flex" justifyContent="flex-end" mb={1}>
                  <MessageBubble isUser={true} className="message-container">
                    <BubbleContent isUser={true} elevation={0}>
                      <Typography variant="body1">
                        {message.question}
                      </Typography>
                    </BubbleContent>
                  </MessageBubble>
                </Box>

                {/* AI Response */}
                <Box display="flex" mb={3} className="message-container">
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 1,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }}
                  >
                    <Bot size={16} color="white" />
                  </Avatar>
                  <Box flex={1}>
                    <MessageBubble isUser={false}>
                      <BubbleContent isUser={false} elevation={0}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {message.answer}
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                          <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                            <Clock size={12} />
                            {formatTime(message.createdAt)}
                          </Typography>
                          <MessageActions>
                            <Tooltip title="העתק">
                              <ActionButton size="small" onClick={() => copyMessage(message.answer)}>
                                <Copy size={14} />
                              </ActionButton>
                            </Tooltip>
                            <Tooltip title="תשובה טובה">
                              <ActionButton size="small">
                                <ThumbsUp size={14} />
                              </ActionButton>
                            </Tooltip>
                            <Tooltip title="תשובה לא טובה">
                              <ActionButton size="small">
                                <ThumbsDown size={14} />
                              </ActionButton>
                            </Tooltip>
                          </MessageActions>
                        </Box>
                      </BubbleContent>
                    </MessageBubble>
                  </Box>
                </Box>
              </Box>
            ))}

            {isTyping && (
              <Fade in={true}>
                <Box display="flex" alignItems="center">
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      mr: 1,
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    }}
                  >
                    <Bot size={16} color="white" />
                  </Avatar>
                  <TypingIndicator>
                    <Typography variant="body2">
                      מכין תשובה...
                    </Typography>
                    <Box display="flex" gap={0.5}>
                      <TypingDot />
                      <TypingDot />
                      <TypingDot />
                    </Box>
                  </TypingIndicator>
                </Box>
              </Fade>
            )}

            <div ref={messagesEndRef} />
          </Box>
        )}
      </MessagesContainer>

      {error && (
        <Box p={2}>
          <Typography color="error" variant="body2" textAlign="center">
            שגיאה: {error}
          </Typography>
        </Box>
      )}

      <InputContainer>
        <Box display="flex" gap={2} alignItems="flex-end">
          <StyledTextField
            label="כתוב שאלה..."
            placeholder="שאל אותי הכל על המסמכים..."
            multiline
            maxRows={3}
            fullWidth
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            variant="outlined"
          />
          <SendButton
            onClick={sendQuestion}
            disabled={loading || !question.trim()}
            sx={{ alignSelf: 'stretch' }}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Send size={20} />
            )}
          </SendButton>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          לחץ Enter לשליחה • Shift+Enter לשורה חדשה
        </Typography>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat;