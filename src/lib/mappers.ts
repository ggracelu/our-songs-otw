import type { WeekEntry, HonorableMention, Season } from "./types";

// DB row shapes returned by Supabase queries
interface DbHonorableMention {
  id: string;
  song_title: string;
  artist: string;
  comment: string | null;
  album_art: string | null;
  musicbrainz_recording_id: string | null;
  sort_order: number;
}

interface DbWeekEntry {
  id: string;
  week_number: number;
  date: string;
  song_title: string;
  artist: string;
  comment: string;
  rating: number | null;
  season: string;
  album_art: string | null;
  musicbrainz_recording_id: string | null;
  musicbrainz_release_id: string | null;
  honorable_mentions: DbHonorableMention[];
}

function mapHm(row: DbHonorableMention): HonorableMention {
  return {
    id: row.id,
    songTitle: row.song_title,
    artist: row.artist,
    comment: row.comment ?? undefined,
    albumArt: row.album_art ?? undefined,
    musicbrainzRecordingId: row.musicbrainz_recording_id ?? undefined,
  };
}

export function mapDbEntryToWeekEntry(row: DbWeekEntry): WeekEntry {
  return {
    id: row.id,
    weekNumber: row.week_number,
    date: row.date,
    songTitle: row.song_title,
    artist: row.artist,
    comment: row.comment,
    rating: row.rating ?? undefined,
    season: row.season as Season,
    albumArt: row.album_art ?? undefined,
    musicbrainzRecordingId: row.musicbrainz_recording_id ?? undefined,
    musicbrainzReleaseId: row.musicbrainz_release_id ?? undefined,
    honorableMentions: (row.honorable_mentions || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(mapHm),
  };
}
