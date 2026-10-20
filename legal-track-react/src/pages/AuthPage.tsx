// Sign-in for lawyers. New lawyers join through an invite from their office admin.
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, Link, TextField, Typography } from "@mui/material";
import { Eye, EyeOff, FileText, MessageSquare, Scale, ShieldCheck } from "lucide-react";
import { loginUser, getUserByEmail } from "../api/api";
import { login } from "../store/slices/userSlice";
import { tokens } from "../theme";

// The admin app, where an office registers and invites lawyers
const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_URL || "https://legal-track.onrender.com/#/register-admin";

const features = [
  { icon: <FileText size={18} />, title: "תיקים ומסמכים במקום אחד", text: "לקוחות, תיקים וקובצי PDF מסודרים לפי משרד." },
  { icon: <MessageSquare size={18} />, title: "עוזר AI לכל תיק", text: "שאלות על מסמכי התיק, עם תשובות מתוך התוכן שלהם." },
  { icon: <ShieldCheck size={18} />, title: "הפרדה בין משרדים", text: "כל משרד רואה רק את הנתונים שלו." },
];

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
    } catch (error: any) {
      localStorage.removeItem("token");
      if (error.response?.status === 401) setErrorMessage("האימייל או הסיסמה שגויים.");
      else if (error.response) setErrorMessage("ההתחברות נכשלה. נסו שוב בעוד רגע.");
      else if (error.request) setErrorMessage("אין חיבור לשרת. בדקו את החיבור לאינטרנט ונסו שוב.");
      else setErrorMessage("אירעה שגיאה לא צפויה. נסו שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexWrap: "wrap", background: tokens.ground }}>
      <Box
        component="aside"
        sx={{
          flex: "1 1 420px",
          background: tokens.navy900,
          color: "#C9D3E1",
          px: { xs: 3, md: 7 },
          py: { xs: 4, md: 7 },
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: `${tokens.radius}px`, background: tokens.navy700, border: `1px solid ${tokens.navy500}`, display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF" }}>
            <Scale size={22} aria-hidden="true" />
          </Box>
          <Typography sx={{ fontFamily: tokens.fontDisplay, fontSize: 26, fontWeight: 600, color: "#FFFFFF" }}>LegalTrack</Typography>
        </Box>
        <Box sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", gap: 3, mt: "auto", mb: "auto", maxWidth: 440 }}>
          <Typography sx={{ fontFamily: tokens.fontDisplay, fontSize: 34, fontWeight: 600, color: "#FFFFFF", lineHeight: 1.3 }}>
            ניהול תיקים משפטיים, בסדר ובדיוק.
          </Typography>
          {features.map((f) => (
            <Box key={f.title} sx={{ display: "flex", gap: 1.75 }}>
              <Box sx={{ color: tokens.steel, mt: 0.25 }} aria-hidden="true">
                {f.icon}
              </Box>
              <Box>
                <Typography sx={{ color: "#FFFFFF", fontWeight: 600 }}>{f.title}</Typography>
                <Typography sx={{ color: "#A8B6C9", fontSize: 14 }}>{f.text}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box component="main" sx={{ flex: "1 1 480px", display: "flex", alignItems: "center", justifyContent: "center", px: 3, py: 6 }}>
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 2.5 }}>
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
      </Box>
    </Box>
  );
};

export default Login;
