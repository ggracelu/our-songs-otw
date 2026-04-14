"use client";

import Link from "next/link";

export function EmptyState({
  weekNumber,
  message,
}: {
  weekNumber?: number;
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="text-5xl opacity-30">&#9835;</div>
      <p className="text-muted text-lg">
        {message ??
          (weekNumber
            ? `Week ${weekNumber} is waiting for its song`
            : "No songs yet")}
      </p>
      <Link
        href={weekNumber ? `/add?week=${weekNumber}` : "/add"}
        className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/80"
      >
        Add a Song
      </Link>
    </div>
  );
}
