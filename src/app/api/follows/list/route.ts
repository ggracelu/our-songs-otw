import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { getProfileId } from "@/lib/profile";
import { NextResponse } from "next/server";
import type { ProfileCard } from "@/lib/types";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getProfileId(userId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const supabase = createServiceClient();

  const { data: follows } = await supabase
    .from("follows")
    .select("following_id, profiles!follows_following_id_fkey(id, username, display_name, avatar_url, bio)")
    .eq("follower_id", profileId);

  const profiles: ProfileCard[] = (follows || []).map((f) => {
    const p = f.profiles as unknown as {
      id: string;
      username: string;
      display_name: string | null;
      avatar_url: string | null;
      bio: string | null;
    };
    return {
      id: p.id,
      username: p.username,
      displayName: p.display_name,
      avatarUrl: p.avatar_url,
      bio: p.bio,
      isFollowing: true,
    };
  });

  return NextResponse.json(profiles);
}
