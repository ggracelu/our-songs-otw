import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getProfileId } from "@/lib/profile";
import { mapDbEntryToWeekEntry } from "@/lib/mappers";
import { getWeekNumber, getSeason } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getProfileId(userId);
  if (!profileId) {
    // Profile not yet synced — return empty array (SyncUser will create it)
    return NextResponse.json([]);
  }

  const year =
    Number(request.nextUrl.searchParams.get("year")) ||
    new Date().getFullYear();

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("week_entries")
    .select("*, honorable_mentions(*)")
    .eq("user_id", profileId)
    .eq("year", year)
    .order("week_number", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data || []).map(mapDbEntryToWeekEntry));
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getProfileId(userId);
  if (!profileId) {
    return NextResponse.json(
      { error: "Profile not found. Please reload." },
      { status: 404 }
    );
  }

  const body = await request.json();
  const { date, songTitle, artist, comment, rating, honorableMentions, albumArt } =
    body;

  if (!date || !songTitle?.trim() || !artist?.trim()) {
    return NextResponse.json(
      { error: "date, songTitle, and artist are required" },
      { status: 400 }
    );
  }

  const weekNumber = getWeekNumber(date);
  const season = getSeason(date);
  const year = new Date(date + "T00:00:00").getFullYear();

  const supabase = createServiceClient();

  // Upsert the week entry (one song per user per week)
  const { data: entry, error: entryError } = await supabase
    .from("week_entries")
    .upsert(
      {
        user_id: profileId,
        year,
        week_number: weekNumber,
        date,
        song_title: songTitle.trim(),
        artist: artist.trim(),
        comment: (comment || "").trim(),
        rating: rating || null,
        season,
        album_art: albumArt || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,year,week_number" }
    )
    .select()
    .single();

  if (entryError) {
    return NextResponse.json({ error: entryError.message }, { status: 500 });
  }

  // Replace honorable mentions: delete old, insert new
  await supabase
    .from("honorable_mentions")
    .delete()
    .eq("week_entry_id", entry.id);

  if (honorableMentions?.length) {
    const hms = honorableMentions.map(
      (
        hm: {
          songTitle: string;
          artist: string;
          comment?: string;
          albumArt?: string;
          musicbrainzRecordingId?: string;
        },
        i: number
      ) => ({
        week_entry_id: entry.id,
        song_title: hm.songTitle,
        artist: hm.artist,
        comment: hm.comment || null,
        album_art: hm.albumArt || null,
        musicbrainz_recording_id: hm.musicbrainzRecordingId || null,
        sort_order: i,
      })
    );
    await supabase.from("honorable_mentions").insert(hms);
  }

  // Re-fetch with HMs joined
  const { data: full } = await supabase
    .from("week_entries")
    .select("*, honorable_mentions(*)")
    .eq("id", entry.id)
    .single();

  return NextResponse.json(mapDbEntryToWeekEntry(full!));
}
