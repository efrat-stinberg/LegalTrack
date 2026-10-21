// "Forgot password": asks for the email and sends a reset link. The server answers the same way
// for unknown addresses, so the page never says whether an account exists.
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, CircularProgress, Link, TextField, Typography } from "@mui/material";
import { MailCheck } from "lucide-react";
import { requestPasswordReset } from "../api/passwordApi";
import AuthShell from "../components/AuthShell";
import { tokens } from "../theme";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const emailError = !email ? "יש להזין אימייל" : !emailPattern.test(email) ? "כתובת האימייל לא תקינה" : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (emailError) return;
    setSending(true);
    setError("");
    try {
      await requestPasswordReset(email.trim());
      setSent(true);
    } catch (err: unknown) {
      const hasResponse = typeof err === "object" && err !== null && "response" in err && Boolean((err as { response?: unknown }).response);
      setError(hasResponse ? "שליחת הבקשה נכשלה. נסו שוב בעוד רגע." : "אין חיבור לשרת. בדקו את החיבור לאינטרנט ונסו שוב.");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <AuthShell>
        <Box role="status" sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Box sx={{ color: tokens.navy700, display: "flex" }} aria-hidden="true">
            <MailCheck size={28} />
          </Box>
          <Box>
            <Typography variant="h1" sx={{ fontSize: 28, mb: 0.5 }}>
              בדקו את תיבת המייל
            </Typography>
            <Typography sx={{ color: tokens.slate }}>
              אם הכתובת <bdi dir="ltr">{email.trim()}</bdi> רשומה במערכת, נשלח אליה קישור לבחירת סיסמה חדשה. הקישור תקף לשעה.
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 14, color: tokens.slate }}>
            לא הגיע מייל? בדקו בתיקיית הספאם, או בקשו ממנהל המשרד קישור לאיפוס.
          </Typography>
          <Button component={RouterLink} to="/login" variant="contained" size="large" sx={{ minHeight: 44 }}>
            חזרה להתחברות
          </Button>
        </Box>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <Box component="form" noValidate onSubmit={submit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        <Box>
          <Typography variant="h1" sx={{ fontSize: 28, mb: 0.5 }}>
            שכחתי סיסמה
          </Typography>
          <Typography sx={{ color: tokens.slate }}>נשלח אליך קישור לבחירת סיסמה חדשה</Typography>
        </Box>

        {error && (
          <Alert severity="error" role="alert">
            {error}
          </Alert>
        )}

        <TextField
          label="אימייל"
          type="email"
          autoComplete="email"
          autoFocus
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={touched && Boolean(emailError)}
          helperText={touched ? emailError || " " : " "}
          inputProps={{ dir: "ltr", style: { textAlign: "right" } }}
        />

        <Button type="submit" variant="contained" size="large" disabled={sending} sx={{ minHeight: 44 }}>
          {sending ? <CircularProgress size={20} sx={{ color: "#FFFFFF" }} /> : "שליחת קישור"}
        </Button>

        <Typography sx={{ fontSize: 13, color: tokens.slate, borderTop: `1px solid ${tokens.border}`, pt: 2.5 }}>
          נזכרת?{" "}
          <Link component={RouterLink} to="/login" underline="hover">
            חזרה להתחברות
          </Link>
        </Typography>
      </Box>
    </AuthShell>
  );
};

export default ForgotPasswordPage;
