"use client";

import { useState } from "react";

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
  onToggle?: (isFollowing: boolean) => void;
}

export function FollowButton({ targetUserId, initialIsFollowing, onToggle }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [hovering, setHovering] = useState(false);

  async function handleClick() {
    setLoading(true);
    const prev = isFollowing;
    setIsFollowing(!prev);
    onToggle?.(!prev);

    try {
      const res = await fetch("/api/follows", {
        method: prev ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (!res.ok) {
        setIsFollowing(prev);
        onToggle?.(prev);
      }
    } catch {
      setIsFollowing(prev);
      onToggle?.(prev);
    } finally {
      setLoading(false);
    }
  }

  const showUnfollow = isFollowing && hovering;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
        isFollowing
          ? showUnfollow
            ? "border border-red-500/50 text-red-400 hover:bg-red-500/10"
            : "border border-accent/50 text-accent bg-accent/10"
          : "bg-accent text-white hover:opacity-80"
      } disabled:opacity-50`}
    >
      {loading ? "..." : showUnfollow ? "Unfollow" : isFollowing ? "Following" : "Follow"}
    </button>
  );
}
