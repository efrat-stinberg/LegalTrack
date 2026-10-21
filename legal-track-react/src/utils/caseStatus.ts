// Case status values with their label and icon, and helpers for the next-deadline date.
import { CheckCircle2, Circle, Clock, PauseCircle } from 'lucide-react';
import type { CaseStatus } from '../models/Folder';

export const CASE_STATUSES: { value: CaseStatus; label: string; icon: typeof Circle }[] = [
  { value: 'open', label: 'פתוח', icon: Circle },
  { value: 'in_progress', label: 'בטיפול', icon: Clock },
  { value: 'waiting', label: 'ממתין', icon: PauseCircle },
  { value: 'closed', label: 'סגור', icon: CheckCircle2 },
];

export const statusInfo = (status?: string) => CASE_STATUSES.find((s) => s.value === status) ?? CASE_STATUSES[0];

// Whole days from today to the deadline (negative = overdue), in local time
export const daysUntil = (date: string) => {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number);
  const target = new Date(y, m - 1, d).getTime();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((target - today) / 864e5);
};

export const formatDeadlineDate = (date: string) => {
  const [y, m, d] = date.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('he-IL');
};

export const relativeDays = (days: number) => {
  if (days === 0) return 'היום';
  if (days === 1) return 'מחר';
  if (days === -1) return 'אתמול';
  return days > 0 ? `בעוד ${days} ימים` : `לפני ${-days} ימים`;
};
