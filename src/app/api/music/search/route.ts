import { NextRequest, NextResponse } from "next/server";

const MB_BASE = "https://musicbrainz.org/ws/2";
const CA_BASE = "https://coverartarchive.org";
const USER_AGENT = "OurSongsOTW/1.0 (https://github.com/ggracelu/our-songs-otw)";

interface MBRecording {
  id: string;
  title: string;
  "artist-credit"?: { name: string }[];
  releases?: { id: string; title: string }[];
}

async function getAlbumArt(releaseId: string): Promise<string | undefined> {
  try {
    const res = await fetch(`${CA_BASE}/release/${releaseId}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return undefined;
    const data = await res.json();
    const front = data.images?.find(
      (img: { front?: boolean }) => img.front
    );
    // Prefer 250px thumbnail for performance
    return (
      front?.thumbnails?.["250"] ||
      front?.thumbnails?.small ||
      front?.image ||
      undefined
    );
  } catch {
    return undefined;
  }
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const limit = Math.min(
    Number(request.nextUrl.searchParams.get("limit")) || 5,
    10
  );

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  try {
    const res = await fetch(
      `${MB_BASE}/recording/?query=${encodeURIComponent(q)}&limit=${limit}&fmt=json`,
      {
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await res.json();
    const recordings: MBRecording[] = data.recordings || [];

    // Fetch album art in parallel for all recordings that have a release
    const results = await Promise.all(
      recordings.map(async (rec) => {
        const artist =
          rec["artist-credit"]?.map((a) => a.name).join(", ") || "Unknown";
        const releaseId = rec.releases?.[0]?.id;
        const albumArt = releaseId ? await getAlbumArt(releaseId) : undefined;

        return {
          id: rec.id,
          title: rec.title,
          artist,
          albumArt,
        };
      })
    );

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
