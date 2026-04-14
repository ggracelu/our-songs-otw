export type Season = "winter" | "spring" | "summer" | "autumn";

export interface HonorableMention {
  id: string;
  songTitle: string;
  artist: string;
  comment?: string;
  albumArt?: string;
  musicbrainzRecordingId?: string;
}

export interface WeekEntry {
  id: string;
  weekNumber: number;
  date: string;
  songTitle: string;
  artist: string;
  comment: string;
  rating?: number; // 0.5–5 in 0.5 steps
  honorableMentions: HonorableMention[];
  season: Season;
  albumArt?: string;
  musicbrainzRecordingId?: string;
  musicbrainzReleaseId?: string;
}

export interface Profile {
  id: string;
  clerkId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedEntry {
  entryId: string;
  userId: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  weekNumber: number;
  songTitle: string;
  artist: string;
  comment: string;
  albumArt: string | null;
  season: Season;
  date: string;
  createdAt: string;
}
