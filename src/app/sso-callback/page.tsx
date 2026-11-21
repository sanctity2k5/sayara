"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/utils";

export default function SsoCallbackPage() {
  const clerkReady = isClerkConfigured();

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg text-ink">
      <div className="text-center">
        <p className="kicker">Authenticating</p>
        <p className="mt-2 font-display text-xl font-bold">Completing sign-in...</p>
      </div>
      {clerkReady && <AuthenticateWithRedirectCallback />}
    </div>
  );
}
