import type { Metadata } from "next";
import localFont from "next/font/local";
import { AppProviders } from "@/components/providers/AppProviders";
import "./globals.css";

const syne = localFont({
  src: "./fonts/Syne-Variable.woff2",
  variable: "--font-display",
  weight: "500 800",
  display: "swap",
});

const plusJakarta = localFont({
  src: "./fonts/PlusJakartaSans-Variable.woff2",
  variable: "--font-sans",
  weight: "400 700",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-Variable.woff2",
  variable: "--font-mono",
  weight: "400 600",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SAYARA — Automotive Discovery & Vehicle Marketplace",
    template: "%s | SAYARA",
  },
  description:
    "Discover, compare, and acquire curated performance cars, luxury SUVs, and electric vehicles across global markets.",
  openGraph: {
    type: "website",
    siteName: "SAYARA",
    title: "SAYARA — Automotive Discovery & Vehicle Marketplace",
    description:
      "Curated international vehicle marketplace with verified photography, side-by-side comparison, and seller telemetry.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SAYARA — Automotive Discovery & Vehicle Marketplace",
    description:
      "Curated international vehicle marketplace with verified photography, side-by-side comparison, and seller telemetry.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${syne.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bg font-sans text-ink antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-signal focus:px-4 focus:py-2 focus:text-xs focus:font-semibold focus:uppercase focus:tracking-[0.14em] focus:text-white"
        >
          Skip to main content
        </a>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
