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
  CircularProgress,
  useTheme,
  alpha,
  Tooltip,
  Chip,
  Divider,
  Card,
  CardContent
} from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import {
  Send,
  Bot,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Clock,
  Zap,
  MessageSquare,
  FileText,
  Search,
  Brain
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
  height: 700, // גובה מוגדל
  overflow: 'hidden',
  position: 'relative',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
  }
}));

const ChatHeader = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
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
  width: 52,
  height: 52,
  background: alpha(theme.palette.common.white, 0.2),
  backdropFilter: 'blur(10px)',
  border: `2px solid ${alpha(theme.palette.common.white, 0.3)}`,
  fontSize: '1.5rem',
  
  '& svg': {
    color: 'white',
  }
}));

const MessagesContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  padding: theme.spacing(3),
  background: `linear-gradient(to bottom, ${alpha(theme.palette.info.main, 0.02)}, transparent)`,
  
  '&::-webkit-scrollbar': {
    width: 8,
  },
  
  '&::-webkit-scrollbar-track': {
    background: alpha(theme.palette.action.hover, 0.1),
    borderRadius: 4,
  },
  
  '&::-webkit-scrollbar-thumb': {
    background: alpha(theme.palette.info.main, 0.3),
    borderRadius: 4,
    
    '&:hover': {
      background: alpha(theme.palette.info.main, 0.5),
    }
  }
}));

const MessageBubble = styled(Box)<{ isUser: boolean }>(({ theme, isUser }) => ({
  maxWidth: '70%', // רוחב מותאם לצ'אט הרחב יותר
  marginBottom: theme.spacing(3),
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  animation: `${slideUp} 0.3s ease-out`,
}));

const BubbleContent = styled(Paper)<{ isUser: boolean }>(({ theme, isUser }) => ({
  padding: theme.spacing(2.5),
  borderRadius: isUser ? '24px 24px 8px 24px' : '24px 24px 24px 8px',
  background: isUser
    ? `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`
    : theme.palette.background.paper,
  color: isUser ? 'white' : theme.palette.text.primary,
  border: `1px solid ${isUser ? 'transparent' : alpha(theme.palette.info.main, 0.1)}`,
  boxShadow: isUser
    ? `0 12px 32px ${alpha(theme.palette.info.main, 0.3)}`
    : `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
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
  gap: theme.spacing(1),
  marginTop: theme.spacing(2),
  opacity: 0,
  transition: 'opacity 0.3s ease',
  
  '.message-container:hover &': {
    opacity: 1,
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  width: 32,
  height: 32,
  background: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
  borderRadius: 8,
  
  '&:hover': {
    background: alpha(theme.palette.info.main, 0.1),
    transform: 'scale(1.1)',
    borderColor: alpha(theme.palette.info.main, 0.4),
  }
}));

const InputContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: theme.palette.background.paper,
  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 20,
    background: alpha(theme.palette.background.default, 0.5),
    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
    transition: 'all 0.3s ease',
    
    '&:hover': {
      borderColor: alpha(theme.palette.info.main, 0.4),
      boxShadow: `0 4px 16px ${alpha(theme.palette.info.main, 0.1)}`,
    },
    
    '&.Mui-focused': {
      borderColor: theme.palette.info.main,
      boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.2)}`,
    }
  },
  
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  }
}));

const SendButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  minWidth: 56,
  height: 56,
  background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
  color: 'white',
  boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.3)}`,
  transition: 'all 0.3s ease',
  
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.info.main, 0.4)}`,
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
  gap: theme.spacing(2),
  padding: theme.spacing(2.5),
  color: theme.palette.text.secondary,
}));

const TypingDot = styled(Box)(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  background: theme.palette.info.main,
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
  padding: theme.spacing(6),
  textAlign: 'center',
}));

const SparkleContainer = styled(Box)(({ theme }) => ({
  width: 100,
  height: 100,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)}, ${alpha(theme.palette.info.dark, 0.1)})`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
  animation: `${pulse} 2s ease-in-out infinite`,
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
}));

const SuggestedQuestions = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: theme.spacing(2),
  marginTop: theme.spacing(3),
  width: '100%',
}));

const QuestionCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
  borderRadius: 16,
  
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 32px ${alpha(theme.palette.info.main, 0.15)}`,
    borderColor: alpha(theme.palette.info.main, 0.4),
  }
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

    fetch(`https://legaltrack-server.onrender.com/api/Chat/${folderId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load chat history");
        return res.json();
      })
      .then((data: ChatMessage[]) => setMessages(data))
      .catch((err) => setError(err.message));
  }, [folderId]);

  const sendQuestion = async (questionText?: string) => {
    const userMessage = questionText || question;
    if (!userMessage.trim()) return;

    setQuestion("");
    setLoading(true);
    setError(null);
    setIsTyping(true);

    try {
      const res = await fetch(`https://legaltrack-server.onrender.com/api/Chat/${folderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to send question");
      }

      const newMessage: ChatMessage = await res.json();
      
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

  const suggestedQuestions = [
    "מה התוכן העיקרי של המסמכים?",
    "סכם לי את המידע החשוב",
    "איזה תאריכים מופיעים במסמכים?",
    "מה הנקודות המרכזיות לתשומת לב?"
  ];

  return (
    <ChatContainer elevation={0}>
      <ChatHeader>
        <BotAvatar>
          <Brain size={28} />
        </BotAvatar>
        <Box flex={1}>
          <Typography variant="h6" fontWeight={700}>
            עוזר AI מתקדם
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            שאל אותי הכל על המסמכים שלך - אני כאן לעזור!
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <Chip
            label="מחובר"
            size="small"
            sx={{
              background: alpha(theme.palette.success.main, 0.2),
              color: 'white',
              border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
            }}
            icon={<Zap size={14} />}
          />
          <Chip
            label={`${messages.length} שיחות`}
            size="small"
            sx={{
              background: alpha('#ffffff', 0.2),
              color: 'white',
              border: `1px solid ${alpha('#ffffff', 0.3)}`,
            }}
            icon={<MessageSquare size={14} />}
          />
        </Box>
      </ChatHeader>

      <MessagesContainer>
        {messages.length === 0 && !isTyping ? (
          <EmptyState>
            <SparkleContainer>
              <Sparkles size={40} color={theme.palette.info.main} />
            </SparkleContainer>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              בוא נתחיל לשוחח! 🚀
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400 }}>
              אני כאן לעזור לך להבין ולנתח את המסמכים בתיקייה. 
              שאל אותי שאלות ואקבל תשובות מדויקות מתוך התוכן.
            </Typography>
            
            <Typography variant="h6" fontWeight={600} gutterBottom color="info.main">
              שאלות מוצעות:
            </Typography>
            <SuggestedQuestions>
              {suggestedQuestions.map((q, index) => (
                <QuestionCard key={index} onClick={() => sendQuestion(q)}>
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <FileText size={16} color={theme.palette.info.main} />
                      <Typography variant="body2" fontWeight={600}>
                        {q}
                      </Typography>
                    </Box>
                  </CardContent>
                </QuestionCard>
              ))}
            </SuggestedQuestions>
          </EmptyState>
        ) : (
          <Box display="flex" flexDirection="column" gap={2}>
            {messages.map((message) => (
              <Box key={message.id}>
                {/* User Message */}
                <Box display="flex" justifyContent="flex-end" mb={2}>
                  <MessageBubble isUser={true} className="message-container">
                    <BubbleContent isUser={true} elevation={0}>
                      <Typography variant="body1">
                        {message.question}
                      </Typography>
                      <Box display="flex" alignItems="center" justifyContent="flex-end" mt={1}>
                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                          {formatTime(message.createdAt)}
                        </Typography>
                      </Box>
                    </BubbleContent>
                  </MessageBubble>
                </Box>

                {/* AI Response */}
                <Box display="flex" mb={4} className="message-container">
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      mr: 2,
                      background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                    }}
                  >
                    <Bot size={18} color="white" />
                  </Avatar>
                  <Box flex={1}>
                    <MessageBubble isUser={false}>
                      <BubbleContent isUser={false} elevation={0}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                          {message.answer}
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                          <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                            <Clock size={12} />
                            {formatTime(message.createdAt)}
                          </Typography>
                          <MessageActions>
                            <Tooltip title="העתק תשובה">
                              <ActionButton size="small" onClick={() => copyMessage(message.answer)}>
                                <Copy size={14} />
                              </ActionButton>
                            </Tooltip>
                            <Tooltip title="תשובה מועילה">
                              <ActionButton size="small">
                                <ThumbsUp size={14} />
                              </ActionButton>
                            </Tooltip>
                            <Tooltip title="תשובה לא מועילה">
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
                      width: 36,
                      height: 36,
                      mr: 2,
                      background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                    }}
                  >
                    <Bot size={18} color="white" />
                  </Avatar>
                  <TypingIndicator>
                    <Typography variant="body2" fontWeight={500}>
                      AI חושב ומנתח...
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
            ⚠️ שגיאה: {error}
          </Typography>
        </Box>
      )}

      <Divider />

      <InputContainer>
        <Box display="flex" gap={2} alignItems="flex-end">
          <StyledTextField
            label="כתוב שאלה לעוזר AI..."
            placeholder="למשל: מה התוכן העיקרי של המסמכים?"
            multiline
            maxRows={4}
            fullWidth
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <Search size={20} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />
              ),
            }}
          />
          <SendButton
            onClick={() => sendQuestion()}
            disabled={loading || !question.trim()}
            sx={{ alignSelf: 'flex-end' }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <Send size={24} />
            )}
          </SendButton>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block', textAlign: 'center' }}>
          💡 Enter לשליחה • Shift+Enter לשורה חדשה • AI מנתח את כל המסמכים בתיקייה
        </Typography>
      </InputContainer>
    </ChatContainer>
  );
};

export default Chat;