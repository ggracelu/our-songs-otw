"use client";

import { useEffect, useState, useRef } from "react";
import type { Profile } from "@/lib/types";

const USERNAME_RE = /^[a-z0-9][a-z0-9-]{1,18}[a-z0-9]$/;

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((p: Profile) => {
        setProfile(p);
        setUsername(p.username || "");
        setBio(p.bio || "");
        setIsPublic(p.isPublic);
        setAvatarUrl(p.avatarUrl);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError("");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to upload avatar");
        return;
      }

      const { avatarUrl: newUrl } = await res.json();
      setAvatarUrl(newUrl);
      setSuccess("Profile picture updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, bio, isPublic }),
    });

    if (res.status === 409) {
      setError("Username already taken");
      setSaving(false);
      return;
    }

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setSaving(false);
      return;
    }

    const updated: Profile = await res.json();
    setProfile(updated);
    setSuccess("Settings saved!");
    setSaving(false);
    setTimeout(() => setSuccess(""), 3000);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-muted">Could not load profile.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-medium mb-2">Profile Picture</label>
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-xl font-bold text-muted">
                {(profile.displayName || profile.username || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-card disabled:opacity-50"
              >
                {uploadingAvatar ? "Uploading..." : "Change Picture"}
              </button>
              <p className="mt-1 text-xs text-muted">JPG, PNG, or WebP. Max 2MB.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Username */}
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
              onChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))
              }
              maxLength={20}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 pl-8 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A few words about your music taste..."
            maxLength={160}
            rows={2}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
          />
          <p className="mt-0.5 text-right text-xs text-muted">{bio.length}/160</p>
        </div>

        {/* Public toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <div>
            <p className="text-sm font-medium">Public profile</p>
            <p className="text-xs text-muted">
              Anyone can view your song grid
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            onClick={() => setIsPublic(!isPublic)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
              isPublic ? "bg-accent" : "bg-border"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                isPublic ? "translate-x-5.5" : "translate-x-0.5"
              } mt-0.5`}
            />
          </button>
        </div>

        {/* Shareable link */}
        {isPublic && username && (
          <div className="rounded-lg border border-border bg-card/50 px-4 py-3">
            <p className="text-xs text-muted mb-1">Your shareable link</p>
            <p className="text-sm font-mono text-accent break-all">
              oursongsotw.com/u/{username}
            </p>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
        {success && <p className="text-sm text-green-400">{success}</p>}

        <button
          type="submit"
          disabled={!USERNAME_RE.test(username) || saving}
          className="w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
