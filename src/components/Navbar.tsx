"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/nextjs";

const links = [
  { href: "/", label: "Home" },
  { href: "/add", label: "Add Song" },
  { href: "/feed", label: "Feed" },
  { href: "/playlist", label: "Playlist" },
  { href: "/stats", label: "Stats" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.username) setUsername(data.username);
      })
      .catch(() => {});
  }, [isSignedIn]);

  return (
    <nav className="sticky top-0 z-50 border-b border-border backdrop-blur-xl bg-background/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <span className="text-accent">&#9835;</span>
          <span className="hidden sm:inline">Our Songs OTW</span>
        </Link>

        <div className="flex items-center gap-1">
          <SignedIn>
            {links.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent/15 text-accent"
                      : "text-muted hover:text-foreground hover:bg-card"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </SignedIn>
        </div>

        <div className="flex items-center gap-2">
          <SignedIn>
            <Link
              href="/settings"
              className={`rounded-lg p-1.5 transition-colors ${
                pathname === "/settings"
                  ? "text-accent"
                  : "text-muted hover:text-foreground"
              }`}
              title="Settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Link>
            <UserButton>
              {username && (
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="View Profile"
                    labelIcon={
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    }
                    href={`/u/${username}`}
                  />
                </UserButton.MenuItems>
              )}
            </UserButton>
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-80">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
}
