import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getProfileId } from "@/lib/profile";
import { mapDbEntryToWeekEntry } from "@/lib/mappers";
import { getWeekNumber, getSeason } from "@/lib/utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const profileId = await getProfileId(userId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const supabase = createServiceClient();

  // Verify ownership
  const { data: existing } = await supabase
    .from("week_entries")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== profileId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.songTitle !== undefined) updates.song_title = body.songTitle.trim();
  if (body.artist !== undefined) updates.artist = body.artist.trim();
  if (body.comment !== undefined) updates.comment = (body.comment || "").trim();
  if (body.rating !== undefined) updates.rating = body.rating || null;
  if (body.albumArt !== undefined) updates.album_art = body.albumArt || null;
  if (body.date !== undefined) {
    updates.date = body.date;
    updates.week_number = getWeekNumber(body.date);
    updates.season = getSeason(body.date);
    updates.year = new Date(body.date + "T00:00:00").getFullYear();
  }

  const { error: updateError } = await supabase
    .from("week_entries")
    .update(updates)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Replace honorable mentions if provided
  if (body.honorableMentions !== undefined) {
    await supabase.from("honorable_mentions").delete().eq("week_entry_id", id);

    if (body.honorableMentions?.length) {
      const hms = body.honorableMentions.map(
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
          week_entry_id: id,
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
  }

  // Re-fetch with HMs
  const { data: full } = await supabase
    .from("week_entries")
    .select("*, honorable_mentions(*)")
    .eq("id", id)
    .single();

  return NextResponse.json(mapDbEntryToWeekEntry(full!));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const profileId = await getProfileId(userId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const supabase = createServiceClient();

  // Verify ownership
  const { data: existing } = await supabase
    .from("week_entries")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== profileId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete (HMs cascade)
  const { error } = await supabase.from("week_entries").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
