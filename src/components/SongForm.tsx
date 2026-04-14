"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePlaylist } from "@/lib/usePlaylist";
import { HonorableMention } from "@/lib/types";
import { isSunday, getSundaysOfYear } from "@/lib/utils";
import { HonorableMentionFields } from "./HonorableMentionFields";

export function SongForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addEntry, updateEntry, getEntryByWeek, year } = usePlaylist();

  const editWeek = searchParams.get("edit");
  const prefillWeek = searchParams.get("week");
  const existingEntry = editWeek
    ? getEntryByWeek(Number(editWeek))
    : undefined;

  const [date, setDate] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [comment, setComment] = useState("");
  const [albumArt, setAlbumArt] = useState("");
  const [honorableMentions, setHonorableMentions] = useState<
    HonorableMention[]
  >([]);
  const [error, setError] = useState("");

  // Search state — will be wired to MusicBrainz in Phase 4
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { id: string; title: string; artist: string; albumArt?: string }[]
  >([]);

  useEffect(() => {
    if (existingEntry) {
      setDate(existingEntry.date);
      setSongTitle(existingEntry.songTitle);
      setArtist(existingEntry.artist);
      setComment(existingEntry.comment);
      setHonorableMentions(existingEntry.honorableMentions);
      setAlbumArt(existingEntry.albumArt || "");
    } else if (prefillWeek) {
      const sundays = getSundaysOfYear(year);
      const weekNum = Number(prefillWeek);
      if (weekNum >= 1 && weekNum <= sundays.length) {
        setDate(sundays[weekNum - 1]);
      }
    }
  }, [existingEntry, prefillWeek, year]);

  // MusicBrainz search (debounced) — to be implemented in Phase 4
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/music/search?q=${encodeURIComponent(searchQuery)}&limit=5`
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
        }
      } catch {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const selectTrack = (track: {
    id: string;
    title: string;
    artist: string;
    albumArt?: string;
  }) => {
    setSongTitle(track.title);
    setArtist(track.artist);
    setAlbumArt(track.albumArt || "");
    setSearchQuery("");
    setSearchResults([]);
  };

  const saveEntry = useCallback(() => {
    if (!date || !songTitle.trim() || !artist.trim()) return false;
    if (!isSunday(date)) return false;

    const entryData = {
      date,
      songTitle: songTitle.trim(),
      artist: artist.trim(),
      comment: comment.trim(),
      honorableMentions,
      albumArt: albumArt || undefined,
    };

    if (existingEntry) {
      updateEntry(existingEntry.id, entryData);
    } else {
      addEntry(entryData);
    }
    return true;
  }, [
    date,
    songTitle,
    artist,
    albumArt,
    comment,
    honorableMentions,
    existingEntry,
    addEntry,
    updateEntry,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!date || !songTitle.trim() || !artist.trim()) {
      setError("Please fill in date, song title, and artist.");
      return;
    }

    if (!isSunday(date)) {
      setError("Date must be a Sunday — that's the ritual!");
      return;
    }

    if (saveEntry()) {
      router.push("/");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Music search */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          Search for a Song
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by song title or artist..."
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
        />
        {searchResults.length > 0 && (
          <div className="mt-2 space-y-1">
            {searchResults.map((track) => (
              <button
                key={track.id}
                type="button"
                onClick={() => selectTrack(track)}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-card p-2 text-left transition-all hover:bg-card-hover"
              >
                {track.albumArt ? (
                  <img
                    src={track.albumArt}
                    alt=""
                    className="h-8 w-8 rounded"
                  />
                ) : (
                  <div className="h-8 w-8 rounded bg-border flex items-center justify-center text-xs text-muted">
                    ♪
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{track.title}</p>
                  <p className="truncate text-xs text-muted">
                    {track.artist}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Album art preview */}
      {albumArt && (
        <div className="flex justify-center">
          <img
            src={albumArt}
            alt="Album art"
            className="h-32 w-32 rounded-xl shadow-lg"
          />
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          Date (must be a Sunday)
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          Song Title
        </label>
        <input
          type="text"
          value={songTitle}
          onChange={(e) => setSongTitle(e.target.value)}
          placeholder="What song defined this week?"
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          Artist
        </label>
        <input
          type="text"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Who made it?"
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-muted">
          Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Why this song? What was the vibe?"
          rows={3}
          className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-accent transition-colors resize-none"
        />
      </div>

      <HonorableMentionFields
        mentions={honorableMentions}
        onChange={setHonorableMentions}
      />

      <button
        type="submit"
        className="w-full rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-accent/80 hover:shadow-lg"
      >
        {existingEntry ? "Update Song" : "Add Song"}
      </button>
    </form>
  );
}
