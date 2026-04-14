"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { FollowButton } from "./FollowButton";

interface ProfileHeaderClientProps {
  profileId: string;
  profileClerkId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

export function ProfileHeaderClient({
  profileId,
  profileClerkId,
  username,
  displayName,
  avatarUrl,
  bio,
}: ProfileHeaderClientProps) {
  const { userId, isSignedIn } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const isOwnProfile = userId === profileClerkId;
  const showFollowButton = isSignedIn && !isOwnProfile;

  useEffect(() => {
    if (!isSignedIn) return;

    fetch(`/api/follows/status?targetUserId=${profileId}`)
      .then((r) => r.json())
      .then((data) => {
        setIsFollowing(data.isFollowing);
        setFollowerCount(data.followerCount);
        setFollowingCount(data.followingCount);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [isSignedIn, profileId]);

  return (
    <div className="mb-8 flex items-center gap-4">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName || username}
          className="h-16 w-16 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-xl font-bold text-muted">
          {(displayName || username).charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <div>
            {displayName && (
              <h1 className="text-xl font-bold">{displayName}</h1>
            )}
            <p className="text-sm text-muted">@{username}</p>
          </div>
          {showFollowButton && loaded && (
            <FollowButton
              targetUserId={profileId}
              initialIsFollowing={isFollowing}
              onToggle={(following) => {
                setIsFollowing(following);
                setFollowerCount((c) => c + (following ? 1 : -1));
              }}
            />
          )}
        </div>
        {bio && (
          <p className="mt-1 text-sm text-foreground/80">{bio}</p>
        )}
        {loaded && (
          <div className="mt-1 flex gap-3 text-xs text-muted">
            <span><span className="font-medium text-foreground">{followerCount}</span> followers</span>
            <span><span className="font-medium text-foreground">{followingCount}</span> following</span>
          </div>
        )}
      </div>
    </div>
  );
}
