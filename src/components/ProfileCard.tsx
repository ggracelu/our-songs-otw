"use client";

import Link from "next/link";
import { FollowButton } from "./FollowButton";
import type { ProfileCard as ProfileCardType } from "@/lib/types";

export function ProfileCard({
  profile,
  onFollowToggle,
}: {
  profile: ProfileCardType;
  onFollowToggle?: (id: string, isFollowing: boolean) => void;
}) {
  return (
    <div className="rounded-xl bg-card p-4 transition-colors hover:bg-card-hover">
      <div className="flex items-start gap-3">
        <Link href={`/u/${profile.username}`} className="shrink-0">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName || profile.username}
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-border text-sm font-bold text-muted">
              {(profile.displayName || profile.username).charAt(0).toUpperCase()}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/u/${profile.username}`} className="block font-medium truncate hover:text-accent transition-colors">
                {profile.displayName || profile.username}
              </Link>
              <Link href={`/u/${profile.username}`} className="block text-sm text-muted truncate hover:text-accent transition-colors">
                @{profile.username}
              </Link>
            </div>
            <FollowButton
              targetUserId={profile.id}
              initialIsFollowing={profile.isFollowing}
              onToggle={(isFollowing) => onFollowToggle?.(profile.id, isFollowing)}
            />
          </div>

          {profile.bio && (
            <p className="mt-1 text-sm text-foreground/70 line-clamp-2">{profile.bio}</p>
          )}

          {profile.sharedArtists && profile.sharedArtists.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {profile.sharedArtists.map((artist) => (
                <span
                  key={artist}
                  className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent"
                >
                  {artist}
                </span>
              ))}
              {profile.sharedCount && profile.sharedCount > profile.sharedArtists.length && (
                <span className="rounded-full bg-border px-2.5 py-0.5 text-xs text-muted">
                  +{profile.sharedCount - profile.sharedArtists.length} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
