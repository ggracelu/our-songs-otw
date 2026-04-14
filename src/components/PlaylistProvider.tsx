"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { WeekEntry } from "@/lib/types";
import { getSeason, getWeekNumber } from "@/lib/utils";

export interface PlaylistContextType {
  year: number;
  entries: WeekEntry[];
  addEntry: (
    entry: Omit<WeekEntry, "id" | "season" | "weekNumber">
  ) => void;
  updateEntry: (id: string, updates: Partial<WeekEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntryByWeek: (weekNumber: number) => WeekEntry | undefined;
  isLoaded: boolean;
}

export const PlaylistContext = createContext<PlaylistContextType | null>(
  null
);

const STORAGE_KEY = "songs-otw-data";

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<WeekEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: WeekEntry[] = JSON.parse(stored);
        const byWeek = new Map<number, WeekEntry>();
        const byDate = new Map<string, WeekEntry>();
        for (const entry of parsed) {
          const correctWeek = getWeekNumber(entry.date);
          const fixed = {
            ...entry,
            weekNumber: correctWeek,
            season: getSeason(entry.date),
          };
          byWeek.set(correctWeek, fixed);
          byDate.set(entry.date, fixed);
        }
        const merged = new Map<number, WeekEntry>();
        for (const entry of byWeek.values()) merged.set(entry.weekNumber, entry);
        for (const entry of byDate.values()) merged.set(entry.weekNumber, entry);
        setEntries([...merged.values()]);
      }
    } catch {
      // ignore parse errors
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
  }, [entries, isLoaded]);

  const addEntry = useCallback(
    (entry: Omit<WeekEntry, "id" | "season" | "weekNumber">) => {
      const newEntry: WeekEntry = {
        ...entry,
        id: crypto.randomUUID(),
        season: getSeason(entry.date),
        weekNumber: getWeekNumber(entry.date),
      };
      setEntries((prev) => {
        const filtered = prev.filter(
          (e) =>
            e.weekNumber !== newEntry.weekNumber && e.date !== newEntry.date
        );
        return [...filtered, newEntry];
      });
    },
    []
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<WeekEntry>) => {
      setEntries((prev) => {
        const mapped = prev.map((e) => {
          if (e.id !== id) return e;
          const updated = { ...e, ...updates };
          if (updates.date) {
            updated.season = getSeason(updates.date);
            updated.weekNumber = getWeekNumber(updates.date);
          }
          return updated;
        });
        const updatedEntry = mapped.find((e) => e.id === id);
        if (!updatedEntry) return mapped;
        return mapped.filter(
          (e) =>
            e.id === id ||
            (e.weekNumber !== updatedEntry.weekNumber &&
              e.date !== updatedEntry.date)
        );
      });
    },
    []
  );

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const getEntryByWeek = useCallback(
    (weekNumber: number) => {
      return entries.find((e) => e.weekNumber === weekNumber);
    },
    [entries]
  );

  return (
    <PlaylistContext.Provider
      value={{
        year,
        entries,
        addEntry,
        updateEntry,
        deleteEntry,
        getEntryByWeek,
        isLoaded,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}
