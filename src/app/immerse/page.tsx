"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { usePlaylist } from "@/lib/usePlaylist";
import { SEASON_COLORS, SEASON_LABELS } from "@/lib/constants";
import { formatDateShort, getSundaysOfYear } from "@/lib/utils";
import { WeekEntry } from "@/lib/types";
import { extractColors } from "@/lib/colorExtract";
import { StarRating } from "@/components/StarRating";

function ImmerseSection({
  entry,
  index,
  total,
  sundayDate,
}: {
  entry: WeekEntry;
  index: number;
  total: number;
  sundayDate?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seasonColors = SEASON_COLORS[entry.season];
  const [albumColors, setAlbumColors] = useState<string[]>([]);

  // Extract colors from album art
  useEffect(() => {
    if (!entry.albumArt) return;
    extractColors(entry.albumArt, 3).then((colors) => {
      if (colors.length >= 2) setAlbumColors(colors);
    });
  }, [entry.albumArt]);

  // Use album colors if available, otherwise fall back to season
  const c1 = albumColors[0] || seasonColors.from;
  const c2 = albumColors[1] || seasonColors.to;
  const c3 = albumColors[2] || albumColors[0] || seasonColors.from;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([e]) => {
        const ratio = e.intersectionRatio;
        if (ratio > 0.4) {
          el.classList.add("immerse-visible");
        } else {
          el.classList.remove("immerse-visible");
        }
        // Smooth opacity based on scroll position for dissolve effect
        el.style.opacity = String(Math.min(1, ratio * 2.5));
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="immerse-section">
      {/* Multi-layer background gradients from album colors */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: [
            `radial-gradient(ellipse at 15% 15%, ${c1}b0, transparent 55%)`,
            `radial-gradient(ellipse at 85% 25%, ${c2}90, transparent 55%)`,
            `radial-gradient(ellipse at 50% 85%, ${c3}80, transparent 55%)`,
            `radial-gradient(ellipse at 50% 50%, ${c1}40, #0d0d0d 85%)`,
          ].join(", "),
        }}
      />
      {/* Animated color wash overlay */}
      <div
        className="absolute inset-0 immerse-color-wash"
        style={{
          background: `conic-gradient(from 0deg at 50% 50%, ${c1}40, ${c2}30, ${c3}40, ${c1}30)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-lg">
        {/* Album art */}
        {entry.albumArt ? (
          <div className="relative mb-8">
            {/* Multi-color glow behind art */}
            <div
              className="absolute -inset-4 rounded-3xl blur-3xl immerse-art-glow opacity-60"
              style={{
                background: `linear-gradient(135deg, ${c1}, ${c2}, ${c3})`,
              }}
            />
            <div
              className="absolute -inset-8 rounded-3xl blur-[60px] immerse-art-glow opacity-30"
              style={{
                background: `radial-gradient(circle, ${c2}, ${c1}80, transparent)`,
              }}
            />
            <img
              src={entry.albumArt}
              alt=""
              className="immerse-art relative h-48 w-48 rounded-2xl shadow-2xl sm:h-56 sm:w-56"
            />
          </div>
        ) : (
          <div
            className="immerse-art mb-8 flex h-48 w-48 items-center justify-center rounded-2xl text-6xl font-bold text-white/30 sm:h-56 sm:w-56"
            style={{
              background: `linear-gradient(135deg, ${c1}, ${c2})`,
            }}
          >
            {entry.weekNumber}
          </div>
        )}

        {/* Song info */}
        <h2 className="immerse-title text-3xl font-bold tracking-tight sm:text-4xl">
          {entry.songTitle}
        </h2>
        <p className="immerse-artist mt-2 text-lg text-white sm:text-xl">
          {entry.artist}
        </p>

        {/* Rating */}
        {entry.rating && (
          <div className="mt-4">
            <StarRating value={entry.rating} readonly size="md" />
          </div>
        )}

        {/* Comment */}
        {entry.comment && (
          <p className="immerse-comment mt-6 max-w-sm text-sm italic text-white/90 leading-relaxed">
            &ldquo;{entry.comment}&rdquo;
          </p>
        )}

        {/* Meta: date + season */}
        <div
          className="immerse-meta mt-8 flex items-center gap-3 rounded-full border border-white/30 px-4 py-1.5 text-xs text-white font-medium"
          style={{
            background: `linear-gradient(135deg, ${c1}30, ${c2}30)`,
            boxShadow: "0 0 8px rgba(255,255,255,0.25), 0 0 16px rgba(255,255,255,0.1)",
          }}
        >
          <span className="font-mono">W{entry.weekNumber}</span>
          <span className="text-white/40">&middot;</span>
          <span>{sundayDate ? formatDateShort(sundayDate) : ""}</span>
          <span className="text-white/40">&middot;</span>
          <span>{SEASON_LABELS[entry.season]}</span>
        </div>
      </div>

      {/* Scroll hint (only on first section) */}
      {index === 0 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted/30 immerse-scroll-hint">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      )}

      {/* Honorable mentions — bottom-right popup */}
      {entry.honorableMentions.length > 0 && (
        <div className="immerse-mentions absolute bottom-14 right-14 z-20 w-64 space-y-3">
          <p className="text-[10px] uppercase tracking-widest text-white/40 font-semibold">
            Honorable Mentions
          </p>
          {entry.honorableMentions.map((hm) => (
            <div
              key={hm.id}
              className="rounded-2xl bg-white/10 backdrop-blur-xl overflow-hidden"
            >
              <div className="flex gap-3 p-3">
                {hm.albumArt ? (
                  <img
                    src={hm.albumArt}
                    alt=""
                    className="h-16 w-16 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div
                    className="flex h-16 w-16 items-center justify-center rounded-xl text-lg font-bold text-white/30 shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${c1}80, ${c2}80)`,
                    }}
                  >
                    &#9835;
                  </div>
                )}
                <div className="min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-semibold text-white leading-snug">
                    {hm.songTitle}
                  </p>
                  <p className="text-xs text-white/60 mt-0.5">
                    {hm.artist}
                  </p>
                </div>
              </div>
              {hm.comment && (
                <p className="px-3 pb-3 text-xs italic text-white/50 leading-relaxed">
                  &ldquo;{hm.comment}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Progress */}
      <div className="absolute top-6 right-6 text-xs font-mono text-muted/30">
        {index + 1}/{total}
      </div>
    </div>
  );
}

export default function ImmersePage() {
  const router = useRouter();
  const { entries, year, isLoaded } = usePlaylist();
  const sundays = getSundaysOfYear(year);

  // Deduplicate: keep only the latest entry per weekNumber
  const dedupedMap = new Map<number, WeekEntry>();
  for (const entry of entries) {
    dedupedMap.set(entry.weekNumber, entry);
  }
  const sortedEntries = [...dedupedMap.values()].sort(
    (a, b) => a.weekNumber - b.weekNumber
  );

  const handleBack = useCallback(() => {
    router.push("/");
  }, [router]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleBack();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleBack]);

  if (!isLoaded) {
    return (
      <div className="flex h-dvh items-center justify-center bg-background">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  if (sortedEntries.length === 0) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center bg-background gap-4">
        <div className="text-5xl opacity-30">&#9835;</div>
        <p className="text-muted">No songs yet. Add some to immerse.</p>
        <button
          onClick={handleBack}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="immerse-snap">
      {/* Fixed back button */}
      <button
        onClick={handleBack}
        className="fixed top-6 left-6 z-50 flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1.5 text-xs font-medium text-muted backdrop-blur-xl transition-colors hover:bg-white/10 hover:text-foreground"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back
      </button>

      {sortedEntries.map((entry, i) => (
        <ImmerseSection
          key={entry.id}
          entry={entry}
          index={i}
          total={sortedEntries.length}
          sundayDate={sundays[entry.weekNumber - 1]}
        />
      ))}
    </div>
  );
}
