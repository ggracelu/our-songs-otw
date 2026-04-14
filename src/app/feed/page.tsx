"use client";

import { useEffect, useState, useCallback } from "react";
import { FeedEntryCard } from "@/components/FeedEntryCard";
import { ProfileCard } from "@/components/ProfileCard";
import { UserSearch } from "@/components/UserSearch";
import type { FeedEntry, ProfileCard as ProfileCardType } from "@/lib/types";

export default function FeedPage() {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [discover, setDiscover] = useState<ProfileCardType[]>([]);
  const [loadingDiscover, setLoadingDiscover] = useState(true);

  const [searchResults, setSearchResults] = useState<ProfileCardType[] | null>(null);
  const [searchActive, setSearchActive] = useState(false);

  // Fetch feed
  useEffect(() => {
    fetch("/api/feed?limit=20&offset=0")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries || []);
        setHasMore(data.hasMore || false);
      })
      .catch(() => {})
      .finally(() => setLoadingFeed(false));
  }, []);

  // Fetch discover
  useEffect(() => {
    fetch("/api/feed/discover?limit=6")
      .then((r) => r.json())
      .then((data) => setDiscover(data || []))
      .catch(() => {})
      .finally(() => setLoadingDiscover(false));
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/feed?limit=20&offset=${entries.length}`);
      const data = await res.json();
      setEntries((prev) => [...prev, ...(data.entries || [])]);
      setHasMore(data.hasMore || false);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }

  const handleSearchResults = useCallback((results: ProfileCardType[] | null) => {
    setSearchResults(results);
  }, []);

  const handleSearchActive = useCallback((active: boolean) => {
    setSearchActive(active);
  }, []);

  function handleDiscoverFollowToggle(id: string, isFollowing: boolean) {
    setDiscover((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFollowing } : p))
    );
  }

  function handleSearchFollowToggle(id: string, isFollowing: boolean) {
    setSearchResults((prev) =>
      prev ? prev.map((p) => (p.id === id ? { ...p, isFollowing } : p)) : prev
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Feed</h1>

      {/* Search */}
      <div className="mb-6">
        <UserSearch onResults={handleSearchResults} onActiveChange={handleSearchActive} />
      </div>

      {/* Search results */}
      {searchActive && (
        <div className="mb-8">
          {searchResults === null ? (
            <p className="text-sm text-muted py-4 text-center">Searching...</p>
          ) : searchResults.length === 0 ? (
            <p className="text-sm text-muted py-4 text-center">No users found</p>
          ) : (
            <div className="space-y-3">
              {searchResults.map((p) => (
                <ProfileCard key={p.id} profile={p} onFollowToggle={handleSearchFollowToggle} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Feed + Discover (hidden during search) */}
      {!searchActive && (
        <>
          {/* Feed section */}
          <section className="mb-10">
            {loadingFeed ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 animate-pulse rounded-xl bg-card" />
                ))}
              </div>
            ) : entries.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center">
                <p className="text-3xl mb-2">&#9835;</p>
                <p className="font-medium">Your feed is empty</p>
                <p className="text-sm text-muted mt-1">Follow people to see their picks here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <FeedEntryCard key={entry.entryId} entry={entry} />
                ))}
                {hasMore && (
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="w-full rounded-xl border border-border py-2.5 text-sm font-medium text-muted hover:text-foreground hover:border-accent/50 transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? "Loading..." : "Load more"}
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Discover section */}
          <section>
            <h2 className="mb-4 text-lg font-semibold">Discover</h2>
            {loadingDiscover ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-card" />
                ))}
              </div>
            ) : discover.length === 0 ? (
              <p className="text-sm text-muted">No recommendations yet. Add some songs to get personalized suggestions!</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {discover.map((p) => (
                  <ProfileCard key={p.id} profile={p} onFollowToggle={handleDiscoverFollowToggle} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
