import { Season } from "./types";

/** Parse a YYYY-MM-DD string as local midnight (not UTC) */
function parseLocal(date: string): Date {
  return new Date(date + "T00:00:00");
}

export function getSeason(date: string): Season {
  const month = parseLocal(date).getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "autumn";
  return "winter";
}

export function getWeekNumber(date: string): number {
  const d = parseLocal(date);
  const sundays = getSundaysOfYear(d.getFullYear());
  const idx = sundays.indexOf(date);
  if (idx !== -1) return idx + 1;
  // Fallback: find the Sunday week this date falls in
  for (let i = sundays.length - 1; i >= 0; i--) {
    if (sundays[i] <= date) return i + 1;
  }
  return 1;
}

export function isSunday(date: string): boolean {
  return parseLocal(date).getDay() === 0;
}

export function getSundaysOfYear(year: number): string[] {
  const sundays: string[] = [];
  const d = new Date(year, 0, 1);
  while (d.getDay() !== 0) {
    d.setDate(d.getDate() + 1);
  }
  while (d.getFullYear() === year) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    sundays.push(`${yyyy}-${mm}-${dd}`);
    d.setDate(d.getDate() + 7);
  }
  return sundays;
}

export function formatDate(date: string): string {
  return parseLocal(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Compact format: "Jan 5", "Dec 29" */
export function formatDateShort(date: string): string {
  return parseLocal(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function getCurrentWeekNumber(): number {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return getWeekNumber(`${yyyy}-${mm}-${dd}`);
}

export function getSeasonForWeek(weekNumber: number): Season {
  if (weekNumber <= 9 || weekNumber >= 49) return "winter";
  if (weekNumber <= 22) return "spring";
  if (weekNumber <= 35) return "summer";
  return "autumn";
}
