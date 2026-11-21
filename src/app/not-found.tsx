import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-ink">
      <Navbar />
      <main
        id="main-content"
        className="mx-auto flex flex-1 max-w-2xl flex-col items-center justify-center px-4 py-24 text-center"
      >
        <p className="kicker">404 · Not Found</p>
        <h1 className="mt-3 font-display text-display-md font-bold">Page not found</h1>
        <p className="mt-2 text-sm text-muted">
          The requested page or vehicle listing is no longer available.
        </p>
        <div className="mt-7 flex gap-3">
          <Link
            href="/"
            className="rounded-md bg-signal px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-signal-hover"
          >
            Back Home
          </Link>
          <Link
            href="/browse"
            className="rounded-md border border-line bg-surface px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-ink transition hover:border-ink/40"
          >
            Browse Inventory
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
