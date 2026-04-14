import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { getProfileId } from "@/lib/profile";
import { mapDbRowToFeedEntry } from "@/lib/mappers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getProfileId(userId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { searchParams } = request.nextUrl;
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
  const offset = Number(searchParams.get("offset")) || 0;

  const supabase = createServiceClient();

  // Get IDs the user follows
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", profileId);

  const followingIds = (follows || []).map((f) => f.following_id);

  if (followingIds.length === 0) {
    return NextResponse.json({ entries: [], hasMore: false });
  }

  const { data: rows } = await supabase
    .from("week_entries")
    .select("id, user_id, week_number, song_title, artist, comment, album_art, season, date, created_at, profiles!week_entries_user_id_fkey(username, display_name, avatar_url)")
    .in("user_id", followingIds)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entries = (rows || []).map((r: any) => mapDbRowToFeedEntry(r));
  const hasMore = entries.length > limit;
  if (hasMore) entries.pop();

  return NextResponse.json({ entries, hasMore });
}
