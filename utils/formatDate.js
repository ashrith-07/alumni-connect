// utils/formatDate.js
// Helpers for event dates. Dates are stored as text like "2026-12-15".

// Turn "2026-12-15" into its parts and build a Date object.
// (We build it from parts so the phone's time zone can't shift it to the wrong day.)
function toDate(text) {
  const [year, month, day] = text.split("-").map(Number);
  return new Date(year, month - 1, day); // months start at 0 in JavaScript
}

// Check the text is in YYYY-MM-DD format AND is a real date (e.g. not 2026-02-31).
export function isValidDate(text) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [year, month, day] = text.split("-").map(Number);
  const date = toDate(text);
  // If the date "rolled over" (31 Feb -> 3 Mar), the parts won't match.
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

// Turn "2026-12-15" into a friendly "Tue Dec 15 2026".
export function formatDate(text) {
  if (!text || !isValidDate(text)) return text || "";
  return toDate(text).toDateString();
}
