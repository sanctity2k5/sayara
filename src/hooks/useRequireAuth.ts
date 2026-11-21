"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/utils";

function useClerkRequireAuth() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const requireAuth = useCallback((): boolean => {
    if (isLoaded && isSignedIn) return true;
    const search = typeof window !== "undefined" ? window.location.search : "";
    const returnTo = `${pathname}${search}`;
    router.push(`/sign-up?redirect_url=${encodeURIComponent(returnTo)}`);
    return false;
  }, [isLoaded, isSignedIn, pathname, router]);

  return { isLoaded, isSignedIn: Boolean(isLoaded && isSignedIn), requireAuth };
}

function useFallbackRequireAuth() {
  const router = useRouter();
  const pathname = usePathname();

  const requireAuth = useCallback((): boolean => {
    const search = typeof window !== "undefined" ? window.location.search : "";
    const returnTo = `${pathname}${search}`;
    router.push(`/sign-up?redirect_url=${encodeURIComponent(returnTo)}`);
    return false;
  }, [pathname, router]);

  return { isLoaded: true, isSignedIn: false, requireAuth };
}

export function useRequireAuth() {
  if (isClerkConfigured()) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useClerkRequireAuth();
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useFallbackRequireAuth();
}
