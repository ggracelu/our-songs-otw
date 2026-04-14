import { auth } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { mapDbProfileToProfile } from "@/lib/mappers";
import { NextRequest, NextResponse } from "next/server";

const USERNAME_RE = /^[a-z0-9][a-z0-9-]{1,18}[a-z0-9]$/;

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("clerk_id", userId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json(mapDbProfileToProfile(data));
}

export async function PUT(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { username, bio, isPublic } = body as {
    username?: string;
    bio?: string;
    isPublic?: boolean;
  };

  const supabase = createServiceClient();

  // Build update object
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (username !== undefined) {
    const clean = username.toLowerCase().trim();
    if (!USERNAME_RE.test(clean)) {
      return NextResponse.json(
        { error: "Username must be 3-20 characters, lowercase letters, numbers, and hyphens only" },
        { status: 400 }
      );
    }

    // Check uniqueness (excluding own profile)
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", clean)
      .neq("clerk_id", userId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }

    updates.username = clean;
  }

  if (bio !== undefined) {
    updates.bio = bio.slice(0, 160) || null;
  }

  if (isPublic !== undefined) {
    updates.is_public = isPublic;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("clerk_id", userId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapDbProfileToProfile(data));
}
