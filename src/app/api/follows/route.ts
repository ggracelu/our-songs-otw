import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { getProfileId } from "@/lib/profile";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getProfileId(userId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { targetUserId } = (await request.json()) as { targetUserId?: string };
  if (!targetUserId) {
    return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
  }

  if (targetUserId === profileId) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Verify target exists and is public
  const { data: target } = await supabase
    .from("profiles")
    .select("id, is_public")
    .eq("id", targetUserId)
    .single();

  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (!target.is_public) {
    return NextResponse.json({ error: "User profile is private" }, { status: 404 });
  }

  const { error } = await supabase.from("follows").upsert(
    { follower_id: profileId, following_id: targetUserId },
    { onConflict: "follower_id,following_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profileId = await getProfileId(userId);
  if (!profileId) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { targetUserId } = (await request.json()) as { targetUserId?: string };
  if (!targetUserId) {
    return NextResponse.json({ error: "targetUserId required" }, { status: 400 });
  }

  const supabase = createServiceClient();
  await supabase
    .from("follows")
    .delete()
    .eq("follower_id", profileId)
    .eq("following_id", targetUserId);

  return NextResponse.json({ success: true });
}
