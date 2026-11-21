"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { isClerkConfigured } from "@/lib/utils";
import { UserStoreSync } from "@/hooks/useUserStoreSync";
import { ThemeProvider } from "./ThemeProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const clerkEnabled = isClerkConfigured();

  const inner = (
    <ThemeProvider>
      <UserStoreSync />
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: "rgb(var(--color-surface))",
            color: "rgb(var(--color-ink))",
            border: "1px solid rgb(var(--color-line))",
          },
        }}
      />
    </ThemeProvider>
  );

  if (!clerkEnabled) {
    return inner;
  }

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: "#E13B2B",
          colorBackground: "#12141A",
          colorForeground: "#F4F4F0",
          colorInput: "#0A0B0E",
          colorInputForeground: "#F4F4F0",
          borderRadius: "6px",
        },
      }}
    >
      {inner}
    </ClerkProvider>
  );
}
