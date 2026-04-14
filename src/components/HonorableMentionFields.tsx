"use client";

import { useState, useEffect } from "react";
import { HonorableMention } from "@/lib/types";

interface Props {
  mentions: HonorableMention[];
  onChange: (mentions: HonorableMention[]) => void;
}

function HmMusicSearch({
  onSelect,
}: {
  onSelect: (track: {
    title: string;
    artist: string;
    albumArt?: string;
    musicbrainzRecordingId?: string;
  }) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { id: string; title: string; artist: string; albumArt?: string }[]
  >([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/music/search?q=${encodeURIComponent(query)}&limit=4`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a song..."
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
      />
      {results.length > 0 && (
        <div className="mt-1 space-y-1">
          {results.map((track) => (
            <button
              key={track.id}
              type="button"
              onClick={() => {
                onSelect({
                  title: track.title,
                  artist: track.artist,
                  albumArt: track.albumArt,
                  musicbrainzRecordingId: track.id,
                });
                setQuery("");
                setResults([]);
              }}
              className="flex w-full items-center gap-2 rounded-lg border border-border bg-background p-1.5 text-left transition-all hover:bg-card-hover"
            >
              {track.albumArt ? (
                <img
                  src={track.albumArt}
                  alt=""
                  className="h-7 w-7 rounded"
                />
              ) : (
                <div className="h-7 w-7 rounded bg-border flex items-center justify-center text-[10px] text-muted">
                  ♪
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{track.title}</p>
                <p className="truncate text-[10px] text-muted">
                  {track.artist}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function HonorableMentionFields({ mentions, onChange }: Props) {
  const addMention = () => {
    onChange([
      ...mentions,
      { id: crypto.randomUUID(), songTitle: "", artist: "" },
    ]);
  };

  const removeMention = (id: string) => {
    onChange(mentions.filter((m) => m.id !== id));
  };

  const updateMention = (
    id: string,
    field: keyof HonorableMention,
    value: string
  ) => {
    onChange(
      mentions.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const selectTrackForMention = (
    id: string,
    track: {
      title: string;
      artist: string;
      albumArt?: string;
      musicbrainzRecordingId?: string;
    }
  ) => {
    onChange(
      mentions.map((m) =>
        m.id === id
          ? {
              ...m,
              songTitle: track.title,
              artist: track.artist,
              albumArt: track.albumArt,
              musicbrainzRecordingId: track.musicbrainzRecordingId,
            }
          : m
      )
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-muted">
          Honorable Mentions
        </label>
        <button
          type="button"
          onClick={addMention}
          className="rounded-lg bg-card px-3 py-1 text-xs font-medium text-accent transition-colors hover:bg-card-hover"
        >
          + Add HM
        </button>
      </div>

      {mentions.map((mention, idx) => (
        <div
          key={mention.id}
          className="animate-fade-in rounded-lg border border-border bg-card/50 p-3 space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted font-medium">
                HM #{idx + 1}
              </span>
              {mention.albumArt && (
                <img
                  src={mention.albumArt}
                  alt=""
                  className="h-5 w-5 rounded"
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => removeMention(mention.id)}
              className="text-xs text-muted hover:text-red-400 transition-colors"
            >
              Remove
            </button>
          </div>

          <HmMusicSearch
            onSelect={(track) => selectTrackForMention(mention.id, track)}
          />

          <input
            type="text"
            placeholder="Song title"
            value={mention.songTitle}
            onChange={(e) =>
              updateMention(mention.id, "songTitle", e.target.value)
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
          />
          <input
            type="text"
            placeholder="Artist"
            value={mention.artist}
            onChange={(e) =>
              updateMention(mention.id, "artist", e.target.value)
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
          />
          <input
            type="text"
            placeholder="Comment (optional)"
            value={mention.comment ?? ""}
            onChange={(e) =>
              updateMention(mention.id, "comment", e.target.value)
            }
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent transition-colors"
          />
        </div>
      ))}
    </div>
  );
}
