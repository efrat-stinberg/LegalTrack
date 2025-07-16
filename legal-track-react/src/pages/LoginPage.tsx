/* Fixed version of LandingPage.tsx */

import React, { useState } from 'react';
import {
  Scale,
  FileText,
  Users,
  Shield,
  MessageSquare,
  ArrowRight,
  Star,
  Menu,
  X,
  Github,
  Twitter,
  Linkedin,
  BarChart3,
  Cloud,
  HeartHandshake
} from 'lucide-react';

// CSS styles (restored)
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)',
    color: '#f0f6fc',
    position: 'relative' as const,
    overflow: 'hidden' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  backgroundOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 20%, rgba(56, 189, 248, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(34, 197, 94, 0.05) 0%, transparent 50%)
    `,
    pointerEvents: 'none' as const,
  },
  section: {
    padding: '6rem 2rem',
  },
  sectionContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  ctaSection: {
    background: 'rgba(33, 38, 45, 0.3)',
  },
  ctaContent: {
    textAlign: 'center' as const,
    padding: '4rem 2rem',
    background: 'rgba(33, 38, 45, 0.6)',
    borderRadius: '16px',
    border: '1px solid rgba(56, 189, 248, 0.2)',
    maxWidth: '800px',
    margin: '0 auto',
  },
  ctaTitle: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: '#f0f6fc',
  },
  ctaSubtitle: {
    fontSize: '1.25rem',
    color: '#8b949e',
    marginBottom: '2rem',
  },
  ctaButtons: {
    display: 'flex',
    gap: '1.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  primaryButton: {
    padding: '0.75rem 2rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #238636, #2ea043)',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  secondaryButton: {
    padding: '0.75rem 2rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 600,
    background: 'transparent',
    color: '#f0f6fc',
    border: '1px solid #30363d',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
};

const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    { icon: <FileText size={32} />, title: 'ניהול מסמכים חכם', description: 'ארגון אוטומטי של מסמכים עם חיפוש מתקדם ותיוג חכם', color: '#38bdf8' },
    { icon: <MessageSquare size={32} />, title: 'צ\'אט AI מתקדם', description: 'שיחה חכמה עם המסמכים שלך - שאל שאלות וקבל תשובות מיידיות', color: '#8b5cf6' },
    { icon: <Users size={32} />, title: 'ניהול לקוחות', description: 'מעקב מלא אחר לקוחות, תיקים וסטטוס הטיפול', color: '#ec4899' },
    { icon: <Shield size={32} />, title: 'אבטחה מתקדמת', description: 'הגנה מלאה על נתונים רגישים עם הצפנה ברמת הבנקים', color: '#10b981' },
    { icon: <BarChart3 size={32} />, title: 'דוחות ואנליטיקה', description: 'תובנות חכמות על הביצועים והפעילות שלך', color: '#f59e0b' },
    { icon: <Cloud size={32} />, title: 'נגישות מכל מקום', description: 'גישה מאובטחת מכל מכשיר ובכל זמן', color: '#06b6d4' }
  ];

  const stats = [
    { number: '1,000+', label: 'תיקים פעילים' },
    { number: '50,000+', label: 'מסמכים' },
    { number: '99.9%', label: 'זמינות' },
    { number: '24/7', label: 'תמיכה' }
  ];

  const testimonials = [
    { name: 'עו"ד דניאל כהן', role: 'משרד עורכי דין כהן ושות\'', content: 'המערכת שינתה לחלוטין את הדרך בה אנו מנהלים תיקים. החיסכון בזמן והיעילות המוגברת הם מדהימים.', avatar: 'ד', rating: 5 },
    { name: 'עו"ד שרה לוי', role: 'עורכת דין עצמאית', content: 'הצ\'אט עם AI הוא פריצת דרך אמיתית. אני יכולה למצוא מידע בתיקים תוך שניות במקום דקות.', avatar: 'ש', rating: 5 },
    { name: 'עו"ד מיכאל גרין', role: 'ראש מחלקה משפטית', content: 'הרמת האבטחה והאמינות של המערכת מאפשרת לנו לעבוד בביטחון מלא עם מידע רגיש.', avatar: 'מ', rating: 5 }
  ];

  const handleGetStarted = () => {
    window.location.href = '/login';
  };

  const handleLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div style={styles.container}>
<style>{`/* put your CSS animations here */`}</style>
<div style={styles.backgroundOverlay} />
      {/* Header remains unchanged */}
      {/* Mobile Menu remains unchanged */}
      {/* Hero Section remains unchanged */}
      {/* Features Section remains unchanged */}
      {/* Testimonials Section remains unchanged */}

      {/* CTA Section - FIXED (only once) */}
      <section style={{ ...styles.section, ...styles.ctaSection }}>
        <div style={styles.sectionContent}>
          <div style={styles.ctaContent}>
            <h2 style={styles.ctaTitle}>מוכנים להתחיל?</h2>
            <p style={styles.ctaSubtitle}>הצטרפו לאלפי עורכי דין שכבר משתמשים במערכת החכמה שלנו</p>
            <div style={styles.ctaButtons} className="cta-buttons">
              <button style={styles.primaryButton} className="primary-button" onClick={handleGetStarted}>
                התחל עכשיו בחינם
                <ArrowRight size={20} />
              </button>
              <button style={styles.secondaryButton} className="secondary-button">
                דבר עם מומחה
                <MessageSquare size={20} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer remains unchanged */}
    </div>
  );
};

export default LandingPage;
