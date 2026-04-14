import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { getProfileId } from "@/lib/profile";
import { NextRequest, NextResponse } from "next/server";
import type { ProfileCard } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getProfileId(userId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const limit = Math.min(Number(request.nextUrl.searchParams.get("limit")) || 6, 20);
  const supabase = createServiceClient();

  // Get current user's distinct artists
  const { data: myEntries } = await supabase
    .from("week_entries")
    .select("artist")
    .eq("user_id", profileId);

  const myArtists = new Set((myEntries || []).map((e) => e.artist.toLowerCase()));

  // Get followed user IDs to exclude
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", profileId);

  const excludeIds = new Set([profileId, ...(follows || []).map((f) => f.following_id)]);

  // Get public profiles with entries (excluding self + followed)
  const { data: candidates } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .eq("is_public", true)
    .not("username", "is", null);

  if (!candidates || candidates.length === 0) {
    return NextResponse.json([]);
  }

  const eligibleProfiles = candidates.filter((p) => !excludeIds.has(p.id));

  if (eligibleProfiles.length === 0) {
    return NextResponse.json([]);
  }

  // If user has no entries, return random public profiles that have entries
  if (myArtists.size === 0) {
    const profileIds = eligibleProfiles.map((p) => p.id);
    const { data: usersWithEntries } = await supabase
      .from("week_entries")
      .select("user_id")
      .in("user_id", profileIds);

    const activeIds = new Set((usersWithEntries || []).map((e) => e.user_id));
    const active = eligibleProfiles
      .filter((p) => activeIds.has(p.id))
      .slice(0, limit);

    const result: ProfileCard[] = active.map((p) => ({
      id: p.id,
      username: p.username,
      displayName: p.display_name,
      avatarUrl: p.avatar_url,
      bio: p.bio,
      isFollowing: false,
    }));

    return NextResponse.json(result);
  }

  // Get all entries for eligible profiles
  const eligibleIds = eligibleProfiles.map((p) => p.id);
  const { data: theirEntries } = await supabase
    .from("week_entries")
    .select("user_id, artist")
    .in("user_id", eligibleIds);

  // Compute artist overlap per user
  const userArtistMap = new Map<string, Set<string>>();
  for (const e of theirEntries || []) {
    if (!userArtistMap.has(e.user_id)) {
      userArtistMap.set(e.user_id, new Set());
    }
    userArtistMap.get(e.user_id)!.add(e.artist.toLowerCase());
  }

  const scored: { profileId: string; shared: string[]; count: number }[] = [];
  for (const [uid, artists] of userArtistMap) {
    const shared = [...artists].filter((a) => myArtists.has(a));
    if (shared.length > 0) {
      scored.push({ profileId: uid, shared, count: shared.length });
    }
  }

  scored.sort((a, b) => b.count - a.count);
  const top = scored.slice(0, limit);

  const profileMap = new Map(eligibleProfiles.map((p) => [p.id, p]));
  const result: ProfileCard[] = top.map((s) => {
    const p = profileMap.get(s.profileId)!;
    return {
      id: p.id,
      username: p.username,
      displayName: p.display_name,
      avatarUrl: p.avatar_url,
      bio: p.bio,
      isFollowing: false,
      sharedArtists: s.shared.slice(0, 3),
      sharedCount: s.count,
    };
  });

  // If we have fewer than limit, pad with random active profiles
  if (result.length < limit) {
    const usedIds = new Set(result.map((r) => r.id));
    const remaining = eligibleProfiles
      .filter((p) => !usedIds.has(p.id) && userArtistMap.has(p.id))
      .slice(0, limit - result.length);

    for (const p of remaining) {
      result.push({
        id: p.id,
        username: p.username,
        displayName: p.display_name,
        avatarUrl: p.avatar_url,
        bio: p.bio,
        isFollowing: false,
      });
    }
  }

  return NextResponse.json(result);
}
