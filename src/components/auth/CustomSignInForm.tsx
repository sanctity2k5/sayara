"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignIn } from "@clerk/nextjs/legacy";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

function extractClerkError(err: unknown): string {
  if (err && typeof err === "object" && "errors" in err) {
    const errors = (err as { errors?: Array<{ longMessage?: string; message?: string }> }).errors;
    if (errors && errors.length > 0) {
      return errors[0].longMessage || errors[0].message || "Authentication failed.";
    }
  }
  return "Unable to sign in. Please check your credentials and try again.";
}

export function CustomSignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect_url");
  const targetUrl =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setError(null);
    setSubmitting(true);

    try {
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Welcome back to SAYARA.");
        router.push(targetUrl);
        router.refresh();
      } else {
        setError("Additional verification is required to complete sign-in.");
      }
    } catch (err) {
      setError(extractClerkError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleOAuth = async () => {
    if (!isLoaded || !signIn) return;
    setError(null);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: targetUrl,
      });
    } catch (err) {
      setError(extractClerkError(err));
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <p className="kicker">Member Access</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">Sign in to SAYARA</h1>
        <p className="mt-2 text-sm text-muted">
          Access your saved vehicles, listings manager, buyer inquiries, and market analytics.
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogleOAuth}
        disabled={!isLoaded}
        className="flex w-full items-center justify-center gap-2.5 rounded-md border border-line bg-surface px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink transition hover:border-ink/40 disabled:opacity-50"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M21.35 11.1h-9.18v2.98h5.27c-.23 1.24-.92 2.29-1.97 3v2.49h3.18c1.86-1.71 2.94-4.24 2.94-7.24 0-.42-.04-.83-.11-1.23z"
          />
          <path
            fill="currentColor"
            d="M12.17 22c2.65 0 4.88-.88 6.51-2.43l-3.18-2.49c-.88.59-2.01.95-3.33.95-2.56 0-4.73-1.73-5.51-4.05H3.38v2.57C5 19.78 8.33 22 12.17 22z"
          />
          <path
            fill="currentColor"
            d="M6.66 13.98A5.86 5.86 0 0 1 6.35 12c0-.69.12-1.35.31-1.98V7.45H3.38A9.99 9.99 0 0 0 2.17 12c0 1.61.39 3.14 1.21 4.55l3.28-2.57z"
          />
          <path
            fill="currentColor"
            d="M12.17 5.97c1.44 0 2.74.5 3.76 1.47l2.82-2.82C17.04 3.03 14.82 2 12.17 2 8.33 2 5 4.22 3.38 7.45l3.28 2.57c.78-2.32 2.95-4.05 5.51-4.05z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="relative flex items-center py-1">
        <div className="flex-1 border-t border-line" />
        <span className="px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-muted">
          or with email
        </span>
        <div className="flex-1 border-t border-line" />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-signal/40 bg-signal/10 px-4 py-3 text-xs text-signal"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Email Address
          </span>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1.5 w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-signal focus:outline-none"
          />
        </label>

        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
            Password
          </span>
          <div className="relative mt-1.5">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-md border border-line bg-surface py-2.5 pl-3.5 pr-10 text-sm text-ink placeholder:text-muted/60 focus:border-signal focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <button
          type="submit"
          disabled={!isLoaded || submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-signal px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-signal-hover disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-muted">
        New to SAYARA?{" "}
        <Link
          href={rawRedirect ? `/sign-up?redirect_url=${encodeURIComponent(rawRedirect)}` : "/sign-up"}
          className="font-semibold text-ink underline-offset-4 hover:text-signal hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
