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

  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1) {
    return NextResponse.json([]);
  }

  const supabase = createServiceClient();

  // Search by username or display_name prefix (ILIKE)
  const pattern = `${q}%`;
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio")
    .eq("is_public", true)
    .not("username", "is", null)
    .or(`username.ilike.${pattern},display_name.ilike.${pattern}`)
    .limit(10);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json([]);
  }

  // Check which ones the user follows
  const candidateIds = profiles.map((p) => p.id);
  const { data: follows } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", profileId)
    .in("following_id", candidateIds);

  const followingSet = new Set((follows || []).map((f) => f.following_id));

  const result: ProfileCard[] = profiles
    .filter((p) => p.id !== profileId)
    .map((p) => ({
      id: p.id,
      username: p.username,
      displayName: p.display_name,
      avatarUrl: p.avatar_url,
      bio: p.bio,
      isFollowing: followingSet.has(p.id),
    }));

  return NextResponse.json(result);
}
