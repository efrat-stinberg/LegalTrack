// Opened from a reset link (/#/reset-password?token=...): checks the link, then sets a new password.
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { resetPassword, validateResetToken } from "../api/passwordApi";
import AuthShell from "../components/AuthShell";
import { tokens } from "../theme";

// Same rule as the server: at least 5 characters, with letters and digits
const passwordProblem = (password: string) =>
  password.length < 5 || !/[a-zA-Zא-ת]/.test(password) || !/[0-9]/.test(password)
    ? "הסיסמה חייבת להכיל לפחות 5 תווים, כולל אותיות ומספרים."
    : "";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";

  const [status, setStatus] = useState<"checking" | "valid" | "invalid" | "done">("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    validateResetToken(token)
      .then((data) => {
        setEmail(data.email);
        setStatus("valid");
      })
      .catch(() => setStatus("invalid"));
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const problem = passwordProblem(password) || (password !== confirm ? "הסיסמאות אינן זהות." : "");
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await resetPassword(token, password);
      setStatus("done");
    } catch (err: unknown) {
      // The link expired or was replaced while the page was open
      if (axios.isAxiosError(err) && err.response?.status === 400 && /link/i.test(String(err.response.data))) setStatus("invalid");
      else setError(axios.isAxiosError(err) && !err.response ? "אין חיבור לשרת. נסו שוב." : "שמירת הסיסמה נכשלה. נסו שוב.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "checking") {
    return (
      <AuthShell>
        <Box role="status" sx={{ display: "flex", alignItems: "center", gap: 1.5, color: tokens.slate }}>
          <CircularProgress size={22} />
          <Typography>בודקים את הקישור...</Typography>
        </Box>
      </AuthShell>
    );
  }

  if (status === "invalid" || status === "done") {
    const done = status === "done";
    return (
      <AuthShell>
        <Box role={done ? "status" : "alert"} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box>
            <Typography variant="h1" sx={{ fontSize: 28, mb: 0.5 }}>
              {done ? "הסיסמה עודכנה" : "הקישור אינו תקף"}
            </Typography>
            <Typography sx={{ color: tokens.slate }}>
              {done
                ? "אפשר להתחבר עכשיו עם הסיסמה החדשה."
                : "ייתכן שכבר השתמשו בו, שפג תוקפו, או שנשלח קישור חדש יותר. אפשר לבקש קישור חדש."}
            </Typography>
          </Box>
          <Button variant="contained" size="large" sx={{ minHeight: 44 }} onClick={() => navigate("/login", { replace: true })}>
            להתחברות
          </Button>
          {!done && (
            <Button component={RouterLink} to="/forgot-password" variant="outlined">
              בקשת קישור חדש
            </Button>
          )}
        </Box>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Box component="form" noValidate onSubmit={submit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: 28, mb: 0.5 }}>
            בחירת סיסמה חדשה
          </Typography>
          <Typography sx={{ color: tokens.slate }}>
            עבור <bdi dir="ltr">{email}</bdi>
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" role="alert">
            {error}
          </Alert>
        )}

        <TextField
          type={show ? "text" : "password"}
          label="סיסמה חדשה"
          autoComplete="new-password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText="לפחות 5 תווים, אותיות ומספרים"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShow((s) => !s)} aria-label={show ? "הסתרת הסיסמה" : "הצגת הסיסמה"} edge="end" size="small">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          type={show ? "text" : "password"}
          label="אישור סיסמה"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={Boolean(confirm) && confirm !== password}
          helperText={confirm && confirm !== password ? "הסיסמאות אינן זהות" : " "}
        />

        <Button type="submit" variant="contained" size="large" disabled={saving || !password || !confirm} sx={{ minHeight: 44 }}>
          {saving ? <CircularProgress size={20} sx={{ color: "#FFFFFF" }} /> : "שמירת הסיסמה"}
        </Button>
      </Box>
    </AuthShell>
  );
};

export default ResetPasswordPage;
