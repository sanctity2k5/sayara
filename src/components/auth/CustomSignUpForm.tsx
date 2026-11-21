"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUp } from "@clerk/nextjs/legacy";
import { ArrowRight, Eye, EyeOff, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

function extractClerkError(err: unknown): string {
  if (err && typeof err === "object" && "errors" in err) {
    const errors = (err as { errors?: Array<{ longMessage?: string; message?: string }> }).errors;
    if (errors && errors.length > 0) {
      return errors[0].longMessage || errors[0].message || "Sign-up failed.";
    }
  }
  return "Unable to complete sign-up. Please review your details and try again.";
}

export function CustomSignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get("redirect_url");
  const targetUrl =
    rawRedirect && rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
      ? rawRedirect
      : "/dashboard";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setError(null);
    setSubmitting(true);

    try {
      const result = await signUp.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emailAddress: email.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Account created. Welcome to SAYARA.");
        router.push(targetUrl);
        router.refresh();
        return;
      }

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
      toast.success("Verification code sent to your email.");
    } catch (err) {
      setError(extractClerkError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;
    setError(null);
    setSubmitting(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        toast.success("Email verified. Welcome to SAYARA.");
        router.push(targetUrl);
        router.refresh();
      } else {
        setError("Verification is incomplete. Please try again.");
      }
    } catch (err) {
      setError(extractClerkError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || !signUp) return;
    setError(null);
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      toast.success("New verification code sent.");
    } catch (err) {
      setError(extractClerkError(err));
    }
  };

  const handleGoogleOAuth = async () => {
    if (!isLoaded || !signUp) return;
    setError(null);
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: targetUrl,
      });
    } catch (err) {
      setError(extractClerkError(err));
    }
  };

  if (verifying) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div>
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line bg-surface text-signal">
            <MailCheck className="h-5 w-5" />
          </div>
          <p className="kicker mt-4">Email Verification</p>
          <h1 className="mt-1.5 font-display text-3xl font-bold text-ink">Check your inbox</h1>
          <p className="mt-2 text-sm text-muted">
            Enter the 6-digit verification code sent to{" "}
            <span className="font-medium text-ink">{email}</span>.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-md border border-signal/40 bg-signal/10 px-4 py-3 text-xs text-signal"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleVerifyCode} className="space-y-4">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Verification Code
            </span>
            <input
              type="text"
              inputMode="numeric"
              required
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="mt-1.5 w-full rounded-md border border-line bg-surface px-4 py-3 text-center font-mono text-lg tracking-[0.35em] text-ink focus:border-signal focus:outline-none"
            />
          </label>

          <button
            type="submit"
            disabled={!isLoaded || submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-signal px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-signal-hover disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify & Continue</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-xs text-muted">
          <button
            type="button"
            onClick={() => setVerifying(false)}
            className="hover:text-ink hover:underline"
          >
            ← Edit email
          </button>
          <button
            type="button"
            onClick={handleResend}
            className="font-semibold text-champagne hover:underline"
          >
            Resend code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div>
        <p className="kicker">Create Account</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink">Join SAYARA</h1>
        <p className="mt-2 text-sm text-muted">
          Save vehicles, compare specifications, publish listings, and track buyer inquiries.
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
          or register with email
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

      <form onSubmit={handleCreateAccount} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              First Name
            </span>
            <input
              type="text"
              required
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Alex"
              className="mt-1.5 w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-signal focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
              Last Name
            </span>
            <input
              type="text"
              required
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Mercer"
              className="mt-1.5 w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 focus:border-signal focus:outline-none"
            />
          </label>
        </div>

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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
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

        {/* Clerk Bot Protection CAPTCHA mount point */}
        <div id="clerk-captcha" />

        <button
          type="submit"
          disabled={!isLoaded || submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-signal px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-signal-hover disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-xs text-muted">
        Already have an account?{" "}
        <Link
          href={rawRedirect ? `/sign-in?redirect_url=${encodeURIComponent(rawRedirect)}` : "/sign-in"}
          className="font-semibold text-ink underline-offset-4 hover:text-signal hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
