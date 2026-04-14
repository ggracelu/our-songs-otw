"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const USERNAME_RE = /^[a-z0-9][a-z0-9-]{1,18}[a-z0-9]$/;

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // On mount, check if user already has a username
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((p) => {
        if (p.username) router.replace("/");
      })
      .catch(() => {});
  }, [router]);

  function handleUsernameChange(value: string) {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setUsername(clean);
    setError("");
    setAvailable(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!clean || clean.length < 3) {
      return;
    }

    if (!USERNAME_RE.test(clean)) {
      setError("Must be 3-20 chars: letters, numbers, hyphens (no leading/trailing hyphen)");
      return;
    }

    setChecking(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/profile/${clean}`);
        // 404 means available (no public profile with that name)
        // But we need a better check - the username could be taken by a private profile
        // So we'll just try to claim it and handle 409
        setAvailable(res.status === 404);
        setChecking(false);
      } catch {
        setChecking(false);
      }
    }, 400);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!USERNAME_RE.test(username)) {
      setError("Invalid username");
      return;
    }

    setSubmitting(true);
    setError("");

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, bio: bio || undefined, isPublic: true }),
    });

    if (res.status === 409) {
      setError("Username already taken");
      setAvailable(false);
      setSubmitting(false);
      return;
    }

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setSubmitting(false);
      return;
    }

    router.push("/");
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4">
      <div className="w-full space-y-6">
        <div className="text-center">
          <span className="text-4xl">&#9835;</span>
          <h1 className="mt-2 text-2xl font-bold">Welcome to Our Songs OTW</h1>
          <p className="mt-1 text-sm text-muted">
            Choose a username to get started. This will be your public profile URL.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">@</span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => handleUsernameChange(e.target.value)}
                placeholder="your-username"
                maxLength={20}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 pl-8 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                autoFocus
              />
            </div>
            {username.length >= 3 && !error && (
              <p className="mt-1 text-xs">
                {checking ? (
                  <span className="text-muted">Checking availability...</span>
                ) : available ? (
                  <span className="text-green-400">Available!</span>
                ) : available === false ? (
                  <span className="text-red-400">Taken</span>
                ) : null}
              </p>
            )}
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
            {username && (
              <p className="mt-1 text-xs text-muted">
                Your profile: oursongsotw.com/u/{username}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-1">
              Bio <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Music lover, indie fan..."
              maxLength={160}
              rows={2}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            />
            <p className="mt-0.5 text-right text-xs text-muted">{bio.length}/160</p>
          </div>

          <button
            type="submit"
            disabled={!USERNAME_RE.test(username) || submitting}
            className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Claiming..." : "Claim Username"}
          </button>
        </form>
      </div>
    </div>
  );
}
