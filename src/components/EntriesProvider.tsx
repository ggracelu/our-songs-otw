"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { WeekEntry } from "@/lib/types";
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

export const PlaylistContext = createContext<PlaylistContextType | null>(null);

export function EntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<WeekEntry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    fetch(`/api/entries?year=${year}`)
      .then((res) => {
        if (!res.ok) throw new Error("fetch failed");
        return res.json();
      })
      .then((data: WeekEntry[]) => {
        setEntries(data);
        setIsLoaded(true);
      })
      .catch(() => {
        setIsLoaded(true);
      });
  }, [year]);

  const addEntry = useCallback(
    (entry: Omit<WeekEntry, "id" | "season" | "weekNumber">) => {
      const tempId = crypto.randomUUID();
      const weekNumber = getWeekNumber(entry.date);
      const season = getSeason(entry.date);
      const optimistic: WeekEntry = { ...entry, id: tempId, weekNumber, season };

      setEntries((prev) => {
        const filtered = prev.filter(
          (e) => e.weekNumber !== weekNumber && e.date !== entry.date
        );
        return [...filtered, optimistic];
      });

      fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
      })
        .then((res) => {
          if (!res.ok) throw new Error("save failed");
          return res.json();
        })
        .then((serverEntry: WeekEntry) => {
          setEntries((prev) =>
            prev.map((e) => (e.id === tempId ? serverEntry : e))
          );
        })
        .catch(() => {
          setEntries((prev) => prev.filter((e) => e.id !== tempId));
        });
    },
    []
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<WeekEntry>) => {
      let previous: WeekEntry | undefined;

      setEntries((prev) => {
        previous = prev.find((e) => e.id === id);
        return prev.map((e) => {
          if (e.id !== id) return e;
          const updated = { ...e, ...updates };
          if (updates.date) {
            updated.season = getSeason(updates.date);
            updated.weekNumber = getWeekNumber(updates.date);
          }
          return updated;
        });
      });

      fetch(`/api/entries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
        .then((res) => {
          if (!res.ok) throw new Error("update failed");
          return res.json();
        })
        .then((serverEntry: WeekEntry) => {
          setEntries((prev) =>
            prev.map((e) => (e.id === id ? serverEntry : e))
          );
        })
        .catch(() => {
          if (previous) {
            setEntries((prev) =>
              prev.map((e) => (e.id === id ? previous! : e))
            );
          }
        });
    },
    []
  );

  const deleteEntry = useCallback((id: string) => {
    let removed: WeekEntry | undefined;

    setEntries((prev) => {
      removed = prev.find((e) => e.id === id);
      return prev.filter((e) => e.id !== id);
    });

    fetch(`/api/entries/${id}`, { method: "DELETE" }).catch(() => {
      if (removed) {
        setEntries((prev) => [...prev, removed!]);
      }
    });
  }, []);

  const getEntryByWeek = useCallback(
    (weekNumber: number) => entries.find((e) => e.weekNumber === weekNumber),
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
