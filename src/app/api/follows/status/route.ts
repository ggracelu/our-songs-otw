import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { getProfileId } from "@/lib/profile";
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

  const targetUserId = request.nextUrl.searchParams.get("targetUserId");
  if (!targetUserId) {
    return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
  }

  const supabase = createServiceClient();

  const [followCheck, followerCount, followingCount] = await Promise.all([
    supabase
      .from("follows")
      .select("id")
      .eq("follower_id", profileId)
      .eq("following_id", targetUserId)
      .maybeSingle(),
    supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("following_id", targetUserId),
    supabase
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("follower_id", targetUserId),
  ]);

  return NextResponse.json({
    isFollowing: !!followCheck.data,
    followerCount: followerCount.count ?? 0,
    followingCount: followingCount.count ?? 0,
  });
}
