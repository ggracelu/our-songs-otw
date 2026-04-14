import { auth, currentUser } from "@clerk/nextjs/server";
import { createServiceClient } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const displayName =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null;

  const supabase = createServiceClient();
  const { error } = await supabase.from("profiles").upsert(
    {
      clerk_id: userId,
      display_name: displayName,
      avatar_url: user.imageUrl ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "clerk_id" }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
