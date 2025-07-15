import { useState } from 'react';
import { useDispatch } from "react-redux";
import { 
  TextField, 
  Button,  
  Snackbar, 
  Box,
  InputAdornment,
  IconButton,
  Alert
} from "@mui/material";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import { getUserByEmail, loginUser } from "../api/api";
import { login } from "../store/slices/userSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      console.log('Login: Starting login process for:', email);
      
      // שלב 1: התחברות וקבלת טוקן
      const token = await loginUser(email, password);
      console.log('Login: Token received successfully');
      
      // שלב 2: שמירת הטוקן
      localStorage.setItem('token', JSON.stringify(token));
      console.log('Login: Token saved to localStorage');
      
      // שלב 3: קבלת נתוני המשתמש
      console.log('Login: Fetching user data for:', email);
      const user = await getUserByEmail(email);
      console.log('Login: User data received:', user);
      
      // וידוא שיש נתונים בסיסיים
      if (!user || !user.email) {
        throw new Error('Invalid user data received from server');
      }
      
      // שלב 4: עדכון Redux state
      console.log('Login: Updating Redux state with user:', user);
      dispatch(login(user));
      
      // שלב 5: המתנה קצרה לוודא שה-state התעדכן
      setTimeout(() => {
        console.log('Login: Navigating to folders page...');
        navigate("/folders", { replace: true });
      }, 100);
      
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // הצגת שגיאה מפורטת יותר
      let errorMsg = "Login failed. Please check your credentials.";
      
      if (error.response) {
        // שגיאה מהשרת
        errorMsg = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // בעיית רשת
        errorMsg = "Network error. Please check your connection.";
      } else {
        // שגיאה אחרת
        errorMsg = error.message || "Unknown error occurred.";
      }
      
      setErrorMessage(errorMsg);
      setOpenSnackbar(true);
      
      // ניקוי טוקן במקרה של שגיאה
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <TextField
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          margin="normal"
          variant="outlined"
          disabled={isLoading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Email color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />

        <TextField
          type={showPassword ? "text" : "password"}
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          margin="normal"
          variant="outlined"
          disabled={isLoading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="action" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={togglePasswordVisibility} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            }
          }}
        />

        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          fullWidth
          size="large"
          disabled={isLoading || !email.trim() || !password.trim()}
          sx={{ 
            mt: 3, 
            mb: 2,
            borderRadius: 2,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 600,
            textTransform: 'none'
          }}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;