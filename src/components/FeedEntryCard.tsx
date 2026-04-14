"use client";

import Link from "next/link";
import type { FeedEntry } from "@/lib/types";

const seasonColors: Record<string, string> = {
  winter: "border-blue-500/30",
  spring: "border-green-500/30",
  summer: "border-yellow-500/30",
  autumn: "border-orange-500/30",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function FeedEntryCard({ entry }: { entry: FeedEntry }) {
  const borderColor = seasonColors[entry.season] || "border-border";

  return (
    <div className={`rounded-xl border-l-4 ${borderColor} bg-card p-4 transition-colors hover:bg-card-hover`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <Link href={`/u/${entry.username}`} className="shrink-0">
          {entry.avatarUrl ? (
            <img
              src={entry.avatarUrl}
              alt={entry.displayName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-border text-sm font-bold text-muted">
              {entry.displayName.charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm">
            <Link href={`/u/${entry.username}`} className="font-medium hover:text-accent transition-colors">
              {entry.displayName}
            </Link>
            <Link href={`/u/${entry.username}`} className="text-muted hover:text-accent transition-colors">
              @{entry.username}
            </Link>
            <span className="text-muted">·</span>
            <span className="text-muted text-xs">{timeAgo(entry.createdAt)}</span>
          </div>

          {/* Song info */}
          <div className="mt-2 flex gap-3">
            {entry.albumArt && (
              <img
                src={entry.albumArt}
                alt={entry.songTitle}
                className="h-14 w-14 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate">{entry.songTitle}</p>
              <p className="text-sm text-muted truncate">{entry.artist}</p>
              <p className="text-xs text-muted mt-0.5">Week {entry.weekNumber}</p>
            </div>
          </div>

          {/* Comment */}
          {entry.comment && (
            <p className="mt-2 text-sm text-foreground/80 line-clamp-2">{entry.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}
