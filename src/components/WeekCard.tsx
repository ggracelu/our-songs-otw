"use client";

import Link from "next/link";
import { WeekEntry } from "@/lib/types";
import { SEASON_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { SeasonBadge } from "./SeasonBadge";

export function WeekCard({
  entry,
  compact = false,
}: {
  entry: WeekEntry;
  compact?: boolean;
}) {
  const colors = SEASON_COLORS[entry.season];

  if (compact) {
    return (
      <Link
        href={`/week/${entry.weekNumber}`}
        className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:-translate-y-0.5 hover:bg-card-hover hover:shadow-lg"
      >
        {entry.albumArt ? (
          <img
            src={entry.albumArt}
            alt=""
            className="h-10 w-10 shrink-0 rounded-lg"
          />
        ) : (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold"
            style={{
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            }}
          >
            {entry.weekNumber}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{entry.songTitle}</p>
          <p className="truncate text-sm text-muted">{entry.artist}</p>
        </div>
        <span className="text-xs text-muted font-mono shrink-0">
          W{entry.weekNumber}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={`/week/${entry.weekNumber}`}
      className="group block rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:bg-card-hover hover:shadow-xl"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg font-mono text-xs font-bold"
            style={{
              background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
            }}
          >
            {entry.weekNumber}
          </span>
          <SeasonBadge season={entry.season} />
        </div>
        <span className="text-xs text-muted">
          {formatDate(entry.date)}
        </span>
      </div>

      <div className="flex gap-4">
        {entry.albumArt && (
          <img
            src={entry.albumArt}
            alt=""
            className="h-16 w-16 shrink-0 rounded-lg shadow"
          />
        )}
        <div className="min-w-0">
          <h3 className="text-lg font-semibold leading-tight group-hover:text-accent transition-colors">
            {entry.songTitle}
          </h3>
          <p className="mt-1 text-sm text-muted">{entry.artist}</p>
          {entry.comment && (
            <p className="mt-2 line-clamp-2 text-sm text-muted/80 italic">
              &ldquo;{entry.comment}&rdquo;
            </p>
          )}
        </div>
      </div>

      {entry.honorableMentions.length > 0 && (
        <div className="mt-3 border-t border-border pt-2">
          <p className="text-xs text-muted">
            +{entry.honorableMentions.length} honorable mention
            {entry.honorableMentions.length > 1 ? "s" : ""}
          </p>
        </div>
      )}
    </Link>
  );
}
