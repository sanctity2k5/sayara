import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { isClerkConfigured } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { VehicleImage } from "@/components/ui/VehicleImage";
import { CustomSignUpForm } from "@/components/auth/CustomSignUpForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join SAYARA to save vehicles, send inquiries, and manage your listings.",
};

export default function SignUpPage() {
  const clerkReady = isClerkConfigured();

  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <Navbar />
      <main id="main-content" className="grid flex-1 lg:grid-cols-12">
        {/* Left Editorial Vehicle Showcase */}
        <div className="relative hidden overflow-hidden border-r border-line bg-[#090A0D] lg:col-span-6 lg:block">
          <VehicleImage
            src="/cars/audi/r8/4s/1.webp"
            alt="2019 Audi R8 V10 Performance"
            sizes="50vw"
            priority
            className="object-center brightness-[0.68]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090A0D] via-[#090A0D]/35 to-black/20" />
          <div className="absolute inset-x-0 bottom-0 pb-14 pl-[max(2rem,calc((100vw-80rem)/2+2rem))] pr-10 pt-20 text-white">
            <div className="max-w-md border-l-2 border-signal pl-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-champagne">
                2019 Audi R8 V10 Performance · New York, USA
              </p>
              <h2 className="mt-2.5 font-display text-3xl font-bold leading-[1.12]">
                Discover, compare, and list with verified clarity.
              </h2>
            </div>
          </div>
        </div>

        {/* Right Custom Form */}
        <div className="flex items-center justify-center px-4 py-14 sm:px-8 lg:col-span-6">
          {clerkReady ? (
            <Suspense fallback={null}>
              <CustomSignUpForm />
            </Suspense>
          ) : (
            <div className="w-full max-w-md rounded-lg border border-line bg-surface p-8 text-center">
              <p className="kicker">Authentication Setup Required</p>
              <h1 className="mt-2 font-display text-2xl font-bold">Configure Clerk Keys</h1>
              <p className="mt-3 text-sm text-muted">
                Add your Clerk keys to <code className="rounded bg-elevated px-1.5 py-0.5 font-mono text-xs">.env.local</code> and restart the server.
              </p>
              <Link
                href="/"
                className="mt-6 inline-block rounded-md bg-signal px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white"
              >
                Return Home
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
