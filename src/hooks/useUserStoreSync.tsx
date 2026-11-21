"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/utils";
import { useSayaraStore } from "@/store/useSayaraStore";

function ClerkSyncBridge() {
  const { userId, isLoaded } = useAuth();
  const router = useRouter();
  const setActiveUser = useSayaraStore((s) => s.setActiveUser);
  const clearUserData = useSayaraStore((s) => s.clearUserData);
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;

    const prev = prevUserIdRef.current;
    prevUserIdRef.current = userId ?? null;

    if (userId) {
      setActiveUser(userId);
    } else {
      clearUserData();
      if (prev) {
        router.push("/");
      }
    }
  }, [isLoaded, userId, setActiveUser, clearUserData, router]);

  return null;
}

export function UserStoreSync() {
  const clearUserData = useSayaraStore((s) => s.clearUserData);

  useEffect(() => {
    if (!isClerkConfigured()) {
      clearUserData();
    }
  }, [clearUserData]);

  if (!isClerkConfigured()) return null;
  return <ClerkSyncBridge />;
}
