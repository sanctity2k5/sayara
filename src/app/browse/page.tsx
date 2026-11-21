import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowseClient } from "@/components/browse/BrowseClient";
import BrowseLoading from "./loading";

export const metadata: Metadata = {
  title: "Browse Inventory",
  description: "Search, filter, and compare verified vehicles across global markets.",
};

export default function BrowsePage() {
  return (
    <Suspense fallback={<BrowseLoading />}>
      <BrowseClient />
    </Suspense>
  );
}
