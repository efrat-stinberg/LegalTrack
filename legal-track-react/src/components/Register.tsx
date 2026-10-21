// Registration from an invite link (/#/register?token=...). Same layout as the sign-in screen.
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { Eye, EyeOff, MailCheck } from "lucide-react";
import { useDispatch } from "react-redux";
import { getUserByEmail, apiClient } from "../api/api";
import { login } from "../store/slices/userSlice";
import { tokens } from "../theme";
import AuthShell from "./AuthShell";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "valid" | "invalid">("loading");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setStatus("invalid");
        setErrorMessage("בקישור חסר קוד הזמנה.");
        return;
      }

      try {
        const response = await apiClient.post("/invite/validate", { token });
        setEmail(response.data.email);
        setStatus("valid");
      } catch (error: unknown) {
        let errorMsg = "ההזמנה לא תקינה או שפג תוקפה.";
        if (axios.isAxiosError(error) && error.response) {
          if (error.response.status === 400) errorMsg = error.response.data?.message || errorMsg;
          else if (error.response.status === 404) errorMsg = "ההזמנה לא נמצאה במערכת.";
          else if (error.response.status === 410) errorMsg = "פג תוקף ההזמנה.";
          else if (typeof error.response.data?.message === "string") errorMsg = error.response.data.message;
        } else if (axios.isAxiosError(error) && error.request) {
          errorMsg = "אין חיבור לשרת. בדקו את החיבור לאינטרנט ונסו שוב.";
        }
        setErrorMessage(errorMsg);
        setStatus("invalid");
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setErrorMessage("יש להזין שם מלא.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("הסיסמאות אינן זהות.");
      return;
    }
    // Same rule as the server: at least 5 characters, with letters and digits
    if (password.length < 5 || !/[a-zA-Zא-ת]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMessage("הסיסמה חייבת להכיל לפחות 5 תווים, כולל אותיות ומספרים.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await apiClient.post("/register", { token, name, password });
      localStorage.setItem("token", JSON.stringify(response.data.token));
      const user = await getUserByEmail(email);
      dispatch(login(user));
      navigate("/home", { replace: true });
    } catch (error: unknown) {
      let errorMsg = "ההרשמה נכשלה. נסו שוב.";
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) errorMsg = "כבר קיים משתמש עם האימייל הזה.";
        else if (typeof error.response.data?.message === "string") errorMsg = error.response.data.message;
        else if (typeof error.response.data === "string" && error.response.data) errorMsg = error.response.data;
      } else if (axios.isAxiosError(error) && error.request) {
        errorMsg = "אין חיבור לשרת. נסו שוב.";
      }
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <AuthShell>
        <Box role="status" sx={{ display: "flex", alignItems: "center", gap: 1.5, color: tokens.slate }}>
          <CircularProgress size={22} />
          <Typography>בודקים את ההזמנה...</Typography>
        </Box>
      </AuthShell>
    );
  }

  if (status === "invalid") {
    return (
      <AuthShell>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography variant="h1" sx={{ fontSize: 28, mb: 0.5 }}>
              לא ניתן להשתמש בהזמנה
            </Typography>
            <Typography sx={{ color: tokens.slate }}>{errorMessage}</Typography>
          </Box>
          <Typography sx={{ fontSize: 14, color: tokens.slate }}>
            בקשו ממנהל המשרד לשלוח הזמנה חדשה. אם כבר נרשמתם, אפשר פשוט להתחבר.
          </Typography>
          <Button variant="contained" size="large" sx={{ minHeight: 44 }} onClick={() => navigate("/login")}>
            למסך ההתחברות
          </Button>
        </Box>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: 28, mb: 0.5 }}>
            השלמת הרשמה
          </Typography>
          <Typography sx={{ color: tokens.slate }}>הוזמנת להצטרף למשרד ב-LegalTrack</Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: 1.75,
            py: 1.25,
            border: `1px solid ${tokens.border}`,
            borderRadius: `${tokens.radius}px`,
            background: tokens.white,
          }}
        >
          <Box sx={{ color: tokens.navy700, display: "flex" }} aria-hidden="true">
            <MailCheck size={18} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 12, color: tokens.slate }}>הזמנה תקפה עבור</Typography>
            <Typography dir="ltr" sx={{ fontWeight: 600, textAlign: "right", overflowWrap: "anywhere" }}>
              {email}
            </Typography>
          </Box>
        </Box>

        {errorMessage && (
          <Alert severity="error" role="alert">
            {errorMessage}
          </Alert>
        )}

        <TextField label="שם מלא" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} />
        <TextField
          type={showPassword ? "text" : "password"}
          label="סיסמה"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          helperText="לפחות 5 תווים, אותיות ומספרים"
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
        <TextField
          type={showPassword ? "text" : "password"}
          label="אישור סיסמה"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
          error={Boolean(confirmPassword) && confirmPassword !== password}
          helperText={confirmPassword && confirmPassword !== password ? "הסיסמאות אינן זהות" : " "}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isLoading || !name || !password || !confirmPassword}
          sx={{ minHeight: 44 }}
        >
          {isLoading ? <CircularProgress size={20} sx={{ color: "#FFFFFF" }} /> : "השלמת הרשמה"}
        </Button>
      </Box>
    </AuthShell>
  );
};

export default Register;
