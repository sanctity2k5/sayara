import type { Metadata } from "next";
import { CompareClient } from "@/components/compare/CompareClient";

export const metadata: Metadata = {
  title: "Compare Vehicles",
  description: "Compare up to three verified vehicles side by side with highlighted spec differences.",
};

export default function ComparePage() {
  return <CompareClient />;
}
