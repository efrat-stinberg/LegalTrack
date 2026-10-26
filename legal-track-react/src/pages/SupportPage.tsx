// Help: how the system works, in short answers that match what it actually does.
import React from 'react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import { ChevronDown } from 'lucide-react';
import PageTitle from '../components/layout/PageTitle';
import { tokens } from '../theme';

const faqs = [
  {
    q: 'איך פותחים תיק חדש?',
    a: 'לוחצים על "תיק חדש" בסרגל העליון או בעמוד התיקים, נותנים לתיק שם ובוחרים לקוח. אם הלקוח עוד לא קיים, מוסיפים אותו קודם בעמוד הלקוחות.',
  },
  {
    q: 'איך מעלים מסמכים לתיק?',
    a: 'פותחים את התיק ולוחצים על "העלאת מסמכים". אפשר לבחור כמה קבצים יחד, עד 50MB לקובץ. המסמכים נשמרים בתיק ומופיעים גם בעמוד המסמכים.',
  },
  {
    q: 'על מה עונה העוזר (AI) בתיק?',
    a: 'העוזר קורא את הטקסט של קובצי ה-PDF וה-Word ‏(docx) שבתיק, וגם תמונות (למשל צילום של מסמך) – את הטקסט שבהן מזהה מודל ה-AI. הוא עונה רק על סמך התוכן שלהם. קובצי PDF סרוקים, ללא שכבת טקסט, וקובצי Word ישנים (doc) לא נקראים; אפשר לשמור אותם כ-docx או כתמונה. כדאי לאמת כל תשובה מול המסמך המקורי.',
  },
  {
    q: 'איך מצטרף עורך דין חדש למשרד?',
    a: 'מנהל המשרד שולח הזמנה מאפליקציית הניהול. עורך הדין מקבל קישור במייל (או מהמנהל ישירות), נרשם עם שם וסיסמה ומצטרף אוטומטית למשרד.',
  },
  {
    q: 'מי רואה את התיקים והמסמכים?',
    a: 'רק המשתמשים של אותו משרד. משרד אחר לא יכול לראות לקוחות, תיקים, מסמכים או שיחות עם העוזר.',
  },
  {
    q: 'למה אי אפשר למחוק לקוח?',
    a: 'לקוח שיש לו תיקים לא נמחק, כדי שתיקים לא יימחקו בטעות יחד איתו. מוחקים או מעבירים קודם את התיקים שלו, ואז אפשר למחוק את הלקוח.',
  },
  {
    q: 'שכחתי את הסיסמה. מה עושים?',
    a: 'במסך ההתחברות לוחצים על "שכחתי סיסמה" ומקבלים במייל קישור לבחירת סיסמה חדשה (תקף לשעה). אם המייל לא מגיע, מנהל המשרד יכול ליצור קישור איפוס מאפליקציית הניהול ולהעביר אותו.',
  },
];

const SupportPage: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, maxWidth: 860 }}>
    <PageTitle title="עזרה ותמיכה" subtitle="תשובות קצרות לשאלות נפוצות על העבודה במערכת" />

    <Box sx={{ background: tokens.white, border: `1px solid ${tokens.border}`, borderRadius: `${tokens.radiusLg}px`, overflow: 'hidden' }}>
      {faqs.map((f, i) => (
        <Accordion
          key={f.q}
          disableGutters
          elevation={0}
          square
          sx={{ '&:before': { display: 'none' }, borderTop: i === 0 ? 'none' : `1px solid ${tokens.border}` }}
        >
          <AccordionSummary expandIcon={<ChevronDown size={18} />} sx={{ px: 2.5, minHeight: 56 }}>
            <Typography sx={{ fontWeight: 600 }}>{f.q}</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5 }}>
            <Typography sx={{ color: tokens.slate, lineHeight: 1.7 }}>{f.a}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>

    <Typography sx={{ color: tokens.slate }}>לשאלות על החשבון או על הרשאות במשרד, פנו למנהל המשרד.</Typography>
  </Box>
);

export default SupportPage;
