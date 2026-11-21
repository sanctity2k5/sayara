import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isClerkConfigured } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage listings, saved vehicles, buyer inquiries, and market analytics.",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isClerkConfigured()) {
    redirect("/sign-in");
  }

  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
