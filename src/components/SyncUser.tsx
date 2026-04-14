"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export default function SyncUser() {
  const { userId } = useAuth();
  const synced = useRef(false);

  useEffect(() => {
    if (userId && !synced.current) {
      synced.current = true;
      fetch("/api/auth/sync", { method: "POST" });
    }
  }, [userId]);

  return null;
}
