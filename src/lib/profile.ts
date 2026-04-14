import { createServiceClient } from "./supabase";

export async function getProfileId(clerkId: string): Promise<string | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_id", clerkId)
    .single();
  return data?.id ?? null;
}
