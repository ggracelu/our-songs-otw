"use client";

import { Season } from "@/lib/types";
import { SEASON_COLORS, SEASON_LABELS } from "@/lib/constants";

export function SeasonBadge({ season }: { season: Season }) {
  const colors = SEASON_COLORS[season];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        background: `linear-gradient(135deg, ${colors.from}40, ${colors.to}40)`,
        color: colors.to,
      }}
    >
      {SEASON_LABELS[season]}
    </span>
  );
}
