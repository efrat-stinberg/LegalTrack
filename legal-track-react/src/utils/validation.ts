// Shared client-side validation for the forms. Every validator returns an error message in
// Hebrew, or "" when the value is fine. The server still validates too; this only gives
// the user immediate feedback.

export const LIMITS = {
  personName: 100,
  email: 254,
  phone: 20,
  password: 128,
  folderName: 200,
  documentName: 200,
  note: 200,
  search: 100,
} as const;

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Characters that cannot be part of a file name on Windows / most systems
const INVALID_FILE_CHARS = /[\\/:*?"<>|]/;

export const validateRequiredText = (value: string, label: string, max: number, min = 1): string => {
  const v = value.trim();
  if (!v) return `יש להזין ${label}`;
  if (v.length < min) return `${label} חייב להכיל לפחות ${min} תווים`;
  if (v.length > max) return `${label} ארוך מדי (עד ${max} תווים)`;
  return "";
};

export const validatePersonName = (value: string, label = "שם מלא"): string => {
  const error = validateRequiredText(value, label, LIMITS.personName, 2);
  if (error) return error;
  // A name must contain at least one letter (Hebrew or Latin), not only digits or symbols
  if (!/[A-Za-zא-ת]/.test(value)) return `${label} חייב להכיל אותיות`;
  return "";
};

export const validateEmail = (value: string, required = true): string => {
  const v = value.trim();
  if (!v) return required ? "יש להזין אימייל" : "";
  if (v.length > LIMITS.email) return "כתובת האימייל ארוכה מדי";
  if (!emailPattern.test(v)) return "כתובת האימייל לא תקינה";
  return "";
};

// Optional phone: digits with an optional leading +, spaces, dashes and parentheses; 7-15 digits
export const validatePhone = (value: string): string => {
  const v = value.trim();
  if (!v) return "";
  if (!/^\+?[\d\s\-()]+$/.test(v)) return "מספר הטלפון יכול להכיל רק ספרות, רווחים, מקפים וסימן +";
  const digits = v.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return "מספר הטלפון חייב להכיל בין 7 ל-15 ספרות";
  return "";
};

export const validatePassword = (value: string): string => {
  if (value.length < 5 || !/[a-zA-Zא-ת]/.test(value) || !/[0-9]/.test(value))
    return "הסיסמה חייבת להכיל לפחות 5 תווים, כולל אותיות ומספרים";
  if (value.length > LIMITS.password) return `הסיסמה ארוכה מדי (עד ${LIMITS.password} תווים)`;
  return "";
};

export const validateFolderName = (value: string): string => validateRequiredText(value, "שם לתיק", LIMITS.folderName);

export const validateDocumentName = (value: string): string => {
  const error = validateRequiredText(value, "שם למסמך", LIMITS.documentName);
  if (error) return error;
  if (INVALID_FILE_CHARS.test(value)) return 'שם המסמך לא יכול להכיל את התווים \\ / : * ? " < > |';
  return "";
};

// Optional date (yyyy-mm-dd) from <input type="date">: must be a real date in a sensible range
export const validateOptionalDate = (value: string): string => {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "התאריך לא תקין";
  const year = d.getFullYear();
  if (year < 2000 || year > 2100) return "התאריך חייב להיות בין השנים 2000 ל-2100";
  return "";
};

export const validateNote = (value: string): string =>
  value.trim().length > LIMITS.note ? `הטקסט ארוך מדי (עד ${LIMITS.note} תווים)` : "";
