// Layout shared by the sign-in and invite-registration screens: navy brand panel + form column.
import type { ReactNode } from "react";
import { Box, Typography } from "@mui/material";
import { FileText, MessageSquare, Scale, ShieldCheck } from "lucide-react";
import { tokens } from "../theme";

const features = [
  { icon: <FileText size={18} />, title: "תיקים ומסמכים במקום אחד", text: "לקוחות, תיקים וקובצי PDF מסודרים לפי משרד." },
  { icon: <MessageSquare size={18} />, title: "עוזר AI לכל תיק", text: "שאלות על מסמכי התיק, עם תשובות מתוך התוכן שלהם." },
  { icon: <ShieldCheck size={18} />, title: "הפרדה בין משרדים", text: "כל משרד רואה רק את הנתונים שלו." },
];

const AuthShell = ({ children }: { children: ReactNode }) => (
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
      <Box sx={{ width: "100%", maxWidth: 400 }}>{children}</Box>
    </Box>
  </Box>
);

export default AuthShell;
