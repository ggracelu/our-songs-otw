"use client";

import { SEASON_COLORS } from "@/lib/constants";
import { Season } from "@/lib/types";

export function SeasonDivider({ from, to }: { from: Season; to: Season }) {
  const fromColor = SEASON_COLORS[from].to;
  const toColor = SEASON_COLORS[to].from;

  return (
    <div className="relative my-6 flex items-center justify-center">
      <div
        className="h-px w-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${fromColor}00, ${fromColor}, ${toColor}, ${toColor}00)`,
        }}
      />
      <div
        className="absolute h-1.5 w-1.5 rounded-full animate-pulse-glow"
        style={{
          background: `linear-gradient(135deg, ${fromColor}, ${toColor})`,
          boxShadow: `0 0 8px 2px ${fromColor}40, 0 0 8px 2px ${toColor}40`,
        }}
      />
    </div>
  );
}
