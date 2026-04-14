"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { usePlaylist } from "@/lib/usePlaylist";
import { SEASON_COLORS, SEASON_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { SeasonBadge } from "@/components/SeasonBadge";
import { StarRating } from "@/components/StarRating";
import { EmptyState } from "@/components/EmptyState";

export default function WeekDetailPage() {
  const params = useParams();
  const router = useRouter();
  const weekNumber = Number(params.number);
  const { getEntryByWeek, deleteEntry, isLoaded } = usePlaylist();
  const entry = getEntryByWeek(weekNumber);

  if (!isLoaded) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
        >
          &larr; Back to grid
        </Link>
        <EmptyState weekNumber={weekNumber} />
      </div>
    );
  }

  const colors = SEASON_COLORS[entry.season];

  const handleDelete = () => {
    if (confirm("Remove this song from your playlist?")) {
      deleteEntry(entry.id);
      router.push("/");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
      >
        &larr; Back to grid
      </Link>

      <div className="animate-fade-in">
        {/* Season gradient header */}
        <div
          className="rounded-t-2xl p-8"
          style={{
            background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="font-mono text-lg font-bold text-white/80">
              Week {entry.weekNumber}
            </span>
            <SeasonBadge season={entry.season} />
          </div>
          <div className="flex items-end gap-5">
            {entry.albumArt && (
              <img
                src={entry.albumArt}
                alt=""
                className="h-28 w-28 rounded-xl shadow-2xl"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {entry.songTitle}
              </h1>
              <p className="mt-1 text-lg text-white/80">
                {entry.artist}
              </p>
            </div>
          </div>
        </div>

        {/* Details card */}
        <div className="rounded-b-2xl border border-t-0 border-border bg-card p-6 space-y-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">{formatDate(entry.date)}</span>
            <span className="text-muted capitalize">
              {SEASON_LABELS[entry.season]}
            </span>
          </div>

          {entry.rating && (
            <div>
              <h3 className="text-sm font-medium text-muted mb-1">
                Rating
              </h3>
              <StarRating value={entry.rating} readonly size="md" />
            </div>
          )}

          {entry.comment && (
            <div>
              <h3 className="text-sm font-medium text-muted mb-1">
                Comment
              </h3>
              <p className="text-sm leading-relaxed italic">
                &ldquo;{entry.comment}&rdquo;
              </p>
            </div>
          )}

          {entry.honorableMentions.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-muted mb-2">
                Honorable Mentions
              </h3>
              <div className="space-y-2">
                {entry.honorableMentions.map((hm) => (
                  <div
                    key={hm.id}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <p className="font-medium text-sm">
                      {hm.songTitle}
                    </p>
                    <p className="text-xs text-muted">{hm.artist}</p>
                    {hm.comment && (
                      <p className="mt-1 text-xs text-muted/70 italic">
                        {hm.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Link
              href={`/add?edit=${entry.weekNumber}`}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/80"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-red-500/50 hover:text-red-400"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
