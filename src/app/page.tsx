"use client";

import Link from "next/link";
import { usePlaylist } from "@/lib/usePlaylist";
import { WeekGrid } from "@/components/WeekGrid";

function SoundWave() {
  const barCount = 100;
  const bars = Array.from({ length: barCount }, (_, i) => {
    const t = i / (barCount - 1);
    const envelope = Math.pow(Math.sin(t * Math.PI), 0.6);
    const noise = Math.sin(i * 1.3) * 0.3 + Math.sin(i * 0.7) * 0.2;
    return Math.max(0.06, envelope * (0.5 + noise));
  });
  return (
    <div className="flex items-end gap-[2px] h-10 w-full max-w-4xl mx-auto" aria-hidden>
      {bars.map((height, i) => (
        <div
          key={i}
          className="flex-1 rounded-full sound-bar"
          style={{
            height: `${height * 100}%`,
            background: "linear-gradient(to top, #8b5cf6, #ec4899)",
            animationDelay: `${i * 0.05}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { entries, year, isLoaded } = usePlaylist();

  if (!isLoaded) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      {/* Hero */}
      <div className="mb-14 animate-fade-in flex flex-col items-center text-center">
        <h1 className="text-[clamp(1.35rem,4.1vw,3.75rem)] font-semibold tracking-tight leading-none whitespace-nowrap">
          <span className="bg-gradient-to-r from-accent via-pink-500 to-amber-400 bg-clip-text text-transparent">
            {year}
          </span>{" "}
          <span className="text-foreground">Songs of the Week</span>
        </h1>
        <p className="mt-3 text-sm text-muted">
          Your year in music, 1 week and 1 song at a time
        </p>
        <p className="mt-1.5 text-xs text-muted/60 tracking-wide">
          {entries.length}/52 weeks filled &mdash;{" "}
          {entries.length === 0
            ? "start your journey"
            : `${52 - entries.length} to go`}
        </p>
        <div className="mt-6 w-full">
          <SoundWave />
        </div>
      </div>

      <WeekGrid entries={entries} year={year} />

      {entries.length > 0 && (
        <div className="mt-8 flex justify-center animate-fade-in">
          <Link
            href="/immerse"
            className="group relative inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-xl"
            style={{
              background: "linear-gradient(135deg, #8b5cf6, #ec4899, #f59e0b)",
            }}
          >
            <span className="relative z-10">Immerse</span>
            <svg
              className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-10 animate-fade-in">
          <h2
            className="mb-4 text-lg font-semibold uppercase tracking-wide"
                     >
            Recent Picks
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[...entries]
              .sort((a, b) => b.weekNumber - a.weekNumber)
              .slice(0, 6)
              .map((entry) => (
                <a
                  key={entry.id}
                  href={`/week/${entry.weekNumber}`}
                  className="group rounded-xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:bg-card-hover hover:shadow-lg"
                >
                  <div
                    className="flex items-center gap-2 text-xs text-muted mb-2"
                                     >
                    <span className="font-mono">W{entry.weekNumber}</span>
                    <span>&middot;</span>
                    <span className="capitalize">{entry.season}</span>
                  </div>
                  <p className="font-semibold group-hover:text-accent transition-colors">
                    {entry.songTitle}
                  </p>
                  <p className="text-sm text-muted">{entry.artist}</p>
                </a>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
