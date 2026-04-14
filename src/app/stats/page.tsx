"use client";

import { usePlaylist } from "@/lib/usePlaylist";
import { StatCard } from "@/components/StatCard";
import { SEASON_COLORS, SEASON_LABELS, SEASON_ORDER } from "@/lib/constants";
import { EmptyState } from "@/components/EmptyState";

export default function StatsPage() {
  const { entries, year, isLoaded } = usePlaylist();

  if (!isLoaded) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight">Stats</h1>
        <EmptyState message="Add some songs to see your stats" />
      </div>
    );
  }

  // Compute stats
  const artistCounts = new Map<string, number>();
  entries.forEach((e) => {
    artistCounts.set(e.artist, (artistCounts.get(e.artist) || 0) + 1);
  });
  const topArtist = [...artistCounts.entries()].sort(
    (a, b) => b[1] - a[1]
  )[0];

  const seasonCounts = SEASON_ORDER.map((s) => ({
    season: s,
    count: entries.filter((e) => e.season === s).length,
  }));

  // Longest streak
  const weekNumbers = entries
    .map((e) => e.weekNumber)
    .sort((a, b) => a - b);
  let longestStreak = 1;
  let currentStreak = 1;
  for (let i = 1; i < weekNumbers.length; i++) {
    if (weekNumbers[i] === weekNumbers[i - 1] + 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  if (weekNumbers.length <= 1) longestStreak = weekNumbers.length;

  const totalHMs = entries.reduce(
    (sum, e) => sum + e.honorableMentions.length,
    0
  );

  const completion = Math.round((entries.length / 52) * 100);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 animate-fade-in">
        <h1 className="text-2xl font-bold tracking-tight">
          {year} Stats
        </h1>
        <p className="mt-1 text-sm text-muted">
          Your music journey in numbers
        </p>
      </div>

      {/* Key stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-in">
        <StatCard
          value={`${completion}%`}
          label="Complete"
          color="#8b5cf6"
        />
        <StatCard value={entries.length} label="Songs Picked" />
        <StatCard value={longestStreak} label="Longest Streak" />
        <StatCard value={totalHMs} label="Honorable Mentions" />
      </div>

      {/* Top artist */}
      {topArtist && (
        <div className="mb-8 animate-fade-in rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted mb-2">
            Most Featured Artist
          </h3>
          <p className="text-xl font-bold">{topArtist[0]}</p>
          <p className="text-sm text-muted">
            {topArtist[1]} week{topArtist[1] > 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Season breakdown */}
      <div className="animate-fade-in">
        <h3 className="mb-3 text-sm font-medium text-muted">
          Songs by Season
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {seasonCounts.map(({ season, count }) => {
            const colors = SEASON_COLORS[season];
            return (
              <div
                key={season}
                className="rounded-xl border border-border p-4 text-center"
                style={{
                  borderColor: count > 0 ? `${colors.to}40` : undefined,
                }}
              >
                <div
                  className="text-2xl font-bold font-mono"
                  style={{ color: colors.to }}
                >
                  {count}
                </div>
                <div className="mt-1 text-xs text-muted">
                  {SEASON_LABELS[season]}
                </div>
                {/* Mini bar */}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(count / 13) * 100}%`,
                      background: `linear-gradient(90deg, ${colors.from}, ${colors.to})`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* All artists */}
      {artistCounts.size > 1 && (
        <div className="mt-8 animate-fade-in">
          <h3 className="mb-3 text-sm font-medium text-muted">
            All Artists
          </h3>
          <div className="space-y-1">
            {[...artistCounts.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([artist, count]) => (
                <div
                  key={artist}
                  className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5"
                >
                  <span className="text-sm">{artist}</span>
                  <span className="text-xs text-muted font-mono">
                    {count}x
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
