// Case status and next-deadline display. Statuses are told apart by icon and wording only
// (the design system has no green/orange/red); an overdue deadline is marked by an icon and bold text.
import { Box } from '@mui/material';
import { AlertTriangle, CalendarClock } from 'lucide-react';
import { daysUntil, formatDeadlineDate, relativeDays, statusInfo } from '../utils/caseStatus';
import { tokens } from '../theme';

export const StatusChip = ({ status, size = 'md' }: { status?: string; size?: 'sm' | 'md' }) => {
  const info = statusInfo(status);
  const Icon = info.icon;
  const closed = info.value === 'closed';
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: size === 'sm' ? 0.875 : 1.125,
        py: size === 'sm' ? 0.25 : 0.375,
        borderRadius: `${tokens.radiusSm}px`,
        border: `1px solid ${closed ? tokens.border : tokens.borderStrong}`,
        background: closed ? tokens.ground : tokens.white,
        color: closed ? tokens.muted : tokens.navy700,
        fontSize: size === 'sm' ? 12 : 13,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        lineHeight: 1.4,
      }}
    >
      <Icon size={size === 'sm' ? 13 : 14} aria-hidden="true" />
      {info.label}
    </Box>
  );
};

// "3.11.2026 · בעוד 13 ימים", with an overdue marker; null deadline renders a dash
export const DeadlineText = ({ date, note, showNote = false }: { date?: string | null; note?: string | null; showNote?: boolean }) => {
  if (!date) return <Box component="span" sx={{ color: tokens.muted }}>—</Box>;
  const days = daysUntil(date);
  const overdue = days < 0;
  const Icon = overdue ? AlertTriangle : CalendarClock;
  return (
    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'flex-start', gap: 0.75, color: overdue ? tokens.ink : tokens.slate, minWidth: 0 }}>
      <Box component="span" sx={{ display: 'flex', mt: '2px', flexShrink: 0 }} aria-hidden="true">
        <Icon size={14} />
      </Box>
      <Box component="span" sx={{ minWidth: 0, overflow: 'hidden' }}>
        <Box component="span" sx={{ display: 'block', whiteSpace: 'nowrap', fontWeight: overdue || days <= 2 ? 600 : 400, fontVariantNumeric: 'tabular-nums' }}>
          {formatDeadlineDate(date)} · {overdue ? `באיחור, ${relativeDays(days)}` : relativeDays(days)}
        </Box>
        {showNote && note && (
          <Box component="span" title={note} sx={{ display: 'block', fontSize: 13, color: tokens.slate, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {note}
          </Box>
        )}
      </Box>
    </Box>
  );
};
