// LegalTrack design system: navy, steel blue and neutral grays only.
// Statuses are told apart by icon and wording, not by green/orange/red.
import { createTheme, alpha } from '@mui/material/styles';

export const tokens = {
  navy900: '#0F1E33',
  navy700: '#1B3355',
  navy500: '#2A4870',
  blue600: '#1F4E8C',
  steel: '#6F8FB8',
  ink: '#1A1F2B',
  slate: '#4A5363',
  muted: '#5B6472',
  borderStrong: '#C9CFD8',
  border: '#E3E6EB',
  borderSoft: '#EEF0F3',
  ground: '#F6F7F9',
  hover: '#F3F6FA',
  white: '#FFFFFF',
  fontUi: "'Heebo', system-ui, -apple-system, 'Segoe UI', sans-serif",
  fontDisplay: "'Frank Ruhl Libre', 'Heebo', serif",
  radiusSm: 4,
  radius: 6,
  radiusLg: 8,
  shadowMenu: '0 4px 12px rgba(15, 30, 51, 0.10), 0 0 0 1px rgba(15, 30, 51, 0.06)',
  shadowDialog: '0 16px 40px rgba(15, 30, 51, 0.18), 0 0 0 1px rgba(15, 30, 51, 0.06)',
};

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: { main: tokens.navy700, dark: tokens.navy900, light: tokens.navy500, contrastText: tokens.white },
    secondary: { main: tokens.navy900, dark: '#09152A', light: tokens.navy700, contrastText: tokens.white },
    info: { main: tokens.blue600 },
    success: { main: tokens.navy700 },
    warning: { main: tokens.slate },
    error: { main: tokens.ink },
    text: { primary: tokens.ink, secondary: tokens.slate },
    background: { default: tokens.ground, paper: tokens.white },
    divider: tokens.border,
  },
  shape: { borderRadius: tokens.radius },
  typography: {
    fontFamily: tokens.fontUi,
    fontSize: 14,
    h1: { fontFamily: tokens.fontDisplay, fontWeight: 600, fontSize: '2rem', color: tokens.navy900 },
    h2: { fontFamily: tokens.fontDisplay, fontWeight: 600, fontSize: '1.75rem', color: tokens.navy900 },
    h3: { fontFamily: tokens.fontDisplay, fontWeight: 600, fontSize: '1.875rem', color: tokens.navy900 },
    h4: { fontFamily: tokens.fontDisplay, fontWeight: 600, fontSize: '1.5rem', color: tokens.navy900 },
    h5: { fontWeight: 600, fontSize: '1.125rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    subtitle1: { fontWeight: 500 },
    body1: { fontSize: '0.875rem', lineHeight: 1.55 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.5 },
    caption: { fontSize: '0.75rem' },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: tokens.ground },
      },
    },
    MuiButtonBase: { defaultProps: { disableRipple: true } },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: tokens.radius,
          minHeight: 40,
          paddingInline: 16,
          boxShadow: 'none',
          transform: 'none',
          '&:hover': { boxShadow: 'none', transform: 'none' },
          '&.Mui-focusVisible': { outline: `3px solid ${alpha(tokens.blue600, 0.35)}`, outlineOffset: 2 },
        },
        sizeSmall: { minHeight: 32, paddingInline: 10 },
        // Logical margins so icons sit correctly in right-to-left layouts
        startIcon: { marginLeft: 0, marginRight: 0, marginInlineStart: -2, marginInlineEnd: 8 },
        endIcon: { marginLeft: 0, marginRight: 0, marginInlineStart: 8, marginInlineEnd: -2 },
        containedPrimary: {
          background: tokens.navy700,
          '&:hover': { background: tokens.navy900 },
        },
        outlined: {
          borderColor: tokens.borderStrong,
          color: tokens.ink,
          background: tokens.white,
          '&:hover': { borderColor: tokens.slate, background: tokens.ground },
        },
        text: { color: tokens.blue600 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius,
          '&:hover': { background: tokens.ground },
          '&.Mui-focusVisible': { outline: `3px solid ${alpha(tokens.blue600, 0.35)}` },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { backgroundImage: 'none' } },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.border}`,
          borderRadius: tokens.radiusLg,
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: tokens.radiusSm, fontWeight: 500 },
        filled: { background: tokens.borderSoft, color: tokens.slate },
        outlined: { borderColor: tokens.border, color: tokens.ink },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius,
          background: tokens.white,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.borderStrong },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tokens.slate },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: tokens.blue600, borderWidth: 1 },
          '&.Mui-focused': { boxShadow: `0 0 0 3px ${alpha(tokens.blue600, 0.15)}` },
        },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { color: tokens.slate } } },
    MuiFormHelperText: { styleOverrides: { root: { marginInline: 0 } } },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: tokens.radiusLg, boxShadow: tokens.shadowDialog, backgroundImage: 'none' },
      },
    },
    MuiDialogTitle: { styleOverrides: { root: { fontWeight: 600, fontSize: '1.125rem', color: tokens.navy900 } } },
    MuiMenu: {
      styleOverrides: { paper: { borderRadius: tokens.radiusLg, boxShadow: tokens.shadowMenu } },
    },
    MuiPopover: {
      styleOverrides: { paper: { borderRadius: tokens.radiusLg, boxShadow: tokens.shadowMenu } },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { background: tokens.navy900, fontSize: '0.75rem', borderRadius: tokens.radiusSm } },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius,
          border: `1px solid ${tokens.border}`,
          background: tokens.white,
          color: tokens.ink,
          boxShadow: tokens.shadowMenu,
        },
        filled: { background: tokens.navy900, color: tokens.white, border: 'none' },
        icon: { color: `${tokens.navy700} !important` },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: { boxShadow: tokens.shadowMenu, '&:hover': { transform: 'none' } },
        primary: { background: tokens.navy700, '&:hover': { background: tokens.navy900 } },
      },
    },
    MuiAvatar: { styleOverrides: { root: { background: tokens.navy700, fontWeight: 600 } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: 2, background: tokens.borderSoft } } },
    MuiTableCell: {
      styleOverrides: {
        head: { background: tokens.ground, color: tokens.slate, fontWeight: 600, fontSize: '0.75rem' },
        root: { borderBottom: `1px solid ${tokens.borderSoft}`, paddingBlock: 12 },
      },
    },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 500 } } },
  },
});

export default theme;
