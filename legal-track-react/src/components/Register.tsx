import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { TextField, Button, Snackbar, Box, Alert, Typography, Paper, Avatar, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import { UserPlus, Shield, CheckCircle } from "lucide-react";
import { getUserByEmail, apiClient } from "../api/api";
import { login } from "../store/slices/userSlice";
import { useDispatch } from "react-redux";

const RegisterContainer = styled(Paper)(({ theme }) => ({
  maxWidth: 500,
  margin: '0 auto',
  marginTop: theme.spacing(8),
  padding: theme.spacing(4),
  borderRadius: 20,
  background: `linear-gradient(145deg, ${theme.palette.background.paper}, ${theme.palette.primary.main}08)`,
  border: `1px solid ${theme.palette.primary.main}20`,
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 64,
  height: 64,
  margin: '0 auto',
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
}));

const Register = () => {
  console.log('=== REGISTER COMPONENT MOUNTED ===');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  console.log('Register component rendered');
  console.log('Search params:', Object.fromEntries(searchParams.entries()));
  console.log('Token from URL:', token);
  console.log('Current URL:', window.location.href);
  
  const [, setGroupId] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        console.error('No token provided in URL');
        console.log('Current URL:', window.location.href);
        console.log('Search params:', Object.fromEntries(searchParams.entries()));
        setStatus("invalid");
        setErrorMessage("לא נמצא טוקן בקישור");
        return;
      }

      try {
        console.log('Validating token:', token);
        console.log('Full URL:', window.location.href);
        
        // קריאה ל-API עם הטוקן
        const response = await apiClient.post("/invite/validate", { token });
        
        console.log('Token validation response:', response.data);
        
        setGroupId(response.data.groupId);
        setEmail(response.data.email);
        setStatus("valid");
        
      } catch (error: any) {
        console.error('Token validation failed:', error);
        
        let errorMsg = "הטוקן לא תקין או שפג תוקפו";
        
        if (error.response) {
          console.error('API Error Response:', error.response.data);
          errorMsg = error.response.data?.message || error.response.data || errorMsg;
        } else if (error.request) {
          console.error('Network Error:', error.request);
          errorMsg = "שגיאת חיבור לשרת. אנא בדוק את החיבור לאינטרנט.";
        }
        
        setErrorMessage(errorMsg);
        setStatus("invalid");
      }
    };

    validateToken();
  }, [token, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setErrorMessage("הסיסמאות אינן תואמות");
      setOpenSnackbar(true);
      return;
    }

    if (password.length < 6) {
      setErrorMessage("הסיסמה חייבת להכיל לפחות 6 תווים");
      setOpenSnackbar(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      console.log('Submitting registration:', { token, name, password: '***' });
      
      const response = await apiClient.post("/register", { 
        token, 
        name, 
        password 
      });
      
      console.log('Registration response:', response.data);
      
      const tokenValue = response.data.token;

      // Save token to localStorage
      localStorage.setItem("token", JSON.stringify(tokenValue));

      // Fetch user and dispatch login
      const user = await getUserByEmail(email);
      dispatch(login(user));

      navigate("/home", { replace: true });
      
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMsg = "נכשלה ההרשמה. אנא נסה שוב.";
      
      if (error.response) {
        errorMsg = error.response.data?.message || error.response.data || errorMsg;
      } else if (error.request) {
        errorMsg = "שגיאת חיבור לשרת. אנא נסה שוב.";
      }
      
      setErrorMessage(errorMsg);
      setOpenSnackbar(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  if (status === "loading") {
    return (
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body1" color="text.secondary">
          בודק טוקן הזמנה...
        </Typography>
      </Box>
    );
  }
  
  if (status === "invalid") {
    return (
      <RegisterContainer elevation={3}>
        <Box textAlign="center">
          <StyledAvatar>
            <Shield size={32} />
          </StyledAvatar>
          
          <Typography variant="h5" fontWeight={700} gutterBottom color="error">
            טוקן לא תקין
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {errorMessage || "הטוקן לא תקין או שפג תוקפו"}
          </Typography>
          
          <Button 
            variant="outlined" 
            onClick={() => navigate('/login')}
            fullWidth
          >
            חזור לעמוד הכניסה
          </Button>
        </Box>
      </RegisterContainer>
    );
  }

  return (
    <RegisterContainer elevation={3}>
      <Box textAlign="center" mb={4}>
        <StyledAvatar>
          <UserPlus size={32} />
        </StyledAvatar>
        
        <Typography variant="h4" fontWeight={700} gutterBottom>
          השלמת רישום
        </Typography>
        
        <Typography variant="body1" color="text.secondary">
          ברוכים הבאים! אנא השלימו את פרטי הרישום
        </Typography>
        
        <Box display="flex" alignItems="center" justifyContent="center" gap={1} mt={2}>
          <CheckCircle size={16} color="green" />
          <Typography variant="body2" color="success.main">
            הזמנה תקפה עבור: {email}
          </Typography>
        </Box>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          label="שם מלא"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
          margin="normal"
          variant="outlined"
          disabled={isLoading}
          sx={{ mb: 2 }}
        />
        
        <TextField
          label="אימייל"
          value={email}
          disabled
          fullWidth
          margin="normal"
          variant="outlined"
          sx={{ mb: 2 }}
        />
        
        <TextField
          type="password"
          label="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          margin="normal"
          variant="outlined"
          disabled={isLoading}
          sx={{ mb: 2 }}
          helperText="לפחות 6 תווים"
        />
        
        <TextField
          type="password"
          label="אישור סיסמה"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
          margin="normal"
          variant="outlined"
          disabled={isLoading}
          sx={{ mb: 3 }}
        />
        
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isLoading || !name || !password || !confirmPassword}
          sx={{
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          {isLoading ? (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={20} color="inherit" />
              רושם...
            </Box>
          ) : (
            "השלם רישום"
          )}
        </Button>
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: "100%" }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </RegisterContainer>
  );
};

export default Register;