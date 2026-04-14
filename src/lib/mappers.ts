import type { WeekEntry, HonorableMention, Profile, Season, FeedEntry } from "./types";

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

interface DbProfile {
  id: string;
  clerk_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export function mapDbProfileToProfile(row: DbProfile): Profile {
  return {
    id: row.id,
    clerkId: row.clerk_id,
    username: row.username ?? "",
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    bio: row.bio,
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
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

interface DbFeedRow {
  id: string;
  user_id: string;
  week_number: number;
  song_title: string;
  artist: string;
  comment: string;
  album_art: string | null;
  season: string;
  date: string;
  created_at: string;
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

export function mapDbRowToFeedEntry(row: DbFeedRow): FeedEntry {
  return {
    entryId: row.id,
    userId: row.user_id,
    displayName: row.profiles.display_name ?? row.profiles.username,
    username: row.profiles.username,
    avatarUrl: row.profiles.avatar_url,
    weekNumber: row.week_number,
    songTitle: row.song_title,
    artist: row.artist,
    comment: row.comment,
    albumArt: row.album_art,
    season: row.season as Season,
    date: row.date,
    createdAt: row.created_at,
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
