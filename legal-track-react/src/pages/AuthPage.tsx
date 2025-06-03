// AuthPage.tsx
import { Link } from "react-router-dom";
import Login from "../components/Login";
import { 
  Container, 
  Box, 
  Typography, 
  Paper,
  Divider,
  useTheme,
  alpha
} from "@mui/material";
import { AccountCircle, Description } from "@mui/icons-material";

const AuthPage = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="md">
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 4,
            alignItems: 'center'
          }}
        >
          {/* Left Side - Branding */}
          <Box 
            sx={{ 
              flex: 1, 
              textAlign: 'center',
              color: 'white',
              mb: { xs: 4, md: 0 }
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Description sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />
              <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
                DocManager
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300 }}>
                Organize, Chat, and Collaborate with Your Documents
              </Typography>
            </Box>
            
            <Box sx={{ mt: 4 }}>
              <Typography variant="body1" sx={{ opacity: 0.8, lineHeight: 1.8 }}>
                Upload your documents, organize them in folders, and chat with AI about your content. 
                Experience seamless document management with intelligent conversations.
              </Typography>
            </Box>
          </Box>

          {/* Right Side - Login Form */}
          <Box sx={{ flex: 1, width: '100%', maxWidth: 400 }}>
            <Paper
              elevation={24}
              sx={{
                p: 4,
                borderRadius: 3,
                background: alpha(theme.palette.background.paper, 0.95),
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <AccountCircle 
                  sx={{ 
                    fontSize: 48, 
                    color: theme.palette.primary.main,
                    mb: 1
                  }} 
                />
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                  Welcome Back
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in to access your documents
                </Typography>
              </Box>

              <Login />

              <Divider sx={{ my: 3 }} />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  New users can only be registered by an administrator.
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthPage;
