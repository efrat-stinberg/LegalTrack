
// src/pages/MessagesPage.tsx
import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Badge,
  Chip,
  useTheme,
  alpha,
  Fade,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  MessageSquare,
  Send,
  Search,
  Circle,
  Phone,
  Video,
  MoreHorizontal
} from 'lucide-react';

const PageContainer = styled(Container)(({ theme }) => ({
  padding: theme.spacing(4, 3),
  minHeight: '100vh',
  background: `linear-gradient(145deg, #f8fafc 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
}));

const HeaderSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 20,
  marginBottom: theme.spacing(4),
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  color: 'white',
}));

const ChatContainer = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  overflow: 'hidden',
  height: 600,
  display: 'flex',
  flexDirection: 'column',
}));

const MessagesPage: React.FC = () => {
  const theme = useTheme();
  const [selectedChat, setSelectedChat] = useState<{
    id: number;
    name: string;
    lastMessage: string;
    time: string;
    unread: number;
    online: boolean;
  } | null>(null);
  const [message, setMessage] = useState('');

  const mockChats = [
    {
      id: 1,
      name: 'עו"ד דני כהן',
      lastMessage: 'אני אכין את המסמכים עד מחר',
      time: '10:30',
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: 'משפחת לוי',
      lastMessage: 'תודה על העדכון!',
      time: '09:15',
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: 'חברת ביטוח',
      lastMessage: 'נשלח את הדוח בהקדם',
      time: 'אתמול',
      unread: 1,
      online: true
    }
  ];

  return (
    <PageContainer maxWidth="xl">
      <Fade in={true} timeout={600}>
        <div>
          <HeaderSection elevation={0}>
            <Typography variant="h3" fontWeight={700} gutterBottom>
              הודעות וצ'אט 💬
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              תקשורת מהירה ויעילה עם הלקוחות והעמיתים
            </Typography>
          </HeaderSection>

          <Box display="flex" gap={3} height={600}>
            {/* רשימת צ'אטים */}
            <Paper sx={{ width: 350, borderRadius: 3, p: 2 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <TextField
                  placeholder="חפש שיחות..."
                  size="small"
                  fullWidth
                  InputProps={{
                    startAdornment: <Search size={16} />,
                  }}
                />
              </Box>
              
              <List>
                {mockChats.map((chat) => (
                  <ListItem
                    key={chat.id}
                    component="button"
                    onClick={() => setSelectedChat(chat)}
                    sx={{
                      borderRadius: 2,
                      mb: 1,
                      background: selectedChat?.id === chat.id ? alpha(theme.palette.primary.main, 0.1) : 'transparent'
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          chat.online ? (
                            <Circle size={12} color={theme.palette.success.main} />
                          ) : null
                        }
                      >
                        <Avatar
                          sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                          }}
                        >
                          {chat.name.charAt(0)}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {chat.name}
                          </Typography>
                          {chat.unread > 0 && (
                            <Chip
                              label={chat.unread}
                              size="small"
                              color="primary"
                              sx={{ height: 18, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {chat.lastMessage}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {chat.time}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

            {/* אזור הצ'אט */}
            <ChatContainer sx={{ flex: 1 }}>
              {selectedChat ? (
                <>
                  {/* כותרת הצ'אט */}
                  <Box
                    sx={{
                      p: 2,
                      background: alpha(theme.palette.primary.main, 0.1),
                      borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                  >
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar
                          sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                          }}
                        >
                          {selectedChat.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {selectedChat.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {selectedChat.online ? 'מחובר' : 'לא מחובר'}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" gap={1}>
                        <Button size="small" startIcon={<Phone size={16} />}>
                          שיחה
                        </Button>
                        <Button size="small" startIcon={<Video size={16} />}>
                          וידאו
                        </Button>
                      </Box>
                    </Box>
                  </Box>

                  {/* הודעות */}
                  <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
                    <Box textAlign="center" color="text.secondary">
                      <Typography variant="body2">
                        בחר שיחה כדי להתחיל לשוחח
                      </Typography>
                    </Box>
                  </Box>

                  {/* שדה הודעה */}
                  <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
                    <Box display="flex" gap={2} alignItems="center">
                      <TextField
                        placeholder="כתוב הודעה..."
                        fullWidth
                        multiline
                        maxRows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        variant="outlined"
                        size="small"
                      />
                      <Button
                        variant="contained"
                        endIcon={<Send size={16} />}
                        disabled={!message.trim()}
                      >
                        שלח
                      </Button>
                    </Box>
                  </Box>
                </>
              ) : (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <MessageSquare size={64} color={alpha(theme.palette.primary.main, 0.5)} />
                  <Typography variant="h6" color="text.secondary">
                    בחר שיחה כדי להתחיל
                  </Typography>
                </Box>
              )}
            </ChatContainer>
          </Box>
        </div>
      </Fade>
    </PageContainer>
  );
};

export default MessagesPage;
