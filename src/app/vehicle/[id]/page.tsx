import type { Metadata } from "next";
import seedVehicles from "@/data/vehicles.json";
import type { Vehicle } from "@/lib/types";
import { formatMileage } from "@/lib/utils";
import { VehicleDetailClient } from "@/components/vehicles/VehicleDetailClient";

const vehicles = seedVehicles as Vehicle[];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const match = vehicles.find((v) => v.id === id);

  if (!match) {
    return {
      title: "Vehicle Details",
      description: "Inspect full technical specifications and submit a seller inquiry on SAYARA.",
    };
  }

  const title = `${match.year} ${match.make} ${match.model}`;
  const description = `${title} in ${match.color} — ${formatMileage(match.mileage)}, ${match.fuel}, ${match.transmission}, located in ${match.location}.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | SAYARA`,
      description,
      images: match.images[0] ? [{ url: match.images[0], alt: title }] : undefined,
    },
  };
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <VehicleDetailClient id={id} />;
}
