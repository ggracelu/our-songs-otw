import { createServiceClient } from "@/lib/supabase";
import { mapDbProfileToProfile, mapDbEntryToWeekEntry } from "@/lib/mappers";
import { WeekGrid } from "@/components/WeekGrid";
import { ProfileHeaderClient } from "@/components/ProfileHeaderClient";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = createServiceClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username.toLowerCase())
    .single();

  if (!profile || !profile.is_public) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-4xl">&#9835;</p>
          <h1 className="text-xl font-semibold">Profile not found</h1>
          <p className="text-sm text-muted">
            This user doesn&apos;t exist or their profile is private.
          </p>
        </div>
      </div>
    );
  }

  const mapped = mapDbProfileToProfile(profile);
  const currentYear = new Date().getFullYear();

  const { data: entries } = await supabase
    .from("week_entries")
    .select("*, honorable_mentions(*)")
    .eq("user_id", profile.id)
    .eq("year", currentYear)
    .order("week_number", { ascending: true });

  const weekEntries = (entries || []).map(mapDbEntryToWeekEntry);
  const filledWeeks = weekEntries.length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Profile header with follow button */}
      <ProfileHeaderClient
        profileId={mapped.id}
        profileClerkId={mapped.clerkId}
        username={mapped.username}
        displayName={mapped.displayName}
        avatarUrl={mapped.avatarUrl}
        bio={mapped.bio}
      />

      {/* Stats bar */}
      <div className="mb-6 flex items-center gap-4 text-sm text-muted">
        <span>{filledWeeks}/52 weeks filled</span>
        <span>{currentYear}</span>
      </div>

      {/* Week grid */}
      <WeekGrid entries={weekEntries} year={currentYear} readOnly />
    </div>
  );
}
