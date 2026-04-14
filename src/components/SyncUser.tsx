"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function SyncUser() {
  const { userId } = useAuth();
  const synced = useRef(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (userId && !synced.current) {
      synced.current = true;
      fetch("/api/auth/sync", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (
            data.success &&
            !data.hasUsername &&
            pathname !== "/onboarding"
          ) {
            router.push("/onboarding");
          }
        })
        .catch(() => {});
    }
  }, [userId, pathname, router]);

  return null;
}
