"use client";

import Link from "next/link";
import { WeekEntry } from "@/lib/types";
import {
  SEASON_COLORS,
  SEASON_LABELS,
  SEASON_ORDER,
  WEEKS_PER_SEASON,
} from "@/lib/constants";
import { getSundaysOfYear, formatDateShort, getCurrentWeekNumber } from "@/lib/utils";

export function WeekGrid({
  entries,
  year,
}: {
  entries: WeekEntry[];
  year: number;
}) {
  const entryMap = new Map(entries.map((e) => [e.weekNumber, e]));
  const sundays = getSundaysOfYear(year);
  const currentWeek = getCurrentWeekNumber();

  return (
    <div className="overflow-hidden">
      {SEASON_ORDER.map((season, seasonIdx) => {
        const colors = SEASON_COLORS[season];
        const startWeek = seasonIdx * WEEKS_PER_SEASON + 1;

        return (
          <div key={season} className="relative mb-4">
            {/* Background glow */}
            <div
              className="pointer-events-none absolute -inset-x-8 -inset-y-4 rounded-3xl opacity-[0.07] blur-3xl"
              style={{
                background: `radial-gradient(ellipse at center, ${colors.from}, ${colors.to}40, transparent 70%)`,
              }}
            />

            <div
              className="relative animate-fade-in"
              style={{ animationDelay: `${seasonIdx * 0.15}s` }}
            >
              <h3
                className="mb-2 text-sm font-semibold uppercase tracking-widest"
                style={{ color: colors.to }}
              >
                {SEASON_LABELS[season]}
              </h3>
              <div className="grid grid-cols-13 gap-1.5">
                {Array.from({ length: WEEKS_PER_SEASON }, (_, i) => {
                  const week = startWeek + i;
                  const entry = entryMap.get(week);
                  const hasEntry = !!entry;
                  const sundayDate = sundays[week - 1];
                  const shortDate = sundayDate
                    ? formatDateShort(sundayDate)
                    : undefined;
                  const cellIndex = seasonIdx * WEEKS_PER_SEASON + i;

                  return (
                    <Link
                      key={week}
                      href={
                        hasEntry ? `/add?edit=${week}` : `/add?week=${week}`
                      }
                      title={
                        hasEntry
                          ? `Week ${week} (${shortDate}): ${entry.songTitle} - ${entry.artist}`
                          : `Week ${week} — ${shortDate ?? ""} — add a song`
                      }
                      className={`group relative flex aspect-square items-center justify-center rounded-lg text-xs font-mono animate-cell-enter week-cell-ripple overflow-hidden ${
                        hasEntry
                          ? "week-cell-filled hover:-translate-y-0.5 hover:scale-110"
                          : "border border-border/50 hover:border-border hover-shimmer"
                      } ${week === currentWeek ? "current-week-glow" : ""}`}
                      style={
                        {
                          "--cell-delay": `${cellIndex * 0.02}s`,
                          "--ripple-delay": `${(week - 1) * 0.06}s`,
                          ...(hasEntry
                            ? {
                                background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
                                "--cell-glow": `0 4px 16px ${colors.from}50, 0 0 8px ${colors.to}30`,
                              }
                            : {}),
                        } as React.CSSProperties
                      }
                    >
                      {hasEntry && entry.albumArt && (
                        <img
                          src={entry.albumArt}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover rounded-lg"
                        />
                      )}
                      {hasEntry && entry.albumArt && (
                        <div className="absolute inset-0 rounded-lg bg-black/20 group-hover:bg-black/10 transition-colors" />
                      )}
                      <span
                        className={`relative z-10 flex flex-col items-center leading-tight ${
                          hasEntry
                            ? "font-bold text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
                            : "text-muted/50"
                        }`}
                      >
                        <span className="text-[10px]">{week}</span>
                        {shortDate && (
                          <span className="text-[7px] opacity-60 font-sans">
                            {shortDate}
                          </span>
                        )}
                      </span>
                      {hasEntry && (
                        <div
                          className="absolute inset-0 rounded-lg animate-pulse-glow opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            background: `linear-gradient(135deg, ${colors.from}60, ${colors.to}60)`,
                          }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
