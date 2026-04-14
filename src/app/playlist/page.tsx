"use client";

import { useState } from "react";
import { usePlaylist } from "@/lib/usePlaylist";
import { WeekEntry } from "@/lib/types";
import { WeekCard } from "@/components/WeekCard";
import { HmToggle } from "@/components/HmToggle";
import { EmptyState } from "@/components/EmptyState";
import { SEASON_COLORS } from "@/lib/constants";

export default function PlaylistPage() {
  const { entries, year, isLoaded } = usePlaylist();
  const [showHMs, setShowHMs] = useState(true);

  if (!isLoaded) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  // Deduplicate by weekNumber (keep latest per week)
  const dedupMap = new Map<number, WeekEntry>();
  for (const entry of entries) {
    dedupMap.set(entry.weekNumber, entry);
  }
  const sorted = [...dedupMap.values()].sort(
    (a, b) => a.weekNumber - b.weekNumber
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">
          {year} Playlist
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your year in music &mdash; {entries.length} song
          {entries.length !== 1 ? "s" : ""} so far
        </p>

        {/* Progress bar */}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${(entries.length / 52) * 100}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-muted">
          {entries.length}/52 weeks
        </p>
      </div>

      {entries.length > 0 && (
        <div className="mb-4 animate-fade-in">
          <HmToggle checked={showHMs} onChange={setShowHMs} />
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState message="No songs in your playlist yet" />
      ) : (
        <ol className="space-y-3 animate-fade-in">
          {sorted.map((entry, idx) => {
            const colors = SEASON_COLORS[entry.season];
            return (
              <li key={entry.id}>
                <div className="flex gap-3">
                  {/* Track number */}
                  <div className="flex flex-col items-center pt-3">
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                      }}
                    >
                      {idx + 1}
                    </span>
                    {idx < sorted.length - 1 && (
                      <div className="mt-1 flex-1 w-px bg-border" />
                    )}
                  </div>

                  <div className="flex-1 pb-3">
                    <WeekCard entry={entry} compact />

                    {showHMs &&
                      entry.honorableMentions.length > 0 && (
                        <div className="ml-6 mt-2 space-y-2">
                          {entry.honorableMentions.map((hm) => (
                            <div
                              key={hm.id}
                              className="flex items-center gap-3 rounded-lg border border-border/60 bg-card/60 p-3"
                            >
                              {hm.albumArt ? (
                                <img
                                  src={hm.albumArt}
                                  alt=""
                                  className="h-10 w-10 shrink-0 rounded-lg"
                                />
                              ) : (
                                <div
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white/40"
                                  style={{
                                    background: `linear-gradient(135deg, ${colors.from}60, ${colors.to}60)`,
                                  }}
                                >
                                  HM
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-sm">{hm.songTitle}</p>
                                <p className="truncate text-xs text-muted">{hm.artist}</p>
                              </div>
                              <span className="text-[10px] text-muted/50 shrink-0 uppercase tracking-wide">HM</span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
