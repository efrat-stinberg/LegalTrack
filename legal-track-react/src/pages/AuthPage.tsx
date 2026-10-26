// Sign-in for lawyers. New lawyers join through an invite from their office admin.
import { useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, Link, TextField, Typography } from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { loginUser, getUserByEmail } from "../api/api";
import { login } from "../store/slices/userSlice";
import { tokens } from "../theme";
import AuthShell from "../components/AuthShell";

// The admin app, where an office registers and invites lawyers
const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_URL || "https://legal-track.onrender.com/#/register-admin";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const emailError = !email ? "יש להזין אימייל" : !emailPattern.test(email) ? "כתובת האימייל לא תקינה" : "";
  const passwordError = !password ? "יש להזין סיסמה" : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (emailError || passwordError) return;

    setIsLoading(true);
    setErrorMessage("");
    try {
      const token = await loginUser(email, password);
      localStorage.setItem("token", JSON.stringify(token));
      const user = await getUserByEmail(email);
      if (!user || !user.email) throw new Error("Invalid user data received from server");
      dispatch(login(user));
      navigate("/home", { replace: true });
    } catch (error: unknown) {
      localStorage.removeItem("token");
      if (axios.isAxiosError(error) && error.response?.status === 401) setErrorMessage("האימייל או הסיסמה שגויים.");
      else if (axios.isAxiosError(error) && error.response?.status === 429) {
        // Too many failed logins; the server says how long the block lasts
        const minutes = Math.max(1, Math.ceil((error.response.data?.retryAfterSeconds ?? 900) / 60));
        setErrorMessage(`יותר מדי ניסיונות התחברות שגויים. נסו שוב בעוד ${minutes} דקות.`);
      }
      else if (axios.isAxiosError(error) && error.response) setErrorMessage("ההתחברות נכשלה. נסו שוב בעוד רגע.");
      else if (axios.isAxiosError(error) && error.request) setErrorMessage("אין חיבור לשרת. בדקו את החיבור לאינטרנט ונסו שוב.");
      else setErrorMessage("אירעה שגיאה לא צפויה. נסו שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell>
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: 28, mb: 0.5 }}>
            התחברות
          </Typography>
          <Typography sx={{ color: tokens.slate }}>כניסה לאזור העבודה של המשרד</Typography>
        </Box>

        {errorMessage && (
          <Alert severity="error" role="alert">
            {errorMessage}
          </Alert>
        )}

        <TextField
          label="אימייל"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={touched && Boolean(emailError)}
          helperText={touched ? emailError || " " : " "}
          inputProps={{ dir: "ltr", style: { textAlign: "right" } }}
        />
        <TextField
          label="סיסמה"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={touched && Boolean(passwordError)}
          helperText={touched ? passwordError || " " : " "}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "הסתרת הסיסמה" : "הצגת הסיסמה"} edge="end" size="small">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Link component={RouterLink} to="/forgot-password" underline="hover" sx={{ alignSelf: "flex-start", fontSize: 13, mt: -1.5 }}>
          שכחתי סיסמה
        </Link>

        <Button type="submit" variant="contained" size="large" disabled={isLoading} sx={{ minHeight: 44 }}>
          {isLoading ? <CircularProgress size={20} sx={{ color: "#FFFFFF" }} /> : "התחברות"}
        </Button>

        <Box sx={{ borderTop: `1px solid ${tokens.border}`, pt: 2.5, display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Typography sx={{ fontSize: 13, color: tokens.slate }}>עורכי דין מצטרפים דרך הזמנה במייל ממנהל המשרד.</Typography>
          <Typography sx={{ fontSize: 13, color: tokens.slate }}>
            משרד חדש?{" "}
            <Link href={ADMIN_APP_URL} underline="hover">
              רישום משרד ומנהל
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthShell>
  );
};

export default Login;
