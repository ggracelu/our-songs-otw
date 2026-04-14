import { Season } from "./types";

export const SEASON_COLORS: Record<
  Season,
  { from: string; to: string; text: string; bg: string }
> = {
  winter: {
    from: "#1e3a5f",
    to: "#4a90d9",
    text: "text-blue-300",
    bg: "bg-blue-900/30",
  },
  spring: {
    from: "#2d6a4f",
    to: "#95d5b2",
    text: "text-emerald-300",
    bg: "bg-emerald-900/30",
  },
  summer: {
    from: "#f4845f",
    to: "#f7dc6f",
    text: "text-amber-300",
    bg: "bg-amber-900/30",
  },
  autumn: {
    from: "#c44536",
    to: "#e8a87c",
    text: "text-orange-300",
    bg: "bg-orange-900/30",
  },
};

export const SEASON_LABELS: Record<Season, string> = {
  winter: "Winter",
  spring: "Spring",
  summer: "Summer",
  autumn: "Autumn",
};

export const WEEKS_PER_SEASON = 13;
export const TOTAL_WEEKS = 52;

export const SEASON_ORDER: Season[] = [
  "winter",
  "spring",
  "summer",
  "autumn",
];
